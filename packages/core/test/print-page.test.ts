import { describe, it, expect } from 'bun:test';
import {
  createPageRule,
  getPageSize,
  normalizeMargins,
  createPrintPageContainerCSS,
  createPageBreakCSS,
  calculateOptimalScale,
  generatePageCSS,
  docxPageToCSS,
  detectPageSize,
  createViewportMeta,
  type PageConfig,
  type PageMargins,
  type PageSize
} from '../src/common/print-page.js';

describe('createPageRule', () => {
  it('should create basic page rule', () => {
    const config: PageConfig = {
      size: { width: '8.5in', height: '11in' },
      margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
    };
    
    const rule = createPageRule(config);
    expect(rule).toContain('size: 8.5in 11in');
    expect(rule).toContain('margin: 1in 1in 1in 1in');
  });

  it('should handle landscape orientation', () => {
    const config: PageConfig = {
      size: { width: '8.5in', height: '11in' },
      margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
      orientation: 'landscape'
    };
    
    const rule = createPageRule(config);
    expect(rule).toContain('size: landscape');
  });

  it('should handle bleed and marks', () => {
    const config: PageConfig = {
      size: { width: '8.5in', height: '11in' },
      margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
      bleed: '0.125in',
      marks: 'crop cross'
    };
    
    const rule = createPageRule(config);
    expect(rule).toContain('bleed: 0.125in');
    expect(rule).toContain('marks: crop cross');
  });

  it('should not include marks when set to none', () => {
    const config: PageConfig = {
      size: { width: '8.5in', height: '11in' },
      margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
      marks: 'none'
    };
    
    const rule = createPageRule(config);
    expect(rule).not.toContain('marks:');
  });
});

describe('getPageSize', () => {
  it('should return letter size in portrait', () => {
    const size = getPageSize('letter');
    expect(size).toEqual({ width: '612pt', height: '792pt' });
  });

  it('should return letter size in landscape', () => {
    const size = getPageSize('letter', 'landscape');
    expect(size).toEqual({ width: '792pt', height: '612pt' });
  });

  it('should return A4 size in portrait', () => {
    const size = getPageSize('a4');
    expect(size).toEqual({ width: '595pt', height: '842pt' });
  });

  it('should return A4 size in landscape', () => {
    const size = getPageSize('a4', 'landscape');
    expect(size).toEqual({ width: '842pt', height: '595pt' });
  });

  it('should return legal size', () => {
    const size = getPageSize('legal');
    expect(size).toEqual({ width: '612pt', height: '1008pt' });
  });

  it('should return custom size as-is', () => {
    const customSize: PageSize = { width: '10in', height: '12in' };
    const size = getPageSize(customSize);
    expect(size).toEqual(customSize);
  });

  it('should throw error for unknown page size', () => {
    expect(() => getPageSize('unknown' as any)).toThrow('Unknown page size: unknown');
  });
});

describe('normalizeMargins', () => {
  it('should handle single value', () => {
    const margins = normalizeMargins('10pt');
    expect(margins).toEqual({
      top: '10pt',
      right: '10pt',
      bottom: '10pt',
      left: '10pt'
    });
  });

  it('should handle two values', () => {
    const margins = normalizeMargins('10pt 20pt');
    expect(margins).toEqual({
      top: '10pt',
      right: '20pt',
      bottom: '10pt',
      left: '20pt'
    });
  });

  it('should handle three values', () => {
    const margins = normalizeMargins('10pt 20pt 30pt');
    expect(margins).toEqual({
      top: '10pt',
      right: '20pt',
      bottom: '30pt',
      left: '20pt'
    });
  });

  it('should handle four values', () => {
    const margins = normalizeMargins('10pt 20pt 30pt 40pt');
    expect(margins).toEqual({
      top: '10pt',
      right: '20pt',
      bottom: '30pt',
      left: '40pt'
    });
  });

  it('should handle object input', () => {
    const marginsObj: PageMargins = {
      top: '10pt',
      right: '20pt',
      bottom: '30pt',
      left: '40pt'
    };
    const margins = normalizeMargins(marginsObj);
    expect(margins).toEqual(marginsObj);
  });

  it('should throw error for invalid format', () => {
    expect(() => normalizeMargins('10pt 20pt 30pt 40pt 50pt')).toThrow('Invalid margin format');
  });
});

