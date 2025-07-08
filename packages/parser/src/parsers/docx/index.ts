import { Effect } from "effect";
import type { ParsedDocument, DocumentElement, Paragraph, Table, TableRow, TableCell, TextRun, DocumentMetadata, Header, Footer, Bookmark, Image } from "../../types/document";
import { parseDrawing, parseRelationships, extractImageData, createImageElement } from "./image-parser";

// Helper function to get MIME type from file extension
function getMimeType(extension?: string): string {
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    'svg': 'image/svg+xml',
    'webp': 'image/webp'
  };
  
  return mimeTypes[extension || ''] || 'image/png';
}

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
  superscript?: boolean;
  subscript?: boolean;
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  link?: string;
}

interface DocxParagraph {
  runs: DocxRun[];
  style?: string;
  numId?: string;
  ilvl?: number;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  images?: Image[];
}

function parseParagraph(paragraphElement: Element, relationships?: Map<string, string>, imageRelationships?: Map<string, any>, zip?: any): DocxParagraph | null {
  const runs: DocxRun[] = [];
  const images: Image[] = [];
  const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  
  // Get paragraph style
  const pPrElement = paragraphElement.getElementsByTagNameNS(ns, "pPr")[0];
  let style: string | undefined;
  let numId: string | undefined;
  let ilvl: number | undefined;
  let alignment: 'left' | 'center' | 'right' | 'justify' | undefined;
  
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
  
  // Parse runs - both direct runs and runs inside hyperlinks
  const allChildren = Array.from(paragraphElement.childNodes);
  
  for (let i = 0; i < allChildren.length; i++) {
    const child = allChildren[i];
    if (!child || child.nodeType !== 1) continue; // Skip non-element nodes
    
    const element = child as Element;
    
    if (element.tagName === "w:r") {
      // Direct run element
      const run = parseRun(element, ns);
      if (run && run.text) {
        runs.push(run);
      }
      
      // Check for drawing elements (images) in the run
      const drawingElements = element.getElementsByTagNameNS(ns, "drawing");
      for (let j = 0; j < drawingElements.length; j++) {
        const drawingElement = drawingElements[j];
        if (!drawingElement) continue;
        const drawingInfo = parseDrawing(drawingElement);
        
        if (drawingInfo && imageRelationships && zip) {
          const imageRel = imageRelationships.get(drawingInfo.relationshipId);
          if (imageRel) {
            // Store drawing info and relationship for later async processing
            images.push({
              type: 'image',
              data: new ArrayBuffer(0), // Placeholder - will be populated later
              mimeType: 'image/png', // Placeholder
              width: drawingInfo.width,
              height: drawingInfo.height,
              alt: drawingInfo.description || drawingInfo.name || 'Image',
              // Store metadata for later processing
              _drawingInfo: drawingInfo,
              _imageRel: imageRel
            } as any);
          }
        }
      }
    } else if (element.tagName === "w:hyperlink") {
      // Hyperlink element containing runs
      const rId = element.getAttribute("r:id");
      let linkUrl: string | undefined;
      
      // Resolve rId to actual URL using relationships
      if (rId && relationships) {
        linkUrl = relationships.get(rId);
      }
      
      const hyperlinkRuns = element.getElementsByTagNameNS(ns, "r");
      for (let j = 0; j < hyperlinkRuns.length; j++) {
        const runElement = hyperlinkRuns[j];
        if (!runElement) continue;
        const run = parseRun(runElement, ns, linkUrl);
        if (run && run.text) {
          runs.push(run);
        }
      }
    }
  }
  
  return runs.length > 0 || images.length > 0 ? { runs, style, numId, ilvl, alignment, ...(images.length > 0 && { images }) } : null;
}

