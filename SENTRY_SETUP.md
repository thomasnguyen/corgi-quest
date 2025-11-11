# Sentry Error Monitoring Setup

This document explains how to set up Sentry error monitoring for Corgi Quest.

## Overview

Sentry is integrated into Corgi Quest to capture and report errors in production. This helps identify and fix issues quickly during the hackathon demo and beyond.

## Setup Instructions

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up for a free account
2. Create a new project and select "React" as the platform
3. Copy your DSN (Data Source Name) from the project settings

### 2. Configure Environment Variables

Add your Sentry DSN to `.env.local`:

```bash
VITE_SENTRY_DSN=https://your-actual-dsn@sentry.io/your-project-id
```

**Important:** Replace the placeholder DSN with your actual DSN from Sentry.

### 3. Verify Installation

The Sentry integration is already installed and configured in the codebase:

- **Package:** `@sentry/react` is installed via npm
- **Initialization:** Sentry is initialized in `src/lib/sentry.ts`
- **Integration:** Sentry is integrated in `src/routes/__root.tsx`
- **Error Boundary:** A custom error boundary wraps the entire app

### 4. Test Error Reporting

#### Option 1: Use the Test Button Component

Temporarily add the `SentryTestButton` component to any screen:

```tsx
import { SentryTestButton } from "../components/SentryTestButton";

// In your component:
<SentryTestButton />
```

This adds two test buttons:
- **Test Sentry (Caught):** Sends a caught error to Sentry
- **Test ErrorBoundary:** Triggers an uncaught error to test the error boundary

#### Option 2: Trigger a Manual Error

Add this code anywhere in your app:

```tsx
import { captureError } from "../lib/sentry";

try {
  throw new Error("Test error");
} catch (error) {
  captureError(error as Error, { context: "test" });
}
```

#### Option 3: Trigger an Uncaught Error

Simply throw an error in a component:

```tsx
throw new Error("Test uncaught error");
```

This will be caught by the ErrorBoundary and reported to Sentry.

### 5. Check Sentry Dashboard

After triggering a test error:

1. Go to your Sentry dashboard at [sentry.io](https://sentry.io)
2. Navigate to your project
3. Check the "Issues" tab to see the reported error
4. You should see details including:
   - Error message and stack trace
   - Browser and OS information
   - User session replay (if enabled)
   - Breadcrumbs leading up to the error

## Features

### Error Boundary

The app is wrapped in a Sentry ErrorBoundary that:
- Catches uncaught errors in React components
- Displays a user-friendly error screen
- Automatically reports errors to Sentry
- Provides a "Try Again" button to reset the error state

### Manual Error Capture

Use the `captureError` function to manually report errors:

```tsx
import { captureError } from "../lib/sentry";

captureError(error, {
  userId: "123",
  action: "logging activity",
  additionalContext: "any data",
});
```

### User Context

Set user context for better error tracking:

```tsx
import { setSentryUser, clearSentryUser } from "../lib/sentry";

// When user selects character
setSentryUser(userId, email, name);

// When user logs out
clearSentryUser();
```

### Performance Monitoring

Sentry is configured to track:
- **Traces:** 10% of transactions in production, 100% in development
- **Session Replay:** 10% of sessions, 100% of error sessions
- **Browser Tracing:** Automatic page load and navigation tracking

## Configuration

Sentry configuration is in `src/lib/sentry.ts`:

```typescript
Sentry.init({
  dsn: sentryDsn,
  environment: "production" | "development",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1, // 10% in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## Environment Detection

Sentry only initializes if:
1. `VITE_SENTRY_DSN` is set in environment variables
2. The DSN is not a placeholder value
3. The DSN is a valid Sentry DSN format

In development, Sentry logs events to the console for debugging.

## Best Practices

1. **Don't commit real DSN:** Keep your Sentry DSN in `.env.local` (gitignored)
2. **Test before demo:** Verify error reporting works before the hackathon demo
3. **Monitor during demo:** Keep Sentry dashboard open during the demo to catch issues
4. **Remove test buttons:** Remove `SentryTestButton` before production deployment
5. **Set user context:** Call `setSentryUser()` when character is selected for better tracking

## Troubleshooting

### Errors not appearing in Sentry

1. Check that `VITE_SENTRY_DSN` is set correctly in `.env.local`
2. Verify the DSN is not a placeholder
3. Check browser console for Sentry initialization message
4. Ensure you're testing in a browser (not SSR)
5. Check Sentry project settings for rate limits

### Error boundary not catching errors

1. Error boundaries only catch errors in child components
2. Errors in event handlers need manual `captureError()` calls
3. Async errors need try/catch with `captureError()`

### Too many errors reported

1. Adjust `tracesSampleRate` in `src/lib/sentry.ts`
2. Add filters in `beforeSend` callback
3. Configure Sentry project settings to ignore certain errors

## Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Error Boundary](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/)
- [Sentry Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/react/performance/)
- [Sentry Session Replay](https://docs.sentry.io/platforms/javascript/guides/react/session-replay/)

## Sponsor Recognition

Sentry is a sponsor of this hackathon project. The integration demonstrates:
- Professional error monitoring
- Production-ready error handling
- User-friendly error recovery
- Real-time error tracking during demos

**Monitored by Sentry** badge is displayed in the app footer.
