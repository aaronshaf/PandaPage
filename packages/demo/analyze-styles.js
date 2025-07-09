import { readFile } from 'fs/promises';
import JSZip from 'jszip';
import { JSDOM } from 'jsdom';

// Mock DOM for Node.js
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.DOMParser = dom.window.DOMParser;

async function analyzeStyles() {
  console.log('Analyzing 011.docx styles and structure...');
  
  try {
    const buffer = await readFile('./public/011.docx');
    const zip = new JSZip();
    await zip.loadAsync(buffer);
    
    // Extract styles.xml
    const stylesFile = zip.file('word/styles.xml');
    if (stylesFile) {
      const stylesXml = await stylesFile.async('text');
      console.log('\\n=== STYLES.XML ANALYSIS ===');
      console.log('Styles XML length:', stylesXml.length);
      
      // Parse styles XML
      const parser = new DOMParser();
      const stylesDoc = parser.parseFromString(stylesXml, 'application/xml');
      
      // Find all style elements
      const styles = stylesDoc.getElementsByTagName('w:style');
      console.log('\\nFound', styles.length, 'styles:');
      
      for (let i = 0; i < styles.length; i++) {
        const style = styles[i];
        const styleType = style.getAttribute('w:type');
        const styleId = style.getAttribute('w:styleId');
        const isDefault = style.getAttribute('w:default') === '1';
        
        const nameElement = style.getElementsByTagName('w:name')[0];
        const displayName = nameElement?.getAttribute('w:val') || 'Unnamed';
        
        const basedOnElement = style.getElementsByTagName('w:basedOn')[0];
        const basedOn = basedOnElement?.getAttribute('w:val') || 'None';
        
        console.log(`  ${i + 1}. Type: ${styleType}, ID: ${styleId}, Name: "${displayName}", Default: ${isDefault}, BasedOn: ${basedOn}`);
        
        // Check if this looks like a heading style
        if (styleId && (
          styleId.toLowerCase().includes('heading') || 
          styleId.toLowerCase().includes('title') ||
          displayName.toLowerCase().includes('heading') ||
          displayName.toLowerCase().includes('title')
        )) {
          console.log(`    >>> POTENTIAL HEADING STYLE <<<`);
          
          // Show style properties
          const pPr = style.getElementsByTagName('w:pPr')[0];
          if (pPr) {
            const outlineLvl = pPr.getElementsByTagName('w:outlineLvl')[0];
            if (outlineLvl) {
              const level = outlineLvl.getAttribute('w:val');
              console.log(`    Outline Level: ${level}`);
            }
          }
          
          const rPr = style.getElementsByTagName('w:rPr')[0];
          if (rPr) {
            const bold = rPr.getElementsByTagName('w:b')[0];
            const size = rPr.getElementsByTagName('w:sz')[0];
            const color = rPr.getElementsByTagName('w:color')[0];
            
            console.log(`    Bold: ${!!bold}, Size: ${size?.getAttribute('w:val') || 'default'}, Color: ${color?.getAttribute('w:val') || 'auto'}`);
          }
        }
      }
    } else {
      console.log('No styles.xml found');
    }
    
    // Extract document.xml and check what styles are actually used
    const documentFile = zip.file('word/document.xml');
    if (documentFile) {
      const documentXml = await documentFile.async('text');
      const parser = new DOMParser();
      const documentDoc = parser.parseFromString(documentXml, 'application/xml');
      
      console.log('\\n=== DOCUMENT STYLE USAGE ===');
      
      // Find all pStyle elements
      const pStyles = documentDoc.getElementsByTagName('w:pStyle');
      const styleUsage = {};
      
      for (let i = 0; i < pStyles.length; i++) {
        const pStyle = pStyles[i];
        const styleId = pStyle.getAttribute('w:val');
        if (styleId) {
          styleUsage[styleId] = (styleUsage[styleId] || 0) + 1;
        }
      }
      
      console.log('Style usage in document:');
      Object.entries(styleUsage).forEach(([styleId, count]) => {
        console.log(`  ${styleId}: ${count} times`);
      });
      
      // Check specific paragraphs for styles
      console.log('\\n=== PARAGRAPH ANALYSIS ===');
      const paragraphs = documentDoc.getElementsByTagName('w:p');
      
      for (let i = 0; i < Math.min(15, paragraphs.length); i++) {
        const paragraph = paragraphs[i];
        const pPr = paragraph.getElementsByTagName('w:pPr')[0];
        let styleId = 'Normal';
        let text = '';
        
        if (pPr) {
          const pStyleElement = pPr.getElementsByTagName('w:pStyle')[0];
          if (pStyleElement) {
            styleId = pStyleElement.getAttribute('w:val') || 'Normal';
          }
        }
        
        // Get paragraph text
        const runs = paragraph.getElementsByTagName('w:r');
        for (let j = 0; j < runs.length; j++) {
          const run = runs[j];
          const textElements = run.getElementsByTagName('w:t');
          for (let k = 0; k < textElements.length; k++) {
            text += textElements[k].textContent || '';
          }
        }
        
        text = text.trim();
        if (text) {
          console.log(`Paragraph ${i + 1}: Style="${styleId}", Text="${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"`);
        }
      }
    }
    
    // Check if there's a theme
    const themeFile = zip.file('word/theme/theme1.xml');
    if (themeFile) {
      console.log('\\n=== THEME FOUND ===');
      const themeXml = await themeFile.async('text');
      console.log('Theme XML length:', themeXml.length);
      
      // Parse theme for color scheme
      const parser = new DOMParser();
      const themeDoc = parser.parseFromString(themeXml, 'application/xml');
      const colorScheme = themeDoc.getElementsByTagName('a:clrScheme')[0];
      if (colorScheme) {
        const schemeName = colorScheme.getAttribute('name');
        console.log('Color scheme name:', schemeName);
        
        // Show accent colors
        for (let i = 1; i <= 6; i++) {
          const accent = colorScheme.getElementsByTagName(`a:accent${i}`)[0];
          if (accent) {
            const srgb = accent.getElementsByTagName('a:srgbClr')[0];
            if (srgb) {
              const color = srgb.getAttribute('val');
              console.log(`  Accent ${i}: #${color}`);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error analyzing styles:', error);
  }
}

analyzeStyles();