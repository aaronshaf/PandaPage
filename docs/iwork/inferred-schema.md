# Inferred Schema of Apple Pages Documents (from libetonyek Analysis)

Analysis of the `libetonyek` C++ header files, combined with reverse engineering efforts, reveals a highly structured, object-oriented schema for Apple Pages documents. This schema utilizes a hybrid approach for serialization, leveraging both XML (for legacy formats and some metadata) and a custom binary format based on Snappy-compressed Protocol Buffers (IWA) for efficient content and property storage in modern documents.

## 1. Core Document Structure and Hybrid Serialization

At the top level, a document is conceptually represented by an `EtonyekDocument` (as seen in `libetonyek`), which can be a Keynote, Numbers, or Pages file. This document is typically a ZIP archive containing various parts.

For **legacy Pages documents (pre-2013)**, the core structure was XML-based. Key files like `document.xml`, `styles.xml`, and `metadata.xml` (as detailed in [Legacy XML Format](./xml-legacy-format.md)) defined the document's content, styling, and metadata.

For **modern Pages documents (2013+)**, the primary content is stored in `.iwa` files within an `Index.zip` archive. These `.iwa` files contain Snappy-compressed [Protocol Buffer](./protocol-buffers.md) messages. Metadata, such as title, author, keywords, and comments (`IWORKMetadata` in `libetonyek`), might still be found in separate XML files or embedded within specific Protobuf messages.

Regardless of the format generation, the parser handles both package (directory-based) and single-file stream formats. The `IWAObjectIndex` (discussed in [Data Structures](./data-structures.md)) plays a crucial role in resolving object IDs and linking various parts of the document, whether they originate from XML or IWA streams.

## 2. Styles and Properties: The Foundation of Document Appearance

Styles are fundamental to iWork documents, acting as named, inheritable collections of properties that define the appearance and behavior of various document elements. As detailed in [Data Structures](./data-structures.md), `IWORKStyle` objects encapsulate these definitions.

A `IWORKPropertyMap` stores these properties, mapping `IWORKPropertyID_t` (string IDs) to their values. The schema defines a comprehensive set of strongly typed properties, categorized into:

*   **Text/Paragraph Properties**:
    *   `Alignment` (`IWORKAlignment`)
    *   `Baseline` (`IWORKBaseline`)
    *   `BaselineShift` (`double`)
    *   `Bold` (`bool`)
    *   `Capitalization` (`IWORKCapitalization`)
    *   `FontColor` (`IWORKColor`)
    *   `FontName` (`std::string`)
    *   `FontSize` (`double`)
    *   `Hyphenate` (`bool`)
    *   `Italic` (`bool`)
    *   `KeepLinesTogether` (`bool`)
    *   `KeepWithNext` (`bool`)
    *   `Language` (`std::string`)
    *   `LeftIndent` (`double`)
    *   `LineSpacing` (`IWORKLineSpacing`)
    *   `Outline` (`bool`)
    *   `PageBreakBefore` (`bool`)
    *   `ParagraphBorderType` (`IWORKBorderType`)
    *   `ParagraphFill` (`IWORKColor`)
    *   `ParagraphStroke` (`IWORKStroke`)
    *   `RightIndent` (`double`)
    *   `SpaceAfter` (`double`)
    *   `SpaceBefore` (`double`)
    *   `Strikethru` (`bool`)
    *   `Tabs` (`IWORKTabStops_t`)
    *   `TextBackground` (`IWORKColor`)
    *   `TextShadow` (`IWORKShadow`)
    *   `Tracking` (`double`)
    *   `Underline` (`bool`)
    *   `WidowControl` (`bool`)
    *   `WritingMode` (`std::string`)
*   **Layout/Geometry Properties**:
    *   `Columns` (`IWORKColumns`)
    *   `Geometry` (`IWORKGeometryPtr_t`)
    *   `LayoutMargins` (`IWORKPadding`)
    *   `LayoutParagraphStyle` (`IWORKStylePtr_t`)
    *   `LayoutStyle` (`IWORKStylePtr_t`)
    *   `Opacity` (`double`)
    *   `Padding` (`IWORKPadding`)
    *   `VerticalAlignment` (`IWORKVerticalAlignment`)
*   **Graphic/Media Properties**:
    *   `Fill` (`IWORKFill`)
    *   `HeadLineEnd` (`IWORKMarker`)
    *   `TailLineEnd` (`IWORKMarker`)
    *   `Shadow` (`IWORKShadow`)
    *   `Stroke` (`IWORKStroke`)
    *   `ExternalTextWrap` (`IWORKExternalTextWrap`)
