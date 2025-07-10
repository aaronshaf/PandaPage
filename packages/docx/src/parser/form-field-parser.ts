import { Effect } from "effect";
import { debug } from "@browser-document-viewer/shared-utils/debug";
import { DocxParseError } from "../reader/docx-reader";
import { parseXmlString } from "@browser-document-viewer/shared-utils/xml";
import type { DocxField } from "../types";

// Re-export DocxField for backwards compatibility
export type { DocxField };

/**
 * Field codes commonly found in DOCX files
 */
export enum FieldCode {
  FORMTEXT = "FORMTEXT",
  FORMCHECKBOX = "FORMCHECKBOX",
  FORMDROPDOWN = "FORMDROPDOWN",
  PAGE = "PAGE",
  NUMPAGES = "NUMPAGES",
  DATE = "DATE",
  TIME = "TIME",
  FILENAME = "FILENAME",
  AUTHOR = "AUTHOR",
  TITLE = "TITLE",
  SUBJECT = "SUBJECT",
  KEYWORDS = "KEYWORDS",
  REF = "REF",
  HYPERLINK = "HYPERLINK",
  TOC = "TOC",
}

// Using DocxField from types - ensure instruction is defined when creating fields

/**
 * Field parsing state
 */
interface FieldParsingState {
  isInField: boolean;
  fieldStart: boolean;
  fieldSeparator: boolean;
  fieldEnd: boolean;
  instruction: string;
  result: string;
  nestedLevel: number;
}

/**
 * Parse field instruction text to extract field type and properties
 */
export const parseFieldInstruction = (instruction: string): DocxField => {
  const trimmed = instruction.trim();
  debug.log(`Parsing field instruction: ${trimmed}`);

  // Extract the field type (first word)
  const typeMatch = trimmed.match(/^(\w+)/);
  const fieldType = typeMatch?.[1] ? typeMatch[1].toUpperCase() : "UNKNOWN";

  // Parse field properties
  const properties: Record<string, string> = {};

  // Common patterns for field switches - handle special characters in switch names
  const switchPattern = /\\([*@#\w]+)\s*(?:"([^"]+)"|([^\s\\]+))?/g;
  let match;
  while ((match = switchPattern.exec(trimmed)) !== null) {
    const switchName = match[1];
    if (switchName) {
      const switchValue = match[2] || match[3] || "true";
      properties[switchName] = switchValue;
    }
  }

  // Special handling for FORMTEXT fields
  if (fieldType === "FORMTEXT") {
    // Extract default text if present
    const defaultMatch = trimmed.match(/FORMTEXT\s+"([^"]+)"/);
    if (defaultMatch?.[1]) {
      properties.defaultText = defaultMatch[1];
    }
  }

  // Special handling for HYPERLINK fields
  if (fieldType === "HYPERLINK") {
    const urlMatch = trimmed.match(/HYPERLINK\s+"([^"]+)"/);
    if (urlMatch?.[1]) {
      properties.url = urlMatch[1];
    }
  }

  return {
    type: fieldType as FieldCode,
    instruction: trimmed,
    properties,
  };
};

/**
 * Parse field elements from paragraph XML using DOM parsing
 */
