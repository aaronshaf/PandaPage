# Browser Document Viewer Documentation

Welcome to the Browser Document Viewer documentation. This project provides tools for parsing and rendering office documents in the browser.

## Documentation Structure

### DOCX Format Documentation

Comprehensive documentation about the DOCX format, its structure, and implementation details:

#### Core Concepts
- [DOCX Overview](./docx/overview.md) - Introduction to DOCX format and key concepts
- [Document Structure](./docx/document-structure.md) - Deep dive into XML structure
- [Official Schema Reference](./docx/official-schema-reference.md) - Comprehensive schema-based documentation
- [Parsing Guide](./docx/parsing-guide.md) - Practical implementation guide
- [Measurement Units](./docx/measurement-units.md) - Units, coordinates, and conversions

#### Text and Formatting
- [Text Formatting](./docx/text-formatting.md) - Text properties, inheritance, and styling
- [Styles and Themes](./docx/styles-themes.md) - Style definitions and theme handling
- [Field Codes](./docx/field-codes.md) - Dynamic content and field evaluation

#### Document Elements
- [Tables](./docx/tables.md) - Table structure, properties, and cell spanning
- [Advanced Tables](./docx/advanced-tables.md) - Multi-page tables, floating tables, complex features
- [Numbering and Lists](./docx/numbering-lists.md) - Three-tier numbering system and list formatting
- [Images and Media](./docx/images.md) - Embedded content, positioning, and formats
- [Drawing and Graphics](./docx/drawing-graphics.md) - DrawingML, positioning, and text wrapping
- [Headers and Footers](./docx/headers-footers.md) - Page headers/footers implementation

#### Browser Implementation
- [Browser Challenges](./docx/browser-challenges.md) - Browser-specific issues and solutions
- [Implementation Strategy](./docx/implementation-strategy.md) - Recommended approach and best practices

## Quick Links

### Getting Started
- [Installation Guide](../README.md#installation)
- [Quick Start Example](../README.md#quick-start)

### API Documentation
- Parser API (Coming soon)
- Renderer API (Coming soon)

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