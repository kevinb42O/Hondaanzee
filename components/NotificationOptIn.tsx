import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2, Smartphone } from 'lucide-react';
import {
  getCurrentSubscription,
  getPushPermission,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  VAPID_PUBLIC_KEY,
} from '../utils/pushNotifications.ts';

type Status = 'loading' | 'unsupported' | 'denied' | 'not-subscribed' | 'subscribed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
type NotificationOptInVariant = 'footer' | 'homepage';

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

interface NotificationOptInProps {
  variant?: NotificationOptInVariant;
}

const NotificationOptIn: React.FC<NotificationOptInProps> = ({ variant = 'footer' }) => {
  const [status, setStatus] = useState<Status>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [appInstalled, setAppInstalled] = useState(false);

  const isHomepage = variant === 'homepage';

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
    try {
      const sub = await getCurrentSubscription();
      setStatus(sub ? 'subscribed' : 'not-subscribed');
    } catch {
      setStatus('not-subscribed');
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setStatus((current) => (current === 'loading' ? 'not-subscribed' : current));
    }, 4500);

    void refresh();

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) { setAppInstalled(true); return; }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => { setInstallPrompt(null); setAppInstalled(true); };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setAppInstalled(true);
    }
  };

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

  if (isHomepage) {
    return (
      <div className="rounded-[1.75rem] border border-sky-100 bg-white/90 p-5 text-left shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600 ring-1 ring-sky-100">
              <Bell size={22} />
            </div>
            <div className="flex-1">
              <div className="mb-1 inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
                Blijf op de hoogte
              </div>
              <h4 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                Krijg belangrijke kustupdates op je toestel
              </h4>
              <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                Een korte melding bij nieuwe strandinfo, meldpuntwaarschuwingen of nuttige updates. Alleen wanneer het echt relevant is.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            {status === 'loading' && (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-600">
                <Loader2 size={14} className="animate-spin" />
                Status controleren...
              </div>
            )}

            {!VAPID_PUBLIC_KEY && status !== 'loading' && (
              <p className="text-xs font-bold text-amber-700">
                Notificaties zijn nog niet volledig geconfigureerd.
              </p>
            )}

            {status === 'unsupported' && (
              <p className="max-w-sm text-xs font-medium text-slate-500 sm:text-right">
                {iosHint
                  ? 'Op iPhone/iPad: voeg deze site eerst toe aan het beginscherm via het deel-icoon, open hem dan vanaf je beginscherm en kom hier terug.'
                  : 'Notificaties worden niet ondersteund door deze browser.'}
              </p>
            )}

            {status === 'denied' && (
              <p className="max-w-sm text-xs font-bold text-amber-700 sm:text-right">
                Notificaties zijn geblokkeerd. Schakel ze in via de browserinstellingen voor deze site.
              </p>
            )}

            {VAPID_PUBLIC_KEY && status === 'not-subscribed' && (
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-sky-700 disabled:opacity-60"
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-700 ring-1 ring-emerald-100 transition-colors hover:bg-emerald-100 disabled:opacity-60"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <BellOff size={14} />}
                Notificaties staan aan
              </button>
            )}

            {error && <p className="max-w-sm text-xs font-bold text-red-600 sm:text-right">{error}</p>}
          </div>
        </div>

        {/* PWA install strip */}
        {!appInstalled && (installPrompt || iosHint) && (
          <div className="mt-4 flex flex-col gap-2 border-t border-sky-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 ring-1 ring-indigo-100">
                <Smartphone size={16} />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {iosHint
                  ? 'Installeer de app via het deel-icoon → "Zet op beginscherm"'
                  : 'Zet HondAanZee op je beginscherm voor snelle toegang'}
              </p>
            </div>
            {installPrompt && (
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <Smartphone size={14} />
                Installeer app
              </button>
            )}
          </div>
        )}

        {appInstalled && (
          <div className="mt-4 flex items-center gap-2 border-t border-sky-100 pt-4">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 ring-1 ring-emerald-100">
              <Smartphone size={16} />
            </div>
            <p className="text-sm font-semibold text-emerald-700">App geïnstalleerd op je beginscherm</p>
          </div>
        )}
      </div>
    );
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

          {status === 'loading' && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-700/70 px-3 py-2 text-xs font-bold text-slate-200">
              <Loader2 size={14} className="animate-spin" />
              Status controleren...
            </div>
          )}

          {!VAPID_PUBLIC_KEY && status !== 'loading' && (
            <p className="text-amber-300/90 text-xs">
              Notificaties zijn nog niet volledig geconfigureerd.
            </p>
          )}

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

          {VAPID_PUBLIC_KEY && status === 'not-subscribed' && (
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
