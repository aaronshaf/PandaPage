# PandaPage

A high-performance document converter for the browser, built with Effect and TypeScript.

## 🚀 [Try the Demo](https://aaronshaf.github.io/PandaPage/)

See PandaPage in action with our interactive demo where you can upload and convert documents.

## Features

- 📄 Convert DOCX, PPTX, Pages, and Keynote files to Markdown
- 🚀 Fast processing with Web Workers for large documents
- 📊 Preserves document structure, lists, and formatting
- 🌊 Stream-based processing for files over 10MB
- 🧪 Comprehensive test coverage

## Quick Start

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run demo
cd packages/demo
bun dev
```

## Project Structure

This is a Bun monorepo with two packages:
- `packages/pandapage` - Core PDF extraction library
- `packages/demo` - Interactive demo application

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

See [`packages/pandapage/LOGGING.md`](packages/pandapage/LOGGING.md) for detailed logging documentation.

## Development

### Pre-commit Hooks

Fast Bun tests run automatically before commits. Playwright E2E tests run in CI only.

### Running Specific Tests

```bash
# Run only pandapage tests
cd packages/pandapage && bun test

# Run E2E tests
cd packages/demo && bun test:e2e
```

This project uses [Bun](https://bun.sh) - a fast all-in-one JavaScript runtime.
