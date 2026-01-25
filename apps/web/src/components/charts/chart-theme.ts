/**
 * Industrial chart theme configuration
 */

export const chartTheme = {
  // Colors
  colors: {
    primary: 'hsl(217, 91%, 60%)',      // Blue
    secondary: 'hsl(188, 94%, 43%)',    // Cyan
    success: 'hsl(160, 84%, 39%)',      // Emerald
    warning: 'hsl(38, 92%, 50%)',       // Amber
    danger: 'hsl(0, 84%, 60%)',         // Red
    purple: 'hsl(280, 65%, 60%)',       // Purple

    // Chart series
    series: [
      'hsl(217, 91%, 60%)',   // Blue
      'hsl(160, 84%, 39%)',   // Emerald
      'hsl(38, 92%, 50%)',    // Amber
      'hsl(280, 65%, 60%)',   // Purple
      'hsl(188, 94%, 43%)',   // Cyan
      'hsl(0, 84%, 60%)',     // Red
    ],

    // Background & grid
    background: 'hsl(220, 18%, 10%)',
    grid: 'hsl(220, 12%, 22%)',
    axis: 'hsl(215, 15%, 45%)',
    text: 'hsl(215, 20%, 65%)',
    tooltip: 'hsl(220, 20%, 7%)',
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

// Tooltip styles for Recharts
export const tooltipStyle = {
  contentStyle: {
    backgroundColor: chartTheme.colors.tooltip,
    border: `1px solid ${chartTheme.colors.grid}`,
    borderRadius: '4px',
    padding: '8px 12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
  },
  labelStyle: {
    color: chartTheme.colors.text,
    fontFamily: chartTheme.fontFamily,
    fontSize: chartTheme.fontSize.label,
    fontWeight: 600,
    marginBottom: '4px',
  },
  itemStyle: {
    color: chartTheme.colors.text,
    fontFamily: chartTheme.fontFamily,
    fontSize: chartTheme.fontSize.label,
  },
};

// Axis styles
export const axisStyle = {
  tick: {
    fontSize: chartTheme.fontSize.axis,
    fill: chartTheme.colors.axis,
    fontFamily: chartTheme.fontFamily,
  },
  axisLine: {
    stroke: chartTheme.colors.grid,
  },
  tickLine: {
    stroke: chartTheme.colors.grid,
  },
};

// Grid styles
export const gridStyle = {
  stroke: chartTheme.colors.grid,
  strokeDasharray: '3 3',
};
