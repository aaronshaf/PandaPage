---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

## Code Organization

### File Size Policy (Enforced by Pre-commit Hook)
- **TypeScript/TSX files**: max 700 lines (enforced by pre-commit hook)
- **JavaScript/JSX files**: max 500 lines  
- **Markdown files**: max 1000 lines
- **Other text files**: max 300 lines

**The pre-commit hook only checks TypeScript files** (.ts and .tsx) and will warn about files over 700 lines.

### Best Practices for Large Files
- Break files into smaller, focused modules with single responsibilities
- Extract utility functions to separate files
- Use barrel exports (index.ts) for clean imports
- Consider component/function extraction
- Group related functionality into cohesive modules

### When Files Exceed Limits
1. **Identify distinct responsibilities** within the file
2. **Extract components/functions** into separate files
3. **Create types files** for interface definitions
4. **Use index files** to maintain clean import paths
5. **Maintain functionality** while improving structure

## XML Parsing Guidelines

**NEVER use regex-based XML parsing** - it's unreliable and causes parsing failures.

### Correct XML Parsing Approach
- Use `DOMParser` with proper namespace support
- Use `getElementsByTagNameNS()` for namespaced elements
- Handle XML namespaces properly (e.g., `w:`, `a:`, `pic:`)
- Parse XML structure hierarchically, not with regex patterns

### Example (BAD - Don't do this):
```typescript
// BAD: Regex-based parsing
const paragraphRegex = /<w:p[^>]*>(.*?)<\/w:p>/gs;
```

### Example (GOOD - Do this):
```typescript
// GOOD: DOMParser with namespace support
const parser = new DOMParser();
const doc = parser.parseFromString(xmlContent, 'application/xml');
const paragraphs = doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'p');
```

## Project Context: Browser Document Viewer

This project aims to parse and render modern document formats in the browser:

### Supported Formats
- **DOCX** (Microsoft Word) - XML-based, currently implemented with list support
- **PPTX** (Microsoft PowerPoint) - XML-based, to be implemented
- **Pages** (Apple Pages) - Binary IWA format (Protocol Buffers)
- **Key** (Apple Keynote) - Binary IWA format (Protocol Buffers)

### Key Technical Details

#### DOCX/PPTX Structure
- ZIP archives containing XML files
- Main content in `word/document.xml` or `ppt/slides/slide*.xml`
- Relationships in `_rels` folders
- Media files in `media` folders
- Numbering/lists in `numbering.xml`

#### Apple iWork Structure
- ZIP archives containing:
  - `Index/*.iwa` - Binary Protocol Buffer files with document content
  - `Data/*` - Media assets (images, etc.)
  - `Metadata/*.plist` - Property lists with document metadata
  - `preview*.jpg` - Preview images

### Testing Approach
- Deterministic tests comparing output to expected Markdown
- Use Effect.js for error handling and async operations
- Test files in packages/core/ root for parser verification

### Current Implementation Status
- DOCX: Text, formatting, headings, lists ✓
- DOCX: Tables, images, complex formatting ✗
- PPTX: Basic slide extraction ✓
- Pages: File structure analyzed, parsing not implemented
- Key: Not started
- Web Workers: Basic infrastructure with Transferable objects ✓

### Web Worker Architecture
- Uses @effect/platform-browser for browser integration
- Worker pool with automatic scaling based on hardware
- Transferable objects for zero-copy ArrayBuffer transfers
- Streaming support for progressive rendering
- Files >1MB automatically use workers
- Progress tracking for long operations

### Performance Considerations
- Use Effect for async operations and error handling
- Avoid Effect for simple pure functions where performance matters
- Transfer large ArrayBuffers (>100KB) instead of cloning
- Stream results for documents >10MB
- Reuse workers through pooling
