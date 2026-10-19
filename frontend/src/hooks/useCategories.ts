import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Category } from "../types/api";



/**
 Caches the list of expense categories only once, for drop-downs like the expense form and filters.
 Does return an empty list until it reaches it (or until it fails to load, a dropdown will not break).
 */

export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Ignore a late answer if the component has already left the page.
    let cancelled = false;
    api.get<Category[]>("/categories")
      .then((list) => { if (!cancelled) setCategories(list); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return categories;
}
