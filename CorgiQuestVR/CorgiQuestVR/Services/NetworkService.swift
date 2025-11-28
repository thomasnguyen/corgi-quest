//
//  NetworkService.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation

/// Network service for communicating with the Corgi Quest backend API
class NetworkService {

    // MARK: - Configuration

    /// Base URL for the API (should be configured based on environment)
    private let baseURL: String

    /// URLSession configured with timeout
    private let session: URLSession

    /// Maximum number of retry attempts for failed requests
    private let maxRetries = 3

    /// Exponential backoff base delay (in seconds)
    private let baseRetryDelay: TimeInterval = 1.0

    /// Use mock data instead of real network calls (for development)
    private let useMockData: Bool

    // MARK: - Initialization

    /// Initialize NetworkService with a custom base URL
    /// - Parameters:
    ///   - baseURL: The base URL for the API (defaults to production URL from AppConfiguration)
    ///   - useMockData: If true, returns mock data without network calls (defaults to true for development)
    init(baseURL: String? = nil, useMockData: Bool = true) {
        // Use provided URL, or fall back to AppConfiguration's production URL
        // For local development, pass "http://localhost:3000"
        // For production, use the deployed Netlify URL
        self.baseURL = baseURL ?? AppConfiguration.apiBaseURL
        self.useMockData = useMockData

        // Configure URLSession with 5 second timeout (per requirements)
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 5.0
        configuration.timeoutIntervalForResource = 10.0
        configuration.waitsForConnectivity = true
        self.session = URLSession(configuration: configuration)
    }
    
    // MARK: - API Methods
    
    /// Fetches the current VR status for the dog
    /// - Returns: VRDogStatus containing all training data
    /// - Throws: NetworkError if the request fails
    func fetchVRStatus() async throws -> VRDogStatus {
        // Return mock data if in development mode
        if useMockData {
            return MockData.vrStatus
        }

        let endpoint = "\(baseURL)/api/vr-status"

        guard let url = URL(string: endpoint) else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        return try await performRequestWithRetry(request: request)
    }
    
    /// Submits a voice log to the backend for parsing and activity creation
    /// - Parameters:
    ///   - text: The voice transcript to process
    ///   - sessionContext: Optional context about the current training session
    /// - Returns: VoiceLogResponse with success status and XP awarded
    /// - Throws: NetworkError if the request fails
    func submitVoiceLog(text: String, sessionContext: SessionContext? = nil) async throws -> VoiceLogResponse {
        // Return mock data if in development mode
        if useMockData {
            return MockData.voiceLogResponse
        }

        let endpoint = "\(baseURL)/api/voice-log"

        guard let url = URL(string: endpoint) else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        // Create request body
        let requestBody = VoiceLogRequest(text: text, sessionContext: sessionContext)
        request.httpBody = try JSONEncoder().encode(requestBody)

        return try await performRequestWithRetry(request: request)
    }
    
    // MARK: - Private Helper Methods
    
    /// Performs a network request with automatic retry logic
    /// - Parameter request: The URLRequest to execute
    /// - Returns: Decoded response of type T
    /// - Throws: NetworkError if all retry attempts fail
    private func performRequestWithRetry<T: Decodable>(request: URLRequest) async throws -> T {
        var lastError: Error?
        
        for attempt in 0..<maxRetries {
            do {
                return try await performRequest(request: request)
            } catch let error as NetworkError {
                lastError = error
                
                // Don't retry on client errors (4xx) or invalid data
                switch error {
                case .clientError, .invalidResponse, .decodingError:
                    throw error
                case .serverError, .timeout, .connectionFailed:
                    // Retry on server errors, timeouts, and connection failures
                    if attempt < maxRetries - 1 {
                        // Exponential backoff: 1s, 2s, 4s
                        let delay = baseRetryDelay * pow(2.0, Double(attempt))
                        try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                        continue
                    }
                default:
                    throw error
                }
            } catch {
                lastError = error
                if attempt < maxRetries - 1 {
                    let delay = baseRetryDelay * pow(2.0, Double(attempt))
                    try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                    continue
                }
            }
        }
        
        // If we exhausted all retries, throw the last error
        throw lastError ?? NetworkError.unknown
    }
    
    /// Performs a single network request without retry logic
    /// - Parameter request: The URLRequest to execute
    /// - Returns: Decoded response of type T
    /// - Throws: NetworkError if the request fails
    private func performRequest<T: Decodable>(request: URLRequest) async throws -> T {
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }
        
        // Check HTTP status code
        switch httpResponse.statusCode {
        case 200...299:
            // Success - decode the response
            do {
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .millisecondsSince1970
                return try decoder.decode(T.self, from: data)
            } catch {
                print("Decoding error: \(error)")
                if let jsonString = String(data: data, encoding: .utf8) {
                    print("Response data: \(jsonString)")
                }
                throw NetworkError.decodingError(error)
            }
            
        case 400...499:
            // Client error
            throw NetworkError.clientError(httpResponse.statusCode)
            
        case 500...599:
            // Server error
            throw NetworkError.serverError(httpResponse.statusCode)
            
        case NSURLErrorTimedOut:
            throw NetworkError.timeout
            
        default:
            throw NetworkError.unknown
        }
    }
}

