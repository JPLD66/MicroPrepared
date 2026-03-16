import { openDB } from 'idb';
import type { PresetKey } from '../data/types';

export interface AppState {
  preset: PresetKey;
  purchased: Record<number, boolean>;
  createdAt: string;
  updatedAt: string;
}

const DB_NAME = 'mss-tracker';
const STORE_NAME = 'state';
const STATE_KEY = 'app';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function loadState(): Promise<AppState | null> {
  const db = await getDB();
  return db.get(STORE_NAME, STATE_KEY);
}

export async function saveState(state: AppState): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, { ...state, updatedAt: new Date().toISOString() }, STATE_KEY);
}

export async function clearState(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, STATE_KEY);
}
