#!/bin/bash
# Error Scenarios Test Script
# Tests all error scenarios for VR API integration

set -e

# Configuration
API_BASE="${API_BASE:-https://corgi-quest.netlify.app}"
PASSED=0
FAILED=0
TOTAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to run a test
run_test() {
  local test_name="$1"
  local expected_status="$2"
  local curl_command="$3"
  
  ((TOTAL++))
  echo -n "Test $TOTAL: $test_name... "
  
  # Execute curl command and capture response + status code
  RESPONSE=$(eval "$curl_command" 2>&1)
  STATUS=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  # Check if status matches expected
  if [ "$STATUS" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASSED${NC} (Status: $STATUS)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $STATUS)"
    echo "Response: $BODY"
    ((FAILED++))
    return 1
  fi
}

# Print header
echo "🧪 VR API Error Scenarios Test Suite"
echo "====================================="
echo "API Base URL: $API_BASE"
echo ""

# Category 1: Invalid Dog ID Tests
echo "📋 Category 1: Invalid Dog ID"
echo "------------------------------"

run_test "Non-existent dog ID" "404" \
  "curl -s -w '\n%{http_code}' '$API_BASE/api/vr-status?dogId=invalid_id_12345'"

run_test "Malformed dog ID (XSS attempt)" "404" \
  "curl -s -w '\n%{http_code}' '$API_BASE/api/vr-status?dogId=<script>alert(1)</script>'"

run_test "Empty dog ID (should fallback)" "200" \
  "curl -s -w '\n%{http_code}' '$API_BASE/api/vr-status?dogId='"

echo ""

# Category 2: Empty Voice Transcript Tests
echo "📋 Category 2: Empty Voice Transcript"
echo "--------------------------------------"

run_test "Completely empty text" "400" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": \"\"}'"

run_test "Whitespace-only text" "400" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": \"   \\n\\t  \"}'"

run_test "Missing text field" "400" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: application/json' \
    -d '{}'"

run_test "Null text value" "400" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": null}'"

echo ""

# Category 3: Content-Type Validation Tests
echo "📋 Category 3: Content-Type Validation"
echo "---------------------------------------"

run_test "Invalid Content-Type (text/plain)" "400" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: text/plain' \
    -d '{\"text\": \"Test\"}'"

run_test "Missing Content-Type header" "400" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -d '{\"text\": \"Test\"}'"

echo ""

# Category 4: Malformed JSON Tests
echo "📋 Category 4: Malformed JSON"
echo "------------------------------"

run_test "Malformed JSON (missing closing brace)" "400" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": \"Test\"'"

run_test "Invalid JSON (trailing comma)" "400" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": \"Test\",}'"

echo ""

# Category 5: Edge Cases Tests
echo "📋 Category 5: Edge Cases"
echo "--------------------------"

run_test "Special characters in transcript" "200" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": \"Completed 5 reps with émojis 🐕 and spëcial çhars!\"}'"

run_test "Very long transcript (1000 chars)" "200" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": \"'$(python3 -c 'print("a" * 1000)')'\"}'"

echo ""

# Category 6: Valid Requests (Sanity Checks)
echo "📋 Category 6: Valid Requests (Sanity Checks)"
echo "----------------------------------------------"

run_test "Valid VR status request" "200" \
  "curl -s -w '\n%{http_code}' '$API_BASE/api/vr-status'"

run_test "Valid voice log request" "200" \
  "curl -s -w '\n%{http_code}' -X POST '$API_BASE/api/voice-log' \
    -H 'Content-Type: application/json' \
    -d '{\"text\": \"Completed 5 Leave It reps with treats on the floor\"}'"

echo ""

# Print summary
echo "====================================="
echo "📊 Test Results Summary"
echo "====================================="
echo -e "Total Tests:  $TOTAL"
echo -e "${GREEN}Passed:       $PASSED${NC}"
echo -e "${RED}Failed:       $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. Please review the output above.${NC}"
  exit 1
fi
