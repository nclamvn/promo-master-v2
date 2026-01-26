/**
 * Analytics Dashboard Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { KPICard, ChartWidget } from '@/components/bi';
import { useDashboard, useTrends } from '@/hooks/bi';
import type { DashboardParams } from '@/types/advanced';

const METRICS = [
  { value: 'promotions', label: 'Promotions' },
  { value: 'claims', label: 'Claims' },
  { value: 'spend', label: 'Spend' },
  { value: 'roi', label: 'ROI' },
];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

  const today = new Date();
  const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);

  const [dateRange, setDateRange] = useState<DashboardParams>({
    dateFrom: sixMonthsAgo.toISOString().split('T')[0],
    dateTo: today.toISOString().split('T')[0],
  });
  const [selectedMetric, setSelectedMetric] = useState('promotions');

  const { data: dashboard, isLoading: dashboardLoading, refetch } = useDashboard(dateRange);
  const { data: trendsData, isLoading: trendsLoading } = useTrends({
    ...dateRange,
    metric: selectedMetric,
  });

  const kpis = dashboard?.kpis || [];
  const trends = trendsData?.data || [];

  const isLoading = dashboardLoading || trendsLoading;

  // Convert trends to chart data
  const trendChartData = trends.map((t) => ({
    label: t.period,
    value: t.value,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/bi')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Deep dive into your data
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="dateFrom">From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateRange.dateFrom || ''}
                onChange={(e) => setDateRange((prev) => ({ ...prev, dateFrom: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="dateTo">To</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateRange.dateTo || ''}
                onChange={(e) => setDateRange((prev) => ({ ...prev, dateTo: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="metric">Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger id="metric" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRICS.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-4">
            {kpis.length > 0 ? (
              kpis.map((kpi, index) => <KPICard key={index} kpi={kpi} />)
            ) : (
              <>
                <KPICard
                  kpi={{
                    name: 'Total Promotions',
                    value: 156,
                    change: 12.5,
                    trend: 'UP',
                    format: 'NUMBER',
                  }}
                />
                <KPICard
                  kpi={{
                    name: 'Active Budget',
                    value: 2500000000,
                    change: -5.2,
                    trend: 'DOWN',
                    format: 'CURRENCY',
                  }}
                />
                <KPICard
                  kpi={{
                    name: 'Claims Processed',
                    value: 423,
                    change: 8.3,
                    trend: 'UP',
                    format: 'NUMBER',
                  }}
                />
                <KPICard
                  kpi={{
                    name: 'Avg ROI',
                    value: 24.5,
                    change: 3.2,
                    trend: 'UP',
                    format: 'PERCENTAGE',
                  }}
                />
              </>
            )}
          </div>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {METRICS.find((m) => m.value === selectedMetric)?.label} Trend
              </CardTitle>
              <CardDescription>
                Performance over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendChartData.length > 0 ? (
                <ChartWidget type="LINE" data={trendChartData} height={300} />
              ) : (
                <ChartWidget
                  type="BAR"
                  data={[
                    { label: 'Jan', value: 45 },
                    { label: 'Feb', value: 52 },
                    { label: 'Mar', value: 48 },
                    { label: 'Apr', value: 61 },
                    { label: 'May', value: 55 },
                    { label: 'Jun', value: 67 },
                  ]}
                  height={300}
                />
              )}
            </CardContent>
          </Card>

          {/* Comparison Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Period Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Period</span>
                    <span className="font-medium">156 promotions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Previous Period</span>
                    <span className="font-medium">139 promotions</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Change</span>
                    <span className="flex items-center gap-1 text-green-600 font-medium">
                      <TrendingUp className="h-4 w-4" />
                      +12.2%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Discount Promotions', value: '+28%' },
                    { name: 'Customer ABC Corp', value: '+22%' },
                    { name: 'Product Category A', value: '+18%' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium text-green-600">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By Promotion Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWidget
                  type="PIE"
                  data={[
                    { label: 'Discount', value: 45 },
                    { label: 'Bundle', value: 25 },
                    { label: 'Gift', value: 20 },
                    { label: 'Rebate', value: 10 },
                  ]}
                  height={250}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Region</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWidget
                  type="BAR"
                  data={[
                    { label: 'North', value: 35 },
                    { label: 'South', value: 28 },
                    { label: 'East', value: 22 },
                    { label: 'West', value: 15 },
                  ]}
                  height={250}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
