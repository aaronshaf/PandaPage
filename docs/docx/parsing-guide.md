# DOCX Parsing Implementation Guide

## Overview

This guide provides practical advice for implementing a DOCX parser, covering common patterns, gotchas, and optimization strategies based on real-world experience.

## Parser Architecture

### Recommended Structure

```
docx-parser/
├── core/
│   ├── zip-handler.ts      # ZIP extraction
│   ├── xml-parser.ts       # XML parsing utilities
│   └── relationship.ts     # Relationship resolution
├── parsers/
│   ├── document.ts         # Main document parser
│   ├── styles.ts           # Style definitions
│   ├── numbering.ts        # List numbering
│   ├── headers-footers.ts  # Header/footer parsing
│   └── properties.ts       # Document properties
├── elements/
│   ├── paragraph.ts        # Paragraph parsing
│   ├── run.ts             # Run parsing
│   ├── table.ts           # Table parsing
│   └── image.ts           # Image handling
└── renderer/
    ├── layout.ts          # Layout engine
    └── converter.ts       # Format conversion
```

## Official Schema Compliance

### Unit System Understanding

OOXML uses a hierarchical unit system based on the official schemas:

```typescript
// Core unit constants from official schema
const TWIPS_PER_INCH = 1440;           // Word's fundamental unit
const TWIPS_PER_POINT = 20;            // Typography unit
const EMUS_PER_INCH = 914400;          // DrawingML unit  
const EMUS_PER_TWIP = 635;             // Conversion factor

// Universal measure parser (ST_UniversalMeasure)
function parseUniversalMeasure(value: string | number): number {
  if (typeof value === 'number') return value; // Raw twips
  
  const match = value.match(/^(-?[0-9]+(?:\.[0-9]+)?)(mm|cm|in|pt|pc|pi)$/);
  if (!match) return parseInt(value) || 0; // Fallback to raw number
  
  const [, numStr, unit] = match;
  const num = parseFloat(numStr);
  
  switch (unit) {
    case 'in': return Math.round(num * TWIPS_PER_INCH);
    case 'pt': return Math.round(num * TWIPS_PER_POINT);
    case 'pc': return Math.round(num * 12 * TWIPS_PER_POINT); // 1 pica = 12 points
    case 'mm': return Math.round(num * TWIPS_PER_INCH / 25.4);
    case 'cm': return Math.round(num * TWIPS_PER_INCH / 2.54);
    default: return 0;
  }
}
```

### Boolean Property Handling (ST_OnOff)

OOXML uses flexible boolean properties.
For a comprehensive overview of common simple types, including `ST_OnOff`, refer to [Common Simple Types](../../ooxml/common-simple-types.md):

```typescript
function parseOnOff(element: Element, attrName: string, defaultValue: boolean = false): boolean {
  const attr = element.getAttribute(`w:${attrName}`);
  
  // No attribute = default value
  if (attr === null) return defaultValue;
  
  // Empty attribute = true (e.g., <w:b/>)
  if (attr === '') return true;
  
  // Parse value
  switch (attr.toLowerCase()) {
    case 'true': case '1': case 'on': return true;
    case 'false': case '0': case 'off': return false;
    default: return true; // Unknown values default to true
  }
}

// Usage examples
const isBold = parseOnOff(runProps, 'b');
const isItalic = parseOnOff(runProps, 'i'); 
const isHidden = parseOnOff(runProps, 'vanish');
```

### Font Size Conversion

Font sizes in OOXML use half-points:

```typescript
function parseFontSize(element: Element, propName: string = 'sz'): number | undefined {
  const sizeEl = element.querySelector(`w\\:${propName}`);
  if (!sizeEl) return undefined;
  
  const halfPoints = parseInt(sizeEl.getAttribute('w:val') || '0');
  return halfPoints / 2; // Convert to actual points
}

// Example: <w:sz w:val="24"/> = 12pt font
const fontSize = parseFontSize(runProperties); // Returns 12
```

## Step-by-Step Implementation

### 1. ZIP Handling

```typescript
interface DocxArchive {
    getFile(path: string): Promise<ArrayBuffer | null>;
    getXml(path: string): Promise<Document | null>;
    listFiles(): string[];
}

class DocxZipHandler implements DocxArchive {
    constructor(private zip: JSZip) {}
    
    async getFile(path: string): Promise<ArrayBuffer | null> {
        const file = this.zip.file(path);
        return file ? await file.async('arraybuffer') : null;
    }
    
    async getXml(path: string): Promise<Document | null> {
        const file = this.zip.file(path);
        if (!file) return null;
        
        const text = await file.async('text');
        const parser = new DOMParser();
        return parser.parseFromString(text, 'text/xml');
    }
}
```

### 2. Relationship Resolution

