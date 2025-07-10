// Enhanced DOM-based renderer with better support for complex formatting
import type {
  ParsedDocument,
  DocumentElement,
  Paragraph,
  Heading,
  Table,
  TableRow,
  TableCell,
  TextRun,
  Image,
  Footnote,
  FootnoteReference,
  Header,
  Footer,
  Bookmark,
  PageBreak
} from '@browser-document-viewer/parser';

export interface EnhancedDOMRenderOptions {
  document?: Document;
  includeStyles?: boolean;
  pageSize?: 'letter' | 'a4';
  renderMode?: 'view' | 'print'; // view mode for screen, print for print preview
  enableDropcaps?: boolean;
  enableAdvancedFormatting?: boolean;
}

export class EnhancedDOMRenderer {
  private doc: Document;
  private currentPageNumber: number = 1;
  private totalPages: number = 1;
  private footnoteMap: Map<string, Footnote> = new Map();
  private options: EnhancedDOMRenderOptions;
  
  constructor(options: EnhancedDOMRenderOptions = {}) {
    this.options = {
      renderMode: 'view',
      enableDropcaps: true,
      enableAdvancedFormatting: true,
      ...options
    };
    this.doc = options.document || (typeof document !== 'undefined' ? document : this.createDocument());
  }
  
  private createDocument(): Document {
    try {
      const { Window } = require('happy-dom');
      const window = new Window();
      return window.document;
    } catch {
      try {
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');
        return dom.window.document;
      } catch {
        throw new Error('DOM environment not available. Please install happy-dom or jsdom for server-side rendering.');
      }
    }
  }
  
  private addEnhancedStyles(): void {
    if (typeof document === 'undefined' || document.getElementById('enhanced-doc-styles')) return;
    
    const style = this.doc.createElement('style');
    style.id = 'enhanced-doc-styles';
    style.textContent = `
      /* Enhanced Document Styles */
      .document-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      
      /* Color and Highlight Support */
      .text-color-red { color: #FF0000; }
      .text-color-green { color: #92D050; }
      .text-color-blue { color: #0070C0; }
      .text-color-yellow { color: #FFD700; }
      .text-color-orange { color: #FFA500; }
      .text-color-purple { color: #9B59B6; }
      .text-color-pink { color: #FF69B4; }
      .text-color-gray { color: #808080; }
      .text-color-black { color: #000000; }
      .text-color-white { color: #FFFFFF; }
      
      .highlight-yellow { background-color: #FFFF00; }
      .highlight-green { background-color: #D4F4DD; }
      .highlight-cyan { background-color: #D4F4F4; }
      .highlight-magenta { background-color: #FFD4F4; }
      .highlight-blue { background-color: #D4E6FF; }
      .highlight-red { background-color: #FFD4D4; }
      .highlight-gray { background-color: #E5E5E5; }
      
      /* Text Effects */
      .text-shadow { text-shadow: 1px 1px 2px rgba(0,0,0,0.3); }
      .text-outline { 
        text-shadow: 
          -1px -1px 0 #000,
          1px -1px 0 #000,
          -1px 1px 0 #000,
          1px 1px 0 #000;
      }
      .text-emboss {
        text-shadow: 
          -1px -1px 1px rgba(255,255,255,0.5),
          1px 1px 1px rgba(0,0,0,0.5);
      }
      .text-imprint {
        text-shadow: 
          1px 1px 1px rgba(255,255,255,0.5),
          -1px -1px 1px rgba(0,0,0,0.5);
      }
      
      /* Advanced Typography */
      .small-caps { font-variant: small-caps; }
      .all-caps { text-transform: uppercase; }
      .double-strikethrough {
        text-decoration: line-through;
        text-decoration-style: double;
      }
      .hidden-text { visibility: hidden; }
      
      /* Dropcap Support */
      .dropcap {
        float: left;
        font-size: 4em;
        line-height: 0.8;
        margin: 0 0.1em 0 0;
        font-weight: bold;
        color: #2563eb;
      }
      
      .dropcap-3 {
        font-size: 3.5em;
        line-height: 0.9;
      }
      
      .dropcap-2 {
        font-size: 2.5em;
        line-height: 1;
      }
      
      /* Enhanced Table Styles */
      .table-fancy {
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0;
      }
      
      .table-fancy th {
        background-color: #f3f4f6;
        font-weight: 600;
        text-align: left;
        padding: 0.75rem 1rem;
        border-bottom: 2px solid #e5e7eb;
      }
      
      .table-fancy td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .table-fancy tr:nth-child(even) {
        background-color: #f9fafb;
      }
      
      .table-fancy tr:hover {
        background-color: #f3f4f6;
      }
      
      /* Cell Merge Support */
      .cell-merged {
        vertical-align: middle;
        text-align: center;
      }
      
      /* Footnote Styles */
      .footnote-marker {
        color: #2563eb;
        font-size: 0.8em;
        vertical-align: super;
        cursor: pointer;
        text-decoration: none;
      }
      
      .footnote-marker:hover {
        text-decoration: underline;
      }
      
      .footnote-section {
        margin-top: 3rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }
      
      .footnote-item {
        margin-bottom: 0.5rem;
        font-size: 0.9em;
        color: #4b5563;
      }
      
      .footnote-number {
        font-weight: 600;
        margin-right: 0.5rem;
      }
      
      /* Print-specific styles */
      @media print {
        .page-break { page-break-after: always; }
        .no-print { display: none; }
        .table-fancy tr:hover { background-color: transparent; }
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .table-fancy {
          font-size: 0.9em;
        }
        
        .dropcap {
          font-size: 3em;
        }
      }
    `;
    
    if (document.head) {
      document.head.appendChild(style);
    }
  }
  
