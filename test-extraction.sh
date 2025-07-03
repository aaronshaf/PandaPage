#!/bin/bash

# Integration test script to verify PDF extraction matches expected markdown files

echo "Testing PDF-to-Markdown extraction..."

# Function to normalize markdown for comparison (remove trailing whitespace, etc.)
normalize_md() {
    sed 's/[[:space:]]*$//' | sed '/^$/d'
}

# Test sample1.pdf
echo -n "Testing sample1.pdf... "
RESULT1=$(bun parse-pdf.js examples/sample1.pdf | normalize_md)
EXPECTED1=$(cat examples/sample1.md | normalize_md)

if [ "$RESULT1" = "$EXPECTED1" ]; then
    echo "PASS ✓"
else
    echo "FAIL ✗"
    echo "Expected:"
    echo "$EXPECTED1"
    echo "Got:"
    echo "$RESULT1"
fi

# Test sample2.pdf
echo -n "Testing sample2.pdf... "
RESULT2=$(bun parse-pdf.js examples/sample2.pdf | normalize_md)
EXPECTED2=$(cat examples/sample2.md | normalize_md)

if [ "$RESULT2" = "$EXPECTED2" ]; then
    echo "PASS ✓"
else
    echo "FAIL ✗"
    echo "Expected:"
    echo "$EXPECTED2"
    echo "Got:"
    echo "$RESULT2"
fi

# Test sample3.pdf
echo -n "Testing sample3.pdf... "
RESULT3=$(bun parse-pdf.js examples/sample3.pdf | normalize_md)
EXPECTED3=$(cat examples/sample3.md | normalize_md)

if [ "$RESULT3" = "$EXPECTED3" ]; then
    echo "PASS ✓"
else
    echo "FAIL ✗"
    echo "Expected first 500 chars:"
    echo "$EXPECTED3" | head -c 500
    echo -e "\nGot first 500 chars:"
    echo "$RESULT3" | head -c 500
fi

echo -e "\nNote: These tests verify the expected output format."
echo "Currently, PDF text extraction needs proper stream decompression to work correctly."