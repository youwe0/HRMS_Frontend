import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, User, Building2, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { createModuleCache } from "@/lib/indexedDb";
import type { CacheModule } from "@/lib/indexedDb";

// Types
export type EntitySearchResult = {
  id: number;
  label: string;
  sublabel?: string;
};

export type SearchForType = "user" | "department" | "designation";

// Consolidated IndexedDB caches — one per entity type, not per query.
const SEARCH_CACHE_KEY: Record<SearchForType, CacheModule> = {
  user: "userSearch",
  department: "departmentSearch",
  designation: "designationSearch",
};

interface UserSearchInputProps {
  // Currently selected entity ID (controlled).
  value: number | null;
  // Called when the user selects or clears an entity.
  onChange: (id: number | null, label?: string) => void;
  // Placeholder text for the input.
  placeholder?: string;
  // Disable the entire input.
  disabled?: boolean;
  // Which entity type to search for. Defaults to "user".
  searchFor?: SearchForType;
}

// Icon mapping per entity type
const ENTITY_ICONS: Record<SearchForType, typeof User> = {
  user: User,
  department: Building2,
  designation: Award,
};

// Component
export function UserSearchInput({
  value,
  onChange,
  placeholder = "Search user by name…",
  disabled = false,
  searchFor = "user",
}: UserSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  // Accumulated results in memory (loaded from IndexedDB on mount).
  const accumulatedRef = useRef<EntitySearchResult[]>([]);
  // Tracks which search terms have already been fetched from the API.
  const fetchedTermsRef = useRef<Set<string>>(new Set());
  // The consolidated cache instance for this entity type.
  const cache = createModuleCache<EntitySearchResult[]>(
    SEARCH_CACHE_KEY[searchFor],
  );

  // Load accumulated results from IndexedDB on mount.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const cached = await cache.get();
      if (!cancelled && cached) {
        accumulatedRef.current = cached;
        // Mark all existing labels as already fetched so we don't re-fetch.
        const terms = new Set(cached.map((r) => r.label.toLowerCase()));
        fetchedTermsRef.current = terms;
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [cache]);

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

  // Filter accumulated results by a search term.
  const filterCached = useCallback(
    (term: string) => {
      const lower = term.toLowerCase();
      return accumulatedRef.current.filter((r) =>
        r.label.toLowerCase().includes(lower),
      );
    },
    [],
  );

  // Merge new results into the accumulated store (dedup by id).
  const mergeAndSave = useCallback(
    async (fetched: EntitySearchResult[]) => {
      if (fetched.length === 0) return;

      const existing = accumulatedRef.current;
      const existingIds = new Set(existing.map((r) => r.id));
      const newItems = fetched.filter((r) => !existingIds.has(r.id));

      if (newItems.length === 0) return;

      const merged = [...existing, ...newItems];
      accumulatedRef.current = merged;
      await cache.save(merged);
    },
    [cache],
  );

  //   Search logic: debounced API call with consolidated IndexedDB caching
  const doSearch = useCallback(
    async (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) {
        setResults([]);
        setOpen(false);
        return;
      }

      // 1. Client-side filter of already-accumulated results.
      const filtered = filterCached(trimmed);
      setResults(filtered);
      setOpen(true);

      // 2. If this exact term was already fetched from the API, we're done.
      const lower = trimmed.toLowerCase();
      if (fetchedTermsRef.current.has(lower)) return;

      // 3. Term not yet fetched — call the API.
      setLoading(true);
      try {
        const data = await api.get<{ results: EntitySearchResult[] }>(
          API_ENDPOINTS.SEARCH_USERS,
          { q: trimmed, searchFor },
        );

        const fetched = data.results ?? [];
        fetchedTermsRef.current.add(lower);

        if (fetched.length > 0) {
          // Merge into accumulated store and re-filter.
          await mergeAndSave(fetched);
          const updated = filterCached(trimmed);
          setResults(updated);
          setOpen(updated.length > 0);
        }
      } catch {
        // Silently fail — keep showing whatever cached results we have.
      } finally {
        setLoading(false);
      }
    },
    [searchFor, filterCached, mergeAndSave],
  );

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
  const handleSelect = (item: EntitySearchResult) => {
    onChange(item.id, item.label);
    setQuery(item.label);
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

  // Keyboard navigation
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

  const IconComponent = ENTITY_ICONS[searchFor];

  // Render
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
              {results.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                      index === highlightedIndex
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }`}
                  >
                    <IconComponent className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.label}</span>
                    {item.sublabel && (
                      <span className="ml-auto truncate text-xs text-muted-foreground">
                        {item.sublabel}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      #{item.id}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No results found
            </div>
          )}
        </div>
      )}

      {/* Display selected entity (when value is set but dropdown is closed) */}
      {value && !open && !query && (
        <p className="mt-1 text-xs text-muted-foreground">
          Selected ID: {value}
        </p>
      )}
    </div>
  );
}
