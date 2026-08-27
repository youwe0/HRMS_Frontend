import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { createModuleCache, cacheSet } from "@/lib/indexedDb";

//   Types

export type UserSearchResult = {
  userId: number;
  userName: string;
};

interface UserSearchInputProps {
  // Currently selected user ID (controlled).
  value: number | null;
  // Called when the user selects or clears a user.
  onChange: (userId: number | null, userName?: string) => void;
  // Placeholder text for the input.
  placeholder?: string;
  // Disable the entire input.
  disabled?: boolean;
}

//   IndexedDB cache for search results

const users = createModuleCache<UserSearchResult[]>("users");

// Store individual user entries as separate IndexedDB records for easy DevTools inspection.
const CACHE_TTL_USERS = 24 * 60 * 60 * 1000; // 24 hours
const saveUserEntry = (user: UserSearchResult) =>
  cacheSet(`user_${user.userId}`, user, CACHE_TTL_USERS);

//   Component

export function UserSearchInput({
  value,
  onChange,
  placeholder = "Search user by name…",
  disabled = false,
}: UserSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  //   Click-outside to close

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //   Search logic: IndexedDB first, then API fallback    ─

  const doSearch = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Check IndexedDB cache — try bulk array first, then individual entries
      const cached = await users.get();
      console.log("[UserSearch] IndexedDB bulk cache:", cached);

      // Also scan individual user_<id> entries as a fallback
      let pool: UserSearchResult[] = cached ?? [];
      if (pool.length === 0) {
        // No bulk cache — scan individual entries from IDB
        pool = await scanIndividualUserEntries();
        console.log("[UserSearch] IndexedDB individual entries:", pool);
      }

      if (pool.length > 0) {
        const filtered = pool.filter((u) =>
          u.userName.toLowerCase().includes(trimmed.toLowerCase()),
        );
        if (filtered.length > 0) {
          setResults(filtered.slice(0, 5));
          setOpen(true);
          setLoading(false);
          return;
        }
      }

      // 2. Cache miss — hit the backend API
      const data = await api.get<{ users: UserSearchResult[] }>(
        API_ENDPOINTS.SEARCH_USERS,
        { q: trimmed },
      );

      const fetched = data.users ?? [];

      // Save to IndexedDB for future local lookups
      if (fetched.length > 0) {
        const existing = (await users.get()) ?? [];
        const merged = mergeUsers(existing, fetched);
        await users.save(merged);

        // Also save each user as an individual entry for easy DevTools inspection.
        await Promise.all(fetched.map(saveUserEntry));
        console.log("[UserSearch] Saved to IndexedDB:", merged);
      }

      setResults(fetched);
      setOpen(fetched.length > 0);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  //   Debounced input handler

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setHighlightedIndex(-1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!val.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      doSearch(val);
    }, 300);
  };

  //   Select a result

  const handleSelect = (user: UserSearchResult) => {
    onChange(user.userId, user.userName);
    setQuery(user.userName);
    setOpen(false);
    setResults([]);
    setHighlightedIndex(-1);
  };

  //   Clear selection

  const handleClear = () => {
    onChange(null);
    setQuery("");
    setResults([]);
    setOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  //   Keyboard navigation   ─

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  //   Render

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          disabled={disabled}
          className="pl-9 pr-8"
        />
        {query && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Searching…
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {results.map((user, index) => (
                <li key={user.userId}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                      index === highlightedIndex
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <User className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{user.userName}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      #{user.userId}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      )}

      {/* Display selected user (when value is set but dropdown is closed) */}
      {value && !open && !query && (
        <p className="mt-1 text-xs text-muted-foreground">
          Selected user ID: {value}
        </p>
      )}
    </div>
  );
}

//   Helpers

// Merge two user arrays, deduplicating by userId.
function mergeUsers(
  existing: UserSearchResult[],
  incoming: UserSearchResult[],
): UserSearchResult[] {
  const map = new Map<number, UserSearchResult>();
  for (const u of existing) map.set(u.userId, u);
  for (const u of incoming) map.set(u.userId, u);
  return Array.from(map.values());
}

//
//  * Scan all individual `user_<id>` entries from IndexedDB.
//  * Uses the idb library's openDB to iterate the store.

async function scanIndividualUserEntries(): Promise<UserSearchResult[]> {
  const { openDB } = await import("idb");
  const { IDB_DB_NAME, IDB_DB_VERSION, IDB_STORE_NAME } =
    await import("@/config/ConfigIndexedDB");

  try {
    const db = await openDB(IDB_DB_NAME, IDB_DB_VERSION);
    const allKeys = await db.getAllKeys(IDB_STORE_NAME);
    const userKeys = allKeys.filter(
      (k): k is string => typeof k === "string" && k.startsWith("user_"),
    );

    const results: UserSearchResult[] = [];
    for (const key of userKeys) {
      const record = (await db.get(IDB_STORE_NAME, key)) as
        | {
            data: UserSearchResult;
            expiresAt: number;
          }
        | undefined;
      if (record && (record.expiresAt === 0 || Date.now() < record.expiresAt)) {
        results.push(record.data);
      }
    }
    return results;
  } catch {
    return [];
  }
}
