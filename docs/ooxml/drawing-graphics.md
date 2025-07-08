# OOXML Drawing and Graphics (DrawingML)

## Overview

DrawingML (Drawing Markup Language) is the shared graphics system across all OOXML formats (DOCX, XLSX, PPTX). It provides a comprehensive framework for shapes, images, charts, and effects using precise coordinate systems. In DOCX, graphics are embedded through WordprocessingML drawing elements with two primary positioning modes.

## DrawingML Coordinate System

### EMU Units (English Metric Units)

**Schema Definition:** DrawingML uses EMUs as defined by `ST_Coordinate` and `ST_PositiveCoordinate` in `dml-main.xsd`:

**Coordinate Ranges:**
- **ST_CoordinateUnqualified**: -27,273,042,329,600 to 27,273,042,316,900 EMUs
- **ST_PositiveCoordinate**: 0 to 27,273,042,316,900 EMUs

**Core Constants:**
- **1 inch = 914,400 EMUs**
- **1 point = 12,700 EMUs** 
- **1 centimeter = 360,000 EMUs**
- **1 twip = 635 EMUs**

### Schema-Defined Coordinate Elements

#### CT_Point2D - Position Coordinates
```xml
<a:off x="1143000" y="1143000"/>  <!-- 1.25" x 1.25" offset in EMUs -->
```

#### CT_PositiveSize2D - Object Dimensions  
```xml
<a:ext cx="2286000" cy="1714500"/>  <!-- 2.5" x 1.875" size in EMUs -->
```

#### CT_Transform2D - Complete Transform
```xml
<a:xfrm rot="0" flipH="false" flipV="false">
  <a:off x="1143000" y="1143000"/>    <!-- Position (CT_Point2D) -->
  <a:ext cx="2286000" cy="1714500"/>  <!-- Size (CT_PositiveSize2D) -->
</a:xfrm>
```

## Two Positioning Modes

### Inline Graphics (wp:inline)

Inline graphics flow with the text like characters:

```xml
<w:r>
  <w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0">
      <wp:extent cx="2743200" cy="1828800"/> <!-- 3" x 2" in EMUs -->
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      <wp:docPr id="1" name="Picture 1"/>
      <wp:cNvGraphicFramePr>
        <a:graphicFrameLocks xmlns:a="..." noChangeAspect="1"/>
      </wp:cNvGraphicFramePr>
      <a:graphic xmlns:a="...">
        <a:graphicData uri="http://purl.oclc.org/ooxml/drawingml/picture">
          <pic:pic xmlns:pic="...">
            <!-- Picture content -->
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing>
</w:r>
```

**Characteristics:**
- Flows with text baseline
- Cannot have text wrapping
- Affects line height
- Simple to implement
- Uses EMU coordinates for size

### Anchored Graphics (wp:anchor)

Anchored graphics are positioned absolutely with text wrapping:

```xml
<w:r>
  <w:drawing>
    <wp:anchor distT="114300" distB="114300" distL="114300" distR="114300" 
               simplePos="0" relativeHeight="251658240" behindDoc="0" 
               locked="0" layoutInCell="1" allowOverlap="1">
      <wp:simplePos x="0" y="0"/>
      
      <!-- Horizontal positioning -->
      <wp:positionH relativeFrom="column">
        <wp:posOffset>1143000</wp:posOffset> <!-- 1.25" from column -->
      </wp:positionH>
      
      <!-- Vertical positioning -->
      <wp:positionV relativeFrom="paragraph">
        <wp:posOffset>571500</wp:posOffset>  <!-- 0.625" from paragraph -->
      </wp:positionV>
      
      <wp:extent cx="2743200" cy="1828800"/>   <!-- Size: 3" x 2" -->
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      
      <!-- Text wrapping -->
      <wp:wrapSquare wrapText="bothSides" distT="114300" distB="114300" 
                     distL="114300" distR="114300">
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
      </wp:wrapSquare>
      
      <wp:docPr id="2" name="Picture 2"/>
      <a:graphic>
        <!-- Graphic content -->
      </a:graphic>
    </wp:anchor>
  </w:drawing>
</w:r>
```

