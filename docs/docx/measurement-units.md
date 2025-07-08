# DOCX Measurement Units and Coordinates

## Overview

OOXML uses multiple coordinate systems and units depending on the context. Understanding these is crucial for accurate document rendering.

## Core Unit Systems

### 1. Twips (Word Processing)

**Twips** are the fundamental unit in WordprocessingML:
- **1 inch = 1,440 twips**
- **1 point = 20 twips**
- **1 centimeter ≈ 567 twips**

Used for:
- Paragraph margins and indentation
- Table dimensions
- Font sizes (as half-points)
- Page margins and dimensions
- Character spacing

```typescript
const TWIPS_PER_INCH = 1440;
const TWIPS_PER_POINT = 20;
const TWIPS_PER_CM = 567; // Approximate

// Convert measurements to twips
function inchesToTwips(inches: number): number {
  return Math.round(inches * TWIPS_PER_INCH);
}

function pointsToTwips(points: number): number {
  return Math.round(points * TWIPS_PER_POINT);
}
```

### 2. EMUs (Drawing)

**English Metric Units (EMUs)** are used in DrawingML:
- **1 inch = 914,400 EMUs**
- **1 centimeter = 360,000 EMUs**
- **1 point = 12,700 EMUs**
- **1 twip = 635 EMUs**

Used for:
- Image dimensions and positioning
- Shape coordinates
- Drawing object measurements
- Graphic positioning

```typescript
const EMUS_PER_INCH = 914400;
const EMUS_PER_CM = 360000;
const EMUS_PER_POINT = 12700;
const EMUS_PER_TWIP = 635;

// Convert to EMUs
function twipsToEmus(twips: number): number {
  return Math.round(twips * EMUS_PER_TWIP);
}

function pointsToEmus(points: number): number {
  return Math.round(points * EMUS_PER_POINT);
}
```

### 3. Half-Points (Typography)

Font sizes use **half-points** for precision:
- Value of 24 = 12 points
- Value of 22 = 11 points (default)
- Value of 28 = 14 points

```typescript
function parseHalfPointSize(value: string): number {
  const halfPoints = parseInt(value);
  return halfPoints / 2; // Convert to actual points
}

// Examples from DOCX
// <w:sz w:val="24"/>   = 12pt
// <w:sz w:val="32"/>   = 16pt
// <w:szCs w:val="28"/> = 14pt (complex script)
```

## Universal Measures

### ST_UniversalMeasure Pattern

OOXML supports unit suffixes in many contexts:

```
Pattern: -?[0-9]+(\.[0-9]+)?(mm|cm|in|pt|pc|pi)
```

**Supported units:**
- `mm` - Millimeters
- `cm` - Centimeters
- `in` - Inches
- `pt` - Points (1/72 inch)
- `pc` - Picas (12 points)
- `pi` - Picas (alternative notation)

### Universal Measure Parser

```typescript
function parseUniversalMeasure(value: string | number, targetUnit: 'twips' | 'emus' = 'twips'): number {
  // Handle raw numbers (already in base unit)
  if (typeof value === 'number') {
    return value;
  }
  
  // Parse string with units
  const match = value.match(/^(-?[0-9]+(?:\.[0-9]+)?)(mm|cm|in|pt|pc|pi)$/);
  if (!match) {
    // Fallback: try parsing as raw number
    return parseInt(value) || 0;
  }
  
  const [, numStr, unit] = match;
  const num = parseFloat(numStr);
  
  // Convert to target unit
  if (targetUnit === 'twips') {
    switch (unit) {
      case 'in': return Math.round(num * 1440);
      case 'pt': return Math.round(num * 20);
      case 'pc': case 'pi': return Math.round(num * 240); // 12pt = 240 twips
      case 'mm': return Math.round(num * 56.7);
      case 'cm': return Math.round(num * 567);
      default: return 0;
    }
  } else if (targetUnit === 'emus') {
    switch (unit) {
      case 'in': return Math.round(num * 914400);
      case 'pt': return Math.round(num * 12700);
      case 'pc': case 'pi': return Math.round(num * 152400); // 12pt = 152400 EMUs
      case 'mm': return Math.round(num * 36000);
      case 'cm': return Math.round(num * 360000);
      default: return 0;
    }
  }
  
  return 0;
}

// Usage examples
const margin = parseUniversalMeasure("1in");        // 1440 twips
const spacing = parseUniversalMeasure("6pt");       // 120 twips
const width = parseUniversalMeasure("2.5cm");       // 1417 twips
const imageWidth = parseUniversalMeasure("3in", "emus"); // 2743200 EMUs
```

## Coordinate Systems

### Page Coordinates

Page measurements in section properties:

```xml
<w:sectPr>
  <w:pgSz w:w="12240" w:h="15840"/>    <!-- 8.5" x 11" in twips -->
  <w:pgMar w:top="1440" w:right="1440" 
           w:bottom="1440" w:left="1440"/> <!-- 1" margins -->
</w:sectPr>
```

### Drawing Coordinates

Drawing objects use EMU coordinates:

```xml
<wp:anchor>
  <wp:positionH relativeFrom="page">
    <wp:posOffset>914400</wp:posOffset>  <!-- 1 inch from page edge -->
  </wp:positionH>
  <wp:extent cx="2743200" cy="1828800"/> <!-- 3" x 2" -->
</wp:anchor>
```

### Table Measurements

Tables mix twips and percentages:

```xml
<w:tblW w:w="5000" w:type="pct"/>      <!-- 50% width -->
<w:tblW w:w="4320" w:type="dxa"/>      <!-- 3 inches (4320 twips) -->
<w:gridCol w:w="2160"/>                <!-- 1.5 inch column -->
```

