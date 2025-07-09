/**
 * Custom Document Properties Types
 * Based on shared-documentPropertiesCustom.xsd
 * Namespace: http://purl.oclc.org/ooxml/officeDocument/customProperties
 */

// Import variant types that are referenced
import type {
  CT_Vector,
  CT_Array,
  VT_Blob,
  CT_Null,
  VT_I1,
  VT_I2,
  VT_I4,
  VT_I8,
  VT_Int,
  VT_Ui1,
  VT_Ui2,
  VT_Ui4,
  VT_Ui8,
  VT_Uint,
  VT_R4,
  VT_R8,
  VT_Decimal,
  VT_Lpstr,
  VT_Lpwstr,
  VT_Bstr,
  VT_Date,
  VT_Filetime,
  VT_Bool,
  VT_Cy,
  VT_Error,
  VT_Stream,
  VT_Storage,
  CT_Vstream,
  VT_Clsid
} from '../variant-types';
import type { CT_Empty } from '../dml-main';

/**
 * Union type for all possible property value types
 */
export type PropertyValue = 
  | CT_Vector
  | CT_Array
  | VT_Blob
  | VT_Blob // oblob
  | CT_Empty
  | CT_Null
  | VT_I1
  | VT_I2
  | VT_I4
  | VT_I8
  | VT_Int
  | VT_Ui1
  | VT_Ui2
  | VT_Ui4
  | VT_Ui8
  | VT_Uint
  | VT_R4
  | VT_R8
  | VT_Decimal
  | VT_Lpstr
  | VT_Lpwstr
  | VT_Bstr
  | VT_Date
  | VT_Filetime
  | VT_Bool
  | VT_Cy
  | VT_Error
  | VT_Stream
  | VT_Stream // ostream
  | VT_Storage
  | VT_Storage // ostorage
  | CT_Vstream
  | VT_Clsid;

/**
 * Custom property with format ID, property ID, and value
 */
export interface CT_Property {
  /** Property value (one of the variant types) */
  value: PropertyValue;
  /** Required format ID (GUID) */
  fmtid: string;
  /** Required property ID */
  pid: number;
  /** Optional property name */
  name?: string;
  /** Optional link target */
  linkTarget?: string;
}

/**
 * Container for custom document properties
 */
export interface CT_Properties {
  /** Array of custom property elements */
  property?: CT_Property[];
}