# Development Guide

This guide covers development workflows, testing, and contribution guidelines for browser-document-viewer.

## Testing

Tests run with minimal logging by default. Control logging with the `LOG_LEVEL` environment variable:

```bash
# Default - only errors
bun test

# Debug logging
LOG_LEVEL=Debug bun test

# All logs
LOG_LEVEL=All bun test  

# Silent mode
LOG_LEVEL=None bun test
```

See [`packages/core/LOGGING.md`](packages/core/LOGGING.md) for detailed logging documentation.

### Running Specific Tests

```bash
# Run parser tests
cd packages/parser && bun test

# Run renderer tests  
cd packages/renderer-dom && bun test
cd packages/renderer-markdown && bun test

# Run E2E tests
cd packages/demo && bun test:e2e
```

## Development Workflow

### Git Hooks

This project uses automated git hooks to ensure code quality:

**Pre-commit Hook:**
- Runs file size checks
- Executes linting (`bun run lint`)
- Performs type checking (`bun run typecheck`)
- Runs full unit test suite (`bun run test:unit`)

**Pre-push Hook:**
- Executes linting (`bun run lint`)
- Performs type checking (`bun run typecheck`)
- Runs full unit test suite (`bun run test:unit`)
- Prevents pushing code with any quality issues
- Ensures CI will pass before code reaches remote repository

The hooks are managed by `simple-git-hooks` and installed automatically. To skip hooks temporarily:
```bash
# Skip pre-commit hook
SKIP_SIMPLE_GIT_HOOKS=1 git commit -m "message"

# Skip pre-push hook  
SKIP_SIMPLE_GIT_HOOKS=1 git push
```

### Project Structure

This is a Bun monorepo with the following packages:

- `packages/parser` - Core DOCX parsing logic
- `packages/renderer-dom` - HTML/DOM rendering output
- `packages/renderer-markdown` - Markdown rendering output
- `packages/core` - Core package with advanced DOCX processing
- `packages/demo` - Interactive demo application

### Building

```bash
# Build all packages
bun run build

# Build specific package
cd packages/parser && bun run build
```

### Development Server

```bash
# Run demo in development mode
cd packages/demo
bun dev
```

### Code Quality

- TypeScript strict mode is enabled
- All code must pass type checking before commits
- Unit tests should maintain high coverage
- E2E tests verify end-to-end functionality

### Adding New Features

1. Start with failing tests in the appropriate package
2. Implement the feature with proper TypeScript types
3. Update documentation if needed
4. Ensure all tests pass
5. Update the Document Support section in README.md if applicable