*   **List Properties**:
    *   `DropCap` (`IWORKDropCap`)
    *   `ListLabelGeometry` (`IWORKListLabelGeometry`)
    *   `ListLabelGeometries` (`std::deque<IWORKListLabelGeometry>`)
    *   `ListLabelIndent` (`double`)
    *   `ListLabelIndents` (`std::deque<double>`)
    *   `ListLabelTypeInfo` (`IWORKListLabelTypeInfo_t`)
    *   `ListLabelTypes` (`std::deque<IWORKListLabelTypeInfo_t>`)
    *   `ListLevelStyles` (`IWORKListLevels_t`)
    *   `ListStyle` (`IWORKStylePtr_t`)
    *   `ListTextIndent` (`double`)
    *   `ListTextIndents` (`std::deque<double>`)
*   **Table Properties**:
    *   `SFTableCellStylePropertyFill` (`IWORKFill`)
    *   `SFTableStylePropertyCellStyle` (`IWORKStylePtr_t`)
    *   `SFTableStylePropertyHeaderColumnCellStyle` (`IWORKStylePtr_t`)
    *   `SFTableStylePropertyHeaderRowCellStyle` (`IWORKStylePtr_t`)
    *   `SFTAutoResizeProperty` (`bool`)
    *   `SFTCellStylePropertyDateTimeFormat` (`IWORKDateTimeFormat`)
    *   `SFTCellStylePropertyDurationFormat` (`IWORKDurationFormat`)
    *   `SFTCellStylePropertyNumberFormat` (`IWORKNumberFormat`)
    *   `SFTCellStylePropertyLayoutStyle` (`IWORKStylePtr_t`)
    *   `SFTCellStylePropertyParagraphStyle` (`IWORKStylePtr_t`)
    *   `SFTDefaultBodyCellStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultBodyVectorStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultBorderVectorStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultFooterBodyVectorStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultFooterRowCellStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultFooterSeparatorVectorStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultGroupingLevelVectorStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultGroupingRowCellStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultHeaderBodyVectorStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultHeaderColumnCellStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultHeaderRowCellStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTDefaultHeaderSeparatorVectorStyleProperty` (`IWORKStylePtr_t`)
    *   `SFTHeaderColumnRepeatsProperty` (`bool`)
    *   `SFTHeaderRowRepeatsProperty` (`bool`)
    *   `SFTStrokeProperty` (`IWORKStroke`)
    *   `SFTTableBandedCellFillProperty` (`IWORKFill`)
    *   `SFTTableBandedRowsProperty` (`bool`)
    *   `SFTTableNameStylePropertyLayoutStyle` (`IWORKStylePtr_t`)
    *   `SFTTableNameStylePropertyParagraphStyle` (`IWORKStylePtr_t`)
*   **Page Properties**:
    *   `EvenPageMaster` (`IWORKPageMaster`)
    *   `FirstPageMaster` (`IWORKPageMaster`)
    *   `OddPageMaster` (`IWORKPageMaster`)
*   **Chart Properties**:
    *   `SFSeries` (`IWORKStylePtr_t`)
    *   `SFC2DAreaFillProperty` (`IWORKFill`)
    *   `SFC2DColumnFillProperty` (`IWORKFill`)
    *   `SFC2DMixedColumnFillProperty` (`IWORKFill`)
    *   `SFC2DPieFillProperty` (`IWORKFill`)
    *   `SFC3DAreaFillProperty` (`IWORKFill`)
    *   `SFC3DColumnFillProperty` (`IWORKFill`)
    *   `SFC3DPieFillProperty` (`IWORKFill`)

Stylesheets (`IWORKStylesheet`) organize these styles, potentially in a hierarchical manner, allowing for efficient management and application of consistent formatting across the document.

## 3. Document Content Elements: Building Blocks of the Document

The schema defines distinct objects for various content types, forming the building blocks of the document. These correspond to the `IWORK` prefixed objects identified in `libetonyek` and further detailed in [Data Structures](./data-structures.md):

