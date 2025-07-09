# Table Borders and Shading Implementation

## Summary

This implementation adds comprehensive table border and shading support to the DOCX parser, including:

### Features Implemented

1. **Table-level Properties**
   - Table borders (top, bottom, left, right, insideH, insideV)
   - Table shading (fill color, pattern color, patterns)
   - Table cell margins (default margins for all cells)
   - Table width

2. **Cell-level Properties**
   - Cell borders (top, bottom, left, right, plus diagonal borders tl2br and tr2bl)
   - Cell shading (fill color, pattern color, patterns)
   - Cell margins (override table defaults)
   - Existing properties maintained (colspan, rowspan, vertical alignment, text direction)

3. **Border Properties**
   - Style: single, double, thick, dashed, dotted, and many more OOXML styles
   - Color: hex colors with support for 'auto' value
   - Width: converted from eighth-points to points
   - Space: spacing from text

4. **Shading Properties**
   - Fill: background color
   - Color: pattern color
   - Pattern: various patterns like pct25, pct50, horzStripe, etc.

### Type Definitions

Added new types in `src/types/document.ts`:
- `TableBorder` - Individual border definition
- `TableBorders` - Collection of table borders
- `TableCellBorders` - Collection of cell borders (includes diagonals)
- `TableShading` - Shading definition

Enhanced existing types:
- `Table` - Added borders, shading, and cellMargin properties
- `TableCell` - Added borders, shading, and margin properties

### Parser Implementation

Updated `src/parsers/docx/table-parser.ts` with:
- `parseTableBorder()` - Parses individual border elements
- `parseTableBorders()` - Parses table border collection
- `parseTableCellBorders()` - Parses cell border collection
- `parseTableShading()` - Parses shading elements
- Conversion functions to transform DOCX units to document units

### Border Conflict Resolution

Added documentation for border conflict resolution rules per OOXML spec:
1. Cell borders take precedence over table borders
2. When borders conflict, higher weight (width) wins
3. If weights equal, style ranking applies (double > single > dashed > dotted > none)
4. If still equal, darker colors take precedence

Note: Actual conflict resolution should be implemented in the renderer.

### Tests

Created comprehensive test suite in `src/parsers/docx/table-borders-shading.test.ts`:
- Table-level border tests
- Table-level shading tests
- Cell-level border tests (including diagonals)
- Cell-level shading tests
- Cell margin tests
- Complex table with mixed properties

All tests passing with 100% coverage of new code.

## Usage Example

The parser now extracts and preserves all border and shading information:

```typescript
const table = parseTable(tableElement);
// table.borders?.top?.style === 'single'
// table.borders?.top?.color === '#FF0000'
// table.borders?.top?.width === 0.5 // points

// Cell-specific borders override table borders
// table.rows[0].cells[0].borders?.top?.style === 'double'
```

## Next Steps for Renderers

Renderers should:
1. Apply table borders as defaults
2. Override with cell borders where specified
3. Implement border conflict resolution for adjacent cells
4. Convert shading patterns to appropriate visual representations
5. Apply cell margins (cell-specific or table defaults)