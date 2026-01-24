import { Target } from 'lucide-react';

interface TargetData {
  id: string;
  name: string;
  metric: string;
  target: number;
  actual: number;
  unit: string;
}

const mockTargets: TargetData[] = [
  { id: '1', name: 'Q1 Revenue', metric: 'Revenue', target: 5000000, actual: 4200000, unit: '$' },
  { id: '2', name: 'Q1 Volume', metric: 'Volume', target: 120000, actual: 98000, unit: 'units' },
  { id: '3', name: 'Q1 Active Promotions', metric: 'Promotions', target: 50, actual: 42, unit: '' },
  { id: '4', name: 'Q1 Claims Settlement Rate', metric: 'Settlement', target: 95, actual: 88, unit: '%' },
  { id: '5', name: 'Q1 Trade Spend Ratio', metric: 'Spend Ratio', target: 15, actual: 12.5, unit: '%' },
  { id: '6', name: 'Q1 ROI', metric: 'ROI', target: 3.5, actual: 3.2, unit: 'x' },
];

export default function Targets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Targets</h1>
          <p className="mt-1 text-sm text-gray-500">Track performance against quarterly and annual targets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {mockTargets.map((t) => {
          const pct = t.target > 0 ? (t.actual / t.target) * 100 : 0;
          const isOnTrack = pct >= 80;
          return (
            <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{t.metric}</p>
                </div>
                <div className={`rounded-lg p-2 ${isOnTrack ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <Target size={18} className={isOnTrack ? 'text-green-600' : 'text-orange-600'} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {t.unit === '$' ? `$${t.actual.toLocaleString()}` : `${t.actual.toLocaleString()}${t.unit}`}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {t.unit === '$' ? `$${t.target.toLocaleString()}` : `${t.target.toLocaleString()}${t.unit}`}
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isOnTrack ? 'text-green-600' : 'text-orange-600'}>
                      {pct.toFixed(1)}% achieved
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all ${isOnTrack ? 'bg-green-500' : 'bg-orange-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
