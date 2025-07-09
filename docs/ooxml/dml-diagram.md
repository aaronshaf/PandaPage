# dml-diagram.xsd

The `dml-diagram.xsd` schema defines the structure and elements for SmartArt diagrams within Office Open XML (OOXML) documents. SmartArt diagrams provide a rich and flexible way to visually represent information, such as organizational charts, process flows, and relationship diagrams.

## Purpose

This schema is used to:
*   Define the data model for a SmartArt diagram, including its nodes (points) and connections.
*   Specify the layout algorithms and rules that govern how the diagram is rendered.
*   Control the visual appearance of diagram elements, including colors, fills, lines, and effects.
*   Support various diagram types and their specific properties.
*   Enable extensibility for custom diagram layouts and styles.

## Key Elements and Concepts

### Data Model

*   **`dataModel` (CT_DataModel):** The core of a SmartArt diagram's data. It contains:
    *   `ptLst` (CT_PtList): A list of `pt` (points), representing the nodes in the diagram.
    *   `cxnLst` (CT_CxnList): A list of `cxn` (connections), representing the relationships between nodes.
*   **`pt` (CT_Pt):** Represents a node (point) in the diagram. It has a `modelId` and can contain shape properties (`spPr`) and text (`t`).
*   **`cxn` (CT_Cxn):** Represents a connection between two nodes, with `srcId` and `destId` attributes.

### Layout Definitions

*   **`layoutDef` (CT_DiagramDefinition):** Defines a specific SmartArt layout. It includes:
    *   `title`, `desc`: Title and description of the layout.
    *   `catLst`: Categories the layout belongs to.
    *   `layoutNode` (CT_LayoutNode): The root of the layout algorithm, which can contain other layout nodes, shapes, and algorithms.
*   **`alg` (CT_Algorithm):** Defines a layout algorithm (e.g., composite, cycle, hierarchy, linear, pyramid).
*   **`constrLst` (CT_Constraints):** A list of constraints that guide the layout (e.g., alignment, spacing).
*   **`ruleLst` (CT_Rules):** A list of numeric rules for layout.
*   **`forEach` (CT_ForEach):** Allows iterating over data points to apply layout rules.
*   **`choose` (CT_Choose):** Provides conditional logic for applying different layout rules.

### Style Definitions

*   **`styleDef` (CT_StyleDefinition):** Defines a SmartArt style, including color transformations, 3D scenes, and text properties.
*   **`styleLbl` (CT_StyleLabel):** Defines specific style labels within a style definition, allowing for variations in appearance.
*   **`colorsDef` (CT_ColorTransform):** Defines color transformations for the diagram.

### Headers and Lists

*   **`layoutDefHdr` (CT_DiagramDefinitionHeader):** Header information for a layout definition.
*   **`layoutDefHdrLst` (CT_DiagramDefinitionHeaderLst):** A list of layout definition headers.
*   **`colorsDefHdr` (CT_ColorTransformHeader):** Header information for a color transform.
*   **`colorsDefHdrLst` (CT_ColorTransformHeaderLst):** A list of color transform headers.
*   **`styleDefHdr` (CT_StyleDefinitionHeader):** Header information for a style definition.
*   **`styleDefHdrLst` (CT_StyleDefinitionHeaderLst):** A list of style definition headers.

## Imported Schemas

This schema imports definitions from:
*   `shared-relationshipReference.xsd`: For relationships.
*   `dml-main.xsd`: For core DrawingML types like shape properties, text bodies, and extension lists.
*   `shared-commonSimpleTypes.xsd`: For common simple types.

## Example Usage (Conceptual)

A SmartArt diagram in an OOXML document would typically reference a layout definition and a style definition. The `dataModel` would contain the actual content of the diagram.

```xml
<dgm:diagramDataModel xmlns:dgm="http://purl.oclc.org/ooxml/drawingml/diagram">
  <dgm:ptLst>
    <dgm:pt modelId="1" type="node">
      <dgm:prSet>
        <dgm:presLayoutVars>
          <dgm:dir val="norm"/>
        </dgm:presLayoutVars>
      </dgm:prSet>
      <a:t>Node 1</a:t>
    </dgm:pt>
    <dgm:pt modelId="2" type="node">
      <a:t>Node 2</a:t>
    </dgm:pt>
  </dgm:ptLst>
  <dgm:cxnLst>
    <dgm:cxn modelId="3" type="parOf" srcId="1" destId="2"/>
  </dgm:cxnLst>
</dgm:diagramDataModel>
```
