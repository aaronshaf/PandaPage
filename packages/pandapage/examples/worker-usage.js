import { Effect, Stream } from "effect";
import { 
  parseDocumentInWorker, 
  streamDocumentParse,
  shouldUseWorker 
} from "../index";

// Example 1: Parse a large DOCX with progress tracking
async function parseLargeDocxWithProgress() {
  const file = new File(["..."], "large-document.docx");
  const buffer = await file.arrayBuffer();
  
  console.log(`File size: ${buffer.byteLength} bytes`);
  console.log(`Should use worker: ${shouldUseWorker(buffer.byteLength)}`);
  
  const result = await Effect.runPromise(
    parseDocumentInWorker("docx", buffer, {
      streaming: true,
      onProgress: (progress) => {
        console.log(`Progress: ${(progress * 100).toFixed(1)}%`);
        // Update UI progress bar
        document.querySelector<HTMLProgressElement>("#progress")!.value = progress;
      }
    })
  );
  
  console.log("Parse complete!", result);
}

// Example 2: Stream parsing results for real-time display
async function streamParseResults() {
  const response = await fetch("/large-presentation.pptx");
  const buffer = await response.arrayBuffer();
  
  const outputDiv = document.querySelector("#output")!;
  const stream = streamDocumentParse("pptx", buffer, {
    chunkSize: 5000, // 5KB chunks
    onProgress: (p) => console.log(`Streaming: ${(p * 100).toFixed(1)}%`)
  });
  
  await Effect.runPromise(
    Stream.runForEach(stream, (chunk) => 
      Effect.sync(() => {
        // Append each chunk to the UI as it arrives
        outputDiv.innerHTML += chunk;
        // Auto-scroll to bottom
        outputDiv.scrollTop = outputDiv.scrollHeight;
      })
    )
  );
}

// Example 3: Batch processing multiple documents
async function batchProcessDocuments(files: File[]) {
  const results = await Promise.all(
    files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const type = file.name.endsWith('.docx') ? 'docx' : 
                   file.name.endsWith('.pptx') ? 'pptx' : 
                   null;
      
      if (!type) {
        console.error(`Unsupported file: ${file.name}`);
        return null;
      }
      
      // Each document gets its own worker
      return Effect.runPromise(
        parseDocumentInWorker(type, buffer, {
          streaming: buffer.byteLength > 5 * 1024 * 1024 // Stream if >5MB
        })
      );
    })
  );
  
  console.log(`Processed ${results.filter(Boolean).length} documents`);
  return results;
}

// Example 4: Handle worker errors gracefully
async function parseWithErrorHandling() {
  const file = new File(["..."], "document.docx");
  const buffer = await file.arrayBuffer();
  
  const result = await Effect.runPromiseEither(
    parseDocumentInWorker("docx", buffer)
  );
  
  if (result._tag === "Left") {
    // Handle error
    console.error("Parse failed:", result.left);
    alert(`Failed to parse document: ${result.left.message}`);
  } else {
    // Handle success
    console.log("Parse successful:", result.right);
  }
}

// Example 5: Memory-efficient processing with Transferable objects
async function processLargeFileEfficiently() {
  const file = new File(["..."], "huge-document.docx");
  const buffer = await file.arrayBuffer();
  
  console.log(`Buffer byteLength before transfer: ${buffer.byteLength}`);
  
  // After this call, the buffer is transferred to the worker
  // and becomes unusable in the main thread (byteLength = 0)
  const result = await Effect.runPromise(
    parseDocumentInWorker("docx", buffer, {
      streaming: true
    })
  );
  
  console.log(`Buffer byteLength after transfer: ${buffer.byteLength}`); // 0
  console.log("Result received from worker:", result);
}