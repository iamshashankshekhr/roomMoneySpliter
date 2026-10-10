import React from 'react';
import { Trash2, ShoppingCart, Zap, Sparkles, UtensilsCrossed, Wrench, Film } from 'lucide-react';
import { formatINR, formatRelativeTime, getCategoryMeta } from '../../lib/formatters';

const CATEGORY_ICONS = {
  groceries: ShoppingCart,
  utilities: Zap,
  household: Sparkles,
  dining: UtensilsCrossed,
  maintenance: Wrench,
  entertainment: Film,
};

export function ExpenseCard({ expense, members = [], currentUserId, onDelete }) {
  const payer = members.find(m => m.id === expense.paid_by_member_id);
  const isMyPayment = payer?.user_id === currentUserId;
  const meta = getCategoryMeta(expense.category);
  const IconComponent = CATEGORY_ICONS[expense.category] || ShoppingCart;

  return (
    <div className="flex items-center justify-between p-3.5 bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container hover:border-outline-variant/60 transition-all group">
      {/* 3-zone item layout matching Stitch design */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Left: Category Icon Tile */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* Center: Title & Metadata */}
        <div className="flex flex-col min-w-0">
          <h3 className="font-bold text-sm text-on-surface truncate">
            {expense.title}
          </h3>
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
            <span>Paid by <strong className="font-semibold text-on-surface">{payer?.display_name || 'Roommate'}</strong> {isMyPayment ? '(You)' : ''}</span>
            <span className="text-outline-variant">•</span>
            <span>{formatRelativeTime(expense.created_at || expense.expense_date)}</span>
          </p>
        </div>
      </div>

      {/* Right: Amount & Delete affordance */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <div className="text-right">
          <span className="font-bold text-sm text-on-surface tabular-nums">
            {formatINR(expense.amount_paise)}
          </span>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
            {meta.label}
          </p>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(expense.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container/40 transition-colors opacity-70 group-hover:opacity-100"
            title="Delete Expense"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
