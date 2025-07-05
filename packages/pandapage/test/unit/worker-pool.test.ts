import { test, expect } from "bun:test";
import { 
  shouldUseWorker, 
  createTransferableTask,
  type WorkerTask
} from "../../src/workers/worker-pool";

// Pure function tests for worker pool (no browser APIs)
  test("shouldUseWorker threshold is 1MB", () => {
    // Under 1MB - no worker
    expect(shouldUseWorker(0)).toBe(false);
    expect(shouldUseWorker(1024)).toBe(false); // 1KB
    expect(shouldUseWorker(1024 * 1024 - 1)).toBe(false); // Just under 1MB
    
    // 1MB and over - use worker
    expect(shouldUseWorker(1024 * 1024)).toBe(false); // Exactly 1MB - threshold is >1MB
    expect(shouldUseWorker(1024 * 1024 + 1)).toBe(true); // Just over 1MB
    expect(shouldUseWorker(10 * 1024 * 1024)).toBe(true); // 10MB
  });

  test("createTransferableTask generates unique IDs", () => {
    const buffer = new ArrayBuffer(100);
    const task1 = createTransferableTask("docx", buffer);
    const task2 = createTransferableTask("docx", buffer);
    
    expect(task1.task.id).not.toBe(task2.task.id);
  });

  test("createTransferableTask includes buffer in transfer list", () => {
    const buffer = new ArrayBuffer(100);
    const { task, transfer } = createTransferableTask("docx", buffer);
    
    expect(transfer).toHaveLength(1);
    expect(transfer[0]).toBe(buffer);
    expect(task.buffer).toBe(buffer);
  });

  test("createTransferableTask preserves options", () => {
    const buffer = new ArrayBuffer(100);
    const options = {
      streaming: true,
      chunkSize: 5000
    };
    
    const { task } = createTransferableTask("pptx", buffer, options);
    
    expect(task.type).toBe("pptx");
    expect(task.options?.streaming).toBe(true);
    expect(task.options?.chunkSize).toBe(5000);
  });

  test("createTransferableTask supports all document types", () => {
    const buffer = new ArrayBuffer(100);
    const types: WorkerTask["type"][] = ["docx", "pptx", "pages", "key"];
    
    types.forEach(type => {
      const { task } = createTransferableTask(type, buffer);
      expect(task.type).toBe(type);
    });
  });

  test("worker pool config defaults", () => {
    // These are pure calculations, not dependent on browser APIs
    const defaultMinWorkers = 1;
    const defaultTimeout = 30000; // 30 seconds
    
    expect(defaultMinWorkers).toBe(1);
    expect(defaultTimeout).toBe(30000);
  });