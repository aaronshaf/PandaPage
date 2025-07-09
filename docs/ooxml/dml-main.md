# dml-main.xsd

The `dml-main.xsd` schema is the core and most comprehensive schema within DrawingML (Drawing Markup Language) in Office Open XML (OOXML) documents. It defines the fundamental building blocks for all graphical objects, including shapes, text, images, and their properties, that can be used across various Office applications (Word, Excel, PowerPoint).

## Purpose

This schema serves as the foundational layer for DrawingML, providing:
*   **Basic Drawing Primitives:** Definitions for geometric shapes, lines, and fills.
*   **Styling and Formatting:** Comprehensive properties for colors, gradients, patterns, and effects.
*   **Text Formatting:** Detailed control over text appearance within shapes and text boxes.
*   **Transformations:** Mechanisms for positioning, scaling, rotating, and skewing objects.
*   **Non-Visual Properties:** Metadata and locking attributes for drawing objects.
*   **Extensibility:** Support for custom extensions.

## Key Elements and Concepts

### Colors and Color Transformations

Defines various color models (RGB, HSL, System, Scheme, Preset) and a rich set of color transformation effects (tint, shade, alpha, hue, saturation, luminance, red, green, blue, gamma).

*   `CT_ScRgbColor`, `CT_SRgbColor`, `CT_HslColor`, `CT_SystemColor`, `CT_SchemeColor`, `CT_PresetColor`
*   `EG_ColorTransform` (group of color adjustment elements)

### Transformations (2D and 3D)

Provides complex types for defining 2D and 3D transformations of objects, including position, size, rotation, and flipping.

*   `CT_Transform2D`, `CT_GroupTransform2D`
*   `CT_Point2D`, `CT_PositiveSize2D`
*   `CT_Point3D`, `CT_Vector3D`, `CT_SphereCoords`
*   `CT_Camera`, `CT_LightRig`, `CT_Scene3D` (for 3D scenes)

### Fills and Lines

Defines various fill types (solid, gradient, blip/picture, pattern, group) and properties for lines (width, cap, join, dash, fill).

*   `EG_FillProperties` (group for fill types)
*   `CT_NoFillProperties`, `CT_SolidColorFillProperties`, `CT_GradientFillProperties`, `CT_BlipFillProperties`, `CT_PatternFillProperties`, `CT_GroupFillProperties`
*   `CT_LineProperties`

### Effects

A wide range of visual effects that can be applied to shapes and text, including shadows, reflections, glows, blurs, and color adjustments.

*   `EG_EffectProperties` (group for various effects)
*   `CT_EffectList` (container for multiple effects)
*   `CT_BlurEffect`, `CT_GlowEffect`, `CT_InnerShadowEffect`, `CT_OuterShadowEffect`, `CT_ReflectionEffect`, `CT_SoftEdgesEffect`

### Text Properties

Extensive types for defining text content, formatting, and layout within shapes and text boxes.

*   `CT_TextBody`: The main container for text content.
*   `CT_TextParagraph`: Defines a paragraph of text.
*   `CT_TextRun`: Defines a run of text with specific formatting.
*   `CT_TextCharacterProperties`: Character-level formatting (font, size, color, bold, italic).
*   `CT_TextParagraphProperties`: Paragraph-level formatting (alignment, indentation, spacing).

### Drawing Objects (Non-Visual and Visual Properties)

Defines the non-visual (metadata, locking) and visual (appearance) properties for various drawing objects.

*   `CT_NonVisualDrawingProps`: Common non-visual properties (ID, name, description).
*   `CT_ShapeProperties`: General visual properties for shapes.
*   `CT_Shape`, `CT_Connector`, `CT_Picture`, `CT_GraphicalObjectFrame`, `CT_GroupShape` (and their `Gvml` counterparts for richer properties).

### Graphical Objects

*   `CT_GraphicalObject`: A generic container for graphical data, allowing embedding of content from other DrawingML schemas (like charts or diagrams).
*   `graphic`: The root element for a graphical object.

## Imported Schemas

This schema imports several other DrawingML and shared OOXML schemas to build its comprehensive set of definitions:
*   `shared-relationshipReference.xsd`
*   `shared-commonSimpleTypes.xsd`
*   `dml-diagram.xsd`
*   `dml-chart.xsd`
*   `dml-picture.xsd`
*   `dml-lockedCanvas.xsd`

## Role in OOXML

`dml-main.xsd` is fundamental to the visual representation of content across WordprocessingML (DOCX), SpreadsheetML (XLSX), and PresentationML (PPTX). Any graphical element, from a simple shape to a complex chart, ultimately relies on the definitions provided in this schema for its rendering and behavior.
