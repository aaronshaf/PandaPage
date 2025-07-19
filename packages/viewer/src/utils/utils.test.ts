import { test, expect } from "bun:test";
import {
  removeFrontmatter,
  countWords,
  extractHeadings,
  extractHeadingsFromDocument,
  getBasePath,
} from "./index";

// Document Utils tests
// removeFrontmatter tests
test("should remove YAML frontmatter from markdown", () => {
  const markdown = `---
title: Test Document
author: John Doe
---

# Heading 1
This is content.`;

  const result = removeFrontmatter(markdown);
  expect(result).toBe("# Heading 1\nThis is content.");
});

test("should return original markdown if no frontmatter", () => {
  const markdown = `# Heading 1
This is content.`;

  const result = removeFrontmatter(markdown);
  expect(result).toBe(markdown);
});

test("should handle malformed frontmatter", () => {
  const markdown = `---
title: Test Document
# Heading 1
This is content.`;

  const result = removeFrontmatter(markdown);
  expect(result).toBe(markdown);
});

test("should handle empty frontmatter", () => {
  const markdown = `---
---

# Heading 1
This is content.`;

  const result = removeFrontmatter(markdown);
  expect(result).toBe("# Heading 1\nThis is content.");
});

// countWords tests
test("should count words correctly", () => {
  expect(countWords("Hello world")).toBe(2);
  expect(countWords("The quick brown fox")).toBe(4);
  expect(countWords("")).toBe(0);
  expect(countWords("   ")).toBe(0);
  expect(countWords("Single")).toBe(1);
});

test("should handle multiple spaces", () => {
  expect(countWords("Hello    world")).toBe(2);
  expect(countWords("  Hello  world  ")).toBe(2);
});

test("should handle newlines and tabs", () => {
  expect(countWords("Hello\nworld")).toBe(2);
  expect(countWords("Hello\tworld")).toBe(2);
  expect(countWords("Hello\n\tworld")).toBe(2);
});

// extractHeadings tests
test("should extract headings from markdown", () => {
  const markdown = `# Heading 1
Some content

## Heading 2
More content

### Heading 3
Even more content

# Another H1`;

  const headings = extractHeadings(markdown);
  expect(headings).toHaveLength(4);

  expect(headings[0]).toEqual({
    level: 1,
    text: "Heading 1",
    id: "heading-1",
  });

  expect(headings[1]).toEqual({
    level: 2,
    text: "Heading 2",
    id: "heading-2",
  });

  expect(headings[2]).toEqual({
    level: 3,
    text: "Heading 3",
    id: "heading-3",
  });

  expect(headings[3]).toEqual({
    level: 1,
    text: "Another H1",
    id: "another-h1",
  });
});

test("should handle headings with special characters", () => {
  const markdown = `# Heading with "quotes" and symbols!
## Another heading (with parentheses)
### 日本語のヘッダー`;

  const headings = extractHeadings(markdown);
  expect(headings).toHaveLength(3);

  expect(headings[0]).toEqual({
    level: 1,
    text: 'Heading with "quotes" and symbols!',
    id: "heading-with-quotes-and-symbols",
  });

  expect(headings[1]).toEqual({
    level: 2,
    text: "Another heading (with parentheses)",
    id: "another-heading-with-parentheses",
  });

  expect(headings[2]).toEqual({
    level: 3,
    text: "日本語のヘッダー",
    id: "",
  });
});

test("should ignore invalid headings", () => {
  const markdown = `Not a heading
##No space after hash
### 
#### Empty heading
##### Valid heading`;

  const headings = extractHeadings(markdown);
  expect(headings).toHaveLength(2);

  expect(headings[0]).toEqual({
    level: 4,
    text: "Empty heading",
    id: "empty-heading",
  });

  expect(headings[1]).toEqual({
    level: 5,
    text: "Valid heading",
    id: "valid-heading",
  });
});

test("should handle no headings", () => {
  const markdown = `Just some regular text.
No headings here.

Even with line breaks.`;

  const headings = extractHeadings(markdown);
  expect(headings).toHaveLength(0);
});

// extractHeadingsFromDocument tests
test("should extract headings from structured document", () => {
  const document = {
    elements: [
      {
        type: "paragraph",
        runs: [{ text: "Regular paragraph" }],
      },
      {
        type: "heading",
        level: 1,
        runs: [{ text: "Main Title" }],
      },
      {
        type: "heading",
        level: 2,
        runs: [{ text: "Subtitle with " }, { text: "formatting", bold: true }],
      },
      {
        type: "paragraph",
        runs: [{ text: "Another paragraph" }],
      },
      {
        type: "heading",
        level: 3,
        runs: [{ text: "Sub-subtitle" }],
      },
    ],
  };

  const headings = extractHeadingsFromDocument(document);
  expect(headings).toHaveLength(3);

  expect(headings[0]).toEqual({
    level: 1,
    text: "Main Title",
    id: "main-title",
  });

  expect(headings[1]).toEqual({
    level: 2,
    text: "Subtitle with formatting",
    id: "subtitle-with-formatting",
  });

  expect(headings[2]).toEqual({
    level: 3,
    text: "Sub-subtitle",
    id: "sub-subtitle",
  });
});

