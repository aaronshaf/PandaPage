# shared-documentPropertiesExtended.xsd

The `shared-documentPropertiesExtended.xsd` schema defines the "Extended Properties" part of an Office Open XML (OOXML) document. This part contains a collection of statistical and application-specific properties that provide additional metadata about the document, often automatically generated and updated by the creating application.

## Purpose

This schema is used to:
*   Store various statistical information about the document, such as page count, word count, character count, and slide count.
*   Record application-specific details, including the name of the application that created the document and its version.
*   Track other extended properties like template, manager, company, and hyperlink information.

## Key Elements and Concepts

### `Properties` Element

The root element defined by this schema is `Properties`, which is of type `CT_Properties`. This element contains all the extended document properties.

### `CT_Properties` Complex Type

The `CT_Properties` complex type defines a comprehensive set of elements, many of which are optional:

*   **Document Statistics:**
    *   `Pages`: Total number of pages.
    *   `Words`: Total number of words.
    *   `Characters`: Total number of characters (excluding spaces).
    *   `CharactersWithSpaces`: Total number of characters (including spaces).
    *   `Lines`: Total number of lines.
    *   `Paragraphs`: Total number of paragraphs.
    *   `Slides`: Total number of slides (for presentations).
    *   `Notes`: Total number of notes pages (for presentations).
    *   `HiddenSlides`: Number of hidden slides.
    *   `TotalTime`: Total editing time in minutes.
    *   `MMClips`: Number of multimedia clips.

*   **Application Information:**
    *   `Application`: Name of the application that created the document (e.g., "Microsoft Word").
    *   `AppVersion`: Version of the creating application.

*   **General Document Information:**
    *   `Template`: The template used to create the document.
    *   `Manager`: The manager of the document's author.
    *   `Company`: The company associated with the document.
    *   `PresentationFormat`: The format of the presentation (for presentations).
    *   `HyperlinkBase`: The base URL for relative hyperlinks.
    *   `HyperlinksChanged`: Indicates if hyperlinks have changed.
    *   `SharedDoc`: Indicates if the document is shared.
    *   `DocSecurity`: Document security settings.

*   **Structured Properties:**
    *   `HeadingPairs`: A vector of heading names and their corresponding counts.
    *   `TitlesOfParts`: A vector of titles of document parts.
    *   `HLinks`: A vector of hyperlink information.

## Imported Schemas

This schema imports definitions from `shared-documentPropertiesVariantTypes.xsd` (aliased as `vt`), which provides the `vt:vector` and `vt:blob` types used for structured properties like `HeadingPairs`, `TitlesOfParts`, and `HLinks`.

## Example Usage (Conceptual)

An `app.xml` part within an OOXML package would contain the `Properties` element with these extended properties.

```xml
<Properties xmlns="http://purl.oclc.org/ooxml/officeDocument/extendedProperties" xmlns:vt="http://purl.oclc.org/ooxml/officeDocument/docPropsVTypes">
  <Template>Normal.dotm</Template>
  <Manager>John Doe</Manager>
  <Company>Example Corp</Company>
  <Pages>10</Pages>
  <Words>1500</Words>
  <Characters>8000</Characters>
  <Application>Microsoft Word</Application>
  <AppVersion>16.0000</AppVersion>
  <DocSecurity>0</DocSecurity>
  <HeadingPairs>
    <vt:vector baseType="variant" size="2">
      <vt:variant>
        <vt:lpstr>Title</vt:lpstr>
      </vt:variant>
      <vt:variant>
        <vt:i4>1</vt:i4>
      </vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector baseType="lpstr" size="1">
      <vt:lpstr>Document</vt:lpstr>
    </vt:vector>
  </TitlesOfParts>
</Properties>
```
