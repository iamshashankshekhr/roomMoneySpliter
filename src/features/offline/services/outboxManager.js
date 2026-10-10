import { initStorage, saveToLocalCache } from './idbStorage';
import { supabase } from '../../../lib/supabase';

/**
 * Pushes a new operation to the durable IndexedDB outbox
 */
export async function queueOutboxOperation(type, payload) {
  const db = await initStorage();
  const operationId = `op_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const item = {
    operation_id: operationId,
    type,
    payload,
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
  };

  await db.put('outbox', item);

  // Optimistic save to local store
  if (type === 'CREATE_EXPENSE') {
    await saveToLocalCache('expenses', payload.expense);
    await saveToLocalCache('splits', payload.splits);
  }

  return operationId;
}

/**
 * Flushes all pending outbox operations to Supabase
 */
export async function syncOutboxQueue() {
  const db = await initStorage();
  const allPending = await db.getAllFromIndex('outbox', 'status', 'pending');

  let successCount = 0;
  for (const item of allPending) {
    try {
      if (item.type === 'CREATE_EXPENSE') {
        const { expense, splits } = item.payload;

        // Insert expense
        const { data: insertedExp, error: expErr } = await supabase
          .from('expenses')
          .insert({
            room_id: expense.room_id,
            title: expense.title,
            amount_paise: expense.amount_paise,
            paid_by_member_id: expense.paid_by_member_id,
            category: expense.category,
            expense_date: expense.expense_date,
          })
          .select()
          .single();

        if (expErr) throw expErr;

        // Insert splits with server-generated expense ID
        const realSplits = splits.map(s => ({
          expense_id: insertedExp.id,
          member_id: s.member_id,
          amount_paise: s.amount_paise,
        }));

        const { error: splitErr } = await supabase
          .from('expense_splits')
          .insert(realSplits);

        if (splitErr) throw splitErr;

        // Success: remove from outbox and update local cache with server record
        await db.delete('outbox', item.operation_id);
        await saveToLocalCache('expenses', insertedExp);
        successCount++;
      }
    } catch (err) {
      console.warn(`Sync failed for operation ${item.operation_id}:`, err);
      item.retry_count = (item.retry_count || 0) + 1;
      item.last_error = err.message;
      await db.put('outbox', item);
    }
  }

  return successCount;
}

export async function getOutboxCount() {
  const db = await initStorage();
  const allPending = await db.getAllFromIndex('outbox', 'status', 'pending');
  return allPending.length;
}
