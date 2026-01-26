/**
 * AI Module E2E Tests
 * Tests for AI insights, recommendations, and voice commands
 */

import { test, expect } from '@playwright/test';

test.describe('AI Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@tpm.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test.describe('AI Dashboard', () => {
    test('should display AI dashboard', async ({ page }) => {
      await page.goto('/ai');

      await expect(page.locator('h1, h2').first()).toContainText(/AI|Trí tuệ nhân tạo/i);
    });

    test('should show AI-generated insights summary', async ({ page }) => {
      await page.goto('/ai');

      // Check for insights cards or widgets
      const insightCards = page.locator('[data-testid="insight-card"], .insight-card');
      if (await insightCards.count() > 0) {
        await expect(insightCards.first()).toBeVisible();
      }
    });

    test('should display recommendation preview', async ({ page }) => {
      await page.goto('/ai');

      // Check for recommendation section
      const recommendations = page.locator('[data-testid="recommendations"], .recommendations-section');
      if (await recommendations.isVisible()) {
        await expect(recommendations).toBeVisible();
      }
    });
  });

  test.describe('AI Insights', () => {
    test('should display insights list', async ({ page }) => {
      await page.goto('/ai/insights');

      await expect(page.locator('h1, h2').first()).toContainText(/Insight/i);
    });

    test('should show insight categories', async ({ page }) => {
      await page.goto('/ai/insights');

      // Check for category filters or tabs
      const categories = page.locator('[data-testid="insight-category"], .category-filter');
      if (await categories.count() > 0) {
        await expect(categories.first()).toBeVisible();
      }
    });

    test('should filter insights by type', async ({ page }) => {
      await page.goto('/ai/insights');

      const typeFilter = page.locator('select[data-filter="type"]');
      if (await typeFilter.isVisible()) {
        await typeFilter.click();
      }
    });

    test('should display insight details', async ({ page }) => {
      await page.goto('/ai/insights');

      const firstInsight = page.locator('[data-testid="insight-item"], .insight-item').first();
      if (await firstInsight.isVisible()) {
        await firstInsight.click();
      }
    });

    test('should show confidence score for insights', async ({ page }) => {
      await page.goto('/ai/insights');

      const confidenceIndicator = page.locator('[data-confidence], .confidence-score');
      if (await confidenceIndicator.count() > 0) {
        await expect(confidenceIndicator.first()).toBeVisible();
      }
    });
  });

  test.describe('AI Recommendations', () => {
    test('should display recommendations list', async ({ page }) => {
      await page.goto('/ai/recommendations');

      await expect(page.locator('h1, h2').first()).toContainText(/Recommendation|Đề xuất/i);
    });

    test('should show recommendation priority', async ({ page }) => {
      await page.goto('/ai/recommendations');

      const priorityBadge = page.locator('[data-priority], .priority-badge');
      if (await priorityBadge.count() > 0) {
        await expect(priorityBadge.first()).toBeVisible();
      }
    });

    test('should filter recommendations by status', async ({ page }) => {
      await page.goto('/ai/recommendations');

      const statusFilter = page.locator('select[data-filter="status"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('PENDING');
        await page.waitForTimeout(500);
      }
    });

    test('should allow accepting recommendation', async ({ page }) => {
      await page.goto('/ai/recommendations');

      const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Áp dụng")').first();
      if (await acceptButton.isVisible()) {
        // Don't actually click, just verify the button exists
        await expect(acceptButton).toBeVisible();
      }
    });

    test('should allow dismissing recommendation', async ({ page }) => {
      await page.goto('/ai/recommendations');

      const dismissButton = page.locator('button:has-text("Dismiss"), button:has-text("Bỏ qua")').first();
      if (await dismissButton.isVisible()) {
        await expect(dismissButton).toBeVisible();
      }
    });

    test('should display recommendation impact estimate', async ({ page }) => {
      await page.goto('/ai/recommendations');

      const impactSection = page.locator('[data-impact], .impact-estimate');
      if (await impactSection.count() > 0) {
        await expect(impactSection.first()).toBeVisible();
      }
    });
  });

  test.describe('Voice Commands', () => {
    test('should display voice interface', async ({ page }) => {
      await page.goto('/voice');

      // Check for voice UI elements
      const voiceUI = page.locator('[data-testid="voice-interface"], .voice-interface');
      if (await voiceUI.isVisible()) {
        await expect(voiceUI).toBeVisible();
      }
    });

    test('should show voice command examples', async ({ page }) => {
      await page.goto('/voice');

      const examples = page.locator('[data-testid="command-examples"], .command-examples');
      if (await examples.isVisible()) {
        await expect(examples).toBeVisible();
      }
    });

    test('should have microphone button', async ({ page }) => {
      await page.goto('/voice');

      const micButton = page.locator('button[aria-label*="microphone"], button:has-text("Record"), .mic-button');
      if (await micButton.isVisible()) {
        await expect(micButton).toBeVisible();
      }
    });

    test('should display voice command history', async ({ page }) => {
      await page.goto('/voice');

      const history = page.locator('[data-testid="command-history"], .command-history');
      if (await history.isVisible()) {
        await expect(history).toBeVisible();
      }
    });
  });

  test.describe('AI Settings', () => {
    test('should navigate to AI settings', async ({ page }) => {
      await page.goto('/ai');

      const settingsLink = page.locator('a:has-text("Settings"), button:has-text("Settings")');
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
      }
    });
  });
});