**Characteristics:**
- Absolute positioning
- Complex text wrapping options
- Layering (z-order) support
- Can be behind or in front of text
- More complex to implement

## Positioning Reference Points

### Horizontal Positioning (relativeFrom)

From the schema, valid `relativeFrom` values for horizontal positioning:

- **`character`** - Relative to character position
- **`column`** - Relative to column edge
- **`insideMargin`** - Relative to inside margin (for two-sided documents)
- **`leftMargin`** - Relative to left margin
- **`margin`** - Relative to page margin
- **`outsideMargin`** - Relative to outside margin
- **`page`** - Relative to page edge
- **`rightMargin`** - Relative to right margin

### Vertical Positioning (relativeFrom)

Valid values for vertical positioning:

- **`bottomMargin`** - Relative to bottom margin
- **`insideMargin`** - Relative to inside margin
- **`line`** - Relative to line
- **`margin`** - Relative to page margin
- **`outsideMargin`** - Relative to outside margin
- **`page`** - Relative to page edge
- **`paragraph`** - Relative to paragraph
- **`topMargin`** - Relative to top margin

### Position Types

Positions can be specified as:

1. **Offset** (absolute):
```xml
<wp:positionH relativeFrom="page">
  <wp:posOffset>1143000</wp:posOffset> <!-- 1.25" in EMUs -->
</wp:positionH>
```

2. **Alignment** (relative):
```xml
<wp:positionH relativeFrom="margin">
  <wp:align>center</wp:align>
</wp:positionH>
```

Valid alignment values: `left`, `right`, `center`, `inside`, `outside`

## Text Wrapping Types

### 1. No Wrapping (wrapNone)

```xml
<wp:wrapNone/>
```
- Text flows behind or in front of object
- No text displacement
- Controlled by `behindDoc` attribute

### 2. Square Wrapping (wrapSquare)

```xml
<wp:wrapSquare wrapText="bothSides" distT="114300" distB="114300" 
               distL="114300" distR="114300">
  <wp:effectExtent l="0" t="0" r="0" b="0"/>
</wp:wrapSquare>
```

**Wrap text options:**
- `bothSides` - Text on both sides
- `left` - Text on left side only
- `right` - Text on right side only  
- `largest` - Text on the side with more space

**Distance attributes (EMUs):**
- `distT` - Distance from top
- `distB` - Distance from bottom
- `distL` - Distance from left
- `distR` - Distance from right

### 3. Tight Wrapping (wrapTight)

```xml
<wp:wrapTight wrapText="bothSides" distL="114300" distR="114300">
  <wp:wrapPolygon edited="0">
    <wp:start x="21600" y="0"/>
    <wp:lineTo x="0" y="0"/>
    <wp:lineTo x="0" y="21600"/>
    <wp:lineTo x="21600" y="21600"/>
  </wp:wrapPolygon>
</wp:wrapTight>
```

- Text wraps around a defined polygon
- More complex shape-aware wrapping
- Polygon coordinates in shape coordinate space

### 4. Through Wrapping (wrapThrough)

```xml
<wp:wrapThrough wrapText="bothSides" distL="114300" distR="114300">
  <wp:wrapPolygon edited="0">
    <!-- Polygon definition with holes -->
  </wp:wrapPolygon>
</wp:wrapThrough>
```

- Text flows through transparent areas
- Similar to tight but with interior wrapping

### 5. Top and Bottom Wrapping (wrapTopAndBottom)

```xml
<wp:wrapTopAndBottom distT="114300" distB="114300">
  <wp:effectExtent l="0" t="0" r="0" b="0"/>
</wp:wrapTopAndBottom>
```

- Text only above and below object
- No text on sides

## Coordinate Systems

### EMU Coordinates

All DrawingML positioning uses EMUs (English Metric Units):

