/**
 * API Logging Utility
 *
 * Provides structured logging for VR API endpoints including:
 * - Request logging (method, path, timestamp)
 * - Response logging (status code, response time)
 * - Error logging (with stack traces and context)
 * - Performance logging (query execution times)
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

interface RequestLogData {
  method: string;
  path: string;
  timestamp: string;
  dogId?: string;
  textLength?: number;
  hasSessionContext?: boolean;
}

interface ResponseLogData {
  statusCode: number;
  responseTimeMs: number;
  timestamp: string;
}

interface ErrorLogData {
  error: Error | unknown;
  context: Record<string, any>;
  timestamp: string;
  stack?: string;
}

interface PerformanceLogData {
  operation: string;
  durationMs: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Log incoming API request
 * Requirements: 8.1
 */
export function logRequest(data: RequestLogData): void {
  console.log("[API Request]", {
    method: data.method,
    path: data.path,
    timestamp: data.timestamp,
    ...(data.dogId && { dogId: data.dogId }),
    ...(data.textLength !== undefined && { textLength: data.textLength }),
    ...(data.hasSessionContext !== undefined && {
      hasSessionContext: data.hasSessionContext,
    }),
  });
}

/**
 * Log API response with timing
 * Requirements: 8.3
 */
export function logResponse(data: ResponseLogData): void {
  console.log("[API Response]", {
    statusCode: data.statusCode,
    responseTimeMs: data.responseTimeMs,
    timestamp: data.timestamp,
  });
}

/**
 * Log error with stack trace and context
 * Requirements: 8.2, 8.4
 */
export function logError(data: ErrorLogData): void {
  console.error("[API Error]", {
    message:
      data.error instanceof Error ? data.error.message : String(data.error),
    stack:
      data.stack ||
      (data.error instanceof Error ? data.error.stack : undefined),
    context: data.context,
    timestamp: data.timestamp,
  });
}

/**
 * Log performance metrics for operations
 * Requirements: 8.5
 */
export function logPerformance(data: PerformanceLogData): void {
  const logLevel = data.durationMs > 1000 ? "warn" : "log";
  console[logLevel]("[API Performance]", {
    operation: data.operation,
    durationMs: data.durationMs,
    timestamp: data.timestamp,
    ...(data.metadata && { metadata: data.metadata }),
    ...(data.durationMs > 1000 && { warning: "Slow query detected" }),
  });
}

/**
 * Create a performance timer
 * Returns a function that logs the elapsed time when called
 */
export function createPerformanceTimer(
  operation: string,
  metadata?: Record<string, any>
) {
  const startTime = Date.now();

  return () => {
    const durationMs = Date.now() - startTime;
    logPerformance({
      operation,
      durationMs,
      timestamp: new Date().toISOString(),
      metadata,
    });
    return durationMs;
  };
}

/**
 * Log voice transcript on parsing failures
 * Requirements: 8.4
 */
export function logVoiceParsingFailure(
  text: string,
  error: Error | unknown
): void {
  console.error("[Voice Parsing Failed]", {
    transcript: text,
    transcriptLength: text.length,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
}