  private renderEnhancedTextRun(run: TextRun): HTMLElement {
    const span = this.doc.createElement('span');
    const classes: string[] = [];
    
    // Basic formatting
    if (run.bold) classes.push('font-bold');
    if (run.italic) classes.push('italic');
    if (run.underline) classes.push('underline');
    if (run.strikethrough) classes.push('line-through');
    
    // Advanced formatting
    if (this.options.enableAdvancedFormatting) {
      if (run.superscript) {
        const sup = this.doc.createElement('sup');
        sup.textContent = run.text || '';
        return sup;
      }
      
      if (run.subscript) {
        const sub = this.doc.createElement('sub');
        sub.textContent = run.text || '';
        return sub;
      }
      
      // Text effects
      if (run.shadow) classes.push('text-shadow');
      if (run.outline) classes.push('text-outline');
      if (run.emboss) classes.push('text-emboss');
      if (run.imprint) classes.push('text-imprint');
      if (run.smallCaps) classes.push('small-caps');
      if (run.caps) classes.push('all-caps');
      if (run.doubleStrikethrough) classes.push('double-strikethrough');
      if (run.hidden) classes.push('hidden-text');
      
      // Color support
      if (run.color && run.color !== 'auto') {
        const colorMap: Record<string, string> = {
          'FF0000': 'red',
          '92D050': 'green',
          '0070C0': 'blue',
          'FFD700': 'yellow',
          'FFA500': 'orange',
          '9B59B6': 'purple',
          'FF69B4': 'pink',
          '808080': 'gray',
          '000000': 'black',
          'FFFFFF': 'white'
        };
        
        const colorClass = colorMap[run.color.replace('#', '').toUpperCase()];
        if (colorClass) {
          classes.push(`text-color-${colorClass}`);
        } else {
          span.style.color = run.color.startsWith('#') ? run.color : `#${run.color}`;
        }
      }
      
      // Highlight support
      if (run.highlightColor && run.highlightColor !== 'none') {
        const highlightMap: Record<string, string> = {
          'yellow': 'yellow',
          'green': 'green',
          'cyan': 'cyan',
          'magenta': 'magenta',
          'blue': 'blue',
          'red': 'red',
          'darkGray': 'gray',
          'lightGray': 'gray'
        };
        
        const highlightClass = highlightMap[run.highlightColor];
        if (highlightClass) {
          classes.push(`highlight-${highlightClass}`);
        }
      }
    }
    
    // Apply classes
    if (classes.length > 0) {
      span.className = classes.join(' ');
    }
    
    // Handle links
    if (run.link) {
      const link = this.doc.createElement('a');
      link.href = run.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = span.className;
      link.textContent = run.text || '';
      return link;
    }
    
    span.textContent = run.text || '';
    return span;
  }
  
