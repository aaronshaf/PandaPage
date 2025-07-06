import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

test.describe("DOCX Rendering in Browser", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load test page", async ({ page }) => {
    await expect(page).toHaveTitle("PandaPage Test");
    await expect(page.locator("h1")).toContainText("PandaPage Test Page");
  });

  test("should detect when to use worker", async ({ page }) => {
    // Test shouldUseWorker function
    const shouldUseWorkerSmall = await page.evaluate(() => {
      return window.pandapage.shouldUseWorker(500 * 1024); // 500KB
    });
    expect(shouldUseWorkerSmall).toBe(false);

    const shouldUseWorkerLarge = await page.evaluate(() => {
      return window.pandapage.shouldUseWorker(2 * 1024 * 1024); // 2MB
    });
    expect(shouldUseWorkerLarge).toBe(true);
  });

  test("should render DOCX in main thread", async ({ page }) => {
    // Load test file
    const docxPath = path.join(__dirname, "../../basic-formatting.docx");
    const docxBuffer = fs.readFileSync(docxPath);

    // Upload file
    const fileInput = page.locator("#file-input");
    await fileInput.setInputFiles({
      name: "basic-formatting.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: docxBuffer,
    });

    // Wait for file to be loaded
    await page.waitForSelector("#output:not(.hidden)");
    const loadedText = await page.locator("#output").textContent();
    expect(loadedText).toContain("basic-formatting.docx");
    expect(loadedText).toContain("bytes");

    // Parse in main thread
    await page.click("#parse-main");

    // Wait for result
    await page.waitForFunction(() => {
      const output = document.getElementById("output");
      return output?.textContent?.includes("# Heading 1");
    });

    const output = await page.locator("#output").textContent();
    expect(output).toContain("# Heading 1");
    expect(output).toContain("## Heading 2");
    expect(output).toContain("Body text.");
    expect(output).toContain("- First list item");
    expect(output).toMatch(/Parsed in \d+\.\d+ms/);
  });

  test("should handle drag and drop", async ({ page }) => {
    const dropZone = page.locator("#drop-zone");

    // Create a data transfer with a file
    const docxPath = path.join(__dirname, "../../basic-formatting.docx");
    const docxBuffer = fs.readFileSync(docxPath);

    // Simulate drag and drop
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());

    await page.evaluate(
      ({ dataTransfer, fileName, fileContent }) => {
        const file = new File([new Uint8Array(fileContent)], fileName, {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        dataTransfer.items.add(file);
      },
      {
        dataTransfer,
        fileName: "test.docx",
        fileContent: Array.from(docxBuffer),
      },
    );

    // Trigger dragover
    await dropZone.dispatchEvent("dragover", { dataTransfer });
    await expect(dropZone).toHaveClass(/dragover/);

    // Trigger drop
    await dropZone.dispatchEvent("drop", { dataTransfer });
    await expect(dropZone).not.toHaveClass(/dragover/);

    // Check file was loaded
    await page.waitForSelector("#output:not(.hidden)");
    const output = await page.locator("#output").textContent();
    expect(output).toContain("test.docx");
  });

  test("should show progress bar during parsing", async ({ page }) => {
    // This test would work with actual worker implementation
    // For now, just verify the UI elements exist
    const progressBar = page.locator("#progress");
    await expect(progressBar).toHaveAttribute("max", "1");
    await expect(progressBar).toHaveClass("hidden");

    // After clicking parse with worker, progress should show
    // (Would need actual worker implementation to test fully)
  });

  test("should handle parse errors gracefully", async ({ page }) => {
    // Create an invalid file
    await page.evaluate(() => {
      const invalidFile = new File([new Uint8Array([1, 2, 3])], "invalid.docx");
      window.currentFile = invalidFile;
      window.currentBuffer = new ArrayBuffer(3);
    });

    // Try to parse
    await page.click("#parse-main");

    // Should show error
    await page.waitForFunction(() => {
      const output = document.getElementById("output");
      return output?.textContent?.includes("Error:");
    });

    const output = await page.locator("#output").textContent();
    expect(output).toContain("Error:");
  });
});
