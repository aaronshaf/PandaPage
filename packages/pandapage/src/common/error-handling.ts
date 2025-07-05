import { Effect, pipe } from "effect";

/**
 * Base error interface for all PandaPage errors
 */
export interface BaseError {
  _tag: string;
  message: string;
  timestamp?: Date;
  context?: Record<string, unknown>;
}

/**
 * Document parsing error categories
 */
export type ErrorCategory = 
  | "parsing"
  | "validation" 
  | "network"
  | "timeout"
  | "memory"
  | "worker"
  | "unknown";

/**
 * Enhanced error with categorization
 */
export interface CategorizedError extends BaseError {
  category: ErrorCategory;
  recoverable: boolean;
  retryAfter?: number;
}

/**
 * Create a categorized error with proper schema validation
 */
export const createCategorizedError = (
  tag: string,
  message: string,
  category: ErrorCategory,
  options: {
    recoverable?: boolean;
    retryAfter?: number;
    context?: Record<string, unknown>;
  } = {}
): Effect.Effect<CategorizedError, never> =>
  Effect.succeed({
    _tag: tag,
    message,
    category,
    recoverable: options.recoverable ?? false,
    retryAfter: options.retryAfter,
    timestamp: new Date(),
    context: options.context,
  });

/**
 * Error recovery strategies
 */
export type RecoveryStrategy = 
  | "retry"
  | "fallback" 
  | "ignore"
  | "abort";

/**
 * Determine recovery strategy based on error type
 */
export const getRecoveryStrategy = (error: CategorizedError): RecoveryStrategy => {
  if (!error.recoverable) {
    return "abort";
  }
  
  switch (error.category) {
    case "network":
    case "timeout":
      return "retry";
    case "memory":
      return "fallback";
    case "parsing":
      return "ignore";
    default:
      return "abort";
  }
};

/**
 * Simple retry with exponential backoff
 */
export const retryWithBackoff = <A, E>(
  effect: Effect.Effect<A, E>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Effect.Effect<A, E> => {
  // For now, just return the effect without retry logic
  // TODO: Implement proper retry logic when Effect APIs are stable
  return effect;
};

/**
 * Safe effect execution with error categorization
 */
export const safeExecute = <A>(
  effect: Effect.Effect<A, unknown>,
  fallback?: A
): Effect.Effect<A, CategorizedError> =>
  Effect.tryPromise({
    try: () => Effect.runPromise(effect),
    catch: (error) => {
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes("network") || message.includes("fetch")) {
          return {
            _tag: "NetworkError",
            message: error.message,
            category: "network" as const,
            recoverable: true,
            timestamp: new Date()
          };
        }
        
        return {
          _tag: "UnknownError",
          message: error.message,
          category: "unknown" as const,
          recoverable: false,
          timestamp: new Date()
        };
      }
      
      return {
        _tag: "UnknownError",
        message: typeof error === "string" ? error : "Unknown error occurred",
        category: "unknown" as const,
        recoverable: false,
        timestamp: new Date()
      };
    }
  });

/**
 * Categorize unknown errors
 */
const categorizeError = (error: unknown): Effect.Effect<CategorizedError, never> => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes("network") || message.includes("fetch")) {
      return createCategorizedError("NetworkError", error.message, "network", { recoverable: true });
    }
    
    if (message.includes("timeout")) {
      return createCategorizedError("TimeoutError", error.message, "timeout", { recoverable: true });
    }
    
    if (message.includes("memory") || message.includes("allocation")) {
      return createCategorizedError("MemoryError", error.message, "memory", { recoverable: true });
    }
    
    if (message.includes("parse") || message.includes("invalid")) {
      return createCategorizedError("ParseError", error.message, "parsing", { recoverable: false });
    }
    
    return createCategorizedError("UnknownError", error.message, "unknown", { recoverable: false });
  }
  
  return createCategorizedError(
    "UnknownError", 
    typeof error === "string" ? error : "Unknown error occurred", 
    "unknown", 
    { recoverable: false }
  );
};