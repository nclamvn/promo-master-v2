/**
 * Industrial chart theme configuration
 * Supports both light and dark themes using CSS variables
 */

// Helper to get CSS variable value
const getCSSVar = (name: string) => `var(--color-${name})`;

export const chartTheme = {
  // Colors - using CSS variables for theme support
  colors: {
    primary: getCSSVar('chart-1'),
    secondary: getCSSVar('chart-5'),
    success: getCSSVar('chart-2'),
    warning: getCSSVar('chart-3'),
    danger: getCSSVar('chart-6'),
    purple: getCSSVar('chart-4'),

    // Chart series - using CSS variables
    series: [
      getCSSVar('chart-1'),   // Blue
      getCSSVar('chart-2'),   // Emerald
      getCSSVar('chart-3'),   // Amber
      getCSSVar('chart-4'),   // Purple
      getCSSVar('chart-5'),   // Cyan
      getCSSVar('chart-6'),   // Red
    ],

    // Background & grid - using CSS variables
    background: getCSSVar('card'),
    grid: getCSSVar('surface-border'),
    axis: getCSSVar('foreground-subtle'),
    text: getCSSVar('foreground-muted'),
    tooltip: getCSSVar('popover'),
  },

  // Typography
  fontSize: {
    axis: 10,
    label: 11,
    legend: 11,
  },

  fontFamily: 'JetBrains Mono, IBM Plex Mono, monospace',

  // Stroke widths
  strokeWidth: {
    line: 2,
    area: 1,
    bar: 0,
  },

  // Animation
  animationDuration: 400,
};

// Tooltip styles for Recharts - theme aware
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: getCSSVar('popover'),
    border: `1px solid ${getCSSVar('surface-border')}`,
    borderRadius: '4px',
    padding: '8px 12px',
    boxShadow: 'var(--shadow-lg)',
  },
  labelStyle: {
    color: getCSSVar('foreground'),
    fontFamily: chartTheme.fontFamily,
    fontSize: chartTheme.fontSize.label,
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: getCSSVar('foreground-muted'),
    fontFamily: chartTheme.fontFamily,
    fontSize: chartTheme.fontSize.label,
  },
  cursor: {
    fill: 'var(--chart-cursor-fill, rgba(128, 128, 128, 0.1))',
  },
};

// Axis styles - theme aware
export const axisStyle = {
  tick: {
    fontSize: chartTheme.fontSize.axis,
    fill: getCSSVar('foreground-subtle'),
    fontFamily: chartTheme.fontFamily,
  },
  axisLine: {
    stroke: getCSSVar('surface-border'),
  },
  tickLine: {
    stroke: getCSSVar('surface-border'),
  },
};

// Grid styles - theme aware
export const gridStyle = {
  stroke: getCSSVar('surface-border'),
  strokeDasharray: '3 3',
};