  private renderEnhancedParagraph(paragraph: Paragraph): HTMLElement {
    const p = this.doc.createElement('p');
    const classes: string[] = ['mb-4'];
    
    // Handle alignment
    if (paragraph.alignment) {
      const alignMap: Record<string, string> = {
        'center': 'text-center',
        'end': 'text-right',
        'both': 'text-justify',
        'distribute': 'text-justify'
      };
      const alignClass = alignMap[paragraph.alignment];
      if (alignClass) classes.push(alignClass);
    }
    
    // Apply style-based classes
    if (paragraph.style) {
      const styleMap: Record<string, string> = {
        'Heading1': 'text-4xl font-bold',
        'Heading2': 'text-3xl font-bold',
        'Heading3': 'text-2xl font-bold',
        'Heading4': 'text-xl font-semibold',
        'Heading5': 'text-lg font-semibold',
        'Heading6': 'text-base font-semibold',
        'Title': 'text-4xl font-bold text-center',
        'Subtitle': 'text-2xl text-center text-gray-600'
      };
      const styleClass = styleMap[paragraph.style];
      if (styleClass) classes.push(...styleClass.split(' '));
    }
    
    p.className = classes.join(' ');
    
    // Check for dropcap (first character styling)
    if (this.options.enableDropcaps && paragraph.runs && paragraph.runs.length > 0 && paragraph.runs[0]?.text) {
      const firstRun = paragraph.runs[0];
      const text = firstRun.text || '';
      
      // Look for dropcap pattern (capital letter at start)
      if (text.length > 0 && /^[A-Z]/.test(text)) {
        // Check if this might be a dropcap paragraph (e.g., starts a new section)
        const isLikelyDropcap = paragraph.style === 'Normal' && 
                               text.length > 50 && // Substantial paragraph
                               /^[A-Z][a-z]/.test(text); // Capital followed by lowercase
        
        if (isLikelyDropcap) {
          // Create dropcap
          const dropcap = this.doc.createElement('span');
          dropcap.className = 'dropcap dropcap-3';
          dropcap.textContent = text.charAt(0);
          p.appendChild(dropcap);
          
          // Add the rest of the first run
          // @ts-ignore - TextRun spread is causing type issues
          const remainingText = Object.assign({}, firstRun, { text: text.substring(1) });
          p.appendChild(this.renderEnhancedTextRun(remainingText));
          
          // Add remaining runs
          paragraph.runs.slice(1).forEach(run => {
            p.appendChild(this.renderEnhancedTextRun(run));
          });
          
          return p;
        }
      }
    }
    
    // Normal paragraph rendering
    if (paragraph.runs) {
      paragraph.runs.forEach(run => {
        p.appendChild(this.renderEnhancedTextRun(run));
      });
    }
    
    // Handle images in paragraph
    if (paragraph.images && paragraph.images.length > 0) {
      paragraph.images.forEach(img => {
        const imgEl = this.renderEnhancedImage(img);
        p.appendChild(imgEl);
      });
    }
    
    return p;
  }
  
  private renderEnhancedTable(table: Table): HTMLElement {
    const tableEl = this.doc.createElement('table');
    tableEl.className = 'table-fancy';
    
    // Track merged cells to avoid rendering them multiple times
    const mergedCells = new Set<string>();
    
    table.rows.forEach((row, rowIndex) => {
      const tr = this.doc.createElement('tr');
      
      row.cells.forEach((cell, cellIndex) => {
        const cellKey = `${rowIndex}-${cellIndex}`;
        
        // Skip if this cell is part of a merged cell
        if (mergedCells.has(cellKey)) return;
        
        const isHeader = rowIndex === 0;
        const cellEl = this.doc.createElement(isHeader ? 'th' : 'td');
        
        // Handle cell merging
        if (cell.rowspan && cell.rowspan > 1) {
          cellEl.rowSpan = cell.rowspan;
          cellEl.classList.add('cell-merged');
          
          // Mark cells that are covered by this merged cell
          for (let i = 1; i < cell.rowspan; i++) {
            mergedCells.add(`${rowIndex + i}-${cellIndex}`);
          }
        }
        
        if (cell.colspan && cell.colspan > 1) {
          cellEl.colSpan = cell.colspan;
          cellEl.classList.add('cell-merged');
          
          // Mark cells that are covered by this merged cell
          for (let j = 1; j < cell.colspan; j++) {
            mergedCells.add(`${rowIndex}-${cellIndex + j}`);
          }
        }
        
        // Handle cells merged both horizontally and vertically
        if (cell.rowspan && cell.rowspan > 1 && cell.colspan && cell.colspan > 1) {
          for (let i = 0; i < cell.rowspan; i++) {
            for (let j = 0; j < cell.colspan; j++) {
              if (i > 0 || j > 0) {
                mergedCells.add(`${rowIndex + i}-${cellIndex + j}`);
              }
            }
          }
        }
        
        // Apply cell-specific styles
        if (cell.verticalAlignment) {
          cellEl.style.verticalAlign = cell.verticalAlignment;
        }
        
        // Render cell content
        if (cell.paragraphs) {
          cell.paragraphs.forEach(para => {
            const p = this.renderEnhancedParagraph(para);
            cellEl.appendChild(p);
          });
        }
        
        tr.appendChild(cellEl);
      });
      
      tableEl.appendChild(tr);
    });
    
    return tableEl;
  }
  
  private renderEnhancedImage(image: Image): HTMLElement {
    const img = this.doc.createElement('img');
    img.className = 'max-w-full h-auto';
    
    if (image.data) {
      const base64 = this.arrayBufferToBase64(image.data);
      img.src = `data:${image.mimeType};base64,${base64}`;
    }
    
    if (image.alt) {
      img.alt = image.alt;
    }
    
    if (image.width) {
      img.width = image.width;
    }
    
    if (image.height) {
      img.height = image.height;
    }
    
    return img;
  }
  
