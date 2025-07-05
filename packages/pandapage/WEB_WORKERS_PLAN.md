# Web Workers Architecture Plan for PandaPage

## Overview

Web Workers will allow PandaPage to parse large documents without blocking the main thread, providing a smooth user experience even with multi-megabyte files. By using Transferable objects, we can efficiently move ArrayBuffers between threads without copying.

## Key Benefits

1. **Non-blocking UI**: Document parsing happens in background threads
2. **Better Performance**: Utilize multiple CPU cores for parallel processing
3. **Memory Efficiency**: Transferable objects avoid data duplication
4. **Scalability**: Handle large documents (100MB+ DOCX/PPTX files)

## Architecture Design

### 1. Worker Pool System

```typescript
// src/workers/worker-pool.ts
interface WorkerPool {
  // Manages a pool of reusable workers
  executeTask<T>(task: ParseTask): Effect.Effect<T, ParseError>
  // Automatically scales workers based on document size
  getOptimalWorkerCount(fileSize: number): number
}
```

### 2. Document Parsing Workers

Each format gets its own specialized worker:

```
src/workers/
├── docx.worker.ts      # DOCX parsing worker
├── pptx.worker.ts      # PPTX parsing worker  
├── pages.worker.ts     # Pages parsing worker
├── key.worker.ts       # Keynote parsing worker
└── worker-pool.ts      # Worker management
```

### 3. Transferable Objects Strategy

#### For Document Input
- Transfer ArrayBuffer from main thread to worker
- Original buffer becomes unusable in main thread (zero-copy transfer)

#### For Parsing Results
- Small documents (<1MB): Regular message passing
- Large documents: Stream results using transferable chunks

```typescript
// Example: Streaming large DOCX
interface DocxChunk {
  type: 'paragraph' | 'table' | 'image'
  content: ArrayBuffer  // Transferable
  metadata: ChunkMetadata
}
```

### 4. Progressive Parsing

For large documents, implement progressive parsing:

1. **DOCX/PPTX**: Parse and stream content by section
2. **Presentations**: Parse slide-by-slide
3. **Progress Updates**: Send parsing progress to main thread

## Implementation Phases

### Phase 1: Basic Worker Infrastructure
- [ ] Add @effect/platform-browser dependency
- [ ] Create worker pool with Effect
- [ ] Implement basic DOCX worker
- [ ] Add progress reporting

### Phase 2: Optimize with Transferables
- [ ] Implement zero-copy ArrayBuffer transfers
- [ ] Add streaming for large documents
- [ ] Benchmark memory usage improvements

### Phase 3: Advanced Features
- [ ] Multi-worker parallel parsing for presentations
- [ ] Intelligent worker scaling
- [ ] Caching parsed results in IndexedDB

## Use Cases

### 1. Large DOCX Files (>10MB)
- Parse in worker to avoid UI freeze
- Stream paragraphs as they're parsed
- Show real-time progress bar

### 2. PPTX with Many Slides (>100 slides)
- Parse slides in parallel across workers
- Transfer slide images as Transferable
- Progressive rendering

### 3. Batch Processing
- Parse multiple documents simultaneously
- One worker per document
- Optimal CPU utilization

## Memory Management

### Transferable Best Practices
1. Always transfer large ArrayBuffers (>100KB)
2. Clone small objects (<100KB) to avoid transfer overhead
3. Reuse ArrayBuffers when possible

### Example Usage
```typescript
// Main thread
const buffer = await file.arrayBuffer();
const result = await parseInWorker(buffer, {
  transfer: [buffer], // Transfer ownership
  streaming: true     // Stream results back
});

// Worker thread
self.onmessage = (e) => {
  const { buffer } = e.data;
  // Buffer is now owned by worker
  const chunks = parseDocumentStreaming(buffer);
  
  for (const chunk of chunks) {
    self.postMessage(
      { type: 'chunk', data: chunk.buffer },
      [chunk.buffer] // Transfer back
    );
  }
};
```

## Performance Targets

- Parse 10MB DOCX in <2 seconds
- Parse 50-slide PPTX in <3 seconds  
- Memory usage: <2x document size
- UI remains responsive throughout

## Integration with Effect

Leverage @effect/platform-browser's BrowserWorker:

```typescript
import { BrowserWorker } from "@effect/platform-browser"

const parseDocx = (buffer: ArrayBuffer) =>
  Effect.gen(function* () {
    const worker = yield* BrowserWorker.spawn("docx.worker.js")
    const result = yield* worker.execute({
      buffer,
      transfer: [buffer]
    })
    return result
  })
```

## Next Steps

1. Install @effect/platform-browser
2. Create basic worker infrastructure
3. Implement DOCX worker as proof of concept
4. Benchmark performance improvements
5. Roll out to other formats