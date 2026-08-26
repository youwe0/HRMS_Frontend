// ────────────────────────────────────────────────────────────────────────────────
// IndexedDB Configuration
// ────────────────────────────────────────────────────────────────────────────────
//
// HOW TO ADD A NEW MODULE CACHE (2 steps):
//
//   1. Add a TTL entry below in `CACHE_TTL`:
//        employees: HOURS_24,
//
//   2. In your page/component, create the cache in one line:
//
//        import { createModuleCache } from "@/lib/indexedDb";
//
//        type Employee = { id: number; name: string };
//        const employees = createModuleCache<Employee[]>("employees");
//
//        // Use it:
//        const data = await employees.get();   // Employee[] | null
//        await employees.save(data);           // writes to IndexedDB
//        await employees.clear();              // invalidates cache
//
//   That's it. No wrapper file needed.
//
// ────────────────────────────────────────────────────────────────────────────────

/** Name of the IndexedDB database. */
export const IDB_DB_NAME = "hrms-cache-db";

/** Version passed to `openDB`. Bump when the schema changes. */
export const IDB_DB_VERSION = 2;

/** Name of the single key-value object store used for all cache entries. */
export const IDB_STORE_NAME = "DepartmentCacheStore";

// ── Per-module TTLs ────────────────────────────────────────────────────────────
// Each value is in **milliseconds**. Set to `0` for no expiry.
// The key name here IS the module name used with `createModuleCache<T>(key)`.

/** 24 hours in milliseconds. */
const HOURS_24 = 24 * 60 * 60 * 1000;

export const CACHE_TTL = {
  /** Department list cache. */
  departments: HOURS_24,

  // ── Future modules — uncomment and set TTL: ──
  // employees:  HOURS_24,
  // roles:      60 * 60 * 1000,   // 1 hour
  // settings:   0,                 // no expiry
} as const;

/** Union of all module keys defined above. */
export type CacheModule = keyof typeof CACHE_TTL;
