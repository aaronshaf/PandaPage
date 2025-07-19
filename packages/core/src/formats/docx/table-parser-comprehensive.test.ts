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

describe("Table Parser Comprehensive Coverage", () => {
  describe("parseTableEnhanced", () => {

    test("should handle table without tblPr element", async () => {
      const mockElement = {
        getElementsByTagName: () => [],
        querySelector: (selector: string) => {
          if (selector.includes("tblPr")) return null;
          return null;
        },
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableEnhanced(mockElement));
      expect(result.type).toBe("table");
      expect(result.properties).toBeUndefined();
    });

    test("should parse table properties when tblPr exists", async () => {
      const mockTblPr = {
        querySelector: (selector: string) => {
          if (selector.includes("tblW")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return "5000";
                if (attr === "type") return "dxa";
                return null;
              },
            };
          }
          return null;
        },
      };

      const mockElement = {
        getElementsByTagName: () => [],
        querySelector: (selector: string) => {
          if (selector.includes("tblPr")) return mockTblPr;
          return null;
        },
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableEnhanced(mockElement));
      expect(result.properties?.width).toBe("5000px");
    });
  });

  describe("parseTableRowEnhanced", () => {
    test("should parse row with tc elements", async () => {
      const mockTc = {
        querySelectorAll: (selector: string) => {
          if (selector.includes("p")) return [];
          return [];
        },
        querySelector: () => null,
      };

      const mockElement = {
        querySelectorAll: (selector: string) => {
          if (selector.includes("tc")) return [mockTc, mockTc];
          return [];
        },
        querySelector: () => null,
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableRowEnhanced(mockElement));
      expect(result.cells).toHaveLength(2);
    });

    test("should handle row without trPr", async () => {
      const mockElement = {
        querySelectorAll: () => [],
        querySelector: (selector: string) => {
          if (selector.includes("trPr")) return null;
          return null;
        },
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableRowEnhanced(mockElement));
      expect(result.properties).toBeUndefined();
    });
  });

  describe("parseTableCellEnhanced", () => {
    test("should handle paragraph parsing failure gracefully", async () => {
      const mockPElement = {
        // This will cause parseParagraph to throw
        tagName: null,
        querySelector: () => null,
        querySelectorAll: () => [],
        childNodes: [],
      };

      const mockElement = {
        querySelectorAll: (selector: string) => {
          if (selector.includes("p")) return [mockPElement];
          return [];
        },
        querySelector: () => null,
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableCellEnhanced(mockElement));
      expect(result.content).toHaveLength(1); // parseParagraph doesn't actually throw, it returns a paragraph
    });

    test("should handle cell without tcPr", async () => {
      const mockElement = {
        querySelectorAll: () => [],
        querySelector: (selector: string) => {
          if (selector.includes("tcPr")) return null;
          return null;
        },
      } as unknown as Element;

      const result = await Effect.runPromise(parseTableCellEnhanced(mockElement));
      expect(result.properties).toBeUndefined();
    });
  });

  describe("parseTableProperties advanced cases", () => {
    test("should handle tblW without w attribute", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblW")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return null;
                if (attr === "type") return "dxa";
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.width).toBeUndefined();
    });

    test("should handle tblW without type attribute", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblW")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return "3000";
                if (attr === "type") return null;
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.width).toBeUndefined();
    });

    test("should handle invalid jc values", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("jc")) {
            return {
              getAttribute: (attr: string) => (attr === "val" ? "invalid" : null),
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.alignment).toBeUndefined();
    });

    test("should handle tblInd without w attribute", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblInd")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return null;
                if (attr === "type") return "dxa";
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.indentation).toBeUndefined();
    });

    test("should handle tblInd with percentage type", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblInd")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return "50";
                if (attr === "type") return "pct";
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.indentation).toBe("50%");
    });

    test("should handle shd with auto fill", async () => {
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

    test("should handle shd without fill attribute", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("shd")) {
            return {
              getAttribute: () => null,
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.backgroundColor).toBeUndefined();
    });
  });

  describe("parseTableBorders edge cases", () => {
    test("should handle borders with val='none'", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblBorders")) {
            return {
              querySelector: (side: string) => {
                if (side.includes("top")) {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val") return "none";
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
      expect(properties.borders).toEqual({});
    });

    test("should handle borders without val attribute", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblBorders")) {
            return {
              querySelector: (side: string) => {
                if (side.includes("top")) {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val") return null;
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
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.borders).toEqual({});
    });

    test("should handle border size calculation correctly", async () => {
      const testCases = [
        { sz: "4", expected: "1px" }, // 4/8 = 0.5, should be 1px minimum
        { sz: "8", expected: "1px" }, // 8/8 = 1
        { sz: "16", expected: "2px" }, // 16/8 = 2
        { sz: "12", expected: "1.5px" }, // 12/8 = 1.5
      ];

      for (const testCase of testCases) {
        const mockElement = {
          querySelector: (selector: string) => {
            if (selector.includes("tblBorders")) {
              return {
                querySelector: (side: string) => {
                  if (side.includes("top")) {
                    return {
                      getAttribute: (attr: string) => {
                        if (attr === "val") return "single";
                        if (attr === "sz") return testCase.sz;
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
        } as unknown as Element;

        const properties = await Effect.runPromise(parseTableProperties(mockElement));
        expect(properties.borders?.top).toBe(`${testCase.expected} solid #000000`);
      }
    });

    test("should handle all border sides", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblBorders")) {
            return {
              querySelector: (side: string) => {
                const sides = ["top", "right", "bottom", "left"];
                const cleanSide = side.split(",")[0]?.trim().replace("w:", "") || "";
                if (sides.includes(cleanSide)) {
                  return {
                    getAttribute: (attr: string) => {
                      if (attr === "val") return "single";
                      if (attr === "sz") return "8";
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
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableProperties(mockElement));
      expect(properties.borders).toEqual({
        top: "1px solid #FF0000",
        right: "1px solid #FF0000",
        bottom: "1px solid #FF0000",
        left: "1px solid #FF0000",
      });
    });
  });

  describe("parseTableRowProperties edge cases", () => {
    test("should handle trHeight without val attribute", async () => {
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

    test("should handle missing tblHeader element", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tblHeader")) return null;
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableRowProperties(mockElement));
      expect(properties.isHeader).toBeUndefined();
    });
  });

  describe("parseTableCellProperties edge cases", () => {
    test("should handle tcW without w attribute", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tcW")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return null;
                if (attr === "type") return "dxa";
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
      expect(properties.width).toBeUndefined();
    });

    test("should handle tcW without type attribute", async () => {
      const mockElement = {
        querySelector: (selector: string) => {
          if (selector.includes("tcW")) {
            return {
              getAttribute: (attr: string) => {
                if (attr === "w") return "1500";
                if (attr === "type") return null;
                return null;
              },
            };
          }
          return null;
        },
      } as unknown as Element;

      const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
      expect(properties.width).toBeUndefined();
    });

    test("should handle invalid vAlign values", async () => {
      const invalidValues = ["invalid", "justify", "baseline", null];
      
      for (const invalidValue of invalidValues) {
        const mockElement = {
          querySelector: (selector: string) => {
            if (selector.includes("vAlign")) {
              return {
                getAttribute: (attr: string) => (attr === "val" ? invalidValue : null),
              };
            }
            return null;
          },
        } as unknown as Element;

        const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
        expect(properties.alignment).toBeUndefined();
      }
    });

    test("should handle cell borders with different border styles", async () => {
      const borderStyles = [
        { val: "dashed", expected: "dashed" },
        { val: "dotted", expected: "dotted" },
        { val: "single", expected: "solid" },
        { val: "unknown", expected: "solid" },
      ];

      for (const style of borderStyles) {
        const mockElement = {
          querySelector: (selector: string) => {
            if (selector.includes("tcBorders")) {
              return {
                querySelector: (side: string) => {
                  if (side.includes("top")) {
                    return {
                      getAttribute: (attr: string) => {
                        if (attr === "val") return style.val;
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
        } as unknown as Element;

        const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
        expect(properties.borders?.top).toBe(`1px ${style.expected} #000000`);
      }
    });

    test("should handle cell shd with auto fill", async () => {
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

      const properties = await Effect.runPromise(parseTableCellProperties(mockElement));
      expect(properties.backgroundColor).toBeUndefined();
    });
  });
});