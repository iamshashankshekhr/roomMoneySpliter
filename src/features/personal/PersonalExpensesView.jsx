import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ChevronLeft,
  ChevronRight,
  Target,
  Trash2,
  Calendar,
  Sparkles,
  AlertTriangle,
  Receipt,
  PieChart,
} from 'lucide-react';
import { formatINR, formatCompactINR } from '../../lib/currencyFormatters';
import { getMonthLabel, getCurrentYearMonth, formatDateDisplay } from '../../lib/dateUtils';
import { getCategoryById } from './categories';
import { AddPersonalExpenseModal } from './AddPersonalExpenseModal';
import { SetBudgetModal } from './SetBudgetModal';

export function PersonalExpensesView({
  personalExpensesHook,
  onOpenAddModal,
}) {
  const {
    monthExpenses,
    selectedMonth,
    monthTotalPaise,
    monthBudgetPaise,
    budgetRemainingPaise,
    budgetPercentUsed,
    categoryBreakdown,
    addPersonalExpense,
    deletePersonalExpense,
    setMonthlyBudget,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
  } = personalExpensesHook;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const monthLabel = getMonthLabel(selectedMonth);
  const isCurrentMonth = selectedMonth === getCurrentYearMonth();
  const hasBudget = monthBudgetPaise > 0;
  const isOverBudget = hasBudget && budgetRemainingPaise < 0;

  async function handleDelete(id) {
    if (window.confirm('Delete this personal expense?')) {
      setDeletingId(id);
      try {
        await deletePersonalExpense(id);
      } finally {
        setDeletingId(null);
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-16">
      {/* 1. Month Navigator Bar */}
      <div className="flex items-center justify-between p-2 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
        <button
          onClick={goToPreviousMonth}
          className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-all active:scale-95"
          title="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-secondary" />
            <span className="text-sm font-bold font-headline text-on-surface">
              {monthLabel}
            </span>
          </div>
          {!isCurrentMonth && (
            <button
              onClick={resetToCurrentMonth}
              className="text-[10px] text-secondary font-semibold hover:underline mt-0.5"
            >
              Back to Current Month
            </button>
          )}
        </div>

        <button
          onClick={goToNextMonth}
          className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-all active:scale-95"
          title="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Monthly Spend Hero Card */}
      <div className="relative overflow-hidden bg-primary-container rounded-3xl p-5 text-white shadow-md">
        {/* Glow ambient background */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-secondary/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col">
          {/* Header Tag */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-inverse-primary flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-teal-300" />
              <span>Personal Monthly Spend</span>
            </span>

            <button
              type="button"
              onClick={() => setIsBudgetOpen(true)}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
            >
              <Target className="w-3 h-3 text-teal-300" />
              <span>{hasBudget ? 'Edit Target' : 'Set Budget'}</span>
            </button>
          </div>

          {/* Big Amount */}
          <div className="my-1.5">
            <span className="text-3xl font-bold font-headline tracking-tight text-white tabular-nums">
              {formatINR(monthTotalPaise)}
            </span>
          </div>

          <p className="text-xs text-inverse-primary/80 mb-3">
            {monthExpenses.length} {monthExpenses.length === 1 ? 'expense' : 'expenses'} recorded in {monthLabel}
          </p>

          {/* Budget Progress Bar */}
          {hasBudget ? (
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-inverse-primary font-medium">
                  {isOverBudget ? (
                    <span className="text-rose-300 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Over budget by {formatINR(Math.abs(budgetRemainingPaise))}</span>
                    </span>
                  ) : (
                    <span>
                      <strong className="text-white font-bold">{formatINR(budgetRemainingPaise)}</strong> remaining
                    </span>
                  )}
                </span>
                <span className="text-inverse-primary/80 text-[11px] font-semibold">
                  {budgetPercentUsed}% of {formatCompactINR(monthBudgetPaise)}
                </span>
              </div>

              {/* Progress bar line */}
              <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget
                      ? 'bg-rose-400'
                      : budgetPercentUsed > 85
                      ? 'bg-amber-400'
                      : 'bg-teal-400'
                  }`}
                  style={{ width: `${Math.min(budgetPercentUsed, 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-inverse-primary/80">No spending target set for this month</span>
              <button
                type="button"
                onClick={() => setIsBudgetOpen(true)}
                className="text-xs text-teal-300 font-bold hover:underline"
              >
                + Set Budget Target
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Action Button: Add Personal Expense */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="w-full h-12 bg-secondary hover:bg-secondary-container text-on-secondary rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-md transition-all active:scale-95"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Add Personal Expense</span>
      </button>

      {/* 4. Category Breakdown Section */}
      {categoryBreakdown.length > 0 && (
        <section className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-secondary" />
              <h3 className="text-xs font-bold font-headline text-on-surface">
                Spending by Category
              </h3>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          <div className="space-y-2.5">
            {categoryBreakdown.map(({ category, totalPaise, percent }) => {
              const IconComponent = category.icon;

              return (
                <div key={category.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg ${category.bgColor} ${category.textColor} flex items-center justify-center flex-shrink-0`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-on-surface">{category.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-on-surface-variant text-[11px] font-medium tabular-nums">
                        {percent}%
                      </span>
                      <span className="font-bold text-on-surface tabular-nums">
                        {formatINR(totalPaise)}
                      </span>
                    </div>
                  </div>

                  {/* Category progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full ${category.barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Personal Expenses Ledger */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-headline text-on-surface">
            {monthLabel} Ledger
          </h3>
          <span className="text-xs text-on-surface-variant font-medium">
            {monthExpenses.length} Records
          </span>
        </div>

        {monthExpenses.length === 0 ? (
          <div className="p-8 bg-surface-container-lowest rounded-2xl border border-surface-container text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-outline mb-2">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-on-surface">No Personal Expenses</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
              You haven't recorded any personal expenses for {monthLabel} yet.
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-3 px-4 py-2 bg-secondary text-on-secondary rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Expense</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {monthExpenses.map(exp => {
              const cat = getCategoryById(exp.category);
              const IconComponent = cat.icon;

              return (
                <div
                  key={exp.id}
                  className="p-3 bg-surface-container-lowest rounded-2xl border border-surface-container flex items-center justify-between gap-3 shadow-xs hover:border-surface-container-high transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-2xl ${cat.bgColor} ${cat.textColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-on-surface truncate">
                        {exp.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant mt-0.5">
                        <span className="font-semibold text-secondary">{cat.label}</span>
                        <span>•</span>
                        <span>{formatDateDisplay(exp.expense_date)}</span>
                        {exp.note && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px] italic">{exp.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold font-headline text-on-surface tabular-nums">
                      {formatINR(exp.amount_paise)}
                    </span>

                    <button
                      type="button"
                      disabled={deletingId === exp.id}
                      onClick={() => handleDelete(exp.id)}
                      className="p-1.5 text-outline hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Personal Expense Modal */}
      <AddPersonalExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={addPersonalExpense}
      />

      {/* Set Budget Modal */}
      <SetBudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        selectedMonth={selectedMonth}
        currentBudgetPaise={monthBudgetPaise}
        onSave={setMonthlyBudget}
      />
    </div>
  );
}
