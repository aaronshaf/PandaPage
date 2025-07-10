# Libetonyek: A C++ Reference for Apple iWork Document Parsing

`libetonyek` is a crucial open-source C++ library that serves as a robust reference implementation for parsing and importing Apple iWork documents, including Pages, Keynote, and Numbers files. Developed as part of the Document Liberation Project, it enables applications like LibreOffice to read and convert iWork documents into other formats. Its architecture and components offer significant insights into the complexities of the iWork file formats.

## 1. Purpose and Scope

`libetonyek`'s primary goal is to provide a comprehensive parser for various versions of iWork documents (supporting Pages versions 1-4, among others). It acts as a bridge, allowing non-Apple applications to access and process content from these proprietary formats.

## 2. Key Architectural Components

An examination of `libetonyek`'s internal structure, as revealed through its source code and build configurations, highlights several key components and their roles:

### a. External Dependencies

`libetonyek` relies on several external libraries to perform its parsing tasks:

*   **`libxml2`:** Used for XML parsing, primarily for older iWork formats (like the legacy Pages XML format) that were based on XML.
*   **`librevenge`:** A library from the Document Liberation Project that provides common utilities for document parsing, acting as a foundational layer.
*   **`zlib`:** For decompression, particularly for handling gzipped XML files found in some older iWork packages.

### b. Core IWA Parsing Components

For modern iWork documents (2013+), which use the IWA (iWork Archive) format, `libetonyek` includes specialized modules:

*   **`IWASnappyStream`:** Handles Apple's custom Snappy decompression. This component is vital because Apple uses a non-standard Snappy framing without a Stream Identifier, requiring a specific decompression approach. The `uncompressBlock` static method suggests block-by-block decompression, and the stream itself might be structured with multiple logical substreams.
*   **`IWAParser`:** The main parser for the IWA format, responsible for reading and interpreting the binary streams. It acts as an orchestrator, dispatching different types of objects (shapes, text, comments, styles) to specific parsing methods and providing helper functions to extract common iWork data types from `IWAMessage` fields.
*   **`IWAMessage`:** Represents a single Protocol Buffer message, providing methods to access various field types (e.g., `uint32`, `string`, `message`). It handles the standard Protobuf wire types.
*   **`IWAField`, `IWAMessage`:** Components that represent and process the individual fields and messages within the Protocol Buffer structures found in `.iwa` files.
*   **`IWAObjectIndex`:** A critical mechanism for resolving object IDs and managing references between different parts of the document. iWork documents extensively use internal IDs to link elements (e.g., a text run to its style, or a shape to its properties). It also handles mapping file IDs to streams (e.g., for embedded media) and even colors.

### c. Version-Specific Parsers

To accommodate the evolution of the iWork file formats, `libetonyek` contains distinct parsing logic for different versions. This is evident in the presence of modules like:

*   **`PAG1Parser`:** Specifically designed for parsing Pages 1.x XML documents.
*   **`KEY6Parser`, `NUM3Parser`:** Indicating support for specific versions of Keynote and Numbers documents.

This modularity allows `libetonyek` to handle the nuances and changes across various iWork application versions.

### e. Document Assembly and Collection (`IWORKCollector`)

`IWORKCollector` is a central component responsible for assembling the parsed document into a coherent in-memory representation. It acts as an interface that receives various parsed elements and orchestrates their placement and styling.

*   **Orchestration**: It receives calls to `collectStyle`, `collectShape`, `collectImage`, `collectTable`, `collectText`, and other document elements.
*   **Hierarchy Management**: It manages internal stacks (`m_levelStack`, `m_styleStack`, `m_stylesheetStack`) to correctly apply hierarchical properties and group elements.
*   **Rendering/Output**: It contains virtual methods like `drawTable()` and `drawMedia()`, indicating its role in preparing the parsed content for rendering or output to another format.
*   **Structural Handling**: It handles document-level structural events such as `startDocument`/`endDocument`, `startAttachment`/`endAttachment`, and `startGroup`/`endGroup`.
*   **Object Creation**: It is responsible for creating core content objects like `IWORKTable` and `IWORKText`.
*   **Property Passing**: It uses `librevenge::RVNGPropertyList` to pass collected properties to the underlying output system.

## 3. Insights for New Implementations

Studying `libetonyek` provides invaluable insights for anyone attempting to build a new iWork document parser:

*   **Complexity:** It underscores the significant complexity involved in fully parsing iWork documents, especially due to the proprietary binary formats and version variations.
*   **Modular Design:** Its modular structure, with dedicated components for different file formats, versions, and document elements, serves as a good architectural pattern.
*   **Dependency Management:** It highlights the necessity of handling external dependencies (like XML parsers and decompression libraries) and internal object referencing.
*   **Reverse Engineering Validation:** `libetonyek`'s existence validates many of the reverse engineering findings regarding the IWA format, Snappy compression, and Protocol Buffer usage.

By understanding the architecture and key components of `libetonyek`, developers can gain a solid foundation for approaching the challenging task of parsing Apple Pages documents.