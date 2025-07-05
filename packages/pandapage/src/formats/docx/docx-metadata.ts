import { Effect } from "effect";
import { parseXmlString, xmlParser, type XmlParser } from "../../common/xml-parser";
import { debug } from "../../common/debug";

/**
 * DOCX Document Metadata
 * Extracted from docProps/core.xml and docProps/app.xml
 */
export interface DocxMetadata {
  // Core properties (docProps/core.xml)
  title?: string;
  subject?: string;
  description?: string;
  creator?: string;
  keywords?: string[];
  language?: string;
  lastModifiedBy?: string;
  created?: Date;
  modified?: Date;
  revision?: number;
  
  // Extended/App properties (docProps/app.xml)
  application?: string;
  appVersion?: string;
  template?: string;
  company?: string;
  manager?: string;
  
  // Document statistics
  pages?: number;
  words?: number;
  characters?: number;
  charactersWithSpaces?: number;
  lines?: number;
  paragraphs?: number;
  
  // PandaPage-specific metadata
  extractedAt: Date;
  originalFormat: "docx";
  processingTime?: number;
  
  // Document structure
  outline?: DocxOutlineItem[];
  styleUsage?: DocxStyleUsage[];
}

export class DocxMetadataError {
  readonly _tag = "DocxMetadataError";
  constructor(public readonly message: string) {}
}

/**
 * Parse core properties from docProps/core.xml
 */
export const parseCoreProperties = (xmlContent: string): Effect.Effect<Partial<DocxMetadata>, DocxMetadataError> =>
  Effect.gen(function* () {
    debug.log("Parsing core properties XML");
    
    const document = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(error => new DocxMetadataError(`Failed to parse core.xml: ${error.message}`))
    );
    
    const root = document.documentElement;
    const metadata: Partial<DocxMetadata> = {};
    
    // Parse Dublin Core elements
    for (const element of xmlParser.elements(root)) {
      const localName = element.localName;
      const textContent = xmlParser.textContent(element);
      
      switch (localName) {
        case "title":
          metadata.title = textContent;
          break;
        case "subject":
          metadata.subject = textContent;
          break;
        case "description":
          metadata.description = textContent;
          break;
        case "creator":
          metadata.creator = textContent;
          break;
        case "keywords":
          metadata.keywords = textContent ? textContent.split(/[,;]\s*/) : [];
          break;
        case "language":
          metadata.language = textContent;
          break;
        case "lastModifiedBy":
          metadata.lastModifiedBy = textContent;
          break;
        case "created":
          metadata.created = parseDocxDate(textContent);
          break;
        case "modified":
          metadata.modified = parseDocxDate(textContent);
          break;
        case "revision":
          metadata.revision = parseInt(textContent) || undefined;
          break;
      }
    }
    
    debug.log("Parsed core properties:", Object.keys(metadata));
    return metadata;
  });

/**
 * Parse extended/app properties from docProps/app.xml
 */
export const parseAppProperties = (xmlContent: string): Effect.Effect<Partial<DocxMetadata>, DocxMetadataError> =>
  Effect.gen(function* () {
    debug.log("Parsing app properties XML");
    
    const document = yield* parseXmlString(xmlContent).pipe(
      Effect.mapError(error => new DocxMetadataError(`Failed to parse app.xml: ${error.message}`))
    );
    
    const root = document.documentElement;
    const metadata: Partial<DocxMetadata> = {};
    
    // Parse application-specific elements
    for (const element of xmlParser.elements(root)) {
      const localName = element.localName;
      const textContent = xmlParser.textContent(element);
      
      switch (localName) {
        case "Application":
          metadata.application = textContent;
          break;
        case "AppVersion":
          metadata.appVersion = textContent;
          break;
        case "Template":
          metadata.template = textContent;
          break;
        case "Company":
          metadata.company = textContent;
          break;
        case "Manager":
          metadata.manager = textContent;
          break;
        case "Pages":
          metadata.pages = parseInt(textContent) || undefined;
          break;
        case "Words":
          metadata.words = parseInt(textContent) || undefined;
          break;
        case "Characters":
          metadata.characters = parseInt(textContent) || undefined;
          break;
        case "CharactersWithSpaces":
          metadata.charactersWithSpaces = parseInt(textContent) || undefined;
          break;
        case "Lines":
          metadata.lines = parseInt(textContent) || undefined;
          break;
        case "Paragraphs":
          metadata.paragraphs = parseInt(textContent) || undefined;
          break;
      }
    }
    
    debug.log("Parsed app properties:", Object.keys(metadata));
    return metadata;
  });

/**
 * Extract document outline/structure for TOC
 */
