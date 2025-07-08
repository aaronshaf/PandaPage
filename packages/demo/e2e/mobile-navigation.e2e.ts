import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
  test('should truncate long document titles on mobile', async ({ page }) => {
    // Navigate to a document with a long title
    await page.goto('/#003.docx'); // Open Source Policy Template
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for document to load
    await page.waitForSelector('[data-testid="app-title"]');
    
    // Check that title element has truncate class
    const titleElement = await page.$('[data-testid="app-title"]');
    const classes = await titleElement?.getAttribute('class');
    expect(classes).toContain('truncate');
    
    // Check that the parent containers have proper overflow handling
    const parentDiv = await titleElement?.$('..');
    const parentClasses = await parentDiv?.getAttribute('class');
    expect(parentClasses).toContain('min-w-0');
  });
  
  test('should not overflow navigation bar on narrow screens', async ({ page }) => {
    await page.goto('/#005.docx'); // DOCX conversion demo
    
    // Set very narrow viewport
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Wait for navigation to render
    await page.waitForSelector('[data-testid="primary-nav-container"]');
    
    // Check that the primary nav doesn't cause horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    
    // Check that title is properly contained
    const titleElement = await page.$('[data-testid="app-title"]');
    const titleBox = await titleElement?.boundingBox();
    
    if (titleBox) {
      expect(titleBox.x).toBeGreaterThanOrEqual(0);
      expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(viewportWidth);
    }
  });
  
  test('document selector should maintain reasonable width on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check document selector has max-width constraint
    const selector = await page.$('#document-select');
    const selectorClasses = await selector?.getAttribute('class');
    expect(selectorClasses).toContain('max-w-[300px]');
    
    // Verify it doesn't push other elements off screen
    const selectorBox = await selector?.boundingBox();
    if (selectorBox) {
      expect(selectorBox.x + selectorBox.width).toBeLessThanOrEqual(375);
    }
  });
});