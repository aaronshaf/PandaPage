# Styles and Themes in DOCX

## Understanding Styles

Styles in DOCX provide reusable formatting definitions that ensure consistency across documents. They form a hierarchy with inheritance and can be modified at multiple levels.

## Style Types

DOCX supports four types of styles:

1. **Paragraph Styles** - Apply to entire paragraphs
2. **Character Styles** - Apply to runs of text
3. **Table Styles** - Apply to tables
4. **Numbering Styles** - Define list formatting

## Style Definition Structure

### Basic Style

```xml
<w:style w:type="paragraph" w:styleId="Heading1">
    <!-- Display name -->
    <w:name w:val="Heading 1"/>
    
    <!-- Based on another style -->
    <w:basedOn w:val="Normal"/>
    
    <!-- Style for next paragraph -->
    <w:next w:val="Normal"/>
    
    <!-- Linked character style -->
    <w:link w:val="Heading1Char"/>
    
    <!-- UI priority for style gallery -->
    <w:uiPriority w:val="9"/>
    
    <!-- Quick style -->
    <w:qFormat/>
    
    <!-- Paragraph properties -->
    <w:pPr>
        <w:keepNext/>
        <w:keepLines/>
        <w:spacing w:before="480" w:after="0"/>
        <w:outlineLvl w:val="0"/>
    </w:pPr>
    
    <!-- Run properties -->
    <w:rPr>
        <w:rFonts w:asciiTheme="majorHAnsi" w:hAnsiTheme="majorHAnsi"/>
        <w:b/>
        <w:bCs/>
        <w:color w:val="2E74B5" w:themeColor="accent1" w:themeShade="BF"/>
        <w:sz w:val="32"/>
        <w:szCs w:val="32"/>
    </w:rPr>
</w:style>
```

### Character Style

```xml
<w:style w:type="character" w:styleId="Emphasis">
    <w:name w:val="Emphasis"/>
    <w:basedOn w:val="DefaultParagraphFont"/>
    <w:rPr>
        <w:i/>
        <w:iCs/>
    </w:rPr>
</w:style>
```

### Table Style

```xml
<w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:basedOn w:val="TableNormal"/>
    <w:tblPr>
        <w:tblBorders>
            <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
        </w:tblBorders>
    </w:tblPr>
</w:style>
```

## Style Inheritance

### Style Hierarchy

```
Document Defaults
    ↓
Base Style (e.g., Normal)
    ↓
Derived Style (e.g., Heading1 based on Normal)
    ↓
Local Formatting (paragraph/run properties)
```

### Default Styles

```xml
<w:docDefaults>
    <w:rPrDefault>
        <w:rPr>
            <w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorEastAsia"/>
            <w:sz w:val="22"/>
            <w:szCs w:val="22"/>
            <w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ar-SA"/>
        </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
        <w:pPr>
            <w:spacing w:after="160" w:line="259" w:lineRule="auto"/>
        </w:pPr>
    </w:pPrDefault>
</w:docDefaults>
```

### Style with `w:default="1"`

```xml
<w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
</w:style>
```

## Themes

Themes define colors, fonts, and effects that styles can reference.

### Theme Structure

```xml
<a:theme name="Office Theme">
    <a:themeElements>
        <!-- Color Scheme -->
        <a:clrScheme name="Office">
            <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
            <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
            <a:dk2><a:srgbClr val="44546A"/></a:dk2>
            <a:lt2><a:srgbClr val="E7E6E6"/></a:lt2>
            <a:accent1><a:srgbClr val="5B9BD5"/></a:accent1>
            <a:accent2><a:srgbClr val="ED7D31"/></a:accent2>
            <a:accent3><a:srgbClr val="A5A5A5"/></a:accent3>
            <a:accent4><a:srgbClr val="FFC000"/></a:accent4>
            <a:accent5><a:srgbClr val="4472C4"/></a:accent5>
            <a:accent6><a:srgbClr val="70AD47"/></a:accent6>
            <a:hlink><a:srgbClr val="0563C1"/></a:hlink>
            <a:folHlink><a:srgbClr val="954F72"/></a:folHlink>
        </a:clrScheme>
        
        <!-- Font Scheme -->
        <a:fontScheme name="Office">
            <a:majorFont>
                <a:latin typeface="Calibri Light"/>
                <a:ea typeface=""/>
                <a:cs typeface=""/>
            </a:majorFont>
            <a:minorFont>
                <a:latin typeface="Calibri"/>
                <a:ea typeface=""/>
                <a:cs typeface=""/>
            </a:minorFont>
        </a:fontScheme>
        
        <!-- Format Scheme -->
        <a:fmtScheme name="Office">
            <!-- Fill styles, line styles, effect styles -->
        </a:fmtScheme>
    </a:themeElements>
</a:theme>
```

### Theme Colors

Theme colors can be referenced with tint/shade modifications:

```xml
<!-- Reference accent1 color with 40% shade -->
<w:color w:themeColor="accent1" w:themeShade="66"/>

<!-- Reference accent2 color with 60% tint -->
<w:color w:themeColor="accent2" w:themeTint="99"/>
```

### Theme Fonts

```xml
<!-- Major font (headings) -->
<w:rFonts w:asciiTheme="majorHAnsi" w:hAnsiTheme="majorHAnsi"/>

<!-- Minor font (body text) -->
<w:rFonts w:asciiTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi"/>
```

## Style Application

### Paragraph Style Application

```xml
<w:p>
    <w:pPr>
        <w:pStyle w:val="Heading1"/>
    </w:pPr>
    <w:r>
        <w:t>This is a heading</w:t>
    </w:r>
</w:p>
```

### Character Style Application

```xml
<w:r>
    <w:rPr>
        <w:rStyle w:val="Emphasis"/>
    </w:rPr>
    <w:t>Emphasized text</w:t>
</w:r>
```

### Direct Formatting Override

```xml
<w:p>
    <w:pPr>
        <w:pStyle w:val="Normal"/>
        <!-- Override style spacing -->
        <w:spacing w:before="240" w:after="240"/>
    </w:pPr>
    <w:r>
        <w:rPr>
            <!-- Override style font -->
            <w:rFonts w:ascii="Arial"/>
        </w:rPr>
        <w:t>Custom formatted text</w:t>
    </w:r>
</w:p>
```

## Numbering Styles

Numbering definitions are stored in `numbering.xml`:

```xml
<w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
        <w:start w:val="1"/>
        <w:numFmt w:val="decimal"/>
        <w:lvlText w:val="%1."/>
        <w:lvlJc w:val="left"/>
        <w:pPr>
            <w:ind w:left="720" w:hanging="360"/>
        </w:pPr>
    </w:lvl>
    <w:lvl w:ilvl="1">
        <w:start w:val="1"/>
        <w:numFmt w:val="lowerLetter"/>
        <w:lvlText w:val="%2."/>
        <w:lvlJc w:val="left"/>
        <w:pPr>
            <w:ind w:left="1440" w:hanging="360"/>
        </w:pPr>
    </w:lvl>
</w:abstractNum>
```

## Style Priority and Conflicts

### Resolution Order

1. Direct formatting (highest priority)
2. Character style
3. Paragraph style
4. Table style (for table content)
5. Document defaults (lowest priority)

### Handling Conflicts

When multiple styles define the same property:

```xml
<!-- Style defines font size 14pt -->
<w:style w:styleId="MyStyle">
    <w:rPr><w:sz w:val="28"/></w:rPr>
</w:style>

<!-- Direct formatting overrides to 12pt -->
<w:r>
    <w:rPr>
        <w:rStyle w:val="MyStyle"/>
        <w:sz w:val="24"/>  <!-- This wins -->
    </w:rPr>
</w:r>
```

## Quick Styles

Quick styles appear in Word's style gallery:

```xml
<w:style w:styleId="Quote">
    <w:name w:val="Quote"/>
    <w:qFormat/>  <!-- Makes it a quick style -->
    <w:uiPriority w:val="29"/>  <!-- Gallery position -->
</w:style>
```

## Style Relationships

### Linked Styles

Paragraph and character styles can be linked:

```xml
<!-- Paragraph style -->
<w:style w:type="paragraph" w:styleId="Heading1">
    <w:link w:val="Heading1Char"/>
</w:style>

<!-- Linked character style -->
<w:style w:type="character" w:styleId="Heading1Char">
    <w:link w:val="Heading1"/>
</w:style>
```

### Next Style

Defines what style to use for the next paragraph:

```xml
<w:style w:styleId="Heading1">
    <w:next w:val="Normal"/>  <!-- After heading, use Normal -->
</w:style>
```

## Best Practices

1. **Cache Style Definitions**: Parse styles.xml once and cache results
2. **Resolve Theme References**: Load theme colors/fonts when needed
3. **Handle Missing Styles**: Gracefully handle references to undefined styles
4. **Respect Style Hierarchy**: Always apply styles in correct order
5. **Optimize Inheritance**: Pre-calculate inherited properties

## Common Issues

1. **Circular Dependencies**: Style A based on B, B based on A
2. **Missing Base Styles**: Referenced base style doesn't exist
3. **Theme Color Resolution**: Not resolving theme color references
4. **Toggle Property Confusion**: Forgetting toggle logic in style inheritance
5. **Default Style Detection**: Missing styles with `w:default="1"`

## Performance Optimization

1. **Lazy Loading**: Load styles/themes only when referenced
2. **Property Caching**: Cache resolved style properties
3. **Batch Processing**: Process multiple elements with same style together
4. **Early Exit**: Stop inheritance chain when all properties are defined