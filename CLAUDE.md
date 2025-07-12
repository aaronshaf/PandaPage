# Project Guidelines for Claude

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