export const parseFieldsFromParagraph = (
  paragraphXml: string,
): Effect.Effect<DocxField[], DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing fields from paragraph with DOM parsing");

    const fields: DocxField[] = [];
    const state: FieldParsingState = {
      isInField: false,
      fieldStart: false,
      fieldSeparator: false,
      fieldEnd: false,
      instruction: "",
      result: "",
      nestedLevel: 0,
    };

    // Add namespace declarations if missing to ensure proper XML parsing
    let xmlContent = paragraphXml;
    if (!xmlContent.includes("xmlns:w=")) {
      xmlContent = xmlContent.replace(
        /<w:p([^>]*)>/,
        '<w:p$1 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">',
      );
    }

    // Parse XML with DOM parser
    const doc = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(
        (error) => new DocxParseError(`Failed to parse paragraph XML: ${error.message}`),
      ),
    );

    // Get all run elements using DOM traversal with namespace fallback
    const wordNamespaceURI = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    let runElements = doc.getElementsByTagNameNS(wordNamespaceURI, "r");

    // Fallback to getElementsByTagName if namespace approach doesn't work
    if (runElements.length === 0) {
      runElements = doc.getElementsByTagName("w:r");
    }

    // Process each run element
    for (const runElement of runElements) {
      // Check for field characters
      const fldCharElements = runElement.getElementsByTagName("w:fldChar");
      if (fldCharElements.length > 0) {
        const fldCharType = fldCharElements[0]?.getAttribute("w:fldCharType");

        if (fldCharType) {
          switch (fldCharType) {
            case "begin":
              if (state.isInField) {
                state.nestedLevel++;
              } else {
                state.isInField = true;
                state.fieldStart = true;
                state.instruction = "";
                state.result = "";
              }
              break;

            case "separate":
              if (state.isInField && state.nestedLevel === 0) {
                state.fieldSeparator = true;
              }
              break;

            case "end":
              if (state.nestedLevel > 0) {
                state.nestedLevel--;
              } else if (state.isInField) {
                state.fieldEnd = true;

                // Parse and store the field
                const field = parseFieldInstruction(state.instruction);
                if (state.result) {
                  field.result = state.result;
                }
                fields.push(field);

                // Reset state
                state.isInField = false;
                state.fieldStart = false;
                state.fieldSeparator = false;
                state.fieldEnd = false;
                state.instruction = "";
                state.result = "";
              }
              break;
          }
        }
      }

      // Extract instruction text
      const instrTextElements = runElement.getElementsByTagName("w:instrText");
      if (instrTextElements.length > 0 && state.isInField && !state.fieldSeparator) {
        for (const instrElement of instrTextElements) {
          const instrText = instrElement.textContent || "";
          state.instruction += instrText;
        }
      }

      // Extract field result text
      const textElements = runElement.getElementsByTagName("w:t");
      if (textElements.length > 0 && state.isInField && state.fieldSeparator && !state.fieldEnd) {
        for (const textElement of textElements) {
          const text = textElement.textContent || "";
          state.result += text;
        }
      }
    }

    debug.log(`Found ${fields.length} fields in paragraph`);
    return fields;
  });

/**
 * Convert field to markdown representation
 */
export const fieldToMarkdown = (field: DocxField): string => {
  switch (field.type) {
    case FieldCode.FORMTEXT:
      // Render form fields as placeholder text
      const defaultText = field.properties?.defaultText || "_____________";
      return `[${defaultText}]`;

    case FieldCode.FORMCHECKBOX:
      return "☐"; // Unchecked checkbox

    case FieldCode.FORMDROPDOWN:
      return "[Select Option ▼]";

    case FieldCode.PAGE:
      return field.result || "[Page]";

    case FieldCode.NUMPAGES:
      return field.result || "[Total Pages]";

    case FieldCode.DATE:
      return field.result || new Date().toLocaleDateString();

    case FieldCode.TIME:
      return field.result || new Date().toLocaleTimeString();

    case FieldCode.FILENAME:
      return field.result || "[Filename]";

    case FieldCode.AUTHOR:
      return field.result || "[Author]";

    case FieldCode.TITLE:
      return field.result || "[Title]";

    case FieldCode.HYPERLINK:
      if (field.properties?.url && field.result) {
        return `[${field.result}](${field.properties.url})`;
      }
      return field.result || field.properties?.url || "[Link]";

    case FieldCode.REF:
      return field.result || `[Reference: ${field.instruction}]`;

    case FieldCode.TOC:
      return ""; // Table of contents handled separately

    default:
      // For unknown fields, show the result if available, otherwise show placeholder
      return field.result || `[${field.type}]`;
  }
};

/**
 * Check if a paragraph contains fields
 */
export const paragraphContainsFields = (paragraphXml: string): boolean => {
  return paragraphXml.includes("<w:fldChar");
};

/**
 * Extract and replace fields in paragraph with their markdown representation
 */
export const processFieldsInParagraph = (
  paragraphXml: string,
): Effect.Effect<{ xml: string; fields: DocxField[] }, DocxParseError> =>
  Effect.gen(function* () {
    const fields = yield* parseFieldsFromParagraph(paragraphXml);

    if (fields.length === 0) {
      return { xml: paragraphXml, fields: [] };
    }

    // For now, return original XML with fields array
    // In a full implementation, we would replace field XML with markdown
    return { xml: paragraphXml, fields };
  });
