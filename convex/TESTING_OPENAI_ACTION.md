# Testing the OpenAI Session Token Generation Action

## Prerequisites

Before testing, you need to set up your OpenAI API key in the Convex dashboard.

## Setup Steps

### 1. Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key (or use an existing one)
3. Copy the key (it starts with `sk-proj-`)

### 2. Add API Key to Convex Dashboard

1. Open the Convex dashboard:
   ```bash
   npx convex dashboard
   ```

2. Navigate to **Settings** → **Environment Variables**

3. Click **Add Environment Variable**

4. Enter:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (e.g., `sk-proj-...`)

5. Click **Save**

### 3. Test the Action

#### Option A: Test in Convex Dashboard

1. In the Convex dashboard, go to **Functions**
2. Find `actions:generateSessionToken` in the list
3. Click on it to open the function details
4. Click **Run** (no arguments needed)
5. You should see a response with a session token string

**Expected Success Response:**
```json
"eph_..."
```

**Expected Error (if API key not set):**
```json
{
  "error": "OPENAI_API_KEY not configured. Please add it to your Convex environment variables."
}
```

#### Option B: Test from Your Application

In any React component:

```typescript
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

function TestComponent() {
  const generateToken = useAction(api.actions.generateSessionToken);
  
  const handleTest = async () => {
    try {
      const token = await generateToken();
      console.log('Session token:', token);
      alert('Success! Token: ' + token.substring(0, 20) + '...');
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };
  
  return (
    <button onClick={handleTest}>
      Test OpenAI Session Token
    </button>
  );
}
```

## Troubleshooting

### Error: "OPENAI_API_KEY not configured"

**Solution**: Make sure you've added the `OPENAI_API_KEY` environment variable in the Convex dashboard (see Setup Steps above).

### Error: "Failed to generate session token: 401"

**Solution**: Your API key is invalid or expired. Generate a new one from https://platform.openai.com/api-keys

### Error: "Failed to generate session token: 429"

**Solution**: You've exceeded your OpenAI API rate limit. Wait a few minutes and try again, or check your OpenAI account usage.

### Error: "Failed to generate session token: 500"

**Solution**: OpenAI's API is experiencing issues. Check https://status.openai.com/ for service status.

## What This Action Does

The `generateSessionToken` action:

1. Retrieves the `OPENAI_API_KEY` from Convex environment variables
2. Makes a POST request to `https://api.openai.com/v1/realtime/sessions`
3. Requests a session for the `gpt-4o-realtime-preview-2024-10-01` model
4. Returns the ephemeral session token (`client_secret.value`)

This token is used to establish a WebSocket connection to the OpenAI Realtime API for voice-based activity logging.

## Security Notes

- Session tokens are ephemeral and expire after a short time
- Never expose your `OPENAI_API_KEY` in client-side code
- Always generate session tokens server-side (via Convex actions)
- The session token is safe to use in the browser for WebSocket connections

## Next Steps

Once this action is working, you can proceed to:
- Task 24: Create `useOpenAIRealtime` hook for WebSocket connection
- Task 27: Implement `RealtimeVoiceInterface` component
- Task 28: Implement audio streaming
