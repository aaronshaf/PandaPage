import { test, expect } from '@playwright/test';

test.describe('Hello World Test', () => {
  test('should load document and display Heading 1', async ({ page }) => {
    // Navigate directly to 001.docx
    await page.goto('/#001.docx');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Switch to Read mode first
    await page.click('button:has-text("Read")');
    
    // Wait for the markdown content to be rendered
    await page.waitForSelector('[data-testid="markdown-content"]');
    
    // Look for "Heading 1" text in the markdown content
    await expect(page.locator('[data-testid="markdown-content"] h1:has-text("Heading 1")')).toBeVisible();
  });

  test('should have browser-document-viewer in the page', async ({ page }) => {
    await page.goto('/');
    
    // Check that browser-document-viewer appears in the GitHub link or elsewhere
    // Since the title shows the document title now, not "Browser Document Viewer"
    await expect(page.locator('a[href*="browser-document-viewer"]')).toBeVisible();
  });

});