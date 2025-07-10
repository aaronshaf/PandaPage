import { describe, it, expect } from 'bun:test';

/**
 * Test the isPunctuationOnly function
 */
function isPunctuationOnly(text: string): boolean {
  const punctuationRegex = /^[\s\p{P}\p{S}]+$/u;
  return punctuationRegex.test(text);
}

describe('Language attribute filtering for quotation marks', () => {
  it('should identify quotation marks as punctuation only', () => {
    expect(isPunctuationOnly('"')).toBe(true);
    expect(isPunctuationOnly("'")).toBe(true);
    expect(isPunctuationOnly('""')).toBe(true);
    expect(isPunctuationOnly('\u201C')).toBe(true); // Opening quote  
    expect(isPunctuationOnly('\u201D')).toBe(true); // Closing quote
    expect(isPunctuationOnly('\u2018')).toBe(true); // Opening single quote
    expect(isPunctuationOnly('\u2019')).toBe(true); // Closing single quote
  });

  it('should identify other punctuation as punctuation only', () => {
    expect(isPunctuationOnly('.')).toBe(true);
    expect(isPunctuationOnly(',')).toBe(true);
    expect(isPunctuationOnly(';')).toBe(true);
    expect(isPunctuationOnly(':')).toBe(true);
    expect(isPunctuationOnly('!')).toBe(true);
    expect(isPunctuationOnly('?')).toBe(true);
    expect(isPunctuationOnly('(')).toBe(true);
    expect(isPunctuationOnly(')')).toBe(true);
    expect(isPunctuationOnly('-')).toBe(true);
    expect(isPunctuationOnly('--')).toBe(true);
  });

  it('should identify whitespace as punctuation only', () => {
    expect(isPunctuationOnly(' ')).toBe(true);
    expect(isPunctuationOnly('  ')).toBe(true);
    expect(isPunctuationOnly('\t')).toBe(true);
    expect(isPunctuationOnly('\n')).toBe(true);
  });

  it('should identify mixed punctuation and whitespace as punctuation only', () => {
    expect(isPunctuationOnly(' " ')).toBe(true);
    expect(isPunctuationOnly('" ')).toBe(true);
    expect(isPunctuationOnly(' "')).toBe(true);
    expect(isPunctuationOnly('." ')).toBe(true);
    expect(isPunctuationOnly(' ,')).toBe(true);
  });

  it('should NOT identify text with letters as punctuation only', () => {
    expect(isPunctuationOnly('Hello')).toBe(false);
    expect(isPunctuationOnly('Insert')).toBe(false);
    expect(isPunctuationOnly('"Hello"')).toBe(false);
    expect(isPunctuationOnly("won't")).toBe(false);
    expect(isPunctuationOnly('U.S.')).toBe(false);
    expect(isPunctuationOnly('123')).toBe(false);
    expect(isPunctuationOnly('a')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isPunctuationOnly('')).toBe(false); // Empty string - should be false
    expect(isPunctuationOnly('€')).toBe(true); // Currency symbol
    expect(isPunctuationOnly('©')).toBe(true); // Copyright symbol
    expect(isPunctuationOnly('™')).toBe(true); // Trademark symbol
  });
});