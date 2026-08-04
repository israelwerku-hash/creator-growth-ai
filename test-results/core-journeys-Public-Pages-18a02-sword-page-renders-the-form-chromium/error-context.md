# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core-journeys.spec.ts >> Public Pages & SEO >> Forgot password page renders the form
- Location: tests\e2e\core-journeys.spec.ts:161:7

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
  66  |   test('Login form shows error for invalid credentials', async ({ page }) => {
  67  |     await page.goto('/login');
  68  | 
  69  |     // Wait for the inputs
  70  |     const emailInput = page.locator('input[type="email"]');
  71  |     await expect(emailInput).toBeVisible({ timeout: 15000 });
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
> 166 |     await expect(emailInput).toBeVisible({ timeout: 15000 });
      |                              ^ Error: expect(locator).toBeVisible() failed
  167 |   });
  168 | });
  169 | 
  170 | test.describe('Security Headers & CORS Verification', () => {
  171 | 
  172 |   test('API routes return proper CORS headers (not wildcard)', async ({ page }) => {
  173 |     // Make a direct API request
  174 |     const response = await page.request.get('/api/admin/proxy', {
  175 |       headers: {
  176 |         'Origin': 'http://localhost:3000',
  177 |       },
  178 |     });
  179 | 
  180 |     const corsHeader = response.headers()['access-control-allow-origin'];
  181 | 
  182 |     // Verify CORS header is NOT a wildcard
  183 |     if (corsHeader) {
  184 |       expect(corsHeader).not.toBe('*');
  185 |     }
  186 |   });
  187 | 
  188 |   test('API routes block requests from unauthorized origins', async ({ page }) => {
  189 |     const response = await page.request.post('/api/admin/proxy', {
  190 |       headers: {
  191 |         'Origin': 'https://evil-site.com',
  192 |         'Content-Type': 'application/json',
  193 |       },
  194 |       data: { action: 'GET_CREDITS' },
  195 |     });
  196 | 
  197 |     // Should be blocked with 403
  198 |     expect(response.status()).toBe(403);
  199 |   });
  200 | });
  201 | 
  202 | test.describe('No Console Errors on Critical Pages', () => {
  203 | 
  204 |   test('Login page has zero critical console errors', async ({ page }) => {
  205 |     const criticalErrors: string[] = [];
  206 |     page.on('pageerror', (err) => criticalErrors.push(err.message));
  207 | 
  208 |     await page.goto('/login');
  209 |     await page.waitForLoadState('domcontentloaded');
  210 | 
  211 |     // Filter out known non-critical warnings
  212 |     const realErrors = criticalErrors.filter(
  213 |       e => !e.includes('Supabase') && !e.includes('GoTrueClient')
  214 |     );
  215 |     expect(realErrors).toHaveLength(0);
  216 |   });
  217 | 
  218 |   test('Landing page has zero critical console errors', async ({ page }) => {
  219 |     const criticalErrors: string[] = [];
  220 |     page.on('pageerror', (err) => criticalErrors.push(err.message));
  221 | 
  222 |     await page.goto('/');
  223 |     await page.waitForLoadState('domcontentloaded');
  224 | 
  225 |     const realErrors = criticalErrors.filter(
  226 |       e => !e.includes('Supabase') && !e.includes('GoTrueClient')
  227 |     );
  228 |     expect(realErrors).toHaveLength(0);
  229 |   });
  230 | });
  231 | 
```