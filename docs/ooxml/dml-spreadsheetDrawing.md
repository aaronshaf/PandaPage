# dml-spreadsheetDrawing.xsd

The `dml-spreadsheetDrawing.xsd` schema defines the drawing objects (shapes, pictures, charts, etc.) that can be embedded within a spreadsheet in Office Open XML (OOXML) documents. A key aspect of this schema is how these drawing objects are anchored to the spreadsheet grid.

## Purpose

This schema is used to:
*   Define various drawing objects that can appear on a spreadsheet.
*   Specify how these objects are positioned and sized relative to the spreadsheet's cells.
*   Control properties like whether the object moves or resizes with the cells it's anchored to.

## Key Elements and Concepts

### Drawing Objects

Similar to other DrawingML schemas, this schema defines complex types for common drawing objects, largely reusing definitions from `dml-main.xsd`:
*   `CT_Shape`: General shapes.
*   `CT_Connector`: Connectors between objects.
*   `CT_Picture`: Embedded images.
*   `CT_GraphicalObjectFrame`: Frames for graphical objects (e.g., charts).
*   `CT_GroupShape`: Groups of drawing objects.

### Anchoring Mechanisms

This schema introduces specific anchoring types for spreadsheets, which determine how a drawing object behaves when cells are resized, inserted, or deleted:

1.  **`CT_TwoCellAnchor` (Two-Cell Anchor):**
    *   Anchors an object to two cells (a "from" cell and a "to" cell).
    *   The object's position and size are relative to these two cells.
    *   `editAs` attribute: Controls how the object behaves when cells are edited (`twoCell`, `oneCell`, `absolute`).
    *   `CT_Marker`: Defines a cell reference (column, column offset, row, row offset) for the anchor points.

2.  **`CT_OneCellAnchor` (One-Cell Anchor):**
    *   Anchors an object to a single "from" cell.
    *   The object's top-left corner is fixed relative to this cell, but its size is absolute.

3.  **`CT_AbsoluteAnchor` (Absolute Anchor):**
    *   Positions an object at an absolute position on the sheet, independent of any cells.

### Client Data

*   `CT_AnchorClientData`: Contains attributes like `fLocksWithSheet` and `fPrintsWithSheet`, which control whether the object moves/resizes with the sheet and whether it's printed.

### Root Element

*   `wsDr` (Worksheet Drawing): The root element for all drawing objects on a spreadsheet. It contains a collection of anchors.

## Imported Schemas

This schema imports definitions from:
*   `dml-main.xsd`: For core DrawingML types like shape properties, non-visual drawing properties, and transformations.
*   `shared-relationshipReference.xsd`: For relationship IDs.

## Example Usage (Conceptual)

A spreadsheet drawing would typically contain one or more anchor elements, each defining a drawing object and its position on the sheet.

```xml
<xdr:wsDr xmlns:xdr="http://purl.oclc.org/ooxml/drawingml/spreadsheetDrawing" xmlns:a="http://purl.oclc.org/ooxml/drawingml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships">
  <xdr:twoCellAnchor editAs="oneCell">
    <xdr:from>
      <xdr:col>0</xdr:col>
      <xdr:colOff>0</xdr:colOff>
      <xdr:row>0</xdr:row>
      <xdr:rowOff>0</xdr:rowOff>
    </xdr:from>
    <xdr:to>
      <xdr:col>5</xdr:col>
      <xdr:colOff>0</xdr:colOff>
      <xdr:row>10</xdr:row>
      <xdr:rowOff>0</xdr:rowOff>
    </xdr:to>
    <xdr:pic>
      <xdr:nvPicPr>
        <a:cNvPr id="1" name="Picture 1"/>
        <a:cNvPicPr/>
      </xdr:nvPicPr>
      <xdr:blipFill>
        <a:blip r:embed="rId1"/>
        <a:stretch>
          <a:fillRect/>
        </a:stretch>
      </xdr:blipFill>
      <a:spPr/>
    </xdr:pic>
    <xdr:clientData fLocksWithSheet="1" fPrintsWithSheet="1"/>
  </xdr:twoCellAnchor>
</xdr:wsDr>
```