describe('createPrintPageContainerCSS', () => {
  it('should create CSS for letter size', () => {
    const css = createPrintPageContainerCSS({
      pageSize: 'letter',
      margins: '1in'
    });
    
    expect(css).toContain('width: 612pt');
    expect(css).toContain('height: 792pt');
    expect(css).toContain('top: 72pt');
    expect(css).toContain('left: 72pt');
  });

  it('should create CSS with custom scale', () => {
    const css = createPrintPageContainerCSS({
      pageSize: 'letter',
      margins: '1in',
      scale: 0.8
    });
    
    expect(css).toContain('width: 489.6pt'); // 612 * 0.8
    expect(css).toContain('height: 633.6pt'); // 792 * 0.8
    expect(css).toContain('transform: scale(0.8)');
  });

  it('should create CSS with custom classes', () => {
    const css = createPrintPageContainerCSS({
      pageSize: 'letter',
      margins: '1in',
      containerClass: 'custom-container',
      pageClass: 'custom-page'
    });
    
    expect(css).toContain('.custom-container');
    expect(css).toContain('.custom-page');
  });

  it('should include page break styles when enabled', () => {
    const css = createPrintPageContainerCSS({
      pageSize: 'letter',
      margins: '1in',
      showPageBreaks: true
    });
    
    expect(css).toContain(':after');
    expect(css).toContain('width: 100pt');
  });

  it('should not include page break styles when disabled', () => {
    const css = createPrintPageContainerCSS({
      pageSize: 'letter',
      margins: '1in',
      showPageBreaks: false
    });
    
    expect(css).not.toContain(':after');
  });

  it('should handle landscape orientation', () => {
    const css = createPrintPageContainerCSS({
      pageSize: 'letter',
      margins: '1in',
      orientation: 'landscape'
    });
    
    expect(css).toContain('width: 792pt'); // Swapped dimensions
    expect(css).toContain('height: 612pt');
  });

  it('should handle custom margins', () => {
    const css = createPrintPageContainerCSS({
      pageSize: 'letter',
      margins: '0.5in 1in 1.5in 2in'
    });
    
    expect(css).toContain('top: 36pt');    // 0.5in
    expect(css).toContain('right: 72pt');  // 1in
    expect(css).toContain('bottom: 108pt'); // 1.5in
    expect(css).toContain('left: 144pt');  // 2in
  });
});

describe('createPageBreakCSS', () => {
  it('should create page break utility classes', () => {
    const css = createPageBreakCSS();
    
    expect(css).toContain('.page-break-before');
    expect(css).toContain('.page-break-after');
    expect(css).toContain('.page-break-inside-avoid');
    expect(css).toContain('.avoid-orphans');
    expect(css).toContain('.avoid-widows');
  });

  it('should include print-specific styles', () => {
    const css = createPageBreakCSS();
    
    expect(css).toContain('@media print');
    expect(css).toContain('.print-hidden');
    expect(css).toContain('display: none !important');
  });

  it('should include table-specific styles', () => {
    const css = createPageBreakCSS();
    
    expect(css).toContain('.table-page-break');
    expect(css).toContain('.table-header-repeat');
    expect(css).toContain('display: table-header-group');
  });
});

describe('calculateOptimalScale', () => {
  it('should calculate scale for letter size', () => {
    const scale = calculateOptimalScale(800, 'letter'); // 800px container
    expect(scale).toBeGreaterThan(0);
    expect(scale).toBeLessThanOrEqual(1);
  });

  it('should not exceed max scale', () => {
    const scale = calculateOptimalScale(2000, 'letter', 'portrait', 0.8);
    expect(scale).toBeLessThanOrEqual(0.8);
  });

  it('should have minimum scale of 0.1', () => {
    const scale = calculateOptimalScale(100, 'letter'); // Very small container
    expect(scale).toBeGreaterThanOrEqual(0.1);
  });

  it('should handle landscape orientation', () => {
    const portraitScale = calculateOptimalScale(800, 'letter', 'portrait');
    const landscapeScale = calculateOptimalScale(800, 'letter', 'landscape');
    
    expect(landscapeScale).toBeLessThan(portraitScale);
  });

  it('should handle custom page size', () => {
    const customSize: PageSize = { width: '600pt', height: '800pt' };
    const scale = calculateOptimalScale(800, customSize);
    
    expect(scale).toBeGreaterThan(0);
    expect(scale).toBeLessThanOrEqual(1);
  });
});

