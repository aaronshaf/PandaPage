
# Comprehensive Parsing Strategy for Apple iWork Documents in TypeScript

This document outlines a detailed strategy for parsing modern Apple iWork files (Pages, Numbers, Keynote) within a TypeScript/JavaScript environment. The approach is informed by extensive analysis of existing documentation, reverse-engineering efforts by the community (notably SheetJS and the Document Liberation Project's `libetonyek`), and the known structure of iWork's proprietary format.

## Core Principles & Technologies

Modern iWork documents (`.pages`, `.numbers`, `.keynote` files created since 2013) are ZIP archives containing a proprietary, binary format known as **IWA (iWork Archive)**. Parsing these files requires a deep understanding of three core technologies:

1.  **ZIP Decompression**: The top-level container is a standard ZIP archive.
2.  **Custom Snappy Decompression**: The core data files (`.iwa`) are compressed with a non-standard variant of Google's Snappy algorithm.
3.  **Protocol Buffers (Protobuf)**: The decompressed data consists of serialized Protobuf messages. The schemas (`.proto` files) for these messages are not public and must be reverse-engineered.

## Step-by-Step Parsing Workflow

### Step 1: Deconstruct the iWork Bundle

The first step is to access the raw `.iwa` data files.

1.  **Unzip the Container**: Use a JavaScript ZIP library (e.g., `jszip`) to load the `.pages`, `.numbers`, or `.keynote` file and access its contents in memory.
2.  **Locate `Index.zip`**: Within the primary archive, find and unzip the nested `Index.zip` file. This archive contains the core document structure.
3.  **Extract `.iwa` Files**: Read the various `.iwa` files (e.g., `Document.iwa`, `DocumentStylesheet.iwa`, `Metadata.iwa`, `Tables/DataList.iwa`) into memory as `Uint8Array` buffers. These files contain the structured data of the document.
4.  **Map Media Assets**: The `Data/` directory in the main archive contains all embedded media (images, videos). These assets are referenced by ID from within the `.iwa` files. Create a map of these assets for later retrieval.

### Step 2: Implement Custom Snappy Decompression

Apple's implementation of Snappy is non-standard because it **omits the stream identifier header**. This means standard Snappy libraries will fail.

1.  **Find or Build a Compatible Library**:
    *   **Existing Implementations**: Investigate JavaScript Snappy libraries to see if any support a "raw" or "headerless" mode. The `snappyjs` library is a potential candidate but may require verification or modification.
    *   **Port a C++ Implementation**: Analyze the `IWASnappyStream.cpp` from `libetonyek` or the implementation within SheetJS's parser. A direct port or a WebAssembly (Wasm) compilation of this logic is the most reliable path. The logic involves reading chunk headers and decompressing data blocks iteratively.
2.  **Create a Decompression Utility**: Wrap the chosen library or custom code in a utility function: `decompressIWA(iwaBuffer: Uint8Array): Uint8Array`.

### Step 3: Parse Protocol Buffer Messages

This is the most complex step, as it requires handling undocumented Protobuf schemas.

1.  **Acquire `.proto` Definitions**:
    *   **Leverage Community Efforts**: The most practical approach is to use the `.proto` definitions that have already been reverse-engineered. The SheetJS project provides extensive documentation on the iWork message types and their fields.
    *   **Manual Reverse Engineering (If Necessary)**: For unsupported features or new iWork versions, use tools like `proto-dump` to extract schemas from the iWork application binaries on macOS.
2.  **Choose a Protobuf Library**: Use a reliable JavaScript Protobuf library like `protobuf.js`. It supports loading `.proto` definitions at runtime and can serialize/deserialize messages to and from `Uint8Array` buffers.
3.  **Develop a Generic Message Parser**:
    *   The decompressed `.iwa` stream is a series of Protobuf messages. Each message is preceded by a varint-encoded length.
    *   Create a parser that iteratively reads the length, then reads that many bytes into a buffer, and deserializes it into a generic `ArchiveInfo` message (a top-level message containing metadata about the actual message type).
    *   The `ArchiveInfo` message will contain an `identifier` field. This integer ID tells you the *actual* type of the message that follows (e.g., `2001` for `TSWP.StorageArchive`, `6002` for `TST.Tile`).
4.  **Implement a Typed Message Dispatcher**:
    *   Create a mapping from the integer `identifier` to the corresponding Protobuf message type (e.g., `2001: TSWP.StorageArchive`).
    *   After parsing the generic `ArchiveInfo`, use this map to look up the correct message type and then deserialize the *actual* message payload using the specific `.proto` definition.
    *   This creates a stream of fully-typed message objects.

### Step 4: Reconstruct the Document Model

The parsed Protobuf messages are disconnected pieces of the document. They must be assembled into a coherent, hierarchical model.

1.  **Establish an Object Index**: iWork uses a document-wide object indexing system. Messages frequently reference other messages by a unique integer ID.
    *   As you parse the `.iwa` files, populate a `Map<number, ProtobufMessage>` that stores every message with an ID.
    *   The `IWAObjectIndex` from `libetonyek` serves as a conceptual model for this. The `Document.iwa` file is the entry point and contains the root object references.
2.  **Process Stylesheets**:
    *   Parse `DocumentStylesheet.iwa` and `ThemeStylesheet.iwa` first. These contain the `TSS.StylesheetArchive` messages.
    *   Populate a style map (`Map<number, TSS.StyleArchive>`) to resolve style references from content objects. Styles are fundamental to rendering and must be resolved early.
3.  **Build the Content Tree**:
    *   Start with the root object from `Document.iwa` (e.g., `TP.DocumentArchive` for Pages).
    *   Traverse the message tree, following object ID references. For example, a `TP.DocumentArchive` will reference a `TSWP.StorageArchive` (the main text content), which in turn contains paragraphs, which contain text runs, each referencing a style ID.
    *   Create a rich, in-memory document model (e.g., TypeScript classes like `Document`, `Paragraph`, `TextRun`, `Table`) that mirrors the iWork structure but is decoupled from the raw Protobuf objects. This model should resolve all ID references into direct object references.

### Step 5: Render to HTML or Other Formats

Once the document model is fully constructed, you can render it.

1.  **Create Renderer Components**: Develop renderer components for each type of document node (e.g., `renderParagraph`, `renderTable`, `renderImage`).
2.  **Apply Styles**: The renderers must interpret the resolved style objects. This involves mapping iWork's rich style properties (e.g., `TSS.StyleArchive`, `TSWP.ParagraphStyleProperties`, `TSD.StrokeArchive`) to CSS styles. This is a complex task that requires a detailed mapping of properties like font size, color, indentation, borders, and fills.
3.  **Handle Media**: For image nodes, use the media asset map created in Step 1 to retrieve the image data from the `Data/` directory and render it using an `<img>` tag with a data URL or object URL.
4.  **Generate Output**: Traverse the in-memory document model and call the appropriate renderers to generate the final HTML output.

## Key Challenges & Recommendations

*   **Complexity is High**: This is a significant undertaking. Start with a minimal goal, such as extracting plain text, before attempting full, styled rendering.
*   **Leverage Existing Work**: Do not start from scratch. The SheetJS documentation and the `libetonyek` source code are invaluable resources. A deep study of their approach will save months of effort.
*   **TypeScript is Essential**: The complexity of the iWork object model makes TypeScript's static typing indispensable for managing the data structures and ensuring correctness.
*   **Testing is Critical**: Build a comprehensive test suite using a variety of real-world `.pages`, `.numbers`, and `.keynote` files. Include documents with tables, images, different text styles, and complex layouts.

By following this structured approach, it is feasible to build a robust and accurate iWork document parser and renderer in a TypeScript environment.
