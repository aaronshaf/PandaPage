import { test, expect } from '@playwright/test';

test.describe('Document Selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#document-select');
  });

  test('should be visible on all screen sizes', async ({ page }) => {
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileSelector = await page.$('#document-select');
    expect(await mobileSelector?.isVisible()).toBe(true);

    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    const tabletSelector = await page.$('#document-select');
    expect(await tabletSelector?.isVisible()).toBe(true);

    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopSelector = await page.$('#document-select');
    expect(await desktopSelector?.isVisible()).toBe(true);
  });

  test('should have max width of 300px on all screen sizes', async ({ page }) => {
    const screenSizes = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 640, height: 768, name: 'small' },
      { width: 768, height: 1024, name: 'medium' },
      { width: 1024, height: 768, name: 'large' },
      { width: 1280, height: 1024, name: 'extra large' },
      { width: 1536, height: 1024, name: '2xl' }
    ];

    for (const size of screenSizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      const select = await page.$('#document-select');
      const classes = await select?.getAttribute('class');
      expect(classes).toContain('max-w-[300px]');
    }
  });

  test('should contain all sample documents', async ({ page }) => {
    const options = await page.$$eval('#document-select option', (opts) => 
      opts.map(opt => opt.textContent?.trim() || '')
    );

    // Should have at least 10 sample documents
    expect(options.length).toBeGreaterThanOrEqual(10);

    // Check for specific documents
    expect(options.some(opt => opt.includes('001.docx'))).toBe(true);
    expect(options.some(opt => opt.includes('Employee Handbook'))).toBe(true);
  });

  test('should change document on selection', async ({ page }) => {
    // Get initial title
    const initialTitle = await page.textContent('[data-testid="app-title"]');
    
    // Select a different document
    await page.selectOption('#document-select', { index: 1 });
    
    // Wait for the document to load
    await page.waitForTimeout(1000);
    
    // Check if title changed
    const newTitle = await page.textContent('[data-testid="app-title"]');
    expect(newTitle).not.toBe(initialTitle);
  });
});