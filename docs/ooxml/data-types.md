# OOXML Data Types

This document outlines the common data types used throughout the OOXML schemas, based on `shared-commonSimpleTypes.xsd` and `wml.xsd`. Understanding these types is essential for parsing and interpreting OOXML documents.

## Measurement Units

OOXML uses several units for measurements, and it's crucial to handle them correctly.

| Type | Definition | XML Type | C# Type | TypeScript Type |
| --- | --- | --- | --- | --- |
| **Twips** | A twentieth of a point (1/1440th of an inch). This is the primary unit for page layout measurements like margins and indentation. | `s:ST_TwipsMeasure` | `int` | `number` |
| **Half-points** | A half-point (1/144th of an inch). Primarily used for font sizes. A value of `24` equals a 12pt font. | `w:ST_HpsMeasure` | `int` | `number` |
| **Eighth-points** | An eighth of a point (1/576th of an inch). Used for border sizes (`w:sz`). | `w:ST_EighthPointMeasure` | `int` | `number` |
| **Universal Measure** | A string that represents a measurement with a unit, such as `10.5pt` or `2cm`. | `s:ST_UniversalMeasure` | `string` | `string` |
| **Percentage** | A string representing a percentage, e.g., `50%`. | `s:ST_Percentage` | `string` | `string` |

## Basic Types

| Type | Description | XML Type | C# Type | TypeScript Type |
| --- | --- | --- | --- | --- |
| **On/Off** | A boolean value that can be represented as `true`, `false`, `1`, `0`, `on`, or `off`. | `s:ST_OnOff` | `bool` | `boolean` |
| **String** | A standard string of text. | `s:ST_String` | `string` | `string` |
| **Hex Color** | A 3-byte hex value representing an RGB color (e.g., `FF0000`). Can also be `"auto"`. | `s:ST_HexColorRGB`, `w:ST_HexColor` | `string` | `string` |
| **Decimal Number** | An integer value. | `w:ST_DecimalNumber` | `int` | `number` |
| **Unsigned Decimal** | An unsigned integer value. | `s:ST_UnsignedDecimalNumber` | `uint` | `number` |
| **Language Code** | A language identifier string, e.g., "en-US". | `s:ST_Lang` | `string` | `string` |
| **GUID** | A Globally Unique Identifier in the format `{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}`. | `s:ST_Guid` | `Guid` | `string` |

## Enumerations (Enums)

OOXML heavily uses enumerations to define a set of possible values for an attribute. Here are some of the most common ones from `wml.xsd`:

| Enum | Purpose | Example Values |
| --- | --- | --- |
| `ST_Jc` | Justification/alignment for paragraphs. | `start`, `center`, `end`, `both` |
| `ST_Underline` | The type of underline for text. | `single`, `double`, `dotted`, `wave` |
| `ST_HighlightColor` | The color for text highlighting. | `yellow`, `green`, `red`, `none` |
| `ST_Border` | The style of a border. | `single`, `double`, `thick`, `dashed` |
| `ST_HeightRule` | Rule for calculating row or line height. | `auto`, `exact`, `atLeast` |
| `ST_BrType` | The type of break. | `page`, `column`, `textWrapping` |
| `ST_PageOrientation` | The orientation of a page. | `portrait`, `landscape` |
| `ST_NumberFormat` | The format for a numbered list. | `decimal`, `lowerRoman`, `upperLetter` |
| `ST_VerticalAlignRun` | Vertical alignment for a run of text. | `baseline`, `superscript`, `subscript` |
