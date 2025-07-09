# shared-documentPropertiesVariantTypes.xsd

The `shared-documentPropertiesVariantTypes.xsd` schema defines a set of variant data types used for representing diverse property values within Office Open XML (OOXML) documents. These types are primarily used in custom document properties and extended document properties to store values of different fundamental data types, as well as more complex structures like vectors and arrays.

## Purpose

This schema is used to:
*   Provide a flexible type system for document properties, allowing them to hold various data types.
*   Enable the storage of structured data within document properties, such as lists (vectors) and multi-dimensional data (arrays).
*   Ensure interoperability by defining a standard set of property value types.

## Key Elements and Concepts

### `variant` Element (CT_Variant)

The `variant` element is the central type in this schema. It acts as a container that can hold a value of any of the defined basic or complex types. This allows for dynamic typing of properties.

### Basic Data Types

The schema defines elements for common basic data types, each corresponding to an XML Schema (XSD) primitive type:
*   **Integers:** `i1` (byte), `i2` (short), `i4` (int), `i8` (long), `int` (int)
*   **Unsigned Integers:** `ui1` (unsignedByte), `ui2` (unsignedShort), `ui4` (unsignedInt), `ui8` (unsignedLong), `uint` (unsignedInt)
*   **Floating-Point Numbers:** `r4` (float), `r8` (double)
*   **Strings:** `lpstr` (string), `lpwstr` (string), `bstr` (string)
*   **Boolean:** `bool` (boolean)
*   **Date/Time:** `date` (dateTime), `filetime` (dateTime)
*   **Currency:** `cy` (custom string format for currency)
*   **Error:** `error` (custom string format for error codes)
*   **Binary Data:** `blob` (base64Binary), `oblob` (base64Binary), `stream` (base64Binary), `ostream` (base64Binary)
*   **Other:** `empty`, `null`, `clsid` (GUID)

### Structured Data Types

*   **`vector` (CT_Vector):** Represents a one-dimensional array or list of values.
    *   `baseType`: Specifies the data type of the elements within the vector (e.g., `variant`, `lpstr`, `i4`).
    *   `size`: The number of elements in the vector.
    *   Can contain elements of any of the basic data types or nested `variant` elements.

*   **`array` (CT_Array):** Represents a multi-dimensional array.
    *   `baseType`: Specifies the data type of the elements within the array.
    *   `lBounds`: Lower bounds of the array dimensions.
    *   `uBounds`: Upper bounds of the array dimensions.
    *   Can contain elements of any of the basic data types or nested `variant` elements.

### `vstream` (CT_Vstream)

Represents a versioned stream of binary data, typically used for embedding custom XML data.

## Imported Schemas

This schema imports `shared-commonSimpleTypes.xsd` for basic types like `s:ST_Guid`.

## Example Usage (Conceptual)

These variant types are typically found within the `customXml` parts or `extendedProperties` parts of an OOXML document.

```xml
<vt:variant xmlns:vt="http://purl.oclc.org/ooxml/officeDocument/docPropsVTypes">
  <vt:i4>12345</vt:i4>
</vt:variant>

<vt:variant xmlns:vt="http://purl.oclc.org/ooxml/officeDocument/docPropsVTypes">
  <vt:lpstr>This is a string property.</vt:lpstr>
</vt:variant>

<vt:vector xmlns:vt="http://purl.oclc.org/ooxml/officeDocument/docPropsVTypes" baseType="lpstr" size="3">
  <vt:lpstr>Item 1</vt:lpstr>
  <vt:lpstr>Item 2</vt:lpstr>
  <vt:lpstr>Item 3</vt:lpstr>
</vt:vector>
```