// MARK: - Data Models

/// Response structure from the VR status endpoint
struct VRDogStatus: Codable {
    let dogName: String
    let level: Int
    let overallXp: Int
    let xpToNextLevel: Int
    let stats: [StatData]
    let goals: GoalData
    let recentActivities: [ActivityData]
    let weeklyXP: [DayXP]
}

/// Request structure for voice log submission
struct VoiceLogRequest: Codable {
    let text: String
    let sessionContext: SessionContext?
}

/// Optional context about the current training session
struct SessionContext: Codable {
    let activity: String
    let repsCompleted: Int
}

/// Response structure from the voice log endpoint
struct VoiceLogResponse: Codable {
    let success: Bool
    let activityId: String?
    let xpAwarded: [XPGain]?
    let error: String?
    
    struct XPGain: Codable {
        let stat: String
        let amount: Int
    }
}

// MARK: - Error Types

/// Network-related errors
enum NetworkError: LocalizedError {
    case invalidURL
    case invalidResponse
    case clientError(Int)
    case serverError(Int)
    case timeout
    case connectionFailed
    case decodingError(Error)
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .clientError(let code):
            return "Client error: \(code)"
        case .serverError(let code):
            return "Server error: \(code)"
        case .timeout:
            return "Request timed out"
        case .connectionFailed:
            return "Connection failed"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .unknown:
            return "Unknown error occurred"
        }
    }
}

// MARK: - Mock Data

/// Mock data for development and testing
/// Based on actual Convex seed data for Bumi
enum MockData {
    static let vrStatus = VRDogStatus(
        dogName: "Bumi",
        level: 8,
        overallXp: 50,
        xpToNextLevel: 100,
        stats: [
            StatData(
                type: "PHY",
                name: "Physical",
                level: 9,
                xp: 75,
                xpToNextLevel: 100,
                xpProgress: 0.75
            ),
            StatData(
                type: "INT",
                name: "Intelligence",
                level: 7,
                xp: 30,
                xpToNextLevel: 100,
                xpProgress: 0.30
            ),
            StatData(
                type: "IMP",
                name: "Impulse Control",
                level: 5,
                xp: 20,
                xpToNextLevel: 100,
                xpProgress: 0.20
            ),
            StatData(
                type: "SOC",
                name: "Social",
                level: 6,
                xp: 60,
                xpToNextLevel: 100,
                xpProgress: 0.60
            )
        ],
        goals: GoalData(
            physical: GoalData.GoalProgress(current: 35, target: 50),
            mental: GoalData.GoalProgress(current: 20, target: 30),
            streak: 15
        ),
        recentActivities: [
            ActivityData(
                id: "1",
                name: "Puzzle Toy",
                xpBreakdown: [
                    ActivityData.XPGain(stat: "INT", amount: 30)
                ],
                timestamp: Date().addingTimeInterval(-1800), // 30 min ago
                loggedBy: "Holly"
            ),
            ActivityData(
                id: "2",
                name: "Fetch",
                xpBreakdown: [
                    ActivityData.XPGain(stat: "PHY", amount: 21),
                    ActivityData.XPGain(stat: "IMP", amount: 9)
                ],
                timestamp: Date().addingTimeInterval(-3600), // 1 hour ago
                loggedBy: "Thomas"
            ),
            ActivityData(
                id: "3",
                name: "Training Session",
                xpBreakdown: [
                    ActivityData.XPGain(stat: "IMP", amount: 24),
                    ActivityData.XPGain(stat: "INT", amount: 16)
                ],
                timestamp: Date().addingTimeInterval(-7200), // 2 hours ago
                loggedBy: "Holly"
            ),
            ActivityData(
                id: "4",
                name: "Morning Walk",
                xpBreakdown: [
                    ActivityData.XPGain(stat: "PHY", amount: 45)
                ],
                timestamp: Date().addingTimeInterval(-10800), // 3 hours ago
                loggedBy: "Thomas"
            )
        ],
        weeklyXP: [
            DayXP(day: "Mon", total: 85, date: Date().addingTimeInterval(-518400)),
            DayXP(day: "Tue", total: 120, date: Date().addingTimeInterval(-432000)),
            DayXP(day: "Wed", total: 95, date: Date().addingTimeInterval(-345600)),
            DayXP(day: "Thu", total: 110, date: Date().addingTimeInterval(-259200)),
            DayXP(day: "Fri", total: 140, date: Date().addingTimeInterval(-172800)),
            DayXP(day: "Sat", total: 105, date: Date().addingTimeInterval(-86400)),
            DayXP(day: "Sun", total: 145, date: Date())
        ]
    )

    static let voiceLogResponse = VoiceLogResponse(
        success: true,
        activityId: UUID().uuidString,
        xpAwarded: [
            VoiceLogResponse.XPGain(stat: "IMP", amount: 24),
            VoiceLogResponse.XPGain(stat: "INT", amount: 16)
        ],
        error: nil
    )
}
