# PandaPage

A library for parsing and rendering modern document formats in the browser. PandaPage enables web applications to work with native office documents without server-side processing.

## Project Goals

The primary goal of PandaPage is to support parsing and rendering of modern documents directly in the browser:
- **Microsoft Office**: .docx, .pptx
- **Apple iWork**: .pages, .key

This enables building web applications that can:
- Preview documents without plugins
- Extract and convert content
- Build document editors and viewers
- Process documents client-side for privacy

## Document Format Architecture

### Microsoft Office (Open XML)
Modern MS Office files (.docx, .xlsx, .pptx) are:
- ZIP archives containing XML files
- Standardized Open XML format
- Cross-platform compatible
- Parseable with standard ZIP libraries

### Apple iWork
Apple files (.pages, .numbers, .key) are:
- ZIP archives containing binary IWA files
- Proprietary Protocol Buffer format
- More complex internal structure
- Require specialized parsing

## Current Features

### DOCX Support ✅
- Document structure (headings, paragraphs)
- Text formatting (italic, bold)
- Lists (bulleted, numbered, lettered)
- Conversion to Markdown

### PPTX Support 🚧
- Basic slide extraction
- Markdown conversion

### Pages Support 🚧
- File structure analysis complete
- Text extraction in development

### Keynote Support 🚧
- Planned

### Web Worker Support ✅
- Parse large documents without blocking UI
- Transferable objects for zero-copy performance
- Streaming results for progressive rendering
- Automatic worker pool management

## Installation

```bash
bun add @pandapage/pandapage
```

## Usage

```typescript
import { renderDocx } from '@pandapage/pandapage';

// Convert DOCX to Markdown
const arrayBuffer = await fetch('document.docx').then(r => r.arrayBuffer());
const markdown = await renderDocx(arrayBuffer);
console.log(markdown);
```

## API

### Document Rendering

#### `renderDocx(buffer: ArrayBuffer): Promise<string>`
Converts a DOCX file to Markdown format.

```typescript
const arrayBuffer = await fetch('document.docx').then(r => r.arrayBuffer());
const markdown = await renderDocx(arrayBuffer);
```

#### `renderDocument(buffer: ArrayBuffer, filename?: string): Promise<string>` 
Auto-detects document format and renders to Markdown.

```typescript
const markdown = await renderDocument(buffer, 'presentation.pptx');
```

### Low-Level APIs

#### `readDocx(buffer: ArrayBuffer): Effect<DocxDocument, DocxParseError>`
Reads and parses a DOCX file into a structured document format.

#### `docxToMarkdown(buffer: ArrayBuffer): Effect<string, DocxParseError>`
Effect-based API for converting DOCX to Markdown.

### Web Worker APIs

#### `parseDocumentInWorker<T>(type, buffer, options?): Effect<T, WorkerParseError>`
Parse a document in a Web Worker with progress tracking.

```typescript
const result = await Effect.runPromise(
  parseDocumentInWorker("docx", buffer, {
    streaming: true,
    onProgress: (progress) => console.log(`${progress * 100}% complete`)
  })
);
```

#### `streamDocumentParse(type, buffer, options?): Stream<string, WorkerParseError>`
Stream parsing results for progressive rendering.

```typescript
const stream = streamDocumentParse("docx", largeBuffer);
await Effect.runPromise(
  Stream.runForEach(stream, (chunk) => 
    Effect.sync(() => appendToUI(chunk))
  )
);
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run CI tests
bun test:ci
```

## Roadmap

1. **Complete DOCX Support**
   - [x] Basic text and formatting
   - [x] Lists
   - [ ] Tables
   - [ ] Images
   - [ ] Headers/Footers

2. **PPTX Support**
   - [ ] Slide structure
   - [ ] Text extraction
   - [ ] Basic layouts

3. **Apple iWork Formats**
   - [ ] Pages text extraction
   - [ ] Keynote slide parsing
   - [ ] Format detection

4. **Advanced Features**
   - [ ] Streaming large files
   - [ ] Web Worker support
   - [ ] Format preservation options

## License

MIT