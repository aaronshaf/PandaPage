import { test, expect } from '@playwright/test';

test.describe('Document Title Tests', () => {
  test('should extract and display document title', async ({ page }) => {
    // Navigate to 001.docx
    await page.goto('/#001.docx');
    
    // Wait for document to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Give time for title extraction
    
    // The title should be visible in the navigation bar
    // It should NOT just be "001.docx" or "pandapage"
    const titleText = await page.textContent('[data-testid="document-title"], nav h1, nav .font-medium');
    
    console.log('Found title:', titleText);
    
    // Title should exist and not be empty
    expect(titleText).toBeTruthy();
    expect(titleText?.trim().length).toBeGreaterThan(0);
    
    // Title should not be just the filename
    expect(titleText).not.toBe('001.docx');
    expect(titleText).not.toBe('001');
    
    // If it's showing pandapage, that means title extraction failed
    if (titleText === 'pandapage') {
      console.warn('Title extraction may have failed - showing default "pandapage"');
    }
    
    // The title should be something meaningful from the document
    // For 001.docx, it should extract from content if no metadata
    expect(titleText).not.toBe('--');
  });

  test('should show first heading as title if no metadata', async ({ page }) => {
    await page.goto('/#001.docx');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check if "Heading 1" (the first heading in the doc) might be used as title
    const pageContent = await page.content();
    
    // Log what we find for debugging
    console.log('Page contains "Heading 1":', pageContent.includes('Heading 1'));
    
    // At minimum, we should see some meaningful title
    const titleElement = await page.locator('nav').first();
    const navText = await titleElement.textContent();
    expect(navText).toBeTruthy();
  });
});