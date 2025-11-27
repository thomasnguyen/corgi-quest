# Error Scenarios Test Plan

## Overview

This document describes comprehensive error scenario testing for the VR API integration, covering invalid inputs, network failures, and edge cases.

## Test Categories

1. Invalid Dog ID
2. Empty Voice Transcript
3. Network Timeout Simulation
4. Error Response Format Validation
5. Edge Cases and Boundary Conditions

---

## Test 1: Invalid Dog ID

### Objective
Verify proper error handling when requesting data for a non-existent dog.

### Test Cases

#### 1.1 Non-Existent Dog ID
**Request:**
```bash
curl -v "https://corgi-quest.netlify.app/api/vr-status?dogId=invalid_id_12345"
```

**Expected Response:**
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Invalid dog ID: invalid_id_12345",
  "code": "DOG_NOT_FOUND"
}
```

**Verification:**
- ✅ Status code is 404
- ✅ Response includes error message
- ✅ Response includes error code
- ✅ Error message is descriptive
- ✅ No stack trace exposed to client

#### 1.2 Malformed Dog ID
**Request:**
```bash
curl -v "https://corgi-quest.netlify.app/api/vr-status?dogId=<script>alert('xss')</script>"
```

**Expected Response:**
```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Invalid dog ID: <script>alert('xss')</script>",
  "code": "DOG_NOT_FOUND"
}
```

**Verification:**
- ✅ Status code is 404
- ✅ XSS attempt is not executed
- ✅ Input is properly sanitized
- ✅ Error response is safe

#### 1.3 Empty Dog ID Parameter
**Request:**
```bash
curl -v "https://corgi-quest.netlify.app/api/vr-status?dogId="
```

**Expected Response:**
Should fall back to first dog (default behavior)

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "dogName": "Bumi",
  "level": 12,
  // ... rest of response
}
```

**Verification:**
- ✅ Status code is 200
- ✅ Returns first dog in database
- ✅ No error thrown
- ✅ Fallback behavior works correctly

#### 1.4 VR App Handling
**Test in VR App:**
1. Modify NetworkService to request invalid dog ID
2. Observe error handling in UI

**Expected Behavior:**
- ✅ Error message displayed: "Dog not found"
- ✅ UI shows last known data or empty state
- ✅ No crash or freeze
- ✅ User can retry or navigate away

---

## Test 2: Empty Voice Transcript

### Objective
Verify proper validation and error handling for empty or invalid voice transcripts.

### Test Cases

#### 2.1 Completely Empty Text
**Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```

**Expected Response:**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Text is required and cannot be empty",
  "code": "EMPTY_TRANSCRIPT"
}
```

**Verification:**
- ✅ Status code is 400
- ✅ Response includes success: false
- ✅ Error message is clear
- ✅ Error code is specific

#### 2.2 Whitespace-Only Text
**Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": "   \n\t  "}'
```

**Expected Response:**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Text is required and cannot be empty",
  "code": "EMPTY_TRANSCRIPT"
}
```

**Verification:**
- ✅ Status code is 400
- ✅ Whitespace is properly trimmed
- ✅ Validation catches whitespace-only input
- ✅ Error message is appropriate

#### 2.3 Missing Text Field
**Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Text is required and cannot be empty",
  "code": "EMPTY_TRANSCRIPT"
}
```

**Verification:**
- ✅ Status code is 400
- ✅ Missing field is caught
- ✅ Error message is clear
- ✅ No server crash

#### 2.4 Null Text Value
**Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": null}'
```

**Expected Response:**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": "Text is required and cannot be empty",
  "code": "EMPTY_TRANSCRIPT"
}
```

**Verification:**
- ✅ Status code is 400
- ✅ Null value is caught
- ✅ Error handling is consistent
- ✅ No type errors

#### 2.5 VR App Handling
**Test in VR App:**
1. Attempt to submit empty voice log
2. Observe error handling

**Expected Behavior:**
- ✅ Error message displayed: "Please provide a description"
- ✅ No API call made (client-side validation)
- ✅ User can retry with valid input
- ✅ No crash or freeze

---

## Test 3: Network Timeout Simulation

### Objective
Verify proper timeout handling and graceful degradation under slow network conditions.

### Test Cases

#### 3.1 Slow API Response (VR Status)
**Simulation:**
Add artificial delay to API endpoint (>5 seconds)

**Expected Behavior:**
- ✅ Request times out after 5 seconds
- ✅ Error response returned:
  ```json
  {
    "error": "Request timed out. Please try again.",
    "code": "TIMEOUT"
  }
  ```
- ✅ Status code is 503
- ✅ VR app shows timeout error
- ✅ Next poll occurs 3 seconds after timeout

#### 3.2 Slow AI Parsing (Voice Log)
**Simulation:**
Submit complex transcript that takes >30 seconds to parse

**Expected Behavior:**
- ✅ Request times out after 30 seconds
- ✅ Error response returned:
  ```json
  {
    "success": false,
    "error": "AI parsing timed out after 30 seconds. Please try again with a shorter description.",
    "code": "PARSING_TIMEOUT"
  }
  ```
- ✅ Status code is 503
- ✅ VR app shows timeout error
- ✅ User can retry with shorter description

#### 3.3 Network Disconnection During Request
**Simulation:**
1. Start API request
2. Disable Wi-Fi mid-request
3. Observe error handling

**Expected Behavior:**
- ✅ Request fails with connection error
- ✅ VR app shows: "Connection failed"
- ✅ Polling continues attempting
- ✅ Connection restored when Wi-Fi returns
- ✅ No data corruption

#### 3.4 Intermittent Network
**Simulation:**
1. Enable/disable Wi-Fi repeatedly
2. Observe polling behavior

**Expected Behavior:**
- ✅ Failed polls show error message
- ✅ Successful polls update UI
- ✅ No request queue buildup
- ✅ UI shows last known data during failures
- ✅ Automatic recovery when network stabilizes

#### 3.5 VR App Timeout Configuration
**Verify in NetworkService.swift:**
```swift
let configuration = URLSessionConfiguration.default
configuration.timeoutIntervalForRequest = 5.0  // 5 seconds
configuration.timeoutIntervalForResource = 10.0
```

**Verification:**
- ✅ Request timeout is 5 seconds
- ✅ Resource timeout is 10 seconds
- ✅ Timeouts are properly enforced
- ✅ Error handling is consistent

---

## Test 4: Error Response Format Validation

### Objective
Verify all error responses follow consistent format and match Swift struct expectations.

### Test Cases

#### 4.1 VR Status Error Format
**Test All Error Codes:**
- `DOG_NOT_FOUND` (404)
- `NO_DOGS` (404)
- `TIMEOUT` (503)
- `INTERNAL_ERROR` (500)

**Expected Format:**
```typescript
{
  error: string,      // Human-readable message
  code: string        // Machine-readable code
}
```

**Verification:**
- ✅ All errors include `error` field
- ✅ All errors include `code` field
- ✅ Error messages are descriptive
- ✅ Error codes are consistent
- ✅ No stack traces exposed

#### 4.2 Voice Log Error Format
**Test All Error Codes:**
- `INVALID_CONTENT_TYPE` (400)
- `EMPTY_TRANSCRIPT` (400)
- `NO_DOGS` (404)
- `NO_USERS` (404)
- `PARSING_FAILED` (500)
- `LOG_ACTIVITY_FAILED` (500)
- `PARSING_TIMEOUT` (503)
- `INTERNAL_ERROR` (500)

**Expected Format:**
```typescript
{
  success: false,
  error: string,
  code?: string
}
```

**Verification:**
- ✅ All errors include `success: false`
- ✅ All errors include `error` field
- ✅ Most errors include `code` field
- ✅ Format matches VoiceLogResponse Swift struct
- ✅ No unexpected fields

#### 4.3 Swift Struct Compatibility
**Verify VR App Can Parse All Errors:**

```swift
// VoiceLogResponse should handle errors
struct VoiceLogResponse: Codable {
    let success: Bool
    let activityId: String?
    let xpAwarded: [XPGain]?
    let error: String?
}
```

**Test Cases:**
1. Parse 400 error response
2. Parse 404 error response
3. Parse 500 error response
4. Parse 503 error response

**Verification:**
- ✅ All error responses parse successfully
- ✅ `success` field is false
- ✅ `error` field contains message
- ✅ Optional fields are nil
- ✅ No decoding errors

---

## Test 5: Edge Cases and Boundary Conditions

### Objective
Test unusual but valid inputs and boundary conditions.

### Test Cases

#### 5.1 Very Long Voice Transcript
**Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": "'"$(python3 -c 'print("a" * 10000)')"'"}'
```