describe('generatePageCSS', () => {
  it('should generate complete CSS for letter size', () => {
    const css = generatePageCSS('letter');
    
    expect(css).toContain('@page');
    expect(css).toContain('size: 612pt 792pt');
    expect(css).toContain('.document-container');
    expect(css).toContain('.page-break-before');
  });

  it('should handle custom margins', () => {
    const css = generatePageCSS('letter', '0.5in');
    
    expect(css).toContain('margin: 0.5in 0.5in 0.5in 0.5in');
  });

  it('should handle landscape orientation', () => {
    const css = generatePageCSS('letter', '1in', 'landscape');
    
    expect(css).toContain('size: 792pt 612pt');
    expect(css).toContain('size: landscape');
  });
});

describe('docxPageToCSS', () => {
  it('should convert DOCX page settings to CSS', () => {
    const config = docxPageToCSS(
      12240, // 8.5in in twips
      15840, // 11in in twips
      { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1in margins
    );
    
    expect(config.size.width).toBe('612pt');
    expect(config.size.height).toBe('792pt');
    expect(config.margins.top).toBe('72pt');
    expect(config.margins.right).toBe('72pt');
    expect(config.margins.bottom).toBe('72pt');
    expect(config.margins.left).toBe('72pt');
  });

  it('should handle different margin values', () => {
    const config = docxPageToCSS(
      12240, // 8.5in in twips
      15840, // 11in in twips
      { top: 720, right: 1440, bottom: 1080, left: 2160 } // Different margins
    );
    
    expect(config.margins.top).toBe('36pt');   // 0.5in
    expect(config.margins.right).toBe('72pt'); // 1in
    expect(config.margins.bottom).toBe('54pt'); // 0.75in
    expect(config.margins.left).toBe('108pt'); // 1.5in
  });
});

describe('detectPageSize', () => {
  it('should detect letter size', () => {
    expect(detectPageSize(612, 792)).toBe('letter');
    expect(detectPageSize(792, 612)).toBe('letter'); // Landscape
  });

  it('should detect A4 size', () => {
    expect(detectPageSize(595, 842)).toBe('a4');
    expect(detectPageSize(842, 595)).toBe('a4'); // Landscape
  });

  it('should detect legal size', () => {
    expect(detectPageSize(612, 1008)).toBe('legal');
    expect(detectPageSize(1008, 612)).toBe('legal'); // Landscape
  });

  it('should handle close matches within tolerance', () => {
    expect(detectPageSize(610, 790)).toBe('letter'); // Within 5pt tolerance
    expect(detectPageSize(593, 840)).toBe('a4');
  });

  it('should return null for unknown sizes', () => {
    expect(detectPageSize(500, 600)).toBeNull();
    expect(detectPageSize(1000, 1000)).toBeNull();
  });
});

describe('createViewportMeta', () => {
  it('should create viewport meta for letter size', () => {
    const meta = createViewportMeta('letter');
    
    expect(meta).toContain('<meta name="viewport"');
    expect(meta).toContain('width=816'); // 612pt * 96/72
    expect(meta).toContain('initial-scale=1.0');
    expect(meta).toContain('user-scalable=yes');
  });

  it('should handle custom scale', () => {
    const meta = createViewportMeta('letter', 0.8);
    
    expect(meta).toContain('width=653'); // 816 * 0.8 (rounded)
  });

  it('should handle A4 size', () => {
    const meta = createViewportMeta('a4');
    
    expect(meta).toContain('width=793'); // 595pt * 96/72
  });
});