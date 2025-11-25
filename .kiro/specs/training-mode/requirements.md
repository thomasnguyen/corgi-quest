# Training Mode Requirements Document

## Introduction

Training Mode is a hands-free activity logging feature designed for dog owners who want to capture training moments in real-time during walks or training sessions. Users can speak a wake word ("Corgi Quest") followed by a description of the activity, and receive instant audio feedback confirming the logged activity and XP gains. This feature is optimized for use with smart glasses (Ray-Ban Meta) or wireless earbuds (AirPods), allowing the phone to remain in the user's pocket while they focus on training their dog.

## Glossary

- **Training Mode**: A continuous listening mode that detects wake words and logs activities hands-free
- **Wake Word**: The phrase "Corgi Quest" that triggers activity logging
- **Web Speech API**: Browser-based speech recognition that runs locally on the device
- **OpenAI Realtime API**: Real-time voice API used for parsing activities and generating audio responses
- **Activity Payload**: The description spoken after the wake word (e.g., "stayed calm when bike passed")
- **Audio Feedback**: Spoken confirmation from OpenAI about logged activity and XP gains
- **Convex**: Real-time backend database system
- **XP**: Experience points earned for completing activities
- **Stat Gains**: Points earned in specific categories (Emotional, Mental, Physical, Social)

## Requirements

### Requirement 1: Training Mode Access

**User Story:** As a dog owner, I want to easily access Training Mode from the Overview screen, so that I can quickly start hands-free logging during walks.

#### Acceptance Criteria

1. THE Overview Screen SHALL display two side-by-side buttons: "LOG ACTIVITY" and "TRAINING MODE"
2. WHEN the user taps the "TRAINING MODE" button, THE System SHALL navigate to a full-screen Training Mode route
3. THE "TRAINING MODE" button SHALL use the same visual styling as the "LOG ACTIVITY" button for consistency
4. THE buttons SHALL be responsive and work on mobile devices with screen widths less than 768 pixels

### Requirement 2: Microphone Permission

**User Story:** As a user, I want the app to request microphone permission when I enter Training Mode, so that I can grant access for voice recognition.

#### Acceptance Criteria

1. WHEN the user enters Training Mode, THE System SHALL request microphone permission if not already granted
2. IF microphone permission is denied, THEN THE System SHALL display an error message explaining that microphone access is required
3. WHEN microphone permission is granted, THE System SHALL automatically start continuous listening
4. THE System SHALL support both built-in device microphones and Bluetooth audio devices

### Requirement 3: Continuous Listening

**User Story:** As a dog owner on a walk, I want the app to continuously listen for the wake word, so that I can log activities without touching my phone.

#### Acceptance Criteria

1. WHEN Training Mode is active, THE System SHALL use Web Speech API for continuous local speech recognition
2. THE System SHALL transcribe all spoken audio locally without sending it to external servers
3. THE System SHALL display a visual indicator showing that listening is active
4. THE System SHALL display live transcript of recognized speech for debugging and user feedback
5. IF the Web Speech API stops due to silence, THE System SHALL automatically restart recognition within 500 milliseconds

### Requirement 4: Wake Word Detection

**User Story:** As a user, I want to say "Corgi Quest" followed by my activity description, so that the app knows when to log an activity.

#### Acceptance Criteria

1. THE System SHALL detect the wake word "Corgi Quest" in the live transcript using case-insensitive matching
2. THE System SHALL support variations including "Corgi Quest", "Corgi, Quest", and "CorgiQuest"
3. WHEN the wake word is detected, THE System SHALL extract all text spoken after the wake word as the activity payload
4. THE System SHALL provide visual feedback when the wake word is detected
5. THE System SHALL ignore speech that does not contain the wake word

### Requirement 5: Activity Parsing and Logging

**User Story:** As a user, I want my spoken activity description to be automatically parsed and logged with appropriate XP gains, so that I don't have to manually categorize activities.

#### Acceptance Criteria

1. WHEN a wake word is detected, THE System SHALL send only the activity payload to OpenAI Realtime API
2. THE OpenAI Realtime API SHALL parse the activity description and determine appropriate stat gains
3. THE System SHALL call the Convex logActivity mutation with the parsed activity data
4. THE System SHALL use optimistic updates to immediately show the logged activity in the UI
5. THE System SHALL handle parsing errors gracefully and continue listening for the next wake word

