# Tables

## Table Structure

### Complete Table Hierarchy

```xml
<w:tbl>
  <w:tblPr>                    <!-- Table properties -->
    <w:tblStyle w:val="..."/>  <!-- Table style -->
    <w:tblW w:w="..." w:type="..."/> <!-- Table width -->
    <w:jc w:val="..."/>        <!-- Table justification -->
    <w:tblBorders>             <!-- Table borders -->
      <w:top w:val="..." w:sz="..." w:color="..."/>
      <w:left w:val="..." w:sz="..." w:color="..."/>
      <w:bottom w:val="..." w:sz="..." w:color="..."/>
      <w:right w:val="..." w:sz="..." w:color="..."/>
      <w:insideH w:val="..." w:sz="..." w:color="..."/>
      <w:insideV w:val="..." w:sz="..." w:color="..."/>
    </w:tblBorders>
    <w:tblLook firstRow="1" lastRow="0" firstColumn="1" lastColumn="0" 
               noHBand="0" noVBand="1"/>
  </w:tblPr>
  
  <w:tblGrid>                  <!-- Column definitions -->
    <w:gridCol w:w="..."/>     <!-- Column width in twips -->
    <w:gridCol w:w="..."/>
  </w:tblGrid>
  
  <w:tr>                       <!-- Table row -->
    <w:trPr>                   <!-- Row properties -->
      <w:trHeight w:val="..." w:hRule="..."/>
      <w:tblHeader/>           <!-- Repeat as header row -->
      <w:cantSplit/>           <!-- Don't break row across pages -->
    </w:trPr>
    
    <w:tc>                     <!-- Table cell -->
      <w:tcPr>                 <!-- Cell properties -->
        <w:tcW w:w="..." w:type="..."/>  <!-- Cell width -->
        <w:gridSpan w:val="..."/>        <!-- Horizontal span -->
        <w:vMerge w:val="restart"/>      <!-- Vertical merge start -->
        <w:vAlign w:val="..."/>          <!-- Vertical alignment -->
        <w:tcBorders>                    <!-- Cell borders -->
          <!-- Border definitions -->
        </w:tcBorders>
        <w:shd w:val="..." w:color="..." w:fill="..."/> <!-- Cell shading -->
      </w:tcPr>
      
      <!-- Cell content: paragraphs -->
      <w:p>...</w:p>
    </w:tc>
  </w:tr>
</w:tbl>
```

### Table Layout Properties

**Table width types:**
- `auto` - Automatic width based on content
- `dxa` - Fixed width in twips
- `pct` - Percentage of container width

**Row height rules:**
- `auto` - Automatic height based on content
- `atLeast` - Minimum height, can grow
- `exact` - Fixed height, content clipped if necessary
