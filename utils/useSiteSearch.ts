import { useEffect, useMemo, useState } from 'react';
import type { searchSite as SearchFunction } from './search.ts';

export function useSiteSearch(query: string, enabled: boolean) {
  const [search, setSearch] = useState<typeof SearchFunction | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled || search) return;
    let active = true;
    import('./search.ts').then(module => {
      if (active) setSearch(() => module.searchSite);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [enabled, search]);
  const results = useMemo(() => search?.(query) || [], [search, query]);
  return { results, loading: enabled && !search && !error, error };
}
