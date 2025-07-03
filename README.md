# PDF.js WASM Rewrite

A modern PDF parser and renderer built with MoonBit and WebAssembly, designed as a high-performance alternative to PDF.js using cutting-edge technologies.

## 🚀 Features

- **WebAssembly-First**: Built from the ground up for WebAssembly performance
- **MoonBit Language**: Leverages MoonBit's modern language features and excellent WASM compilation
- **Modular Architecture**: Clean separation between PDF parsing, rendering, and browser integration
- **Type Safety**: Full type safety with MoonBit's advanced type system
- **Browser Integration**: Simple JavaScript API for easy integration

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

- **Language**: [MoonBit](https://moonbitlang.com) - Modern functional language
- **Compilation**: WebAssembly (WASM-GC target)
- **Build System**: Moon Build System
- **Frontend**: Vanilla HTML5/JavaScript
- **Testing**: MoonBit test framework

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
- [x] Basic PDF parsing
- [x] WebAssembly compilation
- [x] Browser integration demo

### Phase 2: Core Features
- [ ] Complete PDF object parsing
- [ ] Content stream decoding
- [ ] Font handling
- [ ] Image extraction

### Phase 3: Rendering
- [ ] Canvas-based rendering
- [ ] Text extraction
- [ ] Interactive features
- [ ] Form handling

### Phase 4: Optimization
- [ ] Memory optimization
- [ ] Streaming parsing
- [ ] Worker thread support
- [ ] Caching strategies

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔍 Project Status

This is a proof-of-concept implementation demonstrating the feasibility of building a high-performance PDF parser with MoonBit and WebAssembly. The project successfully:

- Parses basic PDF headers
- Compiles to WebAssembly
- Integrates with browser environments
- Provides a foundation for full PDF.js replacement

**Note**: This is an early-stage project. For production use, consider the original PDF.js until this implementation reaches feature parity.