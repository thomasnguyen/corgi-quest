#!/bin/bash

# Test script for VR API endpoints
# Usage: ./scripts/test-api-endpoints.sh [base-url]

BASE_URL="${1:-https://corgi-quest.netlify.app}"

echo "🧪 Testing VR API Endpoints"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: GET /api/vr-status
echo "📊 Test 1: GET /api/vr-status"
echo "-----------------------------------"
STATUS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/vr-status")
HTTP_CODE=$(echo "$STATUS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$STATUS_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Status: $HTTP_CODE"
  echo "Response preview:"
  echo "$BODY" | head -c 500
  echo "..."
else
  echo "❌ Status: $HTTP_CODE"
  echo "Response: $BODY"
fi
echo ""
echo ""

# Test 2: GET /api/vr-status with dogId parameter
echo "📊 Test 2: GET /api/vr-status?dogId=test"
echo "-----------------------------------"
STATUS_WITH_ID=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/api/vr-status?dogId=test")
HTTP_CODE_2=$(echo "$STATUS_WITH_ID" | grep "HTTP_CODE" | cut -d: -f2)
BODY_2=$(echo "$STATUS_WITH_ID" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE_2" = "200" ] || [ "$HTTP_CODE_2" = "404" ]; then
  echo "✅ Status: $HTTP_CODE_2 (expected 200 or 404)"
  echo "Response preview:"
  echo "$BODY_2" | head -c 300
else
  echo "❌ Status: $HTTP_CODE_2"
  echo "Response: $BODY_2"
fi
echo ""
echo ""

# Test 3: POST /api/voice-log with valid data
echo "🎤 Test 3: POST /api/voice-log (valid)"
echo "-----------------------------------"
VOICE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"We practiced Leave It for 5 minutes"}' \
  "$BASE_URL/api/voice-log")
HTTP_CODE_3=$(echo "$VOICE_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY_3=$(echo "$VOICE_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE_3" = "200" ]; then
  echo "✅ Status: $HTTP_CODE_3"
  echo "Response:"
  echo "$BODY_3"
else
  echo "⚠️  Status: $HTTP_CODE_3"
  echo "Response: $BODY_3"
fi
echo ""
echo ""

# Test 4: POST /api/voice-log with empty text (should fail)
echo "🎤 Test 4: POST /api/voice-log (empty text)"
echo "-----------------------------------"
EMPTY_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":""}' \
  "$BASE_URL/api/voice-log")
HTTP_CODE_4=$(echo "$EMPTY_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY_4=$(echo "$EMPTY_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE_4" = "400" ]; then
  echo "✅ Status: $HTTP_CODE_4 (expected 400)"
  echo "Response: $BODY_4"
else
  echo "❌ Status: $HTTP_CODE_4 (expected 400)"
  echo "Response: $BODY_4"
fi
echo ""
echo ""

# Test 5: CORS headers check
echo "🌐 Test 5: CORS Headers"
echo "-----------------------------------"
CORS_HEADERS=$(curl -s -I "$BASE_URL/api/vr-status" | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
  echo "✅ CORS headers present:"
  echo "$CORS_HEADERS"
else
  echo "❌ No CORS headers found"
fi
echo ""
echo ""

echo "✨ API Endpoint Testing Complete"
echo ""
echo "Summary:"
echo "- VR Status endpoint: $([ "$HTTP_CODE" = "200" ] && echo "✅" || echo "❌")"
echo "- VR Status with dogId: $([ "$HTTP_CODE_2" = "200" ] || [ "$HTTP_CODE_2" = "404" ] && echo "✅" || echo "❌")"
echo "- Voice log (valid): $([ "$HTTP_CODE_3" = "200" ] && echo "✅" || echo "⚠️")"
echo "- Voice log (empty): $([ "$HTTP_CODE_4" = "400" ] && echo "✅" || echo "❌")"
echo "- CORS headers: $([ -n "$CORS_HEADERS" ] && echo "✅" || echo "❌")"
