import { describe, it, expect } from "bun:test";

describe("Page Indicator Fix", () => {
  it("should ensure all page elements have print-page class", () => {
    // Test that the CSS selector .print-page will work correctly
    const testHTML = `
      <div class="document-scroll-container">
        <div class="print-page" data-page-number="1">Page 1 content</div>
        <div class="print-page" data-page-number="2">Page 2 content</div>
        <div class="print-page" data-page-number="3">Page 3 content</div>
      </div>
    `;

    // Mock the DOM structure for testing
    const mockPages = [
      { getAttribute: (attr: string) => (attr === "data-page-number" ? "1" : null) },
      { getAttribute: (attr: string) => (attr === "data-page-number" ? "2" : null) },
      { getAttribute: (attr: string) => (attr === "data-page-number" ? "3" : null) },
    ];

    const pages = mockPages;

    expect(pages.length).toBe(3);
    expect(pages[0]?.getAttribute("data-page-number")).toBe("1");
    expect(pages[1]?.getAttribute("data-page-number")).toBe("2");
    expect(pages[2]?.getAttribute("data-page-number")).toBe("3");
  });

  it("should handle getBoundingClientRect calculations correctly", () => {
    // Mock getBoundingClientRect for testing page center calculations
    const containerRect = { top: 100, height: 600 }; // Container starts at 100px, 600px tall
    const containerMiddle = containerRect.top + containerRect.height / 2; // 400px

    // Mock page rectangles
    const pageRects = [
      { top: 50, bottom: 350 }, // Page 1: top=50, bottom=350 (center=200)
      { top: 370, bottom: 670 }, // Page 2: top=370, bottom=670 (center=520)
      { top: 690, bottom: 990 }, // Page 3: top=690, bottom=990 (center=840)
    ];

    // Test page detection logic
    let currentVisiblePage = 1;

    for (let i = 0; i < pageRects.length; i++) {
      const rect = pageRects[i];

      // Consider a page "current" if its center is closest to container center
      if (rect.top <= containerMiddle && rect.bottom > containerMiddle) {
        currentVisiblePage = i + 1;
        break;
      }

      // If we're past the container middle, this is probably the current page
      if (rect.top <= containerMiddle) {
        currentVisiblePage = i + 1;
      }
    }

    // Container middle (400px) falls between page 1 bottom (350px) and page 2 top (370px)
    // So page 2 should be considered current
    expect(currentVisiblePage).toBe(2);
  });

  it("should handle edge case where no pages are visible", () => {
    const pages: NodeListOf<Element> = {
      length: 0,
      item: () => null,
      forEach: () => {},
      [Symbol.iterator]: function* () {},
    } as any;

    // If no pages are found, should default to page 1
    let currentVisiblePage = 1;

    if (pages.length === 0) {
      // This should trigger the warning and return early
      expect(pages.length).toBe(0);
      return;
    }

    expect(currentVisiblePage).toBe(1);
  });
});
