# IWA Format: The Core of Modern Apple Pages Documents

Modern Apple Pages documents (2013+) primarily store their content within `.iwa` files, which are a crucial component of the overall `.pages` bundle. Understanding the structure and encoding of these files is fundamental to parsing Pages documents.

## 1. IWA File Structure

A `.pages` file is essentially a ZIP archive. Inside this archive, the most critical component is `Index.zip`, which itself contains the `.iwa` files.

The typical high-level structure within a modern Pages bundle (`document.pages/`) includes:

```
document.pages/
├── Index.zip/             # Contains core document data
│   ├── Document.iwa         # Main document structure
│   ├── DocumentStylesheet.iwa
│   ├── Metadata.iwa
│   └── Tables/
│       └── DataList.iwa
├── Data/                    # Stores media assets (images, etc.)
├── Metadata/               # Contains bundle-specific metadata
├── preview.jpg             # High-resolution document preview
└── preview-micro.jpg       # Thumbnail preview
```

Each individual `.iwa` file follows a specific internal structure:
*   A 4-byte header (typically `0x00` followed by a 3-byte length indicator).
*   Subsequent data consists of Snappy-compressed Protocol Buffer packets.

## 2. Snappy Compression

Apple utilizes Snappy compression for the `.iwa` files to achieve efficient storage and faster parsing compared to the older XML-based format. However, it's important to note that Apple uses a **non-standard Snappy framing without a Stream Identifier**. This means standard Snappy decompression libraries might not work directly, and a custom decompression approach is often required.

Key characteristics of Apple's Snappy implementation:
*   **No Stream Identifier:** Unlike the standard Snappy format, Apple's implementation omits the stream identifier.
*   **Block-based Compression:** Data within `.iwa` files is compressed in blocks.

## 3. Protocol Buffers (Protobuf)

The decompressed content of `.iwa` files consists of Google Protocol Buffer messages. Protocol Buffers are a language-neutral, platform-neutral, extensible mechanism for serializing structured data.

To parse the Protobuf messages, you need:
*   **`.proto` definitions:** These define the structure of the messages. Since Apple does not publicly release these, they must be reverse-engineered. Tools like `proto-dump` are used to extract these definitions from iWork executables.
*   **Protobuf parser:** A library or custom code to deserialize the binary Protobuf data into structured objects based on the `.proto` definitions.

The `libetonyek` library, for instance, includes modules specifically for handling the IWA format, such as `IWASnappyStream` (for Snappy decompression), `IWAParser`, `IWAField`, `IWAMessage`, and `IWAObjectIndex` (for parsing Protocol Buffer structures). This confirms the reliance on Snappy and Protobuf for modern Pages documents.

## 4. Reverse Engineering and Tools

Due to the proprietary nature of the modern Pages format, reverse engineering is essential. Key tools and resources for this process include:
*   **`proto-dump`:** For extracting Protobuf descriptors from iWork applications.
*   **Binary analysis tools:** Such as Synalyze It! or Hexinator, for examining the raw binary structure of `.iwa` files.
*   **`snzip`:** A reference implementation for Snappy compression, which can be helpful in understanding the compression algorithm.
*   **SheetJS iWork parser documentation:** Provides valuable, community-derived Protobuf message documentation.

By understanding the IWA file structure, Apple's specific Snappy implementation, and the role of Protocol Buffers, developers can begin to build parsers for modern Apple Pages documents.