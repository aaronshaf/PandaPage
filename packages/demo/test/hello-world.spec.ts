import { test, expect } from '@playwright/test';

test.describe('Hello World Test', () => {
  test('should load document and display Heading 1', async ({ page }) => {
    // Navigate directly to 001.docx
    await page.goto('/#001.docx');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for "Heading 1" text anywhere on the page
    await expect(page.locator('text=Heading 1')).toBeVisible();
  });

  test('should have pandapage in the title', async ({ page }) => {
    await page.goto('/');
    
    // Check that pandapage appears somewhere in the page
    await expect(page.locator('text=pandapage')).toBeVisible();
  });

  test('should switch between read and print view', async ({ page }) => {
    await page.goto('/#001.docx');
    
    // Wait for document to load
    await page.waitForLoadState('networkidle');
    
    // Check we're in read mode by default
    await expect(page.locator('text=Read')).toBeVisible();
    await expect(page.locator('text=Print')).toBeVisible();
    
    // Click Print button
    await page.click('text=Print');
    
    // Wait a moment for view to change
    await page.waitForTimeout(500);
    
    // In print view, we should see page elements
    const printPage = page.locator('.print-page').first();
    await expect(printPage).toBeVisible();
  });
});