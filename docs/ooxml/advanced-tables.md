# Advanced Table Features in DOCX

## Multi-Page Table Handling

Tables that span multiple pages require special handling for row splitting and cell continuation.

### Row Breaking Challenges

When tables span pages, complex scenarios arise:

1. **Partial Row Display**: Rows can start on one page and continue on the next
2. **Column Visibility**: Rows can start later than the first column and end before the last column
3. **Cell Content Split**: Individual cells may need to split across pages

### Grid Column Management

```typescript
interface TableRowSpan {
    gridColsBefore: number;  // Columns before this row starts
    gridColsAfter: number;   // Columns after this row ends
    effectiveColumns: number; // Actual columns in this row
}

class AdvancedTableParser {
    parseRowSpan(row: Element): TableRowSpan {
        const trPr = row.querySelector('w\\:trPr');
        
        // Parse grid columns before
        const gridBefore = trPr?.querySelector('w\\:gridBefore');
        const gridColsBefore = gridBefore ? 
            parseInt(gridBefore.getAttribute('w:val') || '0') : 0;
        
        // Parse grid columns after  
        const gridAfter = trPr?.querySelector('w\\:gridAfter');
        const gridColsAfter = gridAfter ? 
            parseInt(gridAfter.getAttribute('w:val') || '0') : 0;
        
        // Calculate effective columns
        const cells = row.querySelectorAll('w\\:tc');
        const effectiveColumns = Array.from(cells).reduce((sum, cell) => {
            const gridSpan = this.getCellGridSpan(cell);
            return sum + gridSpan;
        }, 0);
        
        return { gridColsBefore, gridColsAfter, effectiveColumns };
    }
}
```

### Row Properties for Page Breaking

```xml
<w:tr>
    <w:trPr>
        <!-- Row can't break across pages -->
        <w:cantSplit/>
        
        <!-- Repeat header row on each page -->
        <w:tblHeader/>
        
        <!-- Minimum height for row -->
        <w:trHeight w:val="2880" w:hRule="atLeast"/>
        
        <!-- Grid columns before/after -->
        <w:gridBefore w:val="1"/>
        <w:gridAfter w:val="2"/>
    </w:trPr>
    <!-- Cells -->
</w:tr>
```

## Cell Page Breaking

### Cell-Level Break Control

```typescript
class CellBreakHandler {
    canBreakCell(cell: TableCell, availableHeight: number): boolean {
        // Check if cell allows breaking
        if (cell.properties.noWrap) {
            return false;
        }
        
        // Check minimum content requirements
        const minHeight = this.calculateMinimumHeight(cell);
        if (minHeight > availableHeight) {
            return false;
        }
        
        // Check for keep-together constraints
        if (this.hasKeepTogetherConstraint(cell)) {
            return false;
        }
        
        return true;
    }
    
    splitCell(cell: TableCell, splitPoint: number): [TableCell, TableCell] {
        const topCell = { ...cell };
        const bottomCell = { ...cell };
        
        // Split paragraphs at appropriate point
        const splitIndex = this.findParagraphSplitPoint(cell.paragraphs, splitPoint);
        
        topCell.paragraphs = cell.paragraphs.slice(0, splitIndex);
        bottomCell.paragraphs = cell.paragraphs.slice(splitIndex);
        
        // Handle vertical merge
        if (cell.properties.vMerge === 'restart') {
            bottomCell.properties.vMerge = 'continue';
        }
        
        return [topCell, bottomCell];
    }
}
```

### Multi-Page Table Layout

```typescript
class MultiPageTableLayout {
    layoutTable(table: Table, pages: Page[]): TableLayout[] {
        const layouts: TableLayout[] = [];
        let currentPage = 0;
        let currentY = pages[currentPage].contentTop;
        
        for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
            const row = table.rows[rowIndex];
            const rowHeight = this.calculateRowHeight(row);
            
            // Check if row fits on current page
            const availableHeight = pages[currentPage].contentBottom - currentY;
            
            if (rowHeight <= availableHeight || !this.canSplitRow(row)) {
                // Row fits or can't be split
                layouts.push({
                    pageIndex: currentPage,
                    rowIndex,
                    y: currentY,
                    height: rowHeight,
                    split: false
                });
                
                currentY += rowHeight;
            } else {
                // Split row across pages
                const topHeight = availableHeight;
                const bottomHeight = rowHeight - topHeight;
                
                // Top part on current page
                layouts.push({
                    pageIndex: currentPage,
                    rowIndex,
                    y: currentY,
                    height: topHeight,
                    split: true,
                    splitPart: 'top'
                });
                
                // Move to next page
                currentPage++;
                currentY = pages[currentPage].contentTop;
                
                // Bottom part on next page
                layouts.push({
                    pageIndex: currentPage,
                    rowIndex,
                    y: currentY,
                    height: bottomHeight,
                    split: true,
                    splitPart: 'bottom'
                });
                
                currentY += bottomHeight;
            }
            
            // Check if we need to move to next page
            if (currentY >= pages[currentPage].contentBottom) {
                currentPage++;
                currentY = pages[currentPage].contentTop;
            }
        }
        
        return layouts;
    }
}
```

