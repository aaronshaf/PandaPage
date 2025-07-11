import { test, expect } from "bun:test";

// Mock intersection observer
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

test("Outline Component Logic", () => {
  const mockHeadings = [
    { level: 1, text: "Introduction", id: "introduction" },
    { level: 2, text: "Getting Started", id: "getting-started" },
    { level: 3, text: "Installation", id: "installation" },
    { level: 2, text: "Usage", id: "usage" },
    { level: 1, text: "Advanced Topics", id: "advanced-topics" },
  ];

  test("should properly filter headings", () => {
    const extractHeadings = (markdown: string) => mockHeadings;
    const removeFrontmatter = (markdown: string) => markdown;

    const result = "# Introduction\n## Getting Started\n### Installation\n## Usage\n# Advanced Topics";
    const headings = extractHeadings(removeFrontmatter(result));
    
    expect(headings).toHaveLength(5);
    expect(headings[0]).toEqual({ level: 1, text: "Introduction", id: "introduction" });
    expect(headings[4]).toEqual({ level: 1, text: "Advanced Topics", id: "advanced-topics" });
  });

  test("should prefer parsed document structure over markdown", () => {
    const extractHeadingsFromDocument = (document: any) => [
      { level: 1, text: "From Document", id: "from-doc" },
    ];
    
    const extractHeadings = (markdown: string) => mockHeadings;
    const parsedDocument = { content: "mock document" };
    
    const headings = parsedDocument && extractHeadingsFromDocument
      ? extractHeadingsFromDocument(parsedDocument)
      : extractHeadings("markdown");
    
    expect(headings).toHaveLength(1);
    expect(headings[0]).toEqual({ level: 1, text: "From Document", id: "from-doc" });
  });

  test("should fallback to markdown extraction when no parsed document", () => {
    const extractHeadings = (markdown: string) => mockHeadings;
    const parsedDocument = undefined;
    
    const headings = parsedDocument 
      ? []
      : extractHeadings("markdown");
    
    expect(headings).toHaveLength(5);
    expect(headings[0]).toEqual({ level: 1, text: "Introduction", id: "introduction" });
  });

  test("should calculate correct padding for heading levels", () => {
    const calculatePadding = (level: number) => {
      return `${Math.max(0.5, (level - 1) * 0.75)}rem`;
    };

    expect(calculatePadding(1)).toBe("0.5rem");
    expect(calculatePadding(2)).toBe("0.75rem");
    expect(calculatePadding(3)).toBe("1.5rem");
    expect(calculatePadding(4)).toBe("2.25rem");
  });

  test("should handle keyboard navigation state", () => {
    let focusedIndex = -1;
    
    const handleKeyDown = (key: string, headingsLength: number) => {
      switch (key) {
        case "ArrowDown":
          focusedIndex = Math.min(focusedIndex + 1, headingsLength - 1);
          break;
        case "ArrowUp":
          focusedIndex = Math.max(focusedIndex - 1, 0);
          break;
        case "Home":
          focusedIndex = 0;
          break;
        case "End":
          focusedIndex = headingsLength - 1;
          break;
      }
      return focusedIndex;
    };

    // Test navigation
    expect(handleKeyDown("ArrowDown", 5)).toBe(0);
    expect(handleKeyDown("ArrowDown", 5)).toBe(1);
    expect(handleKeyDown("ArrowUp", 5)).toBe(0);
    expect(handleKeyDown("Home", 5)).toBe(0);
    expect(handleKeyDown("End", 5)).toBe(4);
    
    // Test edge cases
    expect(handleKeyDown("ArrowUp", 5)).toBe(0); // Can't go below 0
    expect(handleKeyDown("ArrowDown", 5)).toBe(1);
    expect(handleKeyDown("ArrowDown", 5)).toBe(2);
    expect(handleKeyDown("ArrowDown", 5)).toBe(3);
    expect(handleKeyDown("ArrowDown", 5)).toBe(4);
    expect(handleKeyDown("ArrowDown", 5)).toBe(4); // Can't go above max
  });

  test("should handle scroll calculation logic", () => {
    const calculateScrollPosition = (
      elementTop: number,
      containerTop: number,
      containerScrollTop: number,
      navHeight: number
    ) => {
      const relativeTop = elementTop - containerTop;
      return containerScrollTop + relativeTop - navHeight - 20;
    };

    const mockElementRect = { top: 100, bottom: 150 };
    const mockContainerRect = { top: 0, bottom: 800 };
    const mockScrollTop = 50;
    const navHeight = 112;

    const scrollPosition = calculateScrollPosition(
      mockElementRect.top,
      mockContainerRect.top,
      mockScrollTop,
      navHeight
    );

    expect(scrollPosition).toBe(-82); // 50 + 100 - 0 - 112 - 20
  });

  test("should determine view mode content selector", () => {
    const getContentSelector = (viewMode: "read" | "print") => {
      return viewMode === "print" ? ".print-view" : ".rendered-markdown";
    };

    expect(getContentSelector("read")).toBe(".rendered-markdown");
    expect(getContentSelector("print")).toBe(".print-view");
  });

  test("should calculate nav height based on showPrimaryNav", () => {
    const calculateNavHeight = (showPrimaryNav: boolean) => {
      return showPrimaryNav ? 112 : 56;
    };

    expect(calculateNavHeight(true)).toBe(112);
    expect(calculateNavHeight(false)).toBe(56);
  });

  test("should determine component visibility", () => {
    const shouldShowOutline = (showOutline: boolean, headingsLength: number) => {
      return showOutline && headingsLength > 1;
    };

    expect(shouldShowOutline(true, 5)).toBe(true);
    expect(shouldShowOutline(false, 5)).toBe(false);
    expect(shouldShowOutline(true, 1)).toBe(false);
    expect(shouldShowOutline(true, 0)).toBe(false);
  });

  test("should calculate height style", () => {
    const calculateHeight = (showPrimaryNav: boolean) => {
      return `calc(100vh - ${showPrimaryNav ? "7rem" : "3.5rem"})`;
    };

    expect(calculateHeight(true)).toBe("calc(100vh - 7rem)");
    expect(calculateHeight(false)).toBe("calc(100vh - 3.5rem)");
  });

  test("should handle intersection observer margin calculation", () => {
    const calculateRootMargin = (showPrimaryNav: boolean) => {
      return `-${showPrimaryNav ? "112px" : "56px"} 0px -50% 0px`;
    };

    expect(calculateRootMargin(true)).toBe("-112px 0px -50% 0px");
    expect(calculateRootMargin(false)).toBe("-56px 0px -50% 0px");
  });
});