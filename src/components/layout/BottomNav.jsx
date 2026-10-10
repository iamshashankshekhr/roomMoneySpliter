import React from 'react';
import { Home, Receipt, Plus, ArrowRightLeft, Users } from 'lucide-react';

export function BottomNav({ activeTab, onSelectTab, onOpenAdd }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'add', label: 'Add', isAction: true },
    { id: 'settlements', label: 'Balances', icon: ArrowRightLeft },
    { id: 'members', label: 'Room', icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-container pb-safe">
      <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-around">
        {tabs.map(tab => {
          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={onOpenAdd}
                className="w-12 h-12 -mt-5 rounded-2xl bg-secondary hover:bg-secondary-container text-on-secondary flex items-center justify-center shadow-lg active:scale-95 transition-all"
                title="Add Expense"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 transition-colors ${
                isActive ? 'text-secondary font-bold' : 'text-outline hover:text-on-surface'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
