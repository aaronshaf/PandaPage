# Official OOXML Schema Reference

## Overview

This document synthesizes key information from the official ISO/IEC 29500-1:2016 OOXML schemas to provide accurate implementation guidance.

## Core Document Structure

### Document Elements

From `wml.xsd`, the core document structure follows this hierarchy:

```xml
<w:document>
  <w:body>
    <!-- Block-level content -->
    <w:p>           <!-- Paragraph (CT_P) -->
      <w:pPr/>      <!-- Paragraph properties (CT_PPr) -->
      <w:r>         <!-- Run (CT_R) -->
        <w:rPr/>    <!-- Run properties (CT_RPr) -->
        <w:t/>      <!-- Text (CT_Text) -->
      </w:r>
    </w:p>
    <w:tbl>         <!-- Table (CT_Tbl) -->
      <w:tblPr/>    <!-- Table properties -->
      <w:tblGrid/>  <!-- Table grid definition -->
      <w:tr>        <!-- Table row (CT_Row) -->
        <w:tc>      <!-- Table cell -->
          <!-- Cell content: paragraphs -->
        </w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>
```

### Text Content

The `CT_Text` type is simple but important:

```xml
<xsd:complexType name="CT_Text">
  <xsd:simpleContent>
    <xsd:extension base="s:ST_String">
      <xsd:attribute ref="xml:space" use="optional"/>
    </xsd:extension>
  </xsd:simpleContent>
</xsd:complexType>
```

**Key points:**
- Text content is a string with optional `xml:space` attribute
- `xml:space="preserve"` indicates whitespace should be preserved
- Default behavior collapses multiple spaces

## Run Properties (Formatting)

### Official Run Properties (EG_RPrBase)

From the schema, these are the complete set of base run properties:

```xml
<w:rStyle/>         <!-- Run style reference -->
<w:rFonts/>         <!-- Font family definitions -->
<w:b/>              <!-- Bold -->
<w:bCs/>            <!-- Bold complex script -->
<w:i/>              <!-- Italic -->
<w:iCs/>            <!-- Italic complex script -->
<w:caps/>           <!-- All capitals -->
<w:smallCaps/>      <!-- Small capitals -->
<w:strike/>         <!-- Strikethrough -->
<w:dstrike/>        <!-- Double strikethrough -->
<w:outline/>        <!-- Outline -->
<w:shadow/>         <!-- Shadow -->
<w:emboss/>         <!-- Emboss -->
<w:imprint/>        <!-- Imprint -->
<w:noProof/>        <!-- No spell/grammar check -->
<w:snapToGrid/>     <!-- Snap to document grid -->
<w:vanish/>         <!-- Hidden text -->
<w:webHidden/>      <!-- Hidden in web view -->
<w:color/>          <!-- Text color -->
<w:spacing/>        <!-- Character spacing in twips -->
<w:w/>              <!-- Text scale percentage -->
<w:kern/>           <!-- Kerning point size threshold -->
<w:position/>       <!-- Text position (raised/lowered) -->
<w:sz/>             <!-- Font size in half-points -->
<w:szCs/>           <!-- Complex script font size -->
<w:highlight/>      <!-- Highlight color -->
<w:u/>              <!-- Underline -->
<w:effect/>         <!-- Text effects -->
<w:bdr/>            <!-- Text border -->
<w:shd/>            <!-- Text shading -->
<w:fitText/>        <!-- Fit text in specified width -->
<w:vertAlign/>      <!-- Vertical alignment (superscript/subscript) -->
<w:rtl/>            <!-- Right-to-left text -->
<w:cs/>             <!-- Complex script text -->
<w:em/>             <!-- East Asian emphasis -->
<w:lang/>           <!-- Language -->
<w:eastAsianLayout/> <!-- East Asian typography -->
<w:specVanish/>     <!-- Special hidden text -->
<w:oMath/>          <!-- Office Math -->
```

### Typography Units

**Font Size**: `sz` and `szCs` use half-points
- Value of 24 = 12 points
- Value of 28 = 14 points

**Character Spacing**: `spacing` uses signed twips
- Positive values expand spacing
- Negative values condense spacing
- 20 twips = 1 point spacing adjustment

**Position**: `position` uses signed half-points
- Positive values raise text
- Negative values lower text

## Measurement Units

### Universal Measures (ST_UniversalMeasure)

The official pattern supports these units:
```
-?[0-9]+(\.[0-9]+)?(mm|cm|in|pt|pc|pi)
```

**Supported units:**
- `mm` - Millimeters
- `cm` - Centimeters  
- `in` - Inches
- `pt` - Points (1/72 inch)
- `pc` - Picas (12 points)
- `pi` - Picas (alternative notation)

