// Apple Pages document types

/**
 * Pages run properties
 */
export interface PagesRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  fontSize?: string;
}

/**
 * Pages paragraph properties
 */
export interface PagesParagraph {
  type: "paragraph";
  style?: string;
  runs: PagesRun[];
  // Additional properties that may be used by enhanced parsers
  properties?: {
    styleId?: string;
    alignment?: "left" | "center" | "right" | "justify";
    indentation?: {
      left?: string;
      right?: string;
      firstLine?: string;
    };
    spacing?: {
      before?: string;
      after?: string;
      line?: string;
    };
  };
}

/**
 * Pages document structure
 */
export interface PagesDocument {
  paragraphs: PagesParagraph[];
  metadata?: PagesMetadata;
}

/**
 * Pages metadata
 */
export interface PagesMetadata {
  title?: string;
  author?: string;
  created?: Date;
  modified?: Date;
  lastModifiedBy?: string;
  description?: string;
  subject?: string;
  keywords?: string[];
  category?: string;
  company?: string;
  pages?: number;
  words?: number;
  characters?: number;
  charactersWithSpaces?: number;
  lines?: number;
  paragraphs?: number;
  application?: string;
  version?: string;
}
