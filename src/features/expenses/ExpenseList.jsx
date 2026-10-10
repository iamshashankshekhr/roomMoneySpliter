import React, { useState } from 'react';
import { ExpenseCard } from './ExpenseCard';
import { Search, Plus, Receipt } from 'lucide-react';
import { CATEGORIES } from '../../lib/formatters';

export function ExpenseList({ expenses = [], members = [], currentUserId, onAddClick, onDeleteExpense }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
    const matchesSearch = !searchQuery || exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Search & Filter Header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface focus:outline-none focus:border-secondary focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-outline absolute left-3 top-3" />
        </div>

        <button
          onClick={onAddClick}
          className="h-10 px-3.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filterCategory === 'all'
              ? 'bg-secondary text-on-secondary shadow-xs'
              : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
          }`}
        >
          All ({expenses.length})
        </button>
        {Object.values(CATEGORIES).map(cat => {
          const count = expenses.filter(e => e.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {cat.label} {count > 0 ? `(${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Expense List Cards */}
      <div className="flex flex-col gap-2 mt-1">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-surface-container flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-outline mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-on-surface">No expenses found</h4>
            <p className="text-xs text-on-surface-variant max-w-xs mt-1 mb-4">
              {searchQuery || filterCategory !== 'all'
                ? 'Try clearing the search query or category filter.'
                : 'Log shared groceries, Wi-Fi bills, water cans, or rent to see balances.'}
            </p>
            <button
              onClick={onAddClick}
              className="px-4 py-2 bg-secondary text-on-secondary text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Expense</span>
            </button>
          </div>
        ) : (
          filteredExpenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              members={members}
              currentUserId={currentUserId}
              onDelete={onDeleteExpense}
            />
          ))
        )}
      </div>
    </div>
  );
}