## Floating Tables

Tables can float like images with text wrapping:

```xml
<w:tbl>
    <w:tblPr>
        <w:tblpPr w:leftFromText="180" 
                  w:rightFromText="180" 
                  w:topFromText="180" 
                  w:bottomFromText="180" 
                  w:vertAnchor="page" 
                  w:horzAnchor="column" 
                  w:tblpX="1440" 
                  w:tblpY="1440"/>
    </w:tblPr>
    <!-- Table content -->
</w:tbl>
```

### Floating Table Properties

```typescript
interface FloatingTableProperties {
    // Anchoring
    verticalAnchor: 'margin' | 'page' | 'text';
    horizontalAnchor: 'margin' | 'page' | 'column' | 'text';
    
    // Position
    x: number;  // Absolute X position
    y: number;  // Absolute Y position
    
    // Relative position
    xAlign?: 'left' | 'center' | 'right' | 'inside' | 'outside';
    yAlign?: 'top' | 'center' | 'bottom' | 'inside' | 'outside';
    
    // Text distances
    leftFromText: number;
    rightFromText: number;
    topFromText: number;
    bottomFromText: number;
}
```

## Complex Cell Merging

### Irregular Merging Patterns

```typescript
class ComplexMergeHandler {
    validateMergePattern(table: Table): MergeValidation {
        const mergeMap = new Map<string, CellMergeInfo>();
        
        for (let rowIdx = 0; rowIdx < table.rows.length; rowIdx++) {
            let colIdx = 0;
            
            for (const cell of table.rows[rowIdx].cells) {
                // Handle vertical merge
                if (cell.properties.vMerge === 'restart') {
                    this.startVerticalMerge(mergeMap, rowIdx, colIdx, cell);
                } else if (cell.properties.vMerge === 'continue') {
                    this.continueVerticalMerge(mergeMap, rowIdx, colIdx);
                }
                
                // Handle horizontal span
                const gridSpan = cell.properties.gridSpan || 1;
                if (gridSpan > 1) {
                    this.recordHorizontalSpan(mergeMap, rowIdx, colIdx, gridSpan);
                }
                
                colIdx += gridSpan;
            }
        }
        
        return this.validateMergeConsistency(mergeMap);
    }
}
```

## Table Calculations

### Formula Support in Tables

DOCX tables can contain calculated fields:

```xml
<w:tc>
    <w:p>
        <w:r>
            <w:fldChar w:fldCharType="begin"/>
        </w:r>
        <w:r>
            <w:instrText> =SUM(ABOVE) </w:instrText>
        </w:r>
        <w:r>
            <w:fldChar w:fldCharType="end"/>
        </w:r>
    </w:p>
</w:tc>
```

### Table Calculation Engine

```typescript
class TableCalculator {
    private formulas = new Map<string, FormulaFunction>([
        ['SUM', this.sum],
        ['AVERAGE', this.average],
        ['COUNT', this.count],
        ['MAX', this.max],
        ['MIN', this.min],
        ['PRODUCT', this.product]
    ]);
    
    calculateField(instruction: string, cell: CellPosition, table: Table): number {
        const match = instruction.match(/=(\w+)\((.*)\)/);
        if (!match) return 0;
        
        const [, func, args] = match;
        const formula = this.formulas.get(func);
        if (!formula) return 0;
        
        const range = this.parseRange(args, cell, table);
        const values = this.extractValues(range, table);
        
        return formula(values);
    }
    
    private parseRange(args: string, currentCell: CellPosition, table: Table): CellRange {
        switch (args.toUpperCase()) {
            case 'ABOVE':
                return {
                    startRow: 0,
                    endRow: currentCell.row - 1,
                    startCol: currentCell.col,
                    endCol: currentCell.col
                };
            case 'LEFT':
                return {
                    startRow: currentCell.row,
                    endRow: currentCell.row,
                    startCol: 0,
                    endCol: currentCell.col - 1
                };
            case 'BELOW':
                return {
                    startRow: currentCell.row + 1,
                    endRow: table.rows.length - 1,
                    startCol: currentCell.col,
                    endCol: currentCell.col
                };
            default:
                // Parse explicit range like "A1:B3"
                return this.parseExplicitRange(args);
        }
    }
}
```

