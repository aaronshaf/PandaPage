import { test, expect, describe } from "bun:test";
import { safeEvaluateArithmetic, isSimpleArithmetic } from "./safe-evaluator";

describe("safeEvaluateArithmetic", () => {
  test("should evaluate simple addition", () => {
    const result = safeEvaluateArithmetic("2+3");
    expect(result.success).toBe(true);
    expect(result.result).toBe(5);
  });

  test("should evaluate simple subtraction", () => {
    const result = safeEvaluateArithmetic("10-3");
    expect(result.success).toBe(true);
    expect(result.result).toBe(7);
  });

  test("should evaluate simple multiplication", () => {
    const result = safeEvaluateArithmetic("4*5");
    expect(result.success).toBe(true);
    expect(result.result).toBe(20);
  });

  test("should evaluate simple division", () => {
    const result = safeEvaluateArithmetic("15/3");
    expect(result.success).toBe(true);
    expect(result.result).toBe(5);
  });

  test("should handle parentheses correctly", () => {
    const result = safeEvaluateArithmetic("(2+3)*4");
    expect(result.success).toBe(true);
    expect(result.result).toBe(20);
  });

  test("should handle operator precedence", () => {
    const result = safeEvaluateArithmetic("2+3*4");
    expect(result.success).toBe(true);
    expect(result.result).toBe(14); // 2 + (3*4) = 14
  });

  test("should handle complex expressions", () => {
    const result = safeEvaluateArithmetic("(10+5)/3*2-1");
    expect(result.success).toBe(true);
    expect(result.result).toBe(9); // ((10+5)/3)*2-1 = (15/3)*2-1 = 5*2-1 = 9
  });

  test("should handle decimal numbers", () => {
    const result = safeEvaluateArithmetic("3.14*2");
    expect(result.success).toBe(true);
    expect(result.result).toBe(6.28);
  });

  test("should handle negative numbers", () => {
    const result = safeEvaluateArithmetic("-5+10");
    expect(result.success).toBe(true);
    expect(result.result).toBe(5);
  });

  test("should handle whitespace", () => {
    const result = safeEvaluateArithmetic(" 2 + 3 * 4 ");
    expect(result.success).toBe(true);
    expect(result.result).toBe(14);
  });

  test("should reject division by zero", () => {
    const result = safeEvaluateArithmetic("5/0");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Division by zero");
  });

  test("should reject empty input", () => {
    const result = safeEvaluateArithmetic("");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid input");
  });

  test("should reject non-string input", () => {
    const result = safeEvaluateArithmetic(null as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid input");
  });

  test("should reject invalid characters", () => {
    const result = safeEvaluateArithmetic("2+3; alert('xss')");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid characters");
  });

  test("should reject function calls", () => {
    const result = safeEvaluateArithmetic("Math.max(1,2)");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid characters");
  });

  test("should reject variable references", () => {
    const result = safeEvaluateArithmetic("x+y");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid characters");
  });

  test("should reject strings", () => {
    const result = safeEvaluateArithmetic("'hello'");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid characters");
  });

  test("should reject semicolons", () => {
    const result = safeEvaluateArithmetic("2+3;");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid characters");
  });

  test("should reject malformed expressions", () => {
    const result = safeEvaluateArithmetic("2*/3");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unexpected token");
  });

  test("should reject unmatched parentheses", () => {
    const result = safeEvaluateArithmetic("(2+3");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Expected RPAREN");
  });

  test("should reject overly long expressions", () => {
    const longExpr = "1+" + "1+".repeat(100) + "1";
    const result = safeEvaluateArithmetic(longExpr);
    expect(result.success).toBe(false);
    expect(result.error).toContain("too long");
  });

  test("should handle very large numbers", () => {
    const result = safeEvaluateArithmetic("999999999*999999999");
    expect(result.success).toBe(true);
    // Note: Large number precision may be lost at runtime
    expect(result.result).toBeCloseTo(999999998000000000, -6);
  });

  test("should reject infinite results", () => {
    const result = safeEvaluateArithmetic("1e308*10");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not finite");
  });
});

describe("isSimpleArithmetic", () => {
  test("should identify simple arithmetic expressions", () => {
    expect(isSimpleArithmetic("2+3")).toBe(true);
    expect(isSimpleArithmetic("10*5/2")).toBe(true);
    expect(isSimpleArithmetic("(1+2)*3")).toBe(true);
    expect(isSimpleArithmetic("3.14*2")).toBe(true);
  });

  test("should reject non-arithmetic expressions", () => {
    expect(isSimpleArithmetic("")).toBe(false);
    expect(isSimpleArithmetic("hello")).toBe(false);
    expect(isSimpleArithmetic("Math.max(1,2)")).toBe(false);
    expect(isSimpleArithmetic("alert('xss')")).toBe(false);
    expect(isSimpleArithmetic("x+y")).toBe(false);
  });

  test("should reject overly long expressions", () => {
    const longExpr = "1+" + "1+".repeat(100) + "1";
    expect(isSimpleArithmetic(longExpr)).toBe(false);
  });

  test("should handle null/undefined input", () => {
    expect(isSimpleArithmetic(null as any)).toBe(false);
    expect(isSimpleArithmetic(undefined as any)).toBe(false);
  });
});

describe("Security tests", () => {
  test("should not execute JavaScript code", () => {
    const maliciousInputs = [
      "eval('alert(1)')",
      "Function('alert(1)')()",
      "this.constructor.constructor('alert(1)')()",
      "[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]][([][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]])[+!+[]+[+[]]]+([][[]]+[])[+!+[]]+(![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[+!+[]]+([][[]]+[])[+[]]+([][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[][(![]+[])[+[]]+([![]]+[][[]])[+!+[]+[+[]]]+(![]+[])[!+[]+!+[]]+(!![]+[])[+[]]+(!![]+[])[!+[]+!+[]+!+[]]+(!![]+[])[+!+[]]])[+!+[]+[+[]]]+(!![]+[])[+!+[]]]('alert(1)'))",
      "window['eval']('alert(1)')",
      "globalThis['Function']('alert(1)')()",
    ];

    maliciousInputs.forEach(input => {
      const result = safeEvaluateArithmetic(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid characters");
    });
  });

  test("should not access global objects", () => {
    const maliciousInputs = [
      "window",
      "global",
      "globalThis",
      "process",
      "require",
      "module",
      "exports",
      "__filename",
      "__dirname",
    ];

    maliciousInputs.forEach(input => {
      const result = safeEvaluateArithmetic(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid characters");
    });
  });

  test("should not allow property access", () => {
    const maliciousInputs = [
      "1..constructor",
      "1['constructor']",
      "(1).constructor",
      "1.toString.constructor",
    ];

    maliciousInputs.forEach(input => {
      const result = safeEvaluateArithmetic(input);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid characters");
    });
  });
});