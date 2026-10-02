import { useCallback, useEffect, useRef, useState } from 'react';
import { adminFunction } from './adminContent.ts';
import type { ReviewInsights } from './reviewInsights.ts';

export function useAdminReviewInsights() {
  const [data, setData] = useState<ReviewInsights | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++sequence.current; setLoading(true); setError('');
    try { const result = await adminFunction<ReviewInsights>('admin-reviews', { action: 'insights' }); if (request === sequence.current) setData(result); }
    catch (cause) { if (request === sequence.current) setError(cause instanceof Error ? cause.message : 'Kon likes en reviews niet laden.'); }
    finally { if (request === sequence.current) setLoading(false); }
  }, []);
  useEffect(() => {
    void refresh();
    const update = () => { if (!document.hidden) void refresh(); };
    const timer = setInterval(update, 30000);
    window.addEventListener('haz-review-moderated', update); document.addEventListener('visibilitychange', update);
    return () => { sequence.current++; clearInterval(timer); window.removeEventListener('haz-review-moderated', update); document.removeEventListener('visibilitychange', update); };
  }, [refresh]);
  return { data, loading, error, refresh };
}