*   **Text (`IWORKText`)**: Represents a block of text, managing paragraphs, spans, fields, links, and various text formatting attributes.
    *   `m_langManager`: Manages language-specific text properties.
    *   `m_layoutStyleStack`, `m_paraStyleStack`: Style stacks for layout and paragraph styles.
    *   `m_elements`: Output elements for text content.
    *   `m_breakDelayed`: Delayed break type (line, column, page).
    *   `m_pageMasters`, `m_sections`, `m_paras`, `m_spans`, `m_lists`, `m_dropCaps`: Maps of styles applied at different text levels.
    *   **Paragraphs (`p`)**: Basic text containers, can have associated styles.
    *   **Spans (`span`)**: Inline text elements for applying character-level formatting.
    *   **Fields**: Dynamic content like page numbers, dates, or filenames.
    *   **Breaks**: Line, column, and page breaks.
*   **Shapes (`IWORKShape`)**: Generic graphical objects with geometry, style, and an optional path.
    *   `m_geometry`: Pointer to `IWORKGeometry` defining position, size, rotation, etc.
    *   `m_style`: Pointer to `IWORKStyle` for visual properties.
    *   `m_path`: Pointer to `IWORKPath` defining the shape's outline.
    *   `m_text`: Pointer to `IWORKText` if the shape contains text.
    *   **Paths (`IWORKPath`)**: Defines the outline of a shape using a sequence of `MoveTo`, `LineTo`, `CurveTo`, and `Close` operations. Can be complex Bezier paths.
    *   **Predefined Shapes**: Polygon, Rounded Rectangle, Arrow, Star, Callout, Quote Bubble.
*   **Images and Media (`IWORKMedia`, `IWORKMediaContent`)**: Represents embedded images and other media (e.g., videos).
    *   `m_type`: `IWORKImageType` (original size, stretch, tile, scale to fill, scale to fit).
    *   `m_size`: Optional `IWORKSize` for media dimensions.
    *   `m_data`: Pointer to `IWORKData` containing the raw media bytes.
    *   `m_fillColor`: Optional `IWORKColor` for fill.
    *   `m_geometry`, `m_cropGeometry`: Geometry and cropping information.
    *   `m_style`: Style for the media object.
    *   `m_order`: Z-order for layering.
    *   `m_locked`, `m_placeholder`, `m_placeholderSize`: Flags and properties for media behavior.
*   **Lines (`IWORKLine`)**: Simple line objects with geometry and style.
    *   `m_geometry`: Pointer to `IWORKGeometry`.
    *   `m_style`: Pointer to `IWORKStyle`.
    *   `m_order`: Z-order.
    *   `m_x1`, `m_y1`, `m_x2`, `m_y2`: Line coordinates.
*   **Tables (`IWORKTable`)**: Complex grid structures for tabular data.
    *   `m_tableNameMap`: Map of table names to IDs.
    *   `m_formatNameMap`: Map of format names to IDs.
    *   `m_langManager`: Language manager.
    *   `m_commentMap`: Map of cell coordinates to comments.
    *   `m_style`: Table style.
    *   `m_columnSizes`, `m_rowSizes`: Sizes of columns and rows.
    *   `m_verticalLines`, `m_horizontalLines`: Grid line styles.
    *   `m_defaultCellStyles`, `m_defaultLayoutStyles`, `m_defaultParaStyles`: Default styles for different cell types.
    *   **Cells (`IWORKTableCell`)**: Can contain text, numbers, dates, durations, booleans, or formulas.
        *   `m_style`: Cell style.
        *   `m_preferredHeight`: Preferred cell height.
        *   `m_minXBorder`, `m_maxXBorder`, `m_minYBorder`, `m_maxYBorder`: Border styles.
    *   **Formulas (`IWORKFormula`)**: Supports a wide range of functions and cell references.
    *   **Grid Lines**: Defines borders and styling for table grid lines.
    *   **Headers/Footers**: Configurable header and footer rows/columns.
*   **Charts (`IWORKChart`)**: Visual representations of data.
    *   `m_chartName`: Chart name.
    *   `m_valueTitle`, `m_categoryTitle`: Chart axis titles.
*   **Annotations**: Comments within the document.
*   **Footnotes/Endnotes**: References and content for notes.
*   **Groups**: Allows for grouping multiple drawable objects together.

## 4. Parsing and Object Resolution: Bringing the Document to Life

The parsing process involves reading the serialized data and building an in-memory representation of the document. This process varies depending on the format generation:

*   **Legacy XML Parsing:** For older documents, the presence of numerous XML element and attribute tokens (`IWORKToken.h` in `libetonyek`) suggests an XML-based foundation. Parsing involves standard XML parsing techniques to read `document.xml`, `styles.xml`, etc., as described in [Legacy XML Format](./xml-legacy-format.md).

*   **Modern IWA (Protobuf) Parsing:** For newer documents, the process involves [Snappy decompression](./snappy-compression.md) of `.iwa` files, followed by deserialization of [Protocol Buffer](./protocol-buffers.md) messages. The `libetonyek` library utilizes components like `IWAParser`, `IWAField`, and `IWAMessage` for this purpose.

Regardless of the format, a crucial aspect is **object resolution**. The `IWAObjectIndex` (further detailed in [Data Structures](./data-structures.md)) plays a vital role in resolving internal object IDs and linking various parts of the document. This allows the parser to connect, for example, a text run to its corresponding style definition, or an image reference to its actual binary data.

Building the internal representation is often handled by collector classes (e.g., `IWORKCollector` with application-specific collectors like `PAGCollector` in `libetonyek`), which assemble the parsed data into a coherent document model. Property handling is sophisticated, utilizing `IWORKPropertyMap` and specialized contexts to apply formatting and attributes correctly.

## 5. Data Types and Enumerations

The schema heavily relies on custom C++ structs and enumerations to define data types and their allowed values, ensuring strong typing and consistency. These enumerations, primarily defined in `IWORKEnum.h`, cover a wide range of properties, including:

*   **`EtonyekDocument` Enums**:
    *   `Confidence`: `CONFIDENCE_NONE`, `CONFIDENCE_SUPPORTED_PART`, `CONFIDENCE_EXCELLENT`.
    *   `Result`: `RESULT_OK`, `RESULT_FILE_ACCESS_ERROR`, `RESULT_PACKAGE_ERROR`, `RESULT_PARSE_ERROR`, `RESULT_UNSUPPORTED_FORMAT`, `RESULT_UNKNOWN_ERROR`.
    *   `Type`: `TYPE_UNKNOWN`, `TYPE_KEYNOTE`, `TYPE_NUMBERS`, `TYPE_PAGES`.
