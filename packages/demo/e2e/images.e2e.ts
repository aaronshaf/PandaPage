import { test, expect } from '@playwright/test';

test.describe('DOCX Image Rendering', () => {
  test('should render images from 005.docx', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`Browser console [${msg.type()}]:`, msg.text());
    });
    
    // Navigate to the document with images
    await page.goto('/#005.docx');
    
    // Wait for document to load
    await page.waitForSelector('[data-testid="document-viewer"]', { timeout: 10000 });
    
    // Wait for content to be rendered
    await page.waitForTimeout(3000);
    
    // Check what renderer is being used
    const parsedContent = page.locator('[data-testid="parsed-content"]');
    const markdownContent = page.locator('[data-testid="markdown-content"]');
    const readingModeContainer = page.locator('[data-testid="reading-mode-container"]');
    
    const hasParsedContent = await parsedContent.count() > 0;
    const hasMarkdownContent = await markdownContent.count() > 0;
    const hasReadingMode = await readingModeContainer.count() > 0;
    
    console.log('Renderer status:', {
      hasParsedContent,
      hasMarkdownContent,
      hasReadingMode
    });
    
    // Look for images anywhere in the document viewer
    const documentViewer = page.locator('[data-testid="document-viewer"]');
    const allImages = await documentViewer.locator('img').all();
    
    console.log(`Found ${allImages.length} total images in document viewer`);
    
    // Log details about each image
    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const width = await img.getAttribute('width');
      const height = await img.getAttribute('height');
      const isVisible = await img.isVisible();
      
      console.log(`Image ${i + 1}:`, {
        src: src ? (src.substring(0, 50) + '...') : 'null',
        alt,
        width,
        height,
        isVisible
      });
    }
    
    // Also check for images in the specific content containers
    if (hasParsedContent) {
      const parsedImages = await parsedContent.locator('img').count();
      console.log(`Images in parsed content: ${parsedImages}`);
    }
    
    if (hasMarkdownContent) {
      const markdownImages = await markdownContent.locator('img').count();
      console.log(`Images in markdown content: ${markdownImages}`);
    }
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'test-results/005-docx-images-debug.png',
      fullPage: true 
    });
    
    // Check the page source
    const pageContent = await page.content();
    const hasDataUrls = pageContent.includes('data:image');
    console.log('Page contains data URLs:', hasDataUrls);
    
    // Count occurrences of data URLs
    const dataUrlMatches = pageContent.match(/data:image\/[^;]+;base64,/g);
    console.log('Data URL count:', dataUrlMatches?.length || 0);
    
    // Expect at least one image
    expect(allImages.length).toBeGreaterThan(0);
  });

  test('should debug document parsing', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      console.log(`Browser [${msg.type()}]:`, msg.text());
    });
    
    // Add script to log parsing details
    await page.addInitScript(() => {
      // Override console methods to capture logs
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      
      console.log = (...args) => {
        originalLog('[LOG]', ...args);
      };
      
      console.warn = (...args) => {
        originalWarn('[WARN]', ...args);
      };
      
      console.error = (...args) => {
        originalError('[ERROR]', ...args);
      };
    });
    
    // Navigate to the document
    await page.goto('/#005.docx');
    
    // Wait for parsing
    await page.waitForTimeout(5000);
    
    // Try to access the parsed document through window
    const documentInfo = await page.evaluate(() => {
      // Check if there's any global access to the parsed document
      const win = window as any;
      
      return {
        hasReactDevTools: '__REACT_DEVTOOLS_GLOBAL_HOOK__' in window,
        // Try to find any exposed document data
        keys: Object.keys(win).filter(key => 
          key.includes('doc') || 
          key.includes('parsed') || 
          key.includes('image')
        )
      };
    });
    
    console.log('Document info:', documentInfo);
  });
});