# Legacy XML Format of Apple Pages Documents (2005-2013)

Before 2013, Apple Pages documents utilized an XML-based format. Unlike the modern Protocol Buffer format, this legacy format was officially documented by Apple in the "iWork Programming Guide." Understanding this format is valuable for historical context and for parsing older `.pages` files.

## 1. Document Structure: ZIP and XML

Similar to the modern format, legacy Pages documents were also essentially **ZIP archives**. However, instead of containing `Index.zip` with `.iwa` files, they contained XML files directly.

A typical structure for a legacy Pages bundle (`document.pages/`) would look something like this:

```
document.pages/
├── Contents/                # Contains the main XML files
│   ├── document.xml         # Main document content and structure
│   ├── styles.xml           # Document styles
│   ├── metadata.xml         # Document metadata
│   └── build-version.plist  # Version information
├── Data/                    # Stores media assets (images, etc.)
├── preview.jpg             # High-resolution document preview
└── preview-micro.jpg       # Thumbnail preview
```

## 2. Key XML Files and Their Roles

*   **`document.xml`:** This was the core file, containing the main content of the Pages document. It defined the hierarchy of elements, including paragraphs, text runs, tables, shapes, and other drawable objects. The structure was typically nested, reflecting the visual layout of the document.
*   **`styles.xml`:** This file defined all the styles used within the document. This included paragraph styles, character styles, table styles, and shape styles. Styles were crucial for maintaining consistent formatting and were often referenced by elements in `document.xml`.
*   **`metadata.xml`:** Contained document-level metadata, similar to `IWORKMetadata` in the modern format. This included information like title, author, creation date, modification date, and keywords.
*   **`build-version.plist`:** A property list file (XML-based) that provided information about the iWork application version that created or last saved the document.

## 3. XML Schema and Elements

The "iWork Programming Guide" provided a comprehensive XML schema, detailing the various elements and attributes used in the format. Key aspects included:

*   **Element Definitions:** Specific XML tags for different document components (e.g., `<paragraph>`, `<text-run>`, `<table>`, `<shape>`).
*   **Document Hierarchy:** How elements were nested to represent the logical and visual structure of the document.
*   **Drawable Objects:** Definitions for graphical elements, including their geometry, fills, strokes, and transformations.
*   **Text Formatting:** Elements and attributes for applying font properties, colors, alignment, and other text-specific formatting.
*   **Style System:** How styles were defined, applied, and inherited throughout the document.

## 4. Parsing the Legacy Format

Parsing the legacy XML format involved standard XML parsing techniques:

1.  **Unzip the `.pages` file:** Extract all contents.
2.  **Locate XML files:** Identify `document.xml`, `styles.xml`, etc.
3.  **Parse XML:** Use an XML parser (e.g., `libxml2` which `libetonyek` uses for older formats) to read and interpret the structure and content of each XML file.
4.  **Build Document Model:** Construct an in-memory representation of the document based on the parsed XML data.

## 5. Comparison with Modern Format

| Feature           | Legacy XML Format (2005-2013)         | Modern Protocol Buffers Format (2013+) |
| :---------------- | :------------------------------------ | :------------------------------------- |
| **Core Data**     | XML files (e.g., `document.xml`)      | Snappy-compressed Protocol Buffers (`.iwa` files) |
| **Documentation** | Officially documented by Apple        | No official documentation; reverse-engineered |
| **Compression**   | Standard ZIP compression for bundle   | ZIP for bundle, custom Snappy for `.iwa` |
| **Parsing Speed** | Slower (XML parsing overhead)         | Significantly faster (binary parsing) |
| **Complexity**    | Simpler, human-readable XML           | More complex binary format, requires `.proto` definitions |

While the legacy XML format is less common now, understanding its structure provides valuable context for the evolution of the Pages file format and highlights the significant shift Apple made towards a more performant, binary-based approach.