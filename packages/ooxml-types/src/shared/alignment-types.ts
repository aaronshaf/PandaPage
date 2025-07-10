/**
 * Alignment Types used throughout OOXML
 * @see ECMA-376 Part 1, §22.9 (Shared Simple Types)
 */

/**
 * Vertical alignment for text runs.
 * @see ECMA-376 Part 1, §22.9.2.17 ST_VerticalAlignRun
 */
export enum ST_VerticalAlignRun {
  Baseline = "baseline",
  Superscript = "superscript",
  Subscript = "subscript",
}

/**
 * Horizontal alignment.
 * @see ECMA-376 Part 1, §22.9.2.18 ST_XAlign
 */
export enum ST_XAlign {
  Left = "left",
  Center = "center",
  Right = "right",
  Inside = "inside",
  Outside = "outside",
}

/**
 * Vertical alignment.
 * @see ECMA-376 Part 1, §22.9.2.19 ST_YAlign
 */
export enum ST_YAlign {
  Inline = "inline",
  Top = "top",
  Center = "center",
  Bottom = "bottom",
  Inside = "inside",
  Outside = "outside",
}
