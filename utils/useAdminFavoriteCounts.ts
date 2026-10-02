import { useCallback, useEffect, useRef, useState } from 'react';
import { adminFunction } from './adminContent.ts';
export function useAdminFavoriteCounts() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null), [error, setError] = useState(false), [loading, setLoading] = useState(true);
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++sequence.current; setLoading(true); setError(false);
    try { const data = await adminFunction<{ counts: Record<string, number> }>('admin-favorites', { action: 'counts' }); if (request === sequence.current) setCounts(data.counts); }
    catch { if (request === sequence.current) { setCounts(null); setError(true); } }
    finally { if (request === sequence.current) setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); return () => { sequence.current++; }; }, [refresh]);
  return { counts, loading, error, refresh };
}
