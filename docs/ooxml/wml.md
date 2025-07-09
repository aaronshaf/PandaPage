# wml.xsd

The `wml.xsd` schema is the foundational schema for WordprocessingML (DOCX) documents within the Office Open XML (OOXML) framework. It defines the complete structure and content of a Word document, from its basic building blocks like paragraphs and runs to complex elements like tables, sections, and styles.

## Purpose

This schema is used to:
*   Define the hierarchical structure of a Word document.
*   Represent text content, its formatting, and styling.
*   Specify document layout, including sections, pages, and columns.
*   Manage tables, lists, and other structured content.
*   Integrate with DrawingML for embedded graphical objects.
*   Support features like comments, footnotes, endnotes, and revision tracking.

## Key Elements and Concepts

### Document Structure

The core of a Word document is defined by a hierarchical structure:

*   **`document` (CT_Document):** The root element of a WordprocessingML document.
    *   `body` (CT_Body): Contains the main content of the document.
        *   `EG_BlockLevelElts`: A group that allows for various block-level elements within the body, such as paragraphs, tables, structured document tags, and custom XML blocks.
        *   `sectPr` (CT_SectPr): Section properties, defining page layout, headers/footers, and other section-specific settings.

### Paragraphs and Runs

*   **`p` (CT_P):** Represents a paragraph.
    *   `pPr` (CT_PPr): Paragraph properties (e.g., alignment, indentation, spacing, borders, shading).
    *   `EG_PContent`: Group for content within a paragraph, including runs, simple fields, and hyperlinks.
*   **`r` (CT_R):** Represents a run of text, which is a contiguous sequence of characters with the same formatting.
    *   `rPr` (CT_RPr): Run properties (e.g., font, size, color, bold, italic, underline, effects).
    *   `EG_RunInnerContent`: Group for content within a run, including text, breaks, symbols, and embedded objects.
    *   `t` (CT_Text): The actual text content.

### Tables

*   **`tbl` (CT_Tbl):** Represents a table.
    *   `tblPr` (CT_TblPr): Table properties (e.g., width, alignment, borders, shading, table style).
    *   `tblGrid` (CT_TblGrid): Defines column widths.
    *   `tr` (CT_Tr): Table row.
        *   `trPr` (CT_TrPr): Row properties (e.g., height, row breaks).
        *   `tc` (CT_Tc): Table cell.
            *   `tcPr` (CT_TcPr): Cell properties (e.g., width, borders, shading, merging).

### Sections and Page Layout

*   **`sectPr` (CT_SectPr):** Section properties, which can be applied at the end of the document body or within a paragraph to define a new section.
    *   `pgSz` (CT_PageSz): Page size (width, height, orientation).
    *   `pgMar` (CT_PageMar): Page margins.
    *   `pgBorders` (CT_PageBorders): Page borders.
    *   `cols` (CT_Columns): Column settings (number of columns, spacing).
    *   `headerReference`, `footerReference`: Links to header and footer parts.

### Styles and Numbering

*   **`styles` (CT_Styles):** Defines all styles used in the document (paragraph styles, character styles, table styles, list styles).
*   **`numbering` (CT_Numbering):** Defines numbering and bulleted list schemes.

### Other Key Elements

*   **`comments` (CT_Comments):** Contains comments within the document.
*   **`footnote` (CT_FtnEdn):** Footnotes.
*   **`endnote` (CT_FtnEdn):** Endnotes.
*   **`customXml` (CT_CustomXmlBlock, CT_CustomXmlRun):** Custom XML data embedded in the document.
*   **`sdt` (CT_SdtBlock, CT_SdtRun):** Structured Document Tags (content controls).
*   **`drawing` (CT_Drawing):** Container for DrawingML objects (shapes, pictures, charts) embedded in the document, referencing `dml-wordprocessingDrawing.xsd`.
*   **`fldSimple` (CT_SimpleField):** Simple fields (e.g., page numbers, dates).
*   **`hyperlink` (CT_Hyperlink):** Hyperlinks.
*   **`altChunk` (CT_AltChunk):** Alternative content, allowing embedding of external content.
*   **`trackChanges`:** Elements for tracking changes (insertions, deletions, formatting changes).

## Imported Schemas

This schema imports definitions from:
*   `dml-wordprocessingDrawing.xsd`: For drawing objects within WordprocessingML.
*   `shared-math.xsd`: For mathematical equations.
*   `shared-relationshipReference.xsd`: For relationships between parts.
*   `shared-commonSimpleTypes.xsd`: For common simple types used across OOXML.
*   `shared-customXmlSchemaProperties.xsd`: For custom XML schema properties.

## Example Usage (Conceptual)

A basic WordprocessingML document (`.docx`) would contain a `document` element, which in turn contains a `body` with paragraphs (`p`) and runs (`r`).

```xml
<w:document xmlns:w="http://purl.oclc.org/ooxml/wordprocessingml/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Hello, World!</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="48"/>
        </w:rPr>
        <w:t>Centered Bold Text</w:t>
      </w:r>
    </w:p>
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="dxa"/>
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="2500"/>
        <w:gridCol w:w="2500"/>
      </w:tblGrid>
      <w:tr>
        <w:tc>
          <w:p><w:r><w:t>Cell 1</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:p><w:r><w:t>Cell 2</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>
```