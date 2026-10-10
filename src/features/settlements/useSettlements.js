import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { calculateNetBalances, generateSettlementPlan } from './settlementEngine';

export function useSettlements(roomId, members = [], expenses = [], splits = []) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = useCallback(async () => {
    if (!roomId) {
      setPayments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // Fetch settlement IDs for this room
      const { data: settleRows, error: settleErr } = await supabase
        .from('settlements')
        .select('id')
        .eq('room_id', roomId);

      if (settleErr) throw settleErr;

      const settlementIds = (settleRows || []).map(s => s.id);
      if (settlementIds.length === 0) {
        setPayments([]);
        return;
      }

      // Fetch all payments belonging to these settlements
      const { data, error } = await supabase
        .from('settlement_payments')
        .select('*')
        .in('settlement_id', settlementIds)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPayments(data);
      }
    } catch (err) {
      console.warn('Could not load settlement payments:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Realtime subscription for settlement payments
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room_settlements_${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settlement_payments' },
        () => {
          loadPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, loadPayments]);

  // Compute live balances and settlement plan
  const ledger = useMemo(() => {
    return calculateNetBalances(members, expenses, splits, payments);
  }, [members, expenses, splits, payments]);

  const settlementPlan = useMemo(() => {
    return generateSettlementPlan(ledger);
  }, [ledger]);

  // Record payment status update
  async function updatePaymentStatus({ fromMemberId, toMemberId, amountPaise, newStatus }) {
    if (!roomId) return;
    try {
      const now = new Date().toISOString();
      const payload = {
        from_member_id: fromMemberId,
        to_member_id: toMemberId,
        amount_paise: amountPaise,
        status: newStatus,
        updated_at: now,
      };

      if (newStatus === 'initiated') payload.initiated_at = now;
      if (newStatus === 'payer_marked_paid') payload.payer_acknowledged_at = now;
      if (newStatus === 'recipient_confirmed') payload.recipient_confirmed_at = now;

      // 1. Get or create active settlement for this room
      let { data: currentSettlement } = await supabase
        .from('settlements')
        .select('id')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!currentSettlement) {
        const { data: created, error: crErr } = await supabase
          .from('settlements')
          .insert({ room_id: roomId, status: 'active' })
          .select()
          .single();
        if (crErr) throw crErr;
        currentSettlement = created;
      }

      payload.settlement_id = currentSettlement.id;

      // 2. Check if a payment record already exists between these two members for this settlement
      const existing = payments.find(
        p => p.from_member_id === fromMemberId && p.to_member_id === toMemberId && p.status !== 'cancelled'
      );

      if (existing) {
        const { data, error } = await supabase
          .from('settlement_payments')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPayments(prev => prev.map(p => (p.id === data.id ? data : p)));
        }
      } else {
        const { data, error } = await supabase
          .from('settlement_payments')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setPayments(prev => [data, ...prev]);
        }
      }

      await loadPayments();
    } catch (err) {
      console.error('Failed to update payment status:', err);
      throw err;
    }
  }

  return {
    ledger,
    settlementPlan,
    payments,
    loading,
    updatePaymentStatus,
    refreshPayments: loadPayments,
  };
}
