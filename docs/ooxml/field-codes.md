# Field Codes in DOCX

## Overview

Field codes are dynamic elements in DOCX documents that display calculated or referenced values. They're used for page numbers, dates, cross-references, and more. Understanding field codes is crucial for accurate document rendering.

## Field Code Structure

### Basic Structure

```xml
<!-- Field begin -->
<w:r>
    <w:fldChar w:fldCharType="begin"/>
</w:r>

<!-- Field instruction -->
<w:r>
    <w:instrText xml:space="preserve"> PAGE \* MERGEFORMAT </w:instrText>
</w:r>

<!-- Field separator -->
<w:r>
    <w:fldChar w:fldCharType="separate"/>
</w:r>

<!-- Field result (cached value) -->
<w:r>
    <w:t>3</w:t>
</w:r>

<!-- Field end -->
<w:r>
    <w:fldChar w:fldCharType="end"/>
</w:r>
```

### Field Components

1. **Begin marker**: `<w:fldChar w:fldCharType="begin"/>`
2. **Instruction**: `<w:instrText>` containing field code
3. **Separator**: `<w:fldChar w:fldCharType="separate"/>`
4. **Result**: Cached/calculated value
5. **End marker**: `<w:fldChar w:fldCharType="end"/>`

## Common Field Types

### Page Numbering

```xml
<!-- Current page number -->
<w:instrText> PAGE </w:instrText>

<!-- Total pages -->
<w:instrText> NUMPAGES </w:instrText>

<!-- Section pages -->
<w:instrText> SECTIONPAGES </w:instrText>
```

### Date and Time

```xml
<!-- Current date -->
<w:instrText> DATE \@ "MM/dd/yyyy" </w:instrText>

<!-- Current time -->
<w:instrText> TIME \@ "HH:mm:ss" </w:instrText>

<!-- Creation date -->
<w:instrText> CREATEDATE \@ "MMMM d, yyyy" </w:instrText>

<!-- Save date -->
<w:instrText> SAVEDATE \@ "yyyy-MM-dd" </w:instrText>
```

### Document Information

```xml
<!-- Title -->
<w:instrText> TITLE </w:instrText>

<!-- Author -->
<w:instrText> AUTHOR </w:instrText>

<!-- File name -->
<w:instrText> FILENAME </w:instrText>

<!-- File size -->
<w:instrText> FILESIZE \# "0.0 KB" </w:instrText>
```

### References

```xml
<!-- Reference to bookmark -->
<w:instrText> REF BookmarkName </w:instrText>

<!-- Page reference -->
<w:instrText> PAGEREF BookmarkName </w:instrText>

<!-- Sequence number -->
<w:instrText> SEQ Figure \* ARABIC </w:instrText>
```

### Table of Contents

```xml
<!-- TOC field -->
<w:instrText> TOC \o "1-3" \h \z \u </w:instrText>
```

## Field Switches

### Format Switches

#### Numeric Format (`\#`)
```xml
<!-- Number formatting -->
<w:instrText> = 1234.5 \# "$#,##0.00" </w:instrText>
<!-- Result: $1,234.50 -->
```

#### Date-Time Format (`\@`)
```xml
<!-- Date formatting -->
<w:instrText> DATE \@ "dddd, MMMM d, yyyy" </w:instrText>
<!-- Result: Monday, January 15, 2024 -->
```

#### Text Format (`\*`)
```xml
<!-- Uppercase -->
<w:instrText> USERNAME \* UPPER </w:instrText>

<!-- Lowercase -->
<w:instrText> FILENAME \* LOWER </w:instrText>

<!-- First capital -->
<w:instrText> AUTHOR \* FIRSTCAP </w:instrText>

<!-- Title case -->
<w:instrText> TITLE \* CAPS </w:instrText>
```

### Common Format Patterns

#### Number Formats
- `0` - Digit placeholder
- `#` - Optional digit
- `.` - Decimal point
- `,` - Thousands separator
- `$` - Currency symbol

#### Date Formats
- `d` - Day (1-31)
- `dd` - Day (01-31)
- `ddd` - Day name (Mon)
- `dddd` - Day name (Monday)
- `M` - Month (1-12)
- `MM` - Month (01-12)
- `MMM` - Month name (Jan)
- `MMMM` - Month name (January)
- `yy` - Year (24)
- `yyyy` - Year (2024)

## Complex Fields

### Conditional Fields

```xml
<!-- IF field -->
<w:instrText> IF { PAGE } = 1 "First Page" "Other Pages" </w:instrText>
```

### Calculation Fields

