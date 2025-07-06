import { test, expect } from '@playwright/test';

test.describe('Verify Document Titles', () => {
  const documents = [
    { file: '001.docx', expectedTitle: 'Heading 1' },
    { file: '002.docx', expectedTitle: 'Example 1 – Find and Replace' },
    { file: '003.docx', expectedTitle: 'Open Source Policy Template' }
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
      
      // Should match expected title
      expect(titleText).toBe(doc.expectedTitle);
    });
  }
});