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
          {table.rows.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className={row.properties?.isHeader ? 'font-semibold' : ''}
              data-testid={`table-${index}-row-${rowIndex}`}
            >
              {row.cells.map((cell, cellIndex) => {
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
                    {cell.content.map((paragraph, pIndex) => 
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
      switch (paragraph.style) {
        case 'Title':
          Tag = 'h1';
          className = 'text-3xl font-bold mb-4';
          break;
        case 'Heading1':
          Tag = 'h1';
          className = 'text-2xl font-bold mb-3';
          break;
        case 'Heading2':
          Tag = 'h2';
          className = 'text-xl font-bold mb-2';
          break;
        case 'Heading3':
          Tag = 'h3';
          className = 'text-lg font-bold mb-2';
          break;
        default:
          className = 'mb-2';
      }
    } else {
      className = 'mb-2';
    }
    
    const content: React.ReactElement[] = [];
    
    // Render runs
    runs.forEach((run, index) => {
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
    fields?.forEach((field, index) => {
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