import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, FileText, Megaphone, ArrowRight } from 'lucide-react';
import { useAnalyticsDashboard } from '@/hooks/useAnalytics';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

const spendByChannel = [
  { name: 'Modern Trade', value: 45 },
  { name: 'General Trade', value: 25 },
  { name: 'E-Commerce', value: 20 },
  { name: 'HORECA', value: 10 },
];

const monthlyTrend = [
  { month: 'Jul', budget: 380000, spend: 320000, roi: 2.8 },
  { month: 'Aug', budget: 400000, spend: 360000, roi: 3.0 },
  { month: 'Sep', budget: 420000, spend: 390000, roi: 3.1 },
  { month: 'Oct', budget: 450000, spend: 410000, roi: 3.2 },
  { month: 'Nov', budget: 430000, spend: 400000, roi: 3.0 },
  { month: 'Dec', budget: 480000, spend: 450000, roi: 3.4 },
];

export default function Analytics() {
  const { data, isLoading } = useAnalyticsDashboard();
  const kpi = data?.data;

  const kpiCards = [
    { title: 'Total Budget', value: kpi ? `$${(kpi.totalBudget / 1000000).toFixed(1)}M` : '-', icon: DollarSign, color: 'blue' },
    { title: 'Active Promotions', value: kpi?.activePromotions?.toString() ?? '-', icon: Megaphone, color: 'green' },
    { title: 'Pending Claims', value: kpi?.pendingClaims?.toString() ?? '-', icon: FileText, color: 'orange' },
    { title: 'Utilization', value: kpi ? `${kpi.utilizationRate}%` : '-', icon: TrendingUp, color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Trade promotion performance overview</p>
        </div>
        <Link
          to="/analytics/weekly-kpi"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Weekly KPIs <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <span className="inline-block h-7 w-16 animate-pulse rounded bg-gray-200" />
                  ) : card.value}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${colorMap[card.color]}`}>
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Monthly Budget vs Spend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${v / 1000}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="budget" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Budget" />
                <Bar dataKey="spend" fill="#10b981" radius={[4, 4, 0, 0]} name="Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Spend by Channel</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendByChannel}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {spendByChannel.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
