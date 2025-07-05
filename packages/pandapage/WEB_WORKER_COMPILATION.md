# Web Worker TypeScript Compilation Strategy

## Problem
Web Workers need to be separate JavaScript files that can be loaded via `new Worker(url)`. When using TypeScript, we need to compile these `.ts` files to `.js` while maintaining proper module resolution and type safety.

## Options

### 1. Bun Build (Recommended)
Use Bun's built-in bundler to compile workers separately:

```json
{
  "scripts": {
    "build:workers": "bun build ./src/workers/*.worker.ts --outdir ./dist/workers --target browser --splitting"
  }
}
```

Pros:
- Fast compilation
- Built-in TypeScript support
- Handles module resolution
- Can use `--splitting` for shared chunks

Cons:
- Need separate build step for workers

### 2. Inline Workers with Blob URLs
Convert worker code to strings and create Blob URLs at runtime:

```typescript
const workerCode = `
  self.onmessage = (e) => {
    // Worker logic
  }
`;
const blob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);
const worker = new Worker(workerUrl);
```

Pros:
- No separate build step
- Works with bundlers

Cons:
- Loses TypeScript type checking in worker code
- Harder to maintain

### 3. Worker Plugin for Bundlers
Use a plugin that handles worker compilation:

```typescript
// With special import syntax
import MyWorker from './my.worker.ts?worker';
const worker = new MyWorker();
```

Pros:
- Seamless integration
- Type safety

Cons:
- Requires bundler plugin support

## Recommended Approach

Use Bun's build command with a dedicated worker build step:

1. Create separate build commands for workers
2. Output to a predictable location
3. Use dynamic imports or URL construction
4. Include worker output in .gitignore

### Implementation

```json
// package.json
{
  "scripts": {
    "build": "bun run build:lib && bun run build:workers",
    "build:lib": "bun build ./index.ts --outdir ./dist --target node",
    "build:workers": "bun build ./src/workers/*.worker.ts --outdir ./dist/workers --target browser --format esm",
    "dev": "bun run build:workers && bun run dev:watch",
    "dev:watch": "bun --watch run index.ts"
  }
}
```

### Worker Manager Update

```typescript
// src/workers/worker-manager.ts
const WORKER_URLS: Record<WorkerTask["type"], string> = {
  docx: new URL("../../dist/workers/docx.worker.js", import.meta.url).href,
  pptx: new URL("../../dist/workers/pptx.worker.js", import.meta.url).href,
  pages: new URL("../../dist/workers/pages.worker.js", import.meta.url).href,
  key: new URL("../../dist/workers/key.worker.js", import.meta.url).href,
};
```

### Development Workflow

1. Run `bun run build:workers` to compile workers
2. Workers are output to `dist/workers/`
3. Main code references compiled workers
4. In production, include `dist/workers/` in deployment