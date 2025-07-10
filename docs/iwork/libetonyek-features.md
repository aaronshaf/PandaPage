# Libetonyek: Supported and Planned Features

This document outlines the features supported by the `libetonyek` library for parsing Apple iWork documents, as well as features that are planned for future development. This information is derived from the `FEATURES.md` file within the `libetonyek` source.

## Supported Features

### Common Document Elements

*   **Shapes**:
    *   Simple shapes (rectangle, triangle, circle, generic path)
    *   Text shapes (shapes containing text)
    *   Parametrizable shapes (polygon, star, arrows)
    *   Transformations (position, size, rotation)
    *   Style (line stroke, fill, opacity)
*   **Text**:
    *   Formatting attributes (bold, italic, underline, font size, color, etc.)
    *   Language information
*   **Media**:
    *   Images
    *   Movies and sounds (inserted into the output, without advanced features like autoplay)
*   **Tables**:
    *   Structure (rows, columns)
    *   Cell content (text, number, date, duration)
    *   Cell style (border, fill)
    *   Cell number format
*   **Links**
*   **Document Metadata** (author, title, comments, keywords)
*   **Lists** (bullets, numbered)

### Keynote Specific Features

*   **Comments** (also known as sticky notes)
*   **(Slide) Notes**

### Numbers Specific Features

*   **Formulas** (within spreadsheet cells)

### Pages Specific Features

*   **Headers and Footers**
*   **Footnotes / Endnotes**
*   **Inline Images** (images embedded directly within text flow)

## Planned Features

`libetonyek` has ongoing development, with the following features identified for future implementation:

*   The rest of parametrizable shapes (implying more complex or less common shapes)
*   Transitions (slide transitions in presentations)
*   Animations (object animations within slides)
*   Auto-fitting of presentation text (adjusting text size to fit placeholders)
*   Connectors (lines connecting shapes)
*   Charts (visual representation of data, likely more advanced features beyond basic chart objects)