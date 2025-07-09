# wml.xsd

Documentation for the `wml.xsd` schema.

## WordprocessingML Schema (wml.xsd)

### Document Structure Hierarchy

The WordprocessingML schema defines a precise document hierarchy based on the official OOXML specification:

```
CT_Document (root element: w:document)
├── CT_Body (w:body)
    ├── EG_BlockLevelElts (block-level content group)
    │   ├── EG_ContentBlockContent
    │   │   ├── CT_P (w:p) - Paragraphs
    │   │   ├── CT_Tbl (w:tbl) - Tables  
    │   │   ├── CT_CustomXmlBlock - Custom XML
    │   │   └── CT_SdtBlock - Structured document tags
    │   └── CT_AltChunk (w:altChunk) - Alternative content
    └── CT_SectPr (w:sectPr) - Section properties
```

### Paragraph Structure (CT_P)

Paragraphs follow this precise content model:

```xml
<w:p>
  <w:pPr/>          <!-- Paragraph properties (CT_PPr) -->
  <!-- EG_PContent group: -->
  <w:r>             <!-- Run (CT_R) -->
    <w:rPr/>        <!-- Run properties -->
    <!-- EG_RunInnerContent: -->
    <w:t/>          <!-- Text (CT_Text) -->
    <w:br/>         <!-- Break (CT_Br) -->
    <w:contentPart/><!-- Content part reference -->
    <!-- Other run content... -->
  </w:r>
  <w:fldSimple/>    <!-- Simple field (CT_SimpleField) -->
  <w:hyperlink/>    <!-- Hyperlink (CT_Hyperlink) -->
  <w:subDoc/>       <!-- Subdocument reference -->
</w:p>
```

### Run Content Elements (EG_RunInnerContent)

Runs can contain these specific elements per the schema:

- `w:t` - Text content (CT_Text)
- `w:br` - Line breaks (CT_Br) 
- `w:contentPart` - Content part references
- `w:delText` - Deleted text (revision tracking)
- `w:instrText` - Instruction text (field codes)
- `w:noBreakHyphen` - Non-breaking hyphens
- `w:softHyphen` - Soft hyphens
- Date/time elements: `w:dayShort`, `w:monthShort`, `w:yearShort`, etc.
- Reference elements: `w:footnoteRef`, `w:endnoteRef`, `w:annotationRef`
- Separator elements for footnotes/endnotes
