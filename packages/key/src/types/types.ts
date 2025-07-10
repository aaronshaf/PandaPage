// Apple Keynote document types

/**
 * Keynote slide content types
 */
export interface KeyContent {
  type: "text" | "title" | "bullet" | "image";
  text?: string;
  level?: number; // For bullets
  src?: string; // For images
  properties?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fontSize?: string;
    alignment?: "left" | "center" | "right" | "justify";
  };
}

/**
 * Keynote slide properties
 */
export interface KeySlide {
  type: "slide";
  slideNumber: number;
  title?: string;
  content: KeyContent[];
  properties?: {
    background?: {
      color?: string;
      image?: string;
    };
    transition?: {
      type?: string;
      duration?: number;
    };
  };
}

/**
 * Keynote document metadata
 */
export interface KeyMetadata {
  title?: string;
  author?: string;
  slideCount?: number;
  created?: Date;
  modified?: Date;
  lastModifiedBy?: string;
  description?: string;
  subject?: string;
  keywords?: string[];
  category?: string;
  company?: string;
  application?: string;
  version?: string;
  // Presentation-specific metadata
  theme?: string;
  slideSize?: {
    width?: number;
    height?: number;
  };
  duration?: number; // Total presentation duration in seconds
}

/**
 * Keynote document structure
 */
export interface KeyDocument {
  slides: KeySlide[];
  metadata?: KeyMetadata;
}