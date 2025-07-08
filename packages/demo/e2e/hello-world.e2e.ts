import { test, expect } from '@playwright/test';

test.describe('Hello World Test', () => {
  test('should load document and display Heading 1', async ({ page }) => {
    // Navigate directly to 001.docx
    await page.goto('/#001.docx');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for "Heading 1" text in the document content specifically
    await expect(page.locator('[data-testid="document-content"] h1:has-text("Heading 1")')).toBeVisible();
  });

  test('should have browser-document-viewer in the page', async ({ page }) => {
    await page.goto('/');
    
    // Check that browser-document-viewer appears in the GitHub link or elsewhere
    // Since the title shows the document title now, not "Browser Document Viewer"
    await expect(page.locator('a[href*="browser-document-viewer"]')).toBeVisible();
  });

  test('should switch between read and print view', async ({ page }) => {
    await page.goto('/#001.docx');
    
    // Set viewport to desktop size so button text is visible
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Wait for document to load
    await page.waitForLoadState('networkidle');
    
    // Check that both view mode buttons are visible
    await expect(page.locator('button:has-text("Read")')).toBeVisible();
    await expect(page.locator('button:has-text("View")')).toBeVisible();
    
    // In print view, we should see page elements
    const printPage = page.locator('.print-page').first();
    await expect(printPage).toBeVisible();
    
    // Click Read button to switch views
    await page.click('button:has-text("Read")');
    
    // Wait a moment for view to change
    await page.waitForTimeout(500);
    
    // In read view, the content should be in continuous scroll format
    await expect(page.locator('[data-testid="document-content"]')).toBeVisible();
  });
});