# OOXML Diagrams (SmartArt)

Diagrams, also known as SmartArt, are complex graphical objects in OOXML that are used to represent processes, hierarchies, and other relationships. They have their own data model and are defined by multiple parts within the OOXML package.

## Core Diagram Structure

Unlike charts, the main DrawingML object for a diagram does not contain the data directly. Instead, it contains a `<dgm:relIds>` element that points to the various parts that make up the diagram.

**Example of `<a:graphicData>` for a diagram:**
```xml
<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/diagram">
  <dgm:relIds r:dm="rId1" r:lo="rId2" r:qs="rId3" r:cs="rId4" />
</a:graphicData>
```

### The `<dgm:relIds>` Element

This element uses relationship IDs to link to the four main parts of a diagram:

| Attribute | Description | Target Part |
| --- | --- | --- |
| `r:dm` | **Data Model.** The part that contains the actual data and text for the diagram. | `diagrams/dataX.xml` |
| `r:lo` | **Layout Definition.** The part that defines the layout and appearance of the diagram. | `diagrams/layoutX.xml` |
| `r:qs` | **Quick Style.** The part that defines the style of the diagram (e.g., 3D, inset). | `diagrams/styleX.xml` |
| `r:cs` | **Color Style.** The part that defines the color scheme for the diagram. | `diagrams/colorsX.xml` |

## The Data Part (`dataX.xml`)

The most important part for understanding the content of a diagram is the data part. It contains a `<dgm:dataModel>` element with a list of points (`<dgm:ptLst>`) and connections (`<dgm:cxnLst>`).

### Points (`<dgm:pt>`)

Each `<dgm:pt>` element represents a shape in the diagram that contains text.

| Attribute | Description |
| --- | --- |
| `modelId` | A unique ID for the point within the data model. |
| `type` | The type of point (e.g., `node`, `asst` for assistant). |

Inside each `<dgm:pt>` is a `<dgm:t>` element, which contains the text for that shape.

### Connections (`<dgm:cxn>`)

Each `<dgm:cxn>` element defines a connection between two points, forming the structure of the diagram.

| Attribute | Description |
| --- | --- |
| `srcId` | The `modelId` of the source point. |
| `destId` | The `modelId` of the destination point. |

## TypeScript Interfaces

Here are some simplified TypeScript interfaces for representing the diagram's data model.

```typescript
interface DiagramData {
  points: DiagramPoint[];
  connections: DiagramConnection[];
}

interface DiagramPoint {
  id: string; // modelId
  type: 'node' | 'asst' | string;
  text: string;
  shapeProperties?: ShapeProperties;
}

interface DiagramConnection {
  sourceId: string;
  destinationId: string;
  type: 'parOf' | string; // Parent of
}
```

## Example Data Model

Here is a simplified example of a `dataX.xml` file for a simple organization chart.

```xml
<dgm:dataModel>
  <dgm:ptLst>
    <!-- The root node -->
    <dgm:pt modelId="1" type="node">
      <dgm:t><a:p><a:r><a:t>CEO</a:t></a:r></a:p></dgm:t>
    </dgm:pt>
    <!-- A child node -->
    <dgm:pt modelId="2" type="node">
      <dgm:t><a:p><a:r><a:t>VP of Engineering</a:t></a:r></a:p></dgm:t>
    </dgm:pt>
    <!-- Another child node -->
    <dgm:pt modelId="3" type="node">
      <dgm:t><a:p><a:r><a:t>VP of Sales</a:t></a:r></a:p></dgm:t>
    </dgm:pt>
  </dgm:ptLst>
  <dgm:cxnLst>
    <!-- CEO is parent of VP of Engineering -->
    <dgm:cxn type="parOf" srcId="1" destId="2" />
    <!-- CEO is parent of VP of Sales -->
    <dgm:cxn type="parOf" srcId="1" destId="3" />
  </dgm:cxnLst>
</dgm:dataModel>
```

To render a diagram, a viewer needs to parse the data model to get the text and structure, and then apply the layout, style, and color information from the other related parts.
