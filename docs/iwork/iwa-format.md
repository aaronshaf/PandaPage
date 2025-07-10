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

### Generic Protobuf Message Structure (as seen in SheetJS)

SheetJS's implementation reveals a generic representation of Protobuf messages, reflecting the wire format:
*   **`ProtoItem`**: Represents a single field value, typically `{ data: Uint8Array, type: number }`, where `type` corresponds to the Protobuf wire type (e.g., varint, length-delimited).
*   **`ProtoField`**: An array of `ProtoItem`s, as a single field number can appear multiple times in a message.
*   **`ProtoMessage`**: An array of `ProtoField`s, where the array index often corresponds to the Protobuf field number.

### .proto Definitions and Reverse Engineering

To semantically parse these binary messages, you need the `.proto` definitions (schemas). Since Apple does not publicly release these, they must be reverse-engineered. Tools like `proto-dump` (mentioned previously) and SheetJS's `packages/otorp/` module are designed for this purpose. `otorp` specifically aims to recover `FileDescriptorProto` definitions from Mach-O binaries, which are the compiled `.proto` files.

### Identified iWork Protobuf Message IDs

Analysis of SheetJS's `numbers.ts` reveals various hardcoded message IDs, which correspond to specific iWork Protobuf message types. These IDs are crucial for understanding the semantic meaning of different parts of the IWA file:
*   `6002`: Often related to table tiles (e.g., `TST.Tile`).
*   `6144`: Appears related to merged cells.
*   `212`: Associated with comment authors.
*   `3056`: Associated with comments themselves.
*   `2001`: Likely `TSWPSAS` (Text Storage with Paragraph Styles Archive).
*   `6218`: Possibly `RTPAID` (Rich Text Paragraph Attributes ID).

These IDs, combined with the field numbers within their respective `ProtoMessage` structures, form the basis of the inferred iWork schema.

## 4. Reverse Engineering and Tools

Due to the proprietary nature of the modern Pages format, reverse engineering is essential. Key tools and resources for this process include:
*   **`proto-dump`:** For extracting Protobuf descriptors from iWork applications.
*   **SheetJS `packages/otorp/`:** A concrete example of a tool for recovering `.proto` definitions from Mach-O binaries. It contains logic to find `.proto` strings and parse `FileDescriptorProto`.
*   **Binary analysis tools:** Such as Synalyze It! or Hexinator, for examining the raw binary structure of `.iwa` files.
*   **`snzip`:** A reference implementation for Snappy compression, which can be helpful in understanding the compression algorithm.
*   **SheetJS `modules/83_numbers.ts`:** Provides a working JavaScript implementation of IWA parsing, including Apple's custom Snappy and Protobuf message handling, serving as a valuable reference for reverse engineering efforts.