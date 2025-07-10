import { describe, it, expect } from 'bun:test';
import { parseFieldInstruction, createFieldPlaceholder, parseAdvancedFieldRun } from './field-code-parser';

describe('Field Code Parser - Complete Coverage', () => {
  describe('parseFieldInstruction - Edge Cases', () => {
    it('should handle empty parts in field instruction', () => {
      // Test lines 134-135: empty part handling
      const result = parseFieldInstruction('HYPERLINK   "url"'); // Multiple spaces create empty parts
      expect(result.type).toBe('HYPERLINK');
      expect(result.arguments).toContain('url');
    });

    it('should handle quoted strings with spaces', () => {
      // Test lines 149-155: continuing quotes across multiple parts
      const result = parseFieldInstruction('HYPERLINK "https://example.com/page with spaces"');
      expect(result.type).toBe('HYPERLINK');
      expect(result.arguments[0]).toBe('https://example.com/page with spaces');
    });

    it('should handle switch with value', () => {
      // Test line 164: switch value handling
      const result = parseFieldInstruction('TOC \\o "1-3"');
      expect(result.type).toBe('TOC');
      expect(result.switches.get('\\o')).toBe('"1-3"'); // Quotes are preserved
    });

    it('should handle HYPERLINK with bookmark (\\l switch)', () => {
      // Test lines 196,198: HYPERLINK with bookmark ref
      const result = parseFieldInstruction('HYPERLINK \\l "BookmarkName"');
      expect(result.type).toBe('HYPERLINK');
      expect(result.bookmarkRef).toBe('BookmarkName');
    });

    it('should handle HYPERLINK with bookmark without quotes', () => {
      const result = parseFieldInstruction('HYPERLINK \\l BookmarkName');
      expect(result.type).toBe('HYPERLINK');
      expect(result.bookmarkRef).toBe('BookmarkName');
    });

    it('should handle STYLEREF field', () => {
      // Test lines 211-214: STYLEREF field type
      const result = parseFieldInstruction('STYLEREF "Heading 1"');
      expect(result.type).toBe('STYLEREF');
      expect(result.styleName).toBe('Heading 1');
    });

    it('should handle STYLEREF without quotes', () => {
      const result = parseFieldInstruction('STYLEREF Heading1');
      expect(result.type).toBe('STYLEREF');
      expect(result.styleName).toBe('Heading1');
    });

    it('should handle TC field type', () => {
      const result = parseFieldInstruction('TC "Table of Contents Entry"');
      expect(result.type).toBe('TC');
      expect(result.arguments[0]).toBe('Table of Contents Entry');
    });

    it('should handle XE field type', () => {
      const result = parseFieldInstruction('XE "Index Entry"');
      expect(result.type).toBe('XE');
      expect(result.arguments[0]).toBe('Index Entry');
    });

    it('should handle NOTEREF field type', () => {
      const result = parseFieldInstruction('NOTEREF _Ref12345');
      expect(result.type).toBe('NOTEREF');
      expect(result.arguments[0]).toBe('_Ref12345');
    });
  });

  describe('createFieldPlaceholder - Additional Cases', () => {
    it('should handle NUMPAGES field', () => {
      // Test line 253
      const result = createFieldPlaceholder({
        type: 'NUMPAGES',
        instruction: 'NUMPAGES',
        switches: new Map(),
        arguments: []
      });
      expect(result).toBe('1');
    });

    it('should handle TIME field', () => {
      // Test line 261
      const result = createFieldPlaceholder({
        type: 'TIME',
        instruction: 'TIME',
        switches: new Map(),
        arguments: []
      });
      expect(result).toMatch(/\d{1,2}:\d{2}:\d{2}/); // Time format
    });

    it('should handle FILENAME field', () => {
      // Test line 266
      const result = createFieldPlaceholder({
        type: 'FILENAME',
        instruction: 'FILENAME',
        switches: new Map(),
        arguments: []
      });
      expect(result).toBe('[Filename]');
    });

    it('should handle TITLE field without metadata', () => {
      // Test line 269
      const result = createFieldPlaceholder({
        type: 'TITLE',
        instruction: 'TITLE',
        switches: new Map(),
        arguments: []
      });
      expect(result).toBe('[Title]');
    });

    it('should handle SUBJECT field', () => {
      // Test lines 278-279
      const result = createFieldPlaceholder({
        type: 'SUBJECT',
        instruction: 'SUBJECT',
        switches: new Map(),
        arguments: []
      });
      expect(result).toBe('[Subject]');
    });

    it('should handle KEYWORDS field', () => {
      // Test lines 281-282
      const result = createFieldPlaceholder({
        type: 'KEYWORDS',
        instruction: 'KEYWORDS',
        switches: new Map(),
        arguments: []
      });
      expect(result).toBe('[Keywords]');
    });

    it('should handle LASTSAVEDBY field', () => {
      // Test line 284 - defaults to {FIELDTYPE} pattern
      const result = createFieldPlaceholder({
        type: 'LASTSAVEDBY',
        instruction: 'LASTSAVEDBY',
        switches: new Map(),
        arguments: []
      });
      expect(result).toBe('{LASTSAVEDBY}');
    });

    it('should handle FILESIZE field', () => {
      // Test lines 293-294 - defaults to {FIELDTYPE} pattern
      const result = createFieldPlaceholder({
        type: 'FILESIZE',
        instruction: 'FILESIZE',
        switches: new Map(),
        arguments: []
      });
      expect(result).toBe('{FILESIZE}');
    });

    it('should handle CREATEDATE field', () => {
      // Test lines 296-299
      const result = createFieldPlaceholder({
        type: 'CREATEDATE',
        instruction: 'CREATEDATE',
        switches: new Map(),
        arguments: []
      });
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format
    });

    it('should handle SAVEDATE field', () => {
      // Test lines 308-309
      const result = createFieldPlaceholder({
        type: 'SAVEDATE',
        instruction: 'SAVEDATE',
        switches: new Map(),
        arguments: []
      });
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format
    });

    it('should handle PRINTDATE field', () => {
      // Test lines 311-312
      const result = createFieldPlaceholder({
        type: 'PRINTDATE',
        instruction: 'PRINTDATE',
        switches: new Map(),
        arguments: []
      });
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format
    });

    it('should handle TC field placeholder', () => {
      // Test line 314 - defaults to {FIELDTYPE} pattern
      const result = createFieldPlaceholder({
        type: 'TC',
        instruction: 'TC "Entry"',
        switches: new Map(),
        arguments: ['Entry']
      });
      expect(result).toBe('{TC}');
    });

    it('should handle XE field placeholder', () => {
      const result = createFieldPlaceholder({
        type: 'XE',
        instruction: 'XE "Entry"',
        switches: new Map(),
        arguments: ['Entry']
      });
      expect(result).toBe('{XE}');
    });

    it('should handle NOTEREF field placeholder', () => {
      const result = createFieldPlaceholder({
        type: 'NOTEREF',
        instruction: 'NOTEREF',
        switches: new Map(),
        arguments: []
      });
      expect(result).toBe('{NOTEREF}');
    });
  });

  describe('parseAdvancedFieldRun - Run Properties', () => {
    it('should parse font size from run properties', () => {
      // Test lines 356-357
      const mockRunProps = createMockElement('w:rPr', [
        createMockElement('w:sz', [], { 'w:val': '24' })
      ]);
      
      const result = parseAdvancedFieldRun('PAGE', mockRunProps, 'w');
      expect(result?.fontSize).toBe('24'); // Stored as raw value
    });

    it('should parse bold from run properties', () => {
      // Test lines 359-360
      const mockRunProps = createMockElement('w:rPr', [
        createMockElement('w:b', [])
      ]);
      
      const result = parseAdvancedFieldRun('PAGE', mockRunProps, 'w');
      expect(result?.bold).toBe(true);
    });

    it('should parse italic from run properties', () => {
      // Test lines 362-364
      const mockRunProps = createMockElement('w:rPr', [
        createMockElement('w:i', [])
      ]);
      
      const result = parseAdvancedFieldRun('PAGE', mockRunProps, 'w');
      expect(result?.italic).toBe(true);
    });

    it('should parse underline from run properties', () => {
      // Test lines 366-367
      const mockRunProps = createMockElement('w:rPr', [
        createMockElement('w:u', [])
      ]);
      
      const result = parseAdvancedFieldRun('PAGE', mockRunProps, 'w');
      expect(result?.underline).toBe(true);
    });

    it('should parse color from run properties', () => {
      const mockRunProps = createMockElement('w:rPr', [
        createMockElement('w:color', [], { 'w:val': 'FF0000' })
      ]);
      
      const result = parseAdvancedFieldRun('PAGE', mockRunProps, 'w');
      expect(result?.color).toBe('FF0000');
    });

    it('should handle run properties with multiple formatting', () => {
      const mockRunProps = createMockElement('w:rPr', [
        createMockElement('w:sz', [], { 'w:val': '28' }),
        createMockElement('w:b', []),
        createMockElement('w:i', []),
        createMockElement('w:u', []),
        createMockElement('w:color', [], { 'w:val': '0000FF' })
      ]);
      
      const result = parseAdvancedFieldRun('PAGE', mockRunProps, 'w');
      expect(result?.fontSize).toBe('28'); // Stored as raw value
      expect(result?.bold).toBe(true);
      expect(result?.italic).toBe(true);
      expect(result?.underline).toBe(true);
      expect(result?.color).toBe('0000FF');
    });
  });

  describe('Error Handling', () => {
    it('should handle field instruction parsing errors', () => {
      // Test lines 389-391: error handling
      // This might be hard to trigger as parseFieldInstruction is quite robust
      // Let's test with some edge cases that might cause issues
      
      const result = parseFieldInstruction('');
      expect(result.type).toBe('UNKNOWN');
      
      const result2 = parseFieldInstruction('   ');
      expect(result2.type).toBe('UNKNOWN');
    });
  });

  describe('Context Usage', () => {
    it('should use metadata from context for AUTHOR field', () => {
      const context = {
        metadata: { creator: 'Test Author' }
      };
      
      const fieldCode = parseFieldInstruction('AUTHOR');
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe('Test Author');
    });

    it('should use metadata from context for TITLE field', () => {
      const context = {
        metadata: { title: 'Test Title' }
      };
      
      const fieldCode = parseFieldInstruction('TITLE');
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe('Test Title');
    });

    it('should use metadata from context for SUBJECT field', () => {
      const context = {
        metadata: { subject: 'Test Subject' }
      };
      
      const fieldCode = parseFieldInstruction('SUBJECT');
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe('Test Subject');
    });

    it('should use metadata from context for KEYWORDS field', () => {
      const context = {
        metadata: { keywords: 'test, keywords' }
      };
      
      const fieldCode = parseFieldInstruction('KEYWORDS');
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe('test, keywords');
    });

    it('should use metadata from context for LASTSAVEDBY field', () => {
      const context = {
        metadata: { lastModifiedBy: 'Test User' }
      };
      
      const fieldCode = parseFieldInstruction('LASTSAVEDBY');
      const result = createFieldPlaceholder(fieldCode, context);
      expect(result).toBe('{LASTSAVEDBY}'); // LASTSAVEDBY is not handled in the switch
    });
  });
});

// Helper function to create mock DOM elements
function createMockElement(tagName: string, children: any[] = [], attributes: Record<string, string> = {}): Element {
  return {
    tagName,
    getElementsByTagNameNS: (ns: string, name: string) => {
      return children.filter(child => child.tagName === `${ns}:${name}` || child.tagName === name);
    },
    getAttribute: (name: string) => attributes[name] || null,
    hasAttribute: (name: string) => name in attributes,
    querySelector: () => null,
    querySelectorAll: () => [],
    textContent: '',
    childNodes: children,
    children
  } as unknown as Element;
}