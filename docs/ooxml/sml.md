# sml.xsd

The `sml.xsd` schema defines the structure and components of a SpreadsheetML (Excel) document within the Office Open XML (OOXML) framework. It is the central schema for spreadsheets, encompassing worksheets, cells, formulas, shared strings, styles, charts, pivot tables, and external data connections.

## Purpose

This schema is used to:
*   Define the structure and content of individual worksheets.
*   Represent cell data, formulas, and formatting.
*   Manage shared strings to optimize file size for repetitive text.
*   Define and apply cell styles and formatting.
*   Support advanced features like charts, pivot tables, and data validation.
*   Handle external data connections and queries.
*   Track revisions and changes within a spreadsheet.

## Key Elements and Concepts

### Workbook Structure

*   **`workbook` (CT_Workbook):** The root element of a spreadsheet document. It contains references to worksheets, defined names, views, and other workbook-level properties.
    *   `sheets`: List of worksheets.
    *   `definedNames`: Custom names for cells or ranges.
    *   `workbookPr`: Workbook properties (e.g., date system, code name).
    *   `workbookProtection`: Workbook protection settings.

### Worksheet Structure

*   **`worksheet` (CT_Worksheet):** Defines the content and properties of a single worksheet.
    *   `sheetPr`: Worksheet properties (e.g., page setup, print options).
    *   `dimension`: Defines the used range of cells on the worksheet.
    *   `sheetViews`: Defines various views of the worksheet (normal, page break preview).
    *   `sheetFormatPr`: Default formatting properties for the worksheet.
    *   `cols`: Column definitions (width, hidden status).
    *   `sheetData`: Contains the actual cell data, organized by rows and cells.
    *   `mergeCells`: Merged cell ranges.
    *   `phoneticPr`: Phonetic properties for East Asian languages.
    *   `pageMargins`: Page margins for printing.
    *   `pageSetup`: Page setup properties for printing.
    *   `headerFooter`: Header and footer settings.
    *   `drawing`: References to drawing objects (shapes, charts) on the worksheet.
    *   `legacyDrawing`: References to legacy drawing objects.
    *   `extLst`: Extension list for future extensibility.

### Cells and Data

*   **`row` (CT_Row):** Represents a row in the worksheet.
*   **`c` (CT_Cell):** Represents a single cell.
    *   `r`: Cell reference (e.g., "A1").
    *   `s`: Style index.
    *   `t`: Cell type (e.g., "n" for number, "s" for shared string, "b" for boolean, "str" for string, "inlineStr" for inline string, "e" for error, "d" for date).
    *   `v`: Cell value.
    *   `f`: Formula.
*   **`is` (CT_InlineStr):** Inline string content for a cell.
*   **`v` (CT_CellVal):** Cell value.
*   **`f` (CT_CellFormula):** Cell formula.

### Shared Strings

*   **`sst` (CT_Sst):** Shared string table. Contains unique strings used in the workbook, referenced by cells to reduce file size.
    *   `si` (CT_Rst): Individual shared string item, which can contain rich text.

### Styles and Formatting

*   **`styleSheet` (CT_Stylesheet):** Defines all styles used in the workbook.
    *   `numFmts`: Number formats.
    *   `fonts`: Font definitions.
    *   `fills`: Fill patterns and colors.
    *   `borders`: Border styles.
    *   `cellStyleXfs`: Cell style formats.
    *   `cellXfs`: Cell formats (combinations of number format, font, fill, border, alignment).
    *   `cellStyles`: Named cell styles.
    *   `dxfs`: Differential formatting records (used in conditional formatting).
    *   `tableStyles`: Table styles.
    *   `colors`: Indexed colors.

### Charts and Drawings

*   **`drawing` (CT_Drawing):** References drawing objects on the worksheet, defined in `dml-spreadsheetDrawing.xsd`.
*   **`chartsheets`:** (Not directly in sml.xsd, but related) Separate parts for chart sheets.

### Pivot Tables

*   **`pivotCacheDefinition` (CT_PivotCacheDefinition):** Defines the data source for a pivot table.
*   **`pivotCacheRecords` (CT_PivotCacheRecords):** Contains the actual data records for a pivot table.
*   **`pivotTableDefinition` (CT_pivotTableDefinition):** Defines the layout and structure of a pivot table.

### Data Connections and External Data

*   **`connections` (CT_Connections):** Defines external data connections.
*   **`queryTable` (CT_QueryTable):** Defines properties for query tables.
*   **`MapInfo` (CT_MapInfo):** Defines XML maps for importing/exporting XML data.

### Revisions and Comments

*   **`headers` (CT_RevisionHeaders):** Information about tracked revisions.
*   **`revisions` (CT_Revisions):** Contains a list of individual revision records (cell changes, formatting changes, etc.).
*   **`comments` (CT_Comments):** Contains comments associated with cells.

## Imported Schemas

This schema imports definitions from:
*   `shared-relationshipReference.xsd`: For relationships between parts.
*   `shared-commonSimpleTypes.xsd`: For common simple types used across OOXML.
*   `dml-spreadsheetDrawing.xsd`: For drawing objects specific to spreadsheets.

## Example Usage (Conceptual)

A basic SpreadsheetML document (`.xlsx`) would contain a `workbook` element, which references one or more `worksheet` parts. Each worksheet contains `sheetData` with `row` and `c` (cell) elements.

```xml
<workbook xmlns="http://purl.oclc.org/ooxml/spreadsheetml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
```

```xml
<worksheet xmlns="http://purl.oclc.org/ooxml/spreadsheetml/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="str">
        <v>Hello</v>
      </c>
      <c r="B1" t="str">
        <v>World</v>
      </c>
    </row>
    <row r="2">
      <c r="A2" t="n">
        <v>123</v>
      </c>
      <c r="B2" t="n">
        <f>A2*2</f>
        <v>246</v>
      </c>
    </row>
  </sheetData>
</worksheet>
```
