import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, ShoppingCart, Zap, Sparkles, UtensilsCrossed, Wrench, Film } from 'lucide-react';
import { rupeesToPaise, formatINR, paiseToRupees } from '../../lib/formatters';

const TEMPLATES = [
  { label: 'Groceries', title: 'Groceries & Supplies', category: 'groceries' },
  { label: 'Wi-Fi', title: 'Monthly Wi-Fi Bill', category: 'utilities' },
  { label: 'Electricity', title: 'Electricity Bill', category: 'utilities' },
  { label: 'Water Cans', title: 'Water Cans (20L)', category: 'household' },
  { label: 'Maid/Cook', title: 'Maid & Cook Salary', category: 'maintenance' },
  { label: 'Rent', title: 'Flat Monthly Rent', category: 'household' },
];

const CATEGORIES = [
  { id: 'groceries', label: 'Groceries', icon: ShoppingCart },
  { id: 'utilities', label: 'Utilities', icon: Zap },
  { id: 'household', label: 'Household', icon: Sparkles },
  { id: 'dining', label: 'Dining', icon: UtensilsCrossed },
  { id: 'maintenance', label: 'Maintain', icon: Wrench },
  { id: 'entertainment', label: 'Leisure', icon: Film },
];

export function AddExpenseModal({ isOpen, onClose, members = [], currentUserId, onSave }) {
  const [amountRupees, setAmountRupees] = useState('1840.00');
  const [title, setTitle] = useState('Groceries & Supplies');
  const [category, setCategory] = useState('groceries');
  const [paidBy, setPaidBy] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default payer to current user or first member
  useEffect(() => {
    if (members.length > 0) {
      const defaultPayer = members.find(m => m.user_id === currentUserId) || members[0];
      setPaidBy(defaultPayer.id);
      setSelectedParticipants(members.map(m => m.id));
    }
  }, [members, currentUserId, isOpen]);

  if (!isOpen) return null;

  const totalPaise = rupeesToPaise(amountRupees);
  const participantCount = selectedParticipants.length;
  const sharePerPersonPaise = participantCount > 0 ? Math.floor(totalPaise / participantCount) : 0;

  function toggleParticipant(memberId) {
    if (selectedParticipants.includes(memberId)) {
      if (selectedParticipants.length <= 1) return; // Prevent empty participant list
      setSelectedParticipants(prev => prev.filter(id => id !== memberId));
    } else {
      setSelectedParticipants(prev => [...prev, memberId]);
    }
  }

  function handleSelectTemplate(tpl) {
    setTitle(tpl.title);
    setCategory(tpl.category);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (totalPaise <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide an expense description.');
      return;
    }
    if (!paidBy) {
      setError('Please select who paid.');
      return;
    }
    if (selectedParticipants.length === 0) {
      setError('Please select at least one participant.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title,
        amountPaise: totalPaise,
        paidByMemberId: paidBy,
        category,
        participantIds: selectedParticipants,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record expense.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-primary-container/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-surface-container-high max-h-[90vh] overflow-y-auto no-scrollbar text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <h2 className="text-lg font-bold font-headline">Add New Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Big Amount Bento Card */}
          <div className="bg-surface-container-lowest border border-surface-container rounded-2xl p-5 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
              Total Amount
            </span>
            <div className="relative flex items-center justify-center w-full">
              <span className="text-3xl font-bold font-headline text-outline mr-1">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amountRupees}
                onChange={e => setAmountRupees(e.target.value)}
                className="w-48 text-3xl font-bold font-headline text-on-surface text-center bg-transparent focus:outline-none tabular-nums"
                placeholder="0.00"
              />
            </div>
            {/* Paise Precision Guarantee Indicator */}
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-[11px] text-on-surface font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Exact integer paise: <strong className="tabular-nums font-mono">{totalPaise} paise</strong></span>
            </div>
          </div>

          {/* Description & Templates */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Expense Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Wi-Fi bill, Milk run, Groceries"
              className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-sm outline-none transition-all font-medium"
            />

            {/* Quick Templates */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              {TEMPLATES.map(tpl => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-secondary-fixed text-on-surface text-xs font-medium whitespace-nowrap transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-secondary text-on-secondary shadow-md scale-[1.02]'
                        : 'bg-surface-container-lowest border border-surface-container text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-surface-container'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid By Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
              Who Paid?
            </label>
            <select
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:bg-white text-sm font-semibold outline-none transition-all"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.display_name} {m.user_id === currentUserId ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Participant Split Exclusion / Inclusion */}
          <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-container">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Split Equally With
              </span>
              <span className="text-xs font-bold text-secondary tabular-nums">
                {participantCount > 0 ? `${formatINR(sharePerPersonPaise)} / person` : '0'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {members.map(m => {
                const isSelected = selectedParticipants.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleParticipant(m.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white border-secondary/40 text-on-surface shadow-xs'
                        : 'bg-surface-container-high/40 border-transparent text-outline opacity-70'
                    }`}
                  >
                    <span className="text-xs font-medium truncate max-w-[100px]">
                      {m.display_name}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                        isSelected ? 'bg-secondary text-white' : 'border border-outline'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Recording...' : `Save Expense · ${formatINR(totalPaise)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
