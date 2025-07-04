# Testing Guide

PandaPage uses a hybrid testing approach with both deterministic and AI-powered tests.

## Test Structure

```
test/
├── deterministic/     # Tests that run in CI/CD
│   └── *.test.ts     # Fast, reliable tests
└── ai/               # Tests that use AI evaluation
    └── *.test.ts     # Semantic comparison tests
```

## Running Tests

### All Tests
```bash
bun test                # Run all tests
bun run test:all        # Same as above
```

### Deterministic Tests Only
```bash
bun run test:deterministic  # Run only deterministic tests
bun run test:ci            # Alias for CI/CD environments
```

### AI-Powered Tests Only
```bash
bun run test:ai            # Run only AI tests (requires Ollama)
```

### Debug Mode
```bash
bun run test:debug         # Run with debug logging
bun run test:verbose       # Run with all logging
```

## Deterministic Tests

These tests check for specific content without requiring exact matches:
- Contains expected keywords
- Validates basic structure
- Runs quickly and reliably
- Used in CI/CD and pre-commit hooks

Example:
```typescript
test("PDF contains expected text", async () => {
  const extracted = await extractText(pdf);
  expect(extracted).toContain("Lorem ipsum");
  expect(extracted.toLowerCase()).toContain("dolor sit amet");
});
```

## AI-Powered Tests

These tests use Ollama for semantic comparison when exact matching isn't suitable:
- Handles formatting variations
- Provides similarity scores (0-100%)
- Gives detailed feedback on differences
- Configurable thresholds

### Configuration

Create a `.env` file:
```env
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=phi4:latest
TEST_MIN_EXACT_MATCH_SCORE=0.95
TEST_AI_EVALUATION_ENABLED=true
```

### Usage with Thresholds

```typescript
// Use default threshold (95%)
await expectTextMatch(actual, expected, {
  testName: "PDF extraction"
});

// Use custom threshold
await expectTextMatch(actual, expected, {
  testName: "Complex PDF with known issues",
  threshold: 70  // Accept 70% similarity
});
```

### Setting Baseline Thresholds

When working with problematic PDFs, you can establish a baseline:

```typescript
// Get current performance
const result = await evaluateTextExtraction(expected, actual);
console.log(`Current score: ${result.score}%`);

// Set threshold with buffer to prevent regression
const threshold = Math.floor(result.score - 5);
await expectTextMatch(actual, expected, { threshold });
```

## CI/CD Integration

GitHub Actions and pre-commit hooks only run deterministic tests:

```yaml
# .github/workflows/test.yml
- name: Run unit tests (deterministic only)
  run: bun run test:ci
```

## Local Development

1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull phi4:latest`
3. Run all tests: `bun test`

## Writing New Tests

### Deterministic Test
Place in `test/deterministic/`:
```typescript
test("Extract specific content", async () => {
  // Fast, specific checks
  expect(text).toContain("expected phrase");
});
```

### AI Test
Place in `test/ai/`:
```typescript
test("Extract with AI evaluation", async () => {
  // Semantic comparison
  await expectTextMatch(actual, expected, {
    threshold: 85  // Optional
  });
});
```