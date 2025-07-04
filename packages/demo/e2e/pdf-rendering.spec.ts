import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('PDF Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the app and display title', async ({ page }) => {
    await expect(page).toHaveTitle(/PandaPage Demo/);
    await expect(page.locator('h1')).toContainText('PandaPage Demo');
  });

  test('should display PDF selection dropdown', async ({ page }) => {
    const selectElement = page.locator('select');
    await expect(selectElement).toBeVisible();
    
    // Check that all options are available
    const options = await selectElement.locator('option').all();
    expect(options).toHaveLength(4);
    
    await expect(page.locator('option[value="/sample1.pdf"]')).toContainText('Sample 1 - Dummy PDF file');
    await expect(page.locator('option[value="/sample2.pdf"]')).toContainText('Sample 2 - Hello World');
    await expect(page.locator('option[value="/sample3.pdf"]')).toContainText('Sample 3 - Multi-page Lorem Ipsum');
    await expect(page.locator('option[value="/guide-footnotes.pdf"]')).toContainText('Guide - Footnotes');
  });

  test('should render Sample 1 PDF correctly', async ({ page }) => {
    // Select sample1.pdf
    await page.selectOption('select', '/sample1.pdf');
    
    // Click the Load via Promise button
    await page.click('button:has-text("Load via Promise")');
    
    // Wait for the result to appear in the pre element
    await expect(page.locator('pre')).toContainText('Dummy PDF file', { timeout: 5000 });
  });

  test('should render Sample 2 PDF correctly', async ({ page }) => {
    // Select sample2.pdf
    await page.selectOption('select', '/sample2.pdf');
    
    // Click the Load via Promise button
    await page.click('button:has-text("Load via Promise")');
    
    // Wait for the result to appear in the pre element
    await expect(page.locator('pre')).toContainText('Hello, world.', { timeout: 5000 });
  });

  test('should render Sample 3 PDF correctly', async ({ page }) => {
    // Select sample3.pdf
    await page.selectOption('select', '/sample3.pdf');
    
    // Click the Load via Promise button
    await page.click('button:has-text("Load via Promise")');
    
    // Wait for the result to appear in the pre element - Example 3 has more content
    const preElement = page.locator('pre');
    await expect(preElement).toContainText('Sample PDF', { timeout: 5000 });
    await expect(preElement).toContainText('Created for testing PDFObject', { timeout: 5000 });
    await expect(preElement).toContainText('This PDF is three pages long', { timeout: 5000 });
  });

  // PDF upload tests removed as requested

  test('should switch between different PDFs', async ({ page }) => {
    // Start with Sample 1
    await page.selectOption('select', '/sample1.pdf');
    await page.click('button:has-text("Load via Promise")');
    await expect(page.locator('pre')).toContainText('Dummy PDF file', { timeout: 5000 });
    
    // Switch to Sample 2
    await page.selectOption('select', '/sample2.pdf');
    await page.click('button:has-text("Load via Promise")');
    await expect(page.locator('pre')).toContainText('Hello, world.', { timeout: 5000 });
    
    // Switch to Sample 3
    await page.selectOption('select', '/sample3.pdf');
    await page.click('button:has-text("Load via Promise")');
    await expect(page.locator('pre')).toContainText('Sample PDF', { timeout: 5000 });
    
    // Go back to Sample 1
    await page.selectOption('select', '/sample1.pdf');
    await page.click('button:has-text("Load via Promise")');
    await expect(page.locator('pre')).toContainText('Dummy PDF file', { timeout: 5000 });
  });

  test('should work with stream-based loading', async ({ page }) => {
    // Select sample2.pdf
    await page.selectOption('select', '/sample2.pdf');
    
    // Click the Load via Stream button
    await page.click('button:has-text("Load via Stream")');
    
    // Wait for the result to appear in the pre element
    await expect(page.locator('pre')).toContainText('Hello, world.', { timeout: 5000 });
  });
});