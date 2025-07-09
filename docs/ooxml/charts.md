# OOXML Charts

Charts in OOXML are a type of DrawingML object, but they have their own dedicated schema (`dml-chart.xsd`) and are typically stored in a separate part within the OOXML package (e.g., `/word/charts/chart1.xml`).

## Core Chart Structure

A chart is defined within a `<c:chartSpace>` root element. This element contains all the information needed to render the chart.

```typescript
interface ChartSpace {
  chart: Chart;
  shapeProperties?: ShapeProperties;
}
```

### The `<c:chart>` Element

The `<c:chart>` element is the main container for the chart's definition.

| Child Element | Description |
| --- | --- |
| `<c:title>` | The title of the chart. |
| `<c:plotArea>` | The main area where the chart is drawn, containing the series and axes. |
| `<c:legend>` | The chart's legend. |
| `<c:view3D>` | Defines the 3D properties of the chart. |

```typescript
interface Chart {
  title?: Title;
  plotArea: PlotArea;
  legend?: Legend;
  view3D?: View3D;
}
```

## Plot Area and Chart Types

The `<c:plotArea>` is the core of the chart. It contains one or more elements that define the type of chart to be rendered.

**Common Chart Type Elements:**

*   `<c:barChart>` (Bar Chart)
*   `<c:lineChart>` (Line Chart)
*   `<c:pieChart>` (Pie Chart)
*   `<c:areaChart>` (Area Chart)
*   `<c:scatterChart>` (Scatter Chart)

Each of these chart elements contains one or more `<c:ser>` (Series) elements.

```typescript
interface PlotArea {
  layout?: Layout;
  charts: (BarChart | LineChart | PieChart)[]; // And other chart types
  axes: (CategoryAxis | ValueAxis)[];
}
```

## Data Series (`<c:ser>`)

A series represents a single set of data to be plotted on the chart. For example, in a bar chart with two sets of bars, there would be two `<c:ser>` elements.

| Child Element | Description |
| --- | --- |
| `<c:tx>` | The name of the series, which appears in the legend. |
| `<c:cat>` | The **category** data for the series (e.g., the labels for the x-axis). |
| `<c:val>` | The **value** data for the series (e.g., the height of the bars). |

```typescript
interface Series {
  name: string;
  categories: string[];
  values: number[];
  shapeProperties?: ShapeProperties;
}
```

### Data Sources (`<c:cat>` and `<c:val>`)

The `<c:cat>` and `<c:val>` elements define the data for the series. They can either contain the data directly as a literal (`<c:numLit>` or `<c:strLit>`) or reference data in another part of the document, such as an Excel spreadsheet (`<c:numRef>` or `<c:strRef>`).

## Example: A Simple Bar Chart

Here is a simplified example of a bar chart with two series.

```xml
<c:chartSpace>
  <c:chart>
    <c:title><c:tx><c:v>My Chart</c:v></c:tx></c:title>
    <c:plotArea>
      <c:barChart>
        <!-- Series 1 -->
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx><c:v>Series 1</c:v></c:tx>
          <c:cat>
            <c:strLit>
              <c:pt idx="0"><c:v>Category A</c:v></c:pt>
              <c:pt idx="1"><c:v>Category B</c:v></c:pt>
            </c:strLit>
          </c:cat>
          <c:val>
            <c:numLit>
              <c:pt idx="0"><c:v>10</c:v></c:pt>
              <c:pt idx="1"><c:v>20</c:v></c:pt>
            </c:numLit>
          </c:val>
        </c:ser>
        <!-- Series 2 -->
        <c:ser>
          <c:idx val="1"/>
          <c:order val="1"/>
          <c:tx><c:v>Series 2</c:v></c:tx>
          <c:cat> ... </c:cat>
          <c:val> ... </c:val>
        </c:ser>
      </c:barChart>
      <c:catAx> ... </c:catAx> <!-- Category Axis -->
      <c:valAx> ... </c:valAx> <!-- Value Axis -->
    </c:plotArea>
    <c:legend> ... </c:legend>
  </c:chart>
</c:chartSpace>
```

Rendering a chart requires parsing the chart type, iterating through each series to get its data, and then using a charting library to draw the chart according to the specified properties.
