import { Effect } from "effect";
import type { ParsedDocument, DocumentElement, Paragraph, Heading, TextRun, DocumentMetadata } from "../../types/document";

export class DocxParseError {
  readonly _tag = "DocxParseError";
  constructor(public readonly message: string) {}
}

interface DocxRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: string;
  fontFamily?: string;
  color?: string;
}

interface DocxParagraph {
  runs: DocxRun[];
  style?: string;
  numId?: string;
  ilvl?: number;
}

function parseParagraph(paragraphElement: Element): DocxParagraph | null {
  const runs: DocxRun[] = [];
  
  // Get paragraph style
  const styleElement = paragraphElement.querySelector("pStyle");
  const style = styleElement?.getAttribute("val") || undefined;
  
  // Get numbering info
  const numPrElement = paragraphElement.querySelector("numPr");
  const numId = numPrElement?.querySelector("numId")?.getAttribute("val") || undefined;
  const ilvlStr = numPrElement?.querySelector("ilvl")?.getAttribute("val");
  const ilvl = ilvlStr ? parseInt(ilvlStr, 10) : undefined;
  
  // Parse runs
  const runElements = paragraphElement.querySelectorAll("r");
  runElements.forEach(runElement => {
    const textElement = runElement.querySelector("t");
    const text = textElement?.textContent || "";
    
    // Get run properties
    const runProps = runElement.querySelector("rPr");
    const bold = runProps?.querySelector("b") !== null;
    const italic = runProps?.querySelector("i") !== null;
    const underline = runProps?.querySelector("u") !== null;
    const strikethrough = runProps?.querySelector("strike") !== null;
    
    const szElement = runProps?.querySelector("sz");
    const fontSize = szElement?.getAttribute("val") || undefined;
    
    const fontElement = runProps?.querySelector("rFonts");
    const fontFamily = fontElement?.getAttribute("ascii") || undefined;
    
    const colorElement = runProps?.querySelector("color");
    const color = colorElement?.getAttribute("val") || undefined;
    
    if (text) {
      runs.push({
        text,
        bold,
        italic,
        underline,
        strikethrough,
        fontSize,
        fontFamily,
        color
      });
    }
  });
  
  return runs.length > 0 ? { runs, style, numId, ilvl } : null;
}

function convertToDocumentElement(paragraph: DocxParagraph): DocumentElement {
  const runs: TextRun[] = paragraph.runs.map(run => ({
    text: run.text,
    bold: run.bold,
    italic: run.italic,
    underline: run.underline,
    strikethrough: run.strikethrough,
    fontSize: run.fontSize ? Math.round(parseInt(run.fontSize) / 2) : undefined,
    fontFamily: run.fontFamily,
    color: run.color ? `#${run.color}` : undefined
  }));
  
  // Check if it's a heading
  if (paragraph.style) {
    const styleNormalized = paragraph.style.toLowerCase();
    if (styleNormalized === 'heading' || styleNormalized.startsWith('heading') || styleNormalized.includes('title')) {
      let level: 1 | 2 | 3 | 4 | 5 | 6 = 1;
      const match = styleNormalized.match(/heading\s*(\d)/);
      if (match) {
        const parsedLevel = parseInt(match[1]);
        if (parsedLevel >= 1 && parsedLevel <= 6) {
          level = parsedLevel as 1 | 2 | 3 | 4 | 5 | 6;
        }
      }
      
      return {
        type: 'heading',
        level,
        runs
      };
    }
  }
  
  // Regular paragraph
  const element: Paragraph = {
    type: 'paragraph',
    runs,
    style: paragraph.style
  };
  
  // Add list info if present
  if (paragraph.numId && paragraph.ilvl !== undefined) {
    element.listInfo = {
      level: paragraph.ilvl,
      type: 'bullet' // TODO: Determine from numbering.xml
    };
  }
  
  return element;
}

