import { captureError } from "../lib/sentry";

/**
 * Test button to verify Sentry error reporting
 * This component can be temporarily added to any screen to test Sentry integration
 */
export function SentryTestButton() {
  const triggerError = () => {
    try {
      // Intentionally throw an error for testing
      throw new Error("Test error from Sentry integration");
    } catch (error) {
      captureError(error as Error, {
        testContext: "Manual test button click",
        timestamp: new Date().toISOString(),
      });
      alert("Test error sent to Sentry! Check your Sentry dashboard.");
    }
  };

  const triggerUncaughtError = () => {
    // This will be caught by the ErrorBoundary
    throw new Error("Uncaught test error for ErrorBoundary");
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2">
      <button
        onClick={triggerError}
        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg"
      >
        Test Sentry (Caught)
      </button>
      <button
        onClick={triggerUncaughtError}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors shadow-lg"
      >
        Test ErrorBoundary
      </button>
    </div>
  );
}
