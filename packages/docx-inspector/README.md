# DOCX Inspector

A comprehensive utility for inspecting and analyzing DOCX file contents and structure. This tool helps developers understand DOCX files better for parsing and rendering improvements.

## Features

- 📁 **Complete file listing** - See all files inside the DOCX package
- 🏗️ **Document structure analysis** - Detect document components (styles, numbering, images, etc.)
- 📊 **Statistics and compression info** - File sizes, counts, compression ratios
- 🖼️ **Image and media detection** - List all images and embedded objects
- 🔗 **Relationship parsing** - Understand document relationships
- 📄 **XML content extraction** - Extract specific XML parts for analysis
- 💻 **Both CLI and library** - Use as command-line tool or import as library

## Installation

```bash
# Install in your project
bun add @browser-document-viewer/docx-inspector

# Or install globally for CLI usage
bun install -g @browser-document-viewer/docx-inspector
```

## CLI Usage

### Basic Inspection

```bash
# Full document analysis
docx-inspect document.docx

# Statistics only
docx-inspect document.docx --stats-only

# Save results to JSON
docx-inspect document.docx -o results.json
```

### File Analysis

```bash
# List all files in the DOCX
docx-inspect document.docx --list-files

# List with detailed info
docx-inspect document.docx --list-files --verbose

# List only images
docx-inspect document.docx --list-images

# List relationships
docx-inspect document.docx --list-relationships
```

### XML Content Extraction

```bash
# Extract main document XML
docx-inspect document.docx --xml document

# Extract styles XML
docx-inspect document.docx --xml styles

# Extract numbering XML
docx-inspect document.docx --xml numbering

# Extract any XML file by partial name
docx-inspect document.docx --xml settings
```

## Library Usage

```typescript
import { DocxInspector } from '@browser-document-viewer/docx-inspector';
import { readFileSync } from 'fs';

const inspector = new DocxInspector();

// Inspect a DOCX file
const buffer = readFileSync('document.docx');
const result = await inspector.inspect(buffer.buffer, 'document.docx');

console.log('Document structure:', result.documentStructure);
console.log('Statistics:', result.statistics);
console.log('Total files:', result.files.length);

// Extract specific content
const documentXml = inspector.getDocumentXml(result);
const stylesXml = inspector.getStylesXml(result);
const images = inspector.getImageFiles(result);

// Analyze relationships
const rels = inspector.getRelationshipsForPart(result, 'word/document.xml');
```

## Example Output

### Full Report
```
🔍 DOCX Inspection Report
==================================================

📄 Basic Information:
File: complex-document.docx
Size: 1.3 MB

🏗️  Document Structure:
Main Document:       ✅
Styles:              ✅
Numbering:           ✅
Settings:            ✅
Theme:               ✅
Comments:            ❌
Footnotes:           ✅
Endnotes:            ✅
Headers:             ❌
Footers:             ❌
Images:              4 files
Embedded Objects:    0 files

📊 Statistics:
────────────────────────────────────────
File Size:           1.3 MB
Uncompressed Size:   2.5 MB
Compression Ratio:   51.0%
Total Files:         32
XML Files:           22
Binary Files:        10
Images:              4
Embedded Objects:    0

📁 Key Files:
📄 [Content_Types].xml            2.1 KB
📄 word/document.xml              134.5 KB
📄 word/settings.xml              4 KB
📄 word/numbering.xml             20.7 KB
📄 word/styles.xml                39.8 KB
```

### Image Listing
```
🖼️  Images in DOCX:
────────────────────────────────────────────────────────────
📷 word/media/image1.png                        4.6 KB PNG
📷 word/media/image2.png                        4.5 KB PNG
📷 word/media/chart.gif                         1.5 KB GIF
────────────────────────────────────────────────────────────
Total: 3 images
```

## API Reference

### DocxInspector Class

#### `inspect(buffer: ArrayBuffer, fileName?: string): Promise<DocxInspectionResult>`

Analyzes a DOCX file buffer and returns comprehensive inspection results.

#### Utility Methods

- `getDocumentXml(result)` - Extract main document XML
- `getStylesXml(result)` - Extract styles XML  
- `getNumberingXml(result)` - Extract numbering XML
- `getImageFiles(result)` - Get all image files
- `getEmbeddedObjects(result)` - Get embedded objects
- `getRelationshipsForPart(result, partPath)` - Get relationships for a part

### DocxInspectionResult Interface

```typescript
interface DocxInspectionResult {
  fileName: string;
  fileSize: number;
  files: DocxFile[];
  relationships: DocxRelationship[];
  contentTypes: Record<string, string>;
  documentStructure: {
    hasDocument: boolean;
    hasStyles: boolean;
    hasNumbering: boolean;
    hasSettings: boolean;
    hasTheme: boolean;
    hasComments: boolean;
    hasFootnotes: boolean;
    hasEndnotes: boolean;
    hasHeaders: boolean;
    hasFooters: boolean;
    hasImages: number;
    hasEmbeddedObjects: number;
  };
  statistics: {
    totalFiles: number;
    xmlFiles: number;
    binaryFiles: number;
    totalUncompressedSize: number;
    compressionRatio: number;
  };
}
```

## Use Cases

### For Developers

- **Debug parsing issues** - Understand DOCX structure when implementing parsers
- **Optimize performance** - Identify large files and compression opportunities  
- **Validate documents** - Ensure required components are present
- **Analyze test files** - Understand what features test documents contain

### For Content Analysis

- **Document auditing** - Check what's inside DOCX files
- **Media extraction** - Find and analyze embedded images
- **Structure validation** - Verify document completeness
- **Forensic analysis** - Understand document composition

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build

# Test CLI locally
bun src/cli.ts path/to/document.docx
```

## Contributing

The DOCX Inspector is part of the browser-document-viewer project. Contributions are welcome!

## License

MIT - Part of the browser-document-viewer project.