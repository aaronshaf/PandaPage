# Inferred Schema of Apple Pages Documents (from libetonyek Analysis)

Analysis of the `libetonyek` C++ header files reveals a highly structured, object-oriented schema for Apple Pages documents. This schema likely utilizes a hybrid approach for serialization, combining XML for metadata and high-level structure with a custom binary format (IWA) for efficient content and property storage.

## 1. Core Document Structure

At the top level, a document is represented by `EtonyekDocument`, which can be a Keynote, Numbers, or Pages file. It includes metadata such as title, author, keywords, and comments (`IWORKMetadata`). The parser handles both package (directory-based) and single-file stream formats.

## 2. Styles and Properties

Styles (`IWORKStyle`) are fundamental, acting as named, inheritable collections of properties that define the appearance of various document elements. A `IWORKPropertyMap` stores these properties, mapping string IDs to values. The schema defines a comprehensive set of strongly typed properties, categorized into:

*   **Text/Paragraph Properties:** Covering alignment, font attributes (color, size, name, bold, italic), line spacing, indents, and text effects (shadow, strikethru, underline).
*   **Layout/Geometry Properties:** Including columns, geometric transformations (`IWORKGeometry`), opacity, padding, and vertical alignment.
*   **Graphic/Media Properties:** Such as fills (`IWORKFill`), strokes (`IWORKStroke`), shadows (`IWORKShadow`), and line endings.
*   **List Properties:** Defining list labels, indents, and styles.
*   **Table Properties:** Extensive properties for cell styles, borders, fills, and various table components.
*   **Page Properties:** For managing page masters (even, first, odd pages).
*   **Chart Properties:** Specific properties for different chart types (area, column, pie).

Stylesheets (`IWORKStylesheet`) organize these styles, potentially in a hierarchical manner.

## 3. Document Content Elements

The schema defines distinct objects for various content types:

*   **Text (`IWORKText`):** Manages text blocks, including paragraphs, inline spans, dynamic fields (page numbers, dates), links, and breaks (line, column, page). It handles language-specific properties and applies styles at different text levels.
*   **Shapes (`IWORKShape`):** Generic graphical objects with defined geometry, style, and optional paths. Predefined shapes like polygons, arrows, and stars are supported.
*   **Images and Media (`IWORKMedia`):** Represents embedded images and other media, including type (e.g., original size, tile), dimensions, raw data, and cropping information.
*   **Lines (`IWORKLine`):** Simple line objects with geometry and style.
*   **Tables (`IWORKTable`):** Complex grid structures for tabular data, supporting various cell types (text, number, date, formula), formulas, grid lines, and configurable headers/footers.
*   **Charts (`IWORKChart`):** Visual representations of data with properties for titles and series.
*   **Annotations, Footnotes/Endnotes, Groups:** Support for comments, notes, and grouping of drawable objects.

## 4. XML Structure and Parsing

The presence of numerous XML element and attribute tokens (`IWORKToken.h`) suggests an XML-based foundation for defining the document structure. The parsing process involves tokenization, managing parsing state through XML contexts, resolving object IDs via `IWAObjectIndex`, and building the internal representation using `IWORKCollector` (with application-specific collectors like `PAGCollector`). Property handling is sophisticated, utilizing `IWORKPropertyMap` and specialized contexts.

## 5. Data Types and Enums

The schema heavily relies on custom C++ structs and enumerations to define data types and their allowed values. Key enumerations cover document confidence and result types, text alignment, baseline, capitalization, border types, image types, gradient types, cell types, and various other formatting and layout options.

## Summary of Schema Characteristics

*   **Object-Oriented:** Designed around distinct objects with properties and relationships.
*   **Hierarchical:** Elements are nested, and styles support inheritance.
*   **Rich Feature Set:** Supports a wide array of document formatting, layout, and content types.
*   **Modular:** Organized into separate components for types, properties, and tokens.
*   **XML/Binary Hybrid:** Combines XML for structure definition with the IWA binary format for efficient data storage.
*   **Application-Specific Extensions:** Core `IWORK` elements are extended with `PAG`, `NUM`, and `KEY` prefixes for application-specific features.