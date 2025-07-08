# Numbering and Lists in DOCX

## Overview

DOCX uses a complex three-tier system for list numbering that often causes silent failures when relationships aren't properly defined. Understanding this system is crucial for correct list rendering.

## Three-Tier Numbering System

### 1. Abstract Numbering Definitions

Abstract numbering definitions (`abstractNum`) define the list format templates:

```xml
<!-- numbering.xml -->
<w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    
    <!-- Level 0 (first level) -->
    <w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="decimal"/>      <!-- 1, 2, 3... -->
        <w:lvlText w:val="%1."/>         <!-- Format: "1." -->
        <w:lvlJc w:val="left"/>
        <w:pPr>
            <w:ind w:left="720" w:hanging="360"/>
        </w:pPr>
    </w:lvl>
    
    <!-- Level 1 (second level) -->
    <w:lvl w:ilvl="1">
        <w:start w:val="1"/>
        <w:numFmt w:val="lowerLetter"/>  <!-- a, b, c... -->
        <w:lvlText w:val="%2."/>         <!-- Format: "a." -->
        <w:lvlJc w:val="left"/>
        <w:pPr>
            <w:ind w:left="1440" w:hanging="360"/>
        </w:pPr>
    </w:lvl>
    
    <!-- Level 2 (third level) -->
    <w:lvl w:ilvl="2">
        <w:start w:val="1"/>
        <w:numFmt w:val="lowerRoman"/>   <!-- i, ii, iii... -->
        <w:lvlText w:val="%3."/>         <!-- Format: "i." -->
        <w:lvlJc w:val="right"/>
        <w:pPr>
            <w:ind w:left="2160" w:hanging="180"/>
        </w:pPr>
    </w:lvl>
</w:abstractNum>
```

### 2. Concrete Numbering Instances

Concrete instances (`num`) reference abstract definitions:

```xml
<w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
    
    <!-- Optional: Override specific levels -->
    <w:lvlOverride w:ilvl="0">
        <w:startOverride w:val="5"/>  <!-- Start at 5 instead of 1 -->
    </w:lvlOverride>
</w:num>
```

### 3. Paragraph References

Paragraphs reference numbering instances:

```xml
<w:p>
    <w:pPr>
        <w:numPr>
            <w:ilvl w:val="0"/>    <!-- Level (0-based) -->
            <w:numId w:val="1"/>   <!-- Reference to num instance -->
        </w:numPr>
    </w:pPr>
    <w:r>
        <w:t>First item</w:t>
    </w:r>
</w:p>
```

## Number Formats

### Common Format Types

| Format Value | Description | Example |
|--------------|-------------|---------|
| `decimal` | Arabic numerals | 1, 2, 3... |
| `upperRoman` | Uppercase Roman | I, II, III... |
| `lowerRoman` | Lowercase Roman | i, ii, iii... |
| `upperLetter` | Uppercase letters | A, B, C... |
| `lowerLetter` | Lowercase letters | a, b, c... |
| `ordinal` | Ordinal numbers | 1st, 2nd, 3rd... |
| `cardinalText` | Cardinal text | one, two, three... |
| `ordinalText` | Ordinal text | first, second, third... |
| `bullet` | Bullet character | •, ◦, ▪... |
| `none` | No numbering | |

### Level Text Formatting

The `lvlText` element uses placeholders:

```xml
<!-- Simple formats -->
<w:lvlText w:val="%1."/>        <!-- "1." -->
<w:lvlText w:val="%1)"/>        <!-- "1)" -->
<w:lvlText w:val="(%1)"/>       <!-- "(1)" -->

<!-- Multi-level formats -->
<w:lvlText w:val="%1.%2.%3"/>   <!-- "1.2.3" -->
<w:lvlText w:val="%1-%2-%3"/>   <!-- "1-a-i" -->

<!-- With static text -->
<w:lvlText w:val="Chapter %1:"/> <!-- "Chapter 1:" -->
<w:lvlText w:val="§ %1"/>       <!-- "§ 1" -->
```

