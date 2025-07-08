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

  test('should have appropriate width on different screen sizes', async ({ page }) => {
    // Test mobile size (max-w-[120px])
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileSelect = await page.$('#document-select');
    const mobileClasses = await mobileSelect?.getAttribute('class');
    expect(mobileClasses).toContain('max-w-[120px]');

    // Test small screens (sm: max-w-[280px])
    await page.setViewportSize({ width: 640, height: 768 });
    const smSelect = await page.$('#document-select');
    const smClasses = await smSelect?.getAttribute('class');
    expect(smClasses).toContain('sm:max-w-[280px]');

    // Test medium screens (md: max-w-[350px])
    await page.setViewportSize({ width: 768, height: 1024 });
    const mdSelect = await page.$('#document-select');
    const mdClasses = await mdSelect?.getAttribute('class');
    expect(mdClasses).toContain('md:max-w-[350px]');

    // Test large screens (lg: max-w-[400px])
    await page.setViewportSize({ width: 1024, height: 768 });
    const lgSelect = await page.$('#document-select');
    const lgClasses = await lgSelect?.getAttribute('class');
    expect(lgClasses).toContain('lg:max-w-[400px]');

    // Test extra large screens (xl: max-w-[450px])
    await page.setViewportSize({ width: 1280, height: 1024 });
    const xlSelect = await page.$('#document-select');
    const xlClasses = await xlSelect?.getAttribute('class');
    expect(xlClasses).toContain('xl:max-w-[450px]');
  });

  test('should contain all sample documents', async ({ page }) => {
    const options = await page.$$eval('#document-select option', (opts) => 
      opts.map(opt => opt.textContent?.trim() || '')
    );

    // Should have at least 10 sample documents
    expect(options.length).toBeGreaterThanOrEqual(10);

    // Check for specific documents
    expect(options.some(opt => opt.includes('001.docx'))).toBe(true);
    expect(options.some(opt => opt.includes('Service Agreement'))).toBe(true);
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