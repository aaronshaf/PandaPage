# OOXML Custom XML Data Properties

The `shared-customXmlDataProperties.xsd` schema defines the properties for custom XML data parts embedded within an OOXML document. This feature allows users to store arbitrary XML data alongside the document content, which can be used to drive content controls or manage structured information within the document.

## Core Structure

Custom XML data is stored in separate parts within the OOXML package (e.g., `customXml/item1.xml`). The properties for these custom XML data stores are defined in a `customXml/itemProps1.xml` part, which uses this schema. The root element for this part is `<cx:datastoreItem>`.

### `<cx:datastoreItem>` Element

This element represents a single custom XML data store and its associated properties.

| Attribute | Description |
| --- | --- |
| `itemID` | A GUID (Globally Unique Identifier) that uniquely identifies this custom XML data store. This ID is used to link the properties to the actual custom XML data part. |

| Child Element | Description |
| --- | --- |
| `<cx:schemaRefs>` | A container for references to XML schemas that are associated with and validate the custom XML data in this store. |

```typescript
interface DatastoreItem {
  itemID: string; // GUID
  schemaRefs?: DatastoreSchemaRef[];
}
```

### `<cx:schemaRefs>` Element

This element contains a list of schema references.

| Child Element | Description |
| --- | --- |
| `<cx:schemaRef>` | A reference to a single XML schema. |

```typescript
interface DatastoreSchemaRefs {
  schemaRefs: DatastoreSchemaRef[];
}
```

### `<cx:schemaRef>` Element

This element defines a reference to an XML schema.

| Attribute | Description |
| --- | --- |
| `uri` | The URI (Uniform Resource Identifier) of the XML schema. This URI is used to identify the schema that the custom XML data conforms to. |

```typescript
interface DatastoreSchemaRef {
  uri: string;
}
```

## Example

Here is a simplified XML example of a `datastoreItem` part (`customXml/itemProps1.xml`) that points to a custom XML data part (`customXml/item1.xml`) and references a schema.

```xml
<cx:datastoreItem xmlns:cx="http://purl.oclc.org/ooxml/officeDocument/customXml"
                  itemID="{12345678-1234-1234-1234-1234567890AB}">
  <cx:schemaRefs>
    <cx:schemaRef uri="http://example.com/myCustomSchema"/>
  </cx:schemaRefs>
</cx:datastoreItem>
```

And the corresponding custom XML data part (`customXml/item1.xml`):

```xml
<my:data xmlns:my="http://example.com/myCustomSchema">
  <my:name>John Doe</my:name>
  <my:age>30</my:age>
</my:data>
```

This mechanism allows for robust validation and manipulation of custom data within an OOXML document.
