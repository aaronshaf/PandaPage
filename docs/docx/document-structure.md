# DOCX Document Structure

## XML Structure Deep Dive

### Minimal Document Structure

The absolute minimum viable DOCX document contains:

```xml
<!-- [Content_Types].xml -->
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
   <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
   <Default Extension="xml" ContentType="application/xml"/>
   <Override PartName="/word/document.xml"
             ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>

<!-- _rels/.rels -->
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
   <Relationship Id="rId1" 
                 Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
                 Target="word/document.xml"/>
</Relationships>

<!-- word/document.xml -->
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
   <w:body>
       <w:p>
           <w:r>
               <w:t>Hello World</w:t>
           </w:r>
       </w:p>
   </w:body>
</w:document>
```

### Document.xml Structure

The main document follows this hierarchy:

```xml
<w:document>
    <w:body>
        <!-- Content elements -->
        <w:p>...</w:p>           <!-- Paragraphs -->
        <w:tbl>...</w:tbl>       <!-- Tables -->
        
        <!-- Section properties (last element) -->
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>  <!-- Page size -->
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/> <!-- Margins -->
        </w:sectPr>
    </w:body>
</w:document>
```

## Paragraph Structure

### Basic Paragraph

```xml
<w:p>
    <!-- Paragraph properties (optional) -->
    <w:pPr>
        <w:pStyle w:val="Heading1"/>        <!-- Style reference -->
        <w:jc w:val="center"/>              <!-- Alignment -->
        <w:spacing w:before="240" w:after="120"/> <!-- Spacing -->
    </w:pPr>
    
    <!-- Runs containing text -->
    <w:r>
        <w:rPr>
            <w:b/>                          <!-- Bold -->
            <w:i/>                          <!-- Italic -->
            <w:sz w:val="24"/>              <!-- Font size (half-points) -->
            <w:color w:val="FF0000"/>       <!-- Font color -->
        </w:rPr>
        <w:t>This is text</w:t>
    </w:r>
</w:p>
```

### Paragraph Properties

Common paragraph properties (`<w:pPr>`):

| Element | Purpose | Values |
|---------|---------|--------|
| `<w:jc>` | Alignment | left, center, right, both |
| `<w:spacing>` | Paragraph spacing | before, after, line attributes |
| `<w:ind>` | Indentation | left, right, firstLine, hanging |
| `<w:pStyle>` | Style reference | Style ID from styles.xml |
| `<w:numPr>` | Numbering/bullets | References numbering.xml |
| `<w:pBdr>` | Paragraph borders | top, bottom, left, right |
| `<w:shd>` | Background shading | fill color, pattern |

### Run Properties

Common run properties (`<w:rPr>`):

| Element | Purpose | Notes |
|---------|---------|-------|
| `<w:b/>` | Bold | Toggle property |
| `<w:i/>` | Italic | Toggle property |
| `<w:u>` | Underline | w:val attribute for style |
| `<w:strike/>` | Strikethrough | |
| `<w:sz>` | Font size | In half-points (24 = 12pt) |
| `<w:color>` | Text color | Hex RGB value |
| `<w:rFonts>` | Font family | ascii, hAnsi, cs, eastAsia |
| `<w:vertAlign>` | Superscript/subscript | superscript, subscript |
| `<w:highlight>` | Highlight color | yellow, green, blue, etc. |

## Table Structure

### Basic Table

```xml
<w:tbl>
    <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>   <!-- Width: 100% -->
        <w:tblBorders>                      <!-- Table borders -->
            <w:top w:val="single" w:sz="4"/>
            <w:left w:val="single" w:sz="4"/>
            <w:bottom w:val="single" w:sz="4"/>
            <w:right w:val="single" w:sz="4"/>
        </w:tblBorders>
    </w:tblPr>
    
    <w:tblGrid>
        <w:gridCol w:w="2880"/>             <!-- Column 1 width -->
        <w:gridCol w:w="2880"/>             <!-- Column 2 width -->
    </w:tblGrid>
    
    <w:tr>                                  <!-- Table row -->
        <w:tc>                              <!-- Table cell -->
            <w:tcPr>
                <w:tcW w:w="2880" w:type="dxa"/>
            </w:tcPr>
            <w:p>
                <w:r><w:t>Cell 1</w:t></w:r>
            </w:p>
        </w:tc>
        <w:tc>
            <w:p>
                <w:r><w:t>Cell 2</w:t></w:r>
            </w:p>
        </w:tc>
    </w:tr>
</w:tbl>
```

