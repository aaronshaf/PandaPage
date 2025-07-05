import { Effect } from "effect";
import { debug } from "../../common/debug";
import type { DocxRun } from "./types";
import { DocxParseError } from "./types";

/**
 * Hyperlink relationship data from document.xml.rels
 */
export interface HyperlinkRelationship {
  id: string;
  target: string;
  targetMode?: string;
}

/**
 * Parse hyperlink relationships from document.xml.rels
 */
export const parseHyperlinkRelationships = (
  relsXml: string
): Effect.Effect<Map<string, HyperlinkRelationship>, DocxParseError> =>
  Effect.gen(function* () {
    debug.log("Parsing hyperlink relationships");
    
    const relationships = new Map<string, HyperlinkRelationship>();
    
    // Parse all Relationship elements
    const relMatches = relsXml.matchAll(
      /<Relationship\s+([^>]*?)\/>/g
    );
    
    for (const match of relMatches) {
      const attrs = match[1];
      if (!attrs) continue;
      
      // Check if it's a hyperlink relationship
      if (attrs.includes('Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"')) {
        const idMatch = attrs.match(/Id="([^"]+)"/);
        const targetMatch = attrs.match(/Target="([^"]+)"/);
        const targetModeMatch = attrs.match(/TargetMode="([^"]+)"/);
        
        if (idMatch?.[1] && targetMatch?.[1]) {
          relationships.set(idMatch[1], {
            id: idMatch[1],
            target: targetMatch[1],
            targetMode: targetModeMatch?.[1]
          });
        }
      }
    }
    
    debug.log(`Found ${relationships.size} hyperlink relationships`);
    return relationships;
  });

/**
 * Parse a hyperlink element and extract its runs
 */
export const parseHyperlink = (
  hyperlinkElement: string,
  relationships: Map<string, HyperlinkRelationship>
): { runs: DocxRun[], url?: string } => {
  const runs: DocxRun[] = [];
  let url: string | undefined;
  
  // Extract relationship ID
  const rIdMatch = hyperlinkElement.match(/r:id="([^"]+)"/);
  if (rIdMatch?.[1]) {
    const relationship = relationships.get(rIdMatch[1]);
    if (relationship) {
      url = relationship.target;
    }
  }
  
  // Extract anchor (for internal links)
  const anchorMatch = hyperlinkElement.match(/w:anchor="([^"]+)"/);
  if (anchorMatch && !url) {
    url = `#${anchorMatch[1]}`;
  }
  
  // Parse all runs within the hyperlink
  const runRegex = /<w:r[^>]*>([\s\S]*?)<\/w:r>/g;
  let runMatch;
  
  while ((runMatch = runRegex.exec(hyperlinkElement)) !== null) {
    const runContent = runMatch[1];
    if (!runContent) continue;
    
    // Extract text from the run
    const textMatch = runContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/);
    if (textMatch && textMatch[1]) {
      const text = textMatch[1];
      
      // Check for formatting
      const bold = /<w:b\s*\/>/.test(runContent) || /<w:b\s+w:val="1"/.test(runContent);
      const italic = /<w:i\s*\/>/.test(runContent) || /<w:i\s+w:val="1"/.test(runContent);
      const underline = /<w:u\s+/.test(runContent);
      
      runs.push({
        text,
        ...(bold && { bold }),
        ...(italic && { italic }),
        ...(underline && { underline }),
        ...(url && { hyperlink: url })
      });
    }
  }
  
  return { runs, url };
};

/**
 * Convert hyperlink runs to markdown link format
 */
export const formatHyperlinkAsMarkdown = (runs: DocxRun[], url?: string): string => {
  if (!url || runs.length === 0) {
    return runs.map(r => r.text).join('');
  }
  
  const linkText = runs.map(r => r.text).join('');
  return `[${linkText}](${url})`;
};