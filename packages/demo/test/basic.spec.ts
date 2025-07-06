import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test('should load the app and display title', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-header"]');
    
    // Check that the pandapage title is visible
    await expect(page.locator('[data-testid="app-title"]')).toContainText('pandapage');
  });

  test('should have navigation controls', async ({ page }) => {
    await page.goto('/');
    
    // Check that view mode toggles exist
    await expect(page.locator('[data-testid="view-mode-toggle"]')).toBeVisible();
    
    // Check that we can switch between read and print modes
    const readButton = page.locator('button:has-text("Read")');
    const printButton = page.locator('button:has-text("Print")');
    
    await expect(readButton).toBeVisible();
    await expect(printButton).toBeVisible();
  });

  test('should display document list', async ({ page }) => {
    await page.goto('/');
    
    // Click the document selector
    await page.click('[data-testid="document-selector"]');
    
    // Wait for dropdown to open
    await page.waitForSelector('[data-testid="document-dropdown"]');
    
    // Check that sample documents are listed
    await expect(page.locator('text=Service Agreement Template')).toBeVisible();
    await expect(page.locator('text=Employee Handbook')).toBeVisible();
  });

  test('should display document content', async ({ page }) => {
    await page.goto('/');
    
    // Wait for document to load
    await page.waitForSelector('[data-testid="document-viewer"]');
    
    // Check that some content is visible
    const content = page.locator('[data-testid="markdown-content"], [data-testid="print-content-1"]');
    await expect(content).toBeVisible();
  });
});

test.describe('Document Title Extraction', () => {
  test('should display correct document title for 001.docx', async ({ page }) => {
    await page.goto('/#doc=001.docx');
    
    // Wait for document to load
    await page.waitForSelector('[data-testid="document-viewer"]');
    
    // The title should be extracted from the document
    // Based on the sample documents, 001.docx is "Service Agreement Template"
    const titleElement = page.locator('[data-testid="document-title"]');
    
    // Give it a moment for the title to update
    await page.waitForTimeout(500);
    
    // Check that it's not just showing the default filename
    const titleText = await titleElement.textContent();
    expect(titleText).not.toBe('001');
    expect(titleText).not.toBe('001.docx');
    
    // It should show either the metadata title or the first heading
    expect(titleText?.length).toBeGreaterThan(3);
  });

  test('should update title when switching documents', async ({ page }) => {
    await page.goto('/');
    
    // Get initial title
    const titleElement = page.locator('[data-testid="document-title"]');
    const initialTitle = await titleElement.textContent();
    
    // Switch to a different document
    await page.click('[data-testid="document-selector"]');
    await page.click('text=Employee Handbook');
    
    // Wait for the new document to load
    await page.waitForTimeout(1000);
    
    // Title should have changed
    const newTitle = await titleElement.textContent();
    expect(newTitle).not.toBe(initialTitle);
  });
});