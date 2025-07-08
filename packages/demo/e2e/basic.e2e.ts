import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('should load the app and display title', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-header"]');
    
    // Check that the document title is visible (not "Browser Document Viewer" but extracted title)
    await expect(page.locator('[data-testid="app-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="app-title"]')).not.toBeEmpty();
  });

  test('should have navigation controls', async ({ page }) => {
    await page.goto('/');
    
    // Check that view mode toggles exist in secondary nav
    await expect(page.locator('[data-testid="secondary-nav"]')).toBeVisible();
    
    // Check that we can switch between read and print modes (now called "View" and "Read")
    const viewButton = page.locator('button:has-text("View")');
    const readButton = page.locator('button:has-text("Read")');
    
    await expect(viewButton).toBeVisible();
    await expect(readButton).toBeVisible();
  });

  test('should display document list', async ({ page }) => {
    await page.goto('/');
    
    // Set viewport to desktop size so dropdown is visible (sm breakpoint is 640px)
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Wait for the primary nav to be visible first
    await page.waitForSelector('[data-testid="primary-nav-container"]');
    
    // The dropdown should be attached (even if hidden on mobile)
    await expect(page.locator('#document-select')).toBeAttached();
    
    // Check that sample documents are listed in dropdown options
    await expect(page.locator('option:has-text("Test Document")')).toBeAttached();
    await expect(page.locator('option:has-text("Employee Handbook")')).toBeAttached();
  });

  test('should display document content', async ({ page }) => {
    await page.goto('/');
    
    // Wait for document to load
    await page.waitForSelector('[data-testid="document-content"]');
    
    // Check that some content is visible
    const content = page.locator('[data-testid="document-content"]');
    await expect(content).toBeVisible();
  });
});

test.describe('Document Title Extraction', () => {
  test('should display correct document title for 001.docx', async ({ page }) => {
    await page.goto('/#001.docx');
    
    // Wait for document to load
    await page.waitForSelector('[data-testid="document-content"]');
    
    // The title should be extracted from the document
    // Based on the sample documents, 001.docx is "Service Agreement Template"
    const titleElement = page.locator('[data-testid="app-title"]');
    
    // Give it a moment for the title to update
    await page.waitForTimeout(1000);
    
    // Check that it's not just showing the default filename
    const titleText = await titleElement.textContent();
    expect(titleText).not.toBe('001');
    expect(titleText).not.toBe('001.docx');
    
    // It should show either the metadata title or the first heading
    expect(titleText?.length).toBeGreaterThan(3);
  });

});