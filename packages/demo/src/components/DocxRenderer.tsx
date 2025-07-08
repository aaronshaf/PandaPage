import React from 'react';
import type { DocxElement, DocxTable, DocxParagraph } from '@pandapage/pandapage';

interface DocxRendererProps {
  elements: DocxElement[];
  viewMode: 'read' | 'print';
}

export const DocxRenderer: React.FC<DocxRendererProps> = ({ elements, viewMode }) => {
  const renderTable = (table: DocxTable, index: number) => {
    const { properties } = table;
    
    // Calculate table style based on properties
    const tableStyle: React.CSSProperties = {};
    
    if (properties?.width) {
      tableStyle.width = properties.width;
    }
    
    // Handle table alignment
    if (properties?.alignment === 'center') {
      tableStyle.marginLeft = 'auto';
      tableStyle.marginRight = 'auto';
    } else if (properties?.alignment === 'right') {
      tableStyle.marginLeft = 'auto';
    }
    
    // Handle table indentation
    if (properties?.indentation) {
      tableStyle.marginLeft = properties.indentation;
    }
    
    if (properties?.backgroundColor) {
      tableStyle.backgroundColor = properties.backgroundColor;
    }
    
    // Add appropriate classes based on view mode
    const tableClasses = viewMode === 'print' 
      ? 'table-fixed border-collapse' 
      : 'table-auto border-collapse w-full';
    
    return (
      <table 
        key={index} 
        className={tableClasses}
        style={tableStyle}
        data-testid={`table-${index}`}
      >
        <tbody>
          {table.rows.map((row: any, rowIndex: number) => (
            <tr 
              key={rowIndex}
              className={row.properties?.isHeader ? 'font-semibold' : ''}
              data-testid={`table-${index}-row-${rowIndex}`}
            >
              {row.cells.map((cell: any, cellIndex: number) => {
                const Tag = row.properties?.isHeader ? 'th' : 'td';
                const cellStyle: React.CSSProperties = {};
                
                if (cell.properties?.width) {
                  cellStyle.width = cell.properties.width;
                }
                
                if (cell.properties?.backgroundColor) {
                  cellStyle.backgroundColor = cell.properties.backgroundColor;
                }
                
                if (cell.properties?.alignment) {
                  if (['top', 'center', 'bottom'].includes(cell.properties.alignment)) {
                    cellStyle.verticalAlign = cell.properties.alignment;
                  } else {
                    cellStyle.textAlign = cell.properties.alignment as any;
                  }
                }
                
                // Apply border styles
                const borderClass = viewMode === 'print' 
                  ? 'border border-gray-300 px-4 py-2' 
                  : 'border border-gray-200 px-3 py-2';
                
                return (
                  <Tag 
                    key={cellIndex}
                    className={borderClass}
                    style={cellStyle}
                    data-testid={`table-${index}-cell-${rowIndex}-${cellIndex}`}
                  >
                    {cell.content.map((paragraph: any, pIndex: number) => 
                      renderParagraph(paragraph, `${index}-${rowIndex}-${cellIndex}-${pIndex}`)
                    )}
                  </Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  const renderParagraph = (paragraph: DocxParagraph, key: string) => {
    const { runs = [], fields = [] } = paragraph;
    
    // Determine paragraph style and tag
    let Tag: keyof React.JSX.IntrinsicElements = 'p';
    let className = '';
    
    if (paragraph.style) {
      const styleNormalized = paragraph.style.toLowerCase().replace(/\s+/g, '');
      
      // Enhanced heading detection for DocxRenderer
      const isHeading = (
        styleNormalized === 'title' ||
        styleNormalized === 'heading' ||
        styleNormalized.startsWith('heading') ||
        styleNormalized.startsWith('head') ||
        styleNormalized.includes('title') ||
        // Common DOCX heading style variations
        /^h[1-6]$/.test(styleNormalized) ||
        /^heading[1-6]$/.test(styleNormalized) ||
        /^title\d*$/.test(styleNormalized)
      );
      
      if (isHeading) {
        let level: 1 | 2 | 3 | 4 | 5 | 6 = 1;
        
        // Extract level from various patterns
        const levelMatches = [
          styleNormalized.match(/heading\s*(\d)/),
          styleNormalized.match(/head\s*(\d)/),
          styleNormalized.match(/h(\d)/),
          styleNormalized.match(/title(\d)/),
          // Look for digit at the end
          styleNormalized.match(/(\d)$/),
        ];
        
        for (const match of levelMatches) {
          if (match && match[1]) {
            const parsedLevel = parseInt(match[1]);
            if (parsedLevel >= 1 && parsedLevel <= 6) {
              level = parsedLevel as 1 | 2 | 3 | 4 | 5 | 6;
              break;
            }
          }
        }
        
        // Special case for 'title'
        if (styleNormalized === 'title') {
          level = 1;
        }
        
        // Set tag and let App.css handle the styling
        switch (level) {
          case 1:
            Tag = 'h1';
            break;
          case 2:
            Tag = 'h2';
            break;
          case 3:
            Tag = 'h3';
            break;
          case 4:
            Tag = 'h4';
            break;
          case 5:
            Tag = 'h5';
            break;
          case 6:
            Tag = 'h6';
            break;
        }
      } else {
        className = 'mb-2';
      }
    } else {
      className = 'mb-2';
    }
    
    const content: React.ReactElement[] = [];
    
    // Render runs
    runs.forEach((run: any, index: number) => {
      let textElement: React.ReactElement = <React.Fragment key={`run-${index}`}>{run.text}</React.Fragment>;
      
      if (run.bold) {
        textElement = <strong key={`run-${index}`}>{textElement}</strong>;
      }
      
      if (run.italic) {
        textElement = <em key={`run-${index}`}>{textElement}</em>;
      }
      
      if (run.underline) {
        textElement = <u key={`run-${index}`}>{textElement}</u>;
      }
      
      content.push(textElement);
    });
    
    // Render form fields
    fields?.forEach((field: any, index: number) => {
      if (field.type === 'FORMTEXT') {
        content.push(
          <span 
            key={`field-${index}`} 
            className="inline-block border-b border-gray-400 min-w-[100px] mx-1"
            data-testid={`form-field-${key}-${index}`}
          >
            &nbsp;
          </span>
        );
      } else if (field.type === 'FORMCHECKBOX') {
        content.push(
          <input 
            key={`field-${index}`}
            type="checkbox"
            className="mx-1"
            data-testid={`form-checkbox-${key}-${index}`}
            disabled
          />
        );
      }
    });
    
    return (
      <Tag key={key} className={className} data-testid={`paragraph-${key}`}>
        {content.length > 0 ? content : '\u00A0'}
      </Tag>
    );
  };
  
  return (
    <div className={viewMode === 'print' ? 'print-content' : 'prose prose-gray max-w-none'}>
      {elements.map((element, index) => {
        if (element.type === 'table') {
          return renderTable(element, index);
        } else {
          return renderParagraph(element, `${index}`);
        }
      })}
    </div>
  );
};