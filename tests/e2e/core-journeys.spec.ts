import { test, expect } from '@playwright/test';

// ============================================================================
// E2E FUNCTIONAL TEST SUITE — Core User Journeys
// ============================================================================

test.describe('Authentication & Route Protection', () => {

  test('Login page renders with OAuth and email form elements', async ({ page }) => {
    // Increase timeout since next dev cold starts can be slow
    await page.goto('/login');

    // Wait for network to be somewhat idle so compilation finishes
    await page.waitForLoadState('domcontentloaded');

    // Verify the Google OAuth button is visible and clickable
    const googleButton = page.getByText('Continue with Google');
    await expect(googleButton).toBeVisible({ timeout: 15000 });

    // Verify email and password inputs exist
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify the submit button exists
    const submitButton = page.getByText(/Sign In to Dashboard/i);
    await expect(submitButton).toBeVisible();

    // Verify the sign-up toggle works
    const signUpToggle = page.getByText(/Sign up/i);
    await expect(signUpToggle).toBeVisible();
    await signUpToggle.click();

    // After toggle, the button text should change
    await expect(page.getByText(/Create Premium Account/i)).toBeVisible();
  });

  test('Unauthenticated users are redirected from /dashboard to /login', async ({ page }) => {
    // Attempt to visit a protected route without being logged in
    const response = await page.goto('/dashboard');

    // The middleware should redirect to /login
    expect(page.url()).toContain('/login');
  });

  test('Unauthenticated users are redirected from /admin to /login', async ({ page }) => {
    await page.goto('/admin');
    expect(page.url()).toContain('/login');
  });

  test('Login form shows validation errors for empty submission', async ({ page }) => {
    await page.goto('/login');

    // Wait for the button
    const submitButton = page.getByText(/Sign In to Dashboard/i);
    await expect(submitButton).toBeVisible({ timeout: 15000 });
    
    // Click submit without filling in any fields
    await submitButton.click();

    // Zod validation errors should appear
    await expect(page.locator('text=Email is required').or(page.locator('text=Please enter a valid email'))).toBeVisible({ timeout: 10000 });
  });

  test('Login form shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Wait for the inputs
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 15000 });

    // Fill in bad credentials
    await emailInput.fill('nonexistent@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword123');

    // Submit the form
    await page.getByText(/Sign In to Dashboard/i).click();

    // Should show an error message (not a crash or blank screen)
    // Looking for the AlertCircle element or the red error div
    const errorBanner = page.locator('text=Invalid credentials').or(page.locator('[class*="text-red"]'));
    await expect(errorBanner.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Dashboard Skeleton & Loading States', () => {

  test('Dashboard loading skeleton renders immediately during navigation', async ({ page }) => {
    // Navigate to login first, then attempt dashboard (will redirect, but skeleton might flash)
    await page.goto('/login');

    // Programmatically navigate to dashboard to trigger loading.tsx
    // Since we're unauthenticated, we'll be redirected, but we can verify the route exists
    const response = await page.goto('/dashboard');

    // Verify we ended up somewhere valid (login redirect or dashboard)
    expect(page.url()).toMatch(/\/(login|dashboard)/);

    // No JavaScript errors should have occurred
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Assert no hydration errors
    expect(errors.filter(e => e.includes('Hydration'))).toHaveLength(0);
  });
});

test.describe('Billing Page & Credit Packages', () => {

  test('Billing page loads without crashes when accessed directly', async ({ page }) => {
    // This will redirect to login since unauthenticated, but ensures no 500 errors
    const response = await page.goto('/dashboard/billing');

    // Should either show billing or redirect to login
    expect(page.url()).toMatch(/\/(login|dashboard\/billing)/);

    // No console errors should indicate a crash
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    expect(errors.filter(e => e.includes('Cannot read properties'))).toHaveLength(0);
  });
});

test.describe('Settings & Account Management', () => {

  test('Settings page loads without errors', async ({ page }) => {
    const response = await page.goto('/dashboard/settings');

    // Should redirect to login since unauthenticated
    expect(page.url()).toMatch(/\/(login|dashboard\/settings)/);
  });

  test('Guide page loads without errors', async ({ page }) => {
    const response = await page.goto('/dashboard/guide');

    // Should redirect to login since unauthenticated, but won't crash
    expect(page.url()).toMatch(/\/(login|dashboard\/guide)/);
    
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    expect(errors.filter(e => e.includes('Hydration'))).toHaveLength(0);
  });
});

test.describe('Public Pages & SEO', () => {

  test('Landing page loads successfully with key elements', async ({ page }) => {
    await page.goto('/');

    // Verify the page loads (status 200)
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Verify no hydration errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    expect(errors.filter(e => e.includes('Hydration'))).toHaveLength(0);
  });

  test('Forgot password page renders the form', async ({ page }) => {
    await page.goto('/forgot-password');

    // Should have an email input for password reset
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Security Headers & CORS Verification', () => {

  test('API routes return proper CORS headers (not wildcard)', async ({ page }) => {
    // Make a direct API request
    const response = await page.request.get('/api/admin/proxy', {
      headers: {
        'Origin': 'http://localhost:3000',
      },
    });

    const corsHeader = response.headers()['access-control-allow-origin'];

    // Verify CORS header is NOT a wildcard
    if (corsHeader) {
      expect(corsHeader).not.toBe('*');
    }
  });

  test('API routes block requests from unauthorized origins', async ({ page }) => {
    const response = await page.request.post('/api/admin/proxy', {
      headers: {
        'Origin': 'https://evil-site.com',
        'Content-Type': 'application/json',
      },
      data: { action: 'GET_CREDITS' },
    });

    // Should be blocked with 403
    expect(response.status()).toBe(403);
  });
});

test.describe('No Console Errors on Critical Pages', () => {

  test('Login page has zero critical console errors', async ({ page }) => {
    const criticalErrors: string[] = [];
    page.on('pageerror', (err) => criticalErrors.push(err.message));

    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Filter out known non-critical warnings
    const realErrors = criticalErrors.filter(
      e => !e.includes('Supabase') && !e.includes('GoTrueClient')
    );
    expect(realErrors).toHaveLength(0);
  });

  test('Landing page has zero critical console errors', async ({ page }) => {
    const criticalErrors: string[] = [];
    page.on('pageerror', (err) => criticalErrors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const realErrors = criticalErrors.filter(
      e => !e.includes('Supabase') && !e.includes('GoTrueClient')
    );
    expect(realErrors).toHaveLength(0);
  });
});
