import { Effect } from "effect";

/**
 * Document processing configuration interface
 */
export interface DocumentConfig {
  // Performance settings
  workerThreshold: number;
  maxWorkers: number;
  chunkSize: number;
  
  // Feature flags
  enableStreaming: boolean;
  enableCaching: boolean;
  enableCompression: boolean;
  
  // Limits
  maxFileSize: number;
  timeout: number;
  
  // Output settings
  preserveFormatting: boolean;
  includeMetadata: boolean;
  generateOutline: boolean;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: DocumentConfig = {
  // Performance settings - 1MB threshold for workers
  workerThreshold: 1024 * 1024,
  maxWorkers: Math.max(2, navigator?.hardwareConcurrency || 4),
  chunkSize: 1024 * 1024, // 1MB chunks
  
  // Feature flags
  enableStreaming: true,
  enableCaching: true,
  enableCompression: false,
  
  // Limits - 100MB max file size, 30 second timeout
  maxFileSize: 100 * 1024 * 1024,
  timeout: 30000,
  
  // Output settings
  preserveFormatting: true,
  includeMetadata: true,
  generateOutline: true,
};

/**
 * Configuration validation error
 */
export class ConfigError {
  readonly _tag = "ConfigError";
  constructor(public readonly message: string) {}
}

/**
 * Validate and merge configuration with defaults
 */
export const validateConfig = (userConfig: unknown = {}): Effect.Effect<DocumentConfig, ConfigError> =>
  Effect.try({
    try: () => {
      // Parse user config - simplified approach
      const userObj = typeof userConfig === 'object' && userConfig !== null ? userConfig as any : {};
      
      // Merge with defaults and validate types
      const config: DocumentConfig = {
        ...DEFAULT_CONFIG,
        ...userObj,
      };
      
      // Type validation
      if (typeof config.workerThreshold !== 'number' || config.workerThreshold <= 0) {
        config.workerThreshold = DEFAULT_CONFIG.workerThreshold;
      }
      if (typeof config.maxWorkers !== 'number' || config.maxWorkers <= 0) {
        config.maxWorkers = DEFAULT_CONFIG.maxWorkers;
      }
      if (typeof config.chunkSize !== 'number' || config.chunkSize <= 0) {
        config.chunkSize = DEFAULT_CONFIG.chunkSize;
      }
      if (typeof config.maxFileSize !== 'number' || config.maxFileSize <= 0) {
        config.maxFileSize = DEFAULT_CONFIG.maxFileSize;
      }
      if (typeof config.timeout !== 'number' || config.timeout <= 0) {
        config.timeout = DEFAULT_CONFIG.timeout;
      }
      
      // Additional validation
      if (config.maxWorkers > 16) {
        throw new ConfigError("maxWorkers cannot exceed 16");
      }
      
      if (config.chunkSize > config.maxFileSize) {
        throw new ConfigError("chunkSize cannot exceed maxFileSize");
      }
      
      return config;
    },
    catch: (error) => new ConfigError(`Invalid configuration: ${error}`)
  });

/**
 * Environment-based configuration loader
 */
export const loadConfigFromEnv = (): Effect.Effect<DocumentConfig, ConfigError> => {
  const envConfig = {
    workerThreshold: process.env.PANDAPAGE_WORKER_THRESHOLD 
      ? parseInt(process.env.PANDAPAGE_WORKER_THRESHOLD, 10) 
      : undefined,
    maxWorkers: process.env.PANDAPAGE_MAX_WORKERS 
      ? parseInt(process.env.PANDAPAGE_MAX_WORKERS, 10) 
      : undefined,
    enableStreaming: process.env.PANDAPAGE_STREAMING === 'true',
    enableCaching: process.env.PANDAPAGE_CACHING !== 'false',
    maxFileSize: process.env.PANDAPAGE_MAX_FILE_SIZE 
      ? parseInt(process.env.PANDAPAGE_MAX_FILE_SIZE, 10) 
      : undefined,
  };
  
  return validateConfig(envConfig);
};