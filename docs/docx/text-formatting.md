# Text Formatting in DOCX

## Understanding Text Properties

Text formatting in DOCX involves multiple layers of properties that cascade and interact. Understanding this system is crucial for accurate rendering.

## Property Inheritance Hierarchy

Properties are resolved in this order (later overrides earlier):

1. **Document Defaults** (`docDefaults`)
2. **Style Definitions** (from `styles.xml`)
3. **Paragraph Properties** (`pPr`)
4. **Run Properties** (`rPr`)

### Example of Inheritance

```xml
<!-- In styles.xml - Document defaults -->
<w:docDefaults>
    <w:rPrDefault>
        <w:rPr>
            <w:rFonts w:ascii="Calibri"/>
            <w:sz w:val="22"/>  <!-- 11pt -->
        </w:rPr>
    </w:rPrDefault>
</w:docDefaults>

<!-- Style definition -->
<w:style w:type="paragraph" w:styleId="Heading1">
    <w:rPr>
        <w:rFonts w:ascii="Arial"/>
        <w:b/>
        <w:sz w:val="32"/>  <!-- 16pt -->
    </w:rPr>
</w:style>

<!-- In document.xml -->
<w:p>
    <w:pPr>
        <w:pStyle w:val="Heading1"/>
    </w:pPr>
    <w:r>
        <w:rPr>
            <w:i/>  <!-- Add italic -->
            <w:color w:val="FF0000"/>  <!-- Red -->
        </w:rPr>
        <w:t>Heading Text</w:t>
    </w:r>
</w:p>

<!-- Result: Arial, Bold, Italic, 16pt, Red -->
```

## Toggle Properties

Toggle properties use XOR logic - if both parent and child specify the property, it's turned OFF.

### Common Toggle Properties
- `<w:b/>` - Bold
- `<w:i/>` - Italic
- `<w:strike/>` - Strikethrough
- `<w:dstrike/>` - Double strikethrough
- `<w:outline/>` - Outline
- `<w:shadow/>` - Shadow
- `<w:emboss/>` - Emboss
- `<w:imprint/>` - Imprint
- `<w:smallCaps/>` - Small caps
- `<w:caps/>` - All caps
- `<w:hidden/>` - Hidden text

### Toggle Property Example

```xml
<!-- Style defines bold -->
<w:style w:styleId="MyStyle">
    <w:rPr><w:b/></w:rPr>
</w:style>

<!-- Paragraph uses style and adds bold -->
<w:p>
    <w:pPr><w:pStyle w:val="MyStyle"/></w:pPr>
    <w:r>
        <w:rPr><w:b/></w:rPr>  <!-- Toggles OFF due to XOR -->
        <w:t>This text is NOT bold</w:t>
    </w:r>
</w:p>
```

## Font Properties

### Font Families

```xml
<w:rFonts w:ascii="Times New Roman"      <!-- Latin text -->
          w:hAnsi="Times New Roman"      <!-- High ANSI -->
          w:cs="Arial Unicode MS"         <!-- Complex scripts -->
          w:eastAsia="SimSun"/>           <!-- East Asian -->
```

Different fonts for different character ranges:
- **ascii**: Characters 0x00-0x7F
- **hAnsi**: Characters 0x80-0xFF
- **cs**: Complex scripts (Arabic, Hebrew, etc.)
- **eastAsia**: Chinese, Japanese, Korean

### Font Size

```xml
<w:sz w:val="24"/>    <!-- 12pt (value is in half-points) -->
<w:szCs w:val="24"/>  <!-- Complex script size -->
```

## Color Properties

### Text Color

```xml
<!-- Solid color -->
<w:color w:val="FF0000"/>  <!-- Red -->

<!-- Theme color -->
<w:color w:themeColor="accent1" w:themeTint="99"/>
```

### Highlighting

```xml
<w:highlight w:val="yellow"/>
```

Valid highlight colors:
- black, blue, cyan, darkBlue, darkCyan, darkGray, darkGreen
- darkMagenta, darkRed, darkYellow, green, lightGray, magenta
- none, red, white, yellow

### Shading (Background)

```xml
<w:shd w:val="clear" w:color="auto" w:fill="FF0000"/>
```

## Text Effects

### Underline

```xml
<!-- Simple underline -->
<w:u w:val="single"/>

<!-- Other styles -->
<w:u w:val="double"/>
<w:u w:val="thick"/>
<w:u w:val="dotted"/>
<w:u w:val="dash"/>
<w:u w:val="wave"/>

<!-- Colored underline -->
<w:u w:val="single" w:color="FF0000"/>
```

