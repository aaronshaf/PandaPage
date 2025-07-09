/**
 * SpreadsheetML Comment Types
 * @see ECMA-376 Part 1, §18.7 (Comments)
 */

import type { ST_Xstring, ST_Guid } from '../shared/common-types';
import type { ST_CellRef } from './cell-types';

/**
 * Text horizontal alignment.
 * @see ECMA-376 Part 1, §18.18.40 ST_TextHAlign
 */
export enum ST_TextHAlign {
  Left = "left",
  Center = "center",
  Right = "right",
  Justify = "justify",
  Distributed = "distributed",
}

/**
 * Text vertical alignment.
 * @see ECMA-376 Part 1, §18.18.93 ST_TextVAlign
 */
export enum ST_TextVAlign {
  Top = "top",
  Center = "center",
  Bottom = "bottom",
  Justify = "justify",
  Distributed = "distributed",
}

/**
 * Object anchor.
 * @see ECMA-376 Part 1, §18.18.58 ST_ObjectAnchor
 */
export enum ST_ObjectAnchor {
  Absolute = "absolute",
  OneCell = "oneCell",
  TwoCell = "twoCell",
}

/**
 * Comment properties.
 * @see ECMA-376 Part 1, §18.7.3 CT_CommentPr
 */
export interface CT_CommentPr {
  anchor?: ST_ObjectAnchor;
  locked?: boolean;
  defaultSize?: boolean;
  print?: boolean;
  disabled?: boolean;
  autoFill?: boolean;
  autoLine?: boolean;
  altText?: ST_Xstring;
  textHAlign?: ST_TextHAlign;
  textVAlign?: ST_TextVAlign;
  lockText?: boolean;
  justLastX?: boolean;
  autoScale?: boolean;
}

/**
 * Comment.
 * @see ECMA-376 Part 1, §18.7.2 CT_Comment
 */
export interface CT_Comment {
  text: any; // CT_Rst - rich text
  commentPr?: CT_CommentPr;
  ref: ST_CellRef;
  authorId: number; // xsd:unsignedInt
  guid?: ST_Guid;
  shapeId?: number; // xsd:unsignedInt
}

/**
 * Comment list.
 * @see ECMA-376 Part 1, §18.7.4 CT_CommentList
 */
export interface CT_CommentList {
  comment?: CT_Comment[];
}

/**
 * Authors.
 * @see ECMA-376 Part 1, §18.7.1 CT_Authors
 */
export interface CT_Authors {
  author: ST_Xstring[];
}

/**
 * Comments.
 * @see ECMA-376 Part 1, §18.7.6 CT_Comments
 */
export interface CT_Comments {
  authors: CT_Authors;
  commentList: CT_CommentList;
  extLst?: any; // CT_ExtensionList
}