function parseMetadata(corePropsXml: string | undefined, appPropsXml: string | undefined): DocumentMetadata {
  const metadata: DocumentMetadata = {};
  
  if (corePropsXml) {
    let doc: Document;
    if (typeof DOMParser === 'undefined') {
      // @ts-ignore
      const { DOMParser: XMLDOMParser } = require('@xmldom/xmldom');
      const parser = new XMLDOMParser();
      doc = parser.parseFromString(corePropsXml, "text/xml");
    } else {
      const parser = new DOMParser();
      doc = parser.parseFromString(corePropsXml, "text/xml");
    }
    
    const title = doc.querySelector("title")?.textContent;
    if (title) metadata.title = title;
    
    const creator = doc.querySelector("creator")?.textContent;
    if (creator) metadata.author = creator;
    
    const created = doc.querySelector("created")?.textContent;
    if (created) metadata.createdDate = new Date(created);
    
    const modified = doc.querySelector("modified")?.textContent;
    if (modified) metadata.modifiedDate = new Date(modified);
    
    const keywords = doc.querySelector("keywords")?.textContent;
    if (keywords) metadata.keywords = keywords.split(',').map(k => k.trim());
    
    const description = doc.querySelector("description")?.textContent;
    if (description) metadata.description = description;
    
    const language = doc.querySelector("language")?.textContent;
    if (language) metadata.language = language;
  }
  
  return metadata;
}

export const parseDocx = (buffer: ArrayBuffer): Effect.Effect<ParsedDocument, DocxParseError> =>
  Effect.gen(function* () {
    // Import JSZip
    const JSZip = yield* Effect.tryPromise({
      try: () => import("jszip").then(m => m.default),
      catch: (error) => new DocxParseError(`Failed to load JSZip library: ${error}`)
    });
    
    // Load the DOCX file
    const zip = yield* Effect.tryPromise({
      try: () => JSZip.loadAsync(buffer),
      catch: (error) => new DocxParseError(`Failed to load DOCX file: ${error}`)
    });
    
    // Get document.xml
    const documentXmlFile = zip.file("word/document.xml");
    if (!documentXmlFile) {
      return yield* Effect.fail(new DocxParseError("No document.xml found in DOCX file"));
    }
    
    const documentXml = yield* Effect.tryPromise({
      try: () => documentXmlFile.async("text"),
      catch: (error) => new DocxParseError(`Failed to read document.xml: ${error}`)
    });
    
    // Get metadata files (optional, so we catch and ignore errors)
    const corePropsFile = zip.file("docProps/core.xml");
    const corePropsXml = corePropsFile ? 
      yield* Effect.tryPromise({
        try: () => corePropsFile.async("text"),
        catch: () => ""
      }).pipe(Effect.orElse(() => Effect.succeed(undefined))) : undefined;
    
    const appPropsFile = zip.file("docProps/app.xml");
    const appPropsXml = appPropsFile ? 
      yield* Effect.tryPromise({
        try: () => appPropsFile.async("text"),
        catch: () => ""
      }).pipe(Effect.orElse(() => Effect.succeed(undefined))) : undefined;
    
    // Parse XML (use xmldom in Node.js)
    let doc: Document;
    if (typeof DOMParser === 'undefined') {
      const { DOMParser: XMLDOMParser } = yield* Effect.tryPromise({
        try: () => import('@xmldom/xmldom'),
        catch: (error) => new DocxParseError(`Failed to load XML parser: ${error}`)
      });
      const parser = new XMLDOMParser();
      doc = parser.parseFromString(documentXml, "text/xml") as any;
    } else {
      const parser = new DOMParser();
      doc = parser.parseFromString(documentXml, "text/xml");
    }
    
    // Extract metadata
    const metadata = parseMetadata(corePropsXml, appPropsXml);
    
    // Parse paragraphs
    const elements: DocumentElement[] = [];
    const paragraphElements = doc.querySelectorAll("p");
    
    paragraphElements.forEach(pElement => {
      const paragraph = parseParagraph(pElement);
      if (paragraph) {
        const element = convertToDocumentElement(paragraph);
        elements.push(element);
      }
    });
    
    return {
      metadata,
      elements
    };
  });

export async function parseDocxDocument(buffer: ArrayBuffer): Promise<ParsedDocument> {
  return Effect.runPromise(parseDocx(buffer));
}