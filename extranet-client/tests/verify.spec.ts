import { test, expect } from '@playwright/test';

test('Verify Super Admin QR Management page', async ({ page }) => {
  // Increase timeout for slow dev server
  test.setTimeout(60000);

  console.log('Navigating to login page...');
  await page.goto('http://localhost:4015/staff/login');

  // Wait for the login form to be visible
  await page.waitForSelector('[data-testid="staff-email-input"]');

  console.log('Logging in as Super Admin...');
  await page.fill('[data-testid="staff-email-input"]', 'superadmin@gmail.com');
  await page.fill('[data-testid="staff-password-input"]', 'Test@1234');
  await page.click('[data-testid="staff-login-button"]');

  console.log('Waiting for navigation to dashboard...');
  await page.waitForURL('**/staff/dashboard', { timeout: 30000 });

  console.log('Navigating to QR Management...');
  await page.goto('http://localhost:4015/staff/qr-management');

  // Wait for the QR Management page to load
  await page.waitForSelector('.super-admin-qr-management-container', { timeout: 10000 });

  console.log('Taking screenshot of QR Management page...');
  await page.screenshot({ path: '/home/jules/verification/qr_management_page.png', fullPage: true });

  // Select a restaurant
  console.log('Selecting restaurant...');
  const restaurantSelect = page.locator('select').first();
  await restaurantSelect.selectOption({ index: 1 }); // Select the first available restaurant (index 0 might be placeholder)

  // Wait for branches to load and select one
  console.log('Selecting branch...');
  await page.waitForTimeout(1000); // Wait for branches to populate
  const branchSelect = page.locator('select').last();
  await branchSelect.selectOption({ index: 1 });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/qr_management_selected.png', fullPage: true });

  console.log('Verification successful!');
});