  private renderFootnoteReference(ref: FootnoteReference): HTMLElement {
    const sup = this.doc.createElement('sup');
    const link = this.doc.createElement('a');
    link.className = 'footnote-marker';
    link.href = `#footnote-${ref.id}`;
    link.textContent = ref.id;
    link.title = 'Jump to footnote';
    
    // Add click handler for smooth scrolling
    link.onclick = (e) => {
      e.preventDefault();
      const footnote = this.doc.getElementById(`footnote-${ref.id}`);
      if (footnote) {
        footnote.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    sup.appendChild(link);
    return sup;
  }
  
  private renderFootnoteSection(): HTMLElement | null {
    if (this.footnoteMap.size === 0) return null;
    
    const section = this.doc.createElement('div');
    section.className = 'footnote-section';
    
    const heading = this.doc.createElement('h3');
    heading.textContent = 'Footnotes';
    heading.className = 'text-lg font-semibold mb-2';
    section.appendChild(heading);
    
    Array.from(this.footnoteMap.values()).forEach(footnote => {
      const item = this.doc.createElement('div');
      item.className = 'footnote-item';
      item.id = `footnote-${footnote.id}`;
      
      const number = this.doc.createElement('span');
      number.className = 'footnote-number';
      number.textContent = `${footnote.id}.`;
      item.appendChild(number);
      
      const content = this.doc.createElement('span');
      // Footnote contains elements (paragraphs, tables) not runs
      if (footnote.elements && footnote.elements.length > 0) {
        footnote.elements.forEach(element => {
          if (element.type === 'paragraph') {
            const p = this.renderEnhancedParagraph(element);
            content.appendChild(p);
          } else if (element.type === 'table') {
            const table = this.renderEnhancedTable(element);
            content.appendChild(table);
          }
        });
      }
      item.appendChild(content);
      
      section.appendChild(item);
    });
    
    return section;
  }
  
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]!);
    }
    return btoa(binary);
  }
  
  renderDocument(parsedDoc: ParsedDocument): HTMLElement {
    const container = this.doc.createElement('div');
    container.className = 'document-container';
    
    // Add enhanced styles
    this.addEnhancedStyles();
    
    // First pass: collect footnotes
    parsedDoc.elements.forEach(element => {
      if (element.type === 'footnote') {
        this.footnoteMap.set(element.id, element);
      }
    });
    
    // Second pass: render elements
    parsedDoc.elements.forEach(element => {
      const rendered = this.renderElement(element);
      if (rendered) {
        container.appendChild(rendered);
      }
    });
    
    // Add footnote section at the end
    const footnoteSection = this.renderFootnoteSection();
    if (footnoteSection) {
      container.appendChild(footnoteSection);
    }
    
    return container;
  }
  
  private renderElement(element: DocumentElement): HTMLElement | null {
    switch (element.type) {
      case 'paragraph':
        return this.renderEnhancedParagraph(element);
      
      case 'heading':
        const headingLevel = element.level ?? 1;
        const level = Math.min(6, Math.max(1, headingLevel));
        const h = this.doc.createElement(`h${level}`);
        const headingClasses = ['font-bold', 'mb-4'];
        if (headingLevel === 1) headingClasses.push('text-4xl');
        else if (headingLevel === 2) headingClasses.push('text-3xl');
        else if (headingLevel === 3) headingClasses.push('text-2xl');
        else if (headingLevel === 4) headingClasses.push('text-xl');
        else if (headingLevel === 5) headingClasses.push('text-lg');
        h.className = headingClasses.join(' ');
        
        if (element.runs) {
          element.runs.forEach(run => {
            h.appendChild(this.renderEnhancedTextRun(run));
          });
        }
        return h;
      
      case 'table':
        return this.renderEnhancedTable(element);
      
      case 'image':
        return this.renderEnhancedImage(element);
      
      case 'footnoteReference':
        return this.renderFootnoteReference(element);
      
      case 'footnote':
        // Footnotes are rendered in a separate section
        return null;
      
      case 'bookmark':
        const anchor = this.doc.createElement('a');
        anchor.id = element.name;
        if (element.text) {
          anchor.textContent = element.text;
        }
        return anchor;
      
      case 'pageBreak':
        if (this.options.renderMode === 'print') {
          const div = this.doc.createElement('div');
          div.className = 'page-break';
          return div;
        }
        return null;
      
      default:
        return null;
    }
  }
  
  renderToHTML(parsedDoc: ParsedDocument): string {
    const container = this.renderDocument(parsedDoc);
    return container.outerHTML;
  }
}