**Expected Behavior:**
- ✅ Request accepted (or rejected with clear limit)
- ✅ AI parsing handles long text
- ✅ No server crash
- ✅ Response time reasonable (<30s)

**Recommendation:**
Add max length validation (e.g., 500 characters):
```typescript
if (text.length > 500) {
  throw new Response(JSON.stringify({
    success: false,
    error: "Transcript too long. Maximum 500 characters.",
    code: "TRANSCRIPT_TOO_LONG"
  }), { status: 400 })
}
```

#### 5.2 Special Characters in Transcript
**Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": "Completed 5 reps with émojis 🐕 and spëcial çhars!"}'
```

**Expected Behavior:**
- ✅ Request accepted
- ✅ Special characters preserved
- ✅ AI parsing handles Unicode
- ✅ Activity created successfully
- ✅ No encoding issues

#### 5.3 Multiple Rapid Requests
**Simulation:**
Submit 10 voice logs in rapid succession (< 1 second apart)

**Expected Behavior:**
- ✅ All requests processed
- ✅ 10 separate activities created
- ✅ No duplicate detection (each is unique)
- ✅ No rate limiting errors
- ✅ Responses returned in order

**Note:** For production, consider adding rate limiting:
- Max 10 requests per minute per device
- Return 429 Too Many Requests if exceeded

#### 5.4 Concurrent Polling and Voice Log
**Simulation:**
1. Start polling (every 3 seconds)
2. Submit voice log during poll
3. Observe behavior

**Expected Behavior:**
- ✅ Both requests complete successfully
- ✅ No race conditions
- ✅ No request interference
- ✅ UI updates correctly
- ✅ Data consistency maintained

#### 5.5 Invalid Content-Type Header
**Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: text/plain" \
  -d '{"text": "Test"}'
```

**Expected Response:**
```json
HTTP/1.1 400 Bad Request

{
  "success": false,
  "error": "Content-Type must be application/json",
  "code": "INVALID_CONTENT_TYPE"
}
```

**Verification:**
- ✅ Status code is 400
- ✅ Error message is clear
- ✅ Request rejected before processing
- ✅ No server error

#### 5.6 Missing Content-Type Header
**Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -d '{"text": "Test"}'
```

**Expected Response:**
```json
HTTP/1.1 400 Bad Request

{
  "success": false,
  "error": "Content-Type must be application/json",
  "code": "INVALID_CONTENT_TYPE"
}
```

**Verification:**
- ✅ Status code is 400
- ✅ Missing header is caught
- ✅ Error message is clear

#### 5.7 Malformed JSON
**Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": "Test"'
```

**Expected Response:**
```json
HTTP/1.1 400 Bad Request

{
  "success": false,
  "error": "Invalid JSON in request body",
  "code": "INVALID_JSON"
}
```

**Verification:**
- ✅ Status code is 400
- ✅ JSON parsing error caught
- ✅ Error message is clear
- ✅ No server crash

#### 5.8 No Dogs in Database
**Simulation:**
Clear all dogs from Convex database

**VR Status Request:**
```bash
curl https://corgi-quest.netlify.app/api/vr-status
```

**Expected Response:**
```json
HTTP/1.1 404 Not Found

{
  "error": "No dogs found in the system",
  "code": "NO_DOGS"
}
```

**Voice Log Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": "Test"}'
```

**Expected Response:**
```json
HTTP/1.1 404 Not Found

{
  "success": false,
  "error": "No dogs found in the system",
  "code": "NO_DOGS"
}
```

**Verification:**
- ✅ Both endpoints handle empty database
- ✅ Status code is 404
- ✅ Error messages are clear
- ✅ No server crash

#### 5.9 No Users in Household
**Simulation:**
Create dog but delete all users from household

**Voice Log Request:**
```bash
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": "Test"}'
```

**Expected Response:**
```json
HTTP/1.1 404 Not Found