function parseRun(runElement: Element, ns: string, linkUrl?: string): DocxRun | null {
  const textElement = runElement.getElementsByTagNameNS(ns, "t")[0];
  const text = textElement?.textContent || "";
  
  if (!text) return null;
  
  // Get run properties
  const runProps = runElement.getElementsByTagNameNS(ns, "rPr")[0];
  let bold = false;
  let italic = false;
  let underline = false;
  let strikethrough = false;
  let superscript = false;
  let subscript = false;
  let fontSize: string | undefined;
  let fontFamily: string | undefined;
  let color: string | undefined;
  let backgroundColor: string | undefined;
  
  if (runProps) {
    bold = runProps.getElementsByTagNameNS(ns, "b").length > 0;
    italic = runProps.getElementsByTagNameNS(ns, "i").length > 0;
    
    // Check for underline - need to verify the w:val attribute
    const underlineElement = runProps.getElementsByTagNameNS(ns, "u")[0];
    if (underlineElement) {
      const val = underlineElement.getAttribute("w:val");
      const color = underlineElement.getAttribute("w:color");
      
      if (val) {
        // If w:val is present, only apply underline if it's not "none" or "0"
        underline = val !== "none" && val !== "0";
      } else if (!color) {
        // If no w:val and no w:color, it's a simple <w:u/> which defaults to single underline
        underline = true;
      }
      // If w:color but no w:val, it's likely for color styling only, not underline
    }
    strikethrough = runProps.getElementsByTagNameNS(ns, "strike").length > 0;
    
    // Check for superscript/subscript
    const vertAlignElement = runProps.getElementsByTagNameNS(ns, "vertAlign")[0];
    const vertAlign = vertAlignElement?.getAttribute("w:val");
    if (vertAlign === "superscript") {
      superscript = true;
    } else if (vertAlign === "subscript") {
      subscript = true;
    }
    
    const szElement = runProps.getElementsByTagNameNS(ns, "sz")[0];
    fontSize = szElement?.getAttribute("w:val") || undefined;
    
    const fontElement = runProps.getElementsByTagNameNS(ns, "rFonts")[0];
    fontFamily = fontElement?.getAttribute("w:ascii") || undefined;
    
    const colorElement = runProps.getElementsByTagNameNS(ns, "color")[0];
    color = colorElement?.getAttribute("w:val") || undefined;
    
    // Background color/highlighting
    const highlightElement = runProps.getElementsByTagNameNS(ns, "highlight")[0];
    const highlightColor = highlightElement?.getAttribute("w:val");
    if (highlightColor && highlightColor !== "auto") {
      // Map DOCX highlight colors to hex values
      const highlightMap: Record<string, string> = {
        'yellow': '#FFFF00',
        'green': '#00FF00',
        'cyan': '#00FFFF',
        'magenta': '#FF00FF',
        'blue': '#0000FF',
        'red': '#FF0000',
        'darkBlue': '#000080',
        'darkCyan': '#008080',
        'darkGreen': '#008000',
        'darkMagenta': '#800080',
        'darkRed': '#800000',
        'darkYellow': '#808000',
        'darkGray': '#808080',
        'lightGray': '#C0C0C0',
        'black': '#000000'
      };
      backgroundColor = highlightMap[highlightColor] || `#${highlightColor}`;
    }
    
    // Also check for shading background
    const shadingElement = runProps.getElementsByTagNameNS(ns, "shd")[0];
    const shadingFill = shadingElement?.getAttribute("w:fill");
    if (shadingFill && shadingFill !== "auto" && !backgroundColor) {
      backgroundColor = `#${shadingFill}`;
    }
  }
  
  return {
    text,
    bold,
    italic,
    underline,
    strikethrough,
    superscript,
    subscript,
    fontSize,
    fontFamily,
    color,
    backgroundColor,
    link: linkUrl
  };
}

