import { describe, it, expect } from 'bun:test';
import { parseDocxDocument } from './index';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Debug 005.docx', () => {
  it('should parse 005.docx and show images', async () => {
    // Try to find 005.docx
    const possiblePaths = [
      '/Users/ashafovaloff/github/pandapage/packages/demo/public/005.docx',
      join(process.cwd(), '../../demo/public/005.docx'),
      join(process.cwd(), '../demo/public/005.docx'),
      join(process.cwd(), '../../../demo/public/005.docx'),
      join(process.cwd(), '../../../../demo/public/005.docx'),
    ];
    
    let docxBuffer: Buffer | undefined;
    let usedPath: string | undefined;
    
    for (const path of possiblePaths) {
      try {
        docxBuffer = readFileSync(path);
        usedPath = path;
        console.log('Found 005.docx at:', path);
        break;
      } catch (e) {
        // Continue trying
      }
    }
    
    if (!docxBuffer) {
      console.error('Could not find 005.docx in any of the expected locations');
      console.error('Tried:', possiblePaths);
      return;
    }
    
    const arrayBuffer = new ArrayBuffer(docxBuffer.length);
    const view = new Uint8Array(arrayBuffer);
    view.set(docxBuffer);
    
    const result = await parseDocxDocument(arrayBuffer);
    
    console.log('\n=== DOCUMENT STRUCTURE ===');
    console.log('Total elements:', result.elements.length);
    
    // Count different element types
    const elementCounts: Record<string, number> = {};
    result.elements.forEach(el => {
      elementCounts[el.type] = (elementCounts[el.type] || 0) + 1;
    });
    console.log('Element counts:', elementCounts);
    
    // Find paragraphs with images
    const paragraphsWithImages = result.elements.filter(
      el => el.type === 'paragraph' && 'images' in el && el.images && el.images.length > 0
    );
    console.log('\nParagraphs with images:', paragraphsWithImages.length);
    
    // Find headings with images
    const headingsWithImages = result.elements.filter(
      el => el.type === 'heading' && 'images' in el && el.images && el.images.length > 0
    );
    console.log('Headings with images:', headingsWithImages.length);
    
    // Find standalone images (should be 0)
    const standaloneImages = result.elements.filter(el => el.type === 'image');
    console.log('Standalone images:', standaloneImages.length);
    
    // Total images
    let totalImages = 0;
    result.elements.forEach(el => {
      if ('images' in el && el.images) {
        totalImages += el.images.length;
      }
    });
    console.log('Total images in document:', totalImages);
    
    // Show details of each image
    console.log('\n=== IMAGE DETAILS ===');
    result.elements.forEach((el, index) => {
      if ('images' in el && el.images && el.images.length > 0) {
        console.log(`\nElement ${index} (${el.type}):`);
        if (el.type === 'paragraph' || el.type === 'heading') {
          const text = el.runs.map(r => r.text).join('');
          console.log('  Text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        }
        el.images.forEach((img, imgIndex) => {
          console.log(`  Image ${imgIndex}:`);
          console.log('    MIME type:', img.mimeType);
          console.log('    Dimensions:', `${img.width}x${img.height}`);
          console.log('    Alt text:', img.alt);
          console.log('    Data size:', img.data.byteLength, 'bytes');
        });
      }
    });
    
    // Verify we found images
    expect(totalImages).toBeGreaterThan(0);
  });
});