
# Understanding the Apple iWork File Format

This directory contains a comprehensive set of documentation detailing the Apple iWork file format, with a primary focus on the modern, binary format used since 2013. The goal of this documentation is to provide the necessary technical knowledge for developers seeking to build parsers, viewers, or other tools that interact with `.pages`, `.numbers`, and `.keynote` files.

## Table of Contents

1.  **[iWork Overview](./iwork-overview.md)**
    *   An introduction to the iWork suite and the history of its file format.

2.  **[Format Evolution: From XML to Protobuf](./format-evolution.md)**
    *   A detailed comparison of the legacy XML format and the modern binary format, explaining the reasons for and implications of the transition.

3.  **[Technical Guide](./technical-guide.md)**
    *   A high-level technical guide for developers, outlining the core technologies (ZIP, Snappy, Protobuf) and providing a list of essential tools and resources.

4.  **[Comprehensive Parsing Strategy for TypeScript](./parsing-strategy.md)**
    *   A detailed, step-by-step plan for implementing a robust iWork parser specifically in a TypeScript/JavaScript environment.

5.  **[Reverse Engineering Guide](./reverse-engineering.md)**
    *   A practical guide to the techniques and tools required to reverse-engineer the proprietary and undocumented IWA format.

6.  **[Legacy XML Format Guide](./xml-legacy-format.md)**
    *   A guide to the structure and parsing of the older, XML-based iWork format (pre-2013).

## Core Concepts

The modern iWork file is a **ZIP archive** containing a proprietary format called **IWA (iWork Archive)**. Parsing it requires three key steps:

1.  **Unzipping** the main container and the nested `Index.zip`.
2.  **Decompressing** the `.iwa` files using a custom implementation of the **Snappy** algorithm.
3.  **Parsing** the resulting binary data using reverse-engineered **Protocol Buffer (Protobuf)** schemas.

This documentation provides the necessary details to tackle each of these steps.
