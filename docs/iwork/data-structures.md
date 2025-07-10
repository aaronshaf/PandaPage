# Key Data Structures in Apple Pages Documents (from libetonyek Analysis)

Understanding the core data structures is essential for parsing Apple Pages documents. The `libetonyek` library, through its C++ header files, provides significant insight into the object-oriented schema Apple uses. This document outlines some of the fundamental structures and their roles.

## 1. Core Document Structure and IWA Object Resolution

*   **Document (`EtonyekDocument`)**: The top-level entity, capable of being a Keynote, Numbers, or Pages document. It can be parsed into different interfaces (Presentation, Spreadsheet, Text) depending on the document type.
    *   **`Confidence` Enum**: Indicates the likelihood of file format support (NONE, SUPPORTED_PART, EXCELLENT).
    *   **`Result` Enum**: Describes the outcome of parsing (OK, FILE_ACCESS_ERROR, PACKAGE_ERROR, PARSE_ERROR, UNSUPPORTED_FORMAT, UNKNOWN_ERROR).
    *   **`Type` Enum**: Specifies the document type (UNKNOWN, KEYNOTE, NUMBERS, PAGES).
*   **Package/Stream**: Documents can be "package" formats (directories containing multiple files) or single-file streams. The parser handles both, with a preference for package streams to access all embedded resources.
*   **Metadata (`IWORKMetadata`)**: Contains document-level information: title, author, keywords, and comments.

### IWA Object Index (`IWAObjectIndex`)

Crucial for modern Pages documents, the `IWAObjectIndex` is responsible for resolving internal object IDs to their corresponding data. It maintains mappings for:

*   **`ObjectRecord`**: Stores information about an object's location within the stream, including its type, stream, and byte ranges for header and data (`m_headerRange`, `m_dataRange`).
*   **Object Type Retrieval**: Methods like `getObjectType(id)` and `queryObject(id, type, msg)` allow retrieval of an object's type and its associated `IWAMessage` (Protobuf data) by its unique ID.
*   **File Mapping**: `queryFile(id)` retrieves a file (as a stream) by its ID, indicating that embedded media or other resources are also indexed.
*   **Color File Mapping**: `queryFileColor(id)` suggests that colors might be stored as separate indexed resources.
*   **Internal Maps**: `m_unparsedFragments`, `m_fragmentObjectMap`, `m_fileMap`, and `m_fileColorMap` are used internally to track parsed and unparsed fragments, objects, and file-to-color correspondences.

## 2. Styles and Properties: The Foundation of Document Appearance

Styles are a cornerstone of iWork documents, defining the visual appearance of elements. They are highly structured and inheritable.

*   **`IWORKStyle`:** A fundamental object representing a named, inheritable collection of properties. Styles can be applied to text, paragraphs, shapes, tables, and other document elements.
*   **`IWORKPropertyMap`:** A key-value store that holds the actual properties for a given style or object. It maps `IWORKPropertyID_t` (string IDs) to their corresponding values, which are stored as `boost::any` to allow for dynamic typing. Crucially, `IWORKPropertyMap` supports a `parent` property map, enabling property inheritance. Methods like `has()` and `get()` can traverse this hierarchy.
*   **`IWORKStylesheet`:** Organizes and manages collections of `IWORKStyle` objects. Stylesheets can be hierarchical (e.g., theme stylesheet, master slide stylesheet, slide stylesheet), allowing for complex style inheritance and overrides.

