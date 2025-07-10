# Apple Pages File Format: Legacy XML Structure (Pre-2013)

Before 2013, Apple Pages documents utilized an XML-based file format, which offered a more transparent and accessible structure compared to the later binary format. This section details the key aspects of this legacy XML structure, primarily focusing on Pages 1.x documents.

## Document Bundle Structure

Pages documents from this era were essentially "bundles" (directories treated as single files by macOS) with a `.pages` extension. To view their contents, one could right-click (or Control-click) and select "Show Package Contents." A typical Pages document bundle contained:

*   `index.xml.gz`: A gzipped XML file (or `index.xml` uncompressed in iWork '09) containing the document's entire content and structure.
*   `Contents/`: A folder with bundle metadata (e.g., `PkgInfo`).
*   `Thumbs/`: A folder storing thumbnail images of the document's pages.
*   Media assets: Any embedded images, videos, or other media files used in the document.

The `index.xml.gz` file used standard zlib compression. It could be decompressed using command-line tools or by the Pages application itself, which could also recognize the uncompressed `.xml` form.

## Core XML Hierarchy (`index.xml`)

The root element of a Pages XML document was `<sl:document>`. The structure was hierarchical, with various elements representing different parts of the document. While not a complete schema, the following provides a high-level overview:

```xml
<sl:document>
    <sl:version-history>...</sl:version-history>
    <sl:publication-info>...</sl:publication-info>
    <sl:metadata>...</sl:metadata>
    <sl:print-info>...</sl:print-info>
    <sl:section-prototypes>
        <sl:prototype>
            <sl:stylesheet>...</sl:stylesheet>
            <sl:headers>...</sl:headers>
            <sl:footers>...</sl:footers>
            <sl:drawables>...</sl:drawables>
            <sl:text-storage>...</sl:text-storage>
            <sl:thumbnails>...</sl:thumbnails>
        </sl:prototype>
    </sl:section-prototypes>
    <sl:stylesheet>...</sl:stylesheet>
    <sl:headers>...</sl:headers>
    <sl:footers>...</sl:footers>
    <sl:drawables>...</sl:drawables>
    <sl:text-storage>...</sl:text-storage>
    <sl:thumbnails>...</sl:thumbnails>
    <sl:window-configs>...</sl:window-configs>
</sl:document>
```

### Key Elements and Their Purpose

*   **`<sl:version-history>`**: Contains information about the document format version.
*   **`<sl:publication-info>`**: Document-level global settings, including user preferences and creation/modification dates.
*   **`<sl:metadata>`**: Stores Spotlight metadata (e.g., comments, copyright, keywords, authors, title).
*   **`<sl:print-info>`**: Properties related to printing, such as page dimensions, margins, and print settings.
*   **`<sl:section-prototypes>`**: A unique element to Pages, containing a list of `<sl:prototype>` elements. These prototypes define captured page sets, including their stylesheets, headers, footers, drawables, text storage, and thumbnails.
*   **`<sl:stylesheet>`**: Defines the document's main stylesheet. Unlike Keynote, Pages had a simpler stylesheet inheritance model, typically one stylesheet per captured page set and one for the main document.
*   **`<sl:headers>` / `<sl:footers>`**: Contain the header and footer content, stored as arrays of text storages.
*   **`<sl:drawables>`**: Encompasses all floating objects (e.g., shapes, text boxes, images) not in the main text flow. These were grouped into `masters-group` and `page-groups`.
*   **`<sl:text-storage>`**: Represents the main body text of the document. It could also be used for other text types like headers, footnotes, or text boxes, indicated by an `sf:kind` attribute.
*   **`<sl:thumbnails>`**: Stores thumbnail images of the document pages.
*   **`<sl:window-configs>`**: Specifies the window size, position, scroll position, and selection state when the document was saved.

## Common Attributes

Many elements in the iWork XML schemas (including Pages) utilized common attributes:

*   **`sfa:ID`**: A unique string identifier for an element, allowing it to be referenced elsewhere.
*   **`sfa:IDREF`**: Used to reference an element by its `sfa:ID`, often for objects appearing multiple times in the document.
*   **`sf:style`**: References a specific style (e.g., paragraph style, layout style) by its `sf:ident` or `sfa:ID`.
*   **`sf:kind`**: (For `<sf:text-storage>`) Indicates the usage of the text, such as "body", "header", "footnote", "textbox", "note", or "cell".

## Text Object Representation

Text within Pages XML was structured hierarchically. For main body text, the structure typically involved `<sf:section>` elements (with an `sf:name` and `sf:style`), containing `<sf:layout>` elements (referencing a layout style), which in turn contained `<sf:p>` (paragraph) elements (referencing a paragraph style). Inline styles or character styles were applied using `<sf:span>` elements within paragraphs.

Special elements were used for various text features:

*   **`<sf:br/>`**: Standard paragraph break.
*   **`<sf:pgbr/>`**: Page break.
*   **`<sf:sectbrbr/>`**: Section break.
*   **`<sf:layoutbr/>`**: Layout break (for multi-column layouts).
*   **`<sf:date-time>`**: For date and time fields, with attributes for format, locale, and auto-update.
*   **`<sf:page-number>` / `<sf:page-count>`**: For page numbering fields.
*   **`<sf:bookmark>` / `<sf:bookmark-ref>`**: For document bookmarks.
*   **`<sf:link>`**: For hyperlinks, with an `href` attribute.
*   **`<sf:footnote>` / `<sf:footnote-mark>`**: For footnotes and their references.

## Preferences for XML Manipulation

For developers working with these XML files, Pages (and Keynote) offered hidden preferences to facilitate easier viewing and editing:

*   `defaults write com.apple.iWork.Pages SaveCompressionLevel 0`: Disabled gzip compression, saving `index.xml` directly.
*   `defaults write com.apple.iWork.Pages FormatXML YES`: Formatted the XML for better readability (indentation, newlines).

These preferences were invaluable for reverse engineering and programmatic manipulation of the older Pages document format.