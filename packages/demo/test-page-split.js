import { readFile } from 'fs/promises';
import { parseDocxDocument } from '../core/src/wrappers.js';
import { JSDOM } from 'jsdom';

// Mock DOM for Node.js
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

async function testPageSplit() {
  console.log('Testing page split logic...');
  
  try {
    // Read the 011.docx file
    const buffer = await readFile('./public/011.docx');
    
    // Parse with enhanced parser
    const parsed = await parseDocxDocument(buffer.buffer);
    
    console.log('Elements found:', parsed.elements.length);
    
    // Test the page splitter from renderer-dom
    const splitIntoPages = (elements) => {
      const pages = [];
      const footnotesById = new Map();
      
      // First pass: collect all footnotes
      elements.forEach(element => {
        if (element.type === 'footnote') {
          footnotesById.set(element.id, element);
        }
      });
      
      // Constants for page layout (in approximate lines)
      const MAX_LINES_PER_PAGE = 54; // ~9 inches at 6 lines per inch
      const LINES_PER_FOOTNOTE = 2.5; // Average lines per footnote
      const FOOTNOTE_SEPARATOR_LINES = 1; // Space for footnote separator line
      
      let currentPage = [];
      let currentPageHeight = 0;
      let currentPageFootnotes = new Set();
      let pageFootnotesHeight = 0;
      
      // Helper to estimate element height in lines
      const estimateElementHeight = (element) => {
        switch (element.type) {
          case 'paragraph': {
            const text = element.runs.map(r => r.text).join('');
            const lines = Math.max(1, Math.ceil(text.length / 80)); // ~80 chars per line
            return lines * 1.5; // Add spacing
          }
          case 'heading':
            return element.level <= 2 ? 3 : 2.5;
          case 'table':
            return element.rows.length * 1.5 + 1;
          case 'pageBreak':
            return 0;
          default:
            return 1;
        }
      };
      
      // Helper to finalize current page
      const finalizePage = () => {
        if (currentPage.length > 0 || currentPageFootnotes.size > 0) {
          // Add footnotes to the current page
          if (currentPageFootnotes.size > 0) {
            // Sort footnotes numerically
            const sortedIds = Array.from(currentPageFootnotes).sort((a, b) => {
              const numA = parseInt(a, 10);
              const numB = parseInt(b, 10);
              return numA - numB;
            });
            
            // Add each footnote
            sortedIds.forEach(id => {
              const footnote = footnotesById.get(id);
              if (footnote) {
                currentPage.push(footnote);
              }
            });
          }
          
          pages.push(currentPage);
          currentPage = [];
          currentPageHeight = 0;
          currentPageFootnotes = new Set();
          pageFootnotesHeight = 0;
        }
      };
      
      // Find footnote references in element
      const findFootnoteReferences = (element, referencedFootnotes) => {
        if (element.type === 'paragraph') {
          element.runs.forEach(run => {
            if (run._footnoteRef) {
              referencedFootnotes.add(run._footnoteRef);
            }
          });
        } else if (element.type === 'footnoteReference') {
          referencedFootnotes.add(element.id);
        } else if (element.type === 'table') {
          element.rows.forEach(row => {
            row.cells.forEach(cell => {
              cell.paragraphs.forEach(paragraph => {
                findFootnoteReferences(paragraph, referencedFootnotes);
              });
            });
          });
        }
      };
      
      // Process each element
      elements.forEach(element => {
        // Skip footnotes as they're added at page end
        if (element.type === 'footnote' || element.type === 'header' || element.type === 'footer') {
          return;
        }
        
        // Handle explicit page breaks
        if (element.type === 'pageBreak') {
          finalizePage();
          return;
        }
        
        // Find footnote references in this element
        const elementFootnotes = new Set();
        findFootnoteReferences(element, elementFootnotes);
        
        // Calculate space needed for new footnotes
        let newFootnotesHeight = 0;
        elementFootnotes.forEach(id => {
          if (!currentPageFootnotes.has(id)) {
            newFootnotesHeight += LINES_PER_FOOTNOTE;
          }
        });
        
        // Add separator line if this page will have footnotes
        if (currentPageFootnotes.size === 0 && elementFootnotes.size > 0) {
          newFootnotesHeight += FOOTNOTE_SEPARATOR_LINES;
        }
        
        const elementHeight = estimateElementHeight(element);
        const totalRequiredHeight = currentPageHeight + elementHeight + pageFootnotesHeight + newFootnotesHeight;
        
        // Check if we need a new page
        if (totalRequiredHeight > MAX_LINES_PER_PAGE && currentPage.length > 0) {
          finalizePage();
        }
        
        // Add element to current page
        currentPage.push(element);
        currentPageHeight += elementHeight;
        
        // Track footnotes for this page
        elementFootnotes.forEach(id => {
          if (!currentPageFootnotes.has(id)) {
            currentPageFootnotes.add(id);
            pageFootnotesHeight += LINES_PER_FOOTNOTE;
            if (currentPageFootnotes.size === 1) {
              pageFootnotesHeight += FOOTNOTE_SEPARATOR_LINES;
            }
          }
        });
      });
      
      // Finalize the last page
      finalizePage();
      
      // Ensure at least one page exists
      if (pages.length === 0) {
        pages.push([]);
      }
      
      return pages;
    };
    
    const pages = splitIntoPages(parsed.elements);
    
    console.log('\\n=== PAGE SPLIT RESULTS ===');
    console.log('Number of pages:', pages.length);
    
    pages.forEach((page, index) => {
      console.log(`\\nPage ${index + 1} - ${page.length} elements:`);
      page.forEach((element, elementIndex) => {
        if (element.type === 'paragraph') {
          const text = element.runs.map(r => r.text).join('').trim();
          if (text.length > 0) {
            console.log(`  ${elementIndex + 1}. ${element.type}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
            
            // Check for "prefer)." text
            if (text.includes('prefer).')) {
              console.log('    >>> FOUND "prefer)." IN THIS ELEMENT! <<<');
            }
          }
        } else {
          console.log(`  ${elementIndex + 1}. ${element.type}`);
        }
      });
    });
    
    console.log('\\n=== SEARCHING FOR "prefer)." IN EACH PAGE ===');
    pages.forEach((page, index) => {
      let foundInPage = false;
      page.forEach(element => {
        if (element.type === 'paragraph') {
          const text = element.runs.map(r => r.text).join('');
          if (text.includes('prefer).')) {
            foundInPage = true;
          }
        }
      });
      console.log(`Page ${index + 1}: ${foundInPage ? '✓ FOUND' : '✗ NOT FOUND'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPageSplit();