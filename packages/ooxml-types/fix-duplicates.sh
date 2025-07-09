#!/bin/bash
# Script to remove duplicate type definitions in dml-main.ts

FILE="src/dml-main.ts"

# Find all duplicate enums and remove the second occurrence
echo "Removing duplicate enums..."

# List of duplicate enums to remove (based on TypeScript errors)
DUPLICATE_ENUMS=(
    "ST_TextVerticalType"
    "ST_TextVerticalOverflowType"
    "ST_TextHorizontalOverflowType"
    "ST_TextAnchoringType"
    "ST_TextWrappingType"
    "ST_TextBulletScheme"
    "ST_TextAlignType"
    "ST_TextFontAlignType"
    "ST_TextTabAlignType"
    "ST_TextUnderlineType"
    "ST_TextStrikeType"
    "ST_TextCapsType"
    "ST_PresetLineDashType"
    "ST_LineEndType"
    "ST_LineEndLength"
    "ST_LineEndWidth"
    "ST_LineCap"
    "ST_CompoundLine"
    "ST_PenAlignment"
)

# Create a backup
cp "$FILE" "$FILE.bak"

# For each duplicate enum, find all occurrences and remove duplicates
for ENUM in "${DUPLICATE_ENUMS[@]}"; do
    echo "Processing $ENUM..."
    
    # Get line numbers of all occurrences
    LINES=$(grep -n "^export enum $ENUM {" "$FILE" | cut -d: -f1)
    LINE_COUNT=$(echo "$LINES" | wc -w)
    
    if [ "$LINE_COUNT" -gt 1 ]; then
        echo "Found $LINE_COUNT occurrences of $ENUM"
        
        # Keep the first occurrence, remove others
        FIRST_LINE=$(echo "$LINES" | awk '{print $1}')
        OTHER_LINES=$(echo "$LINES" | awk '{for(i=2;i<=NF;i++) print $i}')
        
        for LINE in $OTHER_LINES; do
            echo "Removing duplicate at line $LINE"
            # Find the closing brace for this enum
            END_LINE=$(awk -v start="$LINE" 'NR >= start && /^}$/ {print NR; exit}' "$FILE")
            
            if [ -n "$END_LINE" ]; then
                # Delete from enum start to closing brace
                sed -i "${LINE},${END_LINE}d" "$FILE"
            fi
        done
    fi
done

echo "Duplicate removal complete!"