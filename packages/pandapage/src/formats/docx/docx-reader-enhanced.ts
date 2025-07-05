import { Effect } from "effect";
import { parseXmlString, xmlParser, type XmlParser } from "../../common/xml-parser";
import { debug } from "../../common/debug";
import { type DocxMetadata, extractCompleteMetadata, DocxMetadataError } from "./docx-metadata";
import type { DocxParagraph, DocxRun, DocxNumbering, DocxAbstractFormat, DocxLevelFormat } from "./docx-reader";

// Re-export existing types (excluding DocxParseError which is redefined below)
export type { DocxParagraph, DocxRun, DocxNumbering, DocxAbstractFormat, DocxLevelFormat } from "./docx-reader";

/**
 * DOCX table interfaces
 */
export interface DocxTable {
  type: "table";
  rows: DocxTableRow[];
  properties?: DocxTableProperties;
}

export interface DocxTableRow {
  cells: DocxTableCell[];
  properties?: DocxTableRowProperties;
}

export interface DocxTableCell {
  content: DocxParagraph[];
  properties?: DocxTableCellProperties;
}

export interface DocxTableProperties {
  width?: string;
  alignment?: "left" | "center" | "right";
  borders?: DocxTableBorders;
  backgroundColor?: string;
}

export interface DocxTableRowProperties {
  height?: string;
  isHeader?: boolean;
}

export interface DocxTableCellProperties {
  width?: string;
  alignment?: "left" | "center" | "right" | "top" | "bottom";
  borders?: DocxTableBorders;
  backgroundColor?: string;
}

export interface DocxTableBorders {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

/**
 * Document element that can be either a paragraph or table
 */
export type DocxElement = DocxParagraph | DocxTable;
export type { DocxMetadata } from "./docx-metadata";

/**
 * Enhanced DOCX document with metadata
 */
export interface EnhancedDocxDocument {
  // Core document content - can contain paragraphs and tables
  elements: DocxElement[];
  numbering?: DocxNumbering;
  
  // Rich metadata
  metadata: DocxMetadata;
  
  // Document structure
  sections?: DocxSection[];
  headers?: DocxHeaderFooter[];
  footers?: DocxHeaderFooter[];
  
  // Processing info
  processingTime: number;
  totalElements: number;
  
