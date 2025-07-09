# shared-commonSimpleTypes.xsd

Documentation for the `shared-commonSimpleTypes.xsd` schema.

## Shared Simple Types (shared-commonSimpleTypes.xsd)

### Core Data Types

OOXML defines fundamental data types used across all schemas:

#### Boolean and On/Off (ST_OnOff)
```xml
<!-- ST_OnOff is a union of xsd:boolean -->
<w:b w:val="true"/>      <!-- Explicit boolean -->
<w:b/>                   <!-- Empty element = true -->
<w:b w:val="false"/>     <!-- Explicit false -->
<w:b w:val="0"/>         <!-- Zero = false -->
<w:b w:val="1"/>         <!-- Non-zero = true -->
```

#### Measurement Units

**ST_TwipsMeasure** - Union of numbers and universal measures:
```xml
<w:spacing w:before="240"/>    <!-- Raw twips -->
<w:spacing w:before="12pt"/>   <!-- Universal measure -->
```

**ST_UniversalMeasure** - Pattern: `-?[0-9]+(\.[0-9]+)?(mm|cm|in|pt|pc|pi)`
```xml
<w:ind w:left="0.5in"/>       <!-- Inches -->
<w:ind w:left="1.27cm"/>      <!-- Centimeters -->
<w:ind w:left="36pt"/>        <!-- Points -->
<w:ind w:left="3pc"/>         <!-- Picas -->
```

**ST_PositiveUniversalMeasure** - Same pattern but positive values only

#### Percentage Types

**ST_Percentage** - Pattern: `-?[0-9]+(\.[0-9]+)?%`
```xml
<w:tblW w:w="50%" w:type="pct"/>    <!-- Table width percentage -->
```

**ST_FixedPercentage** - Limited to 0-100%
**ST_PositivePercentage** - Positive percentages only

#### Numeric Types

**ST_UnsignedDecimalNumber** - Based on `xsd:unsignedLong`
```xml
<w:numId w:val="1"/>          <!-- List numbering ID -->
```

### Text Content (CT_Text)

Text elements have specific whitespace handling:

```xml
<xsd:complexType name="CT_Text">
  <xsd:simpleContent>
    <xsd:extension base="s:ST_String">
      <xsd:attribute ref="xml:space" use="optional"/>
    </xsd:extension>
  </xsd:simpleContent>
</xsd:complexType>
```

**Key points:**
- Text content is a string with optional `xml:space` attribute
- `xml:space="preserve"` indicates whitespace should be preserved
- Default behavior collapses multiple spaces
