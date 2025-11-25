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
    
    // MARK: - Initialization
    
    /// Initialize NetworkService with a custom base URL
    /// - Parameter baseURL: The base URL for the API (defaults to production URL)
    init(baseURL: String? = nil) {
        // Use provided URL, or fall back to production URL
        // For local development, pass "http://localhost:3000"
        // For production, use the deployed Netlify URL
        self.baseURL = baseURL ?? "https://corgi-quest.netlify.app"
        
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
