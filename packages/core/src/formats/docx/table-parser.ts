import { Effect } from "effect";
import { debug } from "../../common/debug";
import { parseParagraph } from "./docx-reader";
import {
  validateTableProperties,
  validateTableRowProperties,
  validateTableCellProperties,
} from "./validation";
import type {
  DocxTable,
  DocxTableRow,
  DocxTableCell,
  DocxTableProperties,
  DocxTableRowProperties,
  DocxTableCellProperties,
  DocxParagraph,
} from "./types";
import { DocxParseError } from "./types";

/**
 * Parse a table element from DOCX XML
 */
export const parseTableEnhanced = (tblElement: Element): Effect.Effect<DocxTable, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing table element");

    const rows: DocxTableRow[] = [];
    // Use getElementsByTagName for better namespace support
    const trElementsLower = Array.from(tblElement.getElementsByTagName("tr"));
    const trElementsUpper = Array.from(tblElement.getElementsByTagName("W:TR"));
    const trElements = [...trElementsLower, ...trElementsUpper];

    for (const trElement of trElements) {
      const row = yield* parseTableRowEnhanced(trElement);
      rows.push(row);
    }

    // Parse table properties if present
    const tblPr = tblElement.querySelector("tblPr, w\\:tblPr");
    const rawProperties = tblPr ? yield* parseTableProperties(tblPr) : undefined;
    const properties = rawProperties ? yield* validateTableProperties(rawProperties) : undefined;

    return {
      type: "table" as const,
      rows,
      properties,
    };
  });

/**
 * Parse a table row element
 */
export const parseTableRowEnhanced = (
  trElement: Element,
): Effect.Effect<DocxTableRow, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing table row");

    const cells: DocxTableCell[] = [];
    const tcElements = trElement.querySelectorAll("tc, w\\:tc");

    for (const tcElement of tcElements) {
      const cell = yield* parseTableCellEnhanced(tcElement);
      cells.push(cell);
    }

    // Parse row properties if present
    const trPr = trElement.querySelector("trPr, w\\:trPr");
    const rawProperties = trPr ? yield* parseTableRowProperties(trPr) : undefined;
    const properties = rawProperties ? yield* validateTableRowProperties(rawProperties) : undefined;

    return {
      cells,
      properties,
    };
  });

/**
 * Parse a table cell element
 */
export const parseTableCellEnhanced = (
  tcElement: Element,
): Effect.Effect<DocxTableCell, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing table cell");

    const content: DocxParagraph[] = [];
    const pElements = tcElement.querySelectorAll("p, w\\:p");

    for (const pElement of pElements) {
      try {
        const paragraph = parseParagraph(pElement);
        content.push(paragraph);
      } catch (error) {
        debug.log("Failed to parse paragraph in table cell:", error);
        // Continue with other paragraphs
      }
    }

    // Parse cell properties if present
    const tcPr = tcElement.querySelector("tcPr, w\\:tcPr");
    const rawProperties = tcPr ? yield* parseTableCellProperties(tcPr) : undefined;
    const properties = rawProperties
      ? yield* validateTableCellProperties(rawProperties)
      : undefined;

    return {
      content,
      properties,
    };
  });

/**
 * Parse table properties
 */
