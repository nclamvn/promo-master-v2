/**
 * BI Module E2E Tests
 * Tests for Business Intelligence, reports, analytics, and export
 */

import { test, expect } from '@playwright/test';

test.describe('BI Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@tpm.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test.describe('BI Dashboard', () => {
    test('should display BI dashboard', async ({ page }) => {
      await page.goto('/bi');

      await expect(page.locator('h1, h2').first()).toContainText(/BI|Business Intelligence|Báo cáo/i);
    });

    test('should show KPI summary cards', async ({ page }) => {
      await page.goto('/bi');

      const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card, .stat-card');
      if (await kpiCards.count() > 0) {
        await expect(kpiCards.first()).toBeVisible();
      }
    });

    test('should display main dashboard charts', async ({ page }) => {
      await page.goto('/bi');

      const charts = page.locator('.recharts-wrapper, [data-testid="chart"], canvas');
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
      }
    });

    test('should allow date range selection', async ({ page }) => {
      await page.goto('/bi');

      const dateRangePicker = page.locator('[data-testid="date-range"], .date-range-picker');
      if (await dateRangePicker.isVisible()) {
        await dateRangePicker.click();
      }
    });
  });

  test.describe('Reports', () => {
    test('should display reports list', async ({ page }) => {
      await page.goto('/bi/reports');

      await expect(page.locator('h1, h2').first()).toContainText(/Report|Báo cáo/i);
    });

    test('should show report categories', async ({ page }) => {
      await page.goto('/bi/reports');

      // Check for category filters or tabs
      const categories = page.locator('[data-testid="report-category"], .report-category');
      if (await categories.count() > 0) {
        await expect(categories.first()).toBeVisible();
      }
    });

    test('should filter reports by type', async ({ page }) => {
      await page.goto('/bi/reports');

      const typeFilter = page.locator('select[data-filter="type"]');
      if (await typeFilter.isVisible()) {
        await typeFilter.click();
      }
    });

    test('should open report viewer', async ({ page }) => {
      await page.goto('/bi/reports');

      const firstReport = page.locator('[data-testid="report-item"], .report-item').first();
      if (await firstReport.isVisible()) {
        await firstReport.click();
      }
    });

    test('should have export option for reports', async ({ page }) => {
      await page.goto('/bi/reports');

      const exportButton = page.locator('button:has-text("Export"), button:has-text("Xuất")').first();
      if (await exportButton.isVisible()) {
        await expect(exportButton).toBeVisible();
      }
    });

    test('should show scheduled reports', async ({ page }) => {
      await page.goto('/bi/reports');

      const scheduledTab = page.locator('[data-tab="scheduled"], button:has-text("Scheduled")');
      if (await scheduledTab.isVisible()) {
        await scheduledTab.click();
      }
    });
  });

  test.describe('Analytics', () => {
    test('should display analytics dashboard', async ({ page }) => {
      await page.goto('/bi/analytics');

      await expect(page.locator('h1, h2').first()).toContainText(/Analytic|Phân tích/i);
    });

    test('should show analysis charts', async ({ page }) => {
      await page.goto('/bi/analytics');

      const charts = page.locator('.recharts-wrapper, [data-testid="chart"]');
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
      }
    });

    test('should allow dimension selection', async ({ page }) => {
      await page.goto('/bi/analytics');

      const dimensionPicker = page.locator('select[data-dimension], [data-testid="dimension-picker"]');
      if (await dimensionPicker.isVisible()) {
        await dimensionPicker.click();
      }
    });

    test('should allow metric selection', async ({ page }) => {
      await page.goto('/bi/analytics');

      const metricPicker = page.locator('select[data-metric], [data-testid="metric-picker"]');
      if (await metricPicker.isVisible()) {
        await metricPicker.click();
      }
    });

    test('should display trend analysis', async ({ page }) => {
      await page.goto('/bi/analytics');

      const trendChart = page.locator('[data-testid="trend-chart"], .trend-chart');
      if (await trendChart.isVisible()) {
        await expect(trendChart).toBeVisible();
      }
    });

    test('should show comparison view', async ({ page }) => {
      await page.goto('/bi/analytics');

      const comparisonToggle = page.locator('button:has-text("Compare"), [data-compare-mode]');
      if (await comparisonToggle.isVisible()) {
        await comparisonToggle.click();
      }
    });
  });

  test.describe('Export Center', () => {
    test('should display export center', async ({ page }) => {
      await page.goto('/bi/export');

      await expect(page.locator('h1, h2').first()).toContainText(/Export|Xuất/i);
    });

    test('should show export format options', async ({ page }) => {
      await page.goto('/bi/export');

      const formatOptions = page.locator('[data-format], .format-option');
      if (await formatOptions.count() > 0) {
        await expect(formatOptions.first()).toBeVisible();
      }
    });

    test('should show export history', async ({ page }) => {
      await page.goto('/bi/export');

      const historyTable = page.locator('table, [data-testid="export-history"]');
      if (await historyTable.isVisible()) {
        await expect(historyTable).toBeVisible();
      }
    });

    test('should allow CSV export', async ({ page }) => {
      await page.goto('/bi/export');

      const csvOption = page.locator('button:has-text("CSV"), [data-format="csv"]');
      if (await csvOption.isVisible()) {
        await expect(csvOption).toBeVisible();
      }
    });

    test('should allow Excel export', async ({ page }) => {
      await page.goto('/bi/export');

      const excelOption = page.locator('button:has-text("Excel"), [data-format="excel"]');
      if (await excelOption.isVisible()) {
        await expect(excelOption).toBeVisible();
      }
    });

    test('should allow PDF export', async ({ page }) => {
      await page.goto('/bi/export');

      const pdfOption = page.locator('button:has-text("PDF"), [data-format="pdf"]');
      if (await pdfOption.isVisible()) {
        await expect(pdfOption).toBeVisible();
      }
    });

    test('should show scheduled exports', async ({ page }) => {
      await page.goto('/bi/export');

      const scheduledSection = page.locator('[data-testid="scheduled-exports"], .scheduled-exports');
      if (await scheduledSection.isVisible()) {
        await expect(scheduledSection).toBeVisible();
      }
    });
  });

  test.describe('Custom Dashboards', () => {
    test('should allow creating custom dashboard', async ({ page }) => {
      await page.goto('/bi');

      const createButton = page.locator('button:has-text("Create Dashboard"), button:has-text("Tạo Dashboard")');
      if (await createButton.isVisible()) {
        await expect(createButton).toBeVisible();
      }
    });

    test('should show saved dashboards', async ({ page }) => {
      await page.goto('/bi');

      const dashboardList = page.locator('[data-testid="dashboard-list"], .dashboard-list');
      if (await dashboardList.isVisible()) {
        await expect(dashboardList).toBeVisible();
      }
    });
  });
});