**Common Property Categories (from `IWORKProperties.h`):**
*   **Text/Paragraph Properties:** `Alignment`, `Baseline`, `BaselineShift`, `Bold`, `Capitalization`, `FontColor`, `FontName`, `FontSize`, `Hyphenate`, `Italic`, `KeepLinesTogether`, `KeepWithNext`, `Language`, `LeftIndent`, `LineSpacing`, `Outline`, `PageBreakBefore`, `ParagraphBorderType`, `ParagraphFill`, `ParagraphStroke`, `RightIndent`, `SpaceAfter`, `SpaceBefore`, `Strikethru`, `Tabs`, `TextBackground`, `TextShadow`, `Tracking`, `Underline`, `WidowControl`, `WritingMode`.
*   **Layout/Geometry Properties:** `Columns`, `Geometry`, `LayoutMargins`, `LayoutParagraphStyle`, `LayoutStyle`, `Opacity`, `Padding`, `VerticalAlignment`.
*   **Graphic/Media Properties:** `Fill`, `HeadLineEnd`, `TailLineEnd`, `Shadow`, `Stroke`, `ExternalTextWrap`.
*   **List Properties:** `DropCap`, `ListLabelGeometry`, `ListLabelGeometries`, `ListLabelIndent`, `ListLabelIndents`, `ListLabelTypeInfo`, `ListLabelTypes`, `ListLevelStyles`, `ListStyle`, `ListTextIndent`, `ListTextIndents`.
*   **Table Properties:** `SFTableCellStylePropertyFill`, `SFTableStylePropertyCellStyle`, `SFTableStylePropertyHeaderColumnCellStyle`, `SFTableStylePropertyHeaderRowCellStyle`, `SFTAutoResizeProperty`, `SFTCellStylePropertyDateTimeFormat`, `SFTCellStylePropertyDurationFormat`, `SFTCellStylePropertyNumberFormat`, `SFTCellStylePropertyLayoutStyle`, `SFTCellStylePropertyParagraphStyle`, `SFTDefaultBodyCellStyleProperty`, `SFTDefaultBodyVectorStyleProperty`, `SFTDefaultBorderVectorStyleProperty`, `SFTDefaultFooterBodyVectorStyleProperty`, `SFTDefaultFooterRowCellStyleProperty`, `SFTDefaultFooterSeparatorVectorStyleProperty`, `SFTDefaultGroupingLevelVectorStyleProperty`, `SFTDefaultGroupingRowCellStyleProperty`, `SFTDefaultHeaderBodyVectorStyleProperty`, `SFTDefaultHeaderColumnCellStyleProperty`, `SFTDefaultHeaderRowCellStyleProperty`, `SFTDefaultHeaderSeparatorVectorStyleProperty`, `SFTHeaderColumnRepeatsProperty`, `SFTHeaderRowRepeatsProperty`, `SFTStrokeProperty`, `SFTTableBandedCellFillProperty`, `SFTTableBandedRowsProperty`, `SFTTableNameStylePropertyLayoutStyle`, `SFTTableNameStylePropertyParagraphStyle`.
*   **Page Properties:** `EvenPageMaster`, `FirstPageMaster`, `OddPageMaster`.
*   **Chart Properties:** `SFSeries`, `SFC2DAreaFillProperty`, `SFC2DColumnFillProperty`, `SFC2DMixedColumnFillProperty`, `SFC2DPieFillProperty`, `SFC3DAreaFillProperty`, `SFC3DColumnFillProperty`, `SFC3DPieFillProperty`.

## 3. Core Data Structures and Primitives (from `IWORKTypes.h`)

This section details the fundamental data structures and primitive types used throughout the iWork document model, providing concrete C++ representations for various concepts.

*   **`IWORKSize`**: Defines width and height.
    ```cpp
    struct IWORKSize {
      double m_width;
      double m_height;
    };
    ```
*   **`IWORKPosition`**: Defines X and Y coordinates.
    ```cpp
    struct IWORKPosition {
      double m_x;
      double m_y;
    };
    ```
*   **`IWORKGeometry`**: Represents an object's geometric properties, including size, position, rotation, shear, and flip states.
    ```cpp
    struct IWORKGeometry {
      IWORKSize m_naturalSize;
      IWORKSize m_size;
      IWORKPosition m_position;
      boost::optional<double> m_angle; // final angle in radians
      boost::optional<double> m_shearXAngle;
      boost::optional<double> m_shearYAngle;
      boost::optional<bool> m_horizontalFlip;
      boost::optional<bool> m_verticalFlip;
      boost::optional<bool> m_aspectRatioLocked;
      boost::optional<bool> m_sizesLocked;
    };
    ```
*   **`IWORKColor`**: Defines RGBA color values.
    ```cpp
    struct IWORKColor {
      double m_red;
      double m_green;
      double m_blue;
      double m_alpha;
    };
    ```
