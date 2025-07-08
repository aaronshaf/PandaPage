# DOCX Format Overview

## Introduction

DOCX is the primary file format used by Microsoft Word since 2007. It's built on the OOXML (Office Open XML) standard and represents the WordprocessingML variant. This document covers DOCX-specific implementation details and considerations for browser-based parsing.

For foundational OOXML concepts, see the [OOXML Overview](../ooxml/overview.md).

## File Structure

### ZIP Archive Structure

A DOCX file is essentially a ZIP archive with a specific directory structure:

```
document.docx (ZIP archive)
├── [Content_Types].xml
├── _rels/
│   └── .rels
└── word/
    ├── document.xml
    ├── styles.xml
    ├── _rels/
    │   └── document.xml.rels
    ├── theme/
    │   └── theme1.xml
    └── media/
        └── (images)
```

### Core Components

#### 1. `[Content_Types].xml`
Defines MIME types for all content within the archive. Essential for telling parsers what type of content each file contains.

#### 2. `_rels/.rels`
The root relationships file that points to the main document content. Typically references `word/document.xml` as the main document part.

#### 3. `word/document.xml`
The heart of the DOCX file containing the actual document content, including:
- Paragraphs (`<w:p>`)
- Runs (`<w:r>`)
- Text (`<w:t>`)
- Tables (`<w:tbl>`)
- Images (`<w:drawing>`)

#### 4. `word/_rels/document.xml.rels`
Defines relationships from the document to other resources like:
- Images in the media folder
- Headers and footers
- Footnotes and endnotes
- External hyperlinks

#### 5. `word/styles.xml`
Contains all style definitions including:
- Named styles (Heading 1, Normal, etc.)
- Default document formatting
- Character and paragraph styles

#### 6. `word/theme/theme1.xml`
Defines the document theme including:
- Color schemes
- Font schemes (major and minor fonts)
- Formatting schemes

## Key Concepts

### Document Hierarchy

```
Document
└── Body
    ├── Paragraph
    │   ├── Paragraph Properties
    │   └── Run
    │       ├── Run Properties
    │       └── Text
    ├── Table
    │   └── Row
    │       └── Cell
    │           └── Paragraph
    └── Section Properties
```

### Namespaces

DOCX uses several XML namespaces. The most common ones:

- `w:` - Main WordprocessingML namespace
- `r:` - Relationships namespace
- `a:` - DrawingML namespace
- `wp:` - Drawing WordprocessingML namespace
- `pic:` - Picture namespace

### Units of Measurement

DOCX uses different units for different purposes:

| Unit | Description | Conversion |
|------|-------------|------------|
| Twips (twentieths of a point) | **Fundamental unit in DOCX** | 1 pt = 20 twips |
| Points | Font sizes | 1 pt = 1/72 inch |
| EMUs (English Metric Units) | Images and drawings | 1 inch = 914,400 EMUs |
| Percentages | Table widths | Relative to container |

**Note**: The TWIP is the fundamental unit in DOCX - most measurements (margins, indents, spacing) use TWIPs.

## Text Representation

### Paragraph Structure

A paragraph consists of:
1. **Paragraph properties** (`<w:pPr>`) - alignment, spacing, indentation
2. **One or more runs** (`<w:r>`) - sequences of text with uniform formatting

### Run Structure

A run contains:
1. **Run properties** (`<w:rPr>`) - font, size, color, bold, italic, etc.
2. **Text content** (`<w:t>`) - the actual characters

### Property Inheritance

Properties cascade in this order:
1. Document defaults
2. Style definitions
3. Paragraph properties
4. Run properties

Later definitions override earlier ones, except for toggle properties (bold, italic) which use XOR logic.

## Common Challenges

### 1. Property Resolution
Properties can be defined at multiple levels and require careful resolution to determine final formatting.

### 2. Toggle Properties
Bold (`<w:b/>`) and italic (`<w:i/>`) are toggle properties. If a style defines bold and a run also defines bold, the result is non-bold text.

### 3. Complex Scripts
Different properties for normal and complex scripts (e.g., Arabic):
- `<w:b/>` for normal scripts
- `<w:bCs/>` for complex scripts

### 4. Pagination
DOCX files don't contain page break information. Page layout must be calculated during rendering based on:
- Page size
- Margins
- Content dimensions
- Line spacing

### 5. Field Codes
Dynamic content like page numbers use field codes that must be parsed and evaluated during rendering.

### 6. Default Font Behavior
- Default font size is 10pt unless `w:docDefaults/w:rPrDefault` is missing
- When missing, default size becomes 11pt
- This quirk can cause unexpected rendering differences

## Best Practices for Parsing

1. **Start Simple**: Begin with basic text extraction before handling complex formatting
2. **Handle Missing Files**: Not all optional files may be present
3. **Validate Relationships**: Ensure all referenced resources exist
4. **Test Incrementally**: Create test documents with increasing complexity
5. **Use Proper XML Parsing**: Don't use regex; use a proper XML parser
6. **Handle Namespaces**: Be aware of namespace prefixes that may vary

## Next Steps

- [Document Structure](./document-structure.md) - Detailed XML structure
- [Text and Formatting](./text-formatting.md) - Text properties and styling
- [Tables](./tables.md) - Table structure and properties
- [Images and Media](./images.md) - Embedded content handling
- [Styles and Themes](./styles-themes.md) - Style inheritance and themes