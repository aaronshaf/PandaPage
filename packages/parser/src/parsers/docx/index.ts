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
  alignment?: string;
}

function parseParagraph(paragraphElement: Element): DocxParagraph | null {
  const runs: DocxRun[] = [];
  const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  
  // Get paragraph style
  const pPrElement = paragraphElement.getElementsByTagNameNS(ns, "pPr")[0];
  let style: string | undefined;
  let numId: string | undefined;
  let ilvl: number | undefined;
  let alignment: string | undefined;
  
  if (pPrElement) {
    const styleElement = pPrElement.getElementsByTagNameNS(ns, "pStyle")[0];
    style = styleElement?.getAttribute("w:val") || undefined;
    
    // Get alignment
    const jcElement = pPrElement.getElementsByTagNameNS(ns, "jc")[0];
    const jcVal = jcElement?.getAttribute("w:val");
    if (jcVal) {
      switch (jcVal) {
        case 'center': alignment = 'center'; break;
        case 'right': alignment = 'right'; break;
        case 'both': case 'justify': alignment = 'justify'; break;
        case 'left': default: alignment = 'left'; break;
      }
    }
    
    // Get numbering info
    const numPrElement = pPrElement.getElementsByTagNameNS(ns, "numPr")[0];
    if (numPrElement) {
      const numIdElement = numPrElement.getElementsByTagNameNS(ns, "numId")[0];
      numId = numIdElement?.getAttribute("w:val") || undefined;
      const ilvlElement = numPrElement.getElementsByTagNameNS(ns, "ilvl")[0];
      const ilvlStr = ilvlElement?.getAttribute("w:val");
      ilvl = ilvlStr ? parseInt(ilvlStr, 10) : undefined;
    }
  }
  
  // Parse runs
  const runElements = paragraphElement.getElementsByTagNameNS(ns, "r");
  for (let i = 0; i < runElements.length; i++) {
    const runElement = runElements[i];
    const textElement = runElement.getElementsByTagNameNS(ns, "t")[0];
    const text = textElement?.textContent || "";
    
    // Get run properties
    const runProps = runElement.getElementsByTagNameNS(ns, "rPr")[0];
    let bold = false;
    let italic = false;
    let underline = false;
    let strikethrough = false;
    let fontSize: string | undefined;
    let fontFamily: string | undefined;
    let color: string | undefined;
    
    if (runProps) {
      bold = runProps.getElementsByTagNameNS(ns, "b").length > 0;
      italic = runProps.getElementsByTagNameNS(ns, "i").length > 0;
      underline = runProps.getElementsByTagNameNS(ns, "u").length > 0;
      strikethrough = runProps.getElementsByTagNameNS(ns, "strike").length > 0;
      
      const szElement = runProps.getElementsByTagNameNS(ns, "sz")[0];
      fontSize = szElement?.getAttribute("w:val") || undefined;
      
      const fontElement = runProps.getElementsByTagNameNS(ns, "rFonts")[0];
      fontFamily = fontElement?.getAttribute("w:ascii") || undefined;
      
      const colorElement = runProps.getElementsByTagNameNS(ns, "color")[0];
      color = colorElement?.getAttribute("w:val") || undefined;
    }
    
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
  }
  
  return runs.length > 0 ? { runs, style, numId, ilvl, alignment } : null;
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
        runs,
        alignment: paragraph.alignment
      };
    }
  }
  
  // Regular paragraph
  const element: Paragraph = {
    type: 'paragraph',
    runs,
    style: paragraph.style,
    alignment: paragraph.alignment
  };
  
  // Add list info if present
  if (paragraph.numId && paragraph.ilvl !== undefined) {
    element.listInfo = {
      level: paragraph.ilvl,
      type: 'number' // TODO: Determine from numbering.xml
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
    
    // Dublin Core namespace
    const dcNs = "http://purl.org/dc/elements/1.1/";
    const cpNs = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties";
    const dctermsNs = "http://purl.org/dc/terms/";
    
    const title = doc.getElementsByTagNameNS(dcNs, "title")[0]?.textContent;
    if (title) metadata.title = title;
    
    const creator = doc.getElementsByTagNameNS(dcNs, "creator")[0]?.textContent;
    if (creator) metadata.author = creator;
    
    const created = doc.getElementsByTagNameNS(dctermsNs, "created")[0]?.textContent;
    if (created) metadata.createdDate = new Date(created);
    
    const modified = doc.getElementsByTagNameNS(dctermsNs, "modified")[0]?.textContent;
    if (modified) metadata.modifiedDate = new Date(modified);
    
    const keywords = doc.getElementsByTagNameNS(cpNs, "keywords")[0]?.textContent;
    if (keywords) metadata.keywords = keywords.split(',').map(k => k.trim());
    
    const description = doc.getElementsByTagNameNS(dcNs, "description")[0]?.textContent;
    if (description) metadata.description = description;
    
    const language = doc.getElementsByTagNameNS(dcNs, "language")[0]?.textContent;
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
    const paragraphElements = doc.getElementsByTagNameNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "p");
    
    for (let i = 0; i < paragraphElements.length; i++) {
      const pElement = paragraphElements[i];
      const paragraph = parseParagraph(pElement);
      if (paragraph) {
        const element = convertToDocumentElement(paragraph);
        elements.push(element);
      }
    }
    
    return {
      metadata,
      elements
    };
  });

export async function parseDocxDocument(buffer: ArrayBuffer): Promise<ParsedDocument> {
  return Effect.runPromise(parseDocx(buffer));
}