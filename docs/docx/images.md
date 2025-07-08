# Images and Media in DOCX

## Image Storage

Images in DOCX are stored as separate files within the ZIP archive, typically in the `word/media/` folder. The document references these images through relationships.

## Image Types

DOCX supports two main ways to position images:

1. **Inline Images** - Flow with text like a character
2. **Floating Images** - Positioned relative to page/paragraph with text wrapping

## Inline Images

### Basic Structure

```xml
<w:r>
    <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
            <!-- Size in EMUs -->
            <wp:extent cx="2286000" cy="1714500"/>
            
            <!-- Non-visual properties -->
            <wp:docPr id="1" name="Picture 1" descr="Description"/>
            
            <a:graphic>
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:pic>
                        <pic:nvPicPr>
                            <pic:cNvPr id="1" name="Picture 1"/>
                            <pic:cNvPicPr/>
                        </pic:nvPicPr>
                        
                        <pic:blipFill>
                            <!-- Reference to image -->
                            <a:blip r:embed="rId4"/>
                            <a:stretch>
                                <a:fillRect/>
                            </a:stretch>
                        </pic:blipFill>
                        
                        <pic:spPr>
                            <a:xfrm>
                                <a:off x="0" y="0"/>
                                <a:ext cx="2286000" cy="1714500"/>
                            </a:xfrm>
                            <a:prstGeom prst="rect">
                                <a:avLst/>
                            </a:prstGeom>
                        </pic:spPr>
                    </pic:pic>
                </a:graphicData>
            </a:graphic>
        </wp:inline>
    </w:drawing>
</w:r>
```

### Relationship Definition

In `word/_rels/document.xml.rels`:

```xml
<Relationship Id="rId4" 
              Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
              Target="media/image1.png"/>
```

## Floating Images

### Anchor Structure

```xml
<w:drawing>
    <wp:anchor distT="0" distB="0" distL="114300" distR="114300" 
               simplePos="0" relativeHeight="251658240" 
               behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">
        
        <!-- Position relative to paragraph -->
        <wp:simplePos x="0" y="0"/>
        
        <!-- Horizontal positioning -->
        <wp:positionH relativeFrom="column">
            <wp:posOffset>1270000</wp:posOffset>
        </wp:positionH>
        
        <!-- Vertical positioning -->
        <wp:positionV relativeFrom="paragraph">
            <wp:posOffset>635000</wp:posOffset>
        </wp:positionV>
        
        <!-- Size -->
        <wp:extent cx="2286000" cy="1714500"/>
        
        <!-- Text wrapping -->
        <wp:wrapSquare wrapText="bothSides"/>
        
        <!-- Same graphic content as inline -->
        <a:graphic>...</a:graphic>
    </wp:anchor>
</w:drawing>
```

### Positioning Options

#### Horizontal Position (`relativeFrom`):
- `character` - Relative to character
- `column` - Relative to column
- `insideMargin` - Inside margin
- `leftMargin` - Left margin
- `margin` - Page margins
- `outsideMargin` - Outside margin
- `page` - Entire page
- `rightMargin` - Right margin

#### Vertical Position (`relativeFrom`):
- `bottomMargin` - Bottom margin
- `insideMargin` - Inside margin
- `line` - Line of text
- `margin` - Page margins
- `outsideMargin` - Outside margin
- `page` - Entire page
- `paragraph` - Paragraph
- `topMargin` - Top margin

### Text Wrapping Options

```xml
<!-- Square wrapping -->
<wp:wrapSquare wrapText="bothSides"/>

<!-- Tight wrapping -->
<wp:wrapTight wrapText="bothSides">
    <wp:wrapPolygon>
        <wp:start x="0" y="0"/>
        <wp:lineTo x="21600" y="0"/>
        <wp:lineTo x="21600" y="21600"/>
        <wp:lineTo x="0" y="21600"/>
    </wp:wrapPolygon>
</wp:wrapTight>

<!-- Top and bottom only -->
<wp:wrapTopAndBottom/>

<!-- No wrapping (behind/in front) -->
<wp:wrapNone/>

<!-- Through (text over image) -->
<wp:wrapThrough wrapText="bothSides">
    <wp:wrapPolygon>...</wp:wrapPolygon>
</wp:wrapThrough>
```

## Image Properties

### Size and Units

Sizes in drawings use EMUs (English Metric Units):
- 1 inch = 914,400 EMUs
- 1 cm = 360,000 EMUs
- 1 pt = 12,700 EMUs

```xml
<!-- 3 inches wide, 2 inches tall -->
<wp:extent cx="2743200" cy="1828800"/>
```

### Image Effects

