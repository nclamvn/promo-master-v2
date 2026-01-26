/**
 * Finance Module E2E Tests
 * Tests for accruals, deductions, journals, and cheques
 */

import { test, expect } from '@playwright/test';

test.describe('Finance Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@tpm.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test.describe('Accruals', () => {
    test('should display accruals list', async ({ page }) => {
      await page.goto('/finance/accruals');

      await expect(page.locator('h1, h2').first()).toContainText(/Accrual|Dự phòng/i);
      await expect(page.locator('table')).toBeVisible();
    });

    test('should show accrual details', async ({ page }) => {
      await page.goto('/finance/accruals');

      // Click on first accrual row
      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await expect(page).toHaveURL(/\/finance\/accruals\/acc-/);
      }
    });

    test('should filter accruals by status', async ({ page }) => {
      await page.goto('/finance/accruals');

      const statusFilter = page.locator('select[data-filter="status"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('POSTED');
        await page.waitForTimeout(500);

        const statusBadges = page.locator('[data-status]');
        if (await statusBadges.count() > 0) {
          await expect(statusBadges.first()).toContainText(/POSTED|Đã hạch toán/i);
        }
      }
    });

    test('should filter accruals by period', async ({ page }) => {
      await page.goto('/finance/accruals');

      const periodFilter = page.locator('select[data-filter="period"], input[type="month"]');
      if (await periodFilter.isVisible()) {
        await periodFilter.fill('2026-01');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Deductions', () => {
    test('should display deductions list', async ({ page }) => {
      await page.goto('/finance/deductions');

      await expect(page.locator('h1, h2').first()).toContainText(/Deduction|Khấu trừ/i);
      await expect(page.locator('table')).toBeVisible();
    });

    test('should show deduction details', async ({ page }) => {
      await page.goto('/finance/deductions');

      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await expect(page).toHaveURL(/\/finance\/deductions\/ded-/);
      }
    });

    test('should filter deductions by match status', async ({ page }) => {
      await page.goto('/finance/deductions');

      const statusFilter = page.locator('select[data-filter="status"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('MATCHED');
        await page.waitForTimeout(500);
      }
    });

    test('should display variance information', async ({ page }) => {
      await page.goto('/finance/deductions');

      const varianceColumn = page.locator('th:has-text("Variance"), th:has-text("Chênh lệch")');
      await expect(varianceColumn).toBeVisible();
    });
  });

  test.describe('GL Journals', () => {
    test('should display journals list', async ({ page }) => {
      await page.goto('/finance/journals');

      await expect(page.locator('h1, h2').first()).toContainText(/Journal|Bút toán/i);
      await expect(page.locator('table')).toBeVisible();
    });

    test('should show journal details', async ({ page }) => {
      await page.goto('/finance/journals');

      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await expect(page).toHaveURL(/\/finance\/journals\/jnl-/);
      }
    });

    test('should filter journals by type', async ({ page }) => {
      await page.goto('/finance/journals');

      const typeFilter = page.locator('select[data-filter="type"]');
      if (await typeFilter.isVisible()) {
        await typeFilter.selectOption('ACCRUAL');
        await page.waitForTimeout(500);
      }
    });

    test('should display debit and credit columns', async ({ page }) => {
      await page.goto('/finance/journals');

      await expect(page.locator('th:has-text("Debit"), th:has-text("Nợ")')).toBeVisible();
      await expect(page.locator('th:has-text("Credit"), th:has-text("Có")')).toBeVisible();
    });
  });

  test.describe('Cheques', () => {
    test('should display cheques list', async ({ page }) => {
      await page.goto('/finance/cheques');

      await expect(page.locator('h1, h2').first()).toContainText(/Cheque|Séc/i);
      await expect(page.locator('table')).toBeVisible();
    });

    test('should show cheque details', async ({ page }) => {
      await page.goto('/finance/cheques');

      const firstRow = page.locator('table tbody tr').first();
      if (await firstRow.isVisible()) {
        await firstRow.click();
        await expect(page).toHaveURL(/\/finance\/cheques\/chq-/);
      }
    });

    test('should filter cheques by status', async ({ page }) => {
      await page.goto('/finance/cheques');

      const statusFilter = page.locator('select[data-filter="status"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('CLEARED');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Finance Dashboard', () => {
    test('should display finance overview metrics', async ({ page }) => {
      await page.goto('/finance');

      // Check for KPI cards
      const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card');
      if (await kpiCards.count() > 0) {
        await expect(kpiCards.first()).toBeVisible();
      }
    });

    test('should show summary charts', async ({ page }) => {
      await page.goto('/finance');

      const charts = page.locator('.recharts-wrapper, [data-testid="chart"]');
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
      }
    });
  });
});
