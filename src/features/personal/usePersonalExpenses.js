import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  getCurrentYearMonth,
  getPreviousMonth,
  getNextMonth,
} from '../../lib/dateUtils';
import { getCategoryById } from './categories';
import {
  saveToLocalCache,
  getFromLocalCache,
} from '../offline/services/idbStorage';

export function usePersonalExpenses(userId) {
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [monthlyBudgets, setMonthlyBudgets] = useState({});
  const [loading, setLoading] = useState(false);

  // 1. Load from cache and Supabase
  const loadPersonalData = useCallback(async () => {
    // Attempt cache first for instant render
    try {
      const cachedExpenses = await getFromLocalCache('personal_expenses');
      if (cachedExpenses && Array.isArray(cachedExpenses) && cachedExpenses.length > 0) {
        setExpenses(cachedExpenses);
      }
      const cachedBudgets = await getFromLocalCache('personal_budgets');
      if (cachedBudgets && Array.isArray(cachedBudgets)) {
        const budgetMap = {};
        cachedBudgets.forEach(b => {
          budgetMap[b.month_key] = Number(b.budget_paise) || 0;
        });
        setMonthlyBudgets(budgetMap);
      }
    } catch {
      // Local cache fallback
    }

    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch expenses
      const { data: expData, error: expErr } = await supabase
        .from('personal_expenses')
        .select('*')
        .eq('user_id', userId)
        .order('expense_date', { ascending: false });

      if (!expErr && expData) {
        setExpenses(expData);
        await saveToLocalCache('personal_expenses', expData);
      }

      // Fetch budgets
      const { data: bData, error: bErr } = await supabase
        .from('personal_budgets')
        .select('*')
        .eq('user_id', userId);

      if (!bErr && bData) {
        const bMap = {};
        bData.forEach(b => {
          bMap[b.month_key] = Number(b.budget_paise) || 0;
        });
        setMonthlyBudgets(bMap);
        await saveToLocalCache('personal_budgets', bData);
      }
    } catch (err) {
      console.warn('Could not load personal expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPersonalData();
  }, [loadPersonalData]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`personal_expenses_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'personal_expenses', filter: `user_id=eq.${userId}` },
        () => {
          loadPersonalData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'personal_budgets', filter: `user_id=eq.${userId}` },
        () => {
          loadPersonalData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadPersonalData]);

  // Filter expenses for selected month (YYYY-MM)
  const monthExpenses = useMemo(() => {
    return expenses.filter(exp => (exp.expense_date || '').startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Sum of total personal spending in selected month
  const monthTotalPaise = useMemo(() => {
    return monthExpenses.reduce((acc, curr) => acc + (Number(curr.amount_paise) || 0), 0);
  }, [monthExpenses]);

  // Monthly budget
  const monthBudgetPaise = useMemo(() => {
    return monthlyBudgets[selectedMonth] || monthlyBudgets['default'] || 0;
  }, [monthlyBudgets, selectedMonth]);

  const budgetRemainingPaise = useMemo(() => {
    if (!monthBudgetPaise) return null;
    return monthBudgetPaise - monthTotalPaise;
  }, [monthBudgetPaise, monthTotalPaise]);

  const budgetPercentUsed = useMemo(() => {
    if (!monthBudgetPaise || monthBudgetPaise === 0) return 0;
    return Math.round((monthTotalPaise / monthBudgetPaise) * 100);
  }, [monthBudgetPaise, monthTotalPaise]);

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    if (monthExpenses.length === 0 || monthTotalPaise === 0) return [];

    const categoryMap = {};
    monthExpenses.forEach(exp => {
      const catId = exp.category || 'other';
      categoryMap[catId] = (categoryMap[catId] || 0) + (Number(exp.amount_paise) || 0);
    });

    return Object.entries(categoryMap)
      .map(([catId, totalPaise]) => {
        const category = getCategoryById(catId);
        const percent = Math.round((totalPaise / monthTotalPaise) * 100);
        return {
          category,
          totalPaise,
          percent,
        };
      })
      .sort((a, b) => b.totalPaise - a.totalPaise);
  }, [monthExpenses, monthTotalPaise]);

  // Add new personal expense
  async function addPersonalExpense({ title, amountPaise, category = 'other', expenseDate, note = '' }) {
    const payload = {
      id: crypto.randomUUID(),
      user_id: userId || 'local_guest',
      title: title.trim(),
      amount_paise: Number(amountPaise),
      category,
      expense_date: expenseDate || new Date().toISOString().split('T')[0],
      note: note.trim() || null,
      created_at: new Date().toISOString(),
    };

    // Optimistic local update
    setExpenses(prev => [payload, ...prev]);
    await saveToLocalCache('personal_expenses', payload);

    if (userId) {
      const { data, error } = await supabase
        .from('personal_expenses')
        .insert({
          id: payload.id,
          user_id: userId,
          title: payload.title,
          amount_paise: payload.amount_paise,
          category: payload.category,
          expense_date: payload.expense_date,
          note: payload.note,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to sync personal expense to Supabase:', error);
      } else if (data) {
        setExpenses(prev => prev.map(p => (p.id === payload.id ? data : p)));
      }
    }
  }

  // Delete personal expense
  async function deletePersonalExpense(id) {
    setExpenses(prev => prev.filter(e => e.id !== id));

    if (userId) {
      await supabase.from('personal_expenses').delete().eq('id', id);
    }
  }

  // Set or update budget for selected month
  async function setMonthlyBudget(budgetPaise) {
    const numBudget = Number(budgetPaise) || 0;
    setMonthlyBudgets(prev => ({
      ...prev,
      [selectedMonth]: numBudget,
    }));

    if (userId) {
      await supabase.from('personal_budgets').upsert(
        {
          user_id: userId,
          month_key: selectedMonth,
          budget_paise: numBudget,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,month_key' }
      );
    }
  }

  // Month navigation
  function goToPreviousMonth() {
    setSelectedMonth(prev => getPreviousMonth(prev));
  }

  function goToNextMonth() {
    setSelectedMonth(prev => getNextMonth(prev));
  }

  function resetToCurrentMonth() {
    setSelectedMonth(getCurrentYearMonth());
  }

  return {
    expenses,
    monthExpenses,
    selectedMonth,
    setSelectedMonth,
    monthTotalPaise,
    monthBudgetPaise,
    budgetRemainingPaise,
    budgetPercentUsed,
    categoryBreakdown,
    loading,
    addPersonalExpense,
    deletePersonalExpense,
    setMonthlyBudget,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
    refreshPersonalData: loadPersonalData,
  };
}
