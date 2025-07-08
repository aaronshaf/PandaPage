# Browser Document Viewer

A document parser and renderer built with TypeScript. Parse DOCX documents and render them to HTML or Markdown, with aspirations to support PPTX (PowerPoint), Keynote, and Apple Pages formats.

## [Try the Demo](https://aaronshaf.github.io/browser-document-viewer/)

See Browser Document Viewer in action with our interactive demo where you can upload and view DOCX documents.

## Features

- Parse DOCX documents with support for common formatting
- Render to HTML with DOM elements or Markdown
- Handle text formatting, tables, headers, footers, and hyperlinks
- Built with modern TypeScript and Effect for type safety and error handling
- Test coverage for core functionality

## Quick Start

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run demo
cd packages/demo
bun dev
```

For detailed development information, see [DEVELOPMENT.md](DEVELOPMENT.md).

## Document Support

### Current Support
- **DOCX**: Microsoft Word documents (actively supported)

### Planned Support
- **PPTX**: Microsoft PowerPoint presentations
- **Keynote**: Apple Keynote presentations  
- **Pages**: Apple Pages documents

### Parsing & Rendering Features

#### In Progress
- [ ] **Text formatting**: Bold, italic, underline, strikethrough
- [ ] **Advanced formatting**: Superscript, subscript, font colors, background colors
- [ ] **Document structure**: Headings (H1-H6), paragraphs, page breaks
- [ ] **Tables**: Complete table parsing with cell spans and formatting
- [ ] **Lists**: Numbered and bulleted lists with nesting
- [ ] **Hyperlinks**: Full URL resolution with security confirmation dialogs
- [ ] **Headers & footers**: Document header and footer content
- [ ] **Bookmarks**: Document bookmark parsing and rendering
- [ ] **Metadata**: Document properties (title, author, dates, keywords)
- [ ] **Security**: Safe link handling with user confirmation
- [ ] **Images**: Embedded image extraction and rendering
- [ ] **Merge fields**: Document template field support
- [ ] **Form fields**: Interactive form elements
- [ ] **Complex layouts**: Multi-column layouts and text boxes
- [ ] **Advanced tables**: Complex table merging and styles
- [ ] **Footnotes & endnotes**: Reference note support

#### Planned
- [ ] **Charts & graphs**: Embedded chart rendering
- [ ] **Comments**: Document review comments
- [ ] **Track changes**: Revision history support
- [ ] **Equations**: Mathematical formula rendering
- [ ] **Drawing objects**: Shapes and drawing elements

## See also

* [mammoth.js](https://github.com/mwilliamson/mammoth.js)
* [docxjs](https://github.com/VolodymyrBaydalka/docxjs)
