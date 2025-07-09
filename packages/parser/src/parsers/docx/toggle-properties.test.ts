import { expect, test, describe } from 'bun:test';
import { parseRun } from './paragraph-parser';
import { WORD_NAMESPACE } from './types';
import '../../test-setup';

describe('Toggle Properties (bCs and iCs)', () => {
  const ns = WORD_NAMESPACE;
  
  function createRunElement(properties: string): Element {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<w:r xmlns:w="${ns}">
        <w:rPr>${properties}</w:rPr>
        <w:t>Test text</w:t>
      </w:r>`,
      'text/xml'
    );
    return doc.documentElement;
  }

  describe('Bold with bCs (OR logic)', () => {
    test('only b tag makes text bold', () => {
      const run = createRunElement('<w:b/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(true);
    });

    test('only bCs tag makes text bold', () => {
      const run = createRunElement('<w:bCs/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(true);
    });

    test('both b and bCs tags make text bold', () => {
      const run = createRunElement('<w:b/><w:bCs/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(true);
    });

    test('neither b nor bCs tags means not bold', () => {
      const run = createRunElement('');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(false);
    });

    test('b with w:val="0" should not make text bold', () => {
      const run = createRunElement('<w:b w:val="0"/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(false);
    });

    test('b with w:val="1" should make text bold', () => {
      const run = createRunElement('<w:b w:val="1"/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(true);
    });
  });

  describe('Italic with iCs (OR logic)', () => {
    test('only i tag makes text italic', () => {
      const run = createRunElement('<w:i/>');
      const result = parseRun(run, ns);
      expect(result?.italic).toBe(true);
    });

    test('only iCs tag makes text italic', () => {
      const run = createRunElement('<w:iCs/>');
      const result = parseRun(run, ns);
      expect(result?.italic).toBe(true);
    });

    test('both i and iCs tags make text italic', () => {
      const run = createRunElement('<w:i/><w:iCs/>');
      const result = parseRun(run, ns);
      expect(result?.italic).toBe(true);
    });

    test('neither i nor iCs tags means not italic', () => {
      const run = createRunElement('');
      const result = parseRun(run, ns);
      expect(result?.italic).toBe(false);
    });

    test('i with w:val="0" should not make text italic', () => {
      const run = createRunElement('<w:i w:val="0"/>');
      const result = parseRun(run, ns);
      expect(result?.italic).toBe(false);
    });

    test('i with w:val="1" should make text italic', () => {
      const run = createRunElement('<w:i w:val="1"/>');
      const result = parseRun(run, ns);
      expect(result?.italic).toBe(true);
    });
  });

  describe('Combined bold and italic properties', () => {
    test('b and iCs makes text bold and italic', () => {
      const run = createRunElement('<w:b/><w:iCs/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(true);
      expect(result?.italic).toBe(true);
    });

    test('bCs and i makes text bold and italic', () => {
      const run = createRunElement('<w:bCs/><w:i/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(true);
      expect(result?.italic).toBe(true);
    });

    test('all four tags (b, bCs, i, iCs) make text both bold and italic', () => {
      const run = createRunElement('<w:b/><w:bCs/><w:i/><w:iCs/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(true);
      expect(result?.italic).toBe(true);
    });

    test('b and i makes text bold and italic (no complex script tags)', () => {
      const run = createRunElement('<w:b/><w:i/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(true);
      expect(result?.italic).toBe(true);
    });

    test('bCs and iCs makes text bold and italic (only complex script tags)', () => {
      const run = createRunElement('<w:bCs/><w:iCs/>');
      const result = parseRun(run, ns);
      expect(result?.bold).toBe(true);
      expect(result?.italic).toBe(true);
    });
  });

  describe('Toggle properties with other formatting', () => {
    test('OR logic works with other formatting properties', () => {
      const run = createRunElement(`
        <w:b/>
        <w:bCs/>
        <w:u/>
        <w:strike/>
        <w:sz w:val="24"/>
        <w:color w:val="FF0000"/>
      `);
      const result = parseRun(run, ns);
      
      expect(result?.bold).toBe(true); // b or bCs makes text bold
      expect(result?.underline).toBe(true);
      expect(result?.strikethrough).toBe(true);
      expect(result?.fontSize).toBe("24");
      expect(result?.color).toBe("FF0000");
    });
  });
});