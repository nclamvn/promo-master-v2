import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { useWeeklyKpi } from '@/hooks/useAnalytics';

export default function WeeklyKpi() {
  const { data, isLoading } = useWeeklyKpi();
  const weeklyData = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/analytics" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Weekly KPI Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Track weekly performance trends (last 12 weeks)</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : weeklyData.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-900">No weekly data available</p>
          <p className="mt-1 text-sm text-gray-500">Data will appear as promotions and claims are created.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <SummaryCard
              title="Total Promotions Created"
              value={weeklyData.reduce((s, w) => s + w.promotionsCreated, 0).toString()}
            />
            <SummaryCard
              title="Total Claims Submitted"
              value={weeklyData.reduce((s, w) => s + w.claimsSubmitted, 0).toString()}
            />
            <SummaryCard
              title="Total Budget Allocated"
              value={`$${(weeklyData.reduce((s, w) => s + w.budgetAllocated, 0) / 1000).toFixed(0)}k`}
            />
            <SummaryCard
              title="Total Claims Amount"
              value={`$${(weeklyData.reduce((s, w) => s + w.claimsAmount, 0) / 1000).toFixed(0)}k`}
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Promotions and Claims Activity</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="promotionsCreated" fill="#3b82f6" name="Promotions Created" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="claimsSubmitted" fill="#f59e0b" name="Claims Submitted" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Budget Allocation Trend</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="budgetAllocated" stroke="#3b82f6" strokeWidth={2} name="Budget Allocated" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="claimsAmount" stroke="#10b981" strokeWidth={2} name="Claims Amount" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
