# Project Guidelines for Claude

## Testing Policy

**IMPORTANT: Unit tests must use synthetic data**

- All unit tests should use in-memory synthetic data instead of reading real files from disk
- Never extract or read actual DOCX/PPTX files in tests (e.g., avoid reading from `documents/005.docx`)
- This ensures tests are:
  - Deterministic and reproducible
  - Fast and don't depend on external files
  - Don't create temporary extraction directories (like `temp-005/`)
- Use mock data structures that simulate the expected format
- For integration tests that need real files, explicitly mark them as integration tests

## Styling Policy

**IMPORTANT: Document Rendering Must Use Inline Styles**

- When rendering document content (pages, text, tables, etc.), always use inline styles based on the parsed document properties
- Tailwind CSS classes should ONLY be used for the viewer "chrome" (toolbar, buttons, navigation, etc.)
- Never use Tailwind classes like `font-bold`, `text-4xl`, `mb-4` for rendering document content
- All document styling should come from the document's own properties (fontSize, color, spacing, etc.)
- Use the style utility functions to convert document properties to CSS styles

## View Modes

### Read Mode
- Converts documents to Markdown format
- Renders using `marked` library for simplified, continuous reading experience
- No pagination - content flows naturally
- Optimized for reading comprehension and accessibility
- Should always use markdown conversion regardless of document type

### View Mode (Print Preview)
- Shows paginated view with visual fidelity
- Maintains original document formatting and styling
- Splits content into pages that match print output
- Shows page indicators and allows page-by-page navigation
- Uses DOM rendering for DOCX files to preserve formatting

## Test Coverage Policy

**IMPORTANT: Never disable coverage testing or threshold checking.**

- Coverage must always remain enabled in all `bunfig.toml` files
- Coverage thresholds must never be lowered or disabled
- If tests fail due to coverage, add more tests - don't adjust thresholds
- Each package must maintain or improve its coverage levels

## Current Coverage Baselines (Must Not Go Below)

- Parser: 73% functions, 84% lines
- Renderer Markdown: 82% functions, 72% lines  
- Renderer DOM: 78% functions, 77% lines
- Core: 47% functions, 38% lines (priority for improvement)

## Areas Needing Coverage Improvement

### Core Package (Priority - Currently 38.84% line coverage)
1. XML parsing utilities (16.22% coverage) - `src/common/xml-parser.ts`
2. Document parsers (7.38% coverage) - `src/formats/docx/document-parser.ts`
3. DOCX reader (13.31% coverage) - `src/formats/docx/docx-reader.ts`
4. Form field parsing (10.65% coverage) - `src/formats/docx/form-field-parser.ts`
5. Table parsing (5.34% coverage) - `src/formats/docx/table-parser.ts`
6. Validation (13.21% coverage) - `src/formats/docx/validation.ts`
7. PPTX reader (6.83% coverage) - `src/formats/pptx/pptx-reader.ts`

## Testing Best Practices

1. Write tests for both success and error paths
2. Test edge cases and boundary conditions
3. Mock external dependencies appropriately
4. Ensure tests are deterministic and fast
5. Focus on testing public APIs and critical paths
6. Add integration tests for complex workflows

## Document Analysis Policy

**IMPORTANT: When analyzing DOCX/PPTX files, use temporary directories**

- When using analyze scripts to extract and examine document contents, always extract to a temporary directory (e.g., `/tmp/` or `temp-*`)
- Never commit extracted document assets/artifacts to the repository
- Extracted files should be treated as temporary analysis artifacts
- Use patterns like `*_extracted/` in `.gitignore` to prevent accidental commits
- Clean up temporary extraction directories after analysis

## OOXML Types Usage Policy

**IMPORTANT: Always use OOXML types from @browser-document-viewer/ooxml-types package**

When working with DOCX, PPTX, or any OOXML-related functionality:

- Import and use types from `@browser-document-viewer/ooxml-types` package
- These types are derived directly from the official OOXML schema
- Examples: `ST_Underline`, `ST_Jc`, `ST_HighlightColor`, `ST_VerticalAlignRun`, etc.
- Never hardcode string literals for OOXML values - use the typed constants
- This ensures type safety, better IDE support, and schema compliance
- When adding new OOXML features, check if types already exist before creating custom ones

Examples of correct usage:
```typescript
import { ST_Underline, ST_Jc, ST_HighlightColor } from "@browser-document-viewer/ooxml-types";

// Correct - using typed constants
alignment: ST_Jc.Center
underline: ST_Underline.Single
highlightColor: ST_HighlightColor.Yellow

// Incorrect - hardcoded strings
alignment: "center"
underline: "single"  
highlightColor: "yellow"
```

## Git Hooks Policy

**IMPORTANT: Never bypass git hooks under any circumstances.**

- Never skip pre-commit hooks
- Never skip pre-push hooks  
- Never use the `--no-verify` flag with git commands
- No exceptions to these rules

Git hooks exist to maintain code quality, run tests, and enforce standards. Bypassing them can introduce bugs, security vulnerabilities, and inconsistent code formatting into the repository.

## Commit and PR Guidelines

When creating commits and pull requests:
- Keep messages modest, reasonable, and concise
- Be as detailed as needed but avoid being verbose
- Don't include implementation plans in PR descriptions
- Focus on what changed and why, not how
- Make messages easy to read and understand

## Code Quality Standards

### Security Requirements
- **No sensitive data in commits**: Ensure API keys, passwords, tokens, and other sensitive data are never committed
- All sensitive configuration should use environment variables
- `.env` files must be in `.gitignore`

### Quality Gates (Enforced in Pre-commit and Pre-push Hooks)
1. **Linting**: All code must pass Biome linting rules
2. **Type Checking**: All TypeScript code must pass type checking with no errors
3. **Unit Tests**: All unit tests must pass
4. **Code Coverage**: Coverage thresholds must be met (see Test Coverage Policy above)
5. **File Size Check**: Large files are automatically flagged
6. **Type Assertions**: Avoid using `as` type assertions except for `as const` and `as unknown`

### TypeScript Configuration
- **Strict Mode**: Always enabled (`strict: true`)
- **No Implicit Any**: Explicitly set (`noImplicitAny: true`)
- All strict type checking flags are enabled via `strict: true`
- Note: `isolatedDeclarations` is not enabled due to bundler mode compatibility

### Code Formatting
- **Formatter**: Biome is configured for consistent code formatting
- Run `bun run format` to format all code
- Formatting is automatically checked in pre-commit hooks
- Configuration:
  - 2 spaces for indentation
  - 100 character line width
  - Double quotes for strings
  - Semicolons required
  - Trailing commas

### Pre-commit Hooks
The following checks run automatically before each commit:
1. File size validation
2. Linting (Biome)
3. TypeScript type checking across all packages
4. Unit test coverage enforcement
5. Type assertion checks (warning for non-allowed `as` usage)

### Pre-push Hooks
The following checks run before pushing to remote:
1. Linting
2. TypeScript type checking
3. Test coverage enforcement

### Playwright E2E Tests
- Located in `packages/viewer/e2e/`
- Run with `cd packages/viewer && bun run test:e2e`
- Ensure dev server is running before running E2E tests
- Tests cover critical user workflows and UI interactions