# OOXML (Office Open XML) Overview

## What is OOXML?

Office Open XML (OOXML) is an open standard developed by Microsoft and standardized by ISO/IEC 29500. It serves as the foundation for modern Microsoft Office document formats:

- **DOCX** - Word Processing documents (WordprocessingML)
- **XLSX** - Spreadsheet documents (SpreadsheetML) 
- **PPTX** - Presentation documents (PresentationML)

## Key Characteristics

### ZIP-based Format
All OOXML documents are ZIP archives containing:
- XML files for document content and metadata
- Binary files for embedded media (images, fonts, etc.)
- Relationship files defining connections between parts

### Namespace Structure
OOXML uses XML namespaces to organize different types of content:
- `w:` - WordprocessingML elements
- `r:` - Relationships
- `a:` - DrawingML (shared across all OOXML formats)
- `wp:` - WordprocessingML Drawing
- `mc:` - Markup Compatibility

### Three-Layer Architecture
1. **Package Layer** - ZIP container with parts and relationships
2. **Markup Layer** - XML schemas defining document structure
3. **Rendering Layer** - How content should be displayed

## Core Concepts

### Parts and Relationships
- **Parts** - Individual files within the ZIP archive
- **Relationships** - XML files defining how parts connect to each other
- **Content Types** - Mapping of file extensions to MIME types

### Measurement Units
- **Twips** - 1/20th of a point, used for most measurements
- **EMUs** - English Metric Units, used for drawing objects
- **Half-points** - Used for font sizes
- **DXA** - Device-independent pixels

### Schema Compliance
OOXML follows strict XML schemas that define:
- Valid element hierarchies
- Attribute constraints
- Data type definitions
- Backwards compatibility rules

## Document Structure Patterns

### Common Elements Across Formats
- **Styles** - Reusable formatting definitions
- **Themes** - Color schemes and font selections
- **Custom Properties** - User-defined metadata
- **Comments** - Annotations and reviews
- **Revision Tracking** - Change history

### Extensibility
- **Custom XML Parts** - User-defined data structures
- **Alternative Content** - Fallback for unsupported features
- **Markup Compatibility** - Forward/backward compatibility

## Implementation Considerations

### Parsing Strategy
1. Extract ZIP archive
2. Parse relationship files to understand document structure
3. Process main content files (document.xml, etc.)
4. Handle embedded resources (images, fonts)
5. Apply styles and formatting

### Browser Challenges
- XML parsing and namespace handling
- ZIP archive extraction
- Binary data processing
- Memory management for large files
- Streaming for progressive loading

## Standards References

- **ISO/IEC 29500-1:2016** - Fundamentals and Markup Language Reference
- **ISO/IEC 29500-2:2021** - Open Packaging Conventions
- **ISO/IEC 29500-3:2015** - Markup Compatibility and Extensibility
- **ISO/IEC 29500-4:2016** - Transitional Migration Features

## Related Documentation

- [Schema Reference](./schema-reference.md) - Detailed OOXML schema documentation
- [Document Structure](./document-structure.md) - XML structure and organization
- [Measurement Units](./measurement-units.md) - Units and coordinate systems
- [Text Formatting](./text-formatting.md) - Typography and styling
- [Tables](./tables.md) - Table structure and properties

## Default Values

### DrawingML Text Margins (EMUs)

From the schema defaults in `CT_TextBodyProperties`:
- **Left margin**: 91,440 EMUs (0.1 inch)
- **Right margin**: 91,440 EMUs (0.1 inch)
- **Top margin**: 45,720 EMUs (0.05 inch)
- **Bottom margin**: 45,720 EMUs (0.05 inch)

### Document Defaults

Common default values from the schemas:
- **Font size**: 22 half-points (11pt) when not specified
- **Line spacing**: Single (240 twips)
- **Paragraph spacing**: 0 before, 10pt after
- **Text direction**: Left-to-right (`ltr`)
- **Vertical alignment**: Baseline

## Implementation Guidelines

### Unit Conversion Functions

```typescript
// Essential unit conversions
const TWIPS_PER_INCH = 1440;
const TWIPS_PER_POINT = 20;
const EMUS_PER_INCH = 914400;
const EMUS_PER_TWIP = 635;

function twipsToPoints(twips: number): number {
  return twips / TWIPS_PER_POINT;
}

function halfPointsToPoints(halfPoints: number): number {
  return halfPoints / 2;
}

function emusToTwips(emus: number): number {
  return Math.round(emus / EMUS_PER_TWIP);
}

function parseUniversalMeasure(value: string): number {
  const match = value.match(/^(-?[0-9]+(?:\.[0-9]+)?)(mm|cm|in|pt|pc|pi)$/);
  if (!match) return 0;
  
  const [, numStr, unit] = match;
  const num = parseFloat(numStr);
  
  switch (unit) {
    case 'in': return num * TWIPS_PER_INCH;
    case 'pt': return num * TWIPS_PER_POINT;
    case 'pc': return num * 12 * TWIPS_PER_POINT; // 1 pica = 12 points
    case 'mm': return num * TWIPS_PER_INCH / 25.4;
    case 'cm': return num * TWIPS_PER_INCH / 2.54;
    default: return 0;
  }
}
```

### Property Resolution

```typescript
// Boolean property handling
function parseOnOff(element: Element, attrName: string): boolean {
  const attr = element.getAttribute(`w:${attrName}`);
  if (!attr) return true; // Empty element = true
  
  switch (attr.toLowerCase()) {
    case 'true': case '1': case 'on': return true;
    case 'false': case '0': case 'off': return false;
    default: return true;
  }
}

// Font size parsing (half-points to points)
function parseFontSize(element: Element): number | undefined {
  const sz = element.querySelector('w\\:sz')?.getAttribute('w:val');
  return sz ? parseInt(sz) / 2 : undefined;
}
```

## Schema Validation Points

### Critical Elements

1. **Text preservation**: Always honor `xml:space="preserve"`
2. **Unit handling**: Support both raw numbers and universal measures
3. **Boolean consistency**: Handle all OnOff value formats
4. **Font size**: Remember half-point encoding
5. **Drawing coordinates**: Convert EMUs properly
6. **Table grid**: Column widths must match grid definitions
7. **Vertical merge**: Track merge state across rows

### Common Validation Errors

- Ignoring complex script properties (`bCs`, `iCs`, `szCs`)
- Not handling universal measure units in coordinates
- Incorrect boolean property interpretation
- Missing font size conversion (half-points to points)
- Improper table grid column width calculation
- EMU coordinate overflow/underflow
