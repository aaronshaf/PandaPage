import { test, expect } from '@playwright/test';

test.describe('Document Pagination', () => {
  test('should show multiple pages in View mode for multi-page documents', async ({ page }) => {
    // Navigate to 003.docx which should have multiple pages
    await page.goto('/#003.docx');
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Wait for document to load
    await page.waitForSelector('[data-testid="app-title"]');
    await page.waitForTimeout(2000);
    
    // Switch to View mode (print view)
    const viewButton = await page.$('button:has-text("View")');
    await viewButton?.click();
    await page.waitForTimeout(1000);
    
    // Check that we're in print view
    const printView = await page.$('[data-testid="print-view"]');
    expect(printView).not.toBeNull();
    
    // Look for multiple print pages
    const pages = await page.$$('[data-testid^="print-page-"]');
    console.log(`Found ${pages.length} pages in View mode`);
    
    // Should have more than 1 page for a multi-page document
    expect(pages.length).toBeGreaterThan(1);
    
    // Check page indicator shows multiple pages
    const pageIndicator = await page.$('[data-testid="page-indicator"]');
    if (pageIndicator) {
      const indicatorText = await pageIndicator.textContent();
      console.log('Page indicator text:', indicatorText);
      expect(indicatorText).toMatch(/\d+ of \d+/);
      expect(indicatorText).not.toContain('1 of 1');
    }
  });
  
  test('should show continuous content in Read mode', async ({ page }) => {
    // Navigate to 003.docx 
    await page.goto('/#003.docx');
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Wait for document to load
    await page.waitForSelector('[data-testid="app-title"]');
    await page.waitForTimeout(2000);
    
    // Switch to Read mode
    const readButton = await page.$('button:has-text("Read")');
    await readButton?.click();
    await page.waitForTimeout(1000);
    
    // Check that we're in read view
    const readView = await page.$('[data-testid="read-view"]');
    expect(readView).not.toBeNull();
    
    // Should not have multiple pages in read mode
    const pages = await page.$$('[data-testid^="print-page-"]');
    expect(pages.length).toBe(0);
    
    // Page indicator should not be visible in read mode
    const pageIndicator = await page.$('[data-testid="page-indicator"]');
    if (pageIndicator) {
      expect(await pageIndicator.isVisible()).toBe(false);
    }
  });
});