import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarPromotions } from '@/hooks/usePromotions';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const statusColorMap: Record<string, string> = {
  DRAFT: 'bg-gray-300',
  PLANNED: 'bg-blue-400',
  CONFIRMED: 'bg-indigo-400',
  EXECUTING: 'bg-green-400',
  COMPLETED: 'bg-emerald-400',
  CANCELLED: 'bg-red-300',
};

export default function Calendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useCalendarPromotions(year);

  const promotions = data?.data ?? [];

  const yearStart = new Date(year, 0, 1).getTime();
  const yearEnd = new Date(year, 11, 31).getTime();
  const yearDays = (yearEnd - yearStart) / (24 * 60 * 60 * 1000);

  function getBarStyle(startDate: string, endDate: string) {
    const start = Math.max(new Date(startDate).getTime(), yearStart);
    const end = Math.min(new Date(endDate).getTime(), yearEnd);

    const leftPct = ((start - yearStart) / (yearDays * 24 * 60 * 60 * 1000)) * 100;
    const widthPct = ((end - start) / (yearDays * 24 * 60 * 60 * 1000)) * 100;

    return {
      left: `${Math.max(0, leftPct)}%`,
      width: `${Math.max(1, Math.min(100 - leftPct, widthPct))}%`,
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Promotion Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">Gantt view of promotion timelines</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold text-gray-900">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(statusColorMap).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded ${color}`} />
            <span className="text-xs text-gray-600">{status}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-gray-900">No promotions in {year}</p>
            <p className="mt-1 text-sm text-gray-500">Create promotions to see them on the calendar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Month headers */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                <div className="w-48 shrink-0 px-4 py-2 text-xs font-medium uppercase text-gray-500">Promotion</div>
                <div className="flex flex-1">
                  {MONTHS.map((m) => (
                    <div key={m} className="flex-1 border-l border-gray-200 px-1 py-2 text-center text-xs font-medium text-gray-500">
                      {m}
                    </div>
                  ))}
                </div>
              </div>

              {/* Promotion rows */}
              <div className="divide-y divide-gray-100">
                {promotions.map((promo) => (
                  <div key={promo.id} className="flex items-center hover:bg-gray-50">
                    <div className="w-48 shrink-0 px-4 py-3">
                      <Link to={`/promotions/${promo.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {promo.code}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{promo.customer?.name}</p>
                    </div>
                    <div className="relative flex-1 py-3" style={{ height: '40px' }}>
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-5 rounded ${statusColorMap[promo.status] || 'bg-gray-300'}`}
                        style={getBarStyle(promo.startDate, promo.endDate)}
                        title={`${promo.name}: ${new Date(promo.startDate).toLocaleDateString()} - ${new Date(promo.endDate).toLocaleDateString()}`}
                      >
                        <span className="truncate px-1.5 text-xs font-medium leading-5 text-white">
                          {promo.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
