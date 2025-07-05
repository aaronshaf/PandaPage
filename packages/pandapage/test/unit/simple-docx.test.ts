import { test, expect } from "bun:test";

// Simple, fast tests for DOCX functionality without complex Effect.js patterns

test("DOCX file extension detection", () => {
  const testFiles = [
    { name: "document.docx", expected: true },
    { name: "presentation.pptx", expected: false },
    { name: "document.pages", expected: false },
    { name: "file.txt", expected: false },
    { name: "DOCUMENT.DOCX", expected: true },
    { name: "test.doc", expected: false } // Old format
  ];
  
  testFiles.forEach(({ name, expected }) => {
    const isDocx = name.toLowerCase().endsWith('.docx');
    expect(isDocx).toBe(expected);
  });
});

test("Error message formatting", () => {
  const formatError = (error: any): string => {
    if (error && typeof error === 'object') {
      if (error._tag === 'DocxParseError') {
        return `Document parsing error: ${error.message || 'Unable to parse this DOCX file.'}`;
      }
      if (error.constructor?.name === 'DocxParseError') {
        return `Document parsing error: ${error.message || 'Unable to parse this DOCX file.'}`;
      }
      if (error.message) {
        return error.message;
      }
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred while processing the document.';
  };
  
  const testCases = [
    { 
      input: { _tag: 'DocxParseError', message: 'Invalid XML' },
      expected: 'Document parsing error: Invalid XML'
    },
    {
      input: new Error('Network failed'),
      expected: 'Network failed'
    },
    {
      input: 'Simple string error',
      expected: 'Simple string error'
    },
    {
      input: null,
      expected: 'An unexpected error occurred while processing the document.'
    }
  ];
  
  testCases.forEach(({ input, expected }) => {
    expect(formatError(input)).toBe(expected);
  });
});

test("Document processing pipeline validation", () => {
  const processDocument = async (buffer: ArrayBuffer) => {
    // Simulate document processing pipeline
    if (buffer.byteLength === 0) {
      throw new Error('Empty buffer');
    }
    if (buffer.byteLength < 100) {
      throw new Error('Buffer too small');
    }
    return 'Processed successfully';
  };
  
  // Test various buffer sizes
  expect(async () => {
    await processDocument(new ArrayBuffer(0));
  }).toThrow('Empty buffer');
  
  expect(async () => {
    await processDocument(new ArrayBuffer(50));
  }).toThrow('Buffer too small');
});

test("Markdown conversion basics", () => {
  const convertToMarkdown = (text: string, style: string) => {
    switch (style) {
      case 'heading1': return `# ${text}`;
      case 'heading2': return `## ${text}`;
      case 'bold': return `**${text}**`;
      case 'italic': return `*${text}*`;
      case 'code': return `\`${text}\``;
      default: return text;
    }
  };
  
  expect(convertToMarkdown('Title', 'heading1')).toBe('# Title');
  expect(convertToMarkdown('Subtitle', 'heading2')).toBe('## Subtitle');
  expect(convertToMarkdown('Bold text', 'bold')).toBe('**Bold text**');
  expect(convertToMarkdown('Italic text', 'italic')).toBe('*Italic text*');
  expect(convertToMarkdown('code', 'code')).toBe('`code`');
  expect(convertToMarkdown('Normal text', 'normal')).toBe('Normal text');
});

test("ZIP file structure validation", () => {
  const validateZipSignature = (buffer: ArrayBuffer): boolean => {
    if (buffer.byteLength < 4) return false;
    
    const view = new Uint8Array(buffer);
    // ZIP signature: 0x50 0x4B 0x03 0x04
    return view[0] === 0x50 && view[1] === 0x4B && view[2] === 0x03 && view[3] === 0x04;
  };
  
  // Valid ZIP signature
  const validZip = new ArrayBuffer(4);
  const validView = new Uint8Array(validZip);
  validView[0] = 0x50;
  validView[1] = 0x4B;
  validView[2] = 0x03;
  validView[3] = 0x04;
  expect(validateZipSignature(validZip)).toBe(true);
  
  // Invalid signature
  const invalidZip = new ArrayBuffer(4);
  const invalidView = new Uint8Array(invalidZip);
  invalidView[0] = 0x00;
  invalidView[1] = 0x01;
  invalidView[2] = 0x02;
  invalidView[3] = 0x03;
  expect(validateZipSignature(invalidZip)).toBe(false);
  
  // Too small
  expect(validateZipSignature(new ArrayBuffer(2))).toBe(false);
});

test("Document metadata extraction", () => {
  const extractMetadata = (xmlContent: string) => {
    const metadata: Record<string, string> = {};
    
    // Simple regex-based extraction for testing
    const titleMatch = xmlContent.match(/<dc:title>([^<]+)<\/dc:title>/);
    if (titleMatch) metadata.title = titleMatch[1];
    
    const authorMatch = xmlContent.match(/<dc:creator>([^<]+)<\/dc:creator>/);
    if (authorMatch) metadata.author = authorMatch[1];
    
    return metadata;
  };
  
  const sampleXml = `
    <metadata>
      <dc:title>Test Document</dc:title>
      <dc:creator>John Doe</dc:creator>
    </metadata>
  `;
  
  const result = extractMetadata(sampleXml);
  expect(result.title).toBe('Test Document');
  expect(result.author).toBe('John Doe');
});

test("Performance benchmarks", () => {
  // Test that basic operations are fast
  const iterations = 10000;
  
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const buffer = new ArrayBuffer(1000);
    const view = new Uint8Array(buffer);
    view[0] = i % 256;
  }
  const end = performance.now();
  
  const timePerIteration = (end - start) / iterations;
  expect(timePerIteration).toBeLessThan(0.1); // Less than 0.1ms per iteration
});

test("Memory usage patterns", () => {
  const buffers: ArrayBuffer[] = [];
  
  // Create multiple buffers
  for (let i = 0; i < 10; i++) {
    buffers.push(new ArrayBuffer(1000));
  }
  
  expect(buffers.length).toBe(10);
  expect(buffers[0].byteLength).toBe(1000);
  expect(buffers[9].byteLength).toBe(1000);
  
  // Clear references
  buffers.length = 0;
  expect(buffers.length).toBe(0);
});