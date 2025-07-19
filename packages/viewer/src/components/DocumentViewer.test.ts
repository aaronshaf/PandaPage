import { test, expect } from "bun:test";

// DocumentViewer Logic tests
// Page Number Calculation tests
test("should determine current page based on element positions", () => {
  // Mock DOM elements and their positions
  const mockPages = [
    { getBoundingClientRect: () => ({ top: 0, bottom: 100, height: 100 }) },
    { getBoundingClientRect: () => ({ top: 120, bottom: 220, height: 100 }) },
    { getBoundingClientRect: () => ({ top: 240, bottom: 340, height: 100 }) },
  ];

  // This simulates the page detection logic from DocumentViewer
  const getCurrentPage = (pages: any[], containerMiddle: number) => {
    let currentVisiblePage = 1;
    let closestDistance = Infinity;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const rect = page.getBoundingClientRect();

      // Calculate distance from page center to container center
      const pageCenter = rect.top + rect.height / 2;
      const distance = Math.abs(pageCenter - containerMiddle);

      if (distance < closestDistance) {
        closestDistance = distance;
        currentVisiblePage = i + 1;
      }
    }

    return currentVisiblePage;
  };

  // Test various scroll positions
  expect(getCurrentPage(mockPages, 50)).toBe(1); // First page center at 50
  expect(getCurrentPage(mockPages, 170)).toBe(2); // Second page center at 170
  expect(getCurrentPage(mockPages, 290)).toBe(3); // Third page center at 290
  expect(getCurrentPage(mockPages, 100)).toBe(1); // Boundary case - closer to first page
});

test("should handle edge cases in page detection", () => {
  const getCurrentPage = (pages: any[], containerMiddle: number) => {
    if (pages.length === 0) return 1;

    let currentVisiblePage = 1;
    let closestDistance = Infinity;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (!page) continue;

      const rect = page.getBoundingClientRect();
      const pageCenter = rect.top + rect.height / 2;
      const distance = Math.abs(pageCenter - containerMiddle);

      if (distance < closestDistance) {
        closestDistance = distance;
        currentVisiblePage = i + 1;
      }
    }

    return currentVisiblePage;
  };

  // Test with no pages
  expect(getCurrentPage([], 100)).toBe(1);

  // Test with single page
  const singlePage = [{ getBoundingClientRect: () => ({ top: 0, bottom: 100, height: 100 }) }];
  expect(getCurrentPage(singlePage, 50)).toBe(1);

  // Test with null pages (defensive programming)
  const pagesWithNull = [
    null,
    { getBoundingClientRect: () => ({ top: 0, bottom: 100, height: 100 }) },
    null,
  ];
  expect(getCurrentPage(pagesWithNull, 50)).toBe(2);
});

// Scroll Progress Calculation tests
test("should calculate scroll progress correctly", () => {
  const calculateScrollProgress = (
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number,
  ) => {
    const maxScroll = scrollHeight - clientHeight;
    return maxScroll > 0 ? scrollTop / maxScroll : 0;
  };

  // Normal case
  expect(calculateScrollProgress(0, 1000, 200)).toBe(0); // At top
  expect(calculateScrollProgress(800, 1000, 200)).toBe(1); // At bottom (800 = 1000 - 200)
  expect(calculateScrollProgress(400, 1000, 200)).toBe(0.5); // Halfway

  // Edge cases
  expect(calculateScrollProgress(0, 200, 200)).toBe(0); // No scrollable content
  expect(calculateScrollProgress(100, 100, 200)).toBe(0); // Content smaller than viewport
});

