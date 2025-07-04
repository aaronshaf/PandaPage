# Logging in PandaPage

PandaPage uses Effect's built-in logging system, which respects standard environment variables for controlling log output.

## Environment Variables

### LOG_LEVEL
Controls the minimum log level that will be displayed. Available levels (from least to most verbose):
- `None` - No logs at all
- `Fatal` - Only fatal errors
- `Error` - Errors and fatal (default for tests)
- `Warning` - Warnings and above
- `Info` - Informational messages and above
- `Debug` - Debug messages and above
- `Trace` - Trace messages and above
- `All` - All messages

### NO_COLOR
Set to any value to disable colored output in logs.

### FORCE_COLOR
Set to any value to force colored output even when not in a TTY.

## Running Tests

```bash
# Run tests with minimal logging (only errors)
bun test

# Run tests with debug logging
bun test:debug
# or
LOG_LEVEL=Debug bun test

# Run tests with all logging
bun test:verbose
# or
LOG_LEVEL=All bun test

# Run tests with no logging at all
LOG_LEVEL=None bun test
```

## In Your Code

For custom debug logging in the codebase, use the `debug` utility:

```typescript
import { debug } from './debug';

// These only show when LOG_LEVEL includes Debug or higher
debug.log('Processing stream:', streamId);

// These show for Error level and above (except None)
debug.error('Failed to process:', error);
```

## Production Usage

When using PandaPage in production, you can control Effect's logging:

```typescript
import { renderPdf } from '@pandapage/pandapage';

// Set log level before using the library
process.env.LOG_LEVEL = 'Warning';

// Or use Effect's Logger configuration for more control
import { Effect, Logger, LogLevel } from 'effect';

const result = await Effect.runPromise(
  yourEffect.pipe(
    Logger.withMinimumLogLevel(LogLevel.Warning)
  )
);
```