## Nested Tables

### Nested Table Considerations

```typescript
class NestedTableHandler {
    private maxNestingLevel = 5;
    
    parseNestedTable(cell: Element, nestingLevel: number = 0): Table | null {
        if (nestingLevel >= this.maxNestingLevel) {
            console.warn('Maximum nesting level reached');
            return null;
        }
        
        const nestedTable = cell.querySelector('w\\:tbl');
        if (!nestedTable) return null;
        
        // Parse with modified context
        const table = this.parseTable(nestedTable, {
            nestingLevel: nestingLevel + 1,
            parentCellWidth: this.getCellWidth(cell),
            inheritedProperties: this.getInheritedProperties(cell)
        });
        
        return table;
    }
    
    calculateNestedLayout(
        parentCell: LayoutCell, 
        nestedTable: Table
    ): NestedTableLayout {
        // Account for cell padding
        const availableWidth = parentCell.innerWidth;
        const availableHeight = parentCell.innerHeight;
        
        // Nested table can't exceed parent cell
        const layout = this.layoutTable(nestedTable, {
            maxWidth: availableWidth,
            maxHeight: availableHeight,
            allowOverflow: false
        });
        
        return layout;
    }
}
```

## Performance Optimization for Large Tables

### Virtual Table Rendering

```typescript
class VirtualTableRenderer {
    private visibleRows = new Map<number, RenderedRow>();
    private rowHeights = new Map<number, number>();
    
    renderVisibleRows(
        table: Table, 
        viewport: Viewport
    ): void {
        const firstVisible = this.findFirstVisibleRow(viewport.top);
        const lastVisible = this.findLastVisibleRow(viewport.bottom);
        
        // Render only visible rows
        for (let i = firstVisible; i <= lastVisible; i++) {
            if (!this.visibleRows.has(i)) {
                const row = this.renderRow(table.rows[i], i);
                this.visibleRows.set(i, row);
            }
        }
        
        // Clean up off-screen rows
        for (const [rowIndex, row] of this.visibleRows) {
            if (rowIndex < firstVisible - 10 || rowIndex > lastVisible + 10) {
                this.cleanupRow(row);
                this.visibleRows.delete(rowIndex);
            }
        }
    }
}
```

## Edge Cases and Solutions

### 1. Zero-Width Columns

```typescript
function handleZeroWidthColumns(table: Table): void {
    const minColumnWidth = 100; // Minimum twips
    
    table.grid.forEach((width, index) => {
        if (width === 0) {
            // Calculate from cell contents
            const contentWidth = calculateColumnContentWidth(table, index);
            table.grid[index] = Math.max(contentWidth, minColumnWidth);
        }
    });
}
```

### 2. Overlapping Cells

When cell spans create conflicts:

```typescript
class CellOverlapResolver {
    resolveOverlaps(table: Table): void {
        const cellMap = this.buildCellMap(table);
        const conflicts = this.findConflicts(cellMap);
        
        for (const conflict of conflicts) {
            // Prioritize cells by:
            // 1. Explicit vMerge/gridSpan
            // 2. Content presence
            // 3. Declaration order
            this.resolveConflict(conflict, cellMap);
        }
    }
}
```

### 3. Table Direction (RTL)

```xml
<w:tblPr>
    <w:bidiVisual/>  <!-- Right-to-left table -->
</w:tblPr>
```

```typescript
class RTLTableHandler {
    adjustForRTL(table: Table): void {
        if (table.properties.bidiVisual) {
            // Reverse column order
            table.grid.reverse();
            
            // Reverse cells in each row
            table.rows.forEach(row => {
                row.cells.reverse();
            });
            
            // Adjust cell properties
            this.adjustCellPropertiesForRTL(table);
        }
    }
}
```

## Best Practices

1. **Validate Structure**: Check grid consistency before rendering
2. **Handle Edge Cases**: Plan for zero-width, overlapping, and nested scenarios
3. **Optimize Large Tables**: Use virtual rendering for performance
4. **Test Page Breaks**: Ensure correct splitting behavior
5. **Support Calculations**: Implement basic formula evaluation
6. **Cache Layouts**: Reuse calculated dimensions when possible