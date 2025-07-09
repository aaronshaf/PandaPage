# @browser-document-viewer/ooxml-types

Shared TypeScript types and utilities for Office Open XML (OOXML) document processing.

## Overview

This package provides:
- Type definitions derived from OOXML schemas (ECMA-376)
- String literal unions for common OOXML enums
- Utility functions for measurement conversions
- Type guards for runtime validation

## Usage

### Import Types

```typescript
import type { 
  ST_Border,
  ST_Shd,
  ST_OnOff,
  BorderStyleString,
  ShadingPatternString,
  ParagraphAlignmentString
} from '@browser-document-viewer/ooxml-types';
```

### Use Utility Functions

```typescript
import { 
  twipsToPoints,
  halfPointsToPoints,
  toOoxmlAlignment,
  hexToRgb
} from '@browser-document-viewer/ooxml-types';

// Convert measurements
const points = twipsToPoints(240); // 12 points
const fontSize = halfPointsToPoints("24"); // 12 points

// Convert alignment values
const ooxmlAlign = toOoxmlAlignment('left'); // 'start'

// Color conversion
const rgb = hexToRgb('#FF0000'); // 'rgb(255, 0, 0)'
```

## Type Categories

### WordprocessingML (wml.ts)
- Document structure types
- Text formatting enums (ST_Border, ST_Shd, ST_Underline)
- Paragraph and character properties

### DrawingML (dml-*.ts)
- Shape and drawing types
- Color and effect definitions
- Transform and positioning types

### Shared Types (shared-types.ts)
- Common types used across all OOXML formats
- ST_OnOff (boolean values)
- Relationship types
- Language codes

### Utility Types (utility-types.ts)
- String literal unions for enum compatibility
- Type guards for runtime validation
- Measurement conversion functions

## Measurement Units

OOXML uses various measurement units:
- **Twips**: 1/20 of a point (used for spacing, margins)
- **Half-points**: Font sizes
- **Eighth-points**: Border widths
- **EMUs**: English Metric Units (used for drawings)

Use the provided conversion functions to work with these units consistently.

## OOXML Alignment Values

OOXML uses different alignment values than CSS/HTML:
- `start` instead of `left`
- `end` instead of `right` 
- `both` instead of `justify`

The package provides conversion functions for compatibility.