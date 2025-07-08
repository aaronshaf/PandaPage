# Tables in DOCX

## Table Structure Overview

Tables in DOCX follow a hierarchical structure similar to HTML but with more complex property inheritance and styling options.

## Basic Table Structure

```xml
<w:tbl>
    <!-- Table Properties -->
    <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>  <!-- Width -->
        <w:tblBorders>...</w:tblBorders>    <!-- Borders -->
        <w:tblLook w:val="04A0"/>          <!-- Conditional formatting -->
    </w:tblPr>
    
    <!-- Table Grid (Column Definitions) -->
    <w:tblGrid>
        <w:gridCol w:w="2880"/>  <!-- Column 1: 2 inches -->
        <w:gridCol w:w="2880"/>  <!-- Column 2: 2 inches -->
        <w:gridCol w:w="2880"/>  <!-- Column 3: 2 inches -->
    </w:tblGrid>
    
    <!-- Table Rows -->
    <w:tr>
        <w:trPr>  <!-- Row Properties -->
            <w:trHeight w:val="500"/>
        </w:trPr>
        <w:tc>  <!-- Table Cell -->
            <w:tcPr>...</w:tcPr>  <!-- Cell Properties -->
            <w:p>...</w:p>        <!-- Cell Content -->
        </w:tc>
    </w:tr>
</w:tbl>
```

## Table Properties

### Table Width

```xml
<!-- Fixed width in twips -->
<w:tblW w:w="9000" w:type="dxa"/>  <!-- 6.25 inches -->

<!-- Percentage of page width -->
<w:tblW w:w="5000" w:type="pct"/>  <!-- 100% -->

<!-- Auto width -->
<w:tblW w:w="0" w:type="auto"/>
```

### Table Alignment

```xml
<w:tblPr>
    <!-- Left aligned (default) -->
    <w:jc w:val="left"/>
    
    <!-- Center aligned -->
    <w:jc w:val="center"/>
    
    <!-- Right aligned -->
    <w:jc w:val="right"/>
</w:tblPr>
```

### Table Indentation

```xml
<w:tblPr>
    <!-- Indent from left margin -->
    <w:tblInd w:w="720" w:type="dxa"/>  <!-- 0.5 inch -->
</w:tblPr>
```

## Table Borders

### Complete Border Definition

```xml
<w:tblBorders>
    <!-- Top border -->
    <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    
    <!-- Left border -->
    <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    
    <!-- Bottom border -->
    <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    
    <!-- Right border -->
    <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    
    <!-- Inside horizontal borders -->
    <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
    
    <!-- Inside vertical borders -->
    <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
</w:tblBorders>
```

### Border Styles

Common `w:val` values:
- `single` - Single line
- `double` - Double line
- `dotted` - Dotted line
- `dashed` - Dashed line
- `thick` - Thick line
- `nil` - No border

## Table Grid

The table grid defines the column structure:

```xml
<w:tblGrid>
    <w:gridCol w:w="2160"/>  <!-- 1.5 inches -->
    <w:gridCol w:w="2880"/>  <!-- 2.0 inches -->
    <w:gridCol w:w="1440"/>  <!-- 1.0 inch -->
</w:tblGrid>
```

## Row Properties

### Row Height

```xml
<w:trPr>
    <!-- Exact height -->
    <w:trHeight w:val="500" w:hRule="exact"/>
    
    <!-- Minimum height -->
    <w:trHeight w:val="500" w:hRule="atLeast"/>
    
    <!-- Auto height (default) -->
    <w:trHeight w:hRule="auto"/>
</w:trPr>
```

### Header Rows

```xml
<w:trPr>
    <!-- Repeat row at top of each page -->
    <w:tblHeader/>
</w:trPr>
```

### Row-Level Formatting

```xml
<w:trPr>
    <!-- Can't break across pages -->
    <w:cantSplit/>
    
    <!-- Hidden row -->
    <w:hidden/>
</w:trPr>
```

## Cell Properties

### Cell Width

```xml
<w:tcPr>
    <w:tcW w:w="2880" w:type="dxa"/>  <!-- Fixed width -->
    <w:tcW w:w="3333" w:type="pct"/>  <!-- 33.33% of table -->
    <w:tcW w:w="0" w:type="auto"/>    <!-- Auto width -->
</w:tcPr>
```

### Cell Margins

```xml
<w:tcPr>
    <w:tcMar>
        <w:top w:w="50" w:type="dxa"/>
        <w:left w:w="100" w:type="dxa"/>
        <w:bottom w:w="50" w:type="dxa"/>
        <w:right w:w="100" w:type="dxa"/>
    </w:tcMar>
</w:tcPr>
```

### Cell Borders

```xml
<w:tcPr>
    <w:tcBorders>
        <w:top w:val="double" w:sz="4" w:color="FF0000"/>
        <w:left w:val="nil"/>  <!-- No left border -->
        <!-- etc. -->
    </w:tcBorders>
</w:tcPr>
```

### Cell Shading

```xml
<w:tcPr>
    <w:shd w:val="clear" w:color="auto" w:fill="FFFF00"/>  <!-- Yellow background -->
</w:tcPr>
```

### Vertical Alignment

```xml
<w:tcPr>
    <w:vAlign w:val="top"/>     <!-- Top (default) -->
    <w:vAlign w:val="center"/>  <!-- Center -->
    <w:vAlign w:val="bottom"/>  <!-- Bottom -->
</w:tcPr>
```

## Cell Spanning

### Horizontal Span (Colspan)

