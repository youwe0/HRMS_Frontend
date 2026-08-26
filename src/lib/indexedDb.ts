import { openDB, type IDBPDatabase } from "idb";
import {
  IDB_DB_NAME,
  IDB_DB_VERSION,
  IDB_STORE_NAME,
  CACHE_TTL,
  type CacheModule,
} from "@/config/ConfigIndexedDB";

// Re-export config constants so consumers can import from one place if needed.
export { CACHE_TTL, type CacheModule };

// ── Internal record shape stored in IndexedDB ──────────────────────────────────

type CacheRecord<T> = {
  key: string;
  data: T;
  /** Timestamp (ms) when the entry was written. */
  savedAt: number;
  /** Timestamp (ms) when the entry expires. 0 = never expires. */
  expiresAt: number;
};

// ── DB singleton ───────────────────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(IDB_DB_NAME, IDB_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME, { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Retrieve a cached value by key.
 *
 * @returns The cached data if it exists **and** has not expired, otherwise `null`.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const db = await getDb();
    const record = (await db.get(IDB_STORE_NAME, key)) as
      | CacheRecord<T>
      | undefined;

    if (!record) return null;

    // Check expiry (expiresAt === 0 means no expiry).
    if (record.expiresAt !== 0 && Date.now() > record.expiresAt) {
      // Stale — remove it automatically.
      await db.delete(IDB_STORE_NAME, key);
      return null;
    }

    return record.data;
  } catch {
    // IndexedDB may be unavailable (e.g. private browsing in older browsers).
    return null;
  }
}

/**
 * Persist a value into the cache.
 *
 * @param key     Unique identifier for the entry.
 * @param data    The data to store (any JSON-serialisable value).
 * @param decayMs How long the entry stays valid, in milliseconds.
 *                When omitted, the TTL from `CACHE_TTL` is looked up by
 *                matching `key` against known module names — otherwise
 *                falls back to 24 hours.
 */
export async function cacheSet<T>(
  key: string,
  data: T,
  decayMs?: number,
): Promise<void> {
  try {
    const db = await getDb();
    const now = Date.now();
    const ttl = decayMs ?? lookupTtl(key);
    const record: CacheRecord<T> = {
      key,
      data,
      savedAt: now,
      expiresAt: ttl === 0 ? 0 : now + ttl,
    };
    await db.put(IDB_STORE_NAME, record);
  } catch {
    // Best-effort — silently fail.
  }
}

/**
 * Delete a single cached entry by key.
 */
export async function cacheClear(key: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(IDB_STORE_NAME, key);
  } catch {
    // Best-effort.
  }
}

/**
 * Delete **all** cached entries.
 */
export async function cacheClearAll(): Promise<void> {
  try {
    const db = await getDb();
    await db.clear(IDB_STORE_NAME);
  } catch {
    // Best-effort.
  }
}

// ── Module factory ────────────────────────────────────────────────────────────

/**
 * Returned by {@link createModuleCache} — three typed helpers scoped to one module.
 */
export type ModuleCache<T> = {
  /** Read cached data. Returns `null` on miss or expiry. */
  get: () => Promise<T | null>;
  /** Write data to the cache (uses the TTL from `CACHE_TTL`). */
  save: (data: T) => Promise<void>;
  /** Invalidate the cache entry. */
  clear: () => Promise<void>;
};

/**
 * Create a fully-typed cache for a module in one line.
 *
 * ```ts
 * // In your page file:
 * import { createModuleCache } from "@/lib/indexedDb";
 *
 * type Employee = { id: number; name: string };
 * const employees = createModuleCache<Employee>("employees");
 *
 * const list = await employees.get();   // Employee[] | null
 * await employees.save(list);            // writes to IndexedDB
 * await employees.clear();               // invalidates cache
 * ```
 *
 * @param moduleName  Must match a key in `CACHE_TTL` from the config.
 */
export function createModuleCache<T>(moduleName: CacheModule): ModuleCache<T> {
  const key = `${moduleName}_all`;
  const ttl = CACHE_TTL[moduleName];

  return {
    get: () => cacheGet<T>(key),
    save: (data: T) => cacheSet(key, data, ttl),
    clear: () => cacheClear(key),
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Attempt to resolve a TTL from `CACHE_TTL` by checking if any module name
 * appears in the key string. Falls back to 24 hours if no match is found.
 */
function lookupTtl(key: string): number {
  const modules = Object.keys(CACHE_TTL) as CacheModule[];
  for (const mod of modules) {
    if (key.includes(mod)) {
      return CACHE_TTL[mod];
    }
  }
  // Default fallback — 24 hours.
  return 24 * 60 * 60 * 1000;
}