  // Legacy support - computed from elements
  get paragraphs(): DocxParagraph[];
}

export interface DocxSection {
  id: string;
  elements: DocxElement[];
  properties?: {
    pageSize?: { width: number; height: number };
    margins?: { top: number; right: number; bottom: number; left: number };
    orientation?: "portrait" | "landscape";
  };
}

export interface DocxHeaderFooter {
  id: string;
  type: "header" | "footer";
  content: DocxParagraph[];
}


export class DocxParseError {
  readonly _tag = "DocxParseError";
  constructor(public readonly message: string) {}
}

/**
 * Enhanced DOCX reader with proper XML parsing and metadata extraction
 */
export const readEnhancedDocx = (buffer: ArrayBuffer): Effect.Effect<EnhancedDocxDocument, DocxParseError> =>
  Effect.gen(function* () {
    const startTime = Date.now();
    debug.log("Reading enhanced DOCX file...");

    try {
      // Load fflate for ZIP handling
      const { unzipSync, strFromU8 } = yield* Effect.tryPromise({
        try: () => import("fflate"),
        catch: (error) => new DocxParseError(`Failed to load fflate library: ${error}`),
      });

      const uint8Array = new Uint8Array(buffer);
      const unzipped = unzipSync(uint8Array);

      // Extract all relevant parts
      const parts = {
        documentXml: extractFileContent(unzipped, "word/document.xml", strFromU8),
        stylesXml: extractFileContent(unzipped, "word/styles.xml", strFromU8),
        numberingXml: extractFileContent(unzipped, "word/numbering.xml", strFromU8),
        corePropsXml: extractFileContent(unzipped, "docProps/core.xml", strFromU8),
        appPropsXml: extractFileContent(unzipped, "docProps/app.xml", strFromU8),
      };

      if (!parts.documentXml) {
        return yield* Effect.fail(new DocxParseError("No word/document.xml found in DOCX file"));
      }

      // Extract metadata first (lightweight operation)
      const metadata = yield* extractCompleteMetadata({
        coreXml: parts.corePropsXml,
        appXml: parts.appPropsXml,
        documentXml: parts.documentXml,
        stylesXml: parts.stylesXml,
      }).pipe(
        Effect.catchAll(() => {
          debug.log("Metadata extraction failed, using minimal metadata");
          return Effect.succeed({
            extractedAt: new Date(),
            originalFormat: "docx" as const,
            processingTime: 0,
          });
        })
      );

      // Parse document content using proper XML parser
      const document = yield* parseXmlString(parts.documentXml).pipe(
        Effect.mapError(error => new DocxParseError(`Failed to parse document.xml: ${error.message}`))
      );

      // Parse numbering if available
      let numbering: DocxNumbering | undefined;
      if (parts.numberingXml) {
        numbering = yield* parseNumberingXmlEnhanced(parts.numberingXml);
      }

      // Parse document structure
      const elements = yield* parseDocumentXmlEnhanced(document.documentElement);
      
      // Extract sections (reuse the already parsed elements), headers, footers
      const sections = createSections(elements);
      const { headers, footers } = yield* extractHeadersFooters(unzipped, strFromU8);

      const processingTime = Date.now() - startTime;
      const totalElements = elements.length + (headers?.length || 0) + (footers?.length || 0);

      const result: EnhancedDocxDocument = {
        elements,
        numbering,
        metadata,
        sections,
        headers,
        footers,
        processingTime,
        totalElements,
        get paragraphs() {
          return this.elements.filter((el): el is DocxParagraph => el.type === "paragraph");
        },
      };

      debug.log(`Enhanced DOCX parsing completed in ${processingTime}ms, ${totalElements} elements`);
      return result;

    } catch (error) {
      return yield* Effect.fail(new DocxParseError(`Failed to read DOCX: ${error}`));
    }
  });

/**
 * Parse document.xml content using proper XML parser
 */
const parseDocumentXmlEnhanced = (root: Element): Effect.Effect<DocxElement[], DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing document XML with enhanced parser");
    
    const elements: DocxElement[] = [];
    
    // Find the body element using localName (namespace-aware)
    const body = xmlParser.element(root, "body");
    
    if (!body) {
      return yield* Effect.fail(new DocxParseError("No body element found in document.xml"));
    }

    // Parse all child elements (paragraphs and tables)
    for (let i = 0; i < body.childNodes.length; i++) {
      const node = body.childNodes.item(i);
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        if (element.localName === "p" || element.nodeName === "p" || element.nodeName.endsWith(":p")) {
          const paragraph = yield* parseParagraphEnhanced(element);
          elements.push(paragraph);
        } else if (element.localName === "tbl" || element.nodeName === "tbl" || element.nodeName.endsWith(":tbl")) {
          const table = yield* parseTableEnhanced(element);
          elements.push(table);
        }
      }
    }

    debug.log(`Parsed ${elements.length} elements (paragraphs and tables) with XML parser`);
    return elements;
  });

/**
 * Parse a table using XML parser
 */
const parseTableEnhanced = (tblElement: Element): Effect.Effect<DocxTable, DocxParseError> =>
  Effect.gen(function* () {
    const rows: DocxTableRow[] = [];
    
    // Parse table properties
    const tblPr = xmlParser.element(tblElement, "tblPr");
    let tableProperties: DocxTableProperties | undefined;
    
    if (tblPr) {
      tableProperties = yield* parseTableProperties(tblPr);
    }
    
    // Parse table rows
    const rowElements = xmlParser.elements(tblElement, "tr");
    for (const trElement of rowElements) {
      const row = yield* parseTableRowEnhanced(trElement);
      rows.push(row);
    }

    return {
      type: "table",
      rows,
      properties: tableProperties,
    };
  });

/**
 * Parse a table row using XML parser
 */
