import { useEffect, useState, useCallback } from "react";
import { cacheGet } from "@/lib/indexedDb";

const PERMISSIONS_KEY = "user_permissions";
const ROLE_KEY = "user_role";

/**
 * Hook that loads the user's role and permission array from IndexedDB
 * (set during login) and exposes a synchronous `hasPermission` check.
 *
 * - If the user's role is `"admin"`, `hasPermission` always returns
 *   `true` regardless of the permissions array.
 * - While data is loading, `hasPermission` returns `true` for null
 *   (default/unrestricted) and `false` for everything else — this avoids
 *   a flash of hidden content.
 * - After loading (non-admin), `hasPermission(null)` always returns `true`,
 *   and `hasPermission("some.permission")` returns `true` only if that
 *   permission string exists in the array.
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      cacheGet<string[]>(PERMISSIONS_KEY),
      cacheGet<string>(ROLE_KEY),
    ]).then(([perms, userRole]) => {
      if (!cancelled) {
        setPermissions(perms ?? []);
        setRole(userRole ?? null);
      }
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
      if (permissions === null || role === null) return false;
      // Admin role → always allowed
      if (role === "admin") return true;
      return permissions.includes(perm);
    },
    [permissions, role],
  );

  return { hasPermission, permissions, role, loaded: permissions !== null && role !== null };
}
