import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error monitoring
 * This should be called as early as possible in the app lifecycle
 */
export function initSentry() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || "development";

  // Only initialize if DSN is provided and not a placeholder
  if (
    sentryDsn &&
    !sentryDsn.includes("your-sentry-dsn") &&
    !sentryDsn.includes("your-project-id")
  ) {
    Sentry.init({
      dsn: sentryDsn,
      environment,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: environment === "production" ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Capture console errors
      beforeSend(event) {
        // Filter out development errors if needed
        if (environment === "development") {
          console.log("Sentry event:", event);
        }
        return event;
      },
    });

    console.log(`Sentry initialized for ${environment} environment`);
  } else {
    console.log("Sentry not initialized: DSN not configured or is placeholder");
  }
}

/**
 * Manually capture an error to Sentry
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(userId: string, email?: string, name?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username: name,
  });
}

/**
 * Clear user context from Sentry
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}
