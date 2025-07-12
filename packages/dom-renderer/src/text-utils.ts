import type { TextRun, Paragraph } from "@browser-document-viewer/parser";
import { getTextRunStyles, getParagraphStyles } from "./style-utils";

export function renderEnhancedTextRun(
  run: TextRun,
  doc: Document,
  enableAdvancedFormatting: boolean = true,
): HTMLElement {
  const span = doc.createElement("span");
  
  // Apply inline styles from text run properties
  const baseStyles = getTextRunStyles(run);
  if (baseStyles) {
    span.style.cssText = baseStyles;
  }

  // Advanced formatting
  if (enableAdvancedFormatting) {
    if (run.superscript) {
      const sup = doc.createElement("sup");
      sup.textContent = run.text || "";
      
      // Apply any additional styling by wrapping in a span if needed
      if (run.color || run.backgroundColor || run.bold || run.italic || run.underline || run.strikethrough || run.link) {
        const wrapper = doc.createElement("span");
        
        // Apply inline styles
        if (run.color && run.color !== "auto") {
          wrapper.style.color = run.color.startsWith("#") ? run.color : `#${run.color}`;
        }
        if (run.backgroundColor && run.backgroundColor !== "auto") {
          wrapper.style.backgroundColor = run.backgroundColor.startsWith("#") ? run.backgroundColor : `#${run.backgroundColor}`;
        }
        
        // Apply inline styles
        const textStyles = getTextRunStyles(run);
        if (textStyles) {
          wrapper.style.cssText = textStyles;
        }
        
        // Handle links
        if (run.link) {
          const link = doc.createElement("a");
          link.href = run.link;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.style.cssText = wrapper.style.cssText;
          link.appendChild(sup);
          return link;
        }
        
        wrapper.appendChild(sup);
        return wrapper;
      }
      
      return sup;
    }

    if (run.subscript) {
      const sub = doc.createElement("sub");
      sub.textContent = run.text || "";
      
      // Apply any additional styling by wrapping in a span if needed
      if (run.color || run.backgroundColor || run.bold || run.italic || run.underline || run.strikethrough || run.link) {
        const wrapper = doc.createElement("span");
        
        // Apply inline styles
        if (run.color && run.color !== "auto") {
          wrapper.style.color = run.color.startsWith("#") ? run.color : `#${run.color}`;
        }
        if (run.backgroundColor && run.backgroundColor !== "auto") {
          wrapper.style.backgroundColor = run.backgroundColor.startsWith("#") ? run.backgroundColor : `#${run.backgroundColor}`;
        }
        
        // Apply inline styles
        const textStyles = getTextRunStyles(run);
        if (textStyles) {
          wrapper.style.cssText = textStyles;
        }
        
        // Handle links
        if (run.link) {
          const link = doc.createElement("a");
          link.href = run.link;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          // Style already applied through cssText
          link.style.cssText = wrapper.style.cssText;
          link.appendChild(sub);
          return link;
        }
        
        wrapper.appendChild(sub);
        return wrapper;
      }
      
      return sub;
    }

    // Additional text effects already handled in style-utils

    // Colors are already handled in style-utils

    // Highlight support
    if (run.highlightColor && run.highlightColor !== "none") {
      const highlightColors: Record<string, string> = {
        yellow: "#ffff00",
        green: "#00ff00",
        cyan: "#00ffff",
        magenta: "#ff00ff",
        blue: "#0000ff",
        red: "#ff0000",
        darkGray: "#808080",
        lightGray: "#d3d3d3",
      };

      const highlightColor = highlightColors[run.highlightColor];
      if (highlightColor) {
        span.style.backgroundColor = highlightColor;
      }
    }
  }

  // No more classes to apply - all styling is inline

  // Handle links
  if (run.link) {
    const link = doc.createElement("a");
    link.href = run.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.cssText = span.style.cssText;
    link.textContent = run.text || "";
    return link;
  }

  span.textContent = run.text || "";
  return span;
}

export function renderEnhancedParagraph(
  paragraph: Paragraph,
  doc: Document,
  options: {
    enableDropcaps?: boolean;
    enableAdvancedFormatting?: boolean;
  },
  renderTextRun: (run: TextRun) => HTMLElement,
  renderImage: (image: any) => HTMLElement,
): HTMLElement {
  const p = doc.createElement("p");
  
  // Apply inline styles from paragraph properties
  const styles = getParagraphStyles(paragraph);
  if (styles) {
    p.style.cssText = styles;
  }

  // Check for dropcap (first character styling)
  if (
    options.enableDropcaps &&
    paragraph.runs &&
    paragraph.runs.length > 0 &&
    paragraph.runs[0]?.text
  ) {
    const firstRun = paragraph.runs[0];
    const text = firstRun.text || "";

    // Look for dropcap pattern (capital letter at start)
    if (text.length > 0 && /^[A-Z]/.test(text)) {
      // Check if this might be a dropcap paragraph (e.g., starts a new section)
      const isLikelyDropcap =
        paragraph.style === "Normal" &&
        text.length > 50 && // Substantial paragraph
        /^[A-Z][a-z]/.test(text); // Capital followed by lowercase

      if (isLikelyDropcap) {
        // Create dropcap
        const dropcap = doc.createElement("span");
        dropcap.style.cssText = "float: left; font-size: 3em; line-height: 0.8; margin: 0 0.1em 0 0; font-weight: bold;";
        dropcap.textContent = text.charAt(0);
        p.appendChild(dropcap);

        // Add the rest of the first run
        const remainingText = Object.assign({}, firstRun, { text: text.substring(1) });
        p.appendChild(renderTextRun(remainingText));

        // Add remaining runs
        paragraph.runs.slice(1).forEach((run) => {
          p.appendChild(renderTextRun(run));
        });

        return p;
      }
    }
  }

  // Normal paragraph rendering
  if (paragraph.runs) {
    paragraph.runs.forEach((run) => {
      p.appendChild(renderTextRun(run));
    });
  }

  // Handle images in paragraph
  if (paragraph.images && paragraph.images.length > 0) {
    paragraph.images.forEach((img) => {
      const imgEl = renderImage(img);
      p.appendChild(imgEl);
    });
  }

  return p;
}
