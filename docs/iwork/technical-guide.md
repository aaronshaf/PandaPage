
# Technical Guide to the Apple iWork File Format

This guide provides a detailed technical overview of the Apple iWork file format, focusing on the modern (2013+) binary structure. It is intended for developers seeking to implement parsers or viewers for `.pages`, `.numbers`, or `.keynote` files.

## Format Generations: A Tale of Two Architectures

Understanding iWork files requires recognizing two distinct format generations:

1.  **Legacy XML Format (Pre-2013)**: The original format was a transparent, XML-based structure. It was officially documented by Apple, making it relatively straightforward to parse.
2.  **Modern IWA/Protobuf Format (2013+)**: The current format is a high-performance, proprietary binary format. It is **not** officially documented, and all knowledge is derived from community reverse-engineering efforts.

This guide focuses exclusively on the **modern format** due to its relevance and complexity.

## Core Technologies of the Modern Format

The modern iWork format is built on two key technologies from Google, chosen for performance and efficiency:

*   **Protocol Buffers (Protobuf)**: A language-neutral, binary serialization format. It is used to structure and store all document data, from text and shapes to styles and metadata.
*   **Snappy Compression**: A fast compression/decompression library. It is used to compress the Protobuf data streams, reducing file size and improving load times.

## High-Level File Structure

An iWork file (e.g., `MyDocument.pages`) is a standard **ZIP archive**. You can inspect its contents by changing the extension to `.zip` and unzipping it. The internal structure is as follows:

```
MyDocument.pages/
├── Index.zip/             # A nested ZIP containing the core document data in IWA format.
├── Data/                    # Directory containing all original, full-resolution media assets (images, videos).
├── Metadata/               # Contains bundle-specific metadata (e.g., version history).
├── preview.jpg             # A high-resolution preview image of the document.
└── preview-micro.jpg       # A small thumbnail preview.
```

### The IWA (iWork Archive) Format

The most critical component is `Index.zip`. When unzipped, it reveals a set of files with the `.iwa` extension. These are the core of the document.

*   **`.iwa` Files**: Each `.iwa` file is a **Snappy-compressed stream of Protocol Buffer messages**. They are not encrypted, but they are binary and require specialized parsing.
*   **File Naming**: The filenames provide clues to their content (e.g., `Document.iwa`, `DocumentStylesheet.iwa`, `Tables/DataList.iwa`).

## The Parsing Challenge: A Multi-Layer Problem

Parsing an iWork document is a multi-step process:

1.  **Unzip the Main Container**: Access the `Index.zip` and `Data/` directory.
2.  **Unzip `Index.zip`**: Extract the `.iwa` files.
3.  **Decompress `.iwa` Files**: This is a major hurdle. Apple uses a **non-standard Snappy framing that omits the stream identifier header**. Standard Snappy libraries will not work out-of-the-box. A custom decompressor that can handle this raw, headerless format is required.
4.  **Parse Protobuf Messages**: The decompressed data is a stream of Protobuf messages. This is the second major hurdle, as Apple does not publish the `.proto` schemas. These schemas must be obtained from reverse-engineering efforts.

## Essential Tools and Resources for Implementation

Building a parser is not a simple task. Leverage the extensive work already done by the open-source community.

### Schema Extraction: The Critical First Step

The most significant challenge in parsing the IWA format is the lack of official Protocol Buffer (`.proto`) schemas. The most reliable way to obtain these is to extract them directly from the iWork application binaries on macOS.

*   **SheetJS `otorp`**: This is a purpose-built tool for this exact task. It analyzes a Mach-O binary (like the `Pages` application executable), finds the embedded `.proto` definitions, and extracts them into usable files. **Using a tool like `otorp` should be considered a prerequisite for any serious parsing project.**
*   **`proto-dump`**: A similar tool that can also extract Protobuf definitions from binaries.

### Reference Implementations

*   **`libetonyek` (C++)**: The library used by LibreOffice. It is the most complete open-source implementation and serves as an invaluable reference for the custom Snappy decompression and the overall document model.
*   **SheetJS `js-iwork`**: The SheetJS project provides detailed documentation and partial implementations that are highly valuable.
*   **`iwork2html` (Go)**: A functional command-line tool that converts iWork files to HTML, offering a practical reference for a complete parsing pipeline.

## Implementation Recommendations for a TypeScript/Web Parser

1.  **Obtain Schemas**: Use `otorp` or a similar tool to extract the `.proto` schemas from the iWork applications. This is the foundation of your parser.
2.  **Handle ZIP**: Use a library like `jszip` to handle the outer iWork archive and the nested `Index.zip`.
3.  **Solve Snappy Decompression**: Implement or find a library that can handle Apple's non-standard, headerless Snappy compression. Porting the logic from `libetonyek` or `iwork2html` (possibly to Wasm) is a reliable strategy.
4.  **Parse Protobuf**: Use `protobuf.js` to load the schemas you extracted and to deserialize the `.iwa` message streams.
5.  **Build a Message Dispatcher**: The `.iwa` stream contains multiple message types. You will need to parse a generic wrapper message first to identify the type of the main message payload, then deserialize the payload using the correct schema definition.
6.  **Construct a Document Model**: The parsed Protobuf messages are a flat list of objects with ID-based references. You must build a hierarchical document model in memory by resolving these references, starting from the root object in `Document.iwa`.
7.  **Render the Model**: Once you have a coherent document model, you can traverse it to render HTML, extract text, or convert to another format. This involves mapping iWork's complex styling objects to CSS.

Due to the complexity, it is advisable to **start with a minimal goal**, such as extracting plain text, before attempting a full, high-fidelity renderer.
