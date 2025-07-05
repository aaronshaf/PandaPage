# Document Samples

This directory contains centralized document samples used for testing and demonstration.

## Organization

```
documents/
├── 001.docx/.pages      # Basic document with simple formatting
├── 002.docx/.pages      # Find and replace examples
├── 003.docx/.pages      # Open source policy (nested lists)
├── 004.docx/.pages      # Open source collaboration guide (tables, TOC)
├── 005.docx/.pages      # DOCX conversion demo (complex tables, images)
├── 006.docx/.pages      # Paper formatting (academic style)
├── 007.docx/.pages      # Additional test document
├── basic-formatting.*   # Original test document
└── README.md            # This file
```

## Usage

### For Demo App

Documents are automatically copied to the demo app's public directory:

```bash
# Copy all documents to demo app
bun run sync-docs

# Or manually
bun scripts/sync-documents.js
```

### For Testing

Reference documents directly from this location in tests:

```typescript
// In test files
const file = Bun.file("../../documents/004.docx");
```

## Document Features

| Document | DOCX Features | Pages Features | Purpose |
|----------|---------------|----------------|---------|
| 001 | Basic text, headings, simple lists | Similar | Basic formatting test |
| 002 | Find/replace placeholders | Similar | Template processing |
| 003 | Multi-level numbered lists | Similar | List formatting |
| 004 | Tables, TOC, academic formatting | Similar | Complex structure |
| 005 | Complex tables, images, footnotes | Similar | Rich content |
| 006 | Academic paper format | Similar | Professional layout |
| 007 | Additional test cases | Similar | Edge cases |
| basic-formatting | Legacy test document | Similar | Regression testing |

## Maintenance

- Add new documents directly to `/documents/`
- Run `bun run sync-docs` after adding files
- Keep both DOCX and Pages versions when possible
- Document new features in this README

## Avoiding Duplication

This centralized approach avoids:
- ❌ Duplicating files across packages
- ❌ Symlinks (Windows compatibility issues)
- ❌ Git LFS complexity
- ❌ Build-time copying scripts

Instead, we use:
- ✅ Single source of truth in `/documents`
- ✅ Simple sync script for demo app
- ✅ Direct file references in tests
- ✅ Clear organization by document type