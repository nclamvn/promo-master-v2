/**
 * Tests for ThemeProvider component
 */

/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { useUIStore } from '@/stores/uiStore';

// Mock the store
vi.mock('@/stores/uiStore', () => ({
  useUIStore: vi.fn(),
}));

describe('ThemeProvider', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any theme classes from previous tests
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.classList.remove('light', 'dark');
    vi.clearAllMocks();
  });

  it('applies light class when theme is light', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { theme: 'light' };
      return selector ? selector(state) : state;
    });

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('applies dark class when theme is dark', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { theme: 'dark' };
      return selector ? selector(state) : state;
    });

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('applies system preference when theme is system (dark)', () => {
    // Mock system preference as dark
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { theme: 'system' };
      return selector ? selector(state) : state;
    });

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('applies system preference when theme is system (light)', () => {
    // Mock system preference as light
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query !== '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { theme: 'system' };
      return selector ? selector(state) : state;
    });

    render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders children correctly', () => {
    (useUIStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = { theme: 'dark' };
      return selector ? selector(state) : state;
    });

    const { getByText } = render(
      <ThemeProvider>
        <div>Test content</div>
      </ThemeProvider>
    );

    expect(getByText('Test content')).toBeInTheDocument();
  });
});
