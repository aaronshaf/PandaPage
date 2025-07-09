// variant-types.ts
import type { ST_Guid } from './shared-types';

export enum ST_VectorBaseType {
  Variant = "variant",
  I1 = "i1",
  I2 = "i2",
  I4 = "i4",
  I8 = "i8",
  Ui1 = "ui1",
  Ui2 = "ui2",
  Ui4 = "ui4",
  Ui8 = "ui8",
  R4 = "r4",
  R8 = "r8",
  Lpstr = "lpstr",
  Lpwstr = "lpwstr",
  Bstr = "bstr",
  Date = "date",
  Filetime = "filetime",
  Bool = "bool",
  Cy = "cy",
  Error = "error",
  Clsid = "clsid",
}

export enum ST_ArrayBaseType {
  Variant = "variant",
  I1 = "i1",
  I2 = "i2",
  I4 = "i4",
  Int = "int",
  Ui1 = "ui1",
  Ui2 = "ui2",
  Ui4 = "ui4",
  Uint = "uint",
  R4 = "r4",
  R8 = "r8",
  Decimal = "decimal",
  Bstr = "bstr",
  Date = "date",
  Bool = "bool",
  Cy = "cy",
  Error = "error",
}

export type ST_Cy = string; // pattern "\\s*[0-9]*\\.[0-9]{4}\\s*"
export type ST_Error = string; // pattern "\\s*0x[0-9A-Za-z]{8}\\s*"

export interface CT_Empty {}
export interface CT_Null {}

// Primitive types as elements
export type VT_I1 = number; // xsd:byte
export type VT_I2 = number; // xsd:short
export type VT_I4 = number; // xsd:int
export type VT_I8 = number; // xsd:long
export type VT_Int = number; // xsd:int
export type VT_Ui1 = number; // xsd:unsignedByte
export type VT_Ui2 = number; // xsd:unsignedShort
export type VT_Ui4 = number; // xsd:unsignedInt
export type VT_Ui8 = number; // xsd:unsignedLong
export type VT_Uint = number; // xsd:unsignedInt
export type VT_R4 = number; // xsd:float
export type VT_R8 = number; // xsd:double
export type VT_Decimal = string; // xsd:decimal
export type VT_Lpstr = string; // xsd:string
export type VT_Lpwstr = string; // xsd:string
export type VT_Bstr = string; // xsd:string
export type VT_Date = string; // xsd:dateTime
export type VT_Filetime = string; // xsd:dateTime
export type VT_Bool = boolean; // xsd:boolean
export type VT_Cy = ST_Cy;
export type VT_Error = ST_Error;
export type VT_Clsid = ST_Guid;
export type VT_Blob = string; // xsd:base64Binary
export type VT_OBlob = string; // xsd:base64Binary
export type VT_Stream = string; // xsd:base64Binary
export type VT_OStream = string; // xsd:base64Binary
export type VT_Storage = string; // xsd:base64Binary
export type VT_OStorage = string; // xsd:base64Binary

export interface CT_Vstream {
  _text: string; // xsd:base64Binary
  version?: ST_Guid;
}

export type VariantValue = 
  | { variant: CT_Variant }
  | { vector: CT_Vector }
  | { array: CT_Array }
  | { blob: VT_Blob }
  | { oblob: VT_OBlob }
  | { empty: CT_Empty }
  | { null: CT_Null }
  | { i1: VT_I1 }
  | { i2: VT_I2 }
  | { i4: VT_I4 }
  | { i8: VT_I8 }
  | { int: VT_Int }
  | { ui1: VT_Ui1 }
  | { ui2: VT_Ui2 }
  | { ui4: VT_Ui4 }
  | { ui8: VT_Ui8 }
  | { uint: VT_Uint }
  | { r4: VT_R4 }
  | { r8: VT_R8 }
  | { decimal: VT_Decimal }
  | { lpstr: VT_Lpstr }
  | { lpwstr: VT_Lpwstr }
  | { bstr: VT_Bstr }
  | { date: VT_Date }
  | { filetime: VT_Filetime }
  | { bool: VT_Bool }
  | { cy: VT_Cy }
  | { error: VT_Error }
  | { stream: VT_Stream }
  | { ostream: VT_OStream }
  | { storage: VT_Storage }
  | { ostorage: VT_OStorage }
  | { vstream: CT_Vstream }
  | { clsid: VT_Clsid };

export interface CT_Variant extends VariantValue {}

export type VectorValue = 
  | { variant: CT_Variant }
  | { i1: VT_I1 }
  | { i2: VT_I2 }
  | { i4: VT_I4 }
  | { i8: VT_I8 }
  | { ui1: VT_Ui1 }
  | { ui2: VT_Ui2 }
  | { ui4: VT_Ui4 }
  | { ui8: VT_Ui8 }
  | { r4: VT_R4 }
  | { r8: VT_R8 }
  | { lpstr: VT_Lpstr }
  | { lpwstr: VT_Lpwstr }
  | { bstr: VT_Bstr }
  | { date: VT_Date }
  | { filetime: VT_Filetime }
  | { bool: VT_Bool }
  | { cy: VT_Cy }
  | { error: VT_Error }
  | { clsid: VT_Clsid };

export interface CT_Vector {
  _elements: VectorValue[];
  baseType: ST_VectorBaseType;
  size: number; // xsd:unsignedInt
}

export type ArrayValue = 
  | { variant: CT_Variant }
  | { i1: VT_I1 }
  | { i2: VT_I2 }
  | { i4: VT_I4 }
  | { int: VT_Int }
  | { ui1: VT_Ui1 }
  | { ui2: VT_Ui2 }
  | { ui4: VT_Ui4 }
  | { uint: VT_Uint }
  | { r4: VT_R4 }
  | { r8: VT_R8 }
  | { decimal: VT_Decimal }
  | { bstr: VT_Bstr }
  | { date: VT_Date }
  | { bool: VT_Bool }
  | { error: VT_Error }
  | { cy: VT_Cy };

export interface CT_Array {
  _elements: ArrayValue[];
  lBounds: number; // xsd:int
  uBounds: number; // xsd:int
  baseType: ST_ArrayBaseType;
}
