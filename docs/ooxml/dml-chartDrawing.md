# dml-chartDrawing.xsd

The `dml-chartDrawing.xsd` schema defines the drawing objects that can be embedded within charts in Office Open XML (OOXML) documents. This includes shapes, connectors, pictures, and graphic frames, allowing for rich visual elements within charts.

## Purpose

This schema is used to:
*   Define non-visual properties for various drawing objects (shapes, connectors, pictures, graphic frames).
*   Specify visual properties (e.g., fill, line, effects) for these drawing objects.
*   Enable the embedding of text within shapes.
*   Support grouping of drawing objects.
*   Define anchoring mechanisms for positioning drawing objects within a chart.

## Key Elements and Concepts

### Drawing Objects

The schema defines complex types for different drawing objects:
*   `CT_Shape`: Represents a general shape, which can contain text.
*   `CT_Connector`: Represents a connector line between two points.
*   `CT_Picture`: Represents an embedded image.
*   `CT_GraphicFrame`: Represents a container for external graphic content (e.g., a chart itself, or other embedded objects).
*   `CT_GroupShape`: Allows for grouping multiple drawing objects together.

### Non-Visual Properties

Each drawing object has a corresponding non-visual property type (e.g., `CT_ShapeNonVisual`, `CT_ConnectorNonVisual`). These types define properties that are not directly rendered but provide essential information, such as:
*   `cNvPr` (Non-Visual Drawing Properties): Common properties like ID, name, and description.
*   `cNvSpPr` (Non-Visual Drawing Shape Properties): Shape-specific non-visual properties.

### Visual Properties

Visual properties for drawing objects are typically defined using types from `dml-main.xsd`:
*   `a:CT_ShapeProperties` (`spPr`): Defines fill, line, effects, and 3D properties.
*   `a:CT_ShapeStyle` (`style`): References a predefined shape style.
*   `a:CT_TextBody` (`txBody`): Defines text content and formatting within shapes.

### Anchoring

The schema defines how drawing objects are positioned:
*   `CT_RelSizeAnchor`: Positions an object relative to a bounding box defined by two markers.
*   `CT_AbsSizeAnchor`: Positions an object at an absolute size and location.
*   `CT_Marker`: Defines a coordinate point (x, y) within the drawing space.

### Root Element

*   `CT_Drawing`: The root element for a collection of drawing objects within a chart.

## Imported Schemas

This schema imports definitions from `dml-main.xsd` for core DrawingML types, which are extensively used for defining the properties and appearance of the drawing objects.

## Example Usage (Conceptual)

A typical chart structure in an OOXML document would involve a `CT_Drawing` element containing one or more anchored or relative-sized drawing objects (`sp`, `cxnSp`, `pic`, `graphicFrame`, `grpSp`). For instance, a chart might embed a custom shape (`sp`) with text (`txBody`) as an annotation, or a picture (`pic`) as a background.

```xml
<cdr:drawing xmlns:cdr="http://purl.oclc.org/ooxml/drawingml/chartDrawing" xmlns:a="http://purl.oclc.org/ooxml/drawingml/main">
  <cdr:absSizeAnchor>
    <cdr:from>
      <cdr:x>0.1</cdr:x>
      <cdr:y>0.1</cdr:y>
    </cdr:from>
    <a:ext cx="914400" cy="914400"/> <!-- 1 inch x 1 inch -->
    <cdr:sp>
      <cdr:nvSpPr>
        <a:cNvPr id="1" name="Shape 1"/>
        <a:cNvSpPr/>
      </cdr:nvSpPr>
      <a:spPr>
        <a:solidFill>
          <a:srgbClr val="FF0000"/>
        </a:solidFill>
      </a:spPr>
      <a:txBody>
        <a:bodyPr/>
        <a:lstStyle/>
        <a:p>
          <a:r>
            <a:t>Chart Annotation</a:t>
          </a:r>
        </a:p>
      </a:txBody>
    </cdr:sp>
  </cdr:absSizeAnchor>
</cdr:drawing>
```
