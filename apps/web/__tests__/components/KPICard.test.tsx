/**
 * KPICard Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { KPICard } from '@/components/charts/KPICard';
import { TrendingUp } from 'lucide-react';

describe('KPICard', () => {
  it('should render title and value', () => {
    render(<KPICard title="Total Sales" value="1,000,000" />);

    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    render(
      <KPICard
        title="Revenue"
        value="500,000"
        icon={<TrendingUp data-testid="icon" />}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render trend with positive change', () => {
    render(
      <KPICard
        title="Sales"
        value="100"
        trend={{ value: 15 }}
      />
    );

    // Positive trends show with + prefix
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('should render trend with negative change', () => {
    render(
      <KPICard
        title="Sales"
        value="100"
        trend={{ value: -10 }}
      />
    );

    expect(screen.getByText('-10%')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(
      <KPICard
        title="Revenue"
        value="1,000"
        subtitle="This month"
      />
    );

    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <KPICard
        title="Test"
        value="123"
        className="custom-class"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('should render placeholder value', () => {
    render(<KPICard title="Loading" value="--" />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
  });
});
