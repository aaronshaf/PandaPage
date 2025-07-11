# Comprehensive Plan for Handling Very Large Documents (1000+ Pages)

## I. Core Principles & Problem Statement

### The Problem with Large Documents

For documents spanning hundreds or thousands of pages, a traditional "parse-then-render-all" approach is infeasible. It leads to:

1.  **Worker Memory Exhaustion**: Parsing a massive document and building a complete "render tree" for it within a Web Worker can exhaust its allocated memory.
2.  **Main Thread Memory Spikes**: Transferring a colossal render tree object from the worker to the main thread can cause significant memory spikes and potential browser crashes.
3.  **DOM Overload**: Even if data transfer succeeds, the main thread cannot efficiently render and manage a million-plus DOM nodes simultaneously. The browser would become unresponsive and likely crash.

### The Solution: "Streaming" Parser Worker + Virtualized Scroller

The robust solution combines a dedicated Parser Worker with two advanced techniques: **On-Demand Parsing** and **UI Virtualization (or "Windowing")**. The core strategy is to **never hold the full document's renderable representation in memory on the main thread** and to **only parse and render what is absolutely necessary** for the current view.

## II. Architectural Components & Data Flow

### 1. Main Thread (UI & Orchestration)

The main thread is responsible for the user interface, managing the virtualized view, and orchestrating communication with the worker.

*   **Virtual Scroller:** Manages the visible viewport, calculates scroll position, determines which pages are currently visible, and requests necessary data from the worker.
*   **UI Rendering:** Renders only the currently visible pages into a dynamically positioned "mover" div. It does not hold the full document's DOM.
*   **Worker Communication:** Initiates worker tasks (e.g., initial skim, page requests) and processes messages received from the worker.
*   **State Management:** Maintains the `pageManifest` (metadata about each page) and a limited local cache of recently rendered page data.
*   **User Interaction:** Handles all user input, including scroll events, search queries, and navigation.

### 2. Parser Worker (Background Processing)

The Parser Worker operates in a separate thread, dedicated to heavy-lifting tasks like document parsing and data preparation, ensuring the main thread remains responsive.

*   **Document Parsing:** Contains the logic for parsing specific document formats (e.g., DOCX, Pages, PPTX) into an intermediate, renderable representation.
*   **On-Demand Parsing:** Crucially, it only performs detailed parsing for specific pages or sections requested by the main thread.
*   **Data Transfer:** Efficiently transfers parsed data (e.g., `pageManifest`, render trees, image `ArrayBuffer`s) to the main thread using Transferable Objects to minimize copying overhead.
*   **Memory Management:** Holds the full raw document data (e.g., the initial `ArrayBuffer`) and manages its own memory for parsing operations.
*   **Worker Pool (Optional but Recommended):** A system to manage and potentially scale multiple worker instances, especially useful for parallel processing of different document types or sections.

## III. Detailed Implementation Phases

### Phase 1: Initial Skim & Manifest Generation (Worker)

**Objective:** Quickly extract essential layout information and a high-level document structure without performing a full, detailed parse. This provides the main thread with enough information to set up the virtual scroller.

**Steps:**

1.  **File Ingestion:** The worker receives the raw document `ArrayBuffer` (transferred from the main thread using `postMessage` with `transfer: [buffer]`). The worker now owns this memory.
2.  **Partial Parsing/Skim:** Implement a fast, lightweight pass over the document's internal structure.
    *   **For DOCX (OOXML):** Utilize the `ooxml-parser` to quickly identify structural elements like sections, page breaks (if explicitly defined), and approximate content blocks. The goal is to estimate the vertical space each logical "page" or section will occupy. This might involve counting paragraphs, estimating image heights, and recognizing table structures without fully rendering them.
    *   **For Pages (iWork):** Leverage the `pages` package to perform a similar skim, identifying logical page boundaries and estimating content dimensions.
3.  **Manifest Creation:** Construct a `pageManifest` array. Each entry in this array should contain:
    *   `pageNumber`: The logical page number.
    *   `approximateHeight`: An estimated height in pixels for this page. This doesn't need to be pixel-perfect, but a reasonable approximation is crucial for accurate scrollbar sizing.
    *   `startOffset` / `endOffset`: Byte offsets or internal document structure references that allow the worker to quickly jump to this page for detailed parsing later.
    *   `metadata` (Optional): Any high-level metadata like section titles or a Table of Contents entry.
    *   Example: `[{ page: 1, height: 850, ... }, { page: 2, height: 1200, ... }, ...]`
4.  **Transfer to Main Thread:** Send the `pageManifest` (and any initial Table of Contents data) back to the main thread. This manifest should be a relatively small JavaScript object, so it can be cloned (not transferred) without significant overhead.

### Phase 2: Virtual Scroller & UI Setup (Main Thread)

**Objective:** Create a responsive user interface that gives the illusion of a fully loaded document, even though only metadata is available initially.

**Steps:**

