//
//  AppConfiguration.swift
//  CorgiQuestVR
//
//  Created by Kiro on 11/24/25.
//

import Foundation

/// Application configuration for different environments
struct AppConfiguration {
    
    /// Current environment
    enum Environment {
        case development
        case production
        
        /// API base URL for the current environment
        var apiBaseURL: String {
            switch self {
            case .development:
                return "http://localhost:3000"
            case .production:
                return "https://corgi-quest.netlify.app"
            }
        }
    }
    
    /// Current environment (change this to switch between dev and prod)
    static let current: Environment = .production
    
    /// API base URL for the current environment
    static var apiBaseURL: String {
        current.apiBaseURL
    }
}
