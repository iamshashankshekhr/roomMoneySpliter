import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { calculateNetBalances, generateSettlementPlan } from './settlementEngine';

export function useSettlements(roomId, members = [], expenses = [], splits = []) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      // Fetch any existing settlement payments recorded in the room
      const { data, error } = await supabase
        .from('settlement_payments')
        .select('*')
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

  // Compute live balances and settlement plan
  const ledger = useMemo(() => {
    return calculateNetBalances(members, expenses, splits, payments);
  }, [members, expenses, splits, payments]);

  const settlementPlan = useMemo(() => {
    return generateSettlementPlan(ledger);
  }, [ledger]);

  // Record payment status update
  async function updatePaymentStatus({ fromMemberId, toMemberId, amountPaise, newStatus }) {
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

      // Check if existing record exists
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

        if (!error && data) {
          setPayments(prev => prev.map(p => (p.id === data.id ? data : p)));
        }
      } else {
        // Need a parent settlement row or direct insert
        const { data: newSettlement } = await supabase
          .from('settlements')
          .insert({ room_id: roomId, status: 'active' })
          .select()
          .single();

        if (newSettlement) {
          payload.settlement_id = newSettlement.id;
          const { data, error } = await supabase
            .from('settlement_payments')
            .insert(payload)
            .select()
            .single();

          if (!error && data) {
            setPayments(prev => [data, ...prev]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to update payment status:', err);
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
