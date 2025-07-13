/**
 * Safe arithmetic expression evaluator
 * Replaces dangerous Function() constructor with a secure parser
 */

export interface SafeEvaluatorResult {
  success: boolean;
  result: number;
  error?: string;
}

/**
 * Token types for arithmetic expressions
 */
type TokenType = 'NUMBER' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'EOF';

interface Token {
  type: TokenType;
  value: string | number;
  position: number;
}

/**
 * Lexical analyzer for arithmetic expressions
 */
class ArithmeticLexer {
  private input: string;
  private position: number = 0;
  private current: string | null = null;

  constructor(input: string) {
    this.input = input.replace(/\s+/g, ''); // Remove whitespace
    this.current = this.input[0] ?? null;
  }

  private advance(): void {
    this.position++;
    this.current = this.position < this.input.length ? this.input[this.position] ?? null : null;
  }

  private isDigit(char: string | null): boolean {
    return char !== null && /[0-9]/.test(char);
  }

  private isOperator(char: string | null): boolean {
    return char !== null && /[+\-*/]/.test(char);
  }

  private readNumber(): number {
    let numStr = '';
    let hasDot = false;
    let hasE = false;

    while (this.current !== null && (this.isDigit(this.current) || this.current === '.' || 
           (this.current.toLowerCase() === 'e' && !hasE))) {
      if (this.current === '.') {
        if (hasDot) break; // Multiple dots not allowed
        hasDot = true;
      } else if (this.current.toLowerCase() === 'e') {
        if (hasE) break; // Multiple e's not allowed
        hasE = true;
        numStr += this.current;
        this.advance();
        // Handle optional + or - after e
        if (this.current === '+' || this.current === '-') {
          numStr += this.current;
          this.advance();
        }
        continue;
      }
      numStr += this.current;
      this.advance();
    }

    const num = parseFloat(numStr);
    if (isNaN(num) || !Number.isFinite(num)) {
      throw new Error(`Invalid number: ${numStr}`);
    }
    return num;
  }

  getNextToken(): Token {
    while (this.current !== null) {
      const pos = this.position;

      if (this.isDigit(this.current)) {
        return {
          type: 'NUMBER',
          value: this.readNumber(),
          position: pos
        };
      }

      if (this.isOperator(this.current)) {
        const op = this.current;
        this.advance();
        return {
          type: 'OPERATOR',
          value: op,
          position: pos
        };
      }

      if (this.current === '(') {
        this.advance();
        return {
          type: 'LPAREN',
          value: '(',
          position: pos
        };
      }

      if (this.current === ')') {
        this.advance();
        return {
          type: 'RPAREN',
          value: ')',
          position: pos
        };
      }

      throw new Error(`Unexpected character: ${this.current} at position ${this.position}`);
    }

    return {
      type: 'EOF',
      value: '',
      position: this.position
    };
  }
}

/**
 * Recursive descent parser for arithmetic expressions
 * Grammar:
 *   expression: term (('+' | '-') term)*
 *   term: factor (('*' | '/') factor)*
 *   factor: NUMBER | '(' expression ')'
 */
class ArithmeticParser {
  private lexer: ArithmeticLexer;
  private currentToken: Token;

  constructor(input: string) {
    this.lexer = new ArithmeticLexer(input);
    this.currentToken = this.lexer.getNextToken();
  }

  private consume(expectedType: TokenType): void {
    if (this.currentToken.type === expectedType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      throw new Error(`Expected ${expectedType}, got ${this.currentToken.type} at position ${this.currentToken.position}`);
    }
  }

  private factor(): number {
    const token = this.currentToken;

    if (token.type === 'NUMBER') {
      this.consume('NUMBER');
      return token.value as number;
    }

    if (token.type === 'LPAREN') {
      this.consume('LPAREN');
      const result = this.expression();
      this.consume('RPAREN');
      return result;
    }

    // Handle unary minus
    if (token.type === 'OPERATOR' && token.value === '-') {
      this.consume('OPERATOR');
      return -this.factor();
    }

    // Handle unary plus
    if (token.type === 'OPERATOR' && token.value === '+') {
      this.consume('OPERATOR');
      return this.factor();
    }

    throw new Error(`Unexpected token ${token.type} at position ${token.position}`);
  }

  private term(): number {
    let result = this.factor();

    while (this.currentToken.type === 'OPERATOR' && 
           (this.currentToken.value === '*' || this.currentToken.value === '/')) {
      const op = this.currentToken.value as string;
      this.consume('OPERATOR');
      const right = this.factor();

      if (op === '*') {
        result *= right;
      } else if (op === '/') {
        if (right === 0) {
          throw new Error('Division by zero');
        }
        result /= right;
      }

      // Check for overflow/underflow
      if (!Number.isFinite(result)) {
        throw new Error('Result is not finite');
      }
    }

    return result;
  }

  private expression(): number {
    let result = this.term();

    while (this.currentToken.type === 'OPERATOR' && 
           (this.currentToken.value === '+' || this.currentToken.value === '-')) {
      const op = this.currentToken.value as string;
      this.consume('OPERATOR');
      const right = this.term();

      if (op === '+') {
        result += right;
      } else if (op === '-') {
        result -= right;
      }

      // Check for overflow/underflow
      if (!Number.isFinite(result)) {
        throw new Error('Result is not finite');
      }
    }

    return result;
  }

  parse(): number {
    const result = this.expression();
    
    if (this.currentToken.type !== 'EOF') {
      throw new Error(`Unexpected token ${this.currentToken.type} at position ${this.currentToken.position}`);
    }

    return result;
  }
}

/**
 * Safely evaluate a simple arithmetic expression
 * Only supports basic arithmetic operations: +, -, *, /, (, )
 * Does not use eval() or Function() constructor
 * 
 * @param expression - Arithmetic expression string (e.g., "2+3*4")
 * @returns SafeEvaluatorResult with success flag and result or error
 */
export function safeEvaluateArithmetic(expression: string): SafeEvaluatorResult {
  try {
    // Basic input validation
    if (!expression || typeof expression !== 'string') {
      return {
        success: false,
        result: 0,
        error: 'Invalid input: expression must be a non-empty string'
      };
    }

    // Remove whitespace and validate characters
    const cleaned = expression.replace(/\s+/g, '');
    if (!/^[0-9+\-*/.()eE]+$/.test(cleaned)) {
      return {
        success: false,
        result: 0,
        error: 'Invalid characters in expression. Only numbers and operators (+, -, *, /, (, )) are allowed'
      };
    }

    // Prevent excessively long expressions (DoS protection)
    if (cleaned.length > 100) {
      return {
        success: false,
        result: 0,
        error: 'Expression too long. Maximum 100 characters allowed'
      };
    }

    // Parse and evaluate
    const parser = new ArithmeticParser(cleaned);
    const result = parser.parse();

    return {
      success: true,
      result
    };
  } catch (error) {
    return {
      success: false,
      result: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check if an expression is a simple arithmetic expression
 * @param expression - Expression to check
 * @returns true if expression looks like simple arithmetic
 */
export function isSimpleArithmetic(expression: string): boolean {
  if (!expression || typeof expression !== 'string') {
    return false;
  }

  const cleaned = expression.replace(/\s+/g, '');
  
  // Must contain only allowed characters
  if (!/^[0-9+\-*/.()eE]+$/.test(cleaned)) {
    return false;
  }

  // Must not be too long
  if (cleaned.length > 100) {
    return false;
  }

  // Should contain at least one operator or number
  return /[0-9]/.test(cleaned);
}