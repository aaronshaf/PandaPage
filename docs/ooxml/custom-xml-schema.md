# OOXML Custom XML Schema Properties

The `shared-customXmlSchemaProperties.xsd` schema defines references to custom XML schemas that are used within an OOXML document. These references allow applications to understand and validate the structure and content of custom XML data embedded in the document.

## Core Structure

The custom XML schema references are typically stored in a separate part within the OOXML package, often named `word/settings.xml` or a similar settings file. The root element for this part is `<sl:schemaLibrary>`.

### `<sl:schemaLibrary>` Element

This element acts as a container for all the custom XML schema references defined for the document.

| Child Element | Description |
| --- | --- |
| `<sl:schema>` | Represents a single reference to a custom XML schema. |

```typescript
interface SchemaLibrary {
  schemas: Schema[];
}
```

### `<sl:schema>` Element

Each `<sl:schema>` element defines a reference to an XML schema.

| Attribute | Description |
| --- | --- |
| `uri` | The URI (Uniform Resource Identifier) of the XML schema. This typically corresponds to the target namespace of the schema. |
| `manifestLocation` | The location of the schema file itself. This can be a URL or a path within the OOXML package. |
| `schemaLocation` | (Optional) A hint for the location of the schema. |
| `schemaLanguage` | The language of the schema (e.g., `http://www.w3.org/2001/XMLSchema` for XSD). |

```typescript
interface Schema {
  uri: string;
  manifestLocation: string;
  schemaLocation?: string;
  schemaLanguage?: string;
}
```

## Example

Here is a simplified XML example of a `schemaLibrary` element, referencing a custom schema.

```xml
<sl:schemaLibrary xmlns:sl="http://purl.oclc.org/ooxml/schemaLibrary/main">
  <sl:schema uri="http://example.com/myCustomSchema" manifestLocation="customSchema.xsd"/>
</sl:schemaLibrary>
```

This mechanism is crucial for applications that need to work with structured custom XML data embedded within OOXML documents, allowing them to validate and process the data according to its defined schema.
