# Apple Pages File Format: Technical Guide for Implementation

Understanding and implementing parsers for Apple Pages files requires navigating two distinct generations of the format, each with its own complexities and documentation status.

## Two Distinct Format Generations

1.  **Legacy XML Format (2005-2013):** The original Pages format was officially documented by Apple in the "iWork Programming Guide." This specification provided comprehensive XML schema documentation, detailing element definitions, document hierarchy, drawable objects, text formatting, and style system implementation.
2.  **Modern Protocol Buffers Format (2013+):** Beginning in 2013, Apple completely redesigned the format, adopting Google Protocol Buffers with Snappy compression. This modern format has never been officially documented by Apple, necessitating extensive reverse engineering efforts by the community.

## Modern Format (2013+): Deep Dive

The critical breakthrough in understanding the modern Pages format came from Sean Patrick O'Brien's iWorkFileFormat documentation. Key findings include:

*   **Container Structure:** Pages files are essentially ZIP archives. Inside, they contain an `Index.zip` file.
*   **IWA Files:** Within `Index.zip`, the core document data is stored in `.iwa` files. These are Snappy-compressed Protocol Buffer streams.
*   **Custom Snappy Implementation:** Apple uses a non-standard Snappy framing without a Stream Identifier, which requires a specific decompression approach.
*   **Protocol Buffer Messages:** The `.iwa` files contain Protocol Buffer messages. Their types have been extracted from iWork executables using tools like `proto-dump`.

### Internal File Structure Revealed

A modern Pages bundle (`document.pages/`) typically has the following high-level structure:

```
document.pages/
├── Index.zip/             # Contains core document data
│   ├── Document.iwa         # Main document structure
│   ├── DocumentStylesheet.iwa
│   ├── Metadata.iwa
│   └── Tables/
│       └── DataList.iwa
├── Data/                    # Stores media assets
├── Metadata/               # Contains bundle-specific metadata
├── preview.jpg             # High-resolution document preview
└── preview-micro.jpg       # Thumbnail preview
```

Each `.iwa` file itself follows a specific internal structure:

*   A 4-byte header (typically `0x00` followed by a 3-byte length indicator).
*   Subsequent data consists of Snappy-compressed Protobuf packets.
*   The specific Protobuf message types within these packets are mapped to definitions derived from reverse engineering.

## Working Open Source Implementations

Based on community research, several functional parsers have emerged:

*   **Go Implementation (iwork2html):** Converts Pages files to HTML, supporting both modern and legacy formats.
*   **Python Implementation (numbers-parser):** A comprehensive library supporting iWork files from version 10.3 to 14.1, offering both reading and writing capabilities.
*   **Python Implementation (Stingray Reader):** Provides a unified API for spreadsheet formats, including custom Snappy decompression and Protobuf parsing for iWork archives.

## Interoperability and Challenges

