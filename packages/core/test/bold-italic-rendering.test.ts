import { describe, test, expect } from 'bun:test';
import { parseDocx } from '@browser-document-viewer/parser';
import { Effect } from 'effect';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Test suite to verify that bold and italic rendering is working correctly
 * with the 001.docx document after the OR logic fix for b/bCs and i/iCs
 */
describe('Bold and Italic Rendering Tests', () => {
  const testDocPath = resolve(__dirname, '../../..', 'documents', '001.docx');

  async function loadTestDocument() {
    const buffer = readFileSync(testDocPath);
    return await Effect.runPromise(parseDocx(buffer.buffer));
  }

  test('should parse 001.docx successfully', async () => {
    const parsedDocument = await loadTestDocument();
    expect(parsedDocument).toBeDefined();
    expect(parsedDocument.elements).toBeDefined();
    expect(parsedDocument.elements.length).toBeGreaterThan(0);
  });

  test('should detect bold text correctly', async () => {
    const parsedDocument = await loadTestDocument();
    let foundBoldText = false;
    let boldTextRun: any = null;

    // Search through all elements to find bold text
    parsedDocument.elements.forEach((element: any) => {
      if (element.type === 'paragraph' || element.type === 'heading') {
        element.runs.forEach((run: any) => {
          if (run.text.includes('Bold text.')) {
            foundBoldText = true;
            boldTextRun = run;
          }
        });
      }
    });

    expect(foundBoldText).toBe(true);
    expect(boldTextRun).toBeDefined();
    expect(boldTextRun.bold).toBe(true);
    expect(boldTextRun.text).toBe('Bold text.');
  });

  test('should detect italic text correctly', async () => {
    const parsedDocument = await loadTestDocument();
    let foundItalicText = false;
    let italicTextRun: any = null;

    // Search through all elements to find italic text
    parsedDocument.elements.forEach((element: any) => {
      if (element.type === 'paragraph' || element.type === 'heading') {
        element.runs.forEach((run: any) => {
          if (run.text.includes('Italicized test.')) {
            foundItalicText = true;
            italicTextRun = run;
          }
        });
      }
    });

    expect(foundItalicText).toBe(true);
    expect(italicTextRun).toBeDefined();
    expect(italicTextRun.italic).toBe(true);
    expect(italicTextRun.text).toBe('Italicized test.');
  });

  test('should handle formatting properties correctly', async () => {
    const parsedDocument = await loadTestDocument();
    let formattedRuns = 0;
    const formattingDetails: Array<{
      text: string;
      bold: boolean;
      italic: boolean;
      underline: boolean;
      strikethrough: boolean;
    }> = [];

    // Collect all formatted runs
    parsedDocument.elements.forEach((element: any) => {
      if (element.type === 'paragraph' || element.type === 'heading') {
        element.runs.forEach((run: any) => {
          if (run.bold || run.italic || run.underline || run.strikethrough) {
            formattedRuns++;
            formattingDetails.push({
              text: run.text,
              bold: run.bold || false,
              italic: run.italic || false,
              underline: run.underline || false,
              strikethrough: run.strikethrough || false
            });
          }
        });
      }
    });

    // We expect at least 2 formatted runs (bold and italic)
    expect(formattedRuns).toBeGreaterThanOrEqual(2);
    
    // Check that we have the expected bold text
    const boldRun = formattingDetails.find(run => run.text.includes('Bold text.'));
    expect(boldRun).toBeDefined();
    expect(boldRun?.bold).toBe(true);
    expect(boldRun?.italic).toBe(false);
    
    // Check that we have the expected italic text
    const italicRun = formattingDetails.find(run => run.text.includes('Italicized test.'));
    expect(italicRun).toBeDefined();
    expect(italicRun?.italic).toBe(true);
    expect(italicRun?.bold).toBe(false);
  });

  test('should not have mixed formatting for basic bold/italic tests', async () => {
    const parsedDocument = await loadTestDocument();
    const mixedFormattingRuns: any[] = [];

    // Look for runs that have both bold and italic
    parsedDocument.elements.forEach((element: any) => {
      if (element.type === 'paragraph' || element.type === 'heading') {
        element.runs.forEach((run: any) => {
          if (run.bold && run.italic) {
            mixedFormattingRuns.push(run);
          }
        });
      }
    });

    // For the basic test texts "Bold text." and "Italicized test.", 
    // we shouldn't have mixed formatting
    const mixedBasicTexts = mixedFormattingRuns.filter(run => 
      run.text.includes('Bold text.') || run.text.includes('Italicized test.')
    );
    
    expect(mixedBasicTexts.length).toBe(0);
  });

  test('should maintain proper text content', async () => {
    const parsedDocument = await loadTestDocument();
    let allText = '';
    
    parsedDocument.elements.forEach((element: any) => {
      if (element.type === 'paragraph' || element.type === 'heading') {
        element.runs.forEach((run: any) => {
          allText += run.text;
        });
      }
    });

    // Check that the key test texts are present
    expect(allText).toContain('Bold text.');
    expect(allText).toContain('Italicized test.');
  });
});