import { expect, test } from "bun:test";
import { Effect } from "effect";
import * as fs from "fs";
import * as path from "path";
import { readDocx } from "../../src/formats/docx/docx-reader";
import { docxToMarkdown } from "../../src/formats/docx/docx-to-markdown";

// Helper to load DOCX file
const loadDocx = (filename: string): ArrayBuffer => {
  const docxPath = path.join(__dirname, "../../../../documents", filename);
  const buffer = fs.readFileSync(docxPath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

test("DOCX reader can extract text from basic-formatting.docx", async () => {
  const buffer = loadDocx("001.docx");

  const document = await Effect.runPromise(readDocx(buffer));

  // Verify we extracted the paragraphs
  expect(document.paragraphs.length).toBeGreaterThan(0);

  // Check for expected content
  const allText = document.paragraphs.map((p) => p.runs.map((r) => r.text).join("")).join(" ");

  // Basic sanity checks
  expect(allText).toContain("Heading 1");
  expect(allText).toContain("Heading 2");
  expect(allText).toContain("Heading 3");
  expect(allText).toContain("Body text.");
  expect(allText).toContain("Italicized test.");
  expect(allText).toContain("Bold text.");
});

test("DOCX reader correctly identifies paragraph styles", async () => {
  const buffer = loadDocx("001.docx");

  const document = await Effect.runPromise(readDocx(buffer));

  // Find paragraphs with specific styles
  const heading1 = document.paragraphs.find((p) => p.style === "Heading");
  const heading2 = document.paragraphs.find((p) => p.style === "Heading 2");
  const heading3 = document.paragraphs.find((p) => p.style === "Heading 3");
  const bodyParagraphs = document.paragraphs.filter((p) => p.style === "Body A");

  expect(heading1).toBeDefined();
  expect(heading2).toBeDefined();
  expect(heading3).toBeDefined();
  expect(bodyParagraphs.length).toBeGreaterThan(0);

  // Check content
  expect(heading1?.runs[0]?.text).toBe("Heading 1");
  expect(heading2?.runs[0]?.text).toBe("Heading 2");
  expect(heading3?.runs[0]?.text).toBe("Heading 3");
});

test("DOCX reader correctly identifies text formatting", async () => {
  const buffer = loadDocx("001.docx");

  const document = await Effect.runPromise(readDocx(buffer));

  // Find the italic and bold text
  let italicRun: any = null;
  let boldRun: any = null;

  for (const paragraph of document.paragraphs) {
    for (const run of paragraph.runs) {
      if (run.text.includes("Italicized")) {
        italicRun = run;
      }
      if (run.text.includes("Bold")) {
        boldRun = run;
      }
    }
  }

  expect(italicRun).toBeDefined();
  expect(italicRun?.italic).toBe(true);

  expect(boldRun).toBeDefined();
  expect(boldRun?.bold).toBe(true);
});

test("DOCX to Markdown conversion produces correct output", async () => {
  const buffer = loadDocx("001.docx");

  const markdown = await Effect.runPromise(docxToMarkdown(buffer));

  // Check the structure
  const lines = markdown.split("\n");

  // Should have headings with proper markdown syntax
  expect(lines).toContain("# Heading 1");
  expect(lines).toContain("## Heading 2");
  expect(lines).toContain("### Heading 3");

  // Should have body text
  expect(markdown).toContain("Body text.");

  // Should have formatted text
  expect(markdown).toContain("_Italicized test._");
  expect(markdown).toContain("Bold text.");

  // Should have lists
  expect(markdown).toContain("- First list item");
  expect(markdown).toContain("1. List item A");
  expect(markdown).toContain("1. List item 1");
});

test("DOCX to Markdown conversion matches expected output", async () => {
  const buffer = loadDocx("001.docx");

  const markdown = await Effect.runPromise(docxToMarkdown(buffer));

  // Expected markdown content with lists
  const expectedContent = `# Heading 1

## Heading 2

### Heading 3

Body text.
_Italicized test._
Bold text.
## Bulleted list

- First list item
- Sceond list item
- Third list item
## Lettered list

1. List item A
2. List item B
3. List item C
## Ordered list

1. List item 1
2. List item 2
3. List item 3`;

  // The expected content might have YAML frontmatter, so let's strip it
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n\n?/;
  const expectedMarkdown = expectedContent.replace(frontmatterRegex, "").trim();

  // Compare the actual output
  expect(markdown.trim()).toBe(expectedMarkdown);
});
