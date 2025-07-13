// Advanced field code parsing for DOCX
import type { DocxRun } from "./types";

/**
 * Field code types supported by the parser
 */
export type FieldCodeType =
  | "PAGE"
  | "NUMPAGES"
  | "REF"
  | "HYPERLINK"
  | "TOC"
  | "SEQ"
  | "STYLEREF"
  | "DATE"
  | "TIME"
  | "AUTHOR"
  | "TITLE"
  | "SUBJECT"
  | "KEYWORDS"
  | "COMMENTS"
  | "LASTSAVEDBY"
  | "FILENAME"
  | "FILESIZE"
  | "CREATEDATE"
  | "SAVEDATE"
  | "PRINTDATE"
  | "PAGEREF"
  | "NOTEREF"
  | "XE" // Index entry
  | "TC" // Table of contents entry
  | "FORMULA" // Table formulas like =sum(above)
  | "UNKNOWN";

/**
 * Parsed field code information
 */
export interface ParsedFieldCode {
  type: FieldCodeType;
  instruction: string;
  switches: Map<string, string | boolean>;
  arguments: string[];
  bookmarkRef?: string;
  sequenceName?: string;
  styleName?: string;
  hyperlink?: string;
  formula?: string; // Formula expression for table calculations
}

/**
 * Field code switch definitions
 * @internal Documentation of valid switches for each field type
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FIELD_SWITCHES: Record<string, string[]> = {
  REF: [
    "\\f", // Include footnote mark
    "\\h", // Insert as hyperlink
    "\\n", // Include note number
    "\\p", // Position relative to bookmark
    "\\r", // Include number in relative context
    "\\t", // Suppress non-delimiter text
    "\\w", // Include number in full context
  ],
  HYPERLINK: [
    "\\l", // Link to location in document
    "\\m", // Coordinates for image map
    "\\n", // Target is new window
    "\\o", // ScreenTip text
    "\\t", // Target frame
  ],
  TOC: [
    "\\a", // Include entries with no page numbers
    "\\b", // Include entries only from bookmark
    "\\c", // Include entries of type SEQ
    "\\d", // Separator between sequence and page numbers
    "\\f", // Include entries only from TC fields
    "\\h", // Include entries as hyperlinks
    "\\l", // Include entries only through level
    "\\n", // Omit page numbers
    "\\o", // Include entries only from outline levels
    "\\p", // Separator between entry and page number
    "\\s", // Include sequence number
    "\\t", // Use style names
    "\\u", // Include entries from outline levels
    "\\w", // Preserve tab entries
    "\\x", // Preserve newline entries
    "\\z", // Hide tab and page numbers in Web view
  ],
  SEQ: [
    "\\c", // Repeat most recent number
    "\\h", // Hide field result
    "\\n", // Insert next number
    "\\r", // Reset sequence number
    "\\s", // Reset at heading level
  ],
  STYLEREF: [
    "\\l", // Search from bottom of page upward
    "\\n", // Include paragraph number
    "\\p", // Position relative to style
    "\\r", // Include number in relative context
    "\\t", // Suppress non-delimiter text
    "\\w", // Include number in full context
  ],
  PAGEREF: [
    "\\h", // Insert as hyperlink
    "\\p", // Position relative to bookmark
  ],
};

/**
 * Parse a field instruction string into structured data
 * @param instruction - The raw field instruction (e.g., "REF _Ref12345678 \\h")
 * @returns Parsed field code information
 */