1.  **Receive Manifest:** The main thread receives the `pageManifest` from the worker.
2.  **Calculate Total Height:** Sum the `approximateHeight` from all entries in the `pageManifest` to determine the total virtual scrollable height of the document.
3.  **DOM Setup:**
    *   **"Sizer" Element:** Create an empty `<div>` element with `height: [totalCalculatedHeight]px;`. This element establishes the total scrollable area, making the browser's native scrollbar appear correctly sized.
    *   **"Viewport" Element:** Create a container `<div>` with `overflow: scroll; height: 100%;` (or a fixed height). This is the visible window through which the user views the document.
    *   **"Mover" Element:** Inside the "viewport", create an absolutely positioned `<div>` (e.g., `position: absolute; top: 0; left: 0; transform: translateY(0);`). This element will dynamically hold the currently rendered pages and be translated vertically to match the scroll position.
4.  **Initial Render Request:** Based on the initial scroll position (typically the top of the document), calculate which pages should be visible (e.g., page 1 and part of page 2). Send a `getPage` message to the worker requesting these initial pages.

### Phase 3: On-Demand Rendering & Scrolling (Main Thread & Worker)

**Objective:** Dynamically load, parse, and render pages as the user scrolls, ensuring a smooth and responsive experience.

**Steps (Main Thread):**

1.  **Scroll Event Listener:** Attach a **throttled** scroll event listener to the "viewport" element. Throttling is critical to prevent overwhelming the worker with requests on every pixel scroll.
2.  **Determine Visible Pages:** On each throttled scroll event, calculate which pages are currently visible within the viewport based on `scrollTop` and the `pageManifest`.
    *   **Pre-fetching:** Implement a strategy to pre-fetch adjacent pages (e.g., 1-2 pages ahead and behind the current visible range) to minimize perceived loading delays during continuous scrolling.
3.  **Local Cache Check:** Before requesting from the worker, check a local cache (e.g., `Map<pageNumber, RenderTree>`) for the requested pages. If a page is in the cache, use it directly.
4.  **Request from Worker:** If pages are not in the cache, send a `getPage` message to the worker with the specific page numbers to be parsed.
5.  **Receive Render Trees:** When the worker sends `pageData` (containing the render trees for the requested pages), update the local cache with this data.
6.  **Update Mover:**
    *   Clear the content of the "mover" div.
    *   Render the new pages (from cache or newly received data) into the "mover" div.
    *   Adjust the `transform: translateY()` CSS property of the "mover" div to precisely match the scroll position, creating the illusion of continuous scrolling.

**Steps (Parser Worker):**

1.  **Receive `getPage` Request:** The worker receives the `getPage` message from the main thread, containing the list of page numbers to parse.
2.  **Full Page Parsing:** Access the full raw document data (which the worker holds) and perform a detailed, full parse *only* for the requested pages.
    *   This involves using the relevant parser (`ooxml-parser`, `pages` etc.) to build a complete, renderable intermediate representation or a DOM-like structure for each page.
    *   Handle embedded resources like images: extract image data (e.g., as `ArrayBuffer` or `Blob`) and include references in the render tree.
3.  **Transfer Render Trees:** Send the generated render trees back to the main thread.
    *   **Transferable Objects:** For any large binary data within the render tree (e.g., image `ArrayBuffer`s), ensure they are transferred using the `transfer` argument of `postMessage` to avoid copying.
    *   For the overall render tree object (which is typically a complex JavaScript object), it will be cloned by `postMessage`. Optimize its structure to minimize size.

## IV. Web Worker Management & Communication

Leveraging the existing `WEB_WORKERS_PLAN.md` and `WEB_WORKER_COMPILATION.md` documents:

1.  **Worker Compilation:**
    *   **Strategy:** Utilize Bun's built-in bundler for separate worker compilation.
    *   **Command Example:** `bun build ./src/workers/*.worker.ts --outdir ./dist/workers --target browser --format esm`
    *   **Deployment:** Ensure the `dist/workers/` directory is included in your deployment artifacts and that worker URLs are correctly resolved at runtime.
2.  **Worker Instantiation:**
    *   **Robust URL Resolution:** Use `new URL("path/to/worker.js", import.meta.url).href` to reliably construct worker URLs, especially in bundled environments.
    *   **Effect Integration:** Integrate worker instantiation with `@effect/platform-browser`'s `BrowserWorker.spawn` for consistent Effect-based resource management.
3.  **Worker Pool (Recommended for Scalability):**
    *   **Implementation:** Develop a `WorkerPool` system (as outlined in `WEB_WORKERS_PLAN.md`) to manage a pool of reusable worker instances.
    *   **Benefits:** This allows for efficient reuse of workers, reduces instantiation overhead, and can enable parallel processing of different document types or complex sections (e.g., parsing multiple slides in a PPTX concurrently).
    *   **Dynamic Scaling:** Consider implementing `getOptimalWorkerCount` based on factors like document size, available CPU cores, or user preferences.
