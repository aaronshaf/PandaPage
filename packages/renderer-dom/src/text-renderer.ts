import type { TextRun } from '@browser-document-viewer/parser';

export function renderTextRun(
  run: TextRun, 
  doc: Document, 
  currentPageNumber: number, 
  totalPages: number
): HTMLElement {
  // Handle field codes
  if ((run as any)._fieldCode) {
    const fieldCode = (run as any)._fieldCode;
    let modifiedRun = { ...run };
    
    switch (fieldCode) {
      case 'PAGE':
        modifiedRun.text = currentPageNumber.toString();
        break;
      case 'NUMPAGES':
        modifiedRun.text = totalPages.toString();
        break;
    }
    
    run = modifiedRun;
  }
  
  // Check for footnote reference first
  if ((run as any)._footnoteRef) {
    const footnoteId = (run as any)._footnoteRef;
    const link = doc.createElement('a');
    link.href = `#footnote-${footnoteId}`;
    link.className = 'footnote-reference';
    link.setAttribute('data-footnote-id', footnoteId);
    
    const sup = doc.createElement('sup');
    sup.textContent = run.text;
    link.appendChild(sup);
    
    return link;
  }
  
  let element: HTMLElement;
  
  // Handle links
  if (run.link) {
    element = doc.createElement('a');
    (element as HTMLAnchorElement).href = run.link;
    element.setAttribute('target', '_blank');
    element.setAttribute('rel', 'noopener noreferrer');
    // Only add onclick in browser environment
    if (typeof window !== 'undefined') {
      element.setAttribute('onclick', 'return confirmDocumentLink(this.href)');
    }
  } else {
    element = doc.createElement('span');
  }
  
  // Apply formatting styles
  if (run.bold) element.style.fontWeight = 'bold';
  if (run.italic) element.style.fontStyle = 'italic';
  if (run.underline) element.style.textDecoration = 'underline';
  if (run.strikethrough) element.style.textDecoration = 'line-through';
  
  // Apply inline styles
  const styles: string[] = [];
  if (run.fontSize) styles.push(`font-size: ${run.fontSize}pt`);
  if (run.fontFamily) styles.push(`font-family: ${run.fontFamily}`);
  if (run.color) styles.push(`color: ${run.color}`);
  if (run.backgroundColor) styles.push(`background-color: ${run.backgroundColor}`);
  
  if (styles.length > 0) {
    element.style.cssText = styles.join('; ');
  }
  
  // Handle superscript/subscript
  if (run.superscript) {
    const sup = doc.createElement('sup');
    sup.textContent = run.text;
    element.appendChild(sup);
  } else if (run.subscript) {
    const sub = doc.createElement('sub');
    sub.textContent = run.text;
    element.appendChild(sub);
  } else {
    element.textContent = run.text;
  }
  
  return element;
}