```xml
<pic:spPr>
    <!-- Rotation -->
    <a:xfrm rot="2700000">  <!-- 45 degrees (60000 units = 1 degree) -->
        <a:off x="0" y="0"/>
        <a:ext cx="2286000" cy="1714500"/>
    </a:xfrm>
    
    <!-- Preset geometry -->
    <a:prstGeom prst="roundRect">
        <a:avLst>
            <a:gd name="adj" fmla="val 10000"/>
        </a:avLst>
    </a:prstGeom>
    
    <!-- Effects -->
    <a:effectLst>
        <!-- Shadow -->
        <a:outerShdw blurRad="50800" dist="38100" dir="2700000">
            <a:srgbClr val="000000">
                <a:alpha val="40000"/>
            </a:srgbClr>
        </a:outerShdw>
    </a:effectLst>
</pic:spPr>
```

### Cropping

```xml
<pic:blipFill>
    <a:blip r:embed="rId4"/>
    <a:srcRect l="10000" t="10000" r="10000" b="10000"/>  <!-- 10% crop on all sides -->
    <a:stretch>
        <a:fillRect/>
    </a:stretch>
</pic:blipFill>
```

## Image Formats

Common supported formats:
- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)
- GIF (`.gif`)
- BMP (`.bmp`)
- TIFF (`.tif`, `.tiff`)
- WMF/EMF (Windows metafiles)
- SVG (in newer versions)

## Alternative Text

```xml
<wp:docPr id="1" name="Picture 1" descr="A landscape photo showing mountains">
    <a:extLst>
        <a:ext uri="{C183D7F6-B498-43B3-948B-1728B52AA6E4}">
            <wp15:webVideoPr embeddedHtml="..."/>
        </a:ext>
    </a:extLst>
</wp:docPr>
```

## Charts and SmartArt

### Chart Reference

```xml
<w:drawing>
    <wp:inline>
        <a:graphic>
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">
                <c:chart r:id="rId5"/>
            </a:graphicData>
        </a:graphic>
    </wp:inline>
</w:drawing>
```

The chart definition is stored in a separate file (e.g., `word/charts/chart1.xml`).

### SmartArt

```xml
<w:drawing>
    <wp:inline>
        <a:graphic>
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/diagram">
                <dgm:relIds r:dm="rId6" r:lo="rId7" r:qs="rId8" r:cs="rId9"/>
            </a:graphicData>
        </a:graphic>
    </wp:inline>
</w:drawing>
```

## Video and Audio

Modern DOCX can embed video/audio with fallback images:

```xml
<pic:nvPicPr>
    <pic:cNvPr id="1" name="Video">
        <a:extLst>
            <a:ext uri="{C809E66F-F1BF-436E-b5F7-EEA9579F0CBA}">
                <wp15:media r:embed="rId10"/>
            </a:ext>
        </a:extLst>
    </pic:cNvPr>
</pic:nvPicPr>
```

## Parsing Considerations

### Image Extraction

1. **Find References**: Look for `r:embed` or `r:id` attributes
2. **Resolve Relationships**: Check `document.xml.rels` for targets
3. **Extract Binary**: Read image data from `word/media/`
4. **Handle Missing**: Gracefully handle missing images

### Size Calculations

```javascript
// Convert EMUs to pixels (assuming 96 DPI)
function emuToPixels(emu) {
    return Math.round(emu * 96 / 914400);
}

// Convert EMUs to inches
function emuToInches(emu) {
    return emu / 914400;
}
```

### Positioning Logic

For floating images:
1. Calculate anchor position relative to specified element
2. Apply offset values
3. Handle text wrapping boundaries
4. Respect z-order (relativeHeight)

## Common Issues

1. **Missing Images**: Relationship exists but image file is missing
2. **Corrupt Images**: Invalid image data in media folder
3. **Size Mismatch**: Extent doesn't match actual image dimensions
4. **Invalid EMUs**: Incorrect unit conversions
5. **Broken Relationships**: Incorrect relationship IDs

## Performance Optimization

1. **Lazy Loading**: Load images only when needed
2. **Caching**: Cache decoded image data
3. **Thumbnails**: Generate thumbnails for large images
4. **Format Conversion**: Convert to web-friendly formats
5. **Compression**: Compress images appropriately

## Best Practices

1. **Validate Relationships**: Always check relationship exists
2. **Handle Formats**: Support common image formats
3. **Respect Size**: Use specified dimensions, not actual
4. **Alt Text**: Extract and use alternative text
5. **Error Handling**: Provide placeholder for missing images

## Layout Considerations

### Inline Images
- Treat as large character in text flow
- Affects line height
- Can break across pages

### Floating Images
- Calculate position based on anchors
- Handle text wrapping
- May overlap other content
- Z-order matters

### Text Wrapping Impact
- Square: Rectangular boundary
- Tight: Follow image contours
- Through: Text can appear over image
- Top/Bottom: No text beside image
- None: Image behind/in front of text