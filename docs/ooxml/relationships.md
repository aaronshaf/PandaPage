# OOXML Relationships

Relationships are the glue that holds an OOXML package together. They define the connections between the different parts of the document (e.g., the main document, images, headers, hyperlinks). This document explains how relationships work, based on the `shared-relationshipReference.xsd` schema.

## The `r:id` Attribute

The core of the relationship mechanism is the `r:id` attribute, where `r` is the namespace for `http://purl.oclc.org/ooxml/officeDocument/relationships`. This attribute is used on various elements throughout the OOXML schemas to link to other resources.

The value of the `r:id` attribute is a **relationship identifier**, which is a string that uniquely identifies a relationship within a given context.

## The `.rels` Files

The `r:id` attributes correspond to `<Relationship>` elements defined in special XML files with a `.rels` extension. These files are typically found in a `_rels` directory alongside the document part that defines the relationships.

For example, the relationships for the main document part (`word/document.xml`) are stored in `word/_rels/document.xml.rels`.

A typical `.rels` file looks like this:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://.../styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://.../image" Target="media/image1.png"/>
  <Relationship Id="rId3" Type="http://.../hyperlink" Target="http://example.com" TargetMode="External"/>
</Relationships>
```

Each `<Relationship>` element has:

*   `Id`: The unique identifier for the relationship (e.g., `rId1`).
*   `Type`: A URI that defines the type of the relationship.
*   `Target`: The path to the target resource. This can be an internal path within the OOXML package or an external URL.
*   `TargetMode`: (Optional) Specifies whether the target is `Internal` or `External`.

## Example: Linking to an Image

Here is how an image is linked in a document:

1.  **In `document.xml`:** An `<a:blip>` element references the relationship ID.

    ```xml
    <a:blip r:embed="rId2" />
    ```

2.  **In `word/_rels/document.xml.rels`:** The relationship is defined.

    ```xml
    <Relationship Id="rId2"
                  Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
                  Target="media/image1.png"/>
    ```

3.  **In the OOXML Package:** The image file is stored at `word/media/image1.png`.

## Common Relationship Attributes

The `shared-relationshipReference.xsd` schema defines several attributes that are used to establish relationships. All of these attributes are of the type `ST_RelationshipId`.

| Attribute | Description |
| --- | --- |
| `r:id` | The most common attribute for general relationships. |
| `r:embed` | Used for embedding objects, such as images (`<a:blip>`). |
| `r:link` | Used for linking to external resources, such as in audio or video files. |
| `r:href` | Used for hyperlinks. |

Understanding relationships is crucial for correctly parsing an OOXML document and resolving all of its component parts.