```xml
<w:tc>
    <w:tcPr>
        <w:gridSpan w:val="3"/>  <!-- Span 3 columns -->
    </w:tcPr>
    <w:p><w:r><w:t>Spans three columns</w:t></w:r></w:p>
</w:tc>
```

### Vertical Merge (Rowspan)

```xml
<!-- First cell (start of merge) -->
<w:tc>
    <w:tcPr>
        <w:vMerge w:val="restart"/>
    </w:tcPr>
    <w:p><w:r><w:t>Merged cell</w:t></w:r></w:p>
</w:tc>

<!-- Subsequent cells (continuation) -->
<w:tc>
    <w:tcPr>
        <w:vMerge/>  <!-- Continue merge -->
    </w:tcPr>
    <w:p/>  <!-- Usually empty -->
</w:tc>
```

## Complex Table Example

```xml
<w:tbl>
    <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
            <w:top w:val="single" w:sz="4"/>
            <w:left w:val="single" w:sz="4"/>
            <w:bottom w:val="single" w:sz="4"/>
            <w:right w:val="single" w:sz="4"/>
            <w:insideH w:val="single" w:sz="4"/>
            <w:insideV w:val="single" w:sz="4"/>
        </w:tblBorders>
    </w:tblPr>
    
    <w:tblGrid>
        <w:gridCol w:w="2880"/>
        <w:gridCol w:w="2880"/>
        <w:gridCol w:w="2880"/>
    </w:tblGrid>
    
    <!-- Header row -->
    <w:tr>
        <w:trPr>
            <w:tblHeader/>
        </w:trPr>
        <w:tc>
            <w:tcPr>
                <w:shd w:val="clear" w:fill="4472C4"/>
            </w:tcPr>
            <w:p>
                <w:r>
                    <w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr>
                    <w:t>Header 1</w:t>
                </w:r>
            </w:p>
        </w:tc>
        <w:tc>
            <w:tcPr>
                <w:gridSpan w:val="2"/>
                <w:shd w:val="clear" w:fill="4472C4"/>
            </w:tcPr>
            <w:p>
                <w:pPr><w:jc w:val="center"/></w:pPr>
                <w:r>
                    <w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr>
                    <w:t>Merged Header</w:t>
                </w:r>
            </w:p>
        </w:tc>
    </w:tr>
    
    <!-- Data rows -->
    <w:tr>
        <w:tc>
            <w:tcPr>
                <w:vMerge w:val="restart"/>
            </w:tcPr>
            <w:p><w:r><w:t>Vertical merge</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
            <w:p><w:r><w:t>Data 1</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
            <w:p><w:r><w:t>Data 2</w:t></w:r></w:p>
        </w:tc>
    </w:tr>
</w:tbl>
```

## Table Styles

Tables can reference predefined styles:

```xml
<w:tblPr>
    <w:tblStyle w:val="TableGrid"/>
    <w:tblLook w:val="04A0" 
               w:firstRow="1" 
               w:lastRow="0" 
               w:firstColumn="1" 
               w:lastColumn="0" 
               w:noHBand="0" 
               w:noVBand="1"/>
</w:tblPr>
```

### Table Look Flags

The `tblLook` attribute controls conditional formatting:
- `firstRow` - Apply first row formatting
- `lastRow` - Apply last row formatting
- `firstColumn` - Apply first column formatting
- `lastColumn` - Apply last column formatting
- `noHBand` - Don't apply horizontal banding
- `noVBand` - Don't apply vertical banding

## Nested Tables

Tables can be nested inside cells:

```xml
<w:tc>
    <w:tbl>
        <!-- Nested table structure -->
    </w:tbl>
</w:tc>
```

## Cell Content

Cells can contain any block-level content:

```xml
<w:tc>
    <!-- Multiple paragraphs -->
    <w:p><w:r><w:t>First paragraph</w:t></w:r></w:p>
    <w:p><w:r><w:t>Second paragraph</w:t></w:r></w:p>
    
    <!-- Lists -->
    <w:p>
        <w:pPr>
            <w:numPr>
                <w:ilvl w:val="0"/>
                <w:numId w:val="1"/>
            </w:numPr>
        </w:pPr>
        <w:r><w:t>List item</w:t></w:r>
    </w:p>
    
    <!-- Images -->
    <w:p>
        <w:r>
            <w:drawing>...</w:drawing>
        </w:r>
    </w:p>
</w:tc>
```

## Parsing Considerations

1. **Grid Consistency**: Number of cells must match grid columns (accounting for spans)
2. **Merge Validation**: Vertical merges must be properly continued
3. **Width Calculation**: Different width types require different calculations
4. **Border Inheritance**: Cell borders override table borders
5. **Property Cascading**: Table → Row → Cell property inheritance

## Common Issues

1. **Column Mismatch**: Cells don't match grid definition
2. **Invalid Merges**: Vertical merge without restart
3. **Width Conflicts**: Sum of column widths exceeds table width
4. **Missing Cells**: Rows with fewer cells than columns
5. **Span Overflow**: Cell spans exceeding available columns

## Layout Algorithm Considerations

1. **Auto Width**: Calculate based on content when width is auto
2. **Fixed Layout**: Respect fixed widths even if content overflows
3. **Percentage Widths**: Calculate relative to table/page width
4. **Minimum Widths**: Content may force cells wider than specified
5. **Border Spacing**: Account for border widths in calculations

## Performance Tips

1. **Cache Calculations**: Don't recalculate column widths for each row
2. **Lazy Rendering**: Render visible rows first in large tables
3. **Reuse Styles**: Cache resolved table/cell styles
4. **Batch Operations**: Process similar cells together
5. **Early Validation**: Validate structure before rendering