const parseTableRowEnhanced = (trElement: Element): Effect.Effect<DocxTableRow, DocxParseError> =>
  Effect.gen(function* () {
    const cells: DocxTableCell[] = [];
    
    // Parse row properties
    const trPr = xmlParser.element(trElement, "trPr");
    let rowProperties: DocxTableRowProperties | undefined;
    
    if (trPr) {
      rowProperties = yield* parseTableRowProperties(trPr);
    }
    
    // Parse table cells
    const cellElements = xmlParser.elements(trElement, "tc");
    for (const tcElement of cellElements) {
      const cell = yield* parseTableCellEnhanced(tcElement);
      cells.push(cell);
    }

    return {
      cells,
      properties: rowProperties,
    };
  });

/**
 * Parse a table cell using XML parser
 */
const parseTableCellEnhanced = (tcElement: Element): Effect.Effect<DocxTableCell, DocxParseError> =>
  Effect.gen(function* () {
    const content: DocxParagraph[] = [];
    
    // Parse cell properties
    const tcPr = xmlParser.element(tcElement, "tcPr");
    let cellProperties: DocxTableCellProperties | undefined;
    
    if (tcPr) {
      cellProperties = yield* parseTableCellProperties(tcPr);
    }
    
    // Parse paragraphs within the cell
    const paragraphElements = xmlParser.elements(tcElement, "p");
    for (const pElement of paragraphElements) {
      const paragraph = yield* parseParagraphEnhanced(pElement);
      content.push(paragraph);
    }

    return {
      content,
      properties: cellProperties,
    };
  });

/**
 * Parse table properties
 */
const parseTableProperties = (tblPr: Element): Effect.Effect<DocxTableProperties, DocxParseError> =>
  Effect.gen(function* () {
    const properties: DocxTableProperties = {};
    
    // Parse table width
    const tblW = xmlParser.element(tblPr, "tblW");
    if (tblW) {
      const width = xmlParser.attr(tblW, "w");
      const type = xmlParser.attr(tblW, "type");
      if (width) {
        properties.width = type === "pct" ? `${width}%` : `${width}px`;
      }
    }
    
    // Parse table alignment
    const jc = xmlParser.element(tblPr, "jc");
    if (jc) {
      const val = xmlParser.attr(jc, "val");
      if (val === "left" || val === "center" || val === "right") {
        properties.alignment = val;
      }
    }
    
    // Parse table background color
    const shd = xmlParser.element(tblPr, "shd");
    if (shd) {
      const fill = xmlParser.attr(shd, "fill");
      if (fill && fill !== "auto") {
        properties.backgroundColor = `#${fill}`;
      }
    }
    
    return properties;
  });

/**
 * Parse table row properties
 */
const parseTableRowProperties = (trPr: Element): Effect.Effect<DocxTableRowProperties, DocxParseError> =>
  Effect.gen(function* () {
    const properties: DocxTableRowProperties = {};
    
    // Parse row height
    const trHeight = xmlParser.element(trPr, "trHeight");
    if (trHeight) {
      const val = xmlParser.attr(trHeight, "val");
      if (val) {
        properties.height = `${val}px`;
      }
    }
    
    // Check if this is a header row
    const tblHeader = xmlParser.element(trPr, "tblHeader");
    if (tblHeader) {
      properties.isHeader = true;
    }
    
    return properties;
  });

/**
 * Parse table cell properties
 */
const parseTableCellProperties = (tcPr: Element): Effect.Effect<DocxTableCellProperties, DocxParseError> =>
  Effect.gen(function* () {
    const properties: DocxTableCellProperties = {};
    
    // Parse cell width
    const tcW = xmlParser.element(tcPr, "tcW");
    if (tcW) {
      const width = xmlParser.attr(tcW, "w");
      const type = xmlParser.attr(tcW, "type");
      if (width) {
        properties.width = type === "pct" ? `${width}%` : `${width}px`;
      }
    }
    
    // Parse vertical alignment
    const vAlign = xmlParser.element(tcPr, "vAlign");
    if (vAlign) {
      const val = xmlParser.attr(vAlign, "val");
      if (val === "top" || val === "center" || val === "bottom") {
        properties.alignment = val;
      }
    }
    
    // Parse cell background color
    const shd = xmlParser.element(tcPr, "shd");
    if (shd) {
      const fill = xmlParser.attr(shd, "fill");
      if (fill && fill !== "auto") {
        properties.backgroundColor = `#${fill}`;
      }
    }
    
    return properties;
  });

