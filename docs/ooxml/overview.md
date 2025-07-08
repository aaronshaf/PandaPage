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