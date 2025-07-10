import { describe, it, expect } from 'bun:test';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parseDocxDocument } from '../../core/src/wrappers';
import { renderToMarkdownImproved } from '../src/improved-renderer';
import { renderToMarkdown } from '../src/index';

describe('Improved Markdown Renderer', () => {
  it('should handle 005.docx with improved rendering', async () => {
    const docPath = join(__dirname, '../../../documents/005.docx');
    const buffer = readFileSync(docPath);
    
    const doc = await parseDocxDocument(buffer);
    
    // Test with default options
    const improvedOutput = renderToMarkdownImproved(doc);
    const originalOutput = renderToMarkdown(doc);
    
    // The improved version should be more compact
    const improvedLines = improvedOutput.split('\n');
    const originalLines = originalOutput.split('\n');
    
    console.log(`Original lines: ${originalLines.length}`);
    console.log(`Improved lines: ${improvedLines.length}`);
    
    // Check that empty paragraphs are handled better
    const improvedEmptyCount = improvedLines.filter(line => line === '').length;
    const originalEmptyCount = originalLines.filter(line => line === '').length;
    
    console.log(`Original empty lines: ${originalEmptyCount}`);
    console.log(`Improved empty lines: ${improvedEmptyCount}`);
    
    expect(improvedEmptyCount).toBeLessThan(originalEmptyCount);
    
    // Check that bookmarks are handled properly
    const improvedBookmarks = (improvedOutput.match(/<a id="/g) || []).length;
    const originalBookmarks = (originalOutput.match(/<a id="/g) || []).length;
    
    console.log(`Original bookmarks: ${originalBookmarks}`);
    console.log(`Improved bookmarks: ${improvedBookmarks}`);
    
    // The improved version should have fewer visible bookmarks
    expect(improvedBookmarks).toBeLessThanOrEqual(originalBookmarks);
    
    // Check that images are rendered
    const improvedImages = improvedOutput.match(/!\[([^\]]+)\]/g) || [];
    const originalImages = originalOutput.match(/!\[([^\]]+)\]/g) || [];
    
    console.log(`Original images: ${originalImages.length}`);
    console.log(`Improved images: ${improvedImages.length}`);
    
    // Both renderers should handle images
    expect(improvedImages.length).toBeGreaterThan(0);
    
    // Save outputs for comparison
    writeFileSync(join(__dirname, '../../../005-improved.md'), improvedOutput);
    
    console.log('\nImproved rendering complete. Check 005-improved.md for results.');
  });
  
  it('should skip empty paragraphs when option is enabled', () => {
    const doc = {
      metadata: {},
      elements: [
        {
          type: 'paragraph',
          runs: [{ text: 'Content' }]
        },
        {
          type: 'paragraph',
          runs: []
        },
        {
          type: 'paragraph',
          runs: [{ text: '   ' }]
        },
        {
          type: 'paragraph',
          runs: [{ text: 'More content' }]
        }
      ]
    };
    
    const output = renderToMarkdownImproved(doc as any, { 
      skipEmptyParagraphs: true,
      includeMetadata: false
    });
    
    const lines = output.split('\n').filter(line => line !== '');
    expect(lines.length).toBe(2);
    expect(lines[0]).toBe('Content');
    expect(lines[1]).toBe('More content');
  });
  
  it('should preserve bookmarks only when they have content', () => {
    const doc = {
      metadata: {},
      elements: [
        {
          type: 'bookmark',
          id: '1',
          name: 'bookmark1',
          text: 'Visible bookmark'
        },
        {
          type: 'bookmark',
          id: '2',
          name: 'bookmark2',
          text: ''
        },
        {
          type: 'bookmark',
          id: '3',
          name: 'bookmark3',
          text: '   '
        }
      ]
    };
    
    const output = renderToMarkdownImproved(doc, { 
      preserveBookmarks: true,
      includeMetadata: false
    });
    
    expect(output).toContain('<a id="bookmark1">Visible bookmark</a>');
    expect(output).not.toContain('bookmark2');
    expect(output).not.toContain('bookmark3');
  });
  
  it('should handle complex formatting in runs', () => {
    const doc = {
      metadata: {},
      elements: [
        {
          type: 'paragraph',
          runs: [
            {
              text: 'Bold and italic',
              bold: true,
              italic: true
            },
            {
              text: ' colored text',
              color: '#FF0000'
            },
            {
              text: ' highlighted',
              highlightColor: 'yellow'
            }
          ]
        }
      ]
    };
    
    const output = renderToMarkdownImproved(doc as any, { includeMetadata: false });
    
    expect(output).toContain('***Bold and italic***');
    expect(output).toContain('<span style="color: #FF0000"> colored text</span>');
    expect(output).toContain('<mark style="background-color: yellow"> highlighted</mark>');
  });
});