```typescript
const EMUS_PER_INCH = 914400;
const EMUS_PER_CM = 360000;
const EMUS_PER_POINT = 12700;

// Convert to EMUs
function inchesToEmus(inches: number): number {
  return Math.round(inches * EMUS_PER_INCH);
}

function pointsToEmus(points: number): number {
  return Math.round(points * EMUS_PER_POINT);
}

// Convert from EMUs
function emusToInches(emus: number): number {
  return emus / EMUS_PER_INCH;
}

function emusToPoints(emus: number): number {
  return emus / EMUS_PER_POINT;
}
```

### Size Constraints

From the schema, valid EMU coordinate ranges:
- **Minimum**: -27,273,042,329,600 EMUs (~-29,852 inches)
- **Maximum**: 27,273,042,316,900 EMUs (~29,852 inches)

### Default Distances

Common default values from the schema:
- **Text distance**: 114,300 EMUs (0.125 inches = 9 points)
- **Margin defaults**: 91,440 EMUs (0.1 inches = 7.2 points)

## Picture Content Structure

### Complete Picture Structure

```xml
<a:graphic>
  <a:graphicData uri="http://purl.oclc.org/ooxml/drawingml/picture">
    <pic:pic>
      <pic:nvPicPr>
        <pic:cNvPr id="0" name="Picture Name"/>
        <pic:cNvPicPr>
          <a:picLocks noChangeAspect="1"/>
        </pic:cNvPicPr>
      </pic:nvPicPr>
      
      <pic:blipFill>
        <a:blip r:embed="rId4" cstate="print">
          <a:extLst>
            <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
              <a14:useLocalDpi xmlns:a14="..." val="0"/>
            </a:ext>
          </a:extLst>
        </a:blip>
        <a:stretch>
          <a:fillRect/>
        </a:stretch>
      </pic:blipFill>
      
      <pic:spPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="2743200" cy="1828800"/>
        </a:xfrm>
        <a:prstGeom prst="rect">
          <a:avLst/>
        </a:prstGeom>
      </pic:spPr>
    </pic:pic>
  </a:graphicData>
</a:graphic>
```

**Key components:**
- `pic:cNvPr` - Non-visual properties (ID, name)
- `pic:blipFill` - Image fill with relationship reference
- `pic:spPr` - Shape properties (transform, geometry)

### Image Relationships

Images reference binary data through relationships:

```xml
<!-- In document.xml -->
<a:blip r:embed="rId4"/>

<!-- In word/_rels/document.xml.rels -->
<Relationship Id="rId4" 
              Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
              Target="media/image1.png"/>
```

## Implementation Strategy

### 1. Basic Inline Images

Start with inline images as they're simpler:

```typescript
interface InlineDrawing {
  width: number;    // EMUs
  height: number;   // EMUs
  imageData: ArrayBuffer;
  mimeType: string;
  name?: string;
  description?: string;
}

function parseInlineDrawing(element: Element): InlineDrawing | null {
  const inline = element.querySelector('wp\\:inline');
  if (!inline) return null;
  
  const extent = inline.querySelector('wp\\:extent');
  const width = parseInt(extent?.getAttribute('cx') || '0');
  const height = parseInt(extent?.getAttribute('cy') || '0');
  
  // Find image relationship
  const blip = inline.querySelector('a\\:blip');
  const relationshipId = blip?.getAttribute('r:embed');
  
  return {
    width,
    height,
    imageData: await getImageData(relationshipId),
    mimeType: getMimeType(relationshipId),
    name: getImageName(inline),
    description: getImageDescription(inline)
  };
}
```

### 2. Add Anchored Positioning

