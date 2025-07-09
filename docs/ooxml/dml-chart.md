# dml-chart.xsd

The `dml-chart.xsd` schema defines the structure and elements for charts within Office Open XML (OOXML) documents. This schema is a core component for representing various types of charts, their data, formatting, and layout.

## Purpose

This schema is used to:
*   Define different chart types (e.g., Line, Bar, Pie, Scatter, Area, Bubble, Surface, Radar, Stock, Doughnut).
*   Specify chart data sources, including numerical and string data.
*   Control chart appearance, such as titles, legends, axes, data labels, and plot areas.
*   Manage chart series, data points, trendlines, and error bars.
*   Integrate charts with DrawingML for graphical properties.

## Key Elements and Concepts

### Chart Types

The schema defines complex types for various chart types, each with specific properties:
*   `CT_LineChart`, `CT_Line3DChart`
*   `CT_BarChart`, `CT_Bar3DChart`
*   `CT_PieChart`, `CT_Pie3DChart`, `CT_DoughnutChart`, `CT_OfPieChart`
*   `CT_ScatterChart`
*   `CT_AreaChart`, `CT_Area3DChart`
*   `CT_BubbleChart`
*   `CT_SurfaceChart`, `CT_Surface3DChart`
*   `CT_RadarChart`
*   `CT_StockChart`

### Data Sources

Charts can reference data from various sources:
*   `CT_NumDataSource`: Numerical data.
*   `CT_StrDataSource`: String data.
*   `CT_AxDataSource`: Axis data, which can be numerical, string, or multi-level string.

### Chart Components

*   `CT_ChartSpace`: The root element for a chart, containing global chart properties.
*   `CT_Chart`: Defines the main chart properties, including title, plot area, and legend.
*   `CT_PlotArea`: Contains the actual chart types (e.g., `areaChart`, `barChart`) and axis definitions.
*   `CT_Legend`: Defines the chart legend's position and entries.
*   `CT_Title`: Specifies the chart title.
*   `CT_Ax`: Base type for chart axes (e.g., `CT_CatAx` for category axis, `CT_ValAx` for value axis).
*   `CT_Ser`: Base type for chart series (e.g., `CT_LineSer`, `CT_BarSer`).
*   `CT_DLbls`: Data labels for chart series.
*   `CT_Trendline`: Trendlines for series.
*   `CT_ErrBars`: Error bars for series.

### Formatting and Layout

The schema includes types for:
*   `CT_Layout`: Specifies the layout of chart elements.
*   `CT_ShapeProperties` (imported from `dml-main.xsd`): For graphical properties of chart elements.
*   `CT_TextBody` (imported from `dml-main.xsd`): For text formatting within chart elements.

## Imported Schemas

This schema imports definitions from other DrawingML and shared OOXML schemas:
*   `shared-relationshipReference.xsd`: For relationship IDs.
*   `dml-main.xsd`: For core DrawingML types like shape properties and text bodies.
*   `dml-chartDrawing.xsd`: For chart drawing specific elements.
*   `shared-commonSimpleTypes.xsd`: For common simple types used across OOXML.

## Example Usage (Conceptual)

A typical chart structure in an OOXML document would involve a `chartSpace` element containing a `chart` element, which in turn contains a `plotArea` with one or more specific chart types (e.g., `lineChart`, `barChart`), along with axes, a legend, and other formatting elements.

```xml
<c:chartSpace xmlns:c="http://purl.oclc.org/ooxml/drawingml/chart">
  <c:chart>
    <c:title>
      <c:tx>
        <c:strRef>
          <c:f>Sheet1!$A$1</c:f>
        </c:strRef>
      </c:tx>
    </c:title>
    <c:plotArea>
      <c:lineChart>
        <c:ser>
          <c:idx val="0"/>
          <c:order val="0"/>
          <c:tx>
            <c:v>Series 1</c:v>
          </c:tx>
          <c:cat>
            <c:strRef>
              <c:f>Sheet1!$B$2:$B$4</c:f>
            </c:strRef>
          </c:cat>
          <c:val>
            <c:numRef>
              <c:f>Sheet1!$C$2:$C$4</c:f>
            </c:numRef>
          </c:val>
        </c:ser>
        <c:axId val="1"/>
        <c:axId val="2"/>
      </c:lineChart>
      <c:catAx>
        <c:axId val="1"/>
        <c:scaling>
          <c:orientation val="minMax"/>
        </c:scaling>
        <c:axPos val="b"/>
        <c:crossAx val="2"/>
      </c:catAx>
      <c:valAx>
        <c:axId val="2"/>
        <c:scaling>
          <c:orientation val="minMax"/>
        </c:scaling>
        <c:axPos val="l"/>
        <c:crossAx val="1"/>
      </c:valAx>
    </c:plotArea>
    <c:legend>
      <c:legendPos val="r"/>
    </c:legend>
  </c:chart>
</c:chartSpace>
```
