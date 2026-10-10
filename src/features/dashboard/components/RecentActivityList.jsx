import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ExpenseCard } from '../../expenses/ExpenseCard';

export function RecentActivityList({ expenses = [], members = [], currentUserId, onViewAll, onDeleteExpense }) {
  const recent = expenses.slice(0, 4);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-on-surface font-headline">Recent Expenses</h2>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-secondary flex items-center gap-1 hover:underline"
        >
          <span>View All ({expenses.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {recent.map(exp => (
          <ExpenseCard
            key={exp.id}
            expense={exp}
            members={members}
            currentUserId={currentUserId}
            onDelete={onDeleteExpense}
          />
        ))}
      </div>
    </div>
  );
}
