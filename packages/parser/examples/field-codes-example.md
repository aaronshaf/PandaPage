# Advanced Field Code Support Examples

## What's Been Implemented

The DOCX parser now supports advanced field codes and cross-references. Here are the key improvements:

### 1. Supported Field Types

- **PAGE** - Page number placeholders
- **NUMPAGES** - Total page count
- **REF** - Cross-references to bookmarks
- **PAGEREF** - Page references to bookmarks
- **HYPERLINK** - Both external URLs and internal bookmark links
- **TOC** - Table of Contents markers
- **SEQ** - Sequence numbering (figures, tables, etc.)
- **STYLEREF** - References to styled text
- **DATE/TIME** - Date and time fields
- **AUTHOR/TITLE/SUBJECT** - Document metadata fields
- **FILENAME** - Document filename

### 2. Field Code Features

#### Cross-References (REF fields)
```
REF _Ref12345678 \h
```
- Supports bookmark references
- `\h` switch creates hyperlinks
- Resolves bookmark text when available

#### Hyperlinks
```
HYPERLINK "https://example.com"
HYPERLINK \l "bookmark1"
```
- External URLs
- Internal bookmark links with `\l` switch

#### Sequences
```
SEQ Figure \* ARABIC
SEQ Table \* ROMAN
```
- Named sequences (Figure, Table, etc.)
- Number formatting switches
- Automatic increment tracking

#### Style References
```
STYLEREF "Heading 1" \n
```
- References to styled text
- Various formatting switches

### 3. Implementation Details

#### Field Context
The parser now maintains a field context that includes:
- Bookmark mappings (ID/name to text)
- Sequence counters
- Document metadata
- Current date/time

#### Field Parsing Flow
1. Complex fields (`fldChar` begin/separate/end)
2. Simple fields (`fldSimple`)
3. Field instruction parsing with switch extraction
4. Placeholder text generation based on context

#### Integration Points
- Bookmarks are parsed first to build the context
- Field context is passed through paragraph parsing
- Cross-references can resolve bookmark text
- Internal links are marked for proper rendering

### 4. Usage Example

```typescript
import { parseDocxDocument } from '@browser-document-viewer/parser';

const buffer = await fetch('document.docx').then(r => r.arrayBuffer());
const parsed = await parseDocxDocument(buffer);

// Bookmarks are included as elements
const bookmarks = parsed.elements.filter(e => e.type === 'bookmark');

// Field codes in paragraphs have metadata
parsed.elements.forEach(element => {
  if (element.type === 'paragraph') {
    element.runs.forEach(run => {
      if (run._fieldCode) {
        console.log(`Field: ${run._fieldCode}`);
        console.log(`Instruction: ${run._fieldInstruction}`);
        if (run._internalLink) {
          console.log(`Links to bookmark: ${run._bookmarkRef}`);
        }
      }
    });
  }
});
```

### 5. Rendering Considerations

Renderers should:
- Handle `_internalLink` and `_bookmarkRef` for internal navigation
- Update PAGE/NUMPAGES placeholders with actual values
- Resolve cross-references during rendering
- Support bookmark anchors for deep linking

### 6. Future Enhancements

Potential improvements:
- IF/THEN/ELSE conditional fields
- INCLUDETEXT/INCLUDEPICTURE fields
- More date/time formatting options
- Custom field types
- Field update/refresh logic