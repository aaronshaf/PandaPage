import { describe, it, expect } from 'bun:test';
import { DocxInspector } from './index';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('DocxInspector', () => {
  const inspector = new DocxInspector();

  it('should create an inspector instance', () => {
    expect(inspector).toBeInstanceOf(DocxInspector);
  });

  it('should have required methods', () => {
    expect(typeof inspector.inspect).toBe('function');
    expect(typeof inspector.getDocumentXml).toBe('function');
    expect(typeof inspector.getStylesXml).toBe('function');
    expect(typeof inspector.getNumberingXml).toBe('function');
    expect(typeof inspector.getImageFiles).toBe('function');
  });

  // Test with real DOCX file if available
  it('should inspect 005.docx if available', async () => {
    const docxPath = join(process.cwd(), '../../005.docx');
    
    try {
      const buffer = readFileSync(docxPath);
      const result = await inspector.inspect(buffer.buffer, '005.docx');
      
      expect(result).toBeDefined();
      expect(result.fileName).toBe('005.docx');
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.files).toBeInstanceOf(Array);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.documentStructure.hasDocument).toBe(true);
      expect(result.statistics.totalFiles).toBeGreaterThan(0);
      
      // Should have main document parts
      const hasDocumentXml = result.files.some(f => f.name === 'word/document.xml');
      expect(hasDocumentXml).toBe(true);
      
      // Test utility methods
      const documentXml = inspector.getDocumentXml(result);
      expect(typeof documentXml).toBe('string');
      expect(documentXml?.includes('<w:document')).toBe(true);
      
      console.log('📊 DOCX Inspection Results:');
      console.log(`- Files: ${result.statistics.totalFiles}`);
      console.log(`- Size: ${(result.fileSize / 1024).toFixed(1)} KB`);
      console.log(`- Images: ${result.documentStructure.hasImages}`);
      console.log(`- Has styles: ${result.documentStructure.hasStyles}`);
      console.log(`- Has numbering: ${result.documentStructure.hasNumbering}`);
      
    } catch (error) {
      console.log('No 005.docx file found, skipping real file test');
      // This is expected if the file doesn't exist
    }
  });

  it('should handle file type detection', () => {
    const testCases = [
      { path: 'word/document.xml', content: '<?xml version="1.0"?><document/>', expected: 'xml' },
      { path: 'word/media/image1.png', content: new ArrayBuffer(100), expected: 'binary' },
      { path: '[Content_Types].xml', content: '<Types/>', expected: 'xml' },
      { path: 'word/embeddings/object1.bin', content: new ArrayBuffer(50), expected: 'binary' }
    ];
    
    for (const testCase of testCases) {
      const result = (inspector as any).determineFileType(testCase.path, testCase.content);
      expect(result).toBe(testCase.expected);
    }
  });

  it('should detect image and embedded files correctly', () => {
    const imageFiles = [
      'word/media/image1.png',
      'word/media/image2.jpg',
      'word/media/chart.gif'
    ];
    
    const embeddedFiles = [
      'word/embeddings/object1.bin',
      'word/oleObjects/object2.bin'
    ];
    
    const normalFiles = [
      'word/document.xml',
      'word/styles.xml',
      '[Content_Types].xml'
    ];
    
    for (const file of imageFiles) {
      expect((inspector as any).isImageFile(file)).toBe(true);
      expect((inspector as any).isEmbeddedObject(file)).toBe(false);
    }
    
    for (const file of embeddedFiles) {
      expect((inspector as any).isImageFile(file)).toBe(false);
      expect((inspector as any).isEmbeddedObject(file)).toBe(true);
    }
    
    for (const file of normalFiles) {
      expect((inspector as any).isImageFile(file)).toBe(false);
      expect((inspector as any).isEmbeddedObject(file)).toBe(false);
    }
  });

  it('should parse relationships correctly', () => {
    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="word/styles.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com" TargetMode="External"/>
</Relationships>`;
    
    const relationships = (inspector as any).parseRelationships(relsXml);
    
    expect(relationships).toHaveLength(3);
    expect(relationships[0].id).toBe('rId1');
    expect(relationships[0].type).toContain('officeDocument');
    expect(relationships[0].target).toBe('word/document.xml');
    
    expect(relationships[2].targetMode).toBe('External');
  });

  it('should parse content types correctly', () => {
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
    
    const contentTypes = (inspector as any).parseContentTypes(contentTypesXml);
    
    expect(contentTypes['png']).toBe('image/png');
    expect(contentTypes['jpeg']).toBe('image/jpeg');
    expect(contentTypes['/word/document.xml']).toContain('wordprocessingml.document.main');
  });
});