```typescript
interface AnchoredDrawing extends InlineDrawing {
  positioning: {
    horizontal: {
      relativeTo: string;
      offset?: number;
      align?: string;
    };
    vertical: {
      relativeTo: string;
      offset?: number;
      align?: string;
    };
  };
  wrapping: {
    type: 'none' | 'square' | 'tight' | 'through' | 'topBottom';
    side?: 'both' | 'left' | 'right' | 'largest';
    distances: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  zOrder: number;
  behindText: boolean;
}

function parseAnchoredDrawing(element: Element): AnchoredDrawing | null {
  const anchor = element.querySelector('wp\\:anchor');
  if (!anchor) return null;
  
  // Parse base inline properties
  const baseDrawing = parseInlineProperties(anchor);
  
  // Parse positioning
  const posH = anchor.querySelector('wp\\:positionH');
  const posV = anchor.querySelector('wp\\:positionV');
  
  return {
    ...baseDrawing,
    positioning: {
      horizontal: parsePositioning(posH),
      vertical: parsePositioning(posV)
    },
    wrapping: parseWrapping(anchor),
    zOrder: parseInt(anchor.getAttribute('relativeHeight') || '0'),
    behindText: anchor.getAttribute('behindDoc') === '1'
  };
}
```

### 3. Text Wrapping Implementation

```typescript
class TextWrapper {
  wrapAroundRectangle(
    element: HTMLElement,
    rect: { x: number; y: number; width: number; height: number },
    distances: { top: number; bottom: number; left: number; right: number },
    side: 'both' | 'left' | 'right' | 'largest'
  ): void {
    // Calculate exclusion area
    const exclusion = {
      left: rect.x - distances.left,
      top: rect.y - distances.top,
      right: rect.x + rect.width + distances.right,
      bottom: rect.y + rect.height + distances.bottom
    };
    
    // Apply CSS shape-outside for modern browsers
    if ('shapeOutside' in element.style) {
      const path = this.createExclusionPath(exclusion, side);
      element.style.shapeOutside = path;
      element.style.shapeMargin = '0px';
    } else {
      // Fallback: modify text layout manually
      this.applyFallbackWrapping(element, exclusion, side);
    }
  }
  
  private createExclusionPath(exclusion: any, side: string): string {
    switch (side) {
      case 'left':
        return `polygon(0 0, ${exclusion.left}px 0, ${exclusion.left}px 100%, 0 100%)`;
      case 'right':
        return `polygon(${exclusion.right}px 0, 100% 0, 100% 100%, ${exclusion.right}px 100%)`;
      default:
        return `polygon(0 0, ${exclusion.left}px 0, ${exclusion.left}px ${exclusion.top}px, ${exclusion.right}px ${exclusion.top}px, ${exclusion.right}px ${exclusion.bottom}px, ${exclusion.left}px ${exclusion.bottom}px, ${exclusion.left}px 100%, 0 100%)`;
    }
  }
}
```

## Best Practices

### 1. Progressive Enhancement

```typescript
class DrawingRenderer {
  render(drawing: InlineDrawing | AnchoredDrawing): HTMLElement {
    // Always support inline mode first
    const img = this.createImageElement(drawing);
    
    if ('positioning' in drawing) {
      // Enhanced: add positioning and wrapping
      return this.enhanceWithPositioning(img, drawing);
    }
    
    return img;
  }
}
```

### 2. Fallback Strategies

```typescript
function renderWithFallback(drawing: AnchoredDrawing): HTMLElement {
  if (supportsAdvancedPositioning()) {
    return renderAbsolutePositioned(drawing);
  } else if (supportsBasicFloating()) {
    return renderFloated(drawing);
  } else {
    // Fallback to inline
    return renderInline(drawing);
  }
}
```

### 3. Performance Optimization

```typescript
class ImageCache {
  private cache = new Map<string, Promise<ImageData>>();
  
  async getImage(relationshipId: string): Promise<ImageData> {
    if (!this.cache.has(relationshipId)) {
      this.cache.set(relationshipId, this.loadImage(relationshipId));
    }
    return this.cache.get(relationshipId)!;
  }
  
  private async loadImage(relationshipId: string): Promise<ImageData> {
    // Load and cache image data
    const buffer = await this.getImageBuffer(relationshipId);
    return this.decodeImage(buffer);
  }
}
```

This foundation enables progressive implementation of DOCX graphics, starting with basic inline images and building up to complex anchored positioning with text wrapping.