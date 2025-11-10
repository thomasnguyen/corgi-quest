# useOpenAIRealtime Hook

Custom React hook for managing OpenAI Realtime API WebSocket connections with automatic reconnection and error handling.

## Features

- ✅ Microphone permission management
- ✅ WebSocket connection lifecycle management
- ✅ Automatic reconnection with exponential backoff
- ✅ Connection state tracking (disconnected, connecting, connected, error)
- ✅ Message event handling
- ✅ Error handling and reporting
- ✅ Clean disconnect on unmount

## Usage

```typescript
import { useOpenAIRealtime } from "./hooks/useOpenAIRealtime";

function VoiceComponent() {
  const {
    connectionState,
    hasPermission,
    isConnected,
    requestPermission,
    connect,
    disconnect,
    sendMessage,
    reconnect,
  } = useOpenAIRealtime({
    onMessage: (message) => {
      console.log("Received:", message);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
    onConnectionChange: (state) => {
      console.log("Connection state:", state);
    },
    autoReconnect: true,
    maxReconnectAttempts: 5,
  });

  // Request permission on mount
  useEffect(() => {
    if (hasPermission === null) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  return (
    <div>
      <p>Status: {connectionState}</p>
      <button onClick={connect} disabled={isConnected}>
        Connect
      </button>
      <button onClick={disconnect} disabled={!isConnected}>
        Disconnect
      </button>
    </div>
  );
}
```

## API Reference

### Options

```typescript
interface UseOpenAIRealtimeOptions {
  onMessage?: (message: RealtimeMessage) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (state: ConnectionState) => void;
  autoReconnect?: boolean; // Default: true
  maxReconnectAttempts?: number; // Default: 5
}
```

### Return Value

```typescript
interface UseOpenAIRealtimeReturn {
  connectionState: ConnectionState; // "disconnected" | "connecting" | "connected" | "error"
  hasPermission: boolean | null; // null = not checked, true = granted, false = denied
  isConnected: boolean; // Convenience flag for connectionState === "connected"
  requestPermission: () => Promise<boolean>; // Request microphone permission
  connect: () => Promise<void>; // Establish WebSocket connection
  disconnect: () => void; // Close connection
  sendMessage: (message: any) => void; // Send message through WebSocket
  reconnect: () => Promise<void>; // Manually trigger reconnection
}
```

## Connection Flow

1. **Request Permission**: Call `requestPermission()` to request microphone access
2. **Connect**: Call `connect()` to establish WebSocket connection
3. **Session Token**: Hook automatically generates session token via Convex action
4. **WebSocket**: Opens connection to OpenAI Realtime API
5. **Session Created**: Receives `session.created` event, state becomes "connected"
6. **Send Messages**: Use `sendMessage()` to send events to OpenAI
7. **Receive Messages**: Messages are delivered via `onMessage` callback
8. **Disconnect**: Call `disconnect()` or component unmounts

## Reconnection Strategy

The hook implements automatic reconnection with exponential backoff:

- Attempt 1: 1 second delay
- Attempt 2: 2 seconds delay
- Attempt 3: 4 seconds delay
- Attempt 4: 8 seconds delay
- Attempt 5: 16 seconds delay
- Maximum delay: 30 seconds

After `maxReconnectAttempts` (default: 5), reconnection stops and an error is reported.

## Error Handling

The hook handles several error scenarios:

- **Microphone Permission Denied**: Sets `hasPermission` to `false` and calls `onError`
- **Session Token Generation Failed**: Calls `onError` with descriptive message
- **WebSocket Connection Failed**: Sets state to "error" and calls `onError`
- **WebSocket Closed Unexpectedly**: Attempts automatic reconnection if enabled
- **Message Parsing Failed**: Logs error and calls `onError`

## Message Types

The hook handles all OpenAI Realtime API message types:

- `session.created` - Session initialized successfully
- `session.updated` - Session configuration updated
- `conversation.item.created` - New conversation item added
- `response.created` - Response generation started
- `response.done` - Response generation completed
- `response.audio.delta` - Audio chunk received
- `response.function_call_arguments.done` - Function call completed
- `input_audio_buffer.speech_started` - User started speaking
- `input_audio_buffer.speech_stopped` - User stopped speaking
- `error` - Error occurred

See the full list in `RealtimeMessageType` type definition.

## Requirements

- OpenAI API key configured in Convex environment variables
- Convex action `generateSessionToken` must be implemented
- Browser with WebSocket and MediaDevices API support
- HTTPS connection (required for microphone access)

## Example: Sending Session Configuration

```typescript
const { sendMessage, isConnected } = useOpenAIRealtime();

useEffect(() => {
  if (isConnected) {
    sendMessage({
      type: "session.update",
      session: {
        instructions: "You are a helpful assistant...",
        voice: "alloy",
        tools: [
          {
            name: "saveActivity",
            description: "Save a dog training activity",
            parameters: {
              type: "object",
              properties: {
                activityName: { type: "string" },
                durationMinutes: { type: "number" },
              },
            },
          },
        ],
      },
    });
  }
}, [isConnected, sendMessage]);
```

## Testing

The hook can be tested by:

1. Checking connection state transitions
2. Verifying microphone permission requests
3. Testing reconnection logic with network interruptions
4. Validating message sending/receiving
5. Testing cleanup on unmount

## Notes

- The hook automatically cleans up WebSocket connections on unmount
- Manual disconnects prevent automatic reconnection
- Session tokens are ephemeral and generated fresh for each connection
- The hook uses refs to avoid unnecessary re-renders
- All WebSocket events are logged to console for debugging
