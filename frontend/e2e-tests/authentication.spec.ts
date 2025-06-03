import { test, expect } from '@playwright/test';

// Example E2E test for authentication flow
test('user can login and logout', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Expect to be redirected to login page
  await expect(page).toHaveURL(/.*\/login/);

  // Fill login form
  await page.fill('input[id="username"]', 'demo');
  await page.fill('input[id="password"]', 'password');

  // Click sign in button
  await page.click('button[type="submit"]');

  // Expect to be logged in and redirected to home page
  await expect(page).toHaveURL(/.*\//);
  
  // Verify navigation shows user is logged in
  await expect(page.locator('button:has-text("Sign Out")')).toBeVisible();

  // Logout
  await page.click('button:has-text("Sign Out")');

  // Expect to be redirected back to login page
  await expect(page).toHaveURL(/.*\/login/);
});

// Example E2E test for collection management
test('user can create and view collections', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.fill('input[id="username"]', 'demo');
  await page.fill('input[id="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to collections page
  await page.click('a:has-text("Collections")');
  await expect(page).toHaveURL(/.*\/collections/);

  // Click create collection button
  await page.click('button:has-text("Create Collection")');
  await expect(page).toHaveURL(/.*\/collections\/new/);

  // Fill collection form
  const collectionName = `E2E Test Collection ${Date.now()}`;
  await page.fill('input[id="name"]', collectionName);
  await page.fill('textarea[id="description"]', 'Created by E2E test');

  // Submit form
  await page.click('button[type="submit"]');

  // Verify we're redirected to collections list
  await expect(page).toHaveURL(/.*\/collections/);

  // Verify new collection appears in the list
  await expect(page.locator(`text=${collectionName}`)).toBeVisible();
});

// Example E2E test for QA pair creation
test('user can create QA pairs in a collection', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.fill('input[id="username"]', 'demo');
  await page.fill('input[id="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to collections page
  await page.click('a:has-text("Collections")');
  
  // Click on the first collection
  await page.click('div[data-testid="collection-item"]:first-child');
  
  // Click create QA button
  await page.click('button:has-text("Create QA Pair")');
  
  // Fill QA form
  const testQuestion = `E2E Test Question ${Date.now()}`;
  await page.fill('textarea[id="question"]', testQuestion);
  await page.fill('textarea[id="answer"]', 'This is an automatically generated answer from an E2E test.');
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Verify we're redirected back to collection details
  await expect(page.locator(`text=${testQuestion}`)).toBeVisible();
});