## Numbering Implementation

### Parser Structure

```typescript
interface AbstractNum {
    id: string;
    levels: Map<number, Level>;
}

interface Level {
    start: number;
    format: NumberFormat;
    text: string;
    justification: 'left' | 'center' | 'right';
    indent: number;
    hanging: number;
    font?: string;
    suffix?: 'tab' | 'space' | 'nothing';
}

interface NumInstance {
    id: string;
    abstractNumId: string;
    overrides: Map<number, LevelOverride>;
}

class NumberingParser {
    private abstractNums = new Map<string, AbstractNum>();
    private numInstances = new Map<string, NumInstance>();
    
    parseNumberingXml(xml: Document): void {
        // Parse abstract numbering definitions
        const abstractNums = xml.getElementsByTagName('w:abstractNum');
        for (const abstractNum of abstractNums) {
            this.parseAbstractNum(abstractNum);
        }
        
        // Parse concrete instances
        const nums = xml.getElementsByTagName('w:num');
        for (const num of nums) {
            this.parseNumInstance(num);
        }
    }
}
```

### Numbering State Tracking

```typescript
class NumberingState {
    private counters = new Map<string, Map<number, number>>();
    private lastNumId: string | null = null;
    private lastLevel: number = -1;
    
    getNumber(numId: string, level: number, restart?: boolean): number {
        if (!this.counters.has(numId)) {
            this.counters.set(numId, new Map());
        }
        
        const numCounters = this.counters.get(numId)!;
        
        // Handle level changes
        if (numId === this.lastNumId) {
            if (level > this.lastLevel) {
                // Going deeper, continue counting
            } else if (level < this.lastLevel) {
                // Going up, reset deeper levels
                for (let l = level + 1; l <= 8; l++) {
                    numCounters.delete(l);
                }
            }
        } else {
            // Different list, reset all levels
            numCounters.clear();
        }
        
        // Get or initialize counter
        const current = numCounters.get(level) || 0;
        const next = restart ? 1 : current + 1;
        numCounters.set(level, next);
        
        this.lastNumId = numId;
        this.lastLevel = level;
        
        return next;
    }
}
```

### Number Formatting

```typescript
class NumberFormatter {
    format(value: number, format: string): string {
        switch (format) {
            case 'decimal':
                return value.toString();
                
            case 'upperRoman':
                return this.toRoman(value).toUpperCase();
                
            case 'lowerRoman':
                return this.toRoman(value).toLowerCase();
                
            case 'upperLetter':
                return this.toLetter(value).toUpperCase();
                
            case 'lowerLetter':
                return this.toLetter(value).toLowerCase();
                
            case 'ordinal':
                return this.toOrdinal(value);
                
            case 'bullet':
                return this.getBullet(value);
                
            default:
                return value.toString();
        }
    }
    
    private toRoman(num: number): string {
        const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
        
        let result = '';
        for (let i = 0; i < values.length; i++) {
            while (num >= values[i]) {
                result += symbols[i];
                num -= values[i];
            }
        }
        return result;
    }
    
    private toLetter(num: number): string {
        let result = '';
        while (num > 0) {
            num--;
            result = String.fromCharCode(97 + (num % 26)) + result;
            num = Math.floor(num / 26);
        }
        return result;
    }
}
```

### Level Text Resolution

```typescript
class LevelTextResolver {
    resolve(template: string, levels: Map<number, number>): string {
        // Replace placeholders with actual numbers
        return template.replace(/%(\d+)/g, (match, levelStr) => {
            const level = parseInt(levelStr) - 1; // 1-based to 0-based
            const value = levels.get(level) || 1;
            const format = this.getFormatForLevel(level);
            return this.formatter.format(value, format);
        });
    }
}
```

## Bullet Lists

### Bullet Characters

Common bullet characters and their Unicode values:

```typescript
const BULLET_CHARS = {
    'bullet': '\u2022',      // •
    'o': '\u25CB',          // ○
    'square': '\u25A0',     // ■
    'box': '\u25A1',        // □
    'arrow': '\u27A2',      // ➢
    'diamond': '\u25C6',    // ◆
    'dash': '\u2013',       // –
    'check': '\u2713',      // ✓
};
```