### Cell Spanning

```xml
<!-- Horizontal span (colspan) -->
<w:tc>
    <w:tcPr>
        <w:gridSpan w:val="2"/>
    </w:tcPr>
    <w:p><w:r><w:t>Spans 2 columns</w:t></w:r></w:p>
</w:tc>

<!-- Vertical merge -->
<w:tc>
    <w:tcPr>
        <w:vMerge w:val="restart"/>  <!-- First cell -->
    </w:tcPr>
</w:tc>
<w:tc>
    <w:tcPr>
        <w:vMerge/>                  <!-- Continued cell -->
    </w:tcPr>
</w:tc>
```

## Section Properties

Sections define page layout:

```xml
<w:sectPr>
    <!-- Page size (Letter: 8.5" x 11") -->
    <w:pgSz w:w="12240" w:h="15840" w:orient="portrait"/>
    
    <!-- Margins (1 inch = 1440 twips) -->
    <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" 
             w:header="720" w:footer="720" w:gutter="0"/>
    
    <!-- Headers/Footers -->
    <w:headerReference w:type="default" r:id="rId4"/>
    <w:footerReference w:type="first" r:id="rId5"/>
    <w:footerReference w:type="default" r:id="rId6"/>
    
    <!-- Page numbering -->
    <w:pgNumType w:start="1"/>
    
    <!-- Columns -->
    <w:cols w:space="720" w:num="2"/>
</w:sectPr>
```

## Special Elements

### Page Breaks

```xml
<!-- Simple page break -->
<w:p>
    <w:r>
        <w:br w:type="page"/>
    </w:r>
</w:p>
```

### Images (Inline)

```xml
<w:drawing>
    <wp:inline>
        <wp:extent cx="2286000" cy="1714500"/>  <!-- Size in EMUs -->
        <a:graphic>
            <a:graphicData>
                <pic:pic>
                    <pic:blipFill>
                        <a:blip r:embed="rId4"/>  <!-- Reference to image -->
                    </pic:blipFill>
                </pic:pic>
            </a:graphicData>
        </a:graphic>
    </wp:inline>
</w:drawing>
```

### Hyperlinks

```xml
<w:hyperlink r:id="rId7">
    <w:r>
        <w:rPr>
            <w:rStyle w:val="Hyperlink"/>
        </w:rPr>
        <w:t>Click here</w:t>
    </w:r>
</w:hyperlink>
```

### Field Codes

```xml
<!-- Page number field -->
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
    <w:t>1</w:t>  <!-- Current value -->
</w:r>
<w:r>
    <w:fldChar w:fldCharType="end"/>
</w:r>
```

### Structured Document Tags (Content Controls)

```xml
<w:sdt>
    <w:sdtPr>
        <w:alias w:val="Customer Name"/>
        <w:tag w:val="CustomerName"/>
    </w:sdtPr>
    <w:sdtContent>
        <w:p>
            <w:r>
                <w:t>John Doe</w:t>
            </w:r>
        </w:p>
    </w:sdtContent>
</w:sdt>
```

## Important Attributes

### The `rsid` Attributes

Attributes like `w:rsidR`, `w:rsidRPr`, `w:rsidRDefault` are revision identifiers used by Word for tracking changes. They can generally be ignored when parsing.

### The `xml:space` Attribute

```xml
<w:t xml:space="preserve"> text with spaces </w:t>
```

The `xml:space="preserve"` attribute ensures whitespace is preserved. Without it, leading and trailing spaces may be trimmed.

## Parsing Considerations

1. **Order Matters**: Elements must appear in specific order within their parent
2. **Empty Elements**: Empty paragraphs still need `<w:p/>` tags
3. **Namespace Awareness**: Always use namespace-aware XML parsing
4. **Default Values**: Many properties have defaults when not specified
5. **Relationship Resolution**: Always validate relationships exist before using them

## Common Pitfalls

1. **Missing Relationships**: Referenced resources must exist in relationship files
2. **Invalid Structure**: Elements out of order will cause Word to reject the file
3. **Unit Confusion**: Different elements use different units (twips, EMUs, points)
4. **Toggle Properties**: Remember bold/italic use XOR logic with inherited styles
5. **Complex Scripts**: Different properties for different script types