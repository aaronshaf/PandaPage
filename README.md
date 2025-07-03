# PDF.js WASM Rewrite

**⚠️ ALPHA / WORK IN PROGRESS ⚠️**

An experimental PDF parser and renderer built with MoonBit and WebAssembly. This project is in early development and demonstrates the feasibility of a PDF.js alternative using modern web technologies.

## 🚀 Planned Features (In Development)

- **WebAssembly-First**: Targeting WebAssembly for high-performance parsing
- **MoonBit Language**: Exploring MoonBit's modern language features for PDF processing
- **Modular Architecture**: Designing clean separation between parsing, rendering, and browser integration
- **Type Safety**: Planning full type safety with MoonBit's advanced type system
- **Multiple Viewing Modes**: Canvas rendering, PDF-to-Markdown, and hybrid approaches

## 🏗️ Architecture

### Core Components

1. **PDF Parser** (`pdf-parser/src/lib/`):
   - `pdf_types.mbt` - PDF document structure definitions
   - `pdf_parser.mbt` - Core parsing logic
   - `hello.mbt` - Public API interface

2. **WebAssembly Module** (`pdf-parser/target/wasm-gc/`):
   - Compiled WASM binary for browser execution
   - Optimized for performance with MoonBit's WASM-GC target

3. **Browser Integration** (`index.html`):
   - HTML5 drag-and-drop interface
   - JavaScript bridge to WASM module
   - Real-time PDF analysis display

## 📦 Installation & Setup

### Prerequisites

- MoonBit toolchain (installed automatically)
- Modern web browser with WebAssembly support
- Git for version control

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ashafovaloff/PDFWasm.git
cd PDFWasm
```

2. The MoonBit toolchain has been automatically installed to `~/.moon/bin/`

3. Build the WebAssembly module:
```bash
cd pdf-parser
export PATH="$HOME/.moon/bin:$PATH"
moon build --target wasm-gc
```

4. Open the demo in your browser:
```bash
open index.html
```

## 🔧 Development

### Project Structure

```
PDFWasm/
├── pdf-parser/           # MoonBit PDF parsing module
│   ├── src/
│   │   ├── lib/         # Core library
│   │   │   ├── pdf_types.mbt     # Type definitions
│   │   │   ├── pdf_parser.mbt    # Parser implementation
│   │   │   └── hello.mbt         # Public API
│   │   └── main/        # Main executable
│   │       └── main.mbt
│   ├── target/          # Build artifacts
│   │   └── wasm-gc/     # WebAssembly builds
│   └── moon.mod.json    # MoonBit project configuration
├── examples/            # Sample PDF files
│   └── sample1.pdf
├── index.html          # Browser demo
└── README.md
```

### Building

```bash
# Build for WebAssembly
moon build --target wasm-gc

# Run tests
moon test

# Format code
moon fmt

# Run locally
moon run src/main
```

### PDF Format Support

Current implementation supports:
- ✅ PDF header parsing
- ✅ Basic object detection
- ✅ Stream identification
- 🚧 Object cross-reference parsing
- 🚧 Content stream decoding
- 🚧 Font and image extraction
- 🚧 Page rendering

## 📈 Performance Goals

- **Startup Time**: <100ms for WASM module initialization
- **Parse Time**: <50ms for typical PDF documents
- **Memory Usage**: <10MB for average documents
- **File Size**: <500KB for the WASM module

## 🛠️ Technology Stack

### Core Technologies
- **Language**: [MoonBit](https://moonbitlang.com) - Modern functional language
- **Compilation**: WebAssembly (WASM-GC target) for high-performance parsing
- **Build System**: Moon Build System
- **Frontend**: Vanilla HTML5/JavaScript

### Performance & Architecture
- **Web Workers**: Background PDF processing without blocking UI
- **SharedArrayBuffer**: Zero-copy data sharing between main thread and workers
- **OffscreenCanvas**: GPU-accelerated rendering for smooth scrolling
- **Streaming & Progressive Loading**: Handle large PDFs incrementally
- **Memory Management**: Efficient WASM memory allocation and cleanup

### Viewing Modes
- **Canvas Mode**: Traditional paginated PDF rendering (desktop-optimized)
- **PDF-to-Markdown Mode**: Text-based view for mobile devices and accessibility
- **Hybrid Mode**: Adaptive rendering based on device capabilities

### Development & Testing
- **Testing Framework**: MoonBit test framework + browser automation
- **Performance Monitoring**: Real-time metrics for parsing and rendering

## 📚 Learning Resources

- [MoonBit Language Tour](https://tour.moonbitlang.com)
- [MoonBit Documentation](https://docs.moonbitlang.com)
- [PDF Format Specification](https://www.adobe.com/content/dam/acom/en/devnet/pdf/pdfs/PDF32000_2008.pdf)
- [WebAssembly Documentation](https://webassembly.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## 🎯 Roadmap

### Phase 1: Foundation (Current)
- [x] MoonBit toolchain setup
- [x] Basic PDF parsing with WASM
- [x] WebAssembly compilation pipeline
- [x] Browser integration demo

### Phase 2: Core Architecture
- [ ] Web Worker integration for background processing
- [ ] Streaming PDF parser for large files
- [ ] Complete PDF object parsing (xref tables, trailers)
- [ ] Content stream decoding and decompression
- [ ] Font and image extraction

### Phase 3: Rendering Modes
- [ ] **Canvas Mode**: Traditional paginated rendering with OffscreenCanvas
- [ ] **PDF-to-Markdown Mode**: Text extraction for mobile/accessibility
- [ ] **Hybrid Mode**: Adaptive rendering based on device
- [ ] Progressive loading and viewport-based rendering
- [ ] Interactive features and form handling

### Phase 4: Performance & Production
- [ ] Memory optimization and WASM heap management
- [ ] Caching strategies for parsed content
- [ ] Real-time performance monitoring
- [ ] Cross-browser compatibility testing
- [ ] Mobile optimization and touch interactions

## 🔍 Current Status

**Alpha Development - Not Ready for Production**

This is an experimental proof-of-concept demonstrating the potential for a PDF.js alternative. Current progress:

**✅ Working:**
- MoonBit toolchain setup and WebAssembly compilation
- Basic PDF header validation (JavaScript implementation)
- Browser demo interface with file upload
- Modern responsive layout

**🚧 In Development:**
- MoonBit-JavaScript interface bridge for WASM function calls
- Actual PDF parsing in MoonBit (currently simulated in JavaScript)
- Cross-reference table parsing and object extraction

**📋 Planned:**
- Web Worker integration for background processing
- Canvas and PDF-to-Markdown viewing modes
- SharedArrayBuffer for zero-copy data sharing
- OffscreenCanvas for GPU-accelerated rendering

**⚠️ Important**: This is experimental software. Use the original PDF.js for production applications.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.