```typescript
interface Relationship {
    id: string;
    type: string;
    target: string;
}

class RelationshipResolver {
    private relationships = new Map<string, Relationship>();
    
    async load(archive: DocxArchive, basePath: string) {
        const relsPath = `${basePath}/_rels/${path.basename(basePath)}.rels`;
        const doc = await archive.getXml(relsPath);
        
        if (doc) {
            const rels = doc.getElementsByTagName('Relationship');
            for (const rel of rels) {
                this.relationships.set(rel.getAttribute('Id'), {
                    id: rel.getAttribute('Id'),
                    type: rel.getAttribute('Type'),
                    target: rel.getAttribute('Target')
                });
            }
        }
    }
    
    resolve(id: string): string | null {
        return this.relationships.get(id)?.target || null;
    }
}
```

### 3. Property Inheritance

```typescript
interface PropertyResolver {
    resolveRunProperties(
        run: Element,
        paragraph: Element,
        style: Style | null,
        defaults: Properties
    ): RunProperties;
}

class DocxPropertyResolver implements PropertyResolver {
    resolveRunProperties(run, paragraph, style, defaults) {
        // 1. Start with defaults
        let props = { ...defaults };
        
        // 2. Apply style properties
        if (style?.runProperties) {
            props = this.mergeProperties(props, style.runProperties);
        }
        
        // 3. Apply paragraph run properties
        const pPr = paragraph.getElementsByTagName('w:pPr')[0];
        const pRPr = pPr?.getElementsByTagName('w:rPr')[0];
        if (pRPr) {
            props = this.mergeProperties(props, this.parseRunProps(pRPr));
        }
        
        // 4. Apply direct run properties
        const rPr = run.getElementsByTagName('w:rPr')[0];
        if (rPr) {
            props = this.mergeProperties(props, this.parseRunProps(rPr));
        }
        
        return props;
    }
    
    private mergeProperties(base: Properties, override: Properties): Properties {
        const merged = { ...base };
        
        for (const [key, value] of Object.entries(override)) {
            if (this.isToggleProperty(key)) {
                // XOR logic for toggle properties
                merged[key] = base[key] ? !value : value;
            } else {
                merged[key] = value;
            }
        }
        
        return merged;
    }
}
```

### 4. Field Code Parsing

```typescript
interface FieldParser {
    parseField(runs: Element[]): Field | null;
}

class DocxFieldParser implements FieldParser {
    parseField(runs: Element[]): Field | null {
        let state: 'scanning' | 'instruction' | 'result' = 'scanning';
        let instruction = '';
        const resultRuns: Element[] = [];
        
        for (const run of runs) {
            const fldChar = run.querySelector('w\\:fldChar');
            
            if (fldChar) {
                const type = fldChar.getAttribute('w:fldCharType');
                
                switch (type) {
                    case 'begin':
                        state = 'instruction';
                        instruction = '';
                        break;
                    case 'separate':
                        state = 'result';
                        break;
                    case 'end':
                        if (instruction) {
                            return this.parseInstruction(instruction, resultRuns);
                        }
                        state = 'scanning';
                        break;
                }
            } else if (state === 'instruction') {
                const instrText = run.querySelector('w\\:instrText');
                if (instrText) {
                    instruction += instrText.textContent;
                }
            } else if (state === 'result') {
                resultRuns.push(run);
            }
        }
        
        return null;
    }
}
```

