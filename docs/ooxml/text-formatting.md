# Text and Paragraph Formatting

This document details the formatting properties for text and paragraphs in WordprocessingML, based on the `wml.xsd` schema. For a list of common data types, see [Data Types](./data-types.md).

## Property Inheritance

Formatting in a DOCX document is determined by a hierarchy of styles and properties. The final appearance of text is calculated by applying properties in the following order, with later properties overriding earlier ones:

1.  **Document Defaults (`<w:docDefaults>`)**: The base formatting for the entire document, defined in `styles.xml`.
2.  **Style Definitions (`<w:style>`)**: Pre-defined styles for paragraphs and characters, also in `styles.xml`.
3.  **Paragraph Properties (`<w:pPr>`)**: Direct formatting applied to a paragraph.
4.  **Run Properties (`<w:rPr>`)**: Direct formatting applied to a specific run of text.

## Paragraph Properties (`<w:pPr>`)

These properties define the formatting for an entire paragraph.

### Alignment and Indentation

| Element | Description | Attribute | Values |
| --- | --- | --- | --- |
| `<w:jc>` | Justification (horizontal alignment). | `w:val` | `start`, `end`, `center`, `both`, `distribute` |
| `<w:ind>` | Indentation from the margins. | `w:start`, `w:end`, `w:firstLine`, `w:hanging` | Twips measure |
| `<w:textDirection>` | The direction for text flow. | `w:val` | `lr` (left-to-right), `rl` (right-to-left) |
| `<w:textAlignment>` | Vertical alignment of text in a line. | `w:val` | `top`, `center`, `baseline`, `bottom`, `auto` |

### Spacing

| Element | Description | Attributes | Values |
| --- | --- | --- | --- |
| `<w:spacing>` | Spacing before and after the paragraph. | `w:before`, `w:after`, `w:line`, `w:lineRule` | Twips, `auto`, `exact`, `atLeast` |
| `<w:contextualSpacing>` | Ignore spacing before/after when paragraph is next to a like-formatted one. | `w:val` | `on` / `off` |

### Layout

| Element | Description | Attribute | Values |
| --- | --- | --- | --- |
| `<w:keepNext>` | Keep this paragraph on the same page as the next one. | `w:val` | `on` / `off` |
| `<w:keepLines>` | Keep all lines of the paragraph on the same page. | `w:val` | `on` / `off` |
| `<w:pageBreakBefore>` | Start the paragraph on a new page. | `w:val` | `on` / `off` |
| `<w:widowControl>` | Prevents the first or last line of a paragraph from appearing by itself on a page. | `w:val` | `on` / `off` |

### Borders and Shading

| Element | Description |
| --- | --- |
| `<w:pBdr>` | Defines the borders for the paragraph. Contains `<w:top>`, `<w:bottom>`, `<w:left>`, `<w:right>`. |
| `<w:shd>` | Defines the background shading for the paragraph. |

### Lists

| Element | Description |
| --- | --- |
| `<w:numPr>` | Numbering properties, linking the paragraph to a numbering definition in `numbering.xml`. |

## Run Properties (Formatting)

### Official Run Properties (EG_RPrBase)

From the schema, these are the complete set of base run properties:

```xml
<w:rStyle/>         <!-- Run style reference -->
<w:rFonts/>         <!-- Font family definitions -->
<w:b/>              <!-- Bold -->
<w:bCs/>            <!-- Bold complex script -->
<w:i/>              <!-- Italic -->
<w:iCs/>            <!-- Italic complex script -->
<w:caps/>           <!-- All capitals -->
<w:smallCaps/>      <!-- Small capitals -->
<w:strike/>         <!-- Strikethrough -->
<w:dstrike/>        <!-- Double strikethrough -->
<w:outline/>        <!-- Outline -->
<w:shadow/>         <!-- Shadow -->
<w:emboss/>         <!-- Emboss -->
<w:imprint/>        <!-- Imprint -->
<w:noProof/>        <!-- No spell/grammar check -->
<w:snapToGrid/>     <!-- Snap to document grid -->
<w:vanish/>         <!-- Hidden text -->
<w:webHidden/>      <!-- Hidden in web view -->
<w:color/>          <!-- Text color -->
<w:spacing/>        <!-- Character spacing in twips -->
<w:w/>              <!-- Text scale percentage -->
<w:kern/>           <!-- Kerning point size threshold -->
<w:position/>       <!-- Text position (raised/lowered) -->
<w:sz/>             <!-- Font size in half-points -->
<w:szCs/>           <!-- Complex script font size -->
<w:highlight/>      <!-- Highlight color -->
<w:u/>              <!-- Underline -->
<w:effect/>         <!-- Text effects -->
<w:bdr/>            <!-- Text border -->
<w:shd/>            <!-- Text shading -->
<w:fitText/>        <!-- Fit text in specified width -->
<w:vertAlign/>      <!-- Vertical alignment (superscript/subscript) -->
<w:rtl/>            <!-- Right-to-left text -->
<w:cs/>             <!-- Complex script text -->
<w:em/>             <!-- East Asian emphasis -->
<w:lang/>           <!-- Language -->
<w:eastAsianLayout/> <!-- East Asian typography -->
<w:specVanish/>     <!-- Special hidden text -->
<w:oMath/>          <!-- Office Math -->
```

