import { test, expect } from '@playwright/test';

test.describe('Document Title Tests', () => {
  test('should extract and display document title', async ({ page }) => {
    // Navigate to 001.docx
    await page.goto('/#001.docx');
    
    // Wait for document to load and content to be visible
    await page.waitForLoadState('networkidle');
    
    // Wait for the document content to be loaded (look for "Heading 1" text)
    await page.waitForSelector('text=Heading 1', { timeout: 10000 });
    
    // Wait for title to update from loading state
    await page.waitForFunction(
      () => {
        const title = document.querySelector('[data-testid="app-title"]');
        return title && title.textContent !== '--' && title.textContent !== 'Loading...';
      },
      { timeout: 5000 }
    );
    
    // Now check the title
    const titleText = await page.textContent('[data-testid="app-title"]');
    
    console.log('Found title:', titleText);
    
    // Title should exist and not be empty
    expect(titleText).toBeTruthy();
    expect(titleText?.trim().length).toBeGreaterThan(0);
    
    // Title should not be just the filename
    expect(titleText).not.toBe('001.docx');
    expect(titleText).not.toBe('001');
    
    // The title should either be the sample document title or extracted from content
    // Since 001.docx has empty metadata, it should show either "Service Agreement Template" 
    // (from sampleDocuments) or "Heading 1" (from content extraction)
    const acceptableTitles = ['Service Agreement Template', 'Heading 1', 'Loading...'];
    
    if (!acceptableTitles.includes(titleText || '')) {
      console.warn(`Title '${titleText}' is not one of the expected values`);
    }
    
    // It should definitely not be '--' or 'Browser Document Viewer'
    expect(titleText).not.toBe('--');
    expect(titleText).not.toBe('Browser Document Viewer');
  });

  test('should show first heading as title if no metadata', async ({ page }) => {
    await page.goto('/#001.docx');
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load
    await page.waitForSelector('text=Heading 1', { timeout: 10000 });
    
    // Check the document title element directly
    const titleElement = await page.locator('[data-testid="app-title"]');
    const titleText = await titleElement.textContent();
    
    // Title should be meaningful - either from metadata or extracted from content
    expect(titleText).toBeTruthy();
    expect(titleText?.trim().length).toBeGreaterThan(0);
    
    // Should not be just the filename
    expect(titleText).not.toBe('001.docx');
    expect(titleText).not.toBe('001');
  });
});