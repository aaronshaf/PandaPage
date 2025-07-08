# Test Coverage Tracking

This document tracks the current test coverage across all packages to ensure same-or-better coverage is maintained.

## Current Coverage Levels

### Parser Package 📊
- **Functions**: 73.26%
- **Lines**: 84.70%
- **Status**: Good coverage, focus on advanced DOCX parsing features

### Renderer Markdown Package 📊  
- **Functions**: 82.35%
- **Lines**: 72.32%
- **Status**: Good coverage, focus on error handling paths

### Renderer DOM Package 📊
- **Functions**: 78.57% 
- **Lines**: 77.05%
- **Status**: Good coverage, focus on advanced styling features

### Pandapage Package 📊
- **Functions**: 47.44%
- **Lines**: 38.84%
- **Status**: ⚠️ **Needs Improvement** - lowest coverage

## Coverage Enforcement

Coverage is enabled for all packages via `bunfig.toml` configurations:
- Coverage reporting: ✅ Enabled
- Coverage thresholds: ❌ Disabled due to bun test runner issues

### Running Coverage Tests

```bash
# Run coverage across all packages
bun run test:coverage

# Run coverage for specific package
cd packages/parser && bun run test:coverage
```

### Coverage Rules

1. **Same-or-Better Policy**: New code must not decrease overall coverage percentages
2. **Manual Review**: PRs that decrease coverage require justification
3. **Focus Areas**: Priority for improvement is pandapage package (lowest coverage)

### TODO: Coverage Thresholds

Currently disabled due to bun test runner bugs where even thresholds well below actual coverage cause failures. 

Target thresholds when re-enabled:
- Parser: 70% functions, 80% lines
- Renderer Markdown: 80% functions, 70% lines  
- Renderer DOM: 75% functions, 75% lines
- Pandapage: 45% functions, 35% lines

## Areas Needing Coverage

### Pandapage Package (Priority)
- XML parsing utilities (16.22% line coverage)
- Document parsers (7.38% line coverage)
- DOCX reader (13.31% line coverage)
- Form field parsing (10.65% line coverage)
- Table parsing (5.34% line coverage)

### All Packages
- Error handling paths
- Edge cases in document processing
- Complex formatting scenarios
- Worker functionality

## Precommit Checks

Coverage tests run automatically on commit via:
```bash
bun run precommit  # includes lint, typecheck, and test:coverage
```