# dml-picture.xsd

The `dml-picture.xsd` schema defines the structure for embedding and formatting pictures within Office Open XML (OOXML) documents, specifically within the DrawingML framework. It provides the necessary elements to describe both the non-visual properties (metadata) and visual properties (appearance, fill) of a picture.

## Purpose

This schema is used to:
*   Represent an embedded image (bitmap or vector graphic) within a document.
*   Define properties related to how the picture is displayed, including its fill and shape properties.
*   Link to the actual image data, which is typically stored as a relationship in the OOXML package.

## Key Elements and Concepts

### `pic` Element

The root element defined by this schema is `pic`, which is of type `CT_Picture`. This element encapsulates all the properties of a picture.

### `CT_Picture` Complex Type

The `CT_Picture` complex type contains three main child elements:

1.  **`nvPicPr` (Non-Visual Picture Properties):**
    *   Type: `CT_PictureNonVisual`
    *   Purpose: Defines the non-visual properties of the picture. This includes:
        *   `cNvPr` (from `a:CT_NonVisualDrawingProps`): Common non-visual properties like ID, name, and description.
        *   `cNvPicPr` (from `a:CT_NonVisualPictureProperties`): Picture-specific non-visual properties, such as locking mechanisms (e.g., `noCrop` to prevent cropping).

2.  **`blipFill` (Blip Fill Properties):**
    *   Type: `a:CT_BlipFillProperties` (from `dml-main.xsd`)
    *   Purpose: Specifies how the image data (the "blip") is used to fill the picture's bounding box. This includes:
        *   Reference to the actual image data (`blip` element with `r:embed` or `r:link`).
        *   Source rectangle (`srcRect`) for cropping.
        *   Fill modes like tiling or stretching.

3.  **`spPr` (Shape Properties):**
    *   Type: `a:CT_ShapeProperties` (from `dml-main.xsd`)
    *   Purpose: Defines the visual formatting of the picture's bounding shape. Although it's a picture, it can still have shape properties like borders, effects (shadows, reflections), and 3D properties applied to its frame.

## Imported Schemas

This schema imports definitions from `dml-main.xsd`, which provides the core DrawingML types used for:
*   Non-visual drawing properties (`a:CT_NonVisualDrawingProps`, `a:CT_NonVisualPictureProperties`).
*   Blip fill properties (`a:CT_BlipFillProperties`).
*   General shape properties (`a:CT_ShapeProperties`).

## Example Usage (Conceptual)

A typical picture element in an OOXML document would look like this:

```xml
<pic:pic xmlns:pic="http://purl.oclc.org/ooxml/drawingml/picture" xmlns:a="http://purl.oclc.org/ooxml/drawingml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships">
  <pic:nvPicPr>
    <a:cNvPr id="1" name="Image 1" descr="A sample image"/>
    <a:cNvPicPr noChangeAspect="1"/>
  </pic:nvPicPr>
  <pic:blipFill>
    <a:blip r:embed="rId1"/> <!-- rId1 links to the actual image data -->
    <a:stretch>
      <a:fillRect/>
    </a:stretch>
  </pic:blipFill>
  <pic:spPr>
    <a:xfrm>
      <a:off x="0" y="0"/>
      <a:ext cx="914400" cy="685800"/> <!-- 1 inch x 0.75 inch -->
    </a:xfrm>
    <a:prstGeom prst="rect">
      <a:avLst/>
    </a:prstGeom>
    <a:ln>
      <a:noFill/>
    </a:ln>
  </pic:spPr>
</pic:pic>
```
