# dml-wordprocessingDrawing.xsd

The `dml-wordprocessingDrawing.xsd` schema defines how drawing objects (such as shapes, pictures, and graphic frames) are integrated and positioned within WordprocessingML (DOCX) documents. It provides mechanisms for both inline and floating (anchored) positioning, along with text wrapping options.

## Purpose

This schema is used to:
*   Specify the layout and positioning of drawing objects within the flow of text or relative to the page/margins.
*   Define how text wraps around drawing objects.
*   Support the embedding of various graphical elements, including those defined in `dml-main.xsd` and `dml-picture.xsd`.
*   Enable advanced features like text boxes and linked text boxes within shapes.

## Key Elements and Concepts

### Anchoring Mechanisms

WordprocessingML supports two primary ways to position drawing objects:

1.  **`inline` (CT_Inline):**
    *   **Description:** An inline drawing object behaves like a character within the text flow. Its position is determined by the surrounding text.
    *   **Elements:**
        *   `extent`: Defines the size of the drawing object.
        *   `effectExtent`: Specifies the bounding box for effects (e.g., shadows, reflections).
        *   `docPr`: Non-visual drawing properties (ID, name, description).
        *   `cNvGraphicFramePr`: Non-visual graphic frame properties.
        *   `graphic`: The actual graphical content (e.g., a shape, picture, or chart).
    *   **Attributes:** `distT`, `distB`, `distL`, `distR` (distances from text).

2.  **`anchor` (CT_Anchor):**
    *   **Description:** An anchored drawing object "floats" on the page, positioned relative to the page, margins, or a specific paragraph. Text can wrap around it.
    *   **Elements:**
        *   `simplePos`: A simple position for fallback.
        *   `positionH`: Horizontal positioning relative to page, margin, column, or character.
        *   `positionV`: Vertical positioning relative to page, margin, paragraph, or line.
        *   `extent`: Size of the drawing object.
        *   `effectExtent`: Bounding box for effects.
        *   `EG_WrapType`: Defines how text wraps around the object (see below).
        *   `docPr`: Non-visual drawing properties.
        *   `cNvGraphicFramePr`: Non-visual graphic frame properties.
        *   `graphic`: The actual graphical content.
    *   **Attributes:** `distT`, `distB`, `distL`, `distR` (distances from text), `simplePos`, `relativeHeight`, `behindDoc`, `locked`, `layoutInCell`, `hidden`, `allowOverlap`.

### Text Wrapping

The `EG_WrapType` group defines various text wrapping styles for anchored objects:
*   **`wrapNone` (CT_WrapNone):** No text wrapping; the object overlays the text.
*   **`wrapSquare` (CT_WrapSquare):** Text wraps around a rectangular bounding box.
*   **`wrapTight` (CT_WrapTight):** Text wraps tightly around the object's actual shape (defined by a polygon).
*   **`wrapThrough` (CT_WrapThrough):** Text flows through transparent areas of the object.
*   **`wrapTopAndBottom` (CT_WrapTopBottom):** Text appears only above and below the object.

The `ST_WrapText` simple type defines the direction of text wrapping (`bothSides`, `left`, `right`, `largest`).

### Shapes and Text Boxes

*   **`wsp` (CT_WordprocessingShape):** Represents a shape within a WordprocessingML document. It can contain a text box.
    *   `txbx` (CT_TextboxInfo): Defines a text box within the shape, containing WordprocessingML block-level elements (`w:EG_BlockLevelElts`).
    *   `linkedTxbx` (CT_LinkedTextboxInformation): For linked text boxes that flow content from one to another.
    *   `bodyPr`: Text body properties for the shape's text.

### Other Drawing Objects

*   **`graphicFrame` (CT_GraphicFrame):** A frame for a graphical object, often used to embed charts or other complex graphics.
*   **`wgp` (CT_WordprocessingGroup):** A group of WordprocessingML drawing objects.
*   **`wpc` (CT_WordprocessingCanvas):** A canvas for drawing objects, providing background and overall formatting.

## Imported Schemas

This schema imports definitions from:
*   `dml-main.xsd`: For core DrawingML types like non-visual drawing properties, shape properties, transformations, and graphical objects.
*   `wml.xsd`: For WordprocessingML block-level elements used within text boxes.
*   `dml-picture.xsd`: For picture-specific elements.
*   `shared-relationshipReference.xsd`: For relationship IDs.

## Example Usage (Conceptual)

### Inline Picture

```xml
<w:r>
  <w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0">
      <wp:extent cx="914400" cy="685800"/>
      <wp:docPr id="1" name="Picture 1"/>
      <a:graphic xmlns:a="http://purl.oclc.org/ooxml/drawingml/main">
        <a:graphicData uri="http://purl.oclc.org/ooxml/drawingml/picture">
          <pic:pic xmlns:pic="http://purl.oclc.org/ooxml/drawingml/picture">
            <pic:nvPicPr>
              <a:cNvPr id="0" name="Picture 1"/>
              <a:cNvPicPr/>
            </pic:nvPicPr>
            <pic:blipFill>
              <a:blip r:embed="rId1"/>
              <a:stretch>
                <a:fillRect/>
              </a:stretch>
            </pic:blipFill>
            <pic:spPr>
              <a:xfrm>
                <a:off x="0" y="0"/>
                <a:ext cx="914400" cy="685800"/>
              </a:xfrm>
              <a:prstGeom prst="rect">
                <a:avLst/>
              </a:prstGeom>
            </pic:spPr>
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing>
</w:r>
```

### Anchored Shape with Text Wrapping

```xml
<w:p>
  <w:r>
    <w:drawing>
      <wp:anchor relativeFromH="page" relativeFromV="paragraph" layoutInCell="1" allowOverlap="1" locked="0" behindDoc="0" simplePos="0">
        <wp:simplePos x="0" y="0"/>
        <wp:positionH relativeFrom="page">
          <wp:posOffset>1000000</wp:posOffset>
        </wp:positionH>
        <wp:positionV relativeFrom="paragraph">
          <wp:posOffset>500000</wp:posOffset>
        </wp:positionV>
        <wp:extent cx="1828800" cy="1371600"/>
        <wp:wrapSquare wrapText="bothSides" distT="0" distB="0" distL="114300" distR="114300"/>
        <wp:docPr id="2" name="Shape 1"/>
        <a:graphic xmlns:a="http://purl.oclc.org/ooxml/drawingml/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
            <wsp:wsp xmlns:wsp="http://purl.oclc.org/ooxml/drawingml/wordprocessingDrawing">
              <wsp:cNvPr id="0" name="Shape 1"/>
              <wsp:cNvSpPr/>
              <wsp:spPr>
                <a:xfrm>
                  <a:off x="0" y="0"/>
                  <a:ext cx="1828800" cy="1371600"/>
                </a:xfrm>
                <a:prstGeom prst="rect">
                  <a:avLst/>
                </a:prstGeom>
                <a:solidFill>
                  <a:srgbClr val="00B0F0"/>
                </a:solidFill>
              </wsp:spPr>
              <wsp:txbx>
                <w:txbxContent>
                  <w:p>
                    <w:r>
                      <w:t>This is text inside a shape.</w:t>
                    </w:r>
                  </w:p>
                </w:txbxContent>
              </wsp:txbx>
              <wsp:bodyPr/>
            </wsp:wsp>
          </a:graphicData>
        </a:graphic>
      </wp:anchor>
    </w:drawing>
  </w:r>
</w:p>
```