import { openDB } from 'idb';

const DB_NAME = 'roomsplit_offline_db';
const DB_VERSION = 1;

export async function initStorage() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('rooms')) {
        db.createObjectStore('rooms', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('members')) {
        const memStore = db.createObjectStore('members', { keyPath: 'id' });
        memStore.createIndex('room_id', 'room_id');
      }
      if (!db.objectStoreNames.contains('expenses')) {
        const expStore = db.createObjectStore('expenses', { keyPath: 'id' });
        expStore.createIndex('room_id', 'room_id');
      }
      if (!db.objectStoreNames.contains('splits')) {
        const splitStore = db.createObjectStore('splits', { keyPath: 'id' });
        splitStore.createIndex('expense_id', 'expense_id');
      }
      if (!db.objectStoreNames.contains('outbox')) {
        const outboxStore = db.createObjectStore('outbox', { keyPath: 'operation_id' });
        outboxStore.createIndex('status', 'status');
      }
    },
  });
}

export async function saveToLocalCache(storeName, items) {
  const db = await initStorage();
  const tx = db.transaction(storeName, 'readwrite');
  if (Array.isArray(items)) {
    for (const item of items) {
      await tx.store.put(item);
    }
  } else if (items) {
    await tx.store.put(items);
  }
  await tx.done;
}

export async function getFromLocalCache(storeName, key) {
  const db = await initStorage();
  if (key) {
    return await db.get(storeName, key);
  }
  return await db.getAll(storeName);
}

export async function getExpensesByRoom(roomId) {
  const db = await initStorage();
  const index = db.transaction('expenses').store.index('room_id');
  return await index.getAll(roomId);
}

export async function clearAllLocalCache() {
  const db = await initStorage();
  const tx = db.transaction(['rooms', 'members', 'expenses', 'splits'], 'readwrite');
  await tx.objectStore('rooms').clear();
  await tx.objectStore('members').clear();
  await tx.objectStore('expenses').clear();
  await tx.objectStore('splits').clear();
  await tx.done;
}
