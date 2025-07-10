# Inferred Schema of Apple Pages Documents (from libetonyek Analysis)

Analysis of the `libetonyek` C++ header files, combined with reverse engineering efforts, reveals a highly structured, object-oriented schema for Apple Pages documents. This schema utilizes a hybrid approach for serialization, leveraging both XML (for legacy formats and some metadata) and a custom binary format based on Snappy-compressed Protocol Buffers (IWA) for efficient content and property storage in modern documents.

## 1. Core Document Structure and Hybrid Serialization

At the top level, a document is conceptually represented by an `EtonyekDocument` (as seen in `libetonyek`), which can be a Keynote, Numbers, or Pages file. This document is typically a ZIP archive containing various parts.

For **legacy Pages documents (pre-2013)**, the core structure was XML-based. Key files like `document.xml`, `styles.xml`, and `metadata.xml` (as detailed in [Legacy XML Format](./xml-legacy-format.md)) defined the document's content, styling, and metadata.

For **modern Pages documents (2013+)**, the primary content is stored in `.iwa` files within an `Index.zip` archive. These `.iwa` files contain Snappy-compressed [Protocol Buffer](./protocol-buffers.md) messages. Metadata, such as title, author, keywords, and comments (`IWORKMetadata` in `libetonyek`), might still be found in separate XML files or embedded within specific Protobuf messages.

Regardless of the format generation, the parser handles both package (directory-based) and single-file stream formats. The `IWAObjectIndex` (discussed in [Data Structures](./data-structures.md)) plays a crucial role in resolving object IDs and linking various parts of the document, whether they originate from XML or IWA streams.

## 2. Styles and Properties: The Foundation of Document Appearance

Styles are fundamental to iWork documents, acting as named, inheritable collections of properties that define the appearance and behavior of various document elements. As detailed in [Data Structures](./data-structures.md), `IWORKStyle` objects encapsulate these definitions.

A `IWORKPropertyMap` stores these properties, mapping string IDs to values. The schema defines a comprehensive set of strongly typed properties, categorized into:

*   **Text/Paragraph Properties:** Covering alignment, font attributes (color, size, name, bold, italic), line spacing, indents, and text effects (shadow, strikethru, underline). These properties are crucial for text rendering and layout.
*   **Layout/Geometry Properties:** Including columns, geometric transformations (`IWORKGeometry`), opacity, padding, and vertical alignment. These define the positioning and visual presentation of objects on a page.
*   **Graphic/Media Properties:** Such as fills (`IWORKFill`), strokes (`IWORKStroke`), shadows (`IWORKShadow`), and line endings. These apply to shapes, images, and other visual elements.
*   **List Properties:** Defining list labels, indents, and styles, enabling structured lists.
*   **Table Properties:** Extensive properties for cell styles, borders, fills, and various table components, allowing for complex tabular data representation.
*   **Page Properties:** For managing page masters (even, first, odd pages), headers, and footers, controlling the overall page layout.
*   **Chart Properties:** Specific properties for different chart types (area, column, pie), defining their visual representation and data binding.

Stylesheets (`IWORKStylesheet`) organize these styles, potentially in a hierarchical manner, allowing for efficient management and application of consistent formatting across the document.

## 3. Document Content Elements: Building Blocks of the Document

The schema defines distinct objects for various content types, forming the building blocks of the document. These correspond to the `IWORK` prefixed objects identified in `libetonyek` and further detailed in [Data Structures](./data-structures.md):

*   **Text (`IWORKText`):** Manages text blocks, including paragraphs, inline spans, dynamic fields (page numbers, dates), links, and breaks (line, column, page). It handles language-specific properties and applies styles at different text levels, forming the narrative content of the document.
*   **Shapes (`IWORKShape`):** Generic graphical objects with defined geometry, style, and optional paths. This includes both predefined shapes (like polygons, arrows, and stars) and custom vector shapes, allowing for rich visual elements.
*   **Images and Media (`IWORKMedia`):** Represents embedded images, videos, and other media. It includes properties for type (e.g., original size, tile), dimensions, raw data, and cropping information, enabling the inclusion of rich media.
*   **Lines (`IWORKLine`):** Simple line objects with geometry and style, used for dividers, connectors, or decorative elements.
*   **Tables (`IWORKTable`):** Complex grid structures for tabular data. They support various cell types (text, number, date, formula), formulas, grid lines, and configurable headers/footers, providing structured data presentation.
*   **Charts (`IWORKChart`):** Visual representations of data with properties for titles and series, often linked to underlying table data.
*   **Annotations, Footnotes/Endnotes, Groups:** Support for comments, notes, and grouping of drawable objects, enhancing collaboration and document organization.

## 4. Parsing and Object Resolution: Bringing the Document to Life

The parsing process involves reading the serialized data and building an in-memory representation of the document. This process varies depending on the format generation:

*   **Legacy XML Parsing:** For older documents, the presence of numerous XML element and attribute tokens (`IWORKToken.h` in `libetonyek`) suggests an XML-based foundation. Parsing involves standard XML parsing techniques to read `document.xml`, `styles.xml`, etc., as described in [Legacy XML Format](./xml-legacy-format.md).

*   **Modern IWA (Protobuf) Parsing:** For newer documents, the process involves [Snappy decompression](./snappy-compression.md) of `.iwa` files, followed by deserialization of [Protocol Buffer](./protocol-buffers.md) messages. The `libetonyek` library utilizes components like `IWAParser`, `IWAField`, and `IWAMessage` for this purpose.

Regardless of the format, a crucial aspect is **object resolution**. The `IWAObjectIndex` (further detailed in [Data Structures](./data-structures.md)) plays a vital role in resolving internal object IDs and linking various parts of the document. This allows the parser to connect, for example, a text run to its corresponding style definition, or an image reference to its actual binary data.

Building the internal representation is often handled by collector classes (e.g., `IWORKCollector` with application-specific collectors like `PAGCollector` in `libetonyek`), which assemble the parsed data into a coherent document model. Property handling is sophisticated, utilizing `IWORKPropertyMap` and specialized contexts to apply formatting and attributes correctly.

## 5. Data Types and Enumerations

The schema heavily relies on custom C++ structs and enumerations to define data types and their allowed values, ensuring strong typing and consistency. These enumerations cover a wide range of properties, including:

*   Document confidence and result types
*   Text alignment (e.g., left, center, right, justified)
*   Baseline and capitalization options
*   Border types, image types, gradient types
*   Cell types (e.g., text, number, date, formula)
*   Various formatting and layout options.

These detailed enumerations provide the granular control necessary for representing the rich formatting capabilities of iWork applications.

## Summary of Schema Characteristics

*   **Object-Oriented:** Designed around distinct objects with properties and relationships, mirroring the structure of the content.
*   **Hierarchical:** Elements are nested, and styles support inheritance, allowing for efficient and consistent application of formatting.
*   **Rich Feature Set:** Supports a wide array of document formatting, layout, and content types, reflecting the capabilities of Pages.
*   **Modular:** Organized into separate components for types, properties, and tokens, facilitating maintainability and extensibility.
*   **XML/Binary Hybrid:** Combines XML for metadata and legacy formats with the IWA binary format (Snappy-compressed Protocol Buffers) for efficient content storage in modern documents.
*   **Application-Specific Extensions:** Core `IWORK` elements are extended with `PAG`, `NUM`, and `KEY` prefixes for application-specific features, allowing for differentiation between Pages, Numbers, and Keynote documents.
*   **Reverse-Engineered:** The understanding of this schema is primarily derived from reverse engineering efforts and analysis of `libetonyek`, as Apple does not provide official documentation for the modern format.