# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-journeys.spec.ts >> Authentication & Route Protection >> Login form shows error for invalid credentials
- Location: tests\e2e\core-journeys.spec.ts:66:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[type="email"]')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('input[type="email"]')

```

```yaml
- text: 429 Too Many Requests. Please try again later.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // ============================================================================
  4   | // E2E FUNCTIONAL TEST SUITE — Core User Journeys
  5   | // ============================================================================
  6   | 
  7   | test.describe('Authentication & Route Protection', () => {
  8   | 
  9   |   test('Login page renders with OAuth and email form elements', async ({ page }) => {
  10  |     // Increase timeout since next dev cold starts can be slow
  11  |     await page.goto('/login');
  12  | 
  13  |     // Wait for network to be somewhat idle so compilation finishes
  14  |     await page.waitForLoadState('domcontentloaded');
  15  | 
  16  |     // Verify the Google OAuth button is visible and clickable
  17  |     const googleButton = page.getByText('Continue with Google');
  18  |     await expect(googleButton).toBeVisible({ timeout: 15000 });
  19  | 
  20  |     // Verify email and password inputs exist
  21  |     const emailInput = page.locator('input[type="email"]');
  22  |     const passwordInput = page.locator('input[type="password"]');
  23  |     await expect(emailInput).toBeVisible();
  24  |     await expect(passwordInput).toBeVisible();
  25  | 
  26  |     // Verify the submit button exists
  27  |     const submitButton = page.getByText(/Sign In to Dashboard/i);
  28  |     await expect(submitButton).toBeVisible();
  29  | 
  30  |     // Verify the sign-up toggle works
  31  |     const signUpToggle = page.getByText(/Sign up/i);
  32  |     await expect(signUpToggle).toBeVisible();
  33  |     await signUpToggle.click();
  34  | 
  35  |     // After toggle, the button text should change
  36  |     await expect(page.getByText(/Create Premium Account/i)).toBeVisible();
  37  |   });
  38  | 
  39  |   test('Unauthenticated users are redirected from /dashboard to /login', async ({ page }) => {
  40  |     // Attempt to visit a protected route without being logged in
  41  |     const response = await page.goto('/dashboard');
  42  | 
  43  |     // The middleware should redirect to /login
  44  |     expect(page.url()).toContain('/login');
  45  |   });
  46  | 
  47  |   test('Unauthenticated users are redirected from /admin to /login', async ({ page }) => {
  48  |     await page.goto('/admin');
  49  |     expect(page.url()).toContain('/login');
  50  |   });
  51  | 
  52  |   test('Login form shows validation errors for empty submission', async ({ page }) => {
  53  |     await page.goto('/login');
  54  | 
  55  |     // Wait for the button
  56  |     const submitButton = page.getByText(/Sign In to Dashboard/i);
  57  |     await expect(submitButton).toBeVisible({ timeout: 15000 });
  58  |     
  59  |     // Click submit without filling in any fields
  60  |     await submitButton.click();
  61  | 
  62  |     // Zod validation errors should appear
  63  |     await expect(page.locator('text=Email is required').or(page.locator('text=Please enter a valid email'))).toBeVisible({ timeout: 10000 });
  64  |   });
  65  | 
  66  |   test('Login form shows error for invalid credentials', async ({ page }) => {
  67  |     await page.goto('/login');
  68  | 
  69  |     // Wait for the inputs
  70  |     const emailInput = page.locator('input[type="email"]');
> 71  |     await expect(emailInput).toBeVisible({ timeout: 15000 });
      |                              ^ Error: expect(locator).toBeVisible() failed
  72  | 
  73  |     // Fill in bad credentials
  74  |     await emailInput.fill('nonexistent@example.com');
  75  |     await page.locator('input[type="password"]').fill('wrongpassword123');
  76  | 
  77  |     // Submit the form
  78  |     await page.getByText(/Sign In to Dashboard/i).click();
  79  | 
  80  |     // Should show an error message (not a crash or blank screen)
  81  |     // Looking for the AlertCircle element or the red error div
  82  |     const errorBanner = page.locator('text=Invalid credentials').or(page.locator('[class*="text-red"]'));
  83  |     await expect(errorBanner.first()).toBeVisible({ timeout: 10000 });
  84  |   });
  85  | });
  86  | 
  87  | test.describe('Dashboard Skeleton & Loading States', () => {
  88  | 
  89  |   test('Dashboard loading skeleton renders immediately during navigation', async ({ page }) => {
  90  |     // Navigate to login first, then attempt dashboard (will redirect, but skeleton might flash)
  91  |     await page.goto('/login');
  92  | 
  93  |     // Programmatically navigate to dashboard to trigger loading.tsx
  94  |     // Since we're unauthenticated, we'll be redirected, but we can verify the route exists
  95  |     const response = await page.goto('/dashboard');
  96  | 
  97  |     // Verify we ended up somewhere valid (login redirect or dashboard)
  98  |     expect(page.url()).toMatch(/\/(login|dashboard)/);
  99  | 
  100 |     // No JavaScript errors should have occurred
  101 |     const errors: string[] = [];
  102 |     page.on('pageerror', (err) => errors.push(err.message));
  103 | 
  104 |     // Assert no hydration errors
  105 |     expect(errors.filter(e => e.includes('Hydration'))).toHaveLength(0);
  106 |   });
  107 | });
  108 | 
  109 | test.describe('Billing Page & Credit Packages', () => {
  110 | 
  111 |   test('Billing page loads without crashes when accessed directly', async ({ page }) => {
  112 |     // This will redirect to login since unauthenticated, but ensures no 500 errors
  113 |     const response = await page.goto('/dashboard/billing');
  114 | 
  115 |     // Should either show billing or redirect to login
  116 |     expect(page.url()).toMatch(/\/(login|dashboard\/billing)/);
  117 | 
  118 |     // No console errors should indicate a crash
  119 |     const errors: string[] = [];
  120 |     page.on('pageerror', (err) => errors.push(err.message));
  121 |     expect(errors.filter(e => e.includes('Cannot read properties'))).toHaveLength(0);
  122 |   });
  123 | });
  124 | 
  125 | test.describe('Settings & Account Management', () => {
  126 | 
  127 |   test('Settings page loads without errors', async ({ page }) => {
  128 |     const response = await page.goto('/dashboard/settings');
  129 | 
  130 |     // Should redirect to login since unauthenticated
  131 |     expect(page.url()).toMatch(/\/(login|dashboard\/settings)/);
  132 |   });
  133 | 
  134 |   test('Guide page loads without errors', async ({ page }) => {
  135 |     const response = await page.goto('/dashboard/guide');
  136 | 
  137 |     // Should redirect to login since unauthenticated, but won't crash
  138 |     expect(page.url()).toMatch(/\/(login|dashboard\/guide)/);
  139 |     
  140 |     const errors: string[] = [];
  141 |     page.on('pageerror', (err) => errors.push(err.message));
  142 |     expect(errors.filter(e => e.includes('Hydration'))).toHaveLength(0);
  143 |   });
  144 | });
  145 | 
  146 | test.describe('Public Pages & SEO', () => {
  147 | 
  148 |   test('Landing page loads successfully with key elements', async ({ page }) => {
  149 |     await page.goto('/');
  150 | 
  151 |     // Verify the page loads (status 200)
  152 |     const response = await page.goto('/');
  153 |     expect(response?.status()).toBe(200);
  154 | 
  155 |     // Verify no hydration errors
  156 |     const errors: string[] = [];
  157 |     page.on('pageerror', (err) => errors.push(err.message));
  158 |     expect(errors.filter(e => e.includes('Hydration'))).toHaveLength(0);
  159 |   });
  160 | 
  161 |   test('Forgot password page renders the form', async ({ page }) => {
  162 |     await page.goto('/forgot-password');
  163 | 
  164 |     // Should have an email input for password reset
  165 |     const emailInput = page.locator('input[type="email"]');
  166 |     await expect(emailInput).toBeVisible({ timeout: 15000 });
  167 |   });
  168 | });
  169 | 
  170 | test.describe('Security Headers & CORS Verification', () => {
  171 | 
```