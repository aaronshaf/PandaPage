# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PDF.js rewrite using MoonBit and WebAssembly. The project consists of a MoonBit-based PDF parser that compiles to WebAssembly and a browser demo interface.

## Development Commands

All MoonBit commands must be run from the `pdf-parser/` directory with the MoonBit toolchain in PATH:

```bash
cd pdf-parser
export PATH="$HOME/.moon/bin:$PATH"
```

### Building and Testing
- `moon build --target wasm-gc` - Build WebAssembly module (primary target)
- `moon run src/main` - Run the main executable locally for testing
- `moon test` - Run all tests
- `moon fmt` - Format MoonBit source code
- `moon check` - Type check without building

### Browser Testing
- Open `index.html` directly in browser to test the web interface
- Use `python3 -m http.server 8000` from project root for local server if needed

## Architecture

### Core Components

1. **PDF Parser Module** (`pdf-parser/src/lib/`):
   - `pdf_types.mbt` - Type definitions for PDF document structure (PDFObject enum, PDFDocument struct, etc.)
   - `pdf_parser.mbt` - Core parsing functions (parse_pdf_header, find_pdf_objects)
   - `hello.mbt` - Public API interface that bridges to JavaScript

2. **WebAssembly Target**: 
   - Builds to `pdf-parser/target/wasm-gc/release/build/main/main.wasm`
   - Uses MoonBit's WASM-GC compilation target for performance

3. **Browser Integration**:
   - `index.html` contains JavaScript that interfaces with WASM module
   - Currently simulates WASM integration pending full implementation

### PDF Document Model

The PDF parsing is built around a type-safe representation:

- `PDFObject` enum handles all PDF primitive types (strings, numbers, arrays, dictionaries, streams, references)
- `PDFDocument` struct contains header, objects map, cross-reference table, and trailer
- Parser currently handles basic header validation and object detection

### MoonBit Package Structure

- Main module: `ashafovaloff/pdf-parser` 
- Library package: `ashafovaloff/pdf-parser/lib` (contains core logic)
- Main package: `ashafovaloff/pdf-parser/main` (imports lib, provides executable)

## Current Implementation Status

- ✅ PDF header parsing and validation
- ✅ Basic object detection in PDF streams  
- ✅ WebAssembly compilation pipeline
- ✅ Browser demo interface
- 🚧 Full PDF object parsing, content streams, rendering (roadmap items)

## MoonBit Language Notes

- Uses functional programming paradigms with strong typing
- Struct fields use `:` syntax (`field : Type`)
- Pattern matching with `match` expressions
- Error handling with `Result[T, E]` types
- Array/Map collections with functional methods