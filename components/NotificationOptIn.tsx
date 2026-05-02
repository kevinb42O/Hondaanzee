import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import {
  getCurrentSubscription,
  getPushPermission,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  VAPID_PUBLIC_KEY,
} from '../utils/pushNotifications.ts';

type Status = 'loading' | 'unsupported' | 'denied' | 'not-subscribed' | 'subscribed';

const detectIosNonStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  if (!isIos) return false;
  const standalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return !standalone;
};

const NotificationOptIn: React.FC = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iosHint, setIosHint] = useState(false);

  const refresh = async () => {
    if (!isPushSupported()) {
      setStatus('unsupported');
      setIosHint(detectIosNonStandalone());
      return;
    }
    const permission = getPushPermission();
    if (permission === 'denied') {
      setStatus('denied');
      return;
    }
    const sub = await getCurrentSubscription();
    setStatus(sub ? 'subscribed' : 'not-subscribed');
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleSubscribe = async () => {
    setError(null);
    setBusy(true);
    try {
      await subscribeToPush();
      setStatus('subscribed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Aanmelden mislukt.');
    } finally {
      setBusy(false);
    }
  };

  const handleUnsubscribe = async () => {
    setError(null);
    setBusy(true);
    try {
      await unsubscribeFromPush();
      setStatus('not-subscribed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Afmelden mislukt.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') return null;

  if (!VAPID_PUBLIC_KEY) {
    // Not configured at build time — render nothing rather than a broken button.
    return null;
  }

  return (
    <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-4 text-left">
      <div className="flex items-start gap-3">
        <div className="bg-cyan-500/20 text-cyan-300 rounded-lg p-2">
          <Bell size={18} />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm mb-1">Notificaties</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Krijg een melding bij belangrijke updates over de Belgische kust voor je hond.
          </p>

          {status === 'unsupported' && (
            <p className="text-slate-500 text-xs">
              {iosHint
                ? 'Op iPhone/iPad: voeg deze site eerst toe aan het beginscherm via het deel-icoon, open hem dan vanaf je beginscherm en kom hier terug.'
                : 'Notificaties worden niet ondersteund door deze browser.'}
            </p>
          )}

          {status === 'denied' && (
            <p className="text-amber-300/90 text-xs">
              Notificaties zijn geblokkeerd. Schakel ze in via de browserinstellingen voor deze site.
            </p>
          )}

          {status === 'not-subscribed' && (
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-white text-xs font-bold px-3 py-2 transition-colors"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
              Notificaties aanzetten
            </button>
          )}

          {status === 'subscribed' && (
            <button
              type="button"
              onClick={handleUnsubscribe}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white text-xs font-bold px-3 py-2 transition-colors"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <BellOff size={14} />}
              Uitzetten
            </button>
          )}

          {error && <p className="text-red-300 text-xs mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default NotificationOptIn;
