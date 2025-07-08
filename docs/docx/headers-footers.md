# Headers and Footers in DOCX

## Overview

Headers and footers in DOCX are stored as separate XML files and can vary by section, page type (first, odd, even), and document section. Understanding their structure is essential for proper document rendering.

## File Structure

Headers and footers are stored in separate files:

```
word/
├── header1.xml     # First header
├── header2.xml     # Default header
├── header3.xml     # Even page header
├── footer1.xml     # First footer
├── footer2.xml     # Default footer
├── footer3.xml     # Even page footer
└── _rels/
    └── document.xml.rels  # Relationships
```

## Relationship Definitions

In `document.xml`, headers/footers are referenced in section properties:

```xml
<w:sectPr>
    <!-- Headers -->
    <w:headerReference w:type="first" r:id="rId4"/>
    <w:headerReference w:type="default" r:id="rId5"/>
    <w:headerReference w:type="even" r:id="rId6"/>
    
    <!-- Footers -->
    <w:footerReference w:type="first" r:id="rId7"/>
    <w:footerReference w:type="default" r:id="rId8"/>
    <w:footerReference w:type="even" r:id="rId9"/>
    
    <!-- Page setup -->
    <w:pgSz w:w="12240" w:h="15840"/>
    <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" 
             w:header="720" w:footer="720"/>
</w:sectPr>
```

## Header/Footer Types

### Type Attributes

1. **default** - Used for all pages unless overridden
2. **first** - Used for the first page of the section
3. **even** - Used for even-numbered pages

### Section Settings

```xml
<w:sectPr>
    <!-- Enable different first page -->
    <w:titlePg/>
    
    <!-- Enable different odd/even pages -->
    <w:evenAndOddHeaders/>
</w:sectPr>
```

## Header/Footer Structure

### Basic Structure

```xml
<!-- header1.xml -->
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:p>
        <w:pPr>
            <w:pStyle w:val="Header"/>
        </w:pPr>
        <w:r>
            <w:t>Document Title</w:t>
        </w:r>
    </w:p>
</w:hdr>

<!-- footer1.xml -->
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:p>
        <w:pPr>
            <w:pStyle w:val="Footer"/>
        </w:pPr>
        <w:r>
            <w:t>Page </w:t>
        </w:r>
        <w:r>
            <w:fldChar w:fldCharType="begin"/>
        </w:r>
        <w:r>
            <w:instrText> PAGE </w:instrText>
        </w:r>
        <w:r>
            <w:fldChar w:fldCharType="end"/>
        </w:r>
    </w:p>
</w:ftr>
```

## Common Header/Footer Patterns

### Centered Page Numbers

```xml
<w:p>
    <w:pPr>
        <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
        <w:t>Page </w:t>
    </w:r>
    <w:r>
        <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
        <w:instrText> PAGE </w:instrText>
    </w:r>
    <w:r>
        <w:fldChar w:fldCharType="separate"/>
    </w:r>
    <w:r>
        <w:t>1</w:t>
    </w:r>
    <w:r>
        <w:fldChar w:fldCharType="end"/>
    </w:r>
    <w:r>
        <w:t> of </w:t>
    </w:r>
    <w:r>
        <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
        <w:instrText> NUMPAGES </w:instrText>
    </w:r>
    <w:r>
        <w:fldChar w:fldCharType="separate"/>
    </w:r>
    <w:r>
        <w:t>10</w:t>
    </w:r>
    <w:r>
        <w:fldChar w:fldCharType="end"/>
    </w:r>
</w:p>
```

### Left-Right Alignment

Using tabs for alignment:

```xml
<w:p>
    <w:pPr>
        <w:tabs>
            <w:tab w:val="center" w:pos="4320"/>
            <w:tab w:val="right" w:pos="8640"/>
        </w:tabs>
    </w:pPr>
    <!-- Left aligned -->
    <w:r>
        <w:t>Company Name</w:t>
    </w:r>
    <!-- Tab to center -->
    <w:r>
        <w:tab/>
    </w:r>
    <!-- Center aligned -->
    <w:r>
        <w:t>Confidential</w:t>
    </w:r>
    <!-- Tab to right -->
    <w:r>
        <w:tab/>
    </w:r>
    <!-- Right aligned -->
    <w:r>
        <w:t>Page </w:t>
    </w:r>
    <w:r>
        <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
        <w:instrText> PAGE </w:instrText>
    </w:r>
    <w:r>
        <w:fldChar w:fldCharType="end"/>
    </w:r>
</w:p>
```

### Tables in Headers/Footers

```xml
<w:tbl>
    <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
            <w:top w:val="nil"/>
            <w:left w:val="nil"/>
            <w:bottom w:val="single" w:sz="4"/>
            <w:right w:val="nil"/>
        </w:tblBorders>
    </w:tblPr>
    <w:tblGrid>
        <w:gridCol w:w="4320"/>
        <w:gridCol w:w="4320"/>
    </w:tblGrid>
    <w:tr>
        <w:tc>
            <w:p>
                <w:r><w:t>Document Title</w:t></w:r>
            </w:p>
        </w:tc>
        <w:tc>
            <w:p>
                <w:pPr><w:jc w:val="right"/></w:pPr>
                <w:r><w:t>Version 1.0</w:t></w:r>
            </w:p>
        </w:tc>
    </w:tr>
</w:tbl>
```

