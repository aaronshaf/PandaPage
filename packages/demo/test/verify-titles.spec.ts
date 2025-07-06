import { test, expect } from '@playwright/test';

test.describe('Verify Document Titles', () => {
  const documents = [
    { file: '001.docx', expectedTitle: 'Heading 1' },
    { file: '002.docx', expectedTitle: 'Example 1 – Find and Replace' },
    { file: '003.docx', expectedTitle: 'Open Source Policy Template' },
    { file: '004.docx', expectedTitle: 'End-to-End Open-source Collaboration Guidance' },
    { file: '005.docx', expectedTitle: 'DOCX Demo' },
    { file: '006.docx', expectedTitle: 'Paper Title (24 pt, Bold, Title Case)' },
    { file: '007.docx', expectedTitle: 'Preparation of a Formatted Technical Work' },
    { file: '008.docx', expectedTitle: 'Project Report Template' },
    { file: '009.docx', expectedTitle: 'Summary of Signoff Documents' },
    { file: '010.docx', expectedTitle: 'State and Local Fiscal Recovery Funds Recovery Plan Performance Report Template', contains: 'State and Local Fiscal Recovery' }
  ];

  for (const doc of documents) {
    test(`should extract correct title for ${doc.file}`, async ({ page }) => {
      await page.goto(`/#${doc.file}`);
      await page.waitForLoadState('networkidle');
      
      // Wait for content to load
      await page.waitForTimeout(1000);
      
      const titleText = await page.textContent('[data-testid="app-title"]');
      console.log(`${doc.file}: "${titleText}"`);
      
      // Should not show fallback values
      expect(titleText).not.toBe('--');
      expect(titleText).not.toBe('Loading...');
      expect(titleText).not.toBe('pandapage');
      
      // Should match expected title or contain expected text for long titles
      if (doc.contains) {
        expect(titleText).toContain(doc.contains);
      } else {
        expect(titleText).toBe(doc.expectedTitle);
      }
    });
  }
});