export function parseFieldInstruction(instruction: string): ParsedFieldCode {
  const trimmed = instruction.trim();

  // Check if this is a formula (starts with =)
  if (trimmed.startsWith("=")) {
    return {
      type: "FORMULA",
      instruction: trimmed,
      switches: new Map(),
      arguments: [],
      formula: trimmed,
    };
  }

  // Extract field type (first word)
  const parts = trimmed.split(/\s+/);
  const fieldType = parts[0]?.toUpperCase() || "";

  // Determine if this is a known field type
  const type: FieldCodeType = isKnownFieldType(fieldType)
    ? (fieldType as FieldCodeType)
    : "UNKNOWN";

  // Parse switches and arguments
  const switches = new Map<string, string | boolean>();
  const fieldArgs: string[] = [];

  // State for parsing
  let i = 1; // Start after field type
  let inQuotes = false;
  let currentToken = "";

  while (i < parts.length) {
    const part = parts[i];
    if (!part) {
      i++;
      continue;
    }

    // Handle quoted strings
    if (part.startsWith('"') && !inQuotes) {
      inQuotes = true;
      currentToken = part.substring(1);
      if (part.endsWith('"') && part.length > 1) {
        inQuotes = false;
        currentToken = currentToken.substring(0, currentToken.length - 1);
        fieldArgs.push(currentToken);
        currentToken = "";
      }
    } else if (inQuotes) {
      currentToken += " " + part;
      if (part.endsWith('"')) {
        inQuotes = false;
        currentToken = currentToken.substring(0, currentToken.length - 1);
        fieldArgs.push(currentToken);
        currentToken = "";
      }
    } else if (part.startsWith("\\")) {
      // This is a switch
      const switchName = part;
      // Check if next part is the switch value
      const nextPart = parts[i + 1];
      if (i + 1 < parts.length && nextPart && !nextPart.startsWith("\\")) {
        switches.set(switchName, nextPart);
        i++; // Skip the value
      } else {
        switches.set(switchName, true); // Boolean switch
      }
    } else {
      // Regular argument
      fieldArgs.push(part);
    }

    i++;
  }

  // Extract specific information based on field type
  const result: ParsedFieldCode = {
    type,
    instruction: trimmed,
    switches,
    arguments: fieldArgs,
  };

  // Type-specific parsing
  switch (type) {
    case "REF":
    case "PAGEREF":
    case "NOTEREF":
      if (fieldArgs.length > 0 && fieldArgs[0]) {
        result.bookmarkRef = fieldArgs[0];
      }
      break;

    case "HYPERLINK":
      if (switches.has("\\l")) {
        // Internal link to bookmark
        const bookmarkValue = switches.get("\\l") as string;
        // Remove quotes if present
        result.bookmarkRef = bookmarkValue
          ? bookmarkValue.replace(/^"(.+)"$/, "$1")
          : bookmarkValue;
      } else if (fieldArgs.length > 0 && fieldArgs[0]) {
        // External hyperlink
        result.hyperlink = fieldArgs[0].replace(/^"(.+)"$/, "$1");
      }
      break;

    case "SEQ":
      if (fieldArgs.length > 0 && fieldArgs[0]) {
        result.sequenceName = fieldArgs[0];
      }
      break;

    case "STYLEREF":
      if (fieldArgs.length > 0 && fieldArgs[0]) {
        result.styleName = fieldArgs[0].replace(/^"(.+)"$/, "$1");
      }
      break;
  }

  return result;
}

/**
 * Check if a field type is known
 */
function isKnownFieldType(fieldType: string): boolean {
  const knownTypes = [
    "PAGE",
    "NUMPAGES",
    "REF",
    "HYPERLINK",
    "TOC",
    "SEQ",
    "STYLEREF",
    "DATE",
    "TIME",
    "AUTHOR",
    "TITLE",
    "SUBJECT",
    "KEYWORDS",
    "COMMENTS",
    "LASTSAVEDBY",
    "FILENAME",
    "FILESIZE",
    "CREATEDATE",
    "SAVEDATE",
    "PRINTDATE",
    "PAGEREF",
    "NOTEREF",
    "XE",
    "TC",
    "FORMULA",
  ];
  return knownTypes.includes(fieldType);
}

/**
 * Create placeholder text for a field based on its type and context
 * @param fieldCode - Parsed field code
 * @param context - Additional context for generating placeholder
 * @returns Placeholder text
 */
