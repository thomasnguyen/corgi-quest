# Requirements Document

## Introduction

This feature creates API endpoints that bridge the visionOS VR training app to the Convex real-time backend. Currently, the VR app uses mock data. This integration will enable the VR headset to display live training data, submit voice logs, and sync with the mobile web app in real-time.

## Glossary

- **VR App**: The visionOS Swift application running on Apple Vision Pro
- **API Endpoint**: HTTP route that accepts requests and returns JSON responses
- **Convex Backend**: Real-time database and serverless functions powering Corgi Quest
- **VR Status**: Aggregated training data including stats, goals, activities, and weekly XP
- **Voice Log**: Transcribed speech from VR training sessions that gets parsed into activities
- **Training Session**: Active period where user is training their dog using VR voice commands
- **NetworkService**: Swift service class that handles HTTP requests in the VR app
- **TanStack Start**: Full-stack React framework with server-side API route support

## Requirements

### Requirement 1

**User Story:** As a VR user, I want to see my dog's real training data in the headset, so that I have accurate stats during training sessions.

#### Acceptance Criteria

1. WHEN the VR app requests status data THEN the System SHALL return the dog's current level, XP, and all four stat levels
2. WHEN the VR app requests status data THEN the System SHALL return today's physical and mental goal progress
3. WHEN the VR app requests status data THEN the System SHALL return the current training streak count
4. WHEN the VR app requests status data THEN the System SHALL return the five most recent activities with XP breakdown
5. WHEN the VR app requests status data THEN the System SHALL return the last seven days of XP totals for the weekly chart

### Requirement 2

**User Story:** As a VR user, I want to submit voice logs from my headset, so that training activities are recorded without switching devices.

#### Acceptance Criteria

1. WHEN the VR app submits a voice transcript THEN the System SHALL parse the text using the existing AI parsing logic
2. WHEN a voice log is successfully parsed THEN the System SHALL create an activity record in the database
3. WHEN an activity is created THEN the System SHALL award XP to the appropriate stats based on AI analysis
4. WHEN XP is awarded THEN the System SHALL update daily goal progress if applicable
5. WHEN a voice log submission completes THEN the System SHALL return the activity ID and XP breakdown to the VR app

### Requirement 3

**User Story:** As a developer, I want API endpoints that aggregate multiple Convex queries, so that the VR app makes fewer network requests.

#### Acceptance Criteria

1. WHEN the status endpoint is called THEN the System SHALL execute all required Convex queries in parallel
2. WHEN aggregating data THEN the System SHALL combine results into a single JSON response matching the VR app's expected format
3. WHEN a Convex query fails THEN the System SHALL handle the error gracefully and return partial data if possible
4. WHEN the API response is constructed THEN the System SHALL include only the fields required by the VR app
5. WHEN multiple queries are needed THEN the System SHALL complete the entire request within five seconds

### Requirement 4

**User Story:** As a VR user, I want the API to identify which dog's data to fetch, so that multi-dog households work correctly.

#### Acceptance Criteria

1. WHEN the VR app makes a request THEN the System SHALL accept a dog ID parameter to identify which dog's data to return
2. WHEN no dog ID is provided THEN the System SHALL return the first dog in the first household as a fallback
3. WHEN an invalid dog ID is provided THEN the System SHALL return a 404 error with a clear message
4. WHEN the dog ID is valid THEN the System SHALL verify the dog exists before fetching related data
5. WHEN returning data THEN the System SHALL include the dog's name and ID in the response for verification

### Requirement 5

**User Story:** As a VR user, I want voice log submissions to work even with poor network conditions, so that training isn't interrupted.

#### Acceptance Criteria

1. WHEN the VR app submits a voice log THEN the System SHALL respond within five seconds or return a timeout error
2. WHEN the network is slow THEN the System SHALL prioritize returning a success response before completing all background tasks
3. WHEN a submission fails THEN the System SHALL return a clear error message that the VR app can display
4. WHEN the API is overloaded THEN the System SHALL return a 503 status code indicating temporary unavailability
5. WHEN a voice log is submitted THEN the System SHALL validate the request body before processing

### Requirement 6

**User Story:** As a developer, I want API endpoints that follow REST conventions, so that they're easy to maintain and extend.

#### Acceptance Criteria

1. WHEN implementing endpoints THEN the System SHALL use GET for data retrieval and POST for data submission
2. WHEN returning responses THEN the System SHALL use appropriate HTTP status codes (200, 400, 404, 500, 503)
3. WHEN an error occurs THEN the System SHALL return a JSON error object with a descriptive message
4. WHEN processing requests THEN the System SHALL validate Content-Type headers for POST requests
5. WHEN returning data THEN the System SHALL set appropriate cache headers for GET requests

### Requirement 7

**User Story:** As a VR user, I want the API to work with the existing NetworkService implementation, so that no VR app code changes are needed.

#### Acceptance Criteria

1. WHEN the status endpoint returns data THEN the System SHALL match the VRDogStatus Swift struct format exactly
2. WHEN the voice log endpoint returns data THEN the System SHALL match the VoiceLogResponse Swift struct format exactly
3. WHEN dates are included THEN the System SHALL use milliseconds since epoch format for timestamp fields
4. WHEN stat types are included THEN the System SHALL use the three-letter codes (PHY, INT, IMP, SOC)
5. WHEN the VR app sends a request THEN the System SHALL accept and process the exact JSON format the NetworkService sends

### Requirement 8

**User Story:** As a system administrator, I want API endpoints that log errors and performance metrics, so that I can monitor VR integration health.

#### Acceptance Criteria

1. WHEN an API request is received THEN the System SHALL log the request method, path, and timestamp
2. WHEN an error occurs THEN the System SHALL log the error message, stack trace, and request context
3. WHEN a request completes THEN the System SHALL log the response time and status code
4. WHEN voice parsing fails THEN the System SHALL log the transcript text for debugging
5. WHEN Convex queries are slow THEN the System SHALL log query execution times for performance analysis

