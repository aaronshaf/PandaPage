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

  test.skip('should have responsive width on different screen sizes', async ({ page }) => {
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    let select = await page.$('#document-select');
    let classes = await select?.getAttribute('class');
    expect(classes).toContain('w-[140px]');
    
    // Test small screens (sm breakpoint)
    await page.setViewportSize({ width: 640, height: 768 });
    select = await page.$('#document-select');
    classes = await select?.getAttribute('class');
    expect(classes).toContain('sm:w-[220px]');
    
    // Test medium screens (md breakpoint)
    await page.setViewportSize({ width: 768, height: 1024 });
    select = await page.$('#document-select');
    classes = await select?.getAttribute('class');
    expect(classes).toContain('md:w-[320px]');
    
    // Test large screens (lg breakpoint)
    await page.setViewportSize({ width: 1024, height: 768 });
    select = await page.$('#document-select');
    classes = await select?.getAttribute('class');
    expect(classes).toContain('lg:w-[380px]');
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