### Vertical Alignment

```xml
<!-- Superscript -->
<w:vertAlign w:val="superscript"/>

<!-- Subscript -->
<w:vertAlign w:val="subscript"/>

<!-- Baseline (default) -->
<w:vertAlign w:val="baseline"/>
```

### Text Effects

```xml
<!-- Outline -->
<w:outline/>

<!-- Shadow -->
<w:shadow/>

<!-- Emboss -->
<w:emboss/>

<!-- Imprint -->
<w:imprint/>
```

## Spacing and Kerning

### Character Spacing

```xml
<!-- Spacing between characters (in twips) -->
<w:spacing w:val="20"/>  <!-- Expand by 1pt -->
<w:spacing w:val="-20"/> <!-- Condense by 1pt -->
```

### Kerning

```xml
<!-- Enable kerning for fonts 14pt and above -->
<w:kern w:val="28"/>  <!-- In half-points -->
```

### Position

```xml
<!-- Raise/lower text (in half-points) -->
<w:position w:val="6"/>   <!-- Raise by 3pt -->
<w:position w:val="-6"/>  <!-- Lower by 3pt -->
```

## Complex Script Properties

For languages like Arabic, Hebrew, Thai, etc., use separate properties:

```xml
<w:rPr>
    <!-- Normal script -->
    <w:b/>
    <w:sz w:val="24"/>
    
    <!-- Complex script -->
    <w:bCs/>
    <w:szCs w:val="28"/>
    <w:cstheme w:val="majorBidi"/>
</w:rPr>
```

Common complex script properties:
- `<w:bCs/>` - Bold complex script
- `<w:iCs/>` - Italic complex script
- `<w:szCs>` - Size complex script
- `<w:rtl/>` - Right to left

## Language Properties

```xml
<w:lang w:val="en-US"      <!-- Latin -->
        w:eastAsia="zh-CN"  <!-- East Asian -->
        w:bidi="ar-SA"/>    <!-- Bidirectional -->
```

## Special Formatting Cases

### Small Caps and All Caps

```xml
<!-- Small caps -->
<w:smallCaps/>

<!-- All caps -->
<w:caps/>
```

### Hidden Text

```xml
<w:vanish/>  <!-- Hidden text -->
```

### Web Hidden Text

```xml
<w:webHidden/>  <!-- Hidden in web layout view -->
```

## Borders

Text can have borders:

```xml
<w:bdr w:val="single" w:sz="4" w:space="1" w:color="000000"/>
```

## Paragraph-Level Text Properties

Some text properties can be set at paragraph level:

```xml
<w:pPr>
    <w:rPr>
        <!-- These apply to paragraph mark and serve as defaults -->
        <w:b/>
        <w:sz w:val="24"/>
    </w:rPr>
</w:pPr>
```

## Style References

```xml
<!-- Character style -->
<w:rPr>
    <w:rStyle w:val="Emphasis"/>
</w:rPr>

<!-- Paragraph style (applies run properties too) -->
<w:pPr>
    <w:pStyle w:val="Heading1"/>
</w:pPr>
```

## Best Practices for Text Formatting

1. **Property Resolution Order**: Always resolve properties in the correct order
2. **Toggle Logic**: Implement XOR logic for toggle properties
3. **Script Detection**: Detect character ranges to apply correct script properties
4. **Theme Colors**: Resolve theme colors from theme files
5. **Unit Conversion**: Remember font sizes are in half-points
6. **Preserve Spaces**: Honor `xml:space="preserve"` attribute
7. **Default Values**: Apply defaults when properties are missing

## Common Pitfalls

1. **Forgetting Toggle Logic**: Bold + Bold = Not Bold
2. **Wrong Script Properties**: Using `<w:b/>` instead of `<w:bCs/>` for Arabic
3. **Unit Confusion**: Font size 24 = 12pt, not 24pt
4. **Missing Theme Resolution**: Not resolving theme colors
5. **Incomplete Inheritance**: Not checking all property levels

## Formatting Combinations

Complex formatting often combines multiple properties:

```xml
<!-- Bold, italic, underlined, red, 14pt text -->
<w:rPr>
    <w:b/>
    <w:i/>
    <w:u w:val="single"/>
    <w:color w:val="FF0000"/>
    <w:sz w:val="28"/>
</w:rPr>
```

## Performance Considerations

1. **Cache Resolved Properties**: Don't recalculate for every character
2. **Batch Similar Runs**: Combine adjacent runs with identical properties
3. **Lazy Theme Loading**: Only load themes when theme colors are used
4. **Property Normalization**: Normalize properties for comparison