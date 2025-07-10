import { test, expect } from "@playwright/test";

test.describe("Heading Styles in Read Mode", () => {
  test("should display headings with proper styling in Read mode", async ({ page }) => {
    await page.goto("/#001.docx&view=read");

    // Wait for the document to load
    await page.waitForSelector('[data-testid="read-view"]', { timeout: 10000 });

    // Check that we're in read mode
    const readView = page.locator('[data-testid="read-view"]');
    await expect(readView).toBeVisible();

    // Wait for markdown content to be rendered
    await page.waitForSelector(".rendered-markdown", { timeout: 5000 });

    // Check for heading elements in the DOM
    const h1Elements = page.locator(".rendered-markdown h1");
    const h2Elements = page.locator(".rendered-markdown h2");
    const h3Elements = page.locator(".rendered-markdown h3");

    // Verify h1 elements exist and have proper styling
    await expect(h1Elements).toHaveCount(1);

    const firstH1 = h1Elements.first();
    await expect(firstH1).toHaveText("Heading 1");

    // Check CSS properties to ensure proper styling
    const h1FontSize = await firstH1.evaluate((el) => getComputedStyle(el).fontSize);
    const h1FontWeight = await firstH1.evaluate((el) => getComputedStyle(el).fontWeight);

    // Should have large font size (1.875rem = 30px approximately)
    expect(parseFloat(h1FontSize)).toBeGreaterThan(25);
    // Should be bold (700 weight)
    expect(parseInt(h1FontWeight)).toBeGreaterThanOrEqual(700);

    // Verify h2 elements exist (there may be multiple due to document structure)
    await expect(h2Elements).toHaveCount(4);
    const headingTwoElement = h2Elements.filter({ hasText: "Heading 2" }).first();
    await expect(headingTwoElement).toHaveText("Heading 2");

    // Check h2 styling
    const h2FontSize = await headingTwoElement.evaluate((el) => getComputedStyle(el).fontSize);
    const h2FontWeight = await headingTwoElement.evaluate((el) => getComputedStyle(el).fontWeight);

    // H2 should be smaller than H1 but still large
    expect(parseFloat(h2FontSize)).toBeGreaterThan(20);
    expect(parseFloat(h2FontSize)).toBeLessThan(parseFloat(h1FontSize));
    expect(parseInt(h2FontWeight)).toBeGreaterThanOrEqual(600);

    // Verify h3 elements (there may be multiple due to document structure)
    const h3Count = await h3Elements.count();
    expect(h3Count).toBeGreaterThan(0);
    const headingThreeElement = h3Elements.filter({ hasText: "Heading 3" }).first();
    await expect(headingThreeElement).toHaveText("Heading 3");

    // Check h3 styling
    const h3FontSize = await headingThreeElement.evaluate((el) => getComputedStyle(el).fontSize);
    const h3FontWeight = await headingThreeElement.evaluate(
      (el) => getComputedStyle(el).fontWeight,
    );

    // H3 should be smaller than H2
    expect(parseFloat(h3FontSize)).toBeLessThan(parseFloat(h2FontSize));
    expect(parseInt(h3FontWeight)).toBeGreaterThanOrEqual(600);
  });

  test("should properly handle structured document headings via DocxRenderer", async ({ page }) => {
    await page.goto("/#001.docx&view=read");

    // Wait for the document to load
    await page.waitForSelector('[data-testid="read-view"]', { timeout: 10000 });

    // Check if DocxRenderer is being used (presence of data-testid attributes)
    const docxRendererElements = page.locator('[data-testid*="paragraph-"]');

    if ((await docxRendererElements.count()) > 0) {
      console.log("Using DocxRenderer for structured document");

      // Check for heading elements rendered by DocxRenderer
      const headingElements = page.locator("h1, h2, h3, h4, h5, h6");
      const headingCount = await headingElements.count();
      expect(headingCount).toBeGreaterThan(0);

      // Verify at least one heading has proper Tailwind classes
      const headingWithClasses = page.locator("h1.text-2xl, h1.text-3xl, h2.text-xl, h3.text-lg");
      const headingWithClassesCount = await headingWithClasses.count();
      expect(headingWithClassesCount).toBeGreaterThan(0);
    } else {
      console.log("Using markdown rendering");

      // Verify markdown headings are present
      const markdownHeadings = page.locator(
        ".rendered-markdown h1, .rendered-markdown h2, .rendered-markdown h3",
      );
      const markdownHeadingCount = await markdownHeadings.count();
      expect(markdownHeadingCount).toBeGreaterThan(0);
    }
  });

  test("should show proper heading hierarchy in document outline", async ({ page }) => {
    await page.goto("/#001.docx&view=read");

    // Wait for the document to load
    await page.waitForSelector('[data-testid="read-view"]', { timeout: 10000 });

    // Look for the outline button and click it if present
    const outlineButton = page.locator('[data-testid="document-outline-button"]');

    if (await outlineButton.isVisible()) {
      await outlineButton.click();

      // Wait for outline to appear
      await page.waitForSelector('[data-testid="document-outline"]', { timeout: 5000 });

      // Verify outline items are present and represent headings
      const outlineItems = page.locator('[data-testid*="outline-item-"]');
      const outlineItemCount = await outlineItems.count();
      expect(outlineItemCount).toBeGreaterThan(0);

      // Check that outline items have different heading levels
      const level1Items = page.locator('[data-testid*="outline-item-"][data-heading-level="1"]');
      const level2Items = page.locator('[data-testid*="outline-item-"][data-heading-level="2"]');

      // Should have at least one level 1 heading
      const level1Count = await level1Items.count();
      expect(level1Count).toBeGreaterThan(0);
    }
  });
});
