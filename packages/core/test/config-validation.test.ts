import { test, expect } from "bun:test";
import { Effect } from "effect";
import { validateConfig, DEFAULT_CONFIG, ConfigError } from "../src/common/config";

test("validateConfig - should use defaults for empty input", async () => {
  const result = await Effect.runPromise(validateConfig({}));
  
  expect(result).toEqual(DEFAULT_CONFIG);
});

test("validateConfig - should merge user config with defaults", async () => {
  const userConfig = {
    maxWorkers: 8,
    enableStreaming: false
  };
  
  const result = await Effect.runPromise(validateConfig(userConfig));
  
  expect(result).toMatchObject({
    ...DEFAULT_CONFIG,
    maxWorkers: 8,
    enableStreaming: false
  });
});

test("validateConfig - should enforce maxWorkers limit", async () => {
  const userConfig = { maxWorkers: 20 };
  
  const result = await Effect.runPromiseExit(validateConfig(userConfig));
  
  expect(result._tag).toBe("Failure");
  if (result._tag === "Failure") {
    const error = result.cause._tag === "Fail" ? result.cause.error : null;
    expect(error).toBeInstanceOf(ConfigError);
    expect(error?.message).toContain("maxWorkers cannot exceed 16");
  }
});

test("validateConfig - should enforce chunkSize vs maxFileSize", async () => {
  const userConfig = {
    chunkSize: 200 * 1024 * 1024, // 200MB
    maxFileSize: 100 * 1024 * 1024  // 100MB
  };
  
  const result = await Effect.runPromiseExit(validateConfig(userConfig));
  
  expect(result._tag).toBe("Failure");
  if (result._tag === "Failure") {
    const error = result.cause._tag === "Fail" ? result.cause.error : null;
    expect(error).toBeInstanceOf(ConfigError);
    expect(error?.message).toContain("chunkSize cannot exceed maxFileSize");
  }
});

test("validateConfig - should handle invalid types gracefully", async () => {
  const invalidConfigs = [
    { maxWorkers: "invalid" },
    { timeout: -1000 },
    { enableStreaming: "not-boolean" },
    { chunkSize: null }
  ];
  
  for (const config of invalidConfigs) {
    const result = await Effect.runPromise(validateConfig(config));
    
    // Should fall back to defaults for invalid values
    expect(result.maxWorkers).toBe(DEFAULT_CONFIG.maxWorkers);
    expect(result.timeout).toBe(DEFAULT_CONFIG.timeout);
    expect(typeof result.enableStreaming).toBe("boolean");
    expect(result.chunkSize).toBe(DEFAULT_CONFIG.chunkSize);
  }
});

test("DEFAULT_CONFIG - should have valid structure", () => {
  expect(DEFAULT_CONFIG).toBeDefined();
  expect(DEFAULT_CONFIG).toHaveProperty('workerThreshold');
  expect(DEFAULT_CONFIG).toHaveProperty('maxWorkers');
  expect(DEFAULT_CONFIG).toHaveProperty('chunkSize');
  expect(DEFAULT_CONFIG).toHaveProperty('enableStreaming');
  expect(DEFAULT_CONFIG).toHaveProperty('enableCaching');
  expect(DEFAULT_CONFIG).toHaveProperty('enableCompression');
  expect(DEFAULT_CONFIG).toHaveProperty('maxFileSize');
  expect(DEFAULT_CONFIG).toHaveProperty('timeout');
  expect(DEFAULT_CONFIG).toHaveProperty('preserveFormatting');
  expect(DEFAULT_CONFIG).toHaveProperty('includeMetadata');
  expect(DEFAULT_CONFIG).toHaveProperty('generateOutline');
  
  // Validate numeric constraints - use simple checks
  expect(DEFAULT_CONFIG.maxWorkers > 0).toBe(true);
  expect(DEFAULT_CONFIG.maxWorkers <= 16).toBe(true);
  expect(DEFAULT_CONFIG.chunkSize > 0).toBe(true);
  expect(DEFAULT_CONFIG.maxFileSize > 0).toBe(true);
  expect(DEFAULT_CONFIG.timeout > 0).toBe(true);
  expect(DEFAULT_CONFIG.chunkSize <= DEFAULT_CONFIG.maxFileSize).toBe(true);
});

test("ConfigError - should have proper structure", () => {
  const error = new ConfigError("Test error message");
  
  expect(error._tag).toBe("ConfigError");
  expect(error.message).toBe("Test error message");
  expect(error).toBeInstanceOf(ConfigError);
});

test("validateConfig - should handle null and undefined", async () => {
  const results = await Promise.all([
    Effect.runPromise(validateConfig(null)),
    Effect.runPromise(validateConfig(undefined)),
    Effect.runPromise(validateConfig())
  ]);
  
  results.forEach(result => {
    expect(result).toEqual(DEFAULT_CONFIG);
  });
});

test("Performance constraints should be realistic", () => {
  // Test that default values make sense for real-world usage
  expect(DEFAULT_CONFIG.workerThreshold >= 1024).toBe(true); // At least 1KB
  expect(DEFAULT_CONFIG.maxFileSize >= 1024 * 1024).toBe(true); // At least 1MB
  expect(DEFAULT_CONFIG.timeout >= 5000).toBe(true); // At least 5 seconds
  expect(DEFAULT_CONFIG.chunkSize >= 1024).toBe(true); // At least 1KB
});