/**
 * Parse a single paragraph using XML parser
 */
const parseParagraphEnhanced = (pElement: Element): Effect.Effect<DocxParagraph, DocxParseError> =>
  Effect.gen(function* () {
    const runs: DocxRun[] = [];
    let style: string | undefined;
    let numId: string | undefined;
    let ilvl: number | undefined;

    // Parse paragraph properties
    const pPr = xmlParser.element(pElement, "pPr");
    if (pPr) {
      // Extract style
      const pStyle = xmlParser.element(pPr, "pStyle");
      if (pStyle) {
        style = xmlParser.attr(pStyle, "val") || undefined;
      }

      // Extract numbering properties
      const numPr = xmlParser.element(pPr, "numPr");
      if (numPr) {
        const numIdElem = xmlParser.element(numPr, "numId");
        const ilvlElem = xmlParser.element(numPr, "ilvl");
        
        numId = numIdElem ? xmlParser.attr(numIdElem, "val") || undefined : undefined;
        ilvl = ilvlElem ? xmlParser.intAttr(ilvlElem, "val") || undefined : undefined;
      }
    }

    // Parse runs
    const runElements = xmlParser.elements(pElement, "r");
    for (const rElement of runElements) {
      const run = yield* parseRunEnhanced(rElement);
      if (run.text) {
        runs.push(run);
      }
    }

    return {
      type: "paragraph",
      style,
      runs,
      numId,
      ilvl,
    };
  });

/**
 * Parse a single run using XML parser
 */
const parseRunEnhanced = (rElement: Element): Effect.Effect<DocxRun, DocxParseError> =>
  Effect.gen(function* () {
    let text = "";
    let bold = false;
    let italic = false;
    let underline = false;

    // Parse run properties
    const rPr = xmlParser.element(rElement, "rPr");
    if (rPr) {
      bold = !!xmlParser.element(rPr, "b");
      italic = !!xmlParser.element(rPr, "i");
      underline = !!xmlParser.element(rPr, "u");
    }

    // Extract text content
    const textElements = xmlParser.elements(rElement, "t");
    text = textElements.map(t => xmlParser.textContent(t)).join("");

    return {
      text,
      ...(bold && { bold }),
      ...(italic && { italic }),
      ...(underline && { underline }),
    };
  });

/**
 * Parse numbering.xml using enhanced parser
 */
const parseNumberingXmlEnhanced = (xmlContent: string): Effect.Effect<DocxNumbering, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing numbering XML with enhanced parser");

    const document = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(error => new DocxParseError(`Failed to parse numbering.xml: ${error.message}`))
    );

    const root = document.documentElement;
    const instances = new Map<string, string>();
    const abstractFormats = new Map<string, DocxAbstractFormat>();

    // Parse abstract numbering definitions
    const abstractNums = xmlParser.elements(root, "abstractNum");
    for (const abstractNum of abstractNums) {
      const abstractNumId = xmlParser.attr(abstractNum, "abstractNumId");
      if (!abstractNumId) continue;

      const levels = new Map<number, DocxLevelFormat>();
      const lvlElements = xmlParser.elements(abstractNum, "lvl");
      
      for (const lvl of lvlElements) {
        const ilvl = xmlParser.intAttr(lvl, "ilvl");
        if (ilvl === null) continue;

        const numFmtElem = xmlParser.element(lvl, "numFmt");
        const lvlTextElem = xmlParser.element(lvl, "lvlText");

        const numFmt = numFmtElem ? xmlParser.attr(numFmtElem, "val") || "decimal" : "decimal";
        const lvlText = lvlTextElem ? xmlParser.attr(lvlTextElem, "val") || "" : "";

        levels.set(ilvl, { numFmt, lvlText });
      }

      if (levels.size > 0) {
        abstractFormats.set(abstractNumId, { levels });
      }
    }

    // Parse numbering instances
    const nums = xmlParser.elements(root, "num");
    for (const num of nums) {
      const numId = xmlParser.attr(num, "numId");
      const abstractNumIdRef = xmlParser.elementAttr(num, "abstractNumId", "val");
      
      if (numId && abstractNumIdRef) {
        instances.set(numId, abstractNumIdRef);
      }
    }

    debug.log(`Parsed ${instances.size} numbering instances and ${abstractFormats.size} abstract formats`);
    return { instances, abstractFormats };
  });

