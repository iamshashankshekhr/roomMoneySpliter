import React, { useState, useEffect } from 'react';
import { X, Check, Target, IndianRupee } from 'lucide-react';
import { getMonthLabel } from '../../lib/dateUtils';
import { rupeesToPaise, paiseToRupees } from '../../lib/currencyFormatters';

export function SetBudgetModal({ isOpen, onClose, selectedMonth, currentBudgetPaise, onSave }) {
  const [budgetRupees, setBudgetRupees] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (currentBudgetPaise > 0) {
        setBudgetRupees(String(paiseToRupees(currentBudgetPaise)));
      } else {
        setBudgetRupees('');
      }
    }
  }, [isOpen, currentBudgetPaise]);

  if (!isOpen) return null;

  const monthLabel = getMonthLabel(selectedMonth);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    const numRupees = parseFloat(budgetRupees);
    if (isNaN(numRupees) || numRupees < 0) {
      setErrorMsg('Please enter a valid amount (e.g. 15000)');
      return;
    }

    const budgetPaise = rupeesToPaise(numRupees);

    try {
      setSubmitting(true);
      await onSave(budgetPaise);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Could not update budget.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-5 shadow-2xl border border-surface-container-high text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-secondary" />
            <h2 className="text-base font-bold font-headline">Set Monthly Budget</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-error-container text-on-error-container text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <p className="text-xs text-on-surface-variant mb-2">
              Set a spending target for <strong>{monthLabel}</strong>. RoomSplit will track your remaining balance and alert you if you're approaching your limit.
            </p>

            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Monthly Budget (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-lg">
                ₹
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                placeholder="20000"
                value={budgetRupees}
                onChange={e => setBudgetRupees(e.target.value)}
                className="w-full h-12 pl-9 pr-4 rounded-2xl bg-surface-container-low border border-surface-container text-xl font-bold font-headline text-on-surface outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
            <span>Quick amounts:</span>
            {[10000, 15000, 20000, 30000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setBudgetRupees(String(amt))}
                className="px-2 py-0.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-[10px] font-semibold transition-colors"
              >
                ₹{amt / 1000}k
              </button>
            ))}
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 h-11 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Set Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
