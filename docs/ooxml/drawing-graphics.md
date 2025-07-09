# DrawingML in DOCX

DrawingML is the XML-based graphics framework used in OOXML documents. In WordprocessingML, drawings are embedded within the document using specific elements that bridge WML and DrawingML.

## The `<w:drawing>` Element

The entry point for any graphic in a DOCX document is the `<w:drawing>` element, which is found inside a run (`<w:r>`). This element acts as a container for either an `inline` or `anchor` element, which defines the positioning of the graphic.

```xml
<w:r>
  <w:drawing>
    <!-- Contains either a <wp:inline> or <wp:anchor> element -->
  </w:drawing>
</w:r>
```

## Positioning: Inline vs. Anchor

There are two primary ways to position a graphic in a DOCX file.

### 1. Inline Graphics (`<wp:inline>`)

Inline graphics are treated like a single large character within a line of text. They flow with the content and affect the line height.

**Key Elements for an Inline Graphic:**

| Element | Description |
| --- | --- |
| `<wp:extent>` | Defines the size (width `cx` and height `cy`) of the graphic in **EMUs**. |
| `<wp:docPr>` | Non-visual properties for the drawing, such as an ID and a name. |
| `<a:graphic>` | The main container for the DrawingML object. |

**Example:**
```xml
<wp:inline distT="0" distB="0" distL="0" distR="0">
  <wp:extent cx="2743200" cy="1828800"/>
  <wp:docPr id="1" name="Picture 1"/>
  <a:graphic> ... </a:graphic>
</wp:inline>
```

### 2. Anchored Graphics (`<wp:anchor>`)

Anchored graphics are "floating." They are anchored to a position on the page and text can wrap around them. Their position is defined relative to page margins, columns, or paragraphs.

**Key Elements for an Anchored Graphic:**

| Element | Description |
| --- | --- |
| `<wp:positionH>` | Defines the horizontal position. |
| `<wp:positionV>` | Defines the vertical position. |
| `<wp:extent>` | The size of the graphic in EMUs. |
| `<wp:wrapSquare>` | Defines how text wraps around the graphic (e.g., `wrapSquare`, `wrapTight`, `wrapNone`). |
| `behindDoc` | An attribute that, if `true`, places the graphic behind the text. |

## The Graphic Object: `<a:graphic>`

Both inline and anchored drawings contain an `<a:graphic>` element. This is the container for the actual visual content.

```xml
<a:graphic xmlns:a="http://purl.oclc.org/ooxml/drawingml/main">
  <a:graphicData uri="http://purl.oclc.org/ooxml/drawingml/picture">
    <!-- The specific graphic type, e.g., a picture, goes here -->
  </a:graphicData>
</a:graphic>
```

The `uri` attribute of `<a:graphicData>` specifies the type of graphic. For images, this is typically `http://purl.oclc.org/ooxml/drawingml/picture`.

## Structure of a Picture

When the graphic is a picture, the `<a:graphicData>` element contains a `<pic:pic>` element.

### The `<pic:pic>` Element

This is the root element for a picture. It contains three main parts:

1.  **`<pic:nvPicPr>` (Non-Visual Picture Properties):** Contains metadata about the picture, such as its ID and name.
2.  **`<pic:blipFill>` (Blip Fill):** This is the most important part for rendering. It defines how the picture's bitmap (the "blip") fills the shape.
3.  **`<pic:spPr>` (Shape Properties):** Defines the geometry and appearance of the picture's container, including its size and position.

### The `<pic:blipFill>` and `<a:blip>`

The `<pic:blipFill>` contains an `<a:blip>` element. The `<a:blip>` element has an `r:embed` attribute, which contains the **relationship ID** that points to the actual image file (e.g., a PNG or JPEG) in the `word/media/` directory of the OOXML package.

## Complete Example: An Inline Image

Here is a complete, annotated example of an inline image:

```xml
<!-- 1. The Run: A container for text and drawings -->
<w:r>
  <!-- 2. The Drawing: The main container for a graphic -->
  <w:drawing>
    <!-- 3. Inline Positioning: The image flows with the text -->
    <wp:inline>
      <!-- 4. Extent: The size of the image in EMUs -->
      <wp:extent cx="2743200" cy="1828800"/>
      
      <!-- 5. Document Properties: Non-visual properties like ID and name -->
      <wp:docPr id="1" name="My Image"/>
      
      <!-- 6. Graphic Container: The main DrawingML object -->
      <a:graphic>
        <!-- 7. Graphic Data: Specifies that this is a picture -->
        <a:graphicData uri="http://purl.oclc.org/ooxml/drawingml/picture">
          
          <!-- 8. Picture Root: The main element for the picture -->
          <pic:pic>
            <!-- 9. Non-Visual Picture Properties -->
            <pic:nvPicPr>
              <pic:cNvPr id="0" name="Picture 1"/>
              <pic:cNvPicPr/>
            </pic:nvPicPr>
            
            <!-- 10. Blip Fill: Contains the reference to the image data -->
            <pic:blipFill>
              <!-- 11. Blip: The image bitmap. The r:embed attribute is the relationship ID -->
              <a:blip r:embed="rId4"/>
              <!-- 12. Stretch: Defines how the image fills the container -->
              <a:stretch>
                <a:fillRect/>
              </a:stretch>
            </pic:blipFill>
            
            <!-- 13. Shape Properties: Defines the geometry of the picture's container -->
            <pic:spPr>
              <a:xfrm>
                <a:off x="0" y="0"/>
                <a:ext cx="2743200" cy="1828800"/>
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

To render this image, a parser would:
1.  Read the `<wp:extent>` to get the size of the image.
2.  Find the `<a:blip>` element and get the value of the `r:embed` attribute (e.g., `"rId4"`).
3.  Look up this relationship ID in the `word/_rels/document.xml.rels` file to find the path to the image file (e.g., `media/image1.png`).
4.  Load the image from the specified path in the ZIP archive.
5.  Render the image at the specified size.