/**
 * Parse header/footer XML content (no body element)
 */
const parseHeaderFooterXml = (root: Element): Effect.Effect<DocxParagraph[], DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing header/footer XML");
    
    const paragraphs: DocxParagraph[] = [];
    
    // Header/footer files have paragraphs directly under the root (no body element)
    const paragraphElements = xmlParser.elements(root, "p");
    
    for (const pElement of paragraphElements) {
      const paragraph = yield* parseParagraphEnhanced(pElement);
      paragraphs.push(paragraph);
    }

    debug.log(`Parsed ${paragraphs.length} paragraphs from header/footer`);
    return paragraphs;
  });

/**
 * Create document sections from parsed elements
 */
const createSections = (elements: DocxElement[]): DocxSection[] => {
  // For now, treat entire document as one section
  // In future, parse section breaks and properties
  return [{
    id: "main",
    elements,
    properties: {
      // Default properties - can be enhanced later
      pageSize: { width: 8.5, height: 11 },
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      orientation: "portrait",
    },
  }];
};

/**
 * Extract headers and footers
 */
const extractHeadersFooters = (
  unzipped: Record<string, Uint8Array>,
  strFromU8: (data: Uint8Array) => string
): Effect.Effect<{ headers: DocxHeaderFooter[]; footers: DocxHeaderFooter[] }, DocxParseError> =>
  Effect.gen(function* () {
    const headers: DocxHeaderFooter[] = [];
    const footers: DocxHeaderFooter[] = [];

    // Find header and footer files
    const headerFiles = Object.keys(unzipped).filter(path => path.match(/^word\/header\d*\.xml$/));
    const footerFiles = Object.keys(unzipped).filter(path => path.match(/^word\/footer\d*\.xml$/));

    // Parse headers
    for (const headerPath of headerFiles) {
      const headerData = unzipped[headerPath];
      if (!headerData) continue;
      
      const xmlContent = strFromU8(headerData);
      const document = yield* parseXmlString(xmlContent).pipe(
        Effect.mapError(error => new DocxParseError(`Failed to parse ${headerPath}: ${error.message}`))
      );
      
      const paragraphs = yield* parseHeaderFooterXml(document.documentElement);
      headers.push({
        id: headerPath,
        type: "header",
        content: paragraphs,
      });
    }

    // Parse footers
    for (const footerPath of footerFiles) {
      const footerData = unzipped[footerPath];
      if (!footerData) continue;
      
      const xmlContent = strFromU8(footerData);
      const document = yield* parseXmlString(xmlContent).pipe(
        Effect.mapError(error => new DocxParseError(`Failed to parse ${footerPath}: ${error.message}`))
      );
      
      const paragraphs = yield* parseHeaderFooterXml(document.documentElement);
      footers.push({
        id: footerPath,
        type: "footer", 
        content: paragraphs,
      });
    }

    debug.log(`Extracted ${headers.length} headers and ${footers.length} footers`);
    return { headers, footers };
  });

/**
 * Helper to safely extract file content from ZIP
 */
function extractFileContent(
  unzipped: Record<string, Uint8Array>,
  path: string,
  strFromU8: (data: Uint8Array) => string
): string | undefined {
  const data = unzipped[path];
  return data ? strFromU8(data) : undefined;
}