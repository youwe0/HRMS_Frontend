import { useEffect, useState, useCallback } from "react";
import { cacheGet } from "@/lib/indexedDb";

const PERMISSIONS_KEY = "user_permissions";

/**
 * Hook that loads the user's permission array from IndexedDB (set during
 * login) and exposes a synchronous `hasPermission` check.
 *
 * - While permissions are loading, `hasPermission` returns `true` for null
 *   (default/unrestricted) and `false` for everything else — this avoids
 *   a flash of hidden content.
 * - After loading, `hasPermission(null)` always returns `true`, and
 *   `hasPermission("some.permission")` returns `true` only if that
 *   permission string exists in the array.
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    cacheGet<string[]>(PERMISSIONS_KEY).then((perms) => {
      if (!cancelled) setPermissions(perms ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasPermission = useCallback(
    (perm: string | null | undefined): boolean => {
      // null / undefined = no restriction → always visible
      if (perm == null || perm === "") return true;
      // Still loading → hide permission-gated items until we know
      if (permissions === null) return false;
      return permissions.includes(perm);
    },
    [permissions],
  );

  return { hasPermission, permissions, loaded: permissions !== null };
}
