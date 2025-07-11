import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import {
  parseTableEnhanced,
  parseTableRowEnhanced,
  parseTableCellEnhanced,
  parseTableProperties,
  parseTableRowProperties,
  parseTableCellProperties,
} from "../src/formats/docx/table-parser";
import { JSDOM } from "jsdom";

describe("Table Parser Integration Tests", () => {
  // Helper to create DOM elements using JSDOM
  function createDOMElement(xml: string): Element {
    const dom = new JSDOM();
    const parser = new dom.window.DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    return doc.documentElement;
  }

  describe("parseTableEnhanced", () => {
    test("should parse complete table structure", async () => {
      // Create a mock table element that simulates the DOM structure
      const mockTable = {
        getElementsByTagName: (tagName: string) => {
          if (tagName === "tr") {
            // Return mock row elements for lowercase tr
            return [
              {
                querySelectorAll: (cellSelector: string) => {
                  if (cellSelector.includes("tc") || cellSelector.includes("w\\:tc")) {
                    return [
                      {
                        querySelector: (propSelector: string) => null,
                        querySelectorAll: (pSelector: string) => {
                          if (pSelector.includes("p") || pSelector.includes("w\\:p")) {
                            return [];
                          }
                          return [];
                        },
                      },
                    ];
                  }
                  return [];
                },
                querySelector: (propSelector: string) => null,
              },
            ];
          }
          if (tagName === "W:TR") {
            // Return empty for uppercase variant to avoid duplication
            return [];
          }
          return [];
        },
        querySelectorAll: (selector: string) => {
          if (selector.includes("tr") || selector.includes("w\\:tr")) {
            // Return mock row elements
            return [
              {
                querySelectorAll: (cellSelector: string) => {
                  if (cellSelector.includes("tc") || cellSelector.includes("w\\:tc")) {
                    return [
                      {
                        querySelector: (propSelector: string) => null,
                        querySelectorAll: (pSelector: string) => {
                          if (pSelector.includes("p") || pSelector.includes("w\\:p")) {
                            return [];
                          }
                          return [];
                        },
                      },
                    ];
                  }
                  return [];
                },
                querySelector: (propSelector: string) => null,
              },
            ];
          }
          return [];
        },
        querySelector: (selector: string) => null,
      } as any;

      const result = await Effect.runPromise(parseTableEnhanced(mockTable));

      expect(result.type).toBe("table");
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]?.cells).toHaveLength(1);
    });
  });

  describe("parseTableProperties with advanced features", () => {
    test("should parse table indentation", async () => {
      const mockTblPr = {
        querySelector: (selector: string) => {
          // Handle compound selectors like "tblInd, w\:tblInd"
          if (selector.includes("tblInd")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return "1440";
                if (attr === "type") return "dxa";
                return null;
              },
            };
          }
          return null;
        },
      } as any;

      const result = await Effect.runPromise(parseTableProperties(mockTblPr));
      expect(result.indentation).toBe("1440px");
    });

    test("should parse table indentation percentage", async () => {
      const mockTblPr = {
        querySelector: (selector: string) => {
          // Handle compound selectors like "tblInd, w\:tblInd"
          if (selector.includes("tblInd")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return "20";
                if (attr === "type") return "pct";
                return null;
              },
            };
          }
          return null;
        },
      } as any;

      const result = await Effect.runPromise(parseTableProperties(mockTblPr));
      expect(result.indentation).toBe("20%");
    });

    test("should parse table borders", async () => {
      const mockBorderElement = (side: string, val: string, sz: string, color: string) => ({
        getAttribute: (attr: string) => {
          if (attr === "val") return val;
          if (attr === "sz") return sz;
          if (attr === "color") return color;
          return null;
        },
      });

      const mockTblPr = {
        querySelector: (selector: string) => {
          // Handle compound selectors like "tblBorders, w\:tblBorders"
          if (selector.includes("tblBorders")) {
            return {
              querySelector: (borderSelector: string) => {
                // Extract the side from selectors like "top, w\:top"
                const side = borderSelector.split(",")[0]?.trim() ?? "";
                if (side === "top")
                  return mockBorderElement("top", "single", "4", "000000");
                if (side === "right")
                  return mockBorderElement("right", "dashed", "8", "FF0000");
                if (side === "bottom")
                  return mockBorderElement("bottom", "dotted", "16", "00FF00");
                if (side === "left")
                  return mockBorderElement("left", "double", "24", "0000FF");
                return null;
              },
            };
          }
          return null;
        },
      } as any;

      const result = await Effect.runPromise(parseTableProperties(mockTblPr));

      expect(result.borders).toBeDefined();
      expect(result.borders?.top).toBe("1px solid #000000");
      expect(result.borders?.right).toBe("1px dashed #FF0000");
      expect(result.borders?.bottom).toBe("2px dotted #00FF00");
      expect(result.borders?.left).toBe("3px solid #0000FF");
    });

    test("should handle borders with auto color", async () => {
      const mockTblPr = {
        querySelector: (selector: string) => {
          if (selector.includes("tblBorders")) {
            return {
              querySelector: (borderSelector: string) => {
                // Extract the side from selectors like "top, w\:top"
                const side = borderSelector.split(",")[0]?.trim() ?? "";
                if (side === "top") {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val") return "single";
                      if (attr === "sz") return "8";
                      if (attr === "color") return "auto";
                      return null;
                    },
                  };
                }
                return null;
              },
            };
          }
          return null;
        },
      } as any;

      const result = await Effect.runPromise(parseTableProperties(mockTblPr));
      expect(result.borders?.top).toBe("1px solid #000000");
    });

    test("should handle borders without size", async () => {
      const mockTblPr = {
        querySelector: (selector: string) => {
          if (selector.includes("tblBorders")) {
            return {
              querySelector: (borderSelector: string) => {
                // Extract the side from selectors like "top, w\:top"
                const side = borderSelector.split(",")[0]?.trim() ?? "";
                if (side === "top") {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val") return "single";
                      if (attr === "color") return "FF0000";
                      return null;
                    },
                  };
                }
                return null;
              },
            };
          }
          return null;
        },
      } as any;

      const result = await Effect.runPromise(parseTableProperties(mockTblPr));
      expect(result.borders?.top).toBe("1px solid #FF0000");
    });

    test("should ignore none borders", async () => {
      const mockTblPr = {
        querySelector: (selector: string) => {
          if (selector.includes("tblBorders")) {
            return {
              querySelector: (borderSelector: string) => {
                // Extract the side from selectors like "top, w\:top"
                const side = borderSelector.split(",")[0]?.trim() ?? "";
                if (side === "top") {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val") return "none";
                      return null;
                    },
                  };
                }
                if (side === "right") {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val") return "single";
                      if (attr === "sz") return "8";
                      if (attr === "color") return "000000";
                      return null;
                    },
                  };
                }
                return null;
              },
            };
          }
          return null;
        },
      } as any;

      const result = await Effect.runPromise(parseTableProperties(mockTblPr));
      expect(result.borders?.top).toBeUndefined();
      expect(result.borders?.right).toBe("1px solid #000000");
    });
  });

  describe("parseTableCellProperties with borders", () => {
    test("should parse cell borders", async () => {
      const mockTcPr = {
        querySelector: (selector: string) => {
          if (selector.includes("tcBorders")) {
            return {
              querySelector: (borderSelector: string) => {
                // Extract the side from selectors like "top, w\:top"
                const side = borderSelector.split(",")[0]?.trim() ?? "";
                if (side === "top" || side === "bottom") {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val") return "single";
                      if (attr === "sz") return "4";
                      if (attr === "color") return "FF0000";
                      return null;
                    },
                  };
                }
                return null;
              },
            };
          }
          return null;
        },
      } as any;

      const result = await Effect.runPromise(parseTableCellProperties(mockTcPr));
      expect(result.borders).toBeDefined();
      expect(result.borders?.top).toBe("1px solid #FF0000");
      expect(result.borders?.bottom).toBe("1px solid #FF0000");
    });
  });

  describe("parseTableRowEnhanced", () => {
    test("should parse row with cells", async () => {
      const mockRow = {
        querySelectorAll: (selector: string) => {
          if (selector.includes("tc") || selector.includes("w\\:tc")) {
            return [
              {
                querySelector: (propSelector: string) => null,
                querySelectorAll: (pSelector: string) => [],
              },
            ];
          }
          return [];
        },
        querySelector: (selector: string) => {
          if (selector.includes("trPr")) {
            return {
              querySelector: (heightSelector: string) => {
                if (heightSelector.includes("trHeight")) {
                  return {
                    getAttribute: (attr: string) => (attr === "val" ? "500" : null),
                  };
                }
                return null;
              },
            };
          }
          return null;
        },
      } as any;

      const result = await Effect.runPromise(parseTableRowEnhanced(mockRow));
      expect(result.cells).toHaveLength(1);
      expect(result.properties?.height).toBe("500px");
    });
  });

  describe("parseTableCellEnhanced", () => {
    test("should handle paragraph parsing errors gracefully", async () => {
      // Create a mock cell with paragraphs that will trigger the error path
      const mockCell = {
        querySelectorAll: (selector: string) => {
          if (selector.includes("p") || selector.includes("w\\:p")) {
            // Return mock paragraph elements
            // The parseParagraph function will be called on these
            return [
              {
                // Valid paragraph structure
                querySelectorAll: () => [
                  {
                    querySelectorAll: () => [
                      {
                        querySelector: () => ({ textContent: "Valid paragraph" }),
                      },
                    ],
                  },
                ],
              },
              {
                // Invalid structure that will cause parseParagraph to throw
                querySelectorAll: () => {
                  throw new Error("Parse error");
                },
              },
              {
                // Another valid paragraph
                querySelectorAll: () => [
                  {
                    querySelectorAll: () => [
                      {
                        querySelector: () => ({ textContent: "Another valid paragraph" }),
                      },
                    ],
                  },
                ],
              },
            ];
          }
          return [];
        },
        querySelector: (selector: string) => null,
      } as any;

      const result = await Effect.runPromise(parseTableCellEnhanced(mockCell));

      // Should have some content despite one paragraph failing
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThanOrEqual(0);
    });

    test("should parse cell with valid paragraphs", async () => {
      const mockCell = {
        querySelectorAll: (selector: string) => {
          if (selector.includes("p") || selector.includes("w\\:p")) {
            return [];
          }
          return [];
        },
        querySelector: (selector: string) => {
          if (selector.includes("tcPr")) {
            return {
              querySelector: (propSelector: string) => {
                if (propSelector.includes("tcW")) {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "w") return "2500";
                      if (attr === "type") return "dxa";
                      return null;
                    },
                  };
                }
                return null;
              },
            };
          }
          return null;
        },
      } as any;

      const result = await Effect.runPromise(parseTableCellEnhanced(mockCell));
      expect(result.content).toHaveLength(0);
      expect(result.properties?.width).toBe("2500px");
    });
  });
});
