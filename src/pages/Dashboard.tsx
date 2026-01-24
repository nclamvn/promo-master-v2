import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, FileText, Megaphone } from 'lucide-react';

const kpiData = [
  { title: 'Total Budget', value: '$2.4M', change: '+12%', icon: DollarSign, color: 'blue' },
  { title: 'Active Promotions', value: '24', change: '+3', icon: Megaphone, color: 'green' },
  { title: 'Pending Claims', value: '18', change: '-5', icon: FileText, color: 'orange' },
  { title: 'ROI', value: '3.2x', change: '+0.4', icon: TrendingUp, color: 'purple' },
];

const chartData = [
  { month: 'Jan', budget: 400000, spend: 320000 },
  { month: 'Feb', budget: 380000, spend: 350000 },
  { month: 'Mar', budget: 420000, spend: 390000 },
  { month: 'Apr', budget: 450000, spend: 410000 },
  { month: 'May', budget: 400000, spend: 380000 },
  { month: 'Jun', budget: 460000, spend: 420000 },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your trade promotion performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <div
            key={kpi.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${colorMap[kpi.color]}`}>
                <kpi.icon size={22} />
              </div>
            </div>
            <p className="mt-2 text-sm text-green-600">{kpi.change} from last month</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Budget vs Spend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
              <Bar dataKey="budget" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Budget" />
              <Bar dataKey="spend" fill="#10b981" radius={[4, 4, 0, 0]} name="Spend" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