export const parseTableProperties = (
  tblPr: Element,
): Effect.Effect<DocxTableProperties, DocxParseError> =>
  Effect.gen(function* () {
    const properties: DocxTableProperties = {};

    // Parse table width
    const tblW = tblPr.querySelector("tblW, w\\:tblW");
    if (tblW) {
      const w = tblW.getAttribute("w");
      const type = tblW.getAttribute("type");
      if (w && type) {
        properties.width = type === "pct" ? `${w}%` : `${w}px`;
      }
    }

    // Parse table alignment
    const jc = tblPr.querySelector("jc, w\\:jc");
    if (jc) {
      const val = jc.getAttribute("val");
      if (val === "left" || val === "center" || val === "right") {
        properties.alignment = val;
      }
    }

    // Parse table indentation (used for centering)
    const tblInd = tblPr.querySelector("tblInd, w\\:tblInd");
    if (tblInd) {
      const w = tblInd.getAttribute("w");
      const type = tblInd.getAttribute("type");
      if (w) {
        properties.indentation = type === "pct" ? `${w}%` : `${w}px`;
      }
    }

    // Parse table borders
    const tblBorders = tblPr.querySelector("tblBorders, w\\:tblBorders");
    if (tblBorders) {
      properties.borders = yield* parseTableBorders(tblBorders);
    }

    // Parse background color
    const shd = tblPr.querySelector("shd, w\\:shd");
    if (shd) {
      const fill = shd.getAttribute("fill");
      if (fill && fill !== "auto") {
        properties.backgroundColor = `#${fill}`;
      }
    }

    return properties;
  });

/**
 * Parse table row properties
 */
export const parseTableRowProperties = (
  trPr: Element,
): Effect.Effect<DocxTableRowProperties, DocxParseError> =>
  Effect.gen(function* () {
    const properties: DocxTableRowProperties = {};

    // Parse row height
    const trHeight = trPr.querySelector("trHeight, w\\:trHeight");
    if (trHeight) {
      const val = trHeight.getAttribute("val");
      if (val) {
        properties.height = `${val}px`;
      }
    }

    // Check if this is a header row
    const tblHeader = trPr.querySelector("tblHeader, w\\:tblHeader");
    if (tblHeader) {
      properties.isHeader = true;
    }

    return properties;
  });

/**
 * Parse table cell properties
 */
export const parseTableCellProperties = (
  tcPr: Element,
): Effect.Effect<DocxTableCellProperties, DocxParseError> =>
  Effect.gen(function* () {
    const properties: DocxTableCellProperties = {};

    // Parse cell width
    const tcW = tcPr.querySelector("tcW, w\\:tcW");
    if (tcW) {
      const w = tcW.getAttribute("w");
      const type = tcW.getAttribute("type");
      if (w && type) {
        properties.width = type === "pct" ? `${w}%` : `${w}px`;
      }
    }

    // Parse vertical alignment
    const vAlign = tcPr.querySelector("vAlign, w\\:vAlign");
    if (vAlign) {
      const val = vAlign.getAttribute("val");
      if (val === "top" || val === "center" || val === "bottom") {
        properties.alignment = val;
      }
    }

    // Parse cell borders
    const tcBorders = tcPr.querySelector("tcBorders, w\\:tcBorders");
    if (tcBorders) {
      properties.borders = yield* parseTableBorders(tcBorders);
    }

    // Parse background color
    const shd = tcPr.querySelector("shd, w\\:shd");
    if (shd) {
      const fill = shd.getAttribute("fill");
      if (fill && fill !== "auto") {
        properties.backgroundColor = `#${fill}`;
      }
    }

    return properties;
  });

/**
 * Parse table borders with validation
 */
const parseTableBorders = (
  bordersElement: Element,
): Effect.Effect<Record<string, string>, DocxParseError> =>
  Effect.gen(function* () {
    const borders: Record<string, string> = {};

    for (const side of ["top", "right", "bottom", "left"]) {
      const borderElement = bordersElement.querySelector(`${side}, w\\:${side}`);
      if (borderElement) {
        const val = borderElement.getAttribute("val");
        const sz = borderElement.getAttribute("sz");
        const color = borderElement.getAttribute("color");

        if (val && val !== "none") {
          let borderStyle = "solid";
          if (val === "dashed") borderStyle = "dashed";
          if (val === "dotted") borderStyle = "dotted";

          const width = sz ? `${Math.max(1, parseInt(sz) / 8)}px` : "1px";
          const borderColor = color && color !== "auto" ? `#${color}` : "#000000";

          borders[side] = `${width} ${borderStyle} ${borderColor}`;
        }
      }
    }

    return borders;
  });
