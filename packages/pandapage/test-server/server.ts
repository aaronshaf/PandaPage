import { join } from "node:path";
import { serve } from "bun";

// Simple test server for Playwright tests
const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve test HTML page
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>PandaPage Test</title>
            <meta charset="utf-8">
            <style>
              body { font-family: sans-serif; padding: 20px; }
              #drop-zone { 
                border: 2px dashed #ccc; 
                padding: 40px; 
                text-align: center;
                margin: 20px 0;
              }
              #drop-zone.dragover { 
                border-color: #000; 
                background-color: #f0f0f0; 
              }
              #output { 
                white-space: pre-wrap; 
                background: #f5f5f5; 
                padding: 10px;
                margin: 20px 0;
                max-height: 400px;
                overflow-y: auto;
              }
              #progress {
                width: 100%;
                height: 20px;
                margin: 10px 0;
              }
              .hidden { display: none; }
            </style>
          </head>
          <body>
            <h1>PandaPage Test Page</h1>
            
            <div id="drop-zone">
              Drop DOCX/PPTX files here or
              <input type="file" id="file-input" accept=".docx,.pptx,.pages,.key" multiple>
            </div>
            
            <progress id="progress" class="hidden" value="0" max="1"></progress>
            
            <div>
              <button id="parse-main">Parse in Main Thread</button>
              <button id="parse-worker">Parse in Worker</button>
              <button id="parse-stream">Parse with Streaming</button>
            </div>
            
            <div id="output" class="hidden"></div>
            
            <script type="module" src="/pandapage.js"></script>
            <script type="module" src="/test-app.js"></script>
          </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    // Serve PandaPage library
    if (url.pathname === "/pandapage.js") {
      const bundled = await Bun.build({
        entrypoints: [join(import.meta.dir, "../index.ts")],
        target: "browser",
        format: "esm",
      });

      if (bundled.success && bundled.outputs.length > 0) {
        return new Response(bundled.outputs[0], {
          headers: { "Content-Type": "application/javascript" },
        });
      }
    }

    // Serve test application
    if (url.pathname === "/test-app.js") {
      return new Response(
        `import { 
          renderDocx, 
          renderPptx,
          parseDocumentInWorker,
          streamDocumentParse,
          shouldUseWorker 
        } from '/pandapage.js';
        
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const output = document.getElementById('output');
        const progress = document.getElementById('progress');
        
        let currentFile = null;
        let currentBuffer = null;
        
        // File handling
        async function handleFile(file) {
          currentFile = file;
          currentBuffer = await file.arrayBuffer();
          output.textContent = \`Loaded: \${file.name} (\${currentBuffer.byteLength} bytes)\\n\`;
          output.textContent += \`Should use worker: \${shouldUseWorker(currentBuffer.byteLength)}\`;
          output.classList.remove('hidden');
        }
        
        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
          dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', async (e) => {
          e.preventDefault();
          dropZone.classList.remove('dragover');
          const file = e.dataTransfer.files[0];
          if (file) await handleFile(file);
        });
        
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (file) await handleFile(file);
        });
        
        // Parse buttons
        document.getElementById('parse-main').addEventListener('click', async () => {
          if (!currentBuffer) return;
          
          output.textContent = 'Parsing in main thread...\\n';
          const start = performance.now();
          
          try {
            const result = currentFile.name.endsWith('.docx') 
              ? await renderDocx(currentBuffer)
              : await renderPptx(currentBuffer);
            
            const elapsed = performance.now() - start;
            output.textContent = \`Parsed in \${elapsed.toFixed(2)}ms\\n\\n\${result}\`;
          } catch (error) {
            output.textContent = \`Error: \${error.message}\`;
          }
        });
        
        document.getElementById('parse-worker').addEventListener('click', async () => {
          if (!currentBuffer) return;
          
          output.textContent = 'Parsing in worker...\\n';
          progress.classList.remove('hidden');
          const start = performance.now();
          
          try {
            const type = currentFile.name.endsWith('.docx') ? 'docx' : 'pptx';
            const result = await parseDocumentInWorker(type, currentBuffer, {
              onProgress: (p) => {
                progress.value = p;
                console.log(\`Progress: \${(p * 100).toFixed(1)}%\`);
              }
            });
            
            const elapsed = performance.now() - start;
            output.textContent = \`Parsed in worker in \${elapsed.toFixed(2)}ms\\n\\n\${JSON.stringify(result, null, 2)}\`;
          } catch (error) {
            output.textContent = \`Error: \${error.message}\`;
          } finally {
            progress.classList.add('hidden');
          }
        });
        
        document.getElementById('parse-stream').addEventListener('click', async () => {
          if (!currentBuffer) return;
          
          output.textContent = 'Streaming parse results...\\n';
          progress.classList.remove('hidden');
          const start = performance.now();
          
          try {
            const type = currentFile.name.endsWith('.docx') ? 'docx' : 'pptx';
            
            // Note: This is a simplified version for testing
            // Real implementation would use Effect streams
            output.textContent += 'Streaming not yet implemented in browser bundle\\n';
            
          } catch (error) {
            output.textContent = \`Error: \${error.message}\`;
          } finally {
            progress.classList.add('hidden');
          }
        });
        
        // Expose for testing
        window.pandapage = {
          renderDocx,
          renderPptx,
          parseDocumentInWorker,
          shouldUseWorker
        };`,
        {
          headers: { "Content-Type": "application/javascript" },
        },
      );
    }

    // Serve test files
    if (url.pathname.startsWith("/test-files/")) {
      const filename = url.pathname.replace("/test-files/", "");
      const filePath = join(import.meta.dir, "../", filename);
      const file = Bun.file(filePath);

      if (await file.exists()) {
        return new Response(file);
      }
    }

    return new Response("Not found", { status: 404 });
  },
});

// eslint-disable-next-line no-console
console.log(`Test server running at http://localhost:${server.port}`);
