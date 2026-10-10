import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { calculateEqualSplits, validateSplitIntegrity } from './splitMath';
import { queueExpenseCreation, cacheRoomData, getCachedRoomData } from '../offline/idbOutbox';

export function useExpenses(roomId, members = [], isOnline = true) {
  const [expenses, setExpenses] = useState([]);
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch expenses for room
      const { data: expData, error: expErr } = await supabase
        .from('expenses')
        .select('*')
        .eq('room_id', roomId)
        .is('deleted_at', null)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (expErr) throw expErr;

      // 2. Fetch splits for those expenses
      const expenseIds = (expData || []).map(e => e.id);
      let splitData = [];

      if (expenseIds.length > 0) {
        const { data: spData, error: spErr } = await supabase
          .from('expense_splits')
          .select('*')
          .in('expense_id', expenseIds);

        if (!spErr && spData) {
          splitData = spData;
        }
      }

      setExpenses(expData || []);
      setSplits(splitData || []);

      // Update local IndexedDB cache
      await cacheRoomData({
        room: { id: roomId },
        expenses: expData || [],
        splits: splitData || [],
      });
    } catch (err) {
      console.warn('Network fetch expenses failed, loading from IndexedDB:', err);
      const cached = await getCachedRoomData(roomId);
      if (cached?.expenses?.length) setExpenses(cached.expenses);
      if (cached?.splits?.length) setSplits(cached.splits);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Realtime subscription for expenses and splits
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room_expenses_${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `room_id=eq.${roomId}` },
        () => {
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, loadExpenses]);

  /**
   * Add a new expense with integer paise validation and equal splits
   */
  async function addExpense({
    title,
    amountPaise,
    paidByMemberId,
    category = 'groceries',
    participantIds = [],
    expenseDate = new Date().toISOString().split('T')[0],
  }) {
    if (!roomId) throw new Error('No active room selected.');
    if (!amountPaise || amountPaise <= 0) throw new Error('Amount must be greater than zero.');
    if (!participantIds.length) throw new Error('At least one participant must share the expense.');

    // 1. Calculate equal integer paise splits
    const splitMap = calculateEqualSplits(amountPaise, participantIds);
    const splitPayloads = Object.entries(splitMap).map(([memberId, sharePaise]) => ({
      member_id: memberId,
      amount_paise: sharePaise,
    }));

    // Invariant check
    const validation = validateSplitIntegrity(amountPaise, splitPayloads);
    if (!validation.valid) {
      throw new Error(`Split math error: discrepancy of ${validation.discrepancy} paise.`);
    }

    const expenseId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const expenseRecord = {
      id: expenseId,
      room_id: roomId,
      title: title.trim(),
      amount_paise: amountPaise,
      paid_by_member_id: paidByMemberId,
      category,
      expense_date: expenseDate,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const splitsWithExpenseId = splitPayloads.map(sp => ({
      id: `sp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      expense_id: expenseId,
      member_id: sp.member_id,
      amount_paise: sp.amount_paise,
    }));

    // If offline: queue into IndexedDB outbox
    if (!isOnline) {
      await queueExpenseCreation(expenseRecord, splitsWithExpenseId);
      // Optimistically update state
      setExpenses(prev => [expenseRecord, ...prev]);
      setSplits(prev => [...prev, ...splitsWithExpenseId]);
      return { offline: true, expense: expenseRecord };
    }

    // Online: directly insert into Supabase
    const { data: insertedExp, error: expErr } = await supabase
      .from('expenses')
      .insert({
        room_id: roomId,
        title: title.trim(),
        amount_paise: amountPaise,
        paid_by_member_id: paidByMemberId,
        category,
        expense_date: expenseDate,
      })
      .select()
      .single();

    if (expErr) throw expErr;

    const realSplits = splitPayloads.map(sp => ({
      expense_id: insertedExp.id,
      member_id: sp.member_id,
      amount_paise: sp.amount_paise,
    }));

    const { data: insertedSplits, error: spErr } = await supabase
      .from('expense_splits')
      .insert(realSplits)
      .select();

    if (spErr) throw spErr;

    setExpenses(prev => [insertedExp, ...prev]);
    setSplits(prev => [...(insertedSplits || []), ...prev]);

    return { offline: false, expense: insertedExp };
  }

  /**
   * Delete an expense (only allowed online)
   */
  async function deleteExpense(expenseId) {
    if (!isOnline) {
      throw new Error('Deleting expenses requires an active internet connection.');
    }
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;

    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    setSplits(prev => prev.filter(s => s.expense_id !== expenseId));
  }

  return {
    expenses,
    splits,
    loading,
    addExpense,
    deleteExpense,
    refreshExpenses: loadExpenses,
  };
}
