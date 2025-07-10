# Parsing Strategy for Apple Pages Documents

Parsing Apple Pages documents, especially the modern (2013+) Protocol Buffer-based format, requires a multi-step strategy. This document outlines a high-level approach, drawing insights from existing implementations like `libetonyek`.

## 1. Deconstruct the Pages Bundle (ZIP Archive)

Since a `.pages` file is a ZIP archive, the first step is to decompress it. The critical component within this archive is `Index.zip`, which contains the core document data.

**Steps:**
1.  **Unzip the `.pages` file:** Extract its contents to a temporary directory.
2.  **Locate `Index.zip`:** Find and extract `Index.zip` from the unzipped `.pages` content.
3.  **Identify `.iwa` files:** Within the extracted `Index.zip`, identify the various `.iwa` files (e.g., `Document.iwa`, `DocumentStylesheet.iwa`, `Metadata.iwa`). These files hold the actual structured data.

## 2. Decompress IWA Files (Custom Snappy)

Each `.iwa` file is compressed using Apple's custom Snappy implementation. This is a crucial step that often requires a specialized decompression routine, as confirmed by the `IWASnappyStream` class in `libetonyek`.

**Steps:**
1.  **Read `.iwa` file content:** Load the binary content of an `.iwa` file.
2.  **Apply custom Snappy decompression:** Utilize a decompressor (like `IWASnappyStream::uncompressBlock`) that accounts for Apple's non-standard Snappy framing (i.e., no stream identifier). The decompressed stream might also be structured, potentially containing multiple logical substreams.

## 3. Parse Protocol Buffer Messages and Resolve Objects

The decompressed `.iwa` content is a stream of Protocol Buffer messages. To make sense of this binary data, you need the corresponding `.proto` definitions and a Protobuf parsing library. The `libetonyek` library uses `IWAMessage` to represent these messages and `IWAParser` to orchestrate their processing. SheetJS's implementation further clarifies the generic structure of these messages.

**Steps:**
1.  **Obtain `.proto` definitions:** Since Apple does not publish these, they must be reverse-engineered from iWork executables using tools like `proto-dump` or by analyzing tools like SheetJS's `packages/otorp/`. These definitions describe the structure of the messages (e.g., `DocumentArchive`, `StylesheetArchive`).
2.  **Deserialize Protobuf data:** Use a Protobuf library (or `IWAMessage` in `libetonyek`, or SheetJS's `parse_shallow` function) to deserialize the binary data into structured objects. This involves mapping the raw bytes to generic `ProtoItem`s, which are then grouped into `ProtoField`s and finally into `ProtoMessage`s based on field numbers and wire types. `IWAMessage` provides methods to access various field types (e.g., `uint32`, `string`, `message`).
3.  **Resolve Object IDs:** A critical step is resolving internal object IDs to their corresponding data. The `IWAObjectIndex` (in `libetonyek`) is central to this. It maps object IDs to their types and `IWAMessage` (or `ProtoMessage`) data, and also handles mapping file IDs to streams (e.g., for embedded media) and even colors.
4.  **Dispatch and Process:** The `IWAParser` dispatches different types of objects (shapes, text, comments, styles) to specific parsing methods. It also provides helper methods to extract common iWork data types (e.g., `readRef`, `readPosition`, `readColor`, `readStroke`) from `IWAMessage` fields.

## 4. Reconstruct Document Structure

The parsed Protobuf messages represent various parts of the document (text, styles, images, tables, etc.). The next step is to assemble these into a coherent document model.

**Steps:**
1.  **Process `Document.iwa`:** This file typically contains the main document structure, including references to other components.
2.  **Process `DocumentStylesheet.iwa`:** This file defines the styles used throughout the document. Styles are fundamental for rendering and formatting.
3.  **Resolve object references:** Pages documents use an object indexing system (e.g., `IWAObjectIndex` in `libetonyek`) to refer to different parts of the document. You'll need to build a lookup mechanism to resolve these references.
4.  **Build an in-memory document model:** Create a hierarchical representation of the document, linking text runs to styles, images to their data, and tables to their cells.

## 5. Extract Content and Render (Optional)

Once the document model is built, you can extract specific content (e.g., plain text, images) or proceed to render the document.

**Steps:**
1.  **Iterate through document elements:** Traverse your in-memory document model.
2.  **Extract text:** Identify text runs and concatenate them.
3.  **Extract media:** Locate image and other media references and extract their binary data from the `Data/` directory within the original `.pages` bundle.
4.  **Apply styles and layout:** For rendering, interpret the style properties and layout information to display the document accurately.

## Key Considerations and Challenges

*   **Reverse Engineering:** The lack of official documentation for the modern format means continuous reverse engineering is necessary as Apple updates the format.
*   **Version Compatibility:** Pages documents have evolved, and parsers need to account for different versions (e.g., `PAG1Parser` in `libetonyek` for older XML formats).
*   **Complexity of Document Model:** The iWork document model is rich and complex, supporting a wide array of features (tables, charts, shapes, annotations), each requiring specific parsing logic.
*   **Performance:** Efficiently handling large documents and binary data is crucial for a responsive parser.

By following this strategy, developers can systematically approach the challenge of parsing Apple Pages documents and build robust applications for viewing or converting them.