test("should handle empty or malformed document", () => {
  expect(extractHeadingsFromDocument(null)).toEqual([]);
  expect(extractHeadingsFromDocument({})).toEqual([]);
  expect(extractHeadingsFromDocument({ elements: [] })).toEqual([]);
  expect(extractHeadingsFromDocument({ elements: null })).toEqual([]);
});

test("should ignore empty headings", () => {
  const document = {
    elements: [
      {
        type: "heading",
        level: 1,
        runs: [{ text: "" }],
      },
      {
        type: "heading",
        level: 2,
        runs: [{ text: "   " }],
      },
      {
        type: "heading",
        level: 3,
        runs: [{ text: "Valid heading" }],
      },
    ],
  };

  const headings = extractHeadingsFromDocument(document);
  expect(headings).toHaveLength(1);

  expect(headings[0]).toEqual({
    level: 3,
    text: "Valid heading",
    id: "valid-heading",
  });
});

test("should handle headings with no runs", () => {
  const document = {
    elements: [
      {
        type: "heading",
        level: 1,
        runs: [],
      },
      {
        type: "heading",
        level: 2,
        runs: [{ text: "Valid heading" }],
      },
    ],
  };

  const headings = extractHeadingsFromDocument(document);
  expect(headings).toHaveLength(1);

  expect(headings[0]).toEqual({
    level: 2,
    text: "Valid heading",
    id: "valid-heading",
  });
});

// getBasePath tests
test("should return correct base path in different environments", () => {
  // This is hard to test without mocking import.meta.env
  // but we can at least ensure it doesn't throw and returns a string
  const basePath = getBasePath();
  expect(typeof basePath).toBe("string");
});

// Document Title Extraction Logic tests
test("should prioritize document metadata title", () => {
  const metadata = { title: "Document Title from Metadata" };
  const headings = [{ level: 1, text: "First Heading", id: "first-heading" }];
  const filename = "test.docx";

  // This simulates the title extraction logic from the app
  const getDocumentTitle = (metadata: any, headings: any[], filename: string) => {
    if (metadata?.title?.trim()) {
      return metadata.title.trim();
    }

    if (headings.length > 0 && headings[0].text?.trim()) {
      return headings[0].text.trim();
    }

    return filename.replace(/\.(docx|pages|key)$/, "") || "Untitled Document";
  };

  expect(getDocumentTitle(metadata, headings, filename)).toBe("Document Title from Metadata");
});

test("should fall back to first heading when no metadata title", () => {
  const metadata = {};
  const headings = [
    { level: 1, text: "First Heading", id: "first-heading" },
    { level: 2, text: "Second Heading", id: "second-heading" },
  ];
  const filename = "test.docx";

  const getDocumentTitle = (metadata: any, headings: any[], filename: string) => {
    if (metadata?.title?.trim()) {
      return metadata.title.trim();
    }

    if (headings.length > 0 && headings[0].text?.trim()) {
      return headings[0].text.trim();
    }

    return filename.replace(/\.(docx|pages|key)$/, "") || "Untitled Document";
  };

  expect(getDocumentTitle(metadata, headings, filename)).toBe("First Heading");
});

test("should fall back to filename when no metadata or headings", () => {
  const metadata = {};
  const headings: any[] = [];
  const filename = "test-document.docx";

  const getDocumentTitle = (metadata: any, headings: any[], filename: string) => {
    if (metadata?.title?.trim()) {
      return metadata.title.trim();
    }

    if (headings.length > 0 && headings[0].text?.trim()) {
      return headings[0].text.trim();
    }

    return filename.replace(/\.(docx|pages|key)$/, "") || "Untitled Document";
  };

  expect(getDocumentTitle(metadata, headings, filename)).toBe("test-document");
});

test("should handle empty values gracefully", () => {
  const metadata = { title: "   " };
  const headings = [{ level: 1, text: "", id: "empty" }];
  const filename = "test.docx";

  const getDocumentTitle = (metadata: any, headings: any[], filename: string) => {
    if (metadata?.title?.trim()) {
      return metadata.title.trim();
    }

    if (headings.length > 0 && headings[0].text?.trim()) {
      return headings[0].text.trim();
    }

    return filename.replace(/\.(docx|pages|key)$/, "") || "Untitled Document";
  };

  expect(getDocumentTitle(metadata, headings, filename)).toBe("test");
});
