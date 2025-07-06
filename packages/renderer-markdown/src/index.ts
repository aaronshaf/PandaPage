import type {
  ParsedDocument,
  DocumentElement,
  Paragraph,
  Heading,
  Table,
  TextRun,
  DocumentMetadata
} from '@pandapage/parser';

export interface MarkdownRenderOptions {
  includeFrontmatter?: boolean;
  headingOffset?: number;
}

function renderTextRun(run: TextRun): string {
  let text = run.text;
  
  // Apply formatting
  if (run.bold) text = `**${text}**`;
  if (run.italic) text = `*${text}*`;
  if (run.underline) text = `<u>${text}</u>`;
  if (run.strikethrough) text = `~~${text}~~`;
  if (run.superscript) text = `<sup>${text}</sup>`;
  if (run.subscript) text = `<sub>${text}</sub>`;
  
  // Apply link
  if (run.link) {
    text = `[${text}](${run.link})`;
  }
  
  return text;
}

function renderParagraph(paragraph: Paragraph): string {
  const text = paragraph.runs.map(renderTextRun).join('').trim();
  
  if (paragraph.listInfo) {
    const indent = '  '.repeat(paragraph.listInfo.level);
    const marker = paragraph.listInfo.type === 'bullet' ? '-' : '1.';
    return `${indent}${marker} ${text}`;
  }
  
  return text;
}

function renderHeading(heading: Heading): string {
  const text = heading.runs.map(renderTextRun).join('').trim();
  const hashes = '#'.repeat(heading.level);
  return `${hashes} ${text}`;
}

function renderTable(table: Table): string {
  const lines: string[] = [];
  
  table.rows.forEach((row, rowIndex) => {
    const cells = row.cells.map(cell => {
      // Join all paragraphs in the cell
      return cell.paragraphs.map(p => p.runs.map(r => r.text).join('').trim()).join(' ');
    });
    
    lines.push(`| ${cells.join(' | ')} |`);
    
    // Add separator after header row
    if (rowIndex === 0) {
      const separators = cells.map(() => '---');
      lines.push(`| ${separators.join(' | ')} |`);
    }
  });
  
  return lines.join('\n');
}

function renderHeader(header: DocumentElement): string {
  if (header.type !== 'header') return '';
  const elements = header.elements.map(el => {
    if (el.type === 'paragraph') {
      return renderParagraph(el);
    } else if (el.type === 'table') {
      return renderTable(el);
    }
    return '';
  }).filter(Boolean);
  
  return `<!-- HEADER -->\n${elements.join('\n\n')}\n<!-- /HEADER -->`;
}

function renderFooter(footer: DocumentElement): string {
  if (footer.type !== 'footer') return '';
  const elements = footer.elements.map(el => {
    if (el.type === 'paragraph') {
      return renderParagraph(el);
    } else if (el.type === 'table') {
      return renderTable(el);
    }
    return '';
  }).filter(Boolean);
  
  return `<!-- FOOTER -->\n${elements.join('\n\n')}\n<!-- /FOOTER -->`;
}

function renderElement(element: DocumentElement): string {
  switch (element.type) {
    case 'paragraph':
      return renderParagraph(element);
    case 'heading':
      return renderHeading(element);
    case 'table':
      return renderTable(element);
    case 'header':
      return renderHeader(element);
    case 'footer':
      return renderFooter(element);
    case 'image':
      return `![${element.alt || 'Image'}](data:${element.mimeType};base64,${btoa(String.fromCharCode(...new Uint8Array(element.data)))})`;
    case 'pageBreak':
      return '---';
    default:
      return '';
  }
}

function renderFrontmatter(metadata: DocumentMetadata): string {
  const lines: string[] = ['---'];
  
  if (metadata.title) lines.push(`title: "${metadata.title}"`);
  if (metadata.author) lines.push(`author: "${metadata.author}"`);
  if (metadata.createdDate) lines.push(`created: ${metadata.createdDate.toISOString()}`);
  if (metadata.modifiedDate) lines.push(`modified: ${metadata.modifiedDate.toISOString()}`);
  if (metadata.keywords && metadata.keywords.length > 0) {
    lines.push(`keywords: [${metadata.keywords.map(k => `"${k}"`).join(', ')}]`);
  }
  if (metadata.description) lines.push(`description: "${metadata.description}"`);
  if (metadata.language) lines.push(`language: ${metadata.language}`);
  
  lines.push('---');
  return lines.join('\n');
}

export function renderToMarkdown(document: ParsedDocument, options: MarkdownRenderOptions = {}): string {
  const lines: string[] = [];
  
  // Add frontmatter if requested and metadata exists
  if (options.includeFrontmatter !== false && Object.keys(document.metadata).length > 0) {
    lines.push(renderFrontmatter(document.metadata));
    lines.push('');
  }
  
  // Render each element
  document.elements.forEach(element => {
    const rendered = renderElement(element);
    if (rendered) {
      lines.push(rendered);
      
      // Add spacing after blocks
      if (element.type === 'paragraph' || element.type === 'heading' || element.type === 'table') {
        lines.push('');
      }
    }
  });
  
  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  
  return lines.join('\n');
}