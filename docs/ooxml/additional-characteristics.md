# OOXML Additional Characteristics

The `shared-additionalCharacteristics.xsd` schema provides a mechanism to associate arbitrary, extensible characteristics with a document or its parts. This allows applications to store custom metadata or properties that are not covered by the standard document properties.

## Core Structure

The additional characteristics data is typically stored in a separate part within the OOXML package. The root element for this part is `<ac:additionalCharacteristics>`.

### `<ac:additionalCharacteristics>` Element

This element acts as a container for all the custom characteristics defined for the document.

| Child Element | Description |
| --- | --- |
| `<ac:characteristic>` | Represents a single custom characteristic. |

```typescript
interface AdditionalCharacteristics {
  characteristics: Characteristic[];
}
```

### `<ac:characteristic>` Element

Each `<ac:characteristic>` element defines a single characteristic with a name, a value, and a defined relationship.

| Attribute | Description |
| --- | --- |
| `name` | The name of the characteristic (e.g., "DocumentSensitivity"). |
| `relation` | Defines the relationship between the characteristic and its value. Possible values include `ge` (greater than or equal to), `le` (less than or equal to), `gt` (greater than), `lt` (less than), `eq` (equal to). |
| `val` | The value of the characteristic. |
| `vocabulary` | (Optional) A URI that identifies the vocabulary or schema from which the characteristic is drawn. |

```typescript
interface Characteristic {
  name: string;
  relation: 'ge' | 'le' | 'gt' | 'lt' | 'eq';
  value: string;
  vocabulary?: string;
}
```

## Example

Here is a simplified XML example of additional characteristics.

```xml
<ac:additionalCharacteristics xmlns:ac="http://purl.oclc.org/ooxml/officeDocument/characteristics">
  <ac:characteristic name="DocumentSensitivity" relation="eq" val="Confidential"/>
  <ac:characteristic name="ReviewDate" relation="gt" val="2024-01-01"/>
</ac:additionalCharacteristics>
```

This schema provides a flexible way to extend the metadata associated with an OOXML document beyond the standard properties.
