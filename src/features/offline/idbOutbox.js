import { openDB } from 'idb';

const DB_NAME = 'roomsplit_db';
const DB_VERSION = 1;

/**
 * Initializes IndexedDB stores for offline caching and durable outbox.
 */
export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Offline local cache
      if (!db.objectStoreNames.contains('rooms')) {
        db.createObjectStore('rooms', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('members')) {
        db.createObjectStore('members', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('expenses')) {
        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
        expenseStore.createIndex('room_id', 'room_id');
      }
      if (!db.objectStoreNames.contains('splits')) {
        const splitStore = db.createObjectStore('splits', { keyPath: 'id' });
        splitStore.createIndex('expense_id', 'expense_id');
      }

      // Durable offline outbox for pending sync operations
      if (!db.objectStoreNames.contains('outbox')) {
        const outboxStore = db.createObjectStore('outbox', { keyPath: 'operation_id' });
        outboxStore.createIndex('status', 'status');
      }
    },
  });
}

/**
 * Cache room data in IndexedDB
 */
export async function cacheRoomData({ room, members, expenses, splits }) {
  const db = await getDb();
  const tx = db.transaction(['rooms', 'members', 'expenses', 'splits'], 'readwrite');

  if (room) {
    await tx.objectStore('rooms').put(room);
  }

  if (members?.length) {
    for (const m of members) {
      await tx.objectStore('members').put(m);
    }
  }

  if (expenses?.length) {
    for (const e of expenses) {
      await tx.objectStore('expenses').put(e);
    }
  }

  if (splits?.length) {
    for (const s of splits) {
      await tx.objectStore('splits').put(s);
    }
  }

  await tx.done;
}

/**
 * Retrieve cached room data from IndexedDB
 */
export async function getCachedRoomData(roomId) {
  const db = await getDb();
  const room = await db.get('rooms', roomId);
  const allMembers = await db.getAll('members');
  const roomMembers = allMembers.filter(m => m.room_id === roomId);

  const expenseTx = db.transaction('expenses', 'readonly');
  const index = expenseTx.store.index('room_id');
  const expenses = await index.getAll(roomId);

  const splits = await db.getAll('splits');

  return { room, members: roomMembers, expenses, splits };
}

/**
 * Queue an expense creation in the offline outbox
 */
export async function queueExpenseCreation(expensePayload, splitsPayload) {
  const db = await getDb();
  const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const outboxItem = {
    operation_id: operationId,
    type: 'CREATE_EXPENSE',
    payload: {
      expense: expensePayload,
      splits: splitsPayload,
    },
    status: 'pending',
    retry_count: 0,
    created_at: new Date().toISOString(),
  };

  await db.put('outbox', outboxItem);

  // Optimistically store in local cache so UI displays it immediately
  const tx = db.transaction(['expenses', 'splits'], 'readwrite');
  await tx.objectStore('expenses').put(expensePayload);
  for (const s of splitsPayload) {
    await tx.objectStore('splits').put(s);
  }
  await tx.done;

  return operationId;
}

/**
 * Get all pending outbox operations
 */
export async function getPendingOutboxItems() {
  const db = await getDb();
  const all = await db.getAll('outbox');
  return all.filter(item => item.status === 'pending');
}

/**
 * Remove an item from the outbox after successful sync
 */
export async function resolveOutboxItem(operationId) {
  const db = await getDb();
  await db.delete('outbox', operationId);
}
