import { test, expect } from '@playwright/test';

test('Super Admin Flow: Create Restaurant and Manage Branches', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:4015/sadmin/login');
  await page.fill('input[type="email"]', 'superadmin@gmail.com');
  await page.fill('input[type="password"]', 'Test@1234');
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard');
  await page.screenshot({ path: '/home/jules/verification/01_dashboard.png' });

  // 2. Go to Restaurants List
  await page.goto('http://localhost:4015/restaurants');
  await page.screenshot({ path: '/home/jules/verification/02_restaurant_list.png' });

  // 3. Click Create Restaurant (Step 1: Selection)
  await page.click('text=Add Restaurant');
  await page.waitForSelector('text=Select Establishment Type');
  await page.screenshot({ path: '/home/jules/verification/03_create_step1.png' });

  // 4. Select "Branch-wise" and proceed to Step 2
  await page.click('text=Branch-wise');
  await page.waitForSelector('text=Restaurant Details');
  await page.screenshot({ path: '/home/jules/verification/04_create_step2.png' });

  // 5. Fill details and create
  const uniqueName = `Test Resto ${Date.now()}`;
  await page.fill('input[name="name"]', uniqueName);
  await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
  await page.fill('input[name="phone"]', '1234567890');
  await page.fill('input[name="address.street"]', 'Main St 1');
  await page.fill('input[name="address.city"]', 'New York');
  await page.fill('input[name="address.state"]', 'NY');
  await page.fill('input[name="address.zipCode"]', '10001');
  await page.fill('input[name="address.country"]', 'USA');

  await page.click('button:has-text("Create Restaurant")');

  // 6. Verify redirection to View Restaurant
  await page.waitForURL(/\/restaurants\/[a-f0-9]{24}/);
  await page.screenshot({ path: '/home/jules/verification/05_view_restaurant.png' });

  // 7. Check "Branches" tab
  await page.click('button:has-text("Branches")');
  await page.screenshot({ path: '/home/jules/verification/06_branches_tab.png' });

  // Verify Main Branch exists
  await expect(page.locator('text=Main Branch')).toBeVisible();

  // 8. Add a sub-branch
  await page.click('button:has-text("Add Sub-branch")');
  await page.fill('input[name="name"]', 'Sub Branch 1');
  await page.fill('input[name="email"]', `sub1_${Date.now()}@example.com`);
  await page.fill('input[name="phone"]', '0987654321');
  await page.fill('input[name="address.street"]', 'Sub St 2');
  await page.fill('input[name="address.city"]', 'New York');
  await page.fill('input[name="address.state"]', 'NY');
  await page.fill('input[name="address.zipCode"]', '10002');
  await page.fill('input[name="address.country"]', 'USA');

  await page.click('button:has-text("Create Branch")');

  // 9. Verify sub-branch added
  await page.waitForSelector('text=Sub Branch 1');
  await page.screenshot({ path: '/home/jules/verification/07_subbranch_added.png' });
});
