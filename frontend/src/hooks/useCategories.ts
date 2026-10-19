import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Category } from "../types/api";

/**
 * Loads the list of expense categories once, for dropdowns such as the expense form and filters.
 * Returns an empty list until it arrives, or if loading fails, so a dropdown never breaks.
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