*   **`IWORKAlignment`**: `IWORK_ALIGNMENT_LEFT`, `IWORK_ALIGNMENT_RIGHT`, `IWORK_ALIGNMENT_CENTER`, `IWORK_ALIGNMENT_JUSTIFY`, `IWORK_ALIGNMENT_AUTOMATIC`.
*   **`IWORKBaseline`**: `IWORK_BASELINE_NORMAL`, `IWORK_BASELINE_SUB`, `IWORK_BASELINE_SUPER`.
*   **`IWORKBorderType`**: `IWORK_BORDER_TYPE_NONE`, `IWORK_BORDER_TYPE_TOP`, `IWORK_BORDER_TYPE_BOTTOM`, `IWORK_BORDER_TYPE_TOP_AND_BOTTOM`, `IWORK_BORDER_TYPE_ALL`.
*   **`IWORKBorderStroke`**: `IWORK_BORDER_STROKE_NONE`, `IWORK_BORDER_STROKE_SOLID`, `IWORK_BORDER_STROKE_DOTTED`, `IWORK_BORDER_STROKE_DASHED`.
*   **`IWORKBreakType`**: `IWORK_BREAK_NONE`, `IWORK_BREAK_LINE`, `IWORK_BREAK_COLUMN`, `IWORK_BREAK_PAGE`.
*   **`IWORKCapitalization`**: `IWORK_CAPITALIZATION_NONE`, `IWORK_CAPITALIZATION_ALL_CAPS`, `IWORK_CAPITALIZATION_SMALL_CAPS`, `IWORK_CAPITALIZATION_TITLE`.
*   **`IWORKLineCap`**: `IWORK_LINE_CAP_NONE`, `IWORK_LINE_CAP_BUTT`, `IWORK_LINE_CAP_ROUND`.
*   **`IWORKLineJoin`**: `IWORK_LINE_JOIN_NONE`, `IWORK_LINE_JOIN_MITER`, `IWORK_LINE_JOIN_ROUND`.
*   **`IWORKCellType`**: `IWORK_CELL_TYPE_NUMBER`, `IWORK_CELL_TYPE_TEXT`, `IWORK_CELL_TYPE_DATE_TIME`, `IWORK_CELL_TYPE_DURATION`, `IWORK_CELL_TYPE_BOOL`.
*   **`IWORKCellNumberType`**: `IWORK_CELL_NUMBER_TYPE_CURRENCY`, `IWORK_CELL_NUMBER_TYPE_DOUBLE`, `IWORK_CELL_NUMBER_TYPE_FRACTION`, `IWORK_CELL_NUMBER_TYPE_PERCENTAGE`, `IWORK_CELL_NUMBER_TYPE_SCIENTIFIC`.
*   **`IWORKImageType`**: `IWORK_IMAGE_TYPE_ORIGINAL_SIZE`, `IWORK_IMAGE_TYPE_STRETCH`, `IWORK_IMAGE_TYPE_TILE`, `IWORK_IMAGE_TYPE_SCALE_TO_FILL`, `IWORK_IMAGE_TYPE_SCALE_TO_FIT`.
*   **`IWORKGradientType`**: `IWORK_GRADIENT_TYPE_LINEAR`, `IWORK_GRADIENT_TYPE_RADIAL`.
*   **`IWORKVerticalAlignment`**: `IWORK_VERTICAL_ALIGNMENT_TOP`, `IWORK_VERTICAL_ALIGNMENT_MIDDLE`, `IWORK_VERTICAL_ALIGNMENT_BOTTOM`.
*   **`IWORKStrokeType`**: `IWORK_STROKE_TYPE_NONE`, `IWORK_STROKE_TYPE_SOLID`, `IWORK_STROKE_TYPE_DASHED`, `IWORK_STROKE_TYPE_AUTO`.
*   **`IWORKLabelNumFormat`**: `IWORK_LABEL_NUM_FORMAT_NUMERIC`, `IWORK_LABEL_NUM_FORMAT_ALPHA`, `IWORK_LABEL_NUM_FORMAT_ALPHA_LOWERCASE`, `IWORK_LABEL_NUM_FORMAT_ROMAN`, `IWORK_LABEL_NUM_FORMAT_ROMAN_LOWERCASE`.
*   **`IWORKLabelNumFormatSurrounding`**: `IWORK_LABEL_NUM_FORMAT_SURROUNDING_NONE`, `IWORK_LABEL_NUM_FORMAT_SURROUNDING_PARENTHESIS`, `IWORK_LABEL_NUM_FORMAT_SURROUNDING_DOT`.
*   **`IWORKFieldType`**: `IWORK_FIELD_DATETIME`, `IWORK_FIELD_FILENAME`, `IWORK_FIELD_PAGECOUNT`, `IWORK_FIELD_PAGENUMBER`.
*   **`IWORKTabulationType`**: `IWORK_TABULATION_LEFT`, `IWORK_TABULATION_RIGHT`, `IWORK_TABULATION_CENTER`, `IWORK_TABULATION_DECIMAL`.
*   **`IWORKWrapDirection`**: `IWORK_WRAP_DIRECTION_BOTH`, `IWORK_WRAP_DIRECTION_LEFT`, `IWORK_WRAP_DIRECTION_RIGHT`.
*   **`IWORKWrapStyle`**: `IWORK_WRAP_STYLE_REGULAR`, `IWORK_WRAP_STYLE_TIGHT`.
*   **`IWORKWrapType`**: `IWORK_WRAP_TYPE_DIRECTIONAL`, `IWORK_WRAP_TYPE_LARGEST`, `IWORK_WRAP_TYPE_NEITHER`.

These detailed enumerations provide the granular control necessary for representing the rich formatting capabilities of iWork applications.

## Summary of Schema Characteristics

*   **Object-Oriented:** Designed around distinct objects with properties and relationships, mirroring the structure of the content.
*   **Hierarchical:** Elements are nested, and styles support inheritance, allowing for efficient and consistent application of formatting.
*   **Rich Feature Set:** Supports a wide array of document formatting, layout, and content types, reflecting the capabilities of Pages.
*   **Modular:** Organized into separate components for types, properties, and tokens, facilitating maintainability and extensibility.
*   **XML/Binary Hybrid:** Combines XML for metadata and legacy formats with the IWA binary format (Snappy-compressed Protocol Buffers) for efficient content storage in modern documents.
*   **Application-Specific Extensions:** Core `IWORK` elements are extended with `PAG`, `NUM`, and `KEY` prefixes for application-specific features, allowing for differentiation between Pages, Numbers, and Keynote documents.
*   **Reverse-Engineered:** The understanding of this schema is primarily derived from reverse engineering efforts and analysis of `libetonyek`, as Apple does not provide official documentation for the modern format.