import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { createModuleCache } from "@/lib/indexedDb";

export type ResourceBundle = {
  Blood_group: string[];
  Gender: string[];
  Employee_type: string[];
};

const resourceBundleCache = createModuleCache<ResourceBundle>("resourceBundle");

//  Fetches the ResourceBundle (blood groups, genders, etc.) on mount.
//  Returns cached data from IndexedDB if available — only hits the API
//  on the very first load (or after cache expiry / clear).

export function useResourceBundle() {
  const [data, setData] = useState<ResourceBundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1. Try IndexedDB first
        const cached = await resourceBundleCache.get();
        if (cached && !cancelled) {
          setData(cached);
          setLoading(false);
          return;
        }

        // 2. Cache miss — fetch from API
        const response = await api.get<ResourceBundle>(
          API_ENDPOINTS.GET_RESOURCE_BUNDLE,
        );
        if (!cancelled) {
          setData(response);
          await resourceBundleCache.save(response);
        }
      } catch {
        // Silently fail — the UI will just show empty options
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}
