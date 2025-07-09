# Office Math (OMML)

Office Math Markup Language (OMML) is the XML-based format for representing mathematical equations within OOXML documents. The schema for OMML is defined in `shared-math.xsd`.

## Core Equation Structure

Equations in a DOCX document are typically found within one of two main elements:

1.  **`<m:oMathPara>` (Office Math Paragraph):** This is a block-level element that acts as a paragraph container for one or more equations.
2.  **`<m:oMath>` (Office Math):** This element contains a single equation. It can be a child of `<m:oMathPara>` or appear inline within a regular text paragraph (`<w:p>`).

Inside an `<m:oMath>` element, the equation is built from a series of runs (`<m:r>`) and various mathematical constructs.

## Common Math Elements

Here are some of the most common elements used to build equations in OMML.

| Element | Description | Key Child Elements |
| --- | --- | --- |
| `<m:r>` | **Run.** A contiguous run of text with the same properties. Contains the text of the equation. | `<m:t>` |
| `<m:t>` | **Text.** Contains a piece of text, such as a number, variable, or operator. | (text content) |
| `<m:f>` | **Fraction.** Represents a fraction. | `<m:num>` (numerator), `<m:den>` (denominator) |
| `<m:sSup>` | **Superscript.** | `<m:e>` (base), `<m:sup>` (superscript) |
| `<m:sSub>` | **Subscript.** | `<m:e>` (base), `<m:sub>` (subscript) |
| `<m:sSubSup>` | **Subscript-Superscript.** | `<m:e>` (base), `<m:sub>`, `<m:sup>` |
| `<m:rad>` | **Radical.** Represents a square root or other root. | `<m:deg>` (degree), `<m:e>` (base) |
| `<m:nary>` | **N-ary Operator.** For operators like summation (∑) or integration (∫). | `<m:sub>`, `<m:sup>`, `<m:e>` |
| `<m:d>` | **Delimiter.** For enclosing content in parentheses, brackets, or braces. | `<m:begChr>`, `<m:endChr>`, `<m:e>` |

## Example: The Quadratic Formula

Here is how the quadratic formula, x = (-b ± √(b² - 4ac)) / 2a, would be represented in OMML.

```xml
<m:oMath>
  <!-- x = -->
  <m:r><m:t>x</m:t></m:r>
  <m:r><m:t>=</m:t></m:r>
  
  <!-- Fraction -->
  <m:f>
    <!-- Numerator: -b ± √(b² - 4ac) -->
    <m:num>
      <m:r><m:t>-b</m:t></m:r>
      <m:r><m:t>±</m:t></m:r>
      <!-- Radical (Square Root) -->
      <m:rad>
        <m:deg/> <!-- Empty degree for square root -->
        <m:e>
          <!-- Superscript: b² -->
          <m:sSup>
            <m:e><m:r><m:t>b</m:t></m:r></m:e>
            <m:sup><m:r><m:t>2</m:t></m:r></m:sup>
          </m:sSup>
          <m:r><m:t>-4ac</m:t></m:r>
        </m:e>
      </m:rad>
    </m:num>
    <!-- Denominator: 2a -->
    <m:den>
      <m:r><m:t>2a</m:t></m:r>
    </m:den>
  </m:f>
</m:oMath>
```

Parsing OMML requires recursively processing these elements and their arguments (`<m:e>`) to build up the final mathematical expression.
