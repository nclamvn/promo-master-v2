import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface BaselineData {
  id: string;
  customer: string;
  product: string;
  channel: string;
  period: string;
  baselineVolume: number;
  baselineRevenue: number;
  actualVolume: number;
  actualRevenue: number;
}

const mockData: BaselineData[] = [
  { id: '1', customer: 'BigC', product: 'All Products', channel: 'MT', period: '2024-Q1', baselineVolume: 50000, baselineRevenue: 2500000, actualVolume: 48000, actualRevenue: 2400000 },
  { id: '2', customer: 'Lotus', product: 'All Products', channel: 'MT', period: '2024-Q1', baselineVolume: 35000, baselineRevenue: 1750000, actualVolume: 37000, actualRevenue: 1850000 },
  { id: '3', customer: 'MiniStop', product: 'All Products', channel: 'GT', period: '2024-Q1', baselineVolume: 20000, baselineRevenue: 1000000, actualVolume: 19500, actualRevenue: 975000 },
  { id: '4', customer: 'BigC', product: 'All Products', channel: 'MT', period: '2024-Q2', baselineVolume: 55000, baselineRevenue: 2750000, actualVolume: 52000, actualRevenue: 2600000 },
  { id: '5', customer: 'Lotus', product: 'All Products', channel: 'MT', period: '2024-Q2', baselineVolume: 38000, baselineRevenue: 1900000, actualVolume: 40000, actualRevenue: 2000000 },
];

const chartData = [
  { month: 'Jan', baseline: 105000, actual: 101000 },
  { month: 'Feb', baseline: 108000, actual: 106000 },
  { month: 'Mar', baseline: 112000, actual: 115000 },
  { month: 'Apr', baseline: 110000, actual: 108000 },
  { month: 'May', baseline: 115000, actual: 112000 },
  { month: 'Jun', baseline: 118000, actual: 120000 },
];

export default function Baselines() {
  const [selectedChannel, setSelectedChannel] = useState('');

  const filteredData = selectedChannel
    ? mockData.filter((d) => d.channel === selectedChannel)
    : mockData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Baselines</h1>
          <p className="mt-1 text-sm text-gray-500">Baseline volumes and revenue for performance comparison</p>
        </div>
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All Channels</option>
          <option value="MT">Modern Trade</option>
          <option value="GT">General Trade</option>
          <option value="ECOMMERCE">E-Commerce</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Baseline vs Actual Volume</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), '']} />
              <Legend />
              <Bar dataKey="baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Baseline" />
              <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Baseline Data</h2>
        </div>
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <TrendingUp size={40} className="text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-900">No baseline data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Channel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Period</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Baseline Vol</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actual Vol</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Variance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Baseline Rev</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actual Rev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((row) => {
                  const volVariance = row.baselineVolume > 0
                    ? (((row.actualVolume - row.baselineVolume) / row.baselineVolume) * 100).toFixed(1)
                    : '0';
                  const isPositive = parseFloat(volVariance) >= 0;
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.customer}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.channel}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.period}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{row.baselineVolume.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{row.actualVolume.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{volVariance}%
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">${row.baselineRevenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">${row.actualRevenue.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
