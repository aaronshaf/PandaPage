
# Reverse Engineering the iWork File Format

Given that Apple does not officially document the modern (2013+) iWork file format, **reverse engineering is the only way** to build third-party parsers, viewers, or editors. This process involves systematically deconstructing the binary format to understand its structure and logic.

## The Core Problem: An Opaque Binary Format

The fundamental challenge is that the modern iWork format is a proprietary, undocumented binary. While the legacy XML format was transparent, the shift to the **IWA (iWork Archive)** format in 2013 introduced two primary layers of obscurity:

1.  **Custom Snappy Compression**: The `.iwa` data files are compressed, but with a non-standard framing of Google's Snappy algorithm that most libraries cannot handle out-of-the-box.
2.  **Undocumented Protocol Buffers (Protobuf)**: The decompressed data is a stream of Protobuf messages, but Apple does not publish the crucial `.proto` schema files required to interpret them.

Reverse engineering is the process of peeling back these layers.

## A Practical, Iterative Approach

Reverse engineering the IWA format is not a linear task but an iterative cycle of investigation and experimentation. The most effective approach involves several parallel strategies.

### 1. Black-Box Analysis (The "Diffing" Method)

This is the most common starting point. The process involves treating the iWork application as a "black box" and observing its output.

1.  **Create a Base Document**: Start with a very simple document (e.g., a single word of text).
2.  **Make One Small Change**: Modify the document in a minimal way (e.g., make the word bold, add a character, change the font size).
3.  **Save and Unzip**: Save the new version and unzip both the original and modified `.pages` files.
4.  **Compare the Files (`diff`)**: Use a binary diffing tool to compare the `.iwa` files from both versions. The differences will pinpoint the exact bytes that changed, allowing you to correlate a specific feature (like "bold") with a specific binary pattern in a Protobuf message.
5.  **Repeat**: Continue this process for every feature you want to support (tables, images, lists, etc.). This is painstaking but highly effective for mapping features to Protobuf fields.

### 2. Schema Extraction

While diffing helps identify fields, you still need the overall structure of the Protobuf messages. This is where schema extraction comes in.

*   **Use `proto-dump`**: This is the most critical tool. It's a specialized utility that can inspect the compiled iWork application binaries (on macOS) and extract the embedded Protobuf schema definitions (`.proto` files). This gives you the message names, field numbers, and data types, providing a structural map for the binary data you see.
*   **Search Application Binaries**: Use tools like `strings` and `grep` on the iWork application binaries to find references to `google::protobuf` or other revealing text, which can provide clues about internal data structures.

### 3. Runtime Analysis

This advanced technique involves observing the iWork application while it is running.

*   **Memory Inspection**: Use debugging tools (like those in Xcode) to attach to the running Pages process and inspect its memory. You can observe how the application constructs and manipulates its internal data objects before they are serialized into the IWA format.
*   **Function Tracing**: Trace the execution flow of the saving and loading functions to see how the data is transformed and written to disk.

## Essential Toolkit for Reverse Engineering

*   **A Mac with iWork**: Necessary for creating test documents and for schema extraction.
*   **ZIP Utility**: To unpack the `.pages` bundle.
*   **Binary Diff Tool**: To compare `.iwa` files (e.g., `VBinDiff`, `kdiff3`).
*   **Hex Editor / Binary Analyzer**: To inspect raw binary data (e.g., Synalyze It!, Hexinator).
*   **`proto-dump`**: For extracting the Protobuf schemas.
*   **Custom Snappy Decompressor**: You will need to find or write a tool that can handle Apple's non-standard Snappy framing.
*   **Protobuf Compiler/Library**: A library for your chosen language (e.g., `protobuf.js`) to work with the extracted schemas.

By combining these techniques, the open-source community has successfully reverse-engineered a large portion of the iWork file format, enabling the creation of powerful tools like `libetonyek` and providing a clear path for future development.