export const extractDocumentOutline = (
  documentXml: string
): Effect.Effect<DocxOutlineItem[], DocxMetadataError> =>
  Effect.gen(function* () {
    debug.log("Extracting document outline");
    
    const document = yield* parseXmlString(documentXml).pipe(
      Effect.mapError(error => new DocxMetadataError(`Failed to parse document.xml: ${error.message}`))
    );
    
    const root = document.documentElement;
    const outline: DocxOutlineItem[] = [];
    
    // Find all paragraphs with heading styles
    const paragraphs = xmlParser.elements(root).flatMap(el => 
      el.localName === "body" ? xmlParser.elements(el, "p") : []
    );
    
    for (const paragraph of paragraphs) {
      const pPr = xmlParser.element(paragraph, "pPr");
      if (!pPr) continue;
      
      const pStyle = xmlParser.element(pPr, "pStyle");
      if (!pStyle) continue;
      
      const styleVal = xmlParser.attr(pStyle, "val");
      if (!styleVal || !isHeadingStyle(styleVal)) continue;
      
      // Extract text content from runs
      const runs = xmlParser.elements(paragraph, "r");
      const text = runs
        .map(run => {
          const textElements = xmlParser.elements(run, "t");
          return textElements.map(t => xmlParser.textContent(t)).join("");
        })
        .join("")
        .trim();
      
      if (text) {
        outline.push({
          level: getHeadingLevel(styleVal),
          title: text,
          style: styleVal,
        });
      }
    }
    
    debug.log(`Extracted ${outline.length} outline items`);
    return outline;
  });

/**
 * Analyze document for style usage statistics
 */
export const analyzeStyleUsage = (
  documentXml: string,
  stylesXml?: string
): Effect.Effect<DocxStyleUsage[], DocxMetadataError> =>
  Effect.gen(function* () {
    debug.log("Analyzing style usage");
    
    const document = yield* parseXmlString(documentXml).pipe(
      Effect.mapError(error => new DocxMetadataError(`Failed to parse document.xml: ${error.message}`))
    );
    
    const styleUsage = new Map<string, number>();
    const root = document.documentElement;
    
    // Count paragraph styles
    const paragraphs = xmlParser.elements(root).flatMap(el => 
      el.localName === "body" ? xmlParser.elements(el, "p") : []
    );
    
    for (const paragraph of paragraphs) {
      const pPr = xmlParser.element(paragraph, "pPr");
      if (pPr) {
        const pStyle = xmlParser.element(pPr, "pStyle");
        if (pStyle) {
          const styleVal = xmlParser.attr(pStyle, "val");
          if (styleVal) {
            styleUsage.set(styleVal, (styleUsage.get(styleVal) || 0) + 1);
          }
        }
      }
      
      // Count run styles
      const runs = xmlParser.elements(paragraph, "r");
      for (const run of runs) {
        const rPr = xmlParser.element(run, "rPr");
        if (rPr) {
          const rStyle = xmlParser.element(rPr, "rStyle");
          if (rStyle) {
            const styleVal = xmlParser.attr(rStyle, "val");
            if (styleVal) {
              styleUsage.set(styleVal, (styleUsage.get(styleVal) || 0) + 1);
            }
          }
        }
      }
    }
    
    const result: DocxStyleUsage[] = Array.from(styleUsage.entries()).map(([name, usage]) => ({
      name,
      usage,
      type: determineStyleType(name),
    }));
    
    debug.log(`Analyzed ${result.length} unique styles`);
    return result;
  });

/**
 * Create complete metadata from all sources
 */
export const extractCompleteMetadata = (parts: {
  coreXml?: string;
  appXml?: string;
  documentXml?: string;
  stylesXml?: string;
}): Effect.Effect<DocxMetadata, DocxMetadataError> =>
  Effect.gen(function* () {
    const startTime = Date.now();
    debug.log("Extracting complete DOCX metadata");
    
    // Parse all available metadata sources
    const coreProps = parts.coreXml 
      ? yield* parseCoreProperties(parts.coreXml)
      : {};
      
    const appProps = parts.appXml
      ? yield* parseAppProperties(parts.appXml) 
      : {};
      
    const outline = parts.documentXml
      ? yield* extractDocumentOutline(parts.documentXml)
      : [];
      
    const styleUsage = parts.documentXml
      ? yield* analyzeStyleUsage(parts.documentXml, parts.stylesXml)
      : [];
    
    const processingTime = Date.now() - startTime;
    
    // Combine all metadata
    const metadata: DocxMetadata = {
      ...coreProps,
      ...appProps,
      extractedAt: new Date(),
      originalFormat: "docx",
      processingTime,
      // Add derived metadata
      outline,
      styleUsage,
    };
    
    debug.log("Complete metadata extraction finished in", processingTime, "ms");
    return metadata;
  });

// Helper interfaces
export interface DocxOutlineItem {
  level: number;
  title: string;
  style: string;
  page?: number;
}

export interface DocxStyleUsage {
  name: string;
  type: "paragraph" | "character" | "table" | "numbering" | "unknown";
  usage: number;
}

// Helper functions
function parseDocxDate(dateString: string): Date | undefined {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
}

function isHeadingStyle(styleVal: string): boolean {
  return /^(heading|Heading|Title|title)\d*$/i.test(styleVal) ||
         /^h[1-6]$/i.test(styleVal);
}

function getHeadingLevel(styleVal: string): number {
  const match = styleVal.match(/(\d+)$/);
  if (match && match[1]) {
    return parseInt(match[1]);
  }
  // Default heading level
  return 1;
}

function determineStyleType(styleName: string): DocxStyleUsage["type"] {
  if (isHeadingStyle(styleName) || /paragraph|para/i.test(styleName)) {
    return "paragraph";
  }
  if (/char|run|font/i.test(styleName)) {
    return "character";
  }
  if (/table|tbl/i.test(styleName)) {
    return "table";
  }
  if (/list|num/i.test(styleName)) {
    return "numbering";
  }
  return "unknown";
}