function convertToDocumentElement(paragraph: DocxParagraph): DocumentElement {
  const runs: TextRun[] = paragraph.runs.map(run => ({
    text: run.text,
    bold: run.bold,
    italic: run.italic,
    underline: run.underline,
    strikethrough: run.strikethrough,
    superscript: run.superscript,
    subscript: run.subscript,
    fontSize: run.fontSize ? Math.round(parseInt(run.fontSize) / 2) : undefined,
    fontFamily: run.fontFamily,
    color: run.color ? `#${run.color}` : undefined,
    backgroundColor: run.backgroundColor,
    link: run.link
  }));
  
  // Check if it's a heading
  if (paragraph.style) {
    const styleNormalized = paragraph.style.toLowerCase().replace(/\s+/g, '');
    
    // More comprehensive heading detection
    const isHeading = (
      styleNormalized === 'title' ||
      styleNormalized === 'heading' ||
      styleNormalized.startsWith('heading') ||
      styleNormalized.startsWith('head') ||
      styleNormalized.includes('title') ||
      // Common DOCX heading style variations
      /^h[1-6]$/.test(styleNormalized) ||
      /^heading[1-6]$/.test(styleNormalized) ||
      /^title\d*$/.test(styleNormalized)
    );
    
    if (isHeading) {
      let level: 1 | 2 | 3 | 4 | 5 | 6 = 1;
      
      // Extract level from various patterns
      const levelMatches = [
        styleNormalized.match(/heading\s*(\d)/),
        styleNormalized.match(/head\s*(\d)/),
        styleNormalized.match(/h(\d)/),
        styleNormalized.match(/title(\d)/),
        // Look for digit at the end
        styleNormalized.match(/(\d)$/),
      ];
      
      for (const match of levelMatches) {
        if (match && match[1]) {
          const parsedLevel = parseInt(match[1]);
          if (parsedLevel >= 1 && parsedLevel <= 6) {
            level = parsedLevel as 1 | 2 | 3 | 4 | 5 | 6;
            break;
          }
        }
      }
      
      // Special case: 'title' without number is typically level 1
      if (styleNormalized === 'title') {
        level = 1;
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

function parseTable(tableElement: Element, relationships?: Map<string, string>): Table | null {
  const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const rows: TableRow[] = [];
  
  // Get all table rows
  const rowElements = tableElement.getElementsByTagNameNS(ns, "tr");
  
  for (let i = 0; i < rowElements.length; i++) {
    const rowElement = rowElements[i];
    if (!rowElement) continue;
    const cells: TableCell[] = [];
    
    // Get all table cells in this row
    const cellElements = rowElement.getElementsByTagNameNS(ns, "tc");
    
    for (let j = 0; j < cellElements.length; j++) {
      const cellElement = cellElements[j];
      if (!cellElement) continue;
      const paragraphs: Paragraph[] = [];
      
      // Get all paragraphs in this cell
      const cellParagraphs = cellElement.getElementsByTagNameNS(ns, "p");
      
      for (let k = 0; k < cellParagraphs.length; k++) {
        const pElement = cellParagraphs[k];
        if (!pElement) continue;
        const paragraph = parseParagraph(pElement, relationships, undefined, undefined);
        if (paragraph) {
          // Convert to Paragraph type (without list info for table cells)
          const cellParagraph: Paragraph = {
            type: 'paragraph',
            runs: paragraph.runs.map(run => ({
              text: run.text,
              bold: run.bold,
              italic: run.italic,
              underline: run.underline,
              strikethrough: run.strikethrough,
              superscript: run.superscript,
              subscript: run.subscript,
              fontSize: run.fontSize ? Math.round(parseInt(run.fontSize) / 2) : undefined,
              fontFamily: run.fontFamily,
              color: run.color ? `#${run.color}` : undefined,
              backgroundColor: run.backgroundColor,
              link: run.link
            })),
            style: paragraph.style,
            alignment: paragraph.alignment
          };
          paragraphs.push(cellParagraph);
        }
      }
      
      // Check for cell spanning properties
      const tcPr = cellElement ? cellElement.getElementsByTagNameNS(ns, "tcPr")[0] : undefined;
      let colspan: number | undefined;
      let rowspan: number | undefined;
      
      if (tcPr) {
        const gridSpan = tcPr.getElementsByTagNameNS(ns, "gridSpan")[0];
        if (gridSpan) {
          const val = gridSpan.getAttribute("w:val");
          if (val) colspan = parseInt(val);
        }
        
        const vMerge = tcPr.getElementsByTagNameNS(ns, "vMerge")[0];
        if (vMerge) {
          // Note: DOCX vertical merge is complex, we'll handle basic cases
          const val = vMerge.getAttribute("w:val");
          if (val === "restart") rowspan = 1; // This is a simplification
        }
      }
      
      const cell: TableCell = {
        paragraphs,
        colspan,
        rowspan
      };
      
      cells.push(cell);
    }
    
    if (cells.length > 0) {
      rows.push({ cells });
    }
  }
  
  if (rows.length === 0) return null;
  
  return {
    type: 'table',
    rows
  };
}

function parseMetadata(corePropsXml: string | undefined, _appPropsXml: string | undefined): DocumentMetadata {
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

function parseHeaderFooter(xml: string, type: 'header' | 'footer', relationships?: Map<string, string>): Header | Footer | null {
  let doc: Document;
  if (typeof DOMParser === 'undefined') {
    // @ts-ignore
    const { DOMParser: XMLDOMParser } = require('@xmldom/xmldom');
    const parser = new XMLDOMParser();
    doc = parser.parseFromString(xml, "text/xml");
  } else {
    const parser = new DOMParser();
    doc = parser.parseFromString(xml, "text/xml");
  }
  
  const elements: (Paragraph | Table)[] = [];
  
  // Get all paragraphs and tables from the header/footer
  const body = doc.documentElement;
  
  // Parse all children
  for (let i = 0; i < body.childNodes.length; i++) {
    const child = body.childNodes[i];
    if (!child || child.nodeType !== 1) continue; // Skip non-element nodes
    
    const element = child as Element;
    const tagName = element.tagName;
    
    if (tagName === "w:p") {
      // Parse paragraph with relationships for hyperlink resolution
      const paragraph = parseParagraph(element, relationships, undefined, undefined);
      if (paragraph) {
        const docElement = convertToDocumentElement(paragraph);
        if (docElement.type === 'paragraph') {
          elements.push(docElement as Paragraph);
        }
      }
    } else if (tagName === "w:tbl") {
      // Parse table with relationships for hyperlink resolution
      const table = parseTable(element, relationships);
      if (table) {
        elements.push(table);
      }
    }
  }
  
  if (elements.length === 0) return null;
  
  return {
    type,
    elements
  } as Header | Footer;
}

function parseBookmarks(element: Element, ns: string): Bookmark[] {
  const bookmarks: Bookmark[] = [];
  
  // Find all bookmark start elements
  const bookmarkStarts = element.getElementsByTagNameNS(ns, "bookmarkStart");
  
  for (let i = 0; i < bookmarkStarts.length; i++) {
    const bookmarkStart = bookmarkStarts[i];
    if (!bookmarkStart) continue;
    const id = bookmarkStart.getAttribute("w:id");
    const name = bookmarkStart.getAttribute("w:name");
    
    if (id && name) {
      // Try to find corresponding bookmark end and extract text content
      const bookmarkEnd = findBookmarkEnd(element, id, ns);
      let text: string | undefined;
      
      if (bookmarkEnd && bookmarkStart) {
        text = extractBookmarkText(bookmarkStart, bookmarkEnd);
      }
      
      bookmarks.push({
        type: 'bookmark',
        id,
        name,
        text
      });
    }
  }
  
  return bookmarks;
}

function findBookmarkEnd(element: Element, bookmarkId: string, ns: string): Element | null {
  const bookmarkEnds = element.getElementsByTagNameNS(ns, "bookmarkEnd");
  
  for (let i = 0; i < bookmarkEnds.length; i++) {
    const bookmarkEnd = bookmarkEnds[i];
    if (!bookmarkEnd) continue;
    if (bookmarkEnd.getAttribute("w:id") === bookmarkId) {
      return bookmarkEnd;
    }
  }
  
  return null;
}

function extractBookmarkText(startElement: Element, endElement: Element): string {
  // This is a simplified implementation
  // In a full implementation, you'd traverse from start to end collecting text
  let current = startElement.nextSibling;
  let text = '';
  
  while (current && current !== endElement) {
    if (current.nodeType === 1) { // Element node
      const element = current as Element;
      if (element.tagName === "w:r") {
        const textNodes = element.getElementsByTagName("w:t");
        for (let i = 0; i < textNodes.length; i++) {
          const textNode = textNodes[i];
          if (!textNode) continue;
          text += textNode.textContent || '';
        }
      }
    }
    current = current.nextSibling;
  }
  
  return text.trim();
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
    
    // Parse relationships for headers, footers, and hyperlinks
    const relsFile = zip.file("word/_rels/document.xml.rels");
    let headers: Header[] = [];
    let footers: Footer[] = [];
    let relationshipsMap = new Map<string, string>();
    let imageRelationships = new Map<string, { id: string; target: string; type: string }>();
    
    if (relsFile) {
      const relsXml = yield* Effect.tryPromise({
        try: () => relsFile.async("text"),
        catch: () => ""
      }).pipe(Effect.orElse(() => Effect.succeed("")));
      
      if (relsXml) {
        // Parse relationships document
        let relsDoc: Document;
        if (typeof DOMParser === 'undefined') {
          const { DOMParser: XMLDOMParser } = yield* Effect.tryPromise({
            try: () => import('@xmldom/xmldom'),
            catch: (error) => new DocxParseError(`Failed to load XML parser: ${error}`)
          });
          const parser = new XMLDOMParser();
          relsDoc = parser.parseFromString(relsXml, "text/xml") as any;
        } else {
          const parser = new DOMParser();
          relsDoc = parser.parseFromString(relsXml, "text/xml");
        }
        
        const relationships = relsDoc.getElementsByTagName("Relationship");
        
        // Build relationships map for hyperlinks and process headers/footers
        for (let i = 0; i < relationships.length; i++) {
          const rel = relationships[i];
          if (!rel) continue;
          const id = rel.getAttribute("Id");
          const type = rel.getAttribute("Type");
          const target = rel.getAttribute("Target");
          
          if (id && type && target) {
            // Store all relationships for potential hyperlink resolution
            relationshipsMap.set(id, target);
            
            // Store image relationships
            if (type.includes("image")) {
              imageRelationships.set(id, { id, target, type });
            }
            
            if (type.includes("header")) {
              // Parse header
              const headerFile = zip.file(`word/${target}`);
              if (headerFile) {
                const headerXml = yield* Effect.tryPromise({
                  try: () => headerFile.async("text"),
                  catch: () => ""
                }).pipe(Effect.orElse(() => Effect.succeed("")));
                
                if (headerXml) {
                  const header = parseHeaderFooter(headerXml, 'header', relationshipsMap);
                  if (header && header.type === 'header') {
                    headers.push(header);
                  }
                }
              }
            } else if (type.includes("footer")) {
              // Parse footer
              const footerFile = zip.file(`word/${target}`);
              if (footerFile) {
                const footerXml = yield* Effect.tryPromise({
                  try: () => footerFile.async("text"),
                  catch: () => ""
                }).pipe(Effect.orElse(() => Effect.succeed("")));
                
                if (footerXml) {
                  const footer = parseHeaderFooter(footerXml, 'footer', relationshipsMap);
                  if (footer && footer.type === 'footer') {
                    footers.push(footer);
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Parse all document body elements in order
    const elements: DocumentElement[] = [];
    
    // Add headers first
    elements.push(...headers);
    
    const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    
    // Get the document body
    const bodyNodeList = doc.getElementsByTagNameNS(ns, "body");
    if (bodyNodeList.length === 0) {
      // Add footers at the end and return
      elements.push(...footers);
      return { metadata, elements };
    }
    
    const body = bodyNodeList[0];
    if (!body) {
      // Add footers at the end and return
      elements.push(...footers);
      return { metadata, elements };
    }
    
    // Parse bookmarks from the entire document body first
    const bookmarks = parseBookmarks(body, ns);
    elements.push(...bookmarks);
    
    // Collect all images that need async processing
    const pendingImages: Array<{ image: any; paragraph: DocxParagraph }> = [];
    
    // Parse all direct children of the body in order
    for (let i = 0; i < body.childNodes.length; i++) {
      const child = body.childNodes[i];
      if (!child || child.nodeType !== 1) continue; // Skip non-element nodes
      
      const element = child as Element;
      const tagName = element.tagName;
      
      if (tagName === "w:p") {
        // Parse paragraph with relationships for hyperlink resolution
        const paragraph = parseParagraph(element, relationshipsMap, imageRelationships, zip);
        if (paragraph) {
          const docElement = convertToDocumentElement(paragraph);
          elements.push(docElement);
          
          // Collect images for async processing
          if (paragraph.images) {
            for (const image of paragraph.images) {
              pendingImages.push({ image, paragraph });
            }
          }
        }
      } else if (tagName === "w:tbl") {
        // Parse table with relationships for hyperlink resolution
        const table = parseTable(element, relationshipsMap);
        if (table) {
          elements.push(table);
        }
      } else if (tagName === "w:sectPr") {
        // Section properties - might contain page breaks
        // For now, add a page break
        elements.push({ type: "pageBreak" });
      }
      // Note: Images are typically inside paragraphs as w:drawing elements
      // We'll handle them in the paragraph parsing
    }
    
    // Process all pending images
    for (const { image, paragraph } of pendingImages) {
      if (image._imageRel && image._drawingInfo) {
        try {
          // Extract image data
          const imageData = yield* extractImageData(zip, image._imageRel.target);
          
          // Create proper image element
          const properImage = createImageElement(image._drawingInfo, imageData);
          elements.push(properImage);
        } catch (error) {
          console.warn('Failed to extract image:', error);
        }
      }
    }
    
    // Add footers at the end
    elements.push(...footers);
    
    return {
      metadata,
      elements
    };
  });

export async function parseDocxDocument(buffer: ArrayBuffer): Promise<ParsedDocument> {
  return Effect.runPromise(parseDocx(buffer));
}