export function createFieldPlaceholder(
  fieldCode: ParsedFieldCode,
  context?: {
    bookmarks?: Map<string, string>;
    sequences?: Map<string, number>;
    metadata?: any;
    currentDate?: Date;
  },
): string {
  switch (fieldCode.type) {
    case "PAGE":
      return "1"; // Page number placeholder

    case "NUMPAGES":
      return "1"; // Total pages placeholder

    case "REF":
    case "PAGEREF":
      if (fieldCode.bookmarkRef && context?.bookmarks?.has(fieldCode.bookmarkRef)) {
        const bookmarkText = context.bookmarks.get(fieldCode.bookmarkRef);
        return bookmarkText || `[${fieldCode.bookmarkRef}]`;
      }
      return `[${fieldCode.bookmarkRef || "REF"}]`;

    case "HYPERLINK":
      if (fieldCode.bookmarkRef) {
        return `[Link: ${fieldCode.bookmarkRef}]`;
      } else if (fieldCode.hyperlink) {
        return fieldCode.hyperlink;
      }
      return "[HYPERLINK]";

    case "SEQ":
      if (fieldCode.sequenceName && context?.sequences) {
        const current = context.sequences.get(fieldCode.sequenceName) || 0;
        const next = current + 1;
        context.sequences.set(fieldCode.sequenceName, next);
        return next.toString();
      }
      return "1";

    case "STYLEREF":
      return `[${fieldCode.styleName || "STYLEREF"}]`;

    case "TOC":
      return "[Table of Contents]";

    case "DATE":
    case "CREATEDATE":
    case "SAVEDATE":
    case "PRINTDATE":
      if (context?.currentDate) {
        return context.currentDate.toLocaleDateString();
      }
      return new Date().toLocaleDateString();

    case "TIME":
      if (context?.currentDate) {
        return context.currentDate.toLocaleTimeString();
      }
      return new Date().toLocaleTimeString();

    case "AUTHOR":
      return context?.metadata?.creator || "[Author]";

    case "TITLE":
      return context?.metadata?.title || "[Title]";

    case "SUBJECT":
      return context?.metadata?.subject || "[Subject]";

    case "KEYWORDS":
      return context?.metadata?.keywords || "[Keywords]";

    case "FILENAME":
      return "[Filename]";

    case "FORMULA":
      return evaluateFormula(fieldCode.formula || "", context);

    default:
      return `{${fieldCode.type}}`;
  }
}

/**
 * Evaluate a table formula expression
 * @param formula - The formula expression (e.g., "=sum(above)")
 * @param context - Context for evaluation
 * @returns Calculated result as string
 */
