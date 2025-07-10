
# Guide to the Legacy Apple iWork XML Format (Pre-2013)

Before its transition to a binary format in 2013, the Apple iWork suite used a transparent, XML-based file structure. This format was officially documented by Apple in the "iWork Programming Guide," making it accessible for third-party developers. This guide provides a detailed overview of that legacy XML structure.

## Document Bundle Structure

A legacy iWork document (`.pages`, `.numbers`, or `.keynote`) was a "bundle"—a directory that macOS presents as a single file. Its contents could be inspected by right-clicking and selecting "Show Package Contents."

While the exact files varied slightly between applications, a typical structure for a Pages document was:

*   **`index.xml.gz`**: The heart of the document. This was a gzipped XML file containing the entire document's content, structure, and layout. In iWork '09, this could also be an uncompressed `index.xml` file.
*   **Media Assets**: A `Data` directory or simply files alongside the `index.xml.gz` holding all embedded images, videos, and other media.
*   **`QuickLook/`**: A directory containing a `Thumbnail.jpg` and `Preview.pdf` for system-level previews.
*   **`buildVersionHistory.plist`**: A property list file indicating which version of iWork created the document.

For easier debugging, developers could use `defaults` commands to make iWork save the `index.xml` uncompressed and with human-readable formatting.

## The Core XML Hierarchy (`index.xml`)

The root element of the XML was typically `<sl:document>` for Pages, with namespaces like `sl` (Pages), `sf` (Shared Framework), and `sfa` (Shared Framework Additions) defining the elements.

The structure was hierarchical, representing the objects in the document. Below is a simplified overview of the key elements found in a Pages XML file:

```xml
<sl:document>
    <!-- Document-level metadata and settings -->
    <sl:version-history>...</sl:version-history>
    <sl:publication-info>...</sl:publication-info>
    <sl:metadata>...</sl:metadata>
    <sl:print-info>...</sl:print-info>

    <!-- Stylesheet defining all document styles -->
    <sl:stylesheet>...</sl:stylesheet>

    <!-- Content sections -->
    <sl:headers>...</sl:headers>
    <sl:footers>...</sl:footers>
    <sl:drawables>...</sl:drawables>
    <sl:text-storage>...</sl:text-storage>

    <!-- Window and view state -->
    <sl:window-configs>...</sl:window-configs>
</sl:document>
```

### Key Elements and Their Purpose

*   **`<sl:stylesheet>`**: Defined all document styles, including paragraph styles, character styles, list styles, and shape styles. Elements throughout the document would reference these styles by a unique identifier.
*   **`<sl:text-storage>`**: The main container for the body text of the document. The `sf:kind` attribute specified its role (e.g., `body`, `header`, `footnote`, `textbox`).
*   **`<sl:drawables>`**: Contained all "floating" objects not in the main text flow, such as images, shapes, and text boxes. These were organized into layers and groups.
*   **`<sf:p>` (Paragraph)**: The basic unit of text. It referenced a paragraph style (`sf:style`).
*   **`<sf:span>` (Span)**: Used for applying character-level styling (e.g., bold, italic, a different font) to a run of text within a paragraph.
*   **`<sf:list>`**: Defined lists, with `<sf:li>` for list items. List styles were applied to control numbering, bullets, and indentation.
*   **`<sf:table>`**: Represented tables, with complex internal structures for rows, columns, cells, and fills.
*   **Specialized Text Elements**: The format included specific tags for dynamic content and formatting, such as:
    *   `<sf:br/>` (line break), `<sf:pgbr/>` (page break), `<sf:colbr/>` (column break)
    *   `<sf:date-time>`, `<sf:page-number>`, `<sf:page-count>`
    *   `<sf:link href="...">`, `<sf:bookmark>`, `<sf:footnote>`

### Common Attributes

*   **`sfa:ID`**: A unique string identifier for an element, allowing it to be referenced from other parts of the document.
*   **`sfa:IDREF`**: A reference to an element's `sfa:ID`, used to avoid duplicating objects.
*   **`sf:style`**: A reference to a style defined in the `<sl:stylesheet>`.

## Parsing the Legacy Format

Parsing the legacy XML format is a standard procedure:

1.  **Unzip the `.pages` file** to access its contents.
2.  **Decompress `index.xml.gz`** if necessary.
3.  **Use a standard XML parser** (like `libxml2`, which `libetonyek` uses) to read the `index.xml` file.
4.  **Build a document model** by traversing the XML tree, resolving style references, and reconstructing the content in memory.

While this format is no longer in active use, understanding its structure provides valuable context for the evolution of iWork and is necessary for any tool aiming for comprehensive backward compatibility.
