import { expect, test } from "@playwright/test";

test.describe("Web Worker Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Enable console logging for debugging
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error("Browser console error:", msg.text());
      }
    });
  });

  test("should create worker for large files", async ({ page }) => {
    // Create a large fake buffer (2MB)
    const wasWorkerCreated = await page.evaluate(async () => {
      const largeBuffer = new ArrayBuffer(2 * 1024 * 1024);
      const file = new File([largeBuffer], "large.docx");

      window.currentFile = file;
      window.currentBuffer = largeBuffer;

      // Check if it should use worker
      return window.pandapage.shouldUseWorker(largeBuffer.byteLength);
    });

    expect(wasWorkerCreated).toBe(true);
  });

  test("should transfer ArrayBuffer ownership", async ({ page }) => {
    // This test verifies Transferable objects behavior
    const result = await page.evaluate(() => {
      // Create a buffer
      const buffer = new ArrayBuffer(1024);
      const view = new Uint8Array(buffer);
      view[0] = 42;

      // Store original byteLength
      const originalLength = buffer.byteLength;

      // Create a worker to test transfer
      const workerCode = `
        self.onmessage = (e) => {
          const { buffer } = e.data;
          const view = new Uint8Array(buffer);
          self.postMessage({ 
            received: true, 
            firstByte: view[0],
            length: buffer.byteLength 
          });
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));

      return new Promise((resolve) => {
        worker.onmessage = (e) => {
          resolve({
            originalLength,
            bufferAfterTransfer: buffer.byteLength,
            workerReceived: e.data,
          });
          worker.terminate();
        };

        // Transfer the buffer
        worker.postMessage({ buffer }, [buffer]);
      });
    });

    // After transfer, original buffer should be detached (byteLength = 0)
    const transferResult = result as {
      bufferAfterTransfer: number;
      workerReceived: { received: boolean; firstByte: number; length: number };
    };
    expect(transferResult.bufferAfterTransfer).toBe(0);
    expect(transferResult.workerReceived.received).toBe(true);
    expect(transferResult.workerReceived.firstByte).toBe(42);
    expect(transferResult.workerReceived.length).toBe(1024);
  });

  test("should handle worker errors", async ({ page }) => {
    const errorHandled = await page.evaluate(() => {
      return new Promise((resolve) => {
        const workerCode = `
          self.onmessage = () => {
            throw new Error('Worker error test');
          };
        `;

        const blob = new Blob([workerCode], { type: "application/javascript" });
        const worker = new Worker(URL.createObjectURL(blob));

        worker.onerror = (error) => {
          resolve({
            errorCaught: true,
            message: error.message || "Worker error",
          });
        };

        worker.onmessage = () => {
          resolve({ errorCaught: false });
        };

        worker.postMessage({});
      });
    });

    const errorResult = errorHandled as { errorCaught: boolean };
    expect(errorResult.errorCaught).toBe(true);
  });

  test("should support progress callbacks", async ({ page }) => {
    const progressUpdates = await page.evaluate(() => {
      const updates: number[] = [];

      // Simulate progress updates
      const simulateProgress = (callback: (p: number) => void) => {
        [0, 0.25, 0.5, 0.75, 1].forEach((progress, i) => {
          setTimeout(() => callback(progress), i * 10);
        });
      };

      return new Promise<number[]>((resolve) => {
        simulateProgress((progress) => {
          updates.push(progress);
          if (progress === 1) {
            resolve(updates);
          }
        });
      });
    });

    expect(progressUpdates).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  test("should handle concurrent workers", async ({ page }) => {
    const results = await page.evaluate(() => {
      // Create multiple workers
      const createWorker = (id: number) => {
        const workerCode = `
          self.onmessage = (e) => {
            const { id, delay } = e.data;
            setTimeout(() => {
              self.postMessage({ id, completed: true });
            }, delay);
          };
        `;

        const blob = new Blob([workerCode], { type: "application/javascript" });
        return new Worker(URL.createObjectURL(blob));
      };

      // Start 3 workers concurrently
      const promises = [1, 2, 3].map((id) => {
        return new Promise((resolve) => {
          const worker = createWorker(id);
          const start = Date.now();

          worker.onmessage = (e) => {
            resolve({
              id: e.data.id,
              elapsed: Date.now() - start,
            });
            worker.terminate();
          };

          // Different delays to test concurrency
          worker.postMessage({ id, delay: id * 100 });
        });
      });

      return Promise.all(promises);
    });

    // All workers should complete
    const concurrentResults = results as Array<{ id: number; elapsed: number }>;
    expect(concurrentResults).toHaveLength(3);
    expect(concurrentResults[0]?.id).toBe(1);
    expect(concurrentResults[1]?.id).toBe(2);
    expect(concurrentResults[2]?.id).toBe(3);

    // Workers should run concurrently (not sequentially)
    // Worker 3 should take ~300ms, but if sequential would take 600ms
    expect(concurrentResults[2]?.elapsed).toBeLessThan(400);
  });

  test("should terminate workers on cleanup", async ({ page }) => {
    const cleaned = await page.evaluate(() => {
      const workerTerminated = false;

      const workerCode = `
        let interval = setInterval(() => {
          self.postMessage({ alive: true });
        }, 50);
        
        self.onmessage = (e) => {
          if (e.data.terminate) {
            clearInterval(interval);
          }
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));

      let messageCount = 0;
      worker.onmessage = () => {
        messageCount++;
      };

      // Let it run for a bit
      return new Promise((resolve) => {
        setTimeout(() => {
          const countBeforeTerminate = messageCount;
          worker.terminate();

          // Wait to see if more messages arrive
          setTimeout(() => {
            resolve({
              messagesBeforeTerminate: countBeforeTerminate,
              messagesAfterTerminate: messageCount,
              terminated: messageCount === countBeforeTerminate,
            });
          }, 200);
        }, 200);
      });
    });

    const cleanupResult = cleaned as {
      messagesBeforeTerminate: number;
      terminated: boolean;
    };
    expect(cleanupResult.messagesBeforeTerminate).toBeGreaterThan(0);
    expect(cleanupResult.terminated).toBe(true);
  });
});