*   **`IWORKMarker`**: Used for line endings (e.g., arrowheads).
*   **`IWORKPadding`**: Defines padding amounts for top, right, bottom, and left.
*   **`IWORKTabStop`**: Represents a single tab stop with alignment type and position.
*   **`IWORKTabStops_t`**: A deque of `IWORKTabStop` objects.
*   **`IWORKLine`**: Defines a simple line with geometry and style.
*   **`IWORKData`**: Represents raw binary data, typically for embedded media.
    ```cpp
    struct IWORKData {
      RVNGInputStreamPtr_t m_stream;
      boost::optional<std::string> m_displayName;
      std::string m_mimeType;
    };
    ```
*   **`IWORKMediaContent`**: Describes the content of media (image, video) including its type, size, and raw data.
*   **`IWORKMedia`**: Represents an embedded media object with its geometry, style, and content.
*   **`IWORKExternalTextWrap`**: Defines properties for how text wraps around an object.
*   **`IWORKWrap`**: Combines a path and geometry for text wrapping.
*   **`IWORKLineSpacing`**: Defines line spacing amount and whether it's relative.
*   **`IWORKDateTimeData`**: Stores date and time components.
*   **`IWORKColumnRowSize`**: Defines the size of a column or row, and if it's an exact size.
*   **`IWORKTableVector`**: Used for table borders and vectors.
*   **`IWORKTableCell`**: Represents a single table cell with its style, preferred height, and border styles.
*   **`IWORKTableData`**: Comprehensive structure for table data, including column/row sizes, spans, content, formulas, and grid lines.
    ```cpp
    struct IWORKTableData {
      IWORKColumnSizes_t m_columnSizes;
      IWORKRowSizes_t m_rowSizes;
      unsigned m_column;
      unsigned m_row;
      unsigned m_numColumns;
      unsigned m_numRows;
      boost::optional<unsigned> m_columnSpan;
      boost::optional<unsigned> m_rowSpan;
      boost::optional<unsigned> m_cellMove;
      boost::optional<std::string> m_content;
      boost::optional<IWORKDateTimeData> m_dateTime;
      IWORKFormulaPtr_t m_formula;
      boost::optional<unsigned> m_formulaHC;
      IWORKGridLineMap_t m_horizontalLines;
      IWORKGridLineMap_t m_verticalLines;
      std::unordered_map<double, unsigned> m_positionToHorizontalLineMap;
      std::unordered_map<double, unsigned> m_positionToVerticalLineMap;
      IWORKStylePtr_t m_style;
      IWORKCellType m_type;
    };
    ```
*   **`IWORKPattern`**: Defines a stroke pattern (e.g., solid, dashed).
*   **`IWORKStroke`**: Defines line stroke properties (width, color, join, cap, pattern).
*   **`IWORKGradientStop`**: A single color stop within a gradient.
*   **`IWORKGradient`**: Defines gradient properties (type, stops, angle).
*   **`IWORKFill`**: A `boost::variant` that can hold `IWORKColor`, `IWORKGradient`, or `IWORKMediaContent`.
*   **`IWORKDropCap`**: Defines properties for drop caps.
*   **`IWORKShadow`**: Defines shadow properties.
*   **`IWORKFilters_t`**: A deque of `IWORKShadow` objects, likely for image filters.
*   **`IWORKMetadata`**: Document-level metadata (title, author, keywords, comment).
*   **`IWORKColumns`**: Defines column properties for text layout.
*   **`IWORKPageMaster`**: Defines header and footer content for page masters.
*   **`IWORKNumberFormat`**: Defines number formatting properties.
*   **`IWORKDateTimeFormat`**: Defines date/time formatting properties.
*   **`IWORKDurationFormat`**: Defines duration formatting properties.
*   **`IWORKFilterDescriptor`**: Describes a filter.
*   **`IWORKPrintInfo`**: Defines print-related information (page size, margins, orientation).
*   **`IWORKListLabelGeometry`**: Defines geometry for list labels.
*   **`IWORKTextLabelFormat`**: Defines formatting for text labels.
*   **`IWORKTextLabel`**: Defines properties for text labels.
*   **`IWORKListLabelTypeInfo_t`**: A `boost::variant` for different types of list labels (none, bullet, text, image).
*   **`IWORKListLevels_t`**: A map of unsigned integers to `IWORKStylePtr_t` for list level styles.