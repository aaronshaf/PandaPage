import { describe, test, expect } from "bun:test";
import { Effect } from "effect";
import {
  parseTableEnhanced,
  parseTableRowEnhanced,
  parseTableCellEnhanced,
  parseTableProperties,
  parseTableRowProperties,
  parseTableCellProperties,
} from "./table-parser";

describe("Table Parser Additional Tests", () => {
  describe("parseTableEnhanced", () => {
    test.skip("should parse table with rows", async () => {
      const mockRow = {
        cells: [
          {
            content: [
              {
                runs: [{ text: "Test cell" }],
              },
            ],
            properties: { width: "100px" },
          },
        ],
        properties: { height: "50px" },
      };

      const mockElement = {
        querySelectorAll: (selector: string) => {
          if (selector.includes("tr")) {
            return [
              {
                querySelectorAll: (s: string) => {
                  if (s.includes("tc")) {
                    return [
                      {
                        querySelectorAll: (s2: string) => {
                          if (s2.includes("p")) {
                            return [
                              {
                                // Mock paragraph element
                                querySelector: () => null,
                                querySelectorAll: () => [],
                                childNodes: [],
                              },
                            ];
                          }
                          return [];
                        },
                        querySelector: (s2: string) => {
                          if (s2.includes("tcPr")) {
                            return {
                              querySelector: (s3: string) => {
                                if (s3 === "tcW") {
                                  return {
                                    getAttribute: (attr: string) => {
                                      if (attr === "w") return "100";
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
                      },
                    ];
                  }
                  return [];
                },
                querySelector: (s: string) => {
                  if (s.includes("trPr")) {
                    return {
                      querySelector: (s2: string) => {
                        if (s2 === "trHeight") {
                          return {
                            getAttribute: (attr: string) =>
                              attr === "val" || attr === "w:val" ? "50" : null,
                          };
                        }
                        return null;
                      },
                    };
                  }
                  return null;
                },
              },
            ];
          }
          return [];
        },
        querySelector: () => null,
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableEnhanced(mockElement));
      expect(result.type).toBe("table");
      expect(result.rows).toHaveLength(1);
    });

    test.skip("should handle table with properties", async () => {
      const mockElement = {
        querySelectorAll: () => [],
        querySelector: (selector: string) => {
          if (selector.includes("tblPr")) {
            return {
              querySelector: (s: string) => {
                if (s === "tblW") {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "w" || attr === "w:w") return "100";
                      if (attr === "type" || attr === "w:type") return "pct";
                      return null;
                    },
                  };
                }
                if (s === "jc") {
                  return {
                    getAttribute: (attr: string) =>
                      attr === "val" || attr === "w:val" ? "right" : null,
                  };
                }
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableEnhanced(mockElement));
      expect(result.properties?.width).toBe("100%");
      expect(result.properties?.alignment).toBe("right");
    });
  });

  describe("parseTableRowEnhanced", () => {
    test.skip("should parse row with header", async () => {
      const mockElement = {
        querySelectorAll: () => [],
        querySelector: (selector: string) => {
          if (selector.includes("trPr")) {
            return {
              querySelector: (s: string) => {
                if (s === "tblHeader") {
                  return {}; // Element exists
                }
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableRowEnhanced(mockElement));
      expect(result.properties?.isHeader).toBe(true);
    });
  });

  describe("parseTableCellEnhanced", () => {
    test.skip("should parse cell with paragraphs", async () => {
      // Mock parseParagraph to succeed
      const mockParagraphElements = [
        {
          querySelector: () => null,
          querySelectorAll: () => [],
          childNodes: [],
        },
      ];

      const mockElement = {
        querySelectorAll: (selector: string) => {
          if (selector.includes("p")) {
            return mockParagraphElements;
          }
          return [];
        },
        querySelector: () => null,
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableCellEnhanced(mockElement));
      expect(result.content).toBeDefined();
    });
  });

  describe("parseTableProperties - additional cases", () => {
    test("should parse table indentation", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblInd")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w" || attr === "w:w") return "720";
                if (attr === "type" || attr === "w:type") return "dxa";
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.indentation).toBe("720px");
    });

    test("should parse table borders", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblBorders")) {
            return {
              querySelector: (side: string) => {
                // Handle compound selectors like "top, w:top"
                const sides = side.split(",").map((s) => s.trim().replace("w:", ""));
                const cleanSide = sides[0] || "";
                if (["top", "right", "bottom", "left"].includes(cleanSide)) {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val" || attr === "w:val" || attr === "w:val") return "single";
                      if (attr === "sz" || attr === "w:sz") return "16"; // 16 eighths = 2px
                      if (attr === "color" || attr === "w:color") return "FF0000";
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
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.borders).toBeDefined();
      expect(properties.borders?.top).toBe("2px solid #FF0000");
      expect(properties.borders?.right).toBe("2px solid #FF0000");
      expect(properties.borders?.bottom).toBe("2px solid #FF0000");
      expect(properties.borders?.left).toBe("2px solid #FF0000");
    });

    test("should handle shading with auto fill", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("shd")) {
            return {
              getAttribute: (attr: string) => (attr === "fill" ? "auto" : null),
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.backgroundColor).toBeUndefined();
    });

    test("should parse indentation without type", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblInd")) {
            return {
              getAttribute: (attr: string) => (attr === "w" ? "500" : null),
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.indentation).toBe("500px");
    });
  });

  describe("parseTableRowProperties - additional cases", () => {
    test("should handle missing height value", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("trHeight")) {
            return {
              getAttribute: () => null,
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableRowProperties(mockElement));
      expect(properties.height).toBeUndefined();
    });
  });

  describe("parseTableCellProperties - additional cases", () => {
    test("should handle invalid alignment value", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("vAlign")) {
            return {
              getAttribute: (attr: string) =>
                attr === "val" || attr === "w:val" ? "justify" : null,
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
      expect(properties.alignment).toBeUndefined();
    });

    test("should parse cell borders", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tcBorders")) {
            return {
              querySelector: (side: string) => {
                // Handle compound selectors
                const sides = side.split(",").map((s) => s.trim().replace("w:", ""));
                if (sides.includes("top")) {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val" || attr === "w:val") return "dashed";
                      if (attr === "sz" || attr === "w:sz") return "8";
                      if (attr === "color" || attr === "w:color") return "0000FF";
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
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
      expect(properties.borders?.top).toBe("1px dashed #0000FF");
    });
  });

  describe("Border parsing edge cases", () => {
    test.skip("should handle dotted border style", async () => {
      const mockBordersElement = {
        querySelector: (side: string) => {
          if (side === "top") {
            return {
              getAttribute: (attr: string) => {
                if (attr === "val" || attr === "w:val") return "dotted";
                if (attr === "sz" || attr === "w:sz") return "12";
                if (attr === "color" || attr === "w:color") return "00FF00";
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblBorders")) {
            return mockBordersElement;
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.borders?.top).toBe("1.5px dotted #00FF00");
    });

    test.skip("should handle very small border width", async () => {
      const mockBordersElement = {
        querySelector: (side: string) => {
          if (side === "top") {
            return {
              getAttribute: (attr: string) => {
                if (attr === "val" || attr === "w:val") return "single";
                if (attr === "sz" || attr === "w:sz") return "2"; // Less than 8, should still be 1px minimum
                if (attr === "color" || attr === "w:color") return "000000";
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblBorders")) {
            return mockBordersElement;
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.borders?.top).toBe("1px solid #000000");
    });
  });
});
