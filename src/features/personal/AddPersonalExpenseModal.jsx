import React, { useState } from 'react';
import { X, Plus, Calendar, FileText, IndianRupee } from 'lucide-react';
import { PERSONAL_CATEGORIES } from './categories';
import { rupeesToPaise } from '../../lib/currencyFormatters';

export function AddPersonalExpenseModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [rupees, setRupees] = useState('');
  const [category, setCategory] = useState('food');
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a title for this expense.');
      return;
    }

    const numAmount = parseFloat(rupees);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid positive amount.');
      return;
    }

    const amountPaise = rupeesToPaise(numAmount);

    try {
      setSubmitting(true);
      await onSave({
        title: title.trim(),
        amountPaise,
        category,
        expenseDate,
        note: note.trim(),
      });

      // Reset
      setTitle('');
      setRupees('');
      setCategory('food');
      setNote('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save personal expense.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm max-h-[92vh] flex flex-col bg-surface-container-lowest rounded-3xl p-5 shadow-2xl border border-surface-container-high text-on-surface overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
            <h2 className="text-base font-bold font-headline">Add Personal Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-error-container text-on-error-container text-xs font-medium flex-shrink-0">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-0.5">
          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Amount Spent
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
                placeholder="0.00"
                value={rupees}
                onChange={e => setRupees(e.target.value)}
                className="w-full h-12 pl-9 pr-4 rounded-2xl bg-surface-container-low border border-surface-container text-xl font-bold font-headline text-on-surface outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Description / Title
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy Lunch, Metro Card, Shoes"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface outline-none focus:border-secondary transition-colors"
            />
          </div>

          {/* Category Selection Grid */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PERSONAL_CATEGORIES.map(cat => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all text-center ${
                      isSelected
                        ? 'border-secondary bg-secondary-container/20 text-secondary font-bold shadow-xs'
                        : 'border-surface-container bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[10px] truncate max-w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
              Note (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-outline absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Add any extra detail..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{submitting ? 'Adding...' : 'Save Personal Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
