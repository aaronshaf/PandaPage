# Browser Document Viewer Documentation

Welcome to the Browser Document Viewer documentation. This project provides tools for parsing and rendering office documents in the browser.

## Documentation Structure

### OOXML Foundation

OOXML (Office Open XML) is the underlying specification that powers modern Microsoft Office formats. This documentation covers the core concepts that apply across all OOXML-based formats:

#### Core Concepts
- [OOXML Overview](./ooxml/overview.md) - Introduction to OOXML standard and architecture
- [Document Structure](./ooxml/document-structure.md) - XML structure and packaging
- [Schema Reference](./ooxml/schema-reference.md) - Comprehensive schema-based documentation
- [Measurement Units](./ooxml/measurement-units.md) - Units, coordinates, and conversions

#### Text and Formatting
- [Text Formatting](./ooxml/text-formatting.md) - Typography, run properties, and styling
- [Styles and Themes](./ooxml/styles-themes.md) - Style definitions and theme handling
- [Field Codes](./ooxml/field-codes.md) - Dynamic content and field evaluation

#### Document Elements
- [Tables](./ooxml/tables.md) - Table structure, properties, and cell spanning
- [Advanced Tables](./ooxml/advanced-tables.md) - Multi-page tables, floating tables, complex features
- [Numbering and Lists](./ooxml/numbering-lists.md) - Three-tier numbering system and list formatting
- [Images and Media](./ooxml/images.md) - Embedded content, positioning, and formats
- [Drawing and Graphics](./ooxml/drawing-graphics.md) - DrawingML, positioning, and text wrapping
- [Headers and Footers](./ooxml/headers-footers.md) - Page headers/footers implementation

### DOCX-Specific Implementation

Documentation focused on DOCX-specific implementation details and browser considerations:

#### Implementation Guide
- [DOCX Overview](./docx/overview.md) - DOCX format specifics and key concepts
- [Parsing Guide](./docx/parsing-guide.md) - Practical DOCX parsing implementation
- [Browser Challenges](./docx/browser-challenges.md) - Browser-specific issues and solutions
- [Implementation Strategy](./docx/implementation-strategy.md) - Recommended approach and best practices

## Quick Links

### Getting Started
- [Installation Guide](../README.md#installation)
- [Quick Start Example](../README.md#quick-start)



### Examples
- [Demo Application](../packages/demo)
- Sample Documents (in `/documents`)

## Architecture Overview

The project is organized into several packages:

```
packages/
├── parser/          # Document parsing logic
├── renderer-dom/    # DOM-based rendering
├── renderer-markdown/ # Markdown conversion
├── core/           # Core utilities and types
└── demo/           # Demo application
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

## License

This project is licensed under the MIT License.