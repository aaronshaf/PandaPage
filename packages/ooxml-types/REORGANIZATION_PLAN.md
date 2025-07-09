# OOXML Types Package Reorganization Plan

## Current Issues
1. **Large monolithic files** (dml-main.ts: 2840 lines, wml.ts: 1713 lines, etc.)
2. **TypeScript errors** (duplicate identifiers, missing references)
3. **No clear organization** matching OOXML schema structure
4. **Missing schema documentation** and annotations

## Proposed Structure

### Phase 1: Analyze and Map Schema Dependencies
- Map XSD files to TypeScript modules
- Identify circular dependencies
- Document schema relationships

### Phase 2: Create Module Structure
```
packages/ooxml-types/src/
├── index.ts                    # Main export
├── shared/                     # Shared types from shared-*.xsd
│   ├── common-types.ts         # From shared-commonSimpleTypes.xsd
│   ├── relationship-types.ts   # From shared-relationshipReference.xsd
│   ├── bibliography-types.ts   # From shared-bibliography.xsd
│   ├── math-types.ts          # From shared-math.xsd
│   └── variant-types.ts       # From shared-documentPropertiesVariantTypes.xsd
├── dml/                       # DrawingML types from dml-*.xsd
│   ├── index.ts              # DML exports
│   ├── core/                 # Core DML types
│   │   ├── coordinate-types.ts
│   │   ├── extension-types.ts
│   │   └── base-types.ts
│   ├── colors/               # Color-related types
│   │   ├── color-types.ts
│   │   ├── color-transforms.ts
│   │   └── color-schemes.ts
│   ├── geometry/             # Geometry and shapes
│   │   ├── shape-types.ts
│   │   ├── path-types.ts
│   │   └── transform-types.ts
│   ├── text/                 # Text-related types
│   │   ├── text-types.ts
│   │   ├── text-properties.ts
│   │   └── text-styles.ts
│   ├── effects/              # Effects and styles
│   │   ├── effect-types.ts
│   │   ├── fill-types.ts
│   │   └── line-types.ts
│   ├── media/                # Media types
│   │   └── media-types.ts
│   ├── chart/                # From dml-chart.xsd
│   │   └── chart-types.ts
│   ├── diagram/              # From dml-diagram.xsd
│   │   └── diagram-types.ts
│   └── drawing/              # Drawing-specific
│       ├── wordprocessing-drawing.ts
│       └── spreadsheet-drawing.ts
├── wml/                      # WordprocessingML from wml.xsd
│   ├── index.ts
│   ├── document-types.ts     # Document structure
│   ├── paragraph-types.ts    # Paragraph properties
│   ├── run-types.ts         # Character run properties
│   ├── table-types.ts       # Table types
│   ├── style-types.ts       # Style definitions
│   ├── numbering-types.ts   # List numbering
│   └── section-types.ts     # Section properties
├── sml/                      # SpreadsheetML from sml.xsd
│   ├── index.ts
│   ├── workbook-types.ts
│   ├── worksheet-types.ts
│   ├── cell-types.ts
│   └── style-types.ts
├── pml/                      # PresentationML from pml.xsd
│   ├── index.ts
│   ├── presentation-types.ts
│   ├── slide-types.ts
│   └── animation-types.ts
└── utility/                  # Utility types and functions
    ├── type-guards.ts
    ├── conversions.ts
    └── string-unions.ts
```

### Phase 3: Split Large Files
1. **dml-main.ts** → Split into ~15 files (max 200 lines each)
2. **wml.ts** → Split into ~10 files (max 200 lines each)
3. **spreadsheet-types.ts** → Split into ~10 files
4. **presentation-types.ts** → Split into ~8 files
5. **chart-types.ts** → Split into ~7 files

### Phase 4: Fix TypeScript Errors
1. Remove duplicate enum values
2. Fix circular dependencies with proper imports
3. Add missing type definitions
4. Ensure all imports are correct

### Phase 5: Enhance Documentation
1. Add JSDoc comments from XSD annotations
2. Include ECMA-376 references
3. Add usage examples
4. Document relationships between types

### Phase 6: Update Integration
1. Update parser imports gradually
2. Test each module independently
3. Ensure backward compatibility where needed
4. Add migration guide

## Implementation Order
1. Create directory structure
2. Split shared types first (smallest, most depended upon)
3. Split DML types (core → colors → geometry → text → effects)
4. Split WML types (most used by parser)
5. Split SML and PML types
6. Fix all TypeScript errors
7. Update parser integration
8. Add comprehensive tests

## File Size Guidelines
- **Target**: 200-300 lines per file
- **Maximum**: 500 lines per file
- **Exceptions**: Only for cohesive type groups that cannot be split

## Success Criteria
- [ ] No files over 700 lines
- [ ] Zero TypeScript errors
- [ ] Clear module organization
- [ ] Comprehensive documentation
- [ ] All parser tests passing
- [ ] Performance maintained or improved