## Measurement Contexts

### Font and Typography
- **Font size**: Half-points (`w:sz`, `w:szCs`)
- **Character spacing**: Twips (`w:spacing`)
- **Kerning threshold**: Half-points (`w:kern`)
- **Text position**: Half-points (`w:position`)

### Paragraph Layout
- **Indentation**: Twips (`w:left`, `w:right`, `w:firstLine`)
- **Spacing**: Twips (`w:before`, `w:after`)
- **Line spacing**: 240ths of a line (`w:line`)

### Tables
- **Table width**: Twips or percentage (`w:tblW`)
- **Column width**: Twips (`w:gridCol`)
- **Cell margins**: Twips (`w:tblCellMar`)
- **Row height**: Twips (`w:trHeight`)

### Images and Drawing
- **Position**: EMUs (`wp:posOffset`)
- **Size**: EMUs (`wp:extent`)
- **Margins**: EMUs (`wp:distT`, `wp:distB`, etc.)

### Borders and Shading
- **Border width**: Eighths of a point (`w:sz`)
- **Shadow offset**: Twips

## Conversion Utilities

### Complete Conversion Suite

```typescript
class UnitConverter {
  // Twips conversions
  static twipsToInches(twips: number): number {
    return twips / 1440;
  }
  
  static twipsToPoints(twips: number): number {
    return twips / 20;
  }
  
  static twipsToCentimeters(twips: number): number {
    return twips / 567;
  }
  
  // EMU conversions  
  static emusToInches(emus: number): number {
    return emus / 914400;
  }
  
  static emusToPoints(emus: number): number {
    return emus / 12700;
  }
  
  static emusToCentimeters(emus: number): number {
    return emus / 360000;
  }
  
  // Cross-unit conversions
  static twipsToEmus(twips: number): number {
    return Math.round(twips * 635);
  }
  
  static emusToTwips(emus: number): number {
    return Math.round(emus / 635);
  }
  
  // Font size helpers
  static halfPointsToPoints(halfPoints: number): number {
    return halfPoints / 2;
  }
  
  static pointsToHalfPoints(points: number): number {
    return points * 2;
  }
  
  // CSS output helpers
  static twipsToCss(twips: number): string {
    return `${this.twipsToPoints(twips)}pt`;
  }
  
  static emusToCss(emus: number): string {
    return `${this.emusToPoints(emus)}pt`;
  }
}
```

### Measurement Type Detection

```typescript
function detectMeasurementType(value: string): 'twips' | 'emus' | 'halfpoints' | 'universal' {
  // Check for unit suffix
  if (/[a-z]+$/.test(value)) {
    return 'universal';
  }
  
  const num = parseInt(value);
  
  // Heuristic detection based on typical ranges
  if (num >= 100000) {
    return 'emus';        // Large numbers usually EMUs
  } else if (num <= 100) {
    return 'halfpoints';  // Small numbers often font sizes
  } else {
    return 'twips';       // Mid-range numbers usually twips
  }
}
```

## Best Practices

### 1. Always Specify Target Units

```typescript
// ✅ Good - explicit unit handling
const marginTwips = parseUniversalMeasure(value, 'twips');
const imageSizeEmus = parseUniversalMeasure(value, 'emus');

// ❌ Bad - ambiguous units
const measurement = parseInt(value); // What unit is this?
```

### 2. Use Type-Safe Wrappers

```typescript
type Twips = number & { readonly __brand: 'twips' };
type EMUs = number & { readonly __brand: 'emus' };
type Points = number & { readonly __brand: 'points' };

function createTwips(value: number): Twips {
  return value as Twips;
}

function convertToCSS(twips: Twips): string {
  return `${twips / 20}pt`;
}
```

### 3. Handle Edge Cases

```typescript
function safeMeasurementParse(value: string | undefined, defaultTwips: number = 0): number {
  if (!value) return defaultTwips;
  
  try {
    return parseUniversalMeasure(value, 'twips');
  } catch (error) {
    console.warn(`Invalid measurement value: ${value}, using default: ${defaultTwips}`);
    return defaultTwips;
  }
}
```

### 4. Validate Ranges

```typescript
function validateCoordinate(value: number, unit: 'twips' | 'emus'): number {
  if (unit === 'emus') {
    // EMU valid range from schema
    const min = -27273042329600;
    const max = 27273042316900;
    return Math.max(min, Math.min(max, value));
  } else {
    // Reasonable twips range (approximately ±19 inches)
    const min = -27360;
    const max = 27360;
    return Math.max(min, Math.min(max, value));
  }
}
```

## Common Measurement Values

### Standard Page Sizes (Twips)

```typescript
const PAGE_SIZES = {
  letter: { width: 12240, height: 15840 },    // 8.5" x 11"
  a4: { width: 11907, height: 16839 },        // 210mm x 297mm
  legal: { width: 12240, height: 20160 },     // 8.5" x 14"
  tabloid: { width: 15840, height: 24480 },   // 11" x 17"
};
```

### Default Margins (Twips)

```typescript
const DEFAULT_MARGINS = {
  normal: 1440,      // 1 inch
  narrow: 720,       // 0.5 inch
  moderate: 1080,    // 0.75 inch
  wide: 2160,        // 1.5 inch
};
```

### Typography Defaults

```typescript
const TYPOGRAPHY_DEFAULTS = {
  fontSize: 22,           // 11pt (half-points)
  lineSpacing: 240,       // Single spacing (240ths)
  paragraphSpacing: 200,  // 10pt after (twips)
  tabStop: 720,          // 0.5 inch default tabs
};
```

This measurement system forms the foundation for accurate DOCX document layout and rendering.