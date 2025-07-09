# pml.xsd

The `pml.xsd` schema defines the structure and components of a PresentationML (PowerPoint) document within the Office Open XML (OOXML) framework. It is the central schema for presentations, encompassing slides, masters, layouts, and various presentation-specific properties like transitions and animations.

## Purpose

This schema is used to:
*   Define the overall structure of a presentation.
*   Manage slides, slide masters, slide layouts, notes masters, and handout masters.
*   Specify slide transitions and animations.
*   Handle presentation-level properties such as slide size, view settings, and embedded fonts.
*   Integrate with DrawingML for graphical elements on slides.

## Key Elements and Concepts

### Presentation Structure

*   **`presentation` (CT_Presentation):** The root element of a presentation. It contains lists of slide masters, notes masters, handout masters, and slides.
    *   `sldMasterIdLst`: List of slide master IDs.
    *   `notesMasterIdLst`: List of notes master IDs.
    *   `handoutMasterIdLst`: List of handout master IDs.
    *   `sldIdLst`: List of slide IDs.
    *   `sldSz`: Defines the size of the slides.
    *   `notesSz`: Defines the size of notes pages.
    *   `embeddedFontLst`: List of embedded fonts.
    *   `custShowLst`: List of custom shows.

### Slide Components

*   **`sld` (CT_Slide):** Represents an individual slide in the presentation.
    *   `cSld` (CT_CommonSlideData): Common data for slides, slide masters, and notes masters, including background and shape tree.
    *   `transition` (CT_SlideTransition): Defines the slide transition effect.
    *   `timing` (CT_SlideTiming): Specifies animation and timing properties for the slide.
*   **`sldMaster` (CT_SlideMaster):** Defines the common formatting and background for a set of slide layouts.
*   **`sldLayout` (CT_SlideLayout):** Defines the layout of content on a slide, including placeholders.
*   **`notesMaster` (CT_NotesMaster):** Defines the common formatting for notes pages.
*   **`handoutMaster` (CT_HandoutMaster):** Defines the common formatting for handouts.

### Drawing Objects on Slides

Slides, masters, and layouts contain a `spTree` (shape tree) of type `CT_GroupShape` (from `dml-main.xsd`), which holds all the graphical objects (shapes, pictures, graphic frames) on that slide.

### Transitions and Animations

*   **`CT_SlideTransition`:** Defines various slide transition effects (e.g., blinds, checker, fade, push, wipe, zoom).
*   **Time Nodes (e.g., `CT_TLTimeNodeParallel`, `CT_TLTimeNodeSequence`):** Used within `CT_SlideTiming` to define the sequence and timing of animations and media playback.
*   **Behavior Types (e.g., `CT_TLAnimateBehavior`, `CT_TLAnimateColorBehavior`):** Define specific animation behaviors like movement, color changes, and rotations.

### Presentation Properties

*   **`presentationPr` (CT_PresentationProperties):** Contains properties related to printing and showing the presentation.
    *   `prnPr`: Print properties.
    *   `showPr`: Show properties (e.g., loop, show narration).
*   **`viewPr` (CT_ViewProperties):** Defines properties for different presentation views (normal, slide sorter, notes, outline).

### Comments

*   **`cmAuthorLst` (CT_CommentAuthorList):** List of comment authors.
*   **`cmLst` (CT_CommentList):** List of comments on slides.

### Embedded Objects

*   **`oleObj` (CT_OleObject):** Represents an embedded OLE object.
*   **`control` (CT_Control):** Represents an embedded ActiveX control.

## Imported Schemas

This schema imports definitions from:
*   `shared-relationshipReference.xsd`: For relationships between parts.
*   `dml-main.xsd`: For core DrawingML types, which are extensively used for graphical elements and text formatting within the presentation.
*   `shared-commonSimpleTypes.xsd`: For common simple types.

## Example Usage (Conceptual)

A PresentationML document (`.pptx`) typically starts with a `presentation` element, which then references various slides, slide masters, and layouts. Each slide contains a `cSld` element with a `spTree` that holds the visual content.

```xml
<p:presentation xmlns:p="http://purl.oclc.org/ooxml/presentationml/main" xmlns:r="http://purl.oclc.org/ooxml/officeDocument/relationships">
  <p:sldMasterIdLst>
    <p:sldMasterId r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/> <!-- 10 inches x 7.5 inches -->
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>
```
