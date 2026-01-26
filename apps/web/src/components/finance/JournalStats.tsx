/**
 * Journal Stats Component
 */

import { StatCard } from './FinanceStats';
import { FileEdit, CheckCircle, RotateCcw, DollarSign } from 'lucide-react';

interface JournalStatsProps {
  summary: {
    totalDraft: number;
    totalPosted: number;
    totalReversed: number;
    draftAmount: number;
    postedAmount: number;
  };
}

export function JournalStats({ summary }: JournalStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Draft Journals"
        value={summary.draftAmount}
        subValue={`${summary.totalDraft} pending`}
        icon={<FileEdit className="h-4 w-4" />}
        variant="warning"
      />
      <StatCard
        title="Posted"
        value={summary.postedAmount}
        subValue={`${summary.totalPosted} journals`}
        icon={<CheckCircle className="h-4 w-4" />}
        variant="success"
      />
      <StatCard
        title="Reversed"
        value={summary.totalReversed}
        subValue="Reversed entries"
        icon={<RotateCcw className="h-4 w-4" />}
        variant="destructive"
      />
      <StatCard
        title="Total Posted Value"
        value={summary.postedAmount}
        subValue="GL impact"
        icon={<DollarSign className="h-4 w-4" />}
      />
    </div>
  );
}

export default JournalStats;
