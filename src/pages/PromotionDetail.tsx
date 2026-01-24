import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { usePromotion } from '@/hooks/usePromotions';

const statusColorMap: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PLANNED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  EXECUTING: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function PromotionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = usePromotion(id);

  const promotion = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Megaphone size={40} className="text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-900">Promotion not found</p>
        <Link to="/promotions" className="mt-2 text-sm text-blue-600 hover:underline">Back to promotions</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/promotions" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{promotion.name}</h1>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorMap[promotion.status] || 'bg-gray-100 text-gray-700'}`}>
              {promotion.status}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{promotion.code}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Budget</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">${Number(promotion.budget).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Actual Spend</p>
          <p className="mt-1 text-2xl font-bold text-orange-600">
            ${promotion.actualSpend ? Number(promotion.actualSpend).toLocaleString() : '0'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Start Date</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{new Date(promotion.startDate).toLocaleDateString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">End Date</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{new Date(promotion.endDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Details</h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Customer</dt>
              <dd className="text-sm font-medium text-gray-900">{promotion.customer?.name ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Channel</dt>
              <dd className="text-sm font-medium text-gray-900">{promotion.customer?.channel ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Fund</dt>
              <dd className="text-sm font-medium text-gray-900">
                {promotion.fund ? (
                  <Link to={`/budgets/${promotion.fund.id}`} className="text-blue-600 hover:underline">
                    {promotion.fund.name}
                  </Link>
                ) : '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Created By</dt>
              <dd className="text-sm font-medium text-gray-900">{promotion.createdBy?.name ?? '-'}</dd>
            </div>
            {promotion.description && (
              <div className="pt-2">
                <dt className="text-sm text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{promotion.description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
          <div className="mt-4">
            <div className="relative">
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${getProgressPercent(promotion.startDate, promotion.endDate)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>{new Date(promotion.startDate).toLocaleDateString()}</span>
                <span>{new Date(promotion.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {promotion.tactics && promotion.tactics.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Tactics ({promotion.tactics.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {promotion.tactics.map((tactic) => (
              <div key={tactic.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tactic.type}</p>
                    {tactic.mechanic && <p className="mt-0.5 text-xs text-gray-500">{tactic.mechanic}</p>}
                  </div>
                  <p className="text-sm font-medium text-gray-900">${Number(tactic.budget).toLocaleString()}</p>
                </div>
                {tactic.items.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tactic.items.map((item) => (
                      <span key={item.id} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {item.product.name} ({item.product.sku})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {promotion.claims && promotion.claims.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Claims ({promotion.claims.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Code</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promotion.claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{claim.code}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">${Number(claim.amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(claim.claimDate).toLocaleDateString()}</td>
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

function getProgressPercent(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  return Math.round(((now - start) / (end - start)) * 100);
}
