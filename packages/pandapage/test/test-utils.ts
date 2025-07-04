import { Effect, Logger, LogLevel } from "effect";
import { renderPdf as originalRenderPdf, renderPdfEffect } from "../index";
import type { PdfInput, ProcessingOptions } from "../index";

// Configure Effect's logger based on LOG_LEVEL env var
const getLogLevel = (): LogLevel.LogLevel => {
  const level = process.env.LOG_LEVEL?.toLowerCase() || "error";
  switch (level) {
    case "none": return LogLevel.None;
    case "fatal": return LogLevel.Fatal;
    case "error": return LogLevel.Error;
    case "warning": return LogLevel.Warning;
    case "info": return LogLevel.Info;
    case "debug": return LogLevel.Debug;
    case "trace": return LogLevel.Trace;
    case "all": return LogLevel.All;
    default: return LogLevel.Error;
  }
};

// Create a custom logger layer with the configured log level
const testLoggerLayer = Logger.minimumLogLevel(getLogLevel());

// Wrapper for renderPdf that applies the test logger configuration
export const renderPdf = async (input: PdfInput | string): Promise<string> => {
  // If it's a string, use the original renderPdf which handles path fetching
  if (typeof input === "string") {
    return originalRenderPdf(input);
  }
  
  // For non-string inputs, use renderPdfEffect with our logger configuration
  return Effect.runPromise(
    renderPdfEffect(input).pipe(
      Effect.provide(testLoggerLayer)
    )
  );
};