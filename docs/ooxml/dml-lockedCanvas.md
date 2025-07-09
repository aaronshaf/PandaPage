# dml-lockedCanvas.xsd

The `dml-lockedCanvas.xsd` schema defines the concept of a "locked canvas" within Office Open XML (OOXML) documents. This schema is notably simple, primarily serving to define a single element that leverages existing DrawingML capabilities.

## Purpose

This schema is used to:
*   Define a container for drawing objects that are "locked" in some manner, implying that their position, size, or content might be restricted or protected from direct manipulation by the user in an application.

## Key Elements and Concepts

### `lockedCanvas` Element

The core of this schema is the `lockedCanvas` element.
*   **Type:** `a:CT_GvmlGroupShape` (from `dml-main.xsd`)
*   **Description:** This means that a `lockedCanvas` is essentially a specialized group shape. It can contain other drawing objects (shapes, pictures, graphic frames, etc.) and apply group-level properties to them. The "locked" aspect is implied by its usage and potentially by application-specific interpretations, rather than explicit attributes within this schema itself.

## Imported Schemas

This schema imports definitions from `dml-main.xsd`, specifically relying on the `a:CT_GvmlGroupShape` complex type. This indicates that the functionality and properties of a locked canvas are largely inherited from the general DrawingML group shape capabilities.

## Example Usage (Conceptual)

A `lockedCanvas` element would typically contain a collection of DrawingML objects that are intended to be treated as a single, potentially uneditable, unit within the document.

```xml
<lc:lockedCanvas xmlns:lc="http://purl.oclc.org/ooxml/drawingml/lockedCanvas" xmlns:a="http://purl.oclc.org/ooxml/drawingml/main">
  <a:nvGrpSpPr>
    <a:cNvPr id="1" name="Locked Canvas Group"/>
    <a:cNvGrpSpPr/>
  </a:nvGrpSpPr>
  <a:grpSpPr>
    <!-- Group shape properties -->
  </a:grpSpPr>
  <a:sp>
    <!-- A shape within the locked canvas -->
  </a:sp>
  <a:pic>
    <!-- A picture within the locked canvas -->
  </a:pic>
</lc:lockedCanvas>
```
