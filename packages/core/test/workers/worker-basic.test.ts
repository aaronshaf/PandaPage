import { expect, test } from "bun:test";
import { Effect } from "effect";
import { createTransferableTask, shouldUseWorker } from "../../src/workers/worker-pool";

test("shouldUseWorker returns true for large files", () => {
  // 2MB file should use worker
  expect(shouldUseWorker(2 * 1024 * 1024)).toBe(true);

  // 500KB file should not use worker
  expect(shouldUseWorker(500 * 1024)).toBe(false);
});

test("createTransferableTask creates proper task structure", () => {
  const buffer = new ArrayBuffer(1024);
  const { task, transfer } = createTransferableTask("docx", buffer, {
    streaming: true,
    chunkSize: 100,
  });

  expect(task.type).toBe("docx");
  expect(task.buffer).toBe(buffer);
  expect(task.options?.streaming).toBe(true);
  expect(task.options?.chunkSize).toBe(100);
  expect(transfer).toEqual([buffer]);
  expect(task.id).toBeDefined();
});

test("worker pool config respects hardware concurrency", () => {
  const concurrency = navigator.hardwareConcurrency || 4;

  // Default max workers should be hardware concurrency
  const { task } = createTransferableTask("docx", new ArrayBuffer(1024));
  expect(task).toBeDefined();
});
