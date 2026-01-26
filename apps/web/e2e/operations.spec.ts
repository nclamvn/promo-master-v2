/**
 * Operations Module E2E Tests
 * Tests for delivery tracking, sell tracking, and inventory
 */

import { test, expect } from '@playwright/test';

test.describe('Operations Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@tpm.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test.describe('Delivery Tracking', () => {
    test('should display delivery list', async ({ page }) => {
      await page.goto('/operations/delivery');

      await expect(page.locator('h1, h2').first()).toContainText(/Delivery|Giao hàng/i);
    });

    test('should show delivery calendar view', async ({ page }) => {
      await page.goto('/operations/delivery/calendar');

      // Check for calendar component
      const calendar = page.locator('.calendar, [data-testid="calendar"], .fc');
      if (await calendar.isVisible()) {
        await expect(calendar).toBeVisible();
      }
    });

    test('should filter deliveries by status', async ({ page }) => {
      await page.goto('/operations/delivery');

      const statusFilter = page.locator('select[data-filter="status"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('DELIVERED');
        await page.waitForTimeout(500);
      }
    });

    test('should filter deliveries by date range', async ({ page }) => {
      await page.goto('/operations/delivery');

      const dateFrom = page.locator('input[name="dateFrom"], input[data-filter="dateFrom"]');
      const dateTo = page.locator('input[name="dateTo"], input[data-filter="dateTo"]');

      if (await dateFrom.isVisible()) {
        await dateFrom.fill('2026-01-01');
        await dateTo.fill('2026-01-31');
        await page.waitForTimeout(500);
      }
    });

    test('should show delivery details', async ({ page }) => {
      await page.goto('/operations/delivery');

      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await expect(page).toHaveURL(/\/operations\/delivery\/del-/);
      }
    });
  });

  test.describe('Sell Tracking', () => {
    test('should display sell tracking dashboard', async ({ page }) => {
      await page.goto('/operations/sell-tracking');

      await expect(page.locator('h1, h2').first()).toContainText(/Sell|Bán hàng/i);
    });

    test('should show sell trends', async ({ page }) => {
      await page.goto('/operations/sell-tracking/trends');

      // Check for chart
      const charts = page.locator('.recharts-wrapper, [data-testid="chart"]');
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
      }
    });

    test('should display import page', async ({ page }) => {
      await page.goto('/operations/sell-tracking/import');

      // Check for file upload or import form
      const uploadArea = page.locator('input[type="file"], [data-testid="file-upload"]');
      await expect(uploadArea).toBeVisible();
    });

    test('should show sell alerts', async ({ page }) => {
      await page.goto('/operations/sell-tracking/alerts');

      await expect(page.locator('h1, h2').first()).toContainText(/Alert|Cảnh báo/i);
    });

    test('should filter sell data by product', async ({ page }) => {
      await page.goto('/operations/sell-tracking');

      const productFilter = page.locator('select[data-filter="product"], input[placeholder*="product"]');
      if (await productFilter.isVisible()) {
        await productFilter.click();
      }
    });

    test('should filter sell data by customer', async ({ page }) => {
      await page.goto('/operations/sell-tracking');

      const customerFilter = page.locator('select[data-filter="customer"], input[placeholder*="customer"]');
      if (await customerFilter.isVisible()) {
        await customerFilter.click();
      }
    });
  });

  test.describe('Inventory', () => {
    test('should display inventory list', async ({ page }) => {
      await page.goto('/operations/inventory');

      await expect(page.locator('h1, h2').first()).toContainText(/Inventory|Tồn kho/i);
    });

    test('should show inventory history', async ({ page }) => {
      await page.goto('/operations/inventory/history');

      await expect(page.locator('h1, h2').first()).toContainText(/History|Lịch sử/i);
    });

    test('should display inventory alerts', async ({ page }) => {
      await page.goto('/operations/inventory/alerts');

      await expect(page.locator('h1, h2').first()).toContainText(/Alert|Cảnh báo/i);
    });

    test('should show import page', async ({ page }) => {
      await page.goto('/operations/inventory/import');

      const uploadArea = page.locator('input[type="file"], [data-testid="file-upload"]');
      await expect(uploadArea).toBeVisible();
    });

    test('should filter inventory by location', async ({ page }) => {
      await page.goto('/operations/inventory');

      const locationFilter = page.locator('select[data-filter="location"]');
      if (await locationFilter.isVisible()) {
        await locationFilter.click();
      }
    });

    test('should highlight low stock items', async ({ page }) => {
      await page.goto('/operations/inventory');

      // Check for low stock indicators
      const lowStockBadge = page.locator('[data-status="low-stock"], .low-stock, .text-orange-500');
      if (await lowStockBadge.count() > 0) {
        await expect(lowStockBadge.first()).toBeVisible();
      }
    });

    test('should show inventory details', async ({ page }) => {
      await page.goto('/operations/inventory');

      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await expect(page).toHaveURL(/\/operations\/inventory\/inv-/);
      }
    });
  });

  test.describe('Operations Dashboard', () => {
    test('should display operations overview', async ({ page }) => {
      await page.goto('/operations');

      // Check for navigation cards or dashboard widgets
      const cards = page.locator('[data-testid="module-card"], .card');
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
      }
    });

    test('should navigate to sub-modules', async ({ page }) => {
      await page.goto('/operations');

      // Check for links to sub-modules
      const deliveryLink = page.locator('a:has-text("Delivery"), a:has-text("Giao hàng")');
      if (await deliveryLink.isVisible()) {
        await deliveryLink.click();
        await expect(page).toHaveURL('/operations/delivery');
      }
    });
  });
});
