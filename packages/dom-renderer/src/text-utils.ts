import type { TextRun, Paragraph } from '@browser-document-viewer/parser';

export function renderEnhancedTextRun(
  run: TextRun,
  doc: Document,
  enableAdvancedFormatting: boolean = true
): HTMLElement {
  const span = doc.createElement('span');
  const classes: string[] = [];
  
  // Basic formatting
  if (run.bold) classes.push('font-bold');
  if (run.italic) classes.push('italic');
  if (run.underline) classes.push('underline');
  if (run.strikethrough) classes.push('line-through');
  
  // Advanced formatting
  if (enableAdvancedFormatting) {
    if (run.superscript) {
      const sup = doc.createElement('sup');
      sup.textContent = run.text || '';
      return sup;
    }
    
    if (run.subscript) {
      const sub = doc.createElement('sub');
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
    const link = doc.createElement('a');
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

export function renderEnhancedParagraph(
  paragraph: Paragraph,
  doc: Document,
  options: {
    enableDropcaps?: boolean;
    enableAdvancedFormatting?: boolean;
  },
  renderTextRun: (run: TextRun) => HTMLElement,
  renderImage: (image: any) => HTMLElement
): HTMLElement {
  const p = doc.createElement('p');
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
  if (options.enableDropcaps && paragraph.runs && paragraph.runs.length > 0 && paragraph.runs[0]?.text) {
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
        const dropcap = doc.createElement('span');
        dropcap.className = 'dropcap dropcap-3';
        dropcap.textContent = text.charAt(0);
        p.appendChild(dropcap);
        
        // Add the rest of the first run
        const remainingText = Object.assign({}, firstRun, { text: text.substring(1) });
        p.appendChild(renderTextRun(remainingText));
        
        // Add remaining runs
        paragraph.runs.slice(1).forEach(run => {
          p.appendChild(renderTextRun(run));
        });
        
        return p;
      }
    }
  }
  
  // Normal paragraph rendering
  if (paragraph.runs) {
    paragraph.runs.forEach(run => {
      p.appendChild(renderTextRun(run));
    });
  }
  
  // Handle images in paragraph
  if (paragraph.images && paragraph.images.length > 0) {
    paragraph.images.forEach(img => {
      const imgEl = renderImage(img);
      p.appendChild(imgEl);
    });
  }
  
  return p;
}