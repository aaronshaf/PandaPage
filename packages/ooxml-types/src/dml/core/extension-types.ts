/**
 * DrawingML Extension Types
 * @see ECMA-376 Part 1, Section 20.1.2 (Extensions)
 */

import type { ST_String, ST_Guid } from '../../shared-types';

/**
 * Office Art Extension
 * @see ECMA-376 Part 1, §20.1.2.2.14
 */
export interface CT_OfficeArtExtension {
  uri?: ST_String;
  // Any element from any namespace
}

/**
 * Office Art Extension List
 * @see ECMA-376 Part 1, §20.1.2.2.15
 */
export interface CT_OfficeArtExtensionList {
  ext?: CT_OfficeArtExtension[];
}