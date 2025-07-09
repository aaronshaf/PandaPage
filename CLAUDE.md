# Project Guidelines for Claude

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