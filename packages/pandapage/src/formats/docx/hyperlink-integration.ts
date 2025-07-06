import { Effect } from "effect";
import { debug } from "../../common/debug";
import { 
  parseHyperlinkRelationships, 
  parseHyperlink,
  type HyperlinkRelationship 
} from "./hyperlink-parser";
import type { DocxRun, DocxParagraph } from "./types";
import { DocxParseError } from "./types";

/**
 * Enhanced paragraph with hyperlink information
 */
export interface ParagraphWithHyperlinks extends DocxParagraph {
  hyperlinks?: Array<{
    runs: DocxRun[];
    url: string;
    startIndex: number;
    endIndex: number;
  }>;
}

/**
 * Parse hyperlinks in a paragraph and integrate them with runs
 */
export const parseHyperlinksInParagraph = (
  paragraphXml: string,
  relationships: Map<string, HyperlinkRelationship>
): Effect.Effect<Array<{ runs: DocxRun[]; url?: string }>, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing hyperlinks in paragraph");
    
    const hyperlinks: Array<{ runs: DocxRun[]; url?: string }> = [];
    
    // Match all hyperlink elements
    const hyperlinkRegex = /<w:hyperlink[^>]*>([\s\S]*?)<\/w:hyperlink>/g;
    let hyperlinkMatch;
    
    while ((hyperlinkMatch = hyperlinkRegex.exec(paragraphXml)) !== null) {
      const hyperlinkElement = hyperlinkMatch[0];
      const hyperlink = parseHyperlink(hyperlinkElement, relationships);
      if (hyperlink.runs.length > 0) {
        hyperlinks.push(hyperlink);
      }
    }
    
    debug.log(`Found ${hyperlinks.length} hyperlinks in paragraph`);
    return hyperlinks;
  });

/**
 * Merge hyperlink runs into paragraph runs
 */
export const mergeHyperlinksIntoParagraph = (
  paragraph: DocxParagraph,
  paragraphXml: string,
  relationships: Map<string, HyperlinkRelationship>
): Effect.Effect<DocxParagraph, DocxParseError> =>
  Effect.gen(function* () {
    // If no hyperlinks in the XML, return as-is
    if (!paragraphXml.includes("<w:hyperlink")) {
      return paragraph;
    }
    
    const hyperlinks = yield* parseHyperlinksInParagraph(paragraphXml, relationships);
    
    if (hyperlinks.length === 0) {
      return paragraph;
    }
    
    // Create a new paragraph with enhanced runs
    const enhancedParagraph = { ...paragraph };
    const enhancedRuns: DocxRun[] = [];
    
    // Split the paragraph XML to process parts between hyperlinks
    const parts = paragraphXml.split(/<w:hyperlink[^>]*>[\s\S]*?<\/w:hyperlink>/);
    const hyperlinkMatches = paragraphXml.match(/<w:hyperlink[^>]*>[\s\S]*?<\/w:hyperlink>/g) || [];
    
    let runIndex = 0;
    
    for (let i = 0; i < parts.length; i++) {
      // Add runs from non-hyperlink parts
      const partRuns = extractRunsFromXml(parts[i] || "");
      enhancedRuns.push(...partRuns);
      
      // Add hyperlink runs if there's a corresponding hyperlink
      if (i < hyperlinkMatches.length && hyperlinks[i]) {
        const hyperlink = hyperlinks[i];
        if (hyperlink) {
          // Add hyperlink property to all runs in the hyperlink
          const hyperlinkRuns = hyperlink.runs.map(run => ({
            ...run,
            hyperlink: hyperlink.url
          }));
          enhancedRuns.push(...hyperlinkRuns);
        }
      }
    }
    
    enhancedParagraph.runs = enhancedRuns;
    return enhancedParagraph;
  });

/**
 * Extract runs from XML fragment (non-hyperlink parts)
 */
const extractRunsFromXml = (xmlFragment: string): DocxRun[] => {
  const runs: DocxRun[] = [];
  const runRegex = /<w:r[^>]*>(.*?)<\/w:r>/gs;
  let runMatch;
  
  while ((runMatch = runRegex.exec(xmlFragment)) !== null) {
    const runContent = runMatch[1];
    if (!runContent) continue;
    
    // Extract text
    const textMatch = runContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
    if (textMatch?.[1]) {
      const text = textMatch[1];
      
      // Check formatting
      const bold = /<w:b\s*\/>/.test(runContent) || /<w:b\s+w:val="1"/.test(runContent);
      const italic = /<w:i\s*\/>/.test(runContent) || /<w:i\s+w:val="1"/.test(runContent);
      const underline = /<w:u\s+/.test(runContent);
      
      runs.push({
        text,
        ...(bold && { bold }),
        ...(italic && { italic }),
        ...(underline && { underline })
      });
    }
  }
  
  return runs;
};

/**
 * Load and parse hyperlink relationships from document.xml.rels
 */
export const loadHyperlinkRelationships = (
  relsXml: string | undefined
): Effect.Effect<Map<string, HyperlinkRelationship>, DocxParseError> =>
  Effect.gen(function* () {
    if (!relsXml) {
      debug.log("No relationships XML provided");
      return new Map();
    }
    
    return yield* parseHyperlinkRelationships(relsXml);
  });

/**
 * Update DocxRun type to include hyperlink
 */
export interface DocxRunWithHyperlink extends DocxRun {
  hyperlink?: string;
}