```xml
<!-- Formula -->
<w:instrText> = SUM(ABOVE) </w:instrText>

<!-- Expression -->
<w:instrText> = { PAGE } * 2 + 1 </w:instrText>
```

### Nested Fields

```xml
<!-- Nested field example -->
<w:instrText> IF { PAGE } > { = { NUMPAGES } / 2 } "Second Half" "First Half" </w:instrText>
```

## Field Update Behavior

### Update Triggers

Fields can be updated:
- On document open
- Before printing
- Manually by user
- When referenced content changes

### Dirty Fields

```xml
<w:fldChar w:fldCharType="begin" w:dirty="true"/>
```

The `w:dirty` attribute indicates the field needs updating.

### Lock Fields

```xml
<w:fldChar w:fldCharType="begin" w:fldLock="true"/>
```

Locked fields won't update automatically.

## Special Considerations

### Fields in Headers/Footers

Fields in headers/footers often need context-aware evaluation:

```xml
<!-- Different first page -->
<w:headerReference w:type="first" r:id="rId4"/>

<!-- Odd/even pages -->
<w:headerReference w:type="even" r:id="rId5"/>
<w:headerReference w:type="default" r:id="rId6"/>
```

### Fields in SDT (Structured Document Tags)

```xml
<w:sdt>
    <w:sdtContent>
        <w:r>
            <w:fldChar w:fldCharType="begin"/>
        </w:r>
        <!-- ... field content ... -->
    </w:sdtContent>
</w:sdt>
```

## Parsing Strategy

### Basic Algorithm

1. **Scan for field start**: Look for `fldChar` with `fldCharType="begin"`
2. **Collect instruction**: Concatenate all `instrText` until separator
3. **Skip separator**: Find `fldCharType="separate"`
4. **Preserve result**: Keep cached result until `fldCharType="end"`
5. **Parse instruction**: Extract field type and parameters

### Implementation Example

```javascript
function parseField(runs) {
    let inField = false;
    let instruction = '';
    let skipValue = false;
    
    for (const run of runs) {
        const fldChar = run.querySelector('fldChar');
        if (fldChar) {
            const type = fldChar.getAttribute('w:fldCharType');
            
            switch (type) {
                case 'begin':
                    inField = true;
                    instruction = '';
                    break;
                case 'separate':
                    skipValue = true;
                    break;
                case 'end':
                    if (inField) {
                        return parseFieldInstruction(instruction);
                    }
                    inField = false;
                    skipValue = false;
                    break;
            }
        } else if (inField && !skipValue) {
            const instrText = run.querySelector('instrText');
            if (instrText) {
                instruction += instrText.textContent;
            }
        }
    }
}
```

## Field Evaluation

### Simple Fields

```javascript
function evaluateField(instruction, context) {
    const parts = instruction.trim().split(/\s+/);
    const fieldType = parts[0];
    
    switch (fieldType) {
        case 'PAGE':
            return context.currentPage.toString();
        case 'NUMPAGES':
            return context.totalPages.toString();
        case 'DATE':
            return formatDate(new Date(), parts);
        case 'TIME':
            return formatTime(new Date(), parts);
        case 'AUTHOR':
            return context.metadata.author || '';
        // ... more field types
    }
}
```

### Format Application

```javascript
function applyFormat(value, format) {
    if (format.startsWith('\\@')) {
        // Date format
        return formatDateTime(value, format.substring(2));
    } else if (format.startsWith('\\#')) {
        // Number format
        return formatNumber(value, format.substring(2));
    } else if (format.startsWith('\\*')) {
        // Text format
        return formatText(value, format.substring(2));
    }
    return value;
}
```

## Common Issues

1. **Incomplete Fields**: Missing end marker
2. **Nested Fields**: Complex parsing of fields within fields
3. **Invalid Instructions**: Malformed field codes
4. **Missing Context**: Fields requiring document metadata
5. **Update Timing**: When to calculate vs. use cached values

## Best Practices

1. **Preserve Structure**: Keep field markers during parsing
2. **Cache Results**: Store calculated values for performance
3. **Context Awareness**: Pass appropriate context for evaluation
4. **Error Handling**: Gracefully handle invalid fields
5. **Format Support**: Implement common format switches
6. **Update Logic**: Respect dirty and lock flags

## Performance Considerations

1. **Lazy Evaluation**: Only calculate when displayed
2. **Batch Processing**: Update related fields together
3. **Context Caching**: Reuse document context
4. **Format Caching**: Cache parsed format strings
5. **Result Caching**: Store calculated values when appropriate