*   **No Dedicated JavaScript Libraries for Pages:** Currently, there are no dedicated JavaScript or browser-native libraries specifically for parsing Pages files, representing a significant development opportunity.
*   **General Office File Parsers:** While not directly supporting Pages, libraries like [officeParser](https://github.com/harshankur/officeParser) (a Node.js library available on [npm](https://www.npmjs.com/package/officeparser)) exist for parsing text from other office formats (e.g., DOCX, PPTX, XLSX, ODT, ODP, ODS). This highlights the ecosystem for other document types.
*   **LibreOffice Support:** [LibreOffice](https://github.com/LibreOffice/core) offers the most robust non-Apple support for importing Pages files, and its experimental WebAssembly port (LOWA) could potentially enable browser-based Pages support in the future.

## Libetonyek: A C++ Reference Implementation

Libetonyek is a C++ library designed to parse and import Apple iWork documents (Pages, Keynote, Numbers), specifically enabling applications like LibreOffice to read and convert Pages documents (supporting versions 1-4) into other formats. It is part of the Document Liberation Project and relies on dependencies like librevenge and libxml2. Its source code can be obtained from the [Document Foundation Wiki](https://wiki.documentfoundation.org/DLP/Libraries/libetonyek#Getting_the_sources) via `git clone git://gerrit.libreoffice.org/libetonyek`.

An examination of `libetonyek`'s build configuration (e.g., `Library_etonyek.mk` from the LibreOffice source) reveals its internal structure and dependencies, which are crucial for understanding its parsing capabilities:

*   **Key External Dependencies:** `libetonyek` relies on several external libraries, including `libxml2` (for XML parsing, likely for older iWork formats), `revenge` (from the Document Liberation Project, providing common document parsing utilities), and `zlib` (for decompression, which would include handling gzipped XML files).
*   **Core IWA Parsing Components:** The library includes modules specifically for handling the IWA format, such as `IWASnappyStream` (for Snappy decompression), `IWAParser`, `IWAField`, `IWAMessage`, and `IWAObjectIndex` (for parsing Protocol Buffer structures).
*   **Version-Specific Parsers:** `libetonyek` contains distinct parsing logic for different iWork versions, indicated by files like `PAG1Parser` (for Pages 1.x XML), `KEY6Parser`, and `NUM3Parser`, demonstrating its ability to handle the format's evolution.
*   **Document Component Handling:** Numerous modules are dedicated to parsing specific document components, such as `IWORKChart`, `IWORKTable`, `IWORKText`, `IWORKShape`, and `IWORKStyle`, reflecting the granular nature of iWork document structures.

This detailed internal view of `libetonyek` underscores the complexity involved in fully parsing iWork documents and provides valuable insights for anyone attempting to build a new parser.

## Comparison with OOXML

While both Pages and Office Open XML (OOXML) formats use ZIP containers, they differ fundamentally:

*   **OOXML:** A standardized XML-based format with publicly available schemas.
*   **Pages XML (Legacy):** Proprietary but documented XML format.
*   **Pages 2013+ (Modern):** Binary Protocol Buffers, offering significantly faster parsing (20-100x faster than XML).

## Format Evolution and Compatibility

The Pages format has evolved through three major versions, each introducing compatibility breaks:

*   **iWork '05-'08:** Basic XML format.
*   **iWork '09:** Enhanced XML with improved media handling.
*   **iWork '13+:** Complete redesign using Protocol Buffers.

Apple has provided official documentation only for the original XML format, and changes to the modern format should be expected.

## Essential Tools for Analysis

For those undertaking implementation work, the following tools are critical:

*   **proto-dump:** Extracts Protobuf descriptors directly from iWork applications.
*   **Synalyze It!/Hexinator:** Binary structure analysis tools.
*   **snzip:** A reference implementation for Snappy compression.
*   **SheetJS iWork parser documentation:** Provides detailed Protobuf message documentation.

## Implementation Recommendations

For building a browser-based renderer, especially alongside OOXML support, consider the following approach:

1.  **Consult SheetJS Documentation:** Utilize their detailed Protobuf message definitions as a primary reference.
2.  **Study Go iwork2html:** Analyze this implementation for a working reference of the parsing process.
3.  **Leverage LibreOffice's libetonyek:** Use this C++ library as a robust reference implementation of Apple Pages. Libetonyek is designed to parse and import Apple iWork documents (Pages, Keynote, Numbers), specifically enabling applications like LibreOffice to read and convert Pages documents (supporting versions 1-4) into other formats. It is part of the Document Liberation Project and relies on dependencies like librevenge and libxml2.
4.  **Implement Custom Snappy Decompression:** Account for Apple's non-standard Snappy framing.
5.  **Build a Protobuf Parser:** Develop a parser specifically for the identified message types.
6.  **Extract Preview Images:** As a fallback, extract and utilize the embedded preview images for basic rendering.

The absence of existing JavaScript implementations presents a unique opportunity to develop the first browser-native Pages parser. Given the format's complexity, it is advisable to begin with basic text extraction before attempting full rendering capabilities.