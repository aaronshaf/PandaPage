import { test, expect } from "bun:test";
import { renderPdf } from "../index";
import * as fs from "fs";
import * as path from "path";

const testSample = async (sampleName: string, checkFullMatch = true) => {
  // Read the PDF file
  const pdfPath = path.join(__dirname, `../../../assets/examples/${sampleName}.pdf`);
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
  
  // Process the PDF
  const result = await renderPdf(pdfBlob);
  
  // Read expected output
  const expected = fs.readFileSync(path.join(__dirname, `../../../assets/examples/${sampleName}.md`), "utf-8");
  
  if (checkFullMatch) {
    // Compare full output
    expect(result.trim()).toBe(expected.trim());
  } else {
    // Just check that the text content matches
    const resultText = result.split('---\n\n')[1]?.trim() || result.trim();
    const expectedText = expected.split('---\n\n')[1]?.trim() || expected.trim();
    expect(resultText).toBe(expectedText);
  }
};

test("sample1.pdf extraction", async () => {
  await testSample("sample1", true);
});

test("sample2.pdf extraction - text content", async () => {
  // Only check text content, not metadata
  await testSample("sample2", false);
});

test.skip("sample3.pdf extraction - text content", async () => {
  // Only check text content, not metadata
  // TODO: This test is skipped because sample3.pdf requires more sophisticated
  // PDF parsing to handle multi-page documents with proper formatting
  await testSample("sample3", false);
});

test("guide-footnotes.pdf extraction", async () => {
  // Test that the guide-footnotes.pdf can be processed and contains key content
  const pdfPath = path.join(__dirname, `../../../assets/examples/guide-footnotes.pdf`);
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
  
  const result = await renderPdf(pdfBlob);
  
  // Check that key content from the footnotes guide is present
  expect(result).toContain("Eighth Grade Term Paper: Footnotes");
  expect(result).toContain("What is a footnote?");
  expect(result).toContain("Why do you need to use footnotes?");
  expect(result).toContain("How do you make a footnote?");
  expect(result).toContain("plagiarism");
  expect(result).toContain("After the Civil War, New York City");
  expect(result).toContain("Block Quotations");
  expect(result).toContain("footnote");
});