## Multiple Sections

Documents can have multiple sections with different headers/footers:

```xml
<!-- First section -->
<w:p>
    <w:pPr>
        <w:sectPr>
            <w:headerReference w:type="default" r:id="rId4"/>
            <w:footerReference w:type="default" r:id="rId5"/>
        </w:sectPr>
    </w:pPr>
</w:p>

<!-- New section with different headers/footers -->
<w:p>
    <w:pPr>
        <w:sectPr>
            <w:headerReference w:type="default" r:id="rId6"/>
            <w:footerReference w:type="default" r:id="rId7"/>
        </w:sectPr>
    </w:pPr>
</w:p>
```

## Link to Previous

Sections can inherit headers/footers from previous sections:

```xml
<w:sectPr>
    <!-- No headerReference means use previous section's header -->
    <w:footerReference w:type="default" r:id="rId8"/>
</w:sectPr>
```

## Special Content

### Images in Headers/Footers

```xml
<w:p>
    <w:r>
        <w:drawing>
            <wp:inline>
                <wp:extent cx="1905000" cy="476250"/>
                <a:graphic>
                    <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                        <pic:pic>
                            <pic:blipFill>
                                <a:blip r:embed="rId10"/>
                            </pic:blipFill>
                        </pic:pic>
                    </a:graphicData>
                </a:graphic>
            </wp:inline>
        </w:drawing>
    </w:r>
</w:p>
```

### Watermarks

Watermarks are typically implemented as semi-transparent shapes in headers:

```xml
<w:p>
    <w:r>
        <w:pict>
            <v:shape type="#_x0000_t136" style="position:absolute;
                     margin-left:0;margin-top:0;width:415.5pt;height:207.75pt;
                     rotation:315;z-index:-251654144;mso-position-horizontal:center;
                     mso-position-horizontal-relative:margin;
                     mso-position-vertical:center;
                     mso-position-vertical-relative:margin">
                <v:textpath style="font-family:'Calibri';font-size:1pt" 
                           string="CONFIDENTIAL"/>
                <w10:wrap type="none"/>
                <w10:anchorlock/>
            </v:shape>
        </w:pict>
    </w:r>
</w:p>
```

## Parsing Considerations

### Resolution Order

1. Check if section has specific header/footer reference
2. If not, use previous section's header/footer
3. Apply first/even/odd logic based on page number
4. Fall back to default if specific type not found

### Page Number Context

Headers/footers need context for field evaluation:

```javascript
const context = {
    currentPage: pageNumber,
    totalPages: documentPages,
    sectionPage: sectionPageNumber,
    sectionPages: sectionTotalPages,
    isFirstPage: pageNumber === 1,
    isEvenPage: pageNumber % 2 === 0,
    isFirstPageOfSection: sectionPageNumber === 1
};
```

### Distance from Edge

```xml
<w:pgMar w:top="1440"      <!-- Page top margin -->
         w:header="720"     <!-- Header distance from top -->
         w:bottom="1440"    <!-- Page bottom margin -->
         w:footer="720"/>   <!-- Footer distance from bottom -->
```

## Implementation Strategy

### Basic Algorithm

1. **Parse Section Properties**: Extract header/footer references
2. **Load Header/Footer Files**: Based on relationships
3. **Determine Type**: Based on page number and settings
4. **Parse Content**: Like regular document content
5. **Evaluate Fields**: With appropriate page context
6. **Position Content**: Based on margins and distances

### Caching Strategy

```javascript
class HeaderFooterCache {
    constructor() {
        this.headers = new Map();
        this.footers = new Map();
    }
    
    getHeader(sectionIndex, pageType) {
        const key = `${sectionIndex}-${pageType}`;
        return this.headers.get(key);
    }
    
    getFooter(sectionIndex, pageType) {
        const key = `${sectionIndex}-${pageType}`;
        return this.footers.get(key);
    }
}
```

## Common Issues

1. **Missing References**: Header/footer file referenced but missing
2. **Type Confusion**: Wrong header/footer for page type
3. **Section Inheritance**: Not properly inheriting from previous section
4. **Field Context**: Incorrect page numbers in fields
5. **Positioning**: Headers/footers overlapping with content

## Best Practices

1. **Cache Parsed Content**: Don't reparse for every page
2. **Lazy Loading**: Load headers/footers only when needed
3. **Context Passing**: Provide complete context for field evaluation
4. **Error Handling**: Handle missing or corrupt header/footer files
5. **Performance**: Batch process similar headers/footers

## Layout Considerations

1. **Reserved Space**: Account for header/footer height
2. **Content Overflow**: Handle headers/footers that exceed margins
3. **Dynamic Height**: Some headers/footers vary in height
4. **Page Breaks**: Headers/footers don't break across pages
5. **Z-Order**: Headers/footers typically behind main content