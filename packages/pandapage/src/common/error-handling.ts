import * as S from "@effect/schema/Schema";
import { Effect, pipe } from "effect";

/**
 * Base error schema for all PandaPage errors
 */
export const BaseErrorSchema = S.Struct({
  _tag: S.String,
  message: S.String,
  timestamp: S.optional(S.Date),
  context: S.optional(S.Record(S.String, S.Unknown)),
});

export type BaseError = S.Schema.Type<typeof BaseErrorSchema>;

/**
 * Document parsing error categories
 */
export const ErrorCategorySchema = S.Literal(
  "parsing",
  "validation", 
  "network",
  "timeout",
  "memory",
  "worker",
  "unknown"
);

export type ErrorCategory = S.Schema.Type<typeof ErrorCategorySchema>;

/**
 * Enhanced error with categorization
 */
export const CategorizedErrorSchema = S.extend(
  BaseErrorSchema,
  S.Struct({
    category: ErrorCategorySchema,
    recoverable: S.Boolean,
    retryAfter: S.optional(S.Number),
  })
);

export type CategorizedError = S.Schema.Type<typeof CategorizedErrorSchema>;

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
export const RecoveryStrategySchema = S.Literal(
  "retry",
  "fallback", 
  "ignore",
  "abort"
);

export type RecoveryStrategy = S.Schema.Type<typeof RecoveryStrategySchema>;

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
 * Effect-based retry with exponential backoff
 */
export const retryWithBackoff = <A, E>(
  effect: Effect.Effect<A, E>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Effect.Effect<A, E> =>
  pipe(
    effect,
    Effect.retry({
      times: maxAttempts - 1,
      schedule: (attempt) => Effect.delay(baseDelay * Math.pow(2, attempt))
    })
  );

/**
 * Safe effect execution with error categorization
 */
export const safeExecute = <A>(
  effect: Effect.Effect<A, unknown>,
  fallback?: A
): Effect.Effect<A, CategorizedError> =>
  pipe(
    effect,
    Effect.catchAll((error) =>
      pipe(
        categorizeError(error),
        Effect.flatMap((categorizedError) =>
          categorizedError.recoverable && fallback !== undefined
            ? Effect.succeed(fallback)
            : Effect.fail(categorizedError)
        )
      )
    )
  );

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