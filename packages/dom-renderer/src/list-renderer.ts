// List rendering utilities for DOM renderer
import type { DocumentElement, Paragraph } from '@browser-document-viewer/parser';
import { renderParagraph } from './element-renderers';

export interface ListGroup {
  type: 'bullet' | 'number';
  level: number;
  items: Paragraph[];
}

/**
 * Group consecutive list items into proper list structures
 */
export function groupListItems(elements: DocumentElement[]): DocumentElement[] {
  const result: DocumentElement[] = [];
  let currentGroup: ListGroup | null = null;
  
  for (const element of elements) {
    if (element.type === 'paragraph' && element.listInfo) {
      const { level, type } = element.listInfo;
      
      // Check if we can extend the current group
      if (currentGroup && currentGroup.type === type && currentGroup.level === level) {
        currentGroup.items.push(element);
      } else {
        // Close previous group if it exists
        if (currentGroup) {
          result.push(createListElement(currentGroup));
        }
        
        // Start new group
        currentGroup = {
          type,
          level,
          items: [element]
        };
      }
    } else {
      // Close current group if it exists
      if (currentGroup) {
        result.push(createListElement(currentGroup));
        currentGroup = null;
      }
      
      // Add non-list element
      result.push(element);
    }
  }
  
  // Close any remaining group
  if (currentGroup) {
    result.push(createListElement(currentGroup));
  }
  
  return result;
}

/**
 * Create a list element from a group of list items
 */
function createListElement(group: ListGroup): DocumentElement {
  return {
    type: 'list' as any, // We'll add this to the types later
    listType: group.type,
    level: group.level,
    items: group.items
  } as any;
}

/**
 * Render a list element to HTML
 */
export function renderList(
  listElement: any,
  doc: Document,
  currentPageNumber: number,
  totalPages: number
): HTMLElement {
  const listTag = listElement.listType === 'bullet' ? 'ul' : 'ol';
  const listEl = doc.createElement(listTag);
  
  // Add margin for nested lists
  if (listElement.level > 0) {
    listEl.style.marginLeft = `${listElement.level * 24}pt`;
  }
  
  // Add standard list styles
  listEl.style.marginBottom = '12pt';
  listEl.style.paddingLeft = '24pt';
  
  // Set list style type based on level and type
  if (listElement.listType === 'bullet') {
    const bulletStyles = ['disc', 'circle', 'square'];
    listEl.style.listStyleType = bulletStyles[listElement.level % bulletStyles.length] || 'disc';
  } else {
    // For numbered lists, try to determine the format from the first item's listInfo
    const firstItem = listElement.items[0];
    const listInfo = firstItem?.listInfo;
    
    if (listInfo?.numFmt) {
      // Use the actual numbering format from the DOCX file
      const numFmt = listInfo.numFmt;
      switch (numFmt) {
        case 'decimal':
          listEl.style.listStyleType = 'decimal';
          break;
        case 'upperLetter':
          listEl.style.listStyleType = 'upper-alpha';
          break;
        case 'lowerLetter':
          listEl.style.listStyleType = 'lower-alpha';
          break;
        case 'upperRoman':
          listEl.style.listStyleType = 'upper-roman';
          break;
        case 'lowerRoman':
          listEl.style.listStyleType = 'lower-roman';
          break;
        default:
          listEl.style.listStyleType = 'decimal';
          break;
      }
    } else if (listInfo?.text) {
      // Fallback to text pattern analysis
      const lvlText = listInfo.text;
      if (lvlText === '%1.') {
        listEl.style.listStyleType = 'decimal';
      } else if (lvlText.includes('%1')) {
        listEl.style.listStyleType = 'upper-alpha';
      } else {
        listEl.style.listStyleType = 'decimal';
      }
    } else {
      // Fallback to level-based numbering
      const numberStyles = ['decimal', 'upper-alpha', 'lower-roman'];
      listEl.style.listStyleType = numberStyles[listElement.level % numberStyles.length] || 'decimal';
    }
  }
  
  // Render each list item
  for (const item of listElement.items) {
    const li = doc.createElement('li');
    li.style.marginBottom = '4pt';
    
    // Render the paragraph content inside the list item
    const paragraphContent = renderParagraph(item, doc, currentPageNumber, totalPages);
    
    // Move the paragraph's content to the list item
    while (paragraphContent.firstChild) {
      li.appendChild(paragraphContent.firstChild);
    }
    
    // Remove default paragraph margins for list items
    li.style.marginTop = '0';
    li.style.marginBottom = '4pt';
    
    listEl.appendChild(li);
  }
  
  return listEl;
}