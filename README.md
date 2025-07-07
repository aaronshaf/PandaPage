# pandapage

A document parser and renderer built with TypeScript. Parse DOCX documents and render them to HTML or Markdown.

## [Try the Demo](https://aaronshaf.github.io/pandapage/)

See pandapage in action with our interactive demo where you can upload and view DOCX documents.

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

### Parsing & Rendering Features

#### Currently Supported
- [x] **Text formatting**: Bold, italic, underline, strikethrough
- [x] **Advanced formatting**: Superscript, subscript, font colors, background colors
- [x] **Document structure**: Headings (H1-H6), paragraphs, page breaks
- [x] **Tables**: Complete table parsing with cell spans and formatting
- [x] **Lists**: Numbered and bulleted lists with nesting
- [x] **Hyperlinks**: Full URL resolution with security confirmation dialogs
- [x] **Headers & footers**: Document header and footer content
- [x] **Bookmarks**: Document bookmark parsing and rendering
- [x] **Metadata**: Document properties (title, author, dates, keywords)
- [x] **Security**: Safe link handling with user confirmation

#### In Progress
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