### Typography Units

**Font Size**: `sz` and `szCs` use half-points
- Value of 24 = 12 points
- Value of 28 = 14 points

**Character Spacing**: `spacing` uses signed twips
- Positive values expand spacing
- Negative values condense spacing
- 20 twips = 1 point spacing adjustment

**Position**: `position` uses signed half-points
- Positive values raise text
- Negative values lower text

## TypeScript Interfaces

Here are some simplified TypeScript interfaces for modeling paragraph and run properties.

```typescript
interface ParagraphProperties {
  styleId?: string;
  justification?: 'start' | 'end' | 'center' | 'both';
  indentation?: {
    start?: number; // Twips
    end?: number; // Twips
    firstLine?: number; // Twips
    hanging?: number; // Twips
  };
  spacing?: {
    before?: number; // Twips
    after?: number; // Twips
    line?: number; // Twips
    lineRule?: 'auto' | 'exact' | 'atLeast';
  };
  numbering?: {
    level: number;
    id: number;
  };
  // ... and other paragraph properties
}

interface RunProperties {
  styleId?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: string;
  color?: string; // Hex color
  size?: number; // Half-points
  font?: {
    ascii?: string;
    hAnsi?: string;
    eastAsia?: string;
    cs?: string;
  };
  highlight?: string;
  verticalAlign?: 'baseline' | 'superscript' | 'subscript';
  // ... and other run properties
}
```

## Toggle Properties

Some boolean properties, like `<w:b>` (bold) and `<w:i>` (italic), are **toggle properties**. Their behavior depends on the inherited style:

*   If the parent style is **not** bold, adding `<w:b/>` makes the text bold.
*   If the parent style is **already** bold, adding `<w:b/>` *removes* the bolding for that specific run (an XOR-like behavior).

This is important for correctly resolving the final style of a run of text.

## Implementation Notes

### Best Practices

1.  **Property Resolution Order**: Always resolve properties in the correct order (Defaults -> Styles -> Paragraph -> Run).
2.  **Toggle Logic**: Correctly implement XOR logic for toggle properties.
3.  **Script Detection**: Detect character ranges (e.g., Arabic, Hebrew) to apply the correct complex script properties (e.g., `<w:bCs>` instead of `<w:b>`).
4.  **Theme Colors**: Resolve theme colors by reading the theme part from the package.
5.  **Unit Conversion**: Remember that font sizes are in half-points and most other measurements are in twips.
6.  **Preserve Spaces**: Always honor the `xml:space="preserve"` attribute on `<w:t>` elements.
7.  **Default Values**: Apply default values for properties that are not specified.

### Common Pitfalls

1.  **Forgetting Toggle Logic**: The most common mistake is forgetting that `<b>` on top of a bold style makes the text *not* bold.
2.  **Wrong Script Properties**: Using `<w:sz>` for a complex script font size instead of `<w:szCs>`.
3.  **Unit Confusion**: Treating a font size of `24` as 24pt instead of 12pt.
4.  **Missing Theme Resolution**: Failing to look up theme colors, resulting in incorrect color rendering.
5.  **Incomplete Inheritance**: Not checking all levels of the property hierarchy, leading to incorrect style resolution.

### Performance Considerations

1.  **Cache Resolved Properties**: Style computation can be expensive. Cache the resolved properties for a given style or run to avoid recalculating.
2.  **Batch Similar Runs**: When rendering, combine adjacent runs with identical properties into a single element to reduce the complexity of the render tree.
3.  **Lazy Theme Loading**: Only load and parse the theme part of the document when theme colors are actually used.