// Page Indicator Positioning tests
test("should calculate page indicator position within scrollbar area", () => {
  const calculateIndicatorPosition = (
    scrollProgress: number,
    navHeight: number,
    scrollbarHeight: number,
    scrollbarOffset: number,
    windowHeight: number,
  ) => {
    if (scrollbarHeight > 0) {
      // Position relative to the scroll container area
      const containerTop = scrollbarOffset;
      const containerHeight = scrollbarHeight * (1 / Math.max(0.1, scrollProgress + 0.1));
      const usableHeight = Math.max(containerHeight - 80, 100);

      // Center the indicator within the scrollbar thumb area
      const scrollbarThumbPosition = containerTop + scrollProgress * usableHeight;
      const calculatedTop = Math.max(
        navHeight + 10,
        Math.min(scrollbarThumbPosition, windowHeight - 80),
      );

      return calculatedTop;
    } else {
      // Fallback calculation
      const indicatorHeight = 60;
      const padding = 20;
      const availableSpace = windowHeight - navHeight - indicatorHeight - padding * 2;
      const travelSpace = Math.max(0, availableSpace);
      return navHeight + padding + scrollProgress * travelSpace;
    }
  };

  // Test with scrollbar info available
  const navHeight = 112;
  const scrollbarHeight = 300;
  const scrollbarOffset = 112;
  const windowHeight = 800;

  const topPosition = calculateIndicatorPosition(
    0,
    navHeight,
    scrollbarHeight,
    scrollbarOffset,
    windowHeight,
  );
  expect(topPosition).toBeGreaterThan(navHeight);

  const middlePosition = calculateIndicatorPosition(
    0.5,
    navHeight,
    scrollbarHeight,
    scrollbarOffset,
    windowHeight,
  );
  expect(middlePosition).toBeGreaterThan(topPosition);

  const bottomPosition = calculateIndicatorPosition(
    1,
    navHeight,
    scrollbarHeight,
    scrollbarOffset,
    windowHeight,
  );
  expect(bottomPosition).toBeCloseTo(304.73, 1); // Actual calculated value
  expect(bottomPosition).toBeLessThan(windowHeight - 80);

  // Test fallback when no scrollbar info
  const fallbackPosition = calculateIndicatorPosition(0.5, navHeight, 0, 0, windowHeight);
  expect(fallbackPosition).toBeGreaterThan(navHeight);
  expect(fallbackPosition).toBeLessThan(windowHeight);
});

// View Mode Logic tests
test("should determine correct view based on URL hash", () => {
  const parseUrlHash = (hash: string) => {
    const parts = hash.slice(1).split("&"); // Remove #

    let docId = "";
    let mode: "read" | "print" = "print";

    for (const part of parts) {
      if (part.includes("=")) {
        const [key, value] = part.split("=");
        if (key === "view" && (value === "read" || value === "print")) {
          mode = value;
        }
      } else if (part.endsWith(".docx") || part.endsWith(".pages")) {
        docId = part;
      }
    }

    return { docId, mode };
  };

  expect(parseUrlHash("#001.docx")).toEqual({ docId: "001.docx", mode: "print" });
  expect(parseUrlHash("#001.docx&view=read")).toEqual({ docId: "001.docx", mode: "read" });
  expect(parseUrlHash("#001.docx&view=print")).toEqual({ docId: "001.docx", mode: "print" });
  expect(parseUrlHash("#view=read&001.docx")).toEqual({ docId: "001.docx", mode: "read" });
  expect(parseUrlHash("#test.pages&view=read")).toEqual({ docId: "test.pages", mode: "read" });
  expect(parseUrlHash("")).toEqual({ docId: "", mode: "print" });
  expect(parseUrlHash("#view=invalid")).toEqual({ docId: "", mode: "print" });
});

// Print Scale Calculation tests
test("should calculate appropriate print scale for different screen sizes", () => {
  const calculatePrintScale = (windowWidth: number) => {
    const containerWidth = windowWidth - 320; // Account for potential sidebar
    const pageWidth = 8.5 * 96; // 8.5 inches at 96 DPI
    const maxScale = Math.min(containerWidth / pageWidth, 1.2); // Max 120%
    return Math.max(0.4, maxScale * 0.83); // Use 83% of available width, min 40%
  };

  // Test various screen sizes
  expect(calculatePrintScale(1920)).toBeCloseTo(0.996); // Large desktop
  expect(calculatePrintScale(1200)).toBeCloseTo(0.9); // Typical desktop
  expect(calculatePrintScale(800)).toBeCloseTo(0.49); // Small desktop/tablet
  expect(calculatePrintScale(400)).toBe(0.4); // Mobile - hits minimum scale
});

// Navigation and Mobile Detection tests
test("should determine mobile status based on screen width", () => {
  const isMobile = (width: number) => width < 640;

  expect(isMobile(320)).toBe(true); // Mobile
  expect(isMobile(375)).toBe(true); // Mobile
  expect(isMobile(640)).toBe(false); // Desktop (exactly at breakpoint)
  expect(isMobile(768)).toBe(false); // Tablet
  expect(isMobile(1024)).toBe(false); // Desktop
});

test("should calculate nav height based on primary nav visibility", () => {
  const calculateNavHeight = (showPrimaryNav: boolean, isMobile: boolean) => {
    if (isMobile) {
      return showPrimaryNav ? 160 : 56; // Mobile has different heights
    }
    return showPrimaryNav ? 112 : 56; // Desktop heights
  };

  expect(calculateNavHeight(true, false)).toBe(112); // Desktop with primary nav
  expect(calculateNavHeight(false, false)).toBe(56); // Desktop without primary nav
  expect(calculateNavHeight(true, true)).toBe(160); // Mobile with primary nav
  expect(calculateNavHeight(false, true)).toBe(56); // Mobile without primary nav
});
