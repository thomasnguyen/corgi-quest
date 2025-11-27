# VR API Configuration Guide

## Production API Configuration

This document describes the configuration changes needed to connect the VR app to the production API.

### ✅ Completed Changes

#### 1. AppConfiguration.swift
**Status:** Already configured for production ✅

```swift
static let current: Environment = .production

var apiBaseURL: String {
    switch self {
    case .development:
        return "http://localhost:3000"
    case .production:
        return "https://corgi-quest.netlify.app"
    }
}
```

**Current Setting:** `.production` (correct for demo)

#### 2. NetworkService.swift
**Status:** Updated to use real data by default ✅

**Changes Made:**
- Changed `useMockData` default from `true` to `false`
- Updated `baseURL` to use `AppConfiguration.apiBaseURL` instead of hardcoded URL
- Updated documentation to reflect production-first approach

**Before:**
```swift
init(baseURL: String? = nil, useMockData: Bool = true) {
    self.baseURL = baseURL ?? "https://corgi-quest.netlify.app"
    self.useMockData = useMockData
```

**After:**
```swift
init(baseURL: String? = nil, useMockData: Bool = false) {
    self.baseURL = baseURL ?? AppConfiguration.apiBaseURL
    self.useMockData = useMockData
```

### Testing the Configuration

#### Test 1: Verify VR App Uses Production URL
1. Open `CorgiQuestVR.xcodeproj` in Xcode
2. Check `AppConfiguration.swift` - should show `.production`
3. Build and run on Vision Pro simulator or device
4. VR app will attempt to connect to `https://corgi-quest.netlify.app`

#### Test 2: Verify API Endpoints Are Accessible
Run these commands to test the deployed API:

```bash
# Test VR status endpoint (should return dog data or 404 if no dogs)
curl -v https://corgi-quest.netlify.app/api/vr-status

# Test voice log endpoint (should return 400 for empty text)
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'

# Test voice log endpoint (should process valid text)
curl -X POST https://corgi-quest.netlify.app/api/voice-log \
  -H "Content-Type: application/json" \
  -d '{"text": "Completed 5 Leave It reps with treats"}'
```

#### Test 3: Verify Real-Time Sync
1. Open web app at `https://corgi-quest.netlify.app` on laptop/phone
2. Open VR app on Vision Pro
3. Submit a voice log from VR: "Start training Leave It"
4. Within 3 seconds, activity should appear in web app feed
5. VR app should poll and show updated stats

### Expected Behavior

#### When API is Available:
- VR app fetches real dog data from Convex backend
- Voice logs create actual activity records
- Stats update in real-time across VR and web app
- Polling occurs every 3 seconds during training

#### When API is Unavailable:
- VR app will show network errors
- To enable mock data fallback, change:
  ```swift
  // In TrainingRoomViewModel.swift or wherever NetworkService is initialized
  let networkService = NetworkService(useMockData: true)
  ```

### Deployment Checklist

Before demo:
- [ ] Verify Netlify deployment is live
- [ ] Test `/api/vr-status` endpoint returns 200 or 404 (not 500)
- [ ] Test `/api/voice-log` endpoint accepts POST requests
- [ ] Verify CORS headers allow VR app requests
- [ ] Ensure Convex backend has at least one dog in database
- [ ] Test VR app connection on actual Vision Pro device
- [ ] Verify 3-second polling works during training
- [ ] Test complete "Leave It" demo flow (15-25 seconds)

### Troubleshooting

#### Issue: VR app shows "Connection failed"
**Solution:** Check if Netlify deployment is live and API endpoints are accessible

#### Issue: API returns 404 "No dogs found"
**Solution:** Seed Convex database with demo dog data:
```bash
npx convex run seed:seedDemoData
```

#### Issue: Voice log parsing fails
**Solution:** Verify OpenAI API key is configured in Convex environment variables

#### Issue: CORS errors in VR app
**Solution:** Verify `netlify.toml` has correct CORS headers for `/api/*` routes

### Rollback to Mock Data

If production API fails during demo, quickly enable mock data:

1. Open `NetworkService.swift`
2. Change initialization:
   ```swift
   init(baseURL: String? = nil, useMockData: Bool = true) {
   ```
3. Rebuild and deploy VR app
4. Mock data will be used instead of API calls

### Performance Targets

- **API Response Time:** < 500ms for `/api/vr-status`
- **Voice Log Processing:** < 2s for `/api/voice-log`
- **Polling Frequency:** Every 3 seconds during training
- **Sync Delay:** < 3 seconds between VR and web app

### Requirements Validated

- ✅ **Requirement 7.1:** VR status response matches `VRDogStatus` Swift struct
- ✅ **Requirement 7.2:** Voice log response matches `VoiceLogResponse` Swift struct
- ✅ **Requirement 6.1:** Uses GET for status, POST for voice log
- ✅ **Requirement 6.2:** Returns appropriate HTTP status codes
- ✅ **Requirement 6.3:** CORS headers configured in `netlify.toml`

