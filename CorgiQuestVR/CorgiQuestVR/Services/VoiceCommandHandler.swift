//
//  VoiceCommandHandler.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation
import Combine
import Speech
import AVFoundation

/// Voice command types supported by the training room
enum VoiceCommand: Equatable {
    case startCoachMode(activity: String)
    case markRep
    case endSession(description: String)
}

/// Handles voice recognition and command parsing for hands-free training
class VoiceCommandHandler: NSObject, ObservableObject {
    // MARK: - Published Properties
    
    @Published var isListening: Bool = false
    @Published var lastRecognizedText: String = ""
    @Published var lastCommand: VoiceCommand?
    @Published var errorMessage: String?
    
    // MARK: - Private Properties
    
    private let speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    // Command patterns
    private let coachModePattern = #"(?i)coach\s+mode:?\s+(.+)"#
    private let markRepPattern = #"(?i)mark\s+rep"#
    private let endSessionPattern = #"(?i)end\s+session:?\s+(.+)"#
    
    // MARK: - Initialization
    
    override init() {
        self.speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
        super.init()
        
        // Request authorization on init
        requestAuthorization()
    }
    
    // MARK: - Public Methods
    
    /// Request microphone and speech recognition permissions
    func requestAuthorization() {
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                switch authStatus {
                case .authorized:
                    print("Speech recognition authorized")
                case .denied:
                    self?.errorMessage = "Speech recognition access denied. Please enable in Settings."
                case .restricted:
                    self?.errorMessage = "Speech recognition restricted on this device."
                case .notDetermined:
                    self?.errorMessage = "Speech recognition not yet authorized."
                @unknown default:
                    self?.errorMessage = "Unknown authorization status."
                }
            }
        }
        
        // Request microphone permission
        AVAudioSession.sharedInstance().requestRecordPermission { [weak self] granted in
            DispatchQueue.main.async {
                if !granted {
                    self?.errorMessage = "Microphone access denied. Please enable in Settings."
                }
            }
        }
    }
    
    /// Start listening for voice commands
    func startListening() {
        // Check if already listening
        guard !isListening else { return }
        
        // Check authorization
        guard speechRecognizer?.isAvailable == true else {
            errorMessage = "Speech recognition is not available."
            return
        }
        
        do {
            try startRecognition()
            isListening = true
            errorMessage = nil
        } catch {
            errorMessage = "Failed to start speech recognition: \(error.localizedDescription)"
        }
    }
    
    /// Stop listening for voice commands
    func stopListening() {
        audioEngine.stop()
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        
        recognitionRequest = nil
        recognitionTask = nil
        isListening = false
    }
    
    // MARK: - Private Methods
    
    /// Start the speech recognition engine
    private func startRecognition() throws {
        // Cancel any existing task
        recognitionTask?.cancel()
        recognitionTask = nil
        
        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        
        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            throw NSError(domain: "VoiceCommandHandler", code: 1, userInfo: [NSLocalizedDescriptionKey: "Unable to create recognition request"])
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        // Get audio input node
        let inputNode = audioEngine.inputNode
        
        // Create recognition task
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            guard let self = self else { return }
            
            var isFinal = false
            
            if let result = result {
                let transcription = result.bestTranscription.formattedString
                
                DispatchQueue.main.async {
                    self.lastRecognizedText = transcription
                    
                    // Parse command from transcription
                    if let command = self.parseCommand(from: transcription) {
                        self.lastCommand = command
                    }
                }
                
                isFinal = result.isFinal
            }
            
            if error != nil || isFinal {
                self.audioEngine.stop()
                inputNode.removeTap(onBus: 0)
                
                self.recognitionRequest = nil
                self.recognitionTask = nil
                
                DispatchQueue.main.async {
                    self.isListening = false
                }
            }
        }
        
        // Configure audio tap
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }
        
        // Start audio engine
        audioEngine.prepare()
        try audioEngine.start()
    }
    
    /// Parse voice command from transcription text
    func parseCommand(from text: String) -> VoiceCommand? {
        // Try to match coach mode pattern
        if let activity = extractActivity(from: text) {
            return .startCoachMode(activity: activity)
        }
        
        // Try to match mark rep pattern
        if text.range(of: markRepPattern, options: .regularExpression) != nil {
            return .markRep
        }
        
        // Try to match end session pattern
        if let description = extractDescription(from: text) {
            return .endSession(description: description)
        }
        
        return nil
    }
    
    /// Extract activity name from coach mode command
    func extractActivity(from text: String) -> String? {
        guard let regex = try? NSRegularExpression(pattern: coachModePattern, options: []) else {
            return nil
        }
        
        let nsString = text as NSString
        let results = regex.matches(in: text, options: [], range: NSRange(location: 0, length: nsString.length))
        
        guard let match = results.first,
              match.numberOfRanges > 1 else {
            return nil
        }
        
        let activityRange = match.range(at: 1)
        let activity = nsString.substring(with: activityRange).trimmingCharacters(in: .whitespaces)
        
        return activity.isEmpty ? nil : activity
    }
    
    /// Extract description from end session command
    func extractDescription(from text: String) -> String? {
        guard let regex = try? NSRegularExpression(pattern: endSessionPattern, options: []) else {
            return nil
        }
        
        let nsString = text as NSString
        let results = regex.matches(in: text, options: [], range: NSRange(location: 0, length: nsString.length))
        
        guard let match = results.first,
              match.numberOfRanges > 1 else {
            return nil
        }
        
        let descriptionRange = match.range(at: 1)
        let description = nsString.substring(with: descriptionRange).trimmingCharacters(in: .whitespaces)
        
        return description.isEmpty ? nil : description
    }
    
    // MARK: - Cleanup
    
    deinit {
        stopListening()
    }
}