{
  "success": false,
  "error": "No users found in the system",
  "code": "NO_USERS"
}
```

**Verification:**
- ✅ Status code is 404
- ✅ Error message is clear
- ✅ No server crash
- ✅ Proper error handling

---

## Test Execution Checklist

### Prerequisites
- [ ] API endpoints deployed and accessible
- [ ] Convex backend running
- [ ] Test dog data in database
- [ ] VR app configured for production
- [ ] Network tools ready (curl, Postman, etc.)

### Test Execution
- [ ] Test 1.1: Non-existent dog ID
- [ ] Test 1.2: Malformed dog ID
- [ ] Test 1.3: Empty dog ID parameter
- [ ] Test 1.4: VR app handling
- [ ] Test 2.1: Completely empty text
- [ ] Test 2.2: Whitespace-only text
- [ ] Test 2.3: Missing text field
- [ ] Test 2.4: Null text value
- [ ] Test 2.5: VR app handling
- [ ] Test 3.1: Slow API response
- [ ] Test 3.2: Slow AI parsing
- [ ] Test 3.3: Network disconnection
- [ ] Test 3.4: Intermittent network
- [ ] Test 3.5: Timeout configuration
- [ ] Test 4.1: VR status error format
- [ ] Test 4.2: Voice log error format
- [ ] Test 4.3: Swift struct compatibility
- [ ] Test 5.1: Very long transcript
- [ ] Test 5.2: Special characters
- [ ] Test 5.3: Multiple rapid requests
- [ ] Test 5.4: Concurrent requests
- [ ] Test 5.5: Invalid Content-Type
- [ ] Test 5.6: Missing Content-Type
- [ ] Test 5.7: Malformed JSON
- [ ] Test 5.8: No dogs in database
- [ ] Test 5.9: No users in household

### Results Summary
| Test Category | Tests Passed | Tests Failed | Notes |
|---------------|--------------|--------------|-------|
| Invalid Dog ID | ___/4 | ___/4 | |
| Empty Transcript | ___/5 | ___/5 | |
| Network Timeout | ___/5 | ___/5 | |
| Error Format | ___/3 | ___/3 | |
| Edge Cases | ___/9 | ___/9 | |
| **Total** | **___/26** | **___/26** | |

---

## Automated Test Script

Create a bash script to run all tests:

```bash
#!/bin/bash
# error-scenarios-test.sh

API_BASE="https://corgi-quest.netlify.app"
PASSED=0
FAILED=0

echo "🧪 Running Error Scenario Tests..."
echo "=================================="

# Test 1.1: Non-existent dog ID
echo "Test 1.1: Non-existent dog ID"
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/vr-status?dogId=invalid_id")
STATUS=$(echo "$RESPONSE" | tail -n1)
if [ "$STATUS" = "404" ]; then
  echo "✅ PASSED"
  ((PASSED++))
else
  echo "❌ FAILED (Expected 404, got $STATUS)"
  ((FAILED++))
fi

# Test 2.1: Empty text
echo "Test 2.1: Empty text"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/voice-log" \
  -H "Content-Type: application/json" \
  -d '{"text": ""}')
STATUS=$(echo "$RESPONSE" | tail -n1)
if [ "$STATUS" = "400" ]; then
  echo "✅ PASSED"
  ((PASSED++))
else
  echo "❌ FAILED (Expected 400, got $STATUS)"
  ((FAILED++))
fi

# Test 5.5: Invalid Content-Type
echo "Test 5.5: Invalid Content-Type"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/voice-log" \
  -H "Content-Type: text/plain" \
  -d '{"text": "Test"}')
STATUS=$(echo "$RESPONSE" | tail -n1)
if [ "$STATUS" = "400" ]; then
  echo "✅ PASSED"
  ((PASSED++))
else
  echo "❌ FAILED (Expected 400, got $STATUS)"
  ((FAILED++))
fi

# Add more tests...

echo "=================================="
echo "Results: $PASSED passed, $FAILED failed"
```

---

## Requirements Validated

- ✅ **Requirement 4.3:** Invalid dog ID returns 404 error
- ✅ **Requirement 5.3:** Clear error messages for all failure cases
- ✅ **Requirement 6.3:** JSON error objects with descriptive messages
- ✅ **Requirement 5.1:** Empty transcript validation
- ✅ **Requirement 5.4:** Timeout errors return 503 status
- ✅ **Requirement 6.2:** Appropriate HTTP status codes (400, 404, 500, 503)

## Next Steps

After completing error scenario testing:
1. Document any bugs found
2. Fix critical issues
3. Re-test failed scenarios
4. Update error handling if needed
5. Proceed to deployment (Task 8.1)