function evaluateFormula(
  formula: string,
  context?: {
    bookmarks?: Map<string, string>;
    sequences?: Map<string, number>;
    metadata?: any;
    currentDate?: Date;
    tableValues?: number[]; // Values from table cells for calculation
  },
): string {
  // Simple formula evaluation for common table formulas
  const cleanFormula = formula.toLowerCase().replace(/\s+/g, "");

  // Handle =sum(above) - sum all values above current cell
  if (cleanFormula.includes("sum(above)")) {
    if (context?.tableValues && context.tableValues.length > 0) {
      const sum = context.tableValues.reduce((total, value) => total + value, 0);
      return sum.toString();
    }
    return "0"; // Default if no values
  }

  // Handle =sum(left) - sum all values to the left of current cell
  if (cleanFormula.includes("sum(left)")) {
    if (context?.tableValues && context.tableValues.length > 0) {
      const sum = context.tableValues.reduce((total, value) => total + value, 0);
      return sum.toString();
    }
    return "0";
  }

  // Handle =sum(below) - sum all values below current cell
  if (cleanFormula.includes("sum(below)")) {
    if (context?.tableValues && context.tableValues.length > 0) {
      const sum = context.tableValues.reduce((total, value) => total + value, 0);
      return sum.toString();
    }
    return "0";
  }

  // Handle =sum(right) - sum all values to the right of current cell
  if (cleanFormula.includes("sum(right)")) {
    if (context?.tableValues && context.tableValues.length > 0) {
      const sum = context.tableValues.reduce((total, value) => total + value, 0);
      return sum.toString();
    }
    return "0";
  }

  // Handle =average(above), =count(above), etc.
  if (cleanFormula.includes("average(above)")) {
    if (context?.tableValues && context.tableValues.length > 0) {
      const sum = context.tableValues.reduce((total, value) => total + value, 0);
      const average = sum / context.tableValues.length;
      return average.toFixed(2);
    }
    return "0";
  }

  if (cleanFormula.includes("count(above)")) {
    return (context?.tableValues?.length || 0).toString();
  }

  // Simple arithmetic expressions like =A1+B1 (not implemented - would need cell references)
  if (cleanFormula.match(/^=\d+[+\-*/]\d+$/)) {
    try {
      // Basic arithmetic evaluation (be careful with eval!)
      const expression = cleanFormula.substring(1); // Remove =
      const result = Function(`"use strict"; return (${expression})`)();
      return result.toString();
    } catch {
      return formula; // Return original if evaluation fails
    }
  }

  // Default: return the formula as-is if we can't evaluate it
  return formula;
}

/**
 * Parse a field run with advanced field code support
 * @param fieldInstruction - The field instruction string
 * @param runProperties - Run properties element
 * @param ns - Namespace
 * @param context - Additional context for field resolution
 * @returns DocxRun with appropriate text and metadata
 */
export function parseAdvancedFieldRun(
  fieldInstruction: string,
  runProperties: Element | null,
  ns: string,
  context?: {
    bookmarks?: Map<string, string>;
    sequences?: Map<string, number>;
    metadata?: any;
    currentDate?: Date;
  },
): DocxRun | null {
  // Parse the field instruction
  const fieldCode = parseFieldInstruction(fieldInstruction);

  // Generate placeholder text
  const text = createFieldPlaceholder(fieldCode, context);

  // Parse run properties if available
  let fontSize: string | undefined;
  let fontFamily: string | undefined;
  let bold = false;
  let italic = false;
  let underline = false;
  let color: string | undefined;

  if (runProperties) {
    const szElement = runProperties.getElementsByTagNameNS(ns, "sz")[0];
    fontSize = szElement?.getAttribute("w:val") || undefined;

    const fontElement = runProperties.getElementsByTagNameNS(ns, "rFonts")[0];
    fontFamily = fontElement?.getAttribute("w:ascii") || undefined;

    bold = runProperties.getElementsByTagNameNS(ns, "b").length > 0;
    italic = runProperties.getElementsByTagNameNS(ns, "i").length > 0;
    underline = runProperties.getElementsByTagNameNS(ns, "u").length > 0;

    const colorElement = runProperties.getElementsByTagNameNS(ns, "color")[0];
    color = colorElement?.getAttribute("w:val") || undefined;
  }

  // Create the run with field metadata
  const run: DocxRun = {
    text,
    bold,
    italic,
    underline,
    fontSize,
    fontFamily,
    color,
    _fieldCode: fieldCode.type,
    _fieldInstruction: fieldCode.instruction,
  };

  // Add hyperlink if this is a HYPERLINK or REF field with \h switch
  if (fieldCode.type === "HYPERLINK" && fieldCode.hyperlink) {
    run.link = fieldCode.hyperlink;
  } else if (
    (fieldCode.type === "REF" || fieldCode.type === "PAGEREF") &&
    fieldCode.switches.has("\\h") &&
    fieldCode.bookmarkRef
  ) {
    run.link = `#${fieldCode.bookmarkRef}`;
    run._internalLink = true;
    run._bookmarkRef = fieldCode.bookmarkRef;
  }

  return run;
}
