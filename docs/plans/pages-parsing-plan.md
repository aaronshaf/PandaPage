
## 6. Phase 3: Basic Rendering

**Goal:** Implement initial rendering of the `DocumentModel` to HTML, focusing on text content, basic formatting, and simple shapes. This phase validates the `DocumentModel` and provides a visual output.

**Estimated Time:** 2-3 weeks

**Tasks:**

### 6.1. Define HTML Output Structure

*   **Action:** Determine a consistent HTML structure for representing document elements (e.g., `<div>` for sections, `<p>` for paragraphs, `<span>` for text runs, `<img>` for images, `<svg>` for shapes).
*   **Output:** A set of guidelines or a simple templating strategy for HTML generation.

### 6.2. Implement Text Rendering Components

*   **Action:** Develop TypeScript functions or classes responsible for converting `Paragraph` and `TextRun` objects from the `DocumentModel` into corresponding HTML elements.
*   **Output:** Functions like `renderParagraph(paragraph: Paragraph): HTMLElement` and `renderTextRun(textRun: TextRun): HTMLElement`.
*   **Verification:** Render a simple document with multiple paragraphs and text runs, and inspect the generated HTML in the browser.

### 6.3. Apply Basic Text Styles

*   **Action:** Integrate the `StyleManager` (from Phase 2) to apply fundamental text formatting properties (e.g., `font-size`, `font-family`, `color`, `font-weight` for bold, `font-style` for italic, `text-decoration` for underline/strikethrough) as inline CSS or CSS classes to the rendered HTML elements.
*   **Output:** Text elements in the browser display with correct basic styling.
*   **Verification:** Render a document with varied text formatting and visually confirm that styles are applied correctly.

### 6.4. Implement Simple Shape Rendering

*   **Action:** Develop rendering logic for basic shapes (e.g., rectangles, circles) from the `DocumentModel` into SVG elements or styled `div`s.
*   **Output:** Simple shapes appear in the rendered output with their basic geometry and fill/stroke properties.
*   **Verification:** Render a document containing simple shapes and visually confirm their presence and appearance.

### 6.5. Integrate Image Rendering

*   **Action:** For `Image` objects in the `DocumentModel`, generate `<img>` tags. Convert the `Uint8Array` image data into Data URLs or Object URLs for display in the browser.
*   **Output:** Embedded images are displayed in the rendered HTML.
*   **Verification:** Render a document with embedded images and confirm they load and display correctly.

### 6.6. Create a Document Renderer Function

*   **Action:** Develop a top-level function that takes the complete `DocumentModel` and orchestrates the rendering of all its components into a single HTML `HTMLElement` (e.g., a `div` containing the entire document).
*   **Output:** A `renderDocument(model: DocumentModel): HTMLElement` function.
*   **Verification:** Load a sample `.pages` file, parse it through Phase 1 and 2, and then render the resulting `DocumentModel` to the browser, confirming a basic visual representation of the document.

**Phase 3 Deliverable:** A TypeScript function that takes a `DocumentModel` and returns an `HTMLElement` representing a basic, styled HTML rendering of the document, including text, simple shapes, and images.

---
**Next Steps:** I will await your confirmation on this third phase before detailing Phase 4: Advanced Features & Optimization.
