import { test, expect } from "bun:test";
import { validateConfig, DEFAULT_CONFIG, ConfigError } from "../../src/common/config";
import { Effect } from "effect";

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
  
  const result = await Effect.runPromiseEither(validateConfig(userConfig));
  
  expect(result._tag).toBe("Left");
  expect(result.left).toBeInstanceOf(ConfigError);
  expect(result.left.message).toContain("maxWorkers cannot exceed 16");
});

test("validateConfig - should enforce chunkSize vs maxFileSize", async () => {
  const userConfig = {
    chunkSize: 200 * 1024 * 1024, // 200MB
    maxFileSize: 100 * 1024 * 1024  // 100MB
  };
  
  const result = await Effect.runPromiseEither(validateConfig(userConfig));
  
  expect(result._tag).toBe("Left");
  expect(result.left).toBeInstanceOf(ConfigError);
  expect(result.left.message).toContain("chunkSize cannot exceed maxFileSize");
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
  expect(DEFAULT_CONFIG).toMatchObject({
    workerThreshold: expect.any(Number),
    maxWorkers: expect.any(Number),
    chunkSize: expect.any(Number),
    enableStreaming: expect.any(Boolean),
    enableCaching: expect.any(Boolean),
    enableCompression: expect.any(Boolean),
    maxFileSize: expect.any(Number),
    timeout: expect.any(Number),
    preserveFormatting: expect.any(Boolean),
    includeMetadata: expect.any(Boolean),
    generateOutline: expect.any(Boolean)
  });
  
  // Validate numeric constraints
  expect(DEFAULT_CONFIG.maxWorkers).toBeGreaterThan(0);
  expect(DEFAULT_CONFIG.maxWorkers).toBeLessThanOrEqual(16);
  expect(DEFAULT_CONFIG.chunkSize).toBeGreaterThan(0);
  expect(DEFAULT_CONFIG.maxFileSize).toBeGreaterThan(0);
  expect(DEFAULT_CONFIG.timeout).toBeGreaterThan(0);
  expect(DEFAULT_CONFIG.chunkSize).toBeLessThanOrEqual(DEFAULT_CONFIG.maxFileSize);
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
  expect(DEFAULT_CONFIG.workerThreshold).toBeGreaterThanOrEqual(1024); // At least 1KB
  expect(DEFAULT_CONFIG.maxFileSize).toBeGreaterThanOrEqual(1024 * 1024); // At least 1MB
  expect(DEFAULT_CONFIG.timeout).toBeGreaterThanOrEqual(5000); // At least 5 seconds
  expect(DEFAULT_CONFIG.chunkSize).toBeGreaterThanOrEqual(1024); // At least 1KB
});