import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Wallet } from 'lucide-react';
import { useBudget } from '@/hooks/useBudgets';

export default function BudgetDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useBudget(id);

  const budget = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Wallet size={40} className="text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-900">Budget not found</p>
        <Link to="/budgets" className="mt-2 text-sm text-blue-600 hover:underline">Back to budgets</Link>
      </div>
    );
  }

  const utilizationPct = Number(budget.totalBudget) > 0
    ? ((Number(budget.committed) / Number(budget.totalBudget)) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/budgets" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{budget.name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{budget.code} - {budget.type} - {budget.year}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Budget</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">${Number(budget.totalBudget).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Committed</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">${Number(budget.committed).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Available</p>
          <p className="mt-1 text-2xl font-bold text-green-600">${Number(budget.available).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Utilization</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{utilizationPct}%</p>
          <div className="mt-2 h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${Math.min(parseFloat(utilizationPct), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {budget.customer && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
          <p className="mt-1 text-sm text-gray-600">{budget.customer.name} ({budget.customer.channel})</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Linked Promotions</h2>
        </div>
        {budget.promotions && budget.promotions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {budget.promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      <Link to={`/promotions/${promo.id}`}>{promo.code}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{promo.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={promo.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">${Number(promo.budget).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-gray-500">No promotions linked to this budget yet.</div>
        )}
      </div>

      {budget.transactions && budget.transactions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {budget.transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{txn.type}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">${Number(txn.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{txn.description ?? '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(txn.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PLANNED: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-indigo-100 text-indigo-700',
    EXECUTING: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
