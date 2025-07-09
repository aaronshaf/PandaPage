# OOXML Document Properties

OOXML documents contain metadata, or properties, that describe the document itself. This information is stored in separate parts within the OOXML package. There are three main types of document properties.

## 1. Core Properties

*   **File:** `docProps/core.xml`
*   **Schema:** Dublin Core Metadata Initiative

Core properties are a set of standard metadata fields defined by the Dublin Core standard. These are common properties that can be applied to any document.

**Common Core Properties:**

*   `dc:title`: The title of the document.
*   `dc:creator`: The author of the document.
*   `dc:subject`: The subject of the document.
*   `dc:description`: A description of the document.
*   `dc:created`: The date the document was created.
*   `dc:modified`: The date the document was last modified.

**Example (`core.xml`):**
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" 
                   xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>My Document Title</dc:title>
  <dc:creator>John Doe</dc:creator>
  <cp:lastModifiedBy>Jane Doe</cp:lastModifiedBy>
  <cp:revision>1</cp:revision>
  <dcterms:created xmlns:dcterms="http://purl.org/dc/terms/" xsi:type="dcterms:W3CDTF">2024-01-01T10:00:00Z</dcterms:created>
  <dcterms:modified xmlns:dcterms="http://purl.org/dc/terms/" xsi:type="dcterms:W3CDTF">2024-01-01T11:00:00Z</dcterms:modified>
</cp:coreProperties>
```

## 2. Extended Properties

*   **File:** `docProps/app.xml`
*   **Schema:** `shared-documentPropertiesExtended.xsd`

Extended properties, often called "app properties," are application-specific metadata. They store information that is relevant to the application that created the document (e.g., Microsoft Word).

**Common Extended Properties:**

*   `Application`: The name of the application (e.g., "Microsoft Office Word").
*   `AppVersion`: The version of the application.
*   `Pages`: The number of pages in the document.
*   `Words`: The word count.
*   `Characters`: The character count.
*   `Company`: The name of the author's company.
*   `Template`: The name of the template used to create the document.

**Example (`app.xml`):**
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://purl.oclc.org/ooxml/officeDocument/extendedProperties">
  <Template>Normal.dotm</Template>
  <TotalTime>0</TotalTime>
  <Pages>1</Pages>
  <Words>120</Words>
  <Characters>684</Characters>
  <Application>Microsoft Office Word</Application>
  <DocSecurity>0</DocSecurity>
  <Lines>5</Lines>
  <Paragraphs>1</Paragraphs>
  <ScaleCrop>false</ScaleCrop>
  <Company>My Company</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <CharactersWithSpaces>803</CharactersWithSpaces>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0000</AppVersion>
</Properties>
```

## 3. Custom Properties

*   **File:** `docProps/custom.xml`
*   **Schema:** `shared-documentPropertiesCustom.xsd`

Custom properties allow users to define their own metadata for a document. Each custom property has a name and a value, and the value can be one of several data types.

### Structure of Custom Properties

The `custom.xml` file contains a `<Properties>` element, which in turn contains one or more `<property>` elements.

Each `<property>` element has:
*   `name`: The name of the custom property.
*   `pid`: A unique property ID.
*   `fmtid`: A format ID (usually the same constant value).

Inside each `<property>` element is a **variant type** element that defines the data type and value of the property. These variant types are defined in `shared-documentPropertiesVariantTypes.xsd`.

**Common Variant Types (`vt:`):**

| Element | Data Type |
| --- | --- |
| `<vt:lpwstr>` | A Unicode string. |
| `<vt:i4>` | A 4-byte signed integer. |
| `<vt:bool>` | A boolean value (`true` or `false`). |
| `<vt:filetime>` | A date and time. |

**Example (`custom.xml`):**
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://purl.oclc.org/ooxml/officeDocument/customProperties" 
            xmlns:vt="http://purl.oclc.org/ooxml/officeDocument/docPropsVTypes">
  <property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="2" name="DocumentStatus">
    <vt:lpwstr>Draft</vt:lpwstr>
  </property>
  <property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="3" name="VersionNumber">
    <vt:i4>12</vt:i4>
  </property>
  <property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="4" name="IsApproved">
    <vt:bool>false</vt:bool>
  </property>
</Properties>
```

## TypeScript Interfaces

Here are some simplified TypeScript interfaces for modeling document properties.

```typescript
interface CoreProperties {
  title?: string;
  creator?: string;
  subject?: string;
  description?: string;
  created?: Date;
  modified?: Date;
  lastModifiedBy?: string;
  revision?: number;
}

interface ExtendedProperties {
  application?: string;
  appVersion?: string;
  pages?: number;
  words?: number;
  characters?: number;
  company?: string;
  template?: string;
  totalTime?: number;
  lines?: number;
  paragraphs?: number;
  charactersWithSpaces?: number;
  hyperlinkBase?: string;
}

interface CustomProperty {
  name: string;
  value: string | number | boolean | Date;
  type: 'string' | 'number' | 'boolean' | 'date';
}

interface CustomProperties {
  properties: CustomProperty[];
}
```