4.  **Data Transfer Strategy:**
    *   **Input (Main to Worker):** Always transfer the initial document `ArrayBuffer` using `transfer: [buffer]` to give ownership to the worker and avoid memory duplication.
    *   **Output (Worker to Main):**
        *   `pageManifest`: This is typically small and can be cloned.
        *   `renderTree`: For the render tree objects themselves, if they contain large binary data (e.g., image `ArrayBuffer`s), ensure these specific `ArrayBuffer`s are transferred. The overall JavaScript object structure of the render tree will be cloned. Optimize the render tree's structure to minimize its size.
        *   **Streaming (Advanced):** For extremely large individual pages, a more advanced approach might involve streaming chunks of the render tree from the worker to the main thread. This adds significant complexity but can further reduce peak memory usage. This can be a future optimization.
5.  **Progress Reporting:** Implement mechanisms for the worker to send granular progress updates to the main thread (e.g., "parsing page X of Y", "loading image Y of Z") to provide real-time feedback to the user via a loading indicator or progress bar.

## V. Advanced Considerations & Optimizations

1.  **Search Functionality ("Find"):**
    *   **Challenge:** Standard browser `Ctrl+F` will not work as the full document DOM is not present.
    *   **Solution:** Implement a custom search UI.
        *   Send the search query to the worker.
        *   The worker searches its full, internal document model (which holds all the text content).
        *   The worker returns a list of search results, including the page number(s) and precise location (e.g., character offsets) within the page.
        *   The main thread commands the virtual scroller to jump to the relevant page and applies visual highlights to the search terms.
2.  **Performance Tuning:**
    *   **Scroll Throttling/Debouncing:** Absolutely critical. Use `requestAnimationFrame` for scroll handling where possible, or robust throttling/debouncing techniques to limit how often page requests are sent and DOM updates occur.
    *   **Pre-fetching Strategy:** Refine the pre-fetching logic to intelligently load pages based on scroll direction and speed.
    *   **CSS Optimizations:** Utilize CSS properties like `will-change` on the "mover" element to hint to the browser about upcoming transformations. Avoid expensive CSS properties (e.g., `box-shadow`, complex filters) on frequently updated elements.
3.  **Memory Management (Detailed):**
    *   **Worker Side:** Implement careful memory management within the worker. Once a page's render tree is generated and transferred, ensure any temporary parsing structures or intermediate representations for that page are released. The raw document `ArrayBuffer` will persist for on-demand parsing.
    *   **Main Thread Side:** Implement a sensible cache eviction strategy for the `RenderTree` objects stored in the local cache. Only keep a limited number of recently viewed pages in memory (e.g., 5-10 pages around the current view).
4.  **Error Handling:** Implement robust error handling for:
    *   Worker instantiation failures.
    *   Parsing errors within the worker.
    *   Data transfer issues.
    *   Graceful degradation or informative error messages to the user.
5.  **Testing Strategy:**
    *   **Unit Tests:** For individual parsing components within the worker (e.g., `ooxml-parser` functions).
    *   **Integration Tests:** For the main thread-worker communication, ensuring messages are sent and received correctly, and data is transferred efficiently.
    *   **Performance Tests:** Crucial for large documents. Measure parsing times, rendering times, memory usage (both main thread and worker), and UI responsiveness under load.
6.  **Document Format Specifics:**
    *   **DOCX (OOXML):** The `ooxml-parser` will be key. The challenge is mapping the complex OOXML structure to a simplified, renderable DOM-like intermediate representation that can be efficiently transferred and rendered.
    *   **Pages (iWork):** Leverage the existing `pages` package. Similar challenges apply for converting its internal representation to a renderable format.
    *   **Images/Media:** Ensure efficient extraction and transfer of image data (e.g., as `ArrayBuffer`s) from the worker to the main thread. The main thread will then create `Blob` URLs or `Data URL`s for these images.

## VI. Project Integration & Next Steps

1.  **Dependency Installation:** Confirm `@effect/platform-browser` is installed and configured.
2.  **Worker File Structure:** Create dedicated worker files within `src/workers/` (e.g., `docx.worker.ts`, `pages.worker.ts`, `worker-pool.ts`).
3.  **Refactor Existing Parsers:** Adapt existing parsers (`ooxml-parser`, `pages`) to:
    *   Be callable within the worker context.
    *   Return the specific intermediate render-tree-like structures required by the main thread.
    *   Provide the "skim" functionality for initial manifest generation.
4.  **Implement `worker-pool.ts`:** Set up the core worker pool system as outlined in `WEB_WORKERS_PLAN.md`.
5.  **Proof of Concept (PoC):** Start with a single document type (e.g., DOCX) and implement the full end-to-end flow:
    *   Worker skim and manifest generation.
    *   Main thread virtual scroller setup.
    *   On-demand page requests and rendering.
    *   Basic scroll throttling.
6.  **Benchmarking & Iteration:** Continuously benchmark performance and memory usage with increasingly large documents. Use these metrics to identify bottlenecks and guide further optimizations and refinements to the parsing, data transfer, and rendering logic.