### 5. Table Layout
For detailed browser-specific challenges and solutions related to table rendering, refer to [Browser-Specific Challenges for DOCX Rendering - Table Rendering Challenges](../browser-challenges.md#table-rendering-challenges).

```typescript
class TableLayoutEngine {
    calculateColumnWidths(table: Table, availableWidth: number): number[] {
        const gridCols = table.grid;
        const totalGridWidth = gridCols.reduce((sum, col) => sum + col, 0);
        
        // Check for fixed table width
        if (table.properties.width?.type === 'dxa') {
            availableWidth = table.properties.width.value;
        } else if (table.properties.width?.type === 'pct') {
            availableWidth = availableWidth * table.properties.width.value / 5000;
        }
        
        // Calculate column widths
        const columnWidths = gridCols.map(gridWidth => {
            return (gridWidth / totalGridWidth) * availableWidth;
        });
        
        // Apply cell width overrides
        for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
            const row = table.rows[rowIndex];
            let colIndex = 0;
            
            for (const cell of row.cells) {
                if (cell.properties.width?.type === 'dxa') {
                    columnWidths[colIndex] = cell.properties.width.value;
                }
                colIndex += cell.properties.gridSpan || 1;
            }
        }
        
        return columnWidths;
    }
}
```

## Common Patterns

### 1. Namespace-Aware XML Parsing

```typescript
function getElementsByTagNameNS(element: Element, namespace: string, localName: string): Element[] {
    // Handle both namespace-aware and non-namespace-aware documents
    const elements = element.getElementsByTagNameNS(namespace, localName);
    if (elements.length > 0) return Array.from(elements);
    
    // Fallback to prefix-based selection
    return Array.from(element.getElementsByTagName(`w:${localName}`));
}
```

### 2. Safe Attribute Access

```typescript
function getIntAttribute(element: Element, name: string, defaultValue: number = 0): number {
    const value = element.getAttribute(`w:${name}`);
    if (!value) return defaultValue;
    
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
```

### 3. Unit Conversion

```typescript
class UnitConverter {
    static twipsToPixels(twips: number, dpi: number = 96): number {
        return Math.round(twips * dpi / 1440);
    }
    
    static emuToPixels(emu: number, dpi: number = 96): number {
        return Math.round(emu * dpi / 914400);
    }
    
    static pointsToPixels(points: number, dpi: number = 96): number {
        return Math.round(points * dpi / 72);
    }
}
```

## Performance Optimization

### 1. Lazy Loading

```typescript
class LazyDocumentLoader {
    private cache = new Map<string, Promise<any>>();
    
    async loadStyles(): Promise<Styles> {
        return this.loadCached('styles', async () => {
            const doc = await this.archive.getXml('word/styles.xml');
            return this.parseStyles(doc);
        });
    }
    
    private async loadCached<T>(key: string, loader: () => Promise<T>): Promise<T> {
        if (!this.cache.has(key)) {
            this.cache.set(key, loader());
        }
        return this.cache.get(key) as Promise<T>;
    }
}
```

### 2. Property Caching

```typescript
class PropertyCache {
    private cache = new Map<string, Properties>();
    
    getOrCompute(key: string, compute: () => Properties): Properties {
        if (!this.cache.has(key)) {
            this.cache.set(key, compute());
        }
        return this.cache.get(key)!;
    }
}
```

### 3. Batch Processing

```typescript
class BatchRenderer {
    private queue: RenderTask[] = [];
    
    addTask(task: RenderTask) {
        this.queue.push(task);
        
        if (this.queue.length >= 100) {
            this.flush();
        }
    }
    
    flush() {
        const tasks = this.queue.splice(0);
        requestIdleCallback(() => {
            this.processBatch(tasks);
        });
    }
}
```

## Error Handling

### 1. Graceful Degradation

```typescript
class SafeParser {
    parseRun(element: Element): Run {
        try {
            return {
                text: this.getText(element),
                properties: this.getRunProperties(element)
            };
        } catch (error) {
            console.warn('Failed to parse run:', error);
            return {
                text: element.textContent || '',
                properties: {}
            };
        }
    }
}
```

### 2. Validation

```typescript
class DocumentValidator {
    validate(doc: ParsedDocument): ValidationResult {
        const errors: ValidationError[] = [];
        
        // Check relationships
        for (const rel of doc.relationships) {
            if (!doc.parts.has(rel.target)) {
                errors.push({
                    type: 'missing-relationship',
                    message: `Missing target: ${rel.target}`
                });
            }
        }
        
        // Check table structure
        for (const table of doc.tables) {
            const expectedCells = table.grid.length;
            for (const row of table.rows) {
                const actualCells = row.cells.reduce(
                    (sum, cell) => sum + (cell.gridSpan || 1), 
                    0
                );
                if (actualCells !== expectedCells) {
                    errors.push({
                        type: 'table-structure',
                        message: 'Cell count mismatch'
                    });
                }
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
}
```

## Testing Strategy

### 1. Create Test Documents

```typescript
describe('DOCX Parser', () => {
    it('should parse simple paragraph', async () => {
        const docx = await createTestDocument(`
            <w:p>
                <w:r>
                    <w:t>Hello World</w:t>
                </w:r>
            </w:p>
        `);
        
        const result = await parser.parse(docx);
        expect(result.elements[0].type).toBe('paragraph');
        expect(result.elements[0].runs[0].text).toBe('Hello World');
    });
});
```

### 2. Edge Case Testing

```typescript
const edgeCases = [
    'empty-document.docx',
    'no-styles.docx',
    'corrupt-relationships.docx',
    'nested-fields.docx',
    'complex-tables.docx',
    'mixed-scripts.docx'
];

for (const file of edgeCases) {
    it(`should handle ${file}`, async () => {
        const docx = await loadTestFile(file);
        expect(() => parser.parse(docx)).not.toThrow();
    });
}
```

## Common Gotchas

1. **XML Namespaces**: Different Word versions use different namespace prefixes
2. **Optional Files**: Not all DOCX files contain all possible parts
3. **Circular References**: Styles can reference each other circularly
4. **Memory Leaks**: Large documents need careful memory management
5. **Toggle Properties**: Remember XOR logic for bold, italic, etc.
6. **Unit Confusion**: Different properties use different units
7. **Field Updates**: Cached field values may be outdated
8. **Character Encoding**: Ensure proper UTF-8 handling

## Implementation Checklist

1. Start with basic text extraction
2. Add style support incrementally
3. Implement table parsing
4. Add image support
5. Handle fields and dynamic content
6. Optimize performance
7. Add error recovery
8. Implement layout engine