### Requirement 6: Audio Feedback

**User Story:** As a user with my phone in my pocket, I want to hear audio confirmation when an activity is logged, so that I know it was successful without looking at my phone.

#### Acceptance Criteria

1. WHEN an activity is successfully logged, THE OpenAI Realtime API SHALL generate an audio response
2. THE audio response SHALL follow the format: "Logged. [X] emotional, [Y] mental" where X and Y are the XP amounts
3. THE audio response SHALL be concise and take no longer than 3 seconds to speak
4. THE System SHALL play the audio response through the device's audio output (speakers or connected Bluetooth device)
5. IF activity parsing fails, THE OpenAI Realtime API SHALL respond with "Didn't catch that, try again"

### Requirement 7: Training Mode UI

**User Story:** As a user, I want to see visual feedback about Training Mode status, so that I can verify it's working correctly during demos or troubleshooting.

#### Acceptance Criteria

1. THE Training Mode screen SHALL display a pulsing "Listening..." indicator when actively listening
2. THE Training Mode screen SHALL display the live transcript of recognized speech
3. THE Training Mode screen SHALL display the most recently logged activity with its XP gains
4. THE Training Mode screen SHALL display today's XP progress summary
5. THE Training Mode screen SHALL use the app's existing visual design system (black/gold color scheme)

### Requirement 8: Stop Training Mode

**User Story:** As a user, I want to easily stop Training Mode when my walk or training session is complete, so that the app stops listening and conserves battery.

#### Acceptance Criteria

1. THE Training Mode screen SHALL display a prominent "STOP" button
2. WHEN the user taps the "STOP" button, THE System SHALL stop all speech recognition
3. WHEN the user taps the "STOP" button, THE System SHALL disconnect from OpenAI Realtime API
4. WHEN the user taps the "STOP" button, THE System SHALL navigate back to the Overview screen
5. THE "STOP" button SHALL be styled consistently with the app's visual design

### Requirement 9: Real-Time Updates

**User Story:** As a user, I want to see my XP and daily goals update in real-time when activities are logged, so that I can track my progress during training sessions.

#### Acceptance Criteria

1. WHEN an activity is logged in Training Mode, THE System SHALL update the displayed XP totals in real-time
2. WHEN an activity is logged in Training Mode, THE System SHALL update the daily goals progress in real-time
3. THE System SHALL use Convex subscriptions to ensure updates are reflected across all screens
4. THE System SHALL display level-up notifications if a stat levels up from the logged activity
5. THE real-time updates SHALL occur within 500 milliseconds of activity logging

### Requirement 10: Cost Optimization

**User Story:** As a product owner, I want to minimize OpenAI API costs during Training Mode, so that the feature is economically viable for production use.

#### Acceptance Criteria

1. THE System SHALL use Web Speech API for all continuous transcription to avoid OpenAI costs
2. THE System SHALL only connect to OpenAI Realtime API when a wake word is detected
3. THE System SHALL disconnect from OpenAI Realtime API immediately after receiving the audio response
4. THE System SHALL limit OpenAI audio responses to a maximum of 3 seconds
5. WHEN a 30-minute Training Mode session occurs with 3 activity logs, THE total OpenAI API cost SHALL not exceed $0.10

### Requirement 11: Error Handling

**User Story:** As a user, I want the app to handle errors gracefully during Training Mode, so that temporary issues don't interrupt my training session.

#### Acceptance Criteria

1. IF Web Speech API fails, THE System SHALL display an error message and provide a retry option
2. IF OpenAI Realtime API connection fails, THE System SHALL display an error message and continue local listening
3. IF activity logging to Convex fails, THE System SHALL display an error message and allow the user to retry
4. IF microphone access is lost during Training Mode, THE System SHALL notify the user and attempt to reconnect
5. THE System SHALL log all errors to the console for debugging purposes

### Requirement 12: Browser Compatibility

**User Story:** As a user, I want Training Mode to work on my mobile browser, so that I can use it on my iPhone or Android device.

#### Acceptance Criteria

1. THE System SHALL support Web Speech API on Chrome for Android
2. THE System SHALL support Web Speech API on Safari for iOS
3. THE System SHALL display a compatibility warning if Web Speech API is not supported
4. THE System SHALL work with both built-in microphones and Bluetooth audio devices
5. THE System SHALL handle browser-specific quirks in Web Speech API implementation
