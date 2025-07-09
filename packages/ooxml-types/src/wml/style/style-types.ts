/**
 * WordprocessingML Style Types
 * Based on wml.xsd style definitions
 */

/**
 * Style type enumeration
 */
export type ST_StyleType = 'paragraph' | 'character' | 'table' | 'numbering';

/**
 * Latent style exception
 */
export interface CT_LsdException {
  /** Style name */
  name: string;
  /** Locked flag */
  locked?: boolean;
  /** UI priority */
  uiPriority?: number;
  /** Semi-hidden flag */
  semiHidden?: boolean;
  /** Unhide when used flag */
  unhideWhenUsed?: boolean;
  /** Quick format flag */
  qFormat?: boolean;
}

/**
 * Latent styles container
 */
export interface CT_LatentStyles {
  /** Default locked state */
  defLockedState?: boolean;
  /** Default UI priority */
  defUIPriority?: number;
  /** Default semi-hidden state */
  defSemiHidden?: boolean;
  /** Default unhide when used state */
  defUnhideWhenUsed?: boolean;
  /** Default primary style state */
  defQFormat?: boolean;
  /** Style count */
  count?: number;
  /** Latent style exceptions */
  lsdException?: CT_LsdException[];
}

/**
 * Document default styles
 */
export interface CT_DocDefaults {
  /** Default run properties */
  rPrDefault?: any; // CT_RPrDefault
  /** Default paragraph properties */
  pPrDefault?: any; // CT_PPrDefault
}

/**
 * Style definition
 */
export interface CT_Style {
  /** Style name */
  name?: string;
  /** Style aliases */
  aliases?: string;
  /** Based on style ID */
  basedOn?: string;
  /** Next style ID */
  next?: string;
  /** Linked style ID */
  link?: string;
  /** Auto-redefine flag */
  autoRedefine?: boolean;
  /** Hidden flag */
  hidden?: boolean;
  /** UI priority */
  uiPriority?: number;
  /** Semi-hidden flag */
  semiHidden?: boolean;
  /** Unhide when used flag */
  unhideWhenUsed?: boolean;
  /** Quick format flag */
  qFormat?: boolean;
  /** Locked flag */
  locked?: boolean;
  /** Personal flag */
  personal?: boolean;
  /** Personal compose flag */
  personalCompose?: boolean;
  /** Personal reply flag */
  personalReply?: boolean;
  /** Revision save ID */
  rsid?: string;
  /** Paragraph properties */
  pPr?: any; // CT_PPr
  /** Run properties */
  rPr?: any; // CT_RPr
  /** Table properties */
  tblPr?: any; // CT_TblPr
  /** Table row properties */
  trPr?: any; // CT_TrPr
  /** Table cell properties */
  tcPr?: any; // CT_TcPr
  /** Table style properties */
  tblStylePr?: any; // CT_TblStylePr
  /** Style type */
  type?: ST_StyleType;
  /** Style ID */
  styleId?: string;
  /** Default flag */
  default?: boolean;
  /** Custom style flag */
  customStyle?: boolean;
}

/**
 * Styles container
 */
export interface CT_Styles {
  /** Document defaults */
  docDefaults?: CT_DocDefaults;
  /** Latent styles */
  latentStyles?: CT_LatentStyles;
  /** Style definitions */
  style?: CT_Style[];
}