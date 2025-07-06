# Effect Best Practices Report

## Core Concepts

**Effect Structure**: Effects are functions with three type parameters:
- Success type (return value)
- Error type (what can go wrong)
- Dependencies type (what services are needed)

**Generator Functions**: Use `effect.gen` with `yield` instead of promise chains. `yield` works like `await` but for Effect types, automatically propagating error types through the type system.

## Error Handling Best Practices

### 1. Define Custom Error Types
```typescript
export class RedisError extends Data.TaggedError("RedisError")<{
  cause: unknown
}> {}
```

**Benefits:**
- Type-safe error handling at compile time
- Fine-grained error handling capabilities
- Better debugging with specific error contexts
- Preserve original error information with `cause` field

### 2. Use Tagged Errors for Pattern Matching
```typescript
effect.catchTag("RedisError", (error) => {
  // Handle Redis-specific errors
})
```

### 3. Avoid Running Effects Inside Effects
**Bad:**
```typescript
const result = await effect.runPromise(someEffect)
```

**Good:**
```typescript
const result = yield* someEffect
```

## Dependency Injection Patterns

### 1. Context Tags for Services
```typescript
export class Redis extends Context.Tag("Redis")<Redis, RedisImpl>() {}
```

### 2. Layer Pattern for Service Construction
```typescript
export const RedisLive = Layer.effect(
  Redis,
  effect.gen(function* () {
    const client = yield* createRedisClient()
    return new RedisImpl(client)
  })
)
```

### 3. Service Implementation with "Use" Pattern
```typescript
const use = <A>(f: (client: RedisClient) => A) =>
  effect.gen(function* () {
    const redis = yield* Redis
    return yield* redis.use(f)
  })
```

## Resource Management

### 1. Acquire-Release Pattern
```typescript
const makeRedis = effect.acquireRelease(
  effect.tryPromise({
    try: () => createClient(options).connect(),
    catch: (error) => new RedisError({ cause: error })
  }),
  (client) => effect.promise(() => client.quit())
)
```

### 2. Scoped Resources
```typescript
export const RedisLive = Layer.scoped(Redis, makeRedis)
```

## Concurrency Best Practices

### 1. Parallel Execution with effect.all
```typescript
const [notionVideos, redisVideos] = yield* effect.all(
  [notion.getPublished(), redis.getVideos()],
  { concurrency: "unbounded" }
)
```

### 2. Structured Concurrency
- Effects automatically handle interruption
- Built-in abort signal propagation
- Automatic resource cleanup on cancellation

## Schema and Data Validation

### 1. Use Schema for Type-Safe Parsing
```typescript
const VideoSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  published: Schema.Boolean
})

const VideoJsonSchema = Schema.parseJson(VideoSchema)
```

### 2. Bidirectional Schemas
```typescript
// Automatically handles encoding/decoding
const DateSchema = Schema.Date // string ↔ Date
const SetSchema = Schema.Set(Schema.String) // Array ↔ Set
```

## Retry and Scheduling

### 1. Replace setTimeout with Schedules
**Bad:**
```typescript
setTimeout(() => mainLoop(), 60000)
```

**Good:**
```typescript
effect.retry(mainEffect, Schedule.spaced(Duration.minutes(1)))
```

### 2. Flexible Scheduling Options
```typescript
// Exponential backoff with limits
Schedule.exponential(Duration.seconds(1)).pipe(
  Schedule.upTo(Duration.minutes(5))
)
```

## Logging and Observability

### 1. Use Effect's Logging System
```typescript
effect.log("Processing video", { videoId: video.id })
effect.logDebug("Debug information")
effect.logError("Error occurred", error)
```

### 2. Log Spans and Annotations
```typescript
effect.annotateCurrentSpan("operation", "save-video").pipe(
  effect.withSpan("save-video", { attributes: { videoId } })
)
```

### 3. Configurable Log Levels
```typescript
effect.provide(
  mainEffect,
  Logger.minimumLogLevel(LogLevel.Info)
)
```

## Configuration Management

### 1. Type-Safe Environment Variables
```typescript
const discordToken = yield* Config.string("DISCORD_TOKEN")
const redisUrl = yield* Config.string("REDIS_URL")
```

### 2. Custom Config Providers
```typescript
const configProvider = ConfigProvider.fromMap(
  new Map([["DISCORD_TOKEN", "test-token"]])
)
```

## Common Anti-Patterns to Avoid

1. **Creating dependencies inline** - Use dependency injection instead
2. **Using console.log** - Use Effect's logging system
3. **Manual setTimeout for retries** - Use Schedule combinators
4. **Running effects inside effects** - Compose with generators
5. **Type casting without validation** - Use Schema for parsing

## Integration Patterns

### 1. Converting from Promises
```typescript
// For functions that might throw
effect.tryPromise({
  try: () => fetch(url),
  catch: (error) => new NetworkError({ cause: error })
})

// For functions that never throw
effect.promise(() => Promise.resolve("safe"))
```

### 2. Converting to Promises
```typescript
// For use in non-Effect code
const result = await effect.runPromise(myEffect)
```

## Type System Benefits

- **Automatic error type inference** - No manual type annotations needed
- **Dependency tracking** - Compiler ensures all dependencies are provided
- **Effect unification** - Multiple effects combine into single, clean types
- **Zero-cost abstractions** - Type safety without runtime overhead

## Project Structure Recommendations

1. **Separate service definitions from implementations**
2. **Use star imports for Effect modules** (`import * as Effect from "effect"`)
3. **Define layers at module boundaries**
4. **Keep effects composable and small**
5. **Use exact optional property types when using Schema**

This approach provides type-safe, composable, and maintainable code with excellent error handling, dependency injection, and concurrency management built-in.