### Font-Specific Bullets

Some bullets require specific fonts:

```xml
<w:lvl w:ilvl="0">
    <w:numFmt w:val="bullet"/>
    <w:lvlText w:val=""/>  <!-- Wingdings character -->
    <w:rPr>
        <w:rFonts w:ascii="Wingdings" w:hAnsi="Wingdings"/>
    </w:rPr>
</w:lvl>
```

## Common Issues and Solutions

### 1. Silent Failures

Lists fail silently when:
- Abstract numbering definition is missing
- Concrete instance references invalid abstract ID
- Paragraph references invalid numbering ID

```typescript
class SafeNumberingResolver {
    getNumbering(numId: string, level: number): string {
        const instance = this.numInstances.get(numId);
        if (!instance) {
            console.warn(`Missing numbering instance: ${numId}`);
            return ''; // Silent failure - no number shown
        }
        
        const abstractNum = this.abstractNums.get(instance.abstractNumId);
        if (!abstractNum) {
            console.warn(`Missing abstract numbering: ${instance.abstractNumId}`);
            return '';
        }
        
        const levelDef = abstractNum.levels.get(level);
        if (!levelDef) {
            console.warn(`Missing level ${level} in abstract numbering`);
            return '';
        }
        
        return this.formatNumber(numId, level, levelDef);
    }
}
```

### 2. List Continuation

Handling list continuation across sections:

```typescript
class ListContinuation {
    private sectionBreaks = new Set<number>();
    
    handleParagraph(para: Paragraph, index: number): void {
        if (para.numbering) {
            const { numId, level } = para.numbering;
            
            // Check if this starts a new list
            const isNewList = this.isNewList(para, index);
            
            if (isNewList) {
                this.numberingState.reset(numId, level);
            }
            
            const number = this.numberingState.getNumber(numId, level);
            para.listNumber = this.formatNumber(number, level);
        }
    }
    
    private isNewList(para: Paragraph, index: number): boolean {
        // New list if:
        // 1. After a section break
        // 2. Different style than previous
        // 3. Explicit restart attribute
        return para.numbering.restart || 
               this.sectionBreaks.has(index - 1) ||
               this.styleChanged(para, index);
    }
}
```

### 3. Complex List Layouts

```typescript
class ListLayoutEngine {
    calculateIndentation(level: Level, listNumber: string): Indentation {
        const numberWidth = this.measureText(listNumber);
        
        return {
            // Total left indent
            left: level.indent,
            
            // First line indent (negative for hanging)
            firstLine: -level.hanging,
            
            // Tab stop after number
            tabStop: level.indent + level.hanging + numberWidth + 180 // 0.125"
        };
    }
}
```

## Style-Based Lists

Lists can be defined in styles:

```xml
<w:style w:type="numbering" w:styleId="ListNumber">
    <w:name w:val="List Number"/>
    <w:pPr>
        <w:numPr>
            <w:numId w:val="1"/>
        </w:numPr>
    </w:pPr>
</w:style>
```

## Best Practices

1. **Validate References**: Always check all three tiers exist
2. **Track State**: Maintain numbering state across the document
3. **Handle Restarts**: Support both explicit and implicit restarts
4. **Cache Definitions**: Parse numbering.xml once and cache
5. **Support Overrides**: Handle level overrides in concrete instances
6. **Test Edge Cases**: Multi-level lists, list style changes, section breaks

## Implementation Checklist

- [ ] Parse abstract numbering definitions
- [ ] Parse concrete numbering instances  
- [ ] Handle level overrides
- [ ] Track numbering state
- [ ] Format numbers correctly
- [ ] Calculate proper indentation
- [ ] Support all number formats
- [ ] Handle bullet characters
- [ ] Validate all references
- [ ] Support style-based lists
- [ ] Handle list continuation
- [ ] Test with real documents