# OOXML Bibliography

The `shared-bibliography.xsd` schema defines the structure for managing bibliographic sources and citations within an OOXML document. This allows applications like Microsoft Word to store and manage a list of references that can be used to generate bibliographies and citations in various styles.

## Core Structure

The bibliography data is typically stored in a separate part within the OOXML package, often named `word/bibliography/sources.xml`. The root element for this part is `<b:Sources>`.

### `<b:Sources>` Element

This element acts as a container for all the bibliographic sources in the document.

| Child Element | Description |
| --- | --- |
| `<b:Source>` | Represents a single bibliographic source (e.g., a book, journal article, website). |

```typescript
interface Bibliography {
  sources: Source[];
  selectedStyle?: string; // The currently selected bibliography style
  styleName?: string; // The name of the style
  uri?: string; // URI of the style
}
```

### `<b:Source>` Element

Each `<b:Source>` element defines a single bibliographic entry. The type of source is specified by the `<b:SourceType>` child element, which dictates which other fields are relevant.

**Common Source Types (`ST_SourceType` enumeration):**

*   `ArticleInAPeriodical`
*   `Book`
*   `BookSection`
*   `JournalArticle`
*   `ConferenceProceedings`
*   `Report`
*   `InternetSite`
*   `Film`
*   `Interview`
*   `Patent`
*   `Misc`

**Common Fields within a `<b:Source>`:**

| Element | Description | Applicable Source Types (Examples) |
| --- | --- | --- |
| `<b:Title>` | The title of the source. | All |
| `<b:Author>` | The author(s) of the source. | Most |
| `<b:Year>` | The year of publication. | Most |
| `<b:Publisher>` | The publisher. | Book, BookSection |
| `<b:URL>` | The URL of the source. | InternetSite |
| `<b:JournalName>` | The name of the journal. | JournalArticle |
| `<b:Pages>` | Page numbers. | JournalArticle, BookSection |
| `<b:City>` | City of publication. | Book |
| `<b:Edition>` | Edition number. | Book |
| `<b:Tag>` | A unique identifier for the source. | All |

## Author Structure (`<b:Author>`)

The `<b:Author>` element is a complex type that can contain a list of individual persons or a corporate author.

### `<b:NameList>` (for individual authors)

Contains one or more `<b:Person>` elements.

### `<b:Person>`

Defines an individual author with separate fields for first, middle, and last names.

| Element | Description |
| --- | --- |
| `<b:Last>` | Last name. |
| `<b:First>` | First name. |
| `<b:Middle>` | Middle name(s). |

### `<b:Corporate>` (for corporate authors)

Contains a string value for the corporate author's name.

```typescript
interface Source {
  sourceType: string; // Corresponds to ST_SourceType
  tag: string; // Unique identifier for the source
  fields: { [key: string]: string | Author[] }; // Flexible for various fields
}

interface Author {
  type: 'person' | 'corporate';
  person?: Person;
  corporateName?: string;
}

interface Person {
  first?: string;
  middle?: string;
  last: string;
}
```

## Example: A Book Source

Here is a simplified XML example of a book source.

```xml
<b:Source>
  <b:SourceType>Book</b:SourceType>
  <b:Tag>BookExample2023</b:Tag>
  <b:Author>
    <b:Author>
      <b:NameList>
        <b:Person>
          <b:Last>Doe</b:Last>
          <b:First>John</b:First>
        </b:Person>
        <b:Person>
          <b:Last>Smith</b:Last>
          <b:First>Jane</b:First>
        </b:Person>
      </b:NameList>
    </b:Author>
  </b:Author>
  <b:Title>The Ultimate Guide to OOXML</b:Title>
  <b:Year>2023</b:Year>
  <b:Publisher>Tech Books Inc.</b:Publisher>
  <b:City>New York</b:City>
</b:Source>
```

Parsing bibliography data involves reading the `sources.xml` part, identifying the source type, and then extracting the relevant fields. The flexible nature of the fields (many are optional and depend on the source type) requires careful handling during parsing.
