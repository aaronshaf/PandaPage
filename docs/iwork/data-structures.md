# Key Data Structures in Apple Pages Documents (from libetonyek Analysis)

Understanding the core data structures is essential for parsing Apple Pages documents. The `libetonyek` library, through its C++ header files, provides significant insight into the object-oriented schema Apple uses. This document outlines some of the fundamental structures and their roles.

## 1. EtonyekDocument and IWORKMetadata

*   **`EtonyekDocument`:** Represents the top-level document object. This can be a Pages, Keynote, or Numbers file. It acts as the container for all document content and metadata.
*   **`IWORKMetadata`:** Encapsulates document-level metadata such as title, author, keywords, comments, creation date, and modification date. This information is typically stored separately from the main content but is crucial for document management.

## 2. Styles and Properties

Styles are a cornerstone of iWork documents, defining the visual appearance of elements. They are highly structured and inheritable.

*   **`IWORKStyle`:** A fundamental object representing a named, inheritable collection of properties. Styles can be applied to text, paragraphs, shapes, tables, and other document elements.
*   **`IWORKPropertyMap`:** A key-value store that holds the actual properties for a given style or object. It maps string IDs (representing property names) to their corresponding values. The values are strongly typed, reflecting the diverse nature of document properties.
*   **`IWORKStylesheet`:** Organizes and manages collections of `IWORKStyle` objects. Stylesheets can be hierarchical, allowing for complex style inheritance and overrides.

**Common Property Categories:**
*   **Text/Paragraph Properties:** Font attributes (color, size, name, bold, italic), alignment, line spacing, indents, text effects (shadow, strikethru, underline), language-specific settings.
*   **Layout/Geometry Properties:** Dimensions, position, rotation, opacity, padding, vertical alignment, columns. `IWORKGeometry` likely defines transformations.
*   **Graphic/Media Properties:** Fills (`IWORKFill`), strokes (`IWORKStroke`), shadows (`IWORKShadow`), line endings, image scaling and cropping.
*   **List Properties:** Defines list labels, indents, and numbering/bullet styles.
*   **Table Properties:** Extensive properties for cell styles, borders, fills, row/column dimensions, and header/footer configurations.
*   **Page Properties:** Settings related to page masters, headers, and footers.
*   **Chart Properties:** Specific properties for different chart types (e.g., data series, labels, axes).

## 3. Document Content Elements

The schema defines distinct objects for various content types, allowing for a rich and structured document.

*   **`IWORKText`:** Manages blocks of text. This can include paragraphs, inline text spans, dynamic fields (e.g., page numbers, dates), hyperlinks, and various types of breaks (line, column, page). It handles the application of styles at different levels of text granularity.
*   **`IWORKShape`:** A generic graphical object. It has defined geometry, style, and optional paths. This includes predefined shapes (rectangles, circles, arrows) and custom vector shapes.
*   **`IWORKMedia`:** Represents embedded images, videos, or other media. It stores information such as the media type, dimensions, raw binary data, and cropping details.
*   **`IWORKLine`:** Simple line objects with defined geometry and style.
*   **`IWORKTable`:** Represents complex grid structures for tabular data. It supports various cell types (text, number, date, formula), formulas, grid lines, and configurable headers/footers. The internal representation likely includes `IWORKCell` objects.
*   **`IWORKChart`:** Visual representations of data. These objects contain properties for titles, data series, and chart-specific formatting.
*   **Annotations, Footnotes/Endnotes, Groups:** Structures for comments, notes, and grouping of drawable objects for easier manipulation.

## 4. Parsing and Object Resolution

*   **`IWORKToken`:** The presence of numerous XML element and attribute tokens (e.g., in `IWORKToken.h` within `libetonyek`) suggests an XML-based foundation for defining the document structure, particularly for older formats.
*   **`IWAObjectIndex`:** A critical component for resolving object IDs. Pages documents use an internal indexing system to refer to different parts of the document. This structure helps in linking related objects (e.g., a text run to its style, or a shape to its properties).
*   **`IWORKCollector` (and `PAGCollector`):** These are likely abstract or concrete classes responsible for collecting and building the internal representation of the document during the parsing process. Application-specific collectors (like `PAGCollector` for Pages) would handle the unique aspects of each iWork application.

## 5. Data Types and Enumerations

The schema heavily relies on custom C++ structs and enumerations to define data types and their allowed values, ensuring strong typing and consistency.

**Examples of Enumerations:**
*   Document confidence and result types
*   Text alignment (left, center, right, justified)
*   Baseline and capitalization options
*   Border types, image types, gradient types
*   Cell types (text, number, date, formula)
*   Various formatting and layout options.

By understanding these fundamental data structures, developers can better approach the task of deserializing the binary `.iwa` data and reconstructing a meaningful, navigable document model.