### Twips (ST_TwipsMeasure)

Twips are the fundamental unit in OOXML:
- **1 inch = 1440 twips**
- **1 point = 20 twips**
- **1 centimeter = 567 twips**

Can be either:
- Raw unsigned integer (twips)
- Universal measure string with units

### Drawing Coordinates (EMUs)

DrawingML uses **English Metric Units (EMUs)**:
- **1 inch = 914,400 EMUs**
- **1 centimeter = 360,000 EMUs**  
- **1 point = 12,700 EMUs**
- **1 twip = 635 EMUs**

Valid range: -27,273,042,329,600 to 27,273,042,316,900 EMUs

## Boolean Properties (ST_OnOff)

OOXML boolean properties use `ST_OnOff` type:

```xml
<xsd:simpleType name="ST_OnOff">
  <xsd:union memberTypes="xsd:boolean"/>
</xsd:simpleType>
```

**Valid values:**
- `true`, `false` (boolean)
- `1`, `0` (numeric)
- `on`, `off` (string)
- Empty element = true (e.g., `<w:b/>`)

## Graphics and Drawing

### Inline vs Anchored Graphics

OOXML supports two graphic positioning modes:

#### Inline Graphics (CT_Inline)
```xml
<w:drawing>
  <wp:inline>
    <wp:extent cx="..." cy="..."/> <!-- Size in EMUs -->
    <wp:docPr id="..." name="..."/> <!-- Properties -->
    <a:graphic>                     <!-- Graphic content -->
      <!-- Drawing content -->
    </a:graphic>
  </wp:inline>
</w:drawing>
```

- Flows with text like a character
- No text wrapping options
- Size specified in EMUs

#### Anchored Graphics (CT_Anchor)
```xml
<w:drawing>
  <wp:anchor>
    <wp:simplePos x="0" y="0"/>        <!-- Fallback position -->
    <wp:positionH relativeFrom="...">   <!-- Horizontal position -->
      <wp:posOffset>...</wp:posOffset>
    </wp:positionH>
    <wp:positionV relativeFrom="...">   <!-- Vertical position -->
      <wp:posOffset>...</wp:posOffset>
    </wp:positionV>
    <wp:extent cx="..." cy="..."/>     <!-- Size -->
    <wp:wrapSquare wrapText="..."/>    <!-- Text wrapping -->
    <a:graphic>                        <!-- Graphic content -->
      <!-- Drawing content -->
    </a:graphic>
  </wp:anchor>
</w:drawing>
```

### Text Wrapping Types

From `dml-wordprocessingDrawing.xsd`:

- **wrapNone**: No text wrapping (graphic overlays text)
- **wrapSquare**: Text wraps around rectangular boundary
- **wrapTight**: Text wraps tightly around object shape
- **wrapThrough**: Text flows through transparent areas
- **wrapTopAndBottom**: Text only above and below object

**Wrap text directions:**
- `bothSides` - Text on both sides
- `left` - Text on left side only
- `right` - Text on right side only  
- `largest` - Text on the side with more space

## Table Structure

### Complete Table Hierarchy

```xml
<w:tbl>
  <w:tblPr>                    <!-- Table properties -->
    <w:tblStyle w:val="..."/>  <!-- Table style -->
    <w:tblW w:w="..." w:type="..."/> <!-- Table width -->
    <w:jc w:val="..."/>        <!-- Table justification -->
    <w:tblBorders>             <!-- Table borders -->
      <w:top w:val="..." w:sz="..." w:color="..."/>
      <w:left w:val="..." w:sz="..." w:color="..."/>
      <w:bottom w:val="..." w:sz="..." w:color="..."/>
      <w:right w:val="..." w:sz="..." w:color="..."/>
      <w:insideH w:val="..." w:sz="..." w:color="..."/>
      <w:insideV w:val="..." w:sz="..." w:color="..."/>
    </w:tblBorders>
    <w:tblLook firstRow="1" lastRow="0" firstColumn="1" lastColumn="0" 
               noHBand="0" noVBand="1"/>
  </w:tblPr>
  
  <w:tblGrid>                  <!-- Column definitions -->
    <w:gridCol w:w="..."/>     <!-- Column width in twips -->
    <w:gridCol w:w="..."/>
  </w:tblGrid>
  
  <w:tr>                       <!-- Table row -->
    <w:trPr>                   <!-- Row properties -->
      <w:trHeight w:val="..." w:hRule="..."/>
      <w:tblHeader/>           <!-- Repeat as header row -->
      <w:cantSplit/>           <!-- Don't break row across pages -->
    </w:trPr>
    
    <w:tc>                     <!-- Table cell -->
      <w:tcPr>                 <!-- Cell properties -->
        <w:tcW w:w="..." w:type="..."/>  <!-- Cell width -->
        <w:gridSpan w:val="..."/>        <!-- Horizontal span -->
        <w:vMerge w:val="restart"/>      <!-- Vertical merge start -->
        <w:vAlign w:val="..."/>          <!-- Vertical alignment -->
        <w:tcBorders>                    <!-- Cell borders -->
          <!-- Border definitions -->
        </w:tcBorders>
        <w:shd w:val="..." w:color="..." w:fill="..."/> <!-- Cell shading -->
      </w:tcPr>
      
      <!-- Cell content: paragraphs -->
      <w:p>...</w:p>
    </w:tc>
  </w:tr>
</w:tbl>
```

### Table Layout Properties

**Table width types:**
- `auto` - Automatic width based on content
- `dxa` - Fixed width in twips
- `pct` - Percentage of container width

**Row height rules:**
- `auto` - Automatic height based on content
- `atLeast` - Minimum height, can grow
- `exact` - Fixed height, content clipped if necessary

## Default Values

### DrawingML Text Margins (EMUs)

From the schema defaults in `CT_TextBodyProperties`:
- **Left margin**: 91,440 EMUs (0.1 inch)
- **Right margin**: 91,440 EMUs (0.1 inch)
- **Top margin**: 45,720 EMUs (0.05 inch)
- **Bottom margin**: 45,720 EMUs (0.05 inch)

### Document Defaults

Common default values from the schemas:
- **Font size**: 22 half-points (11pt) when not specified
- **Line spacing**: Single (240 twips)
- **Paragraph spacing**: 0 before, 10pt after
- **Text direction**: Left-to-right (`ltr`)
- **Vertical alignment**: Baseline

## Implementation Guidelines

### Unit Conversion Functions

```typescript
// Essential unit conversions
const TWIPS_PER_INCH = 1440;
const TWIPS_PER_POINT = 20;
const EMUS_PER_INCH = 914400;
const EMUS_PER_TWIP = 635;

function twipsToPoints(twips: number): number {
  return twips / TWIPS_PER_POINT;
}

function halfPointsToPoints(halfPoints: number): number {
  return halfPoints / 2;
}

function emusToTwips(emus: number): number {
  return Math.round(emus / EMUS_PER_TWIP);
}

function parseUniversalMeasure(value: string): number {
  const match = value.match(/^(-?[0-9]+(?:\.[0-9]+)?)(mm|cm|in|pt|pc|pi)$/);
  if (!match) return 0;
  
  const [, numStr, unit] = match;
  const num = parseFloat(numStr);
  
  switch (unit) {
    case 'in': return num * TWIPS_PER_INCH;
    case 'pt': return num * TWIPS_PER_POINT;
    case 'pc': return num * 12 * TWIPS_PER_POINT; // 1 pica = 12 points
    case 'mm': return num * TWIPS_PER_INCH / 25.4;
    case 'cm': return num * TWIPS_PER_INCH / 2.54;
    default: return 0;
  }
}
```

### Property Resolution

```typescript
// Boolean property handling
function parseOnOff(element: Element, attrName: string): boolean {
  const attr = element.getAttribute(`w:${attrName}`);
  if (!attr) return true; // Empty element = true
  
  switch (attr.toLowerCase()) {
    case 'true': case '1': case 'on': return true;
    case 'false': case '0': case 'off': return false;
    default: return true;
  }
}

// Font size parsing (half-points to points)
function parseFontSize(element: Element): number | undefined {
  const sz = element.querySelector('w\\:sz')?.getAttribute('w:val');
  return sz ? parseInt(sz) / 2 : undefined;
}
```

## Schema Validation Points

### Critical Elements

1. **Text preservation**: Always honor `xml:space="preserve"`
2. **Unit handling**: Support both raw numbers and universal measures
3. **Boolean consistency**: Handle all OnOff value formats
4. **Font size**: Remember half-point encoding
5. **Drawing coordinates**: Convert EMUs properly
6. **Table grid**: Column widths must match grid definitions
7. **Vertical merge**: Track merge state across rows

### Common Validation Errors

- Ignoring complex script properties (`bCs`, `iCs`, `szCs`)
- Not handling universal measure units in coordinates
- Incorrect boolean property interpretation
- Missing font size conversion (half-points to points)
- Improper table grid column width calculation
- EMU coordinate overflow/underflow

This reference provides the official schema foundation for accurate DOCX parsing and rendering.