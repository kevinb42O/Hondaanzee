import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Copy,
  ExternalLink,
  History,
  Link as LinkIcon,
  Loader2,
  LogOut,
  RefreshCw,
  RotateCcw,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  Users,
  Wand2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../components/admin/AdminPageHeader.tsx';
import AdminShell from '../components/admin/AdminShell.tsx';
import AdminLoginCard from '../components/meldpunt/AdminLoginCard.tsx';
import { supabase } from '../utils/supabaseClient.ts';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../utils/supabasePublicConfig.ts';
import { useAdminAuth } from '../utils/useAdminAuth.ts';
import { useSEO } from '../utils/seo.ts';

interface PushLogEntry {
  id: string;
  title: string;
  body: string | null;
  url: string | null;
  sent_count: number;
  failed_count: number;
  total_count: number;
  sent_by: string | null;
  created_at: string;
}

interface SendResult {
  ok: boolean;
  sent: number;
  failed: number;
  total: number;
  expired: number;
}

type ComposerField = 'title' | 'body';

const DRAFT_STORAGE_KEY = 'haz-admin-push-draft-v1';
const TITLE_LIMIT = 120;
const BODY_LIMIT = 400;

const EMOJI_GROUPS = [
  { label: 'Kust', items: ['🐾', '🌊', '🏖️', '☀️', '🌅', '🐶', '🦴', '🐕'] },
  { label: 'Status', items: ['✅', '⚠️', '📍', 'ℹ️', '🆕', '💡', '📢', '🔔'] },
  { label: 'Actie', items: ['👉', '👇', '📲', '💙', '✨', '🎉', '🙏', '🧭'] },
];

const TEMPLATES = [
  {
    label: 'Nieuwe update',
    title: '🆕 Nieuwe update op HondAanZee',
    body: 'We hebben net iets nieuws toegevoegd. Bekijk de laatste verbeteringen en nieuwigheden op de updatepagina.',
    url: '/updates',
  },
  {
    label: 'Belangrijke waarschuwing',
    title: '⚠️ Belangrijke melding aan de kust',
    body: 'Er is een nieuwe melding die interessant kan zijn voor hondeneigenaars aan zee. Bekijk de details op HondAanZee.',
    url: '/meldpunt',
  },
  {
    label: 'Nieuwe blog',
    title: '📖 Nieuwe blog voor kustwandelaars',
    body: 'Er staat een nieuw artikel klaar met tips voor een zorgeloze uitstap met je hond aan de Belgische kust.',
    url: '/blog',
  },
  {
    label: 'Community',
    title: '🐾 Nieuwe Topper van de Week',
    body: 'Neem een kijkje op de communitypagina en ontdek welke hond deze week in de spotlight staat.',
    url: '/community',
  },
  {
    label: 'Evenement',
    title: '📅 Hondvriendelijk event aan zee',
    body: 'Er staat een nieuw hondvriendelijk evenement in de agenda. Ideaal om samen met je hond te plannen.',
    url: '/agenda',
  },
];

const QUICK_URLS = [
  { label: 'Home', value: '/' },
  { label: 'Updates', value: '/updates' },
  { label: 'Meldpunt', value: '/meldpunt' },
  { label: 'Blog', value: '/blog' },
  { label: 'Community', value: '/community' },
  { label: 'Agenda', value: '/agenda' },
  { label: 'Losloopzones', value: '/losloopzones' },
  { label: 'Kaart', value: '/kaart' },
];

const adminAuthHeaders = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error('Je adminsessie ontbreekt. Log opnieuw in.');
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
};

const callAdmin = async <T,>(name: string, body: Record<string, unknown>): Promise<T> => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: await adminAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let message = `Request mislukt (${response.status}).`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
};

const formatDateTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('nl-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const normalizeTargetUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '/';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const getUrlError = (value: string): string | null => {
  const normalized = normalizeTargetUrl(value);
  if (normalized.startsWith('/')) return null;
  try {
    const parsed = new URL(normalized);
    return ['http:', 'https:'].includes(parsed.protocol) ? null : 'Gebruik een pad of https-link.';
  } catch {
    return 'Doel URL is ongeldig.';
  }
};

const AdminNotifications: React.FC = () => {
  useSEO({
    title: 'Notificaties versturen | Admin',
    description: 'Verstuur push notificaties naar PWA-abonnees.',
    canonical: 'https://hondaanzee.be/admin/notificaties',
  });

  const {
    authError,
    authLoading,
    email,
    password,
    session,
    sessionLoading,
    setEmail,
    setPassword,
    signIn,
    signOut,
  } = useAdminAuth();

  const titleRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [activeField, setActiveField] = useState<ComposerField>('body');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SendResult | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [log, setLog] = useState<PushLogEntry[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  const normalizedUrl = useMemo(() => normalizeTargetUrl(url), [url]);
  const urlError = useMemo(() => getUrlError(url), [url]);
  const previewTitle = title.trim() || 'Titel van je notificatie';
  const previewBody = body.trim() || 'Korte, heldere tekst die mensen meteen begrijpen.';
  const hasDraft = title.trim().length > 0 || body.trim().length > 0 || normalizedUrl !== '/';
  const canSend = Boolean(title.trim())
    && title.length <= TITLE_LIMIT
    && body.length <= BODY_LIMIT
    && !urlError
    && (subscriberCount ?? 0) > 0
    && !sending;

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await callAdmin<{ subscriber_count: number; log: PushLogEntry[] }>(
        'list-push-stats',
        {},
      );
      setSubscriberCount(data.subscriber_count);
      setLog(data.log || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kon statistieken niet laden.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (!session) {
      setSubscriberCount(null);
      setLog([]);
      return;
    }
    void loadStats();
  }, [session]);

  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft) as { title?: string; body?: string; url?: string };
        setTitle(draft.title || '');
        setBody(draft.body || '');
        setUrl(draft.url || '/');
      }
    } catch { /* ignore invalid drafts */ }
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      if (!hasDraft) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return;
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ title, body, url }));
    } catch { /* ignore storage failures */ }
  }, [body, draftLoaded, hasDraft, title, url]);

  const insertIntoField = (value: string) => {
    const targetRef = activeField === 'title' ? titleRef : bodyRef;
    const currentValue = activeField === 'title' ? title : body;
    const setter = activeField === 'title' ? setTitle : setBody;
    const maxLength = activeField === 'title' ? TITLE_LIMIT : BODY_LIMIT;
    const element = targetRef.current;
    const start = element?.selectionStart ?? currentValue.length;
    const end = element?.selectionEnd ?? currentValue.length;
    const nextValue = `${currentValue.slice(0, start)}${value}${currentValue.slice(end)}`.slice(0, maxLength);

    setter(nextValue);
    window.setTimeout(() => {
      targetRef.current?.focus();
      const caret = Math.min(start + value.length, nextValue.length);
      targetRef.current?.setSelectionRange(caret, caret);
    }, 0);
  };

  const applyTemplate = (template: typeof TEMPLATES[number]) => {
    setTitle(template.title);
    setBody(template.body);
    setUrl(template.url);
    setActiveField('body');
    setError(null);
    setSuccess(null);
  };

  const reuseLogEntry = (entry: PushLogEntry) => {
    setTitle(entry.title);
    setBody(entry.body || '');
    setUrl(entry.url || '/');
    setSuccess(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearDraft = () => {
    setTitle('');
    setBody('');
    setUrl('/');
    setError(null);
    setSuccess(null);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    const targetUrl = normalizeTargetUrl(url);
    const nextUrlError = getUrlError(targetUrl);

    if (!trimmedTitle) {
      setError('Titel is verplicht.');
      return;
    }
    if (trimmedTitle.length > TITLE_LIMIT) {
      setError(`Titel is te lang (max ${TITLE_LIMIT} tekens).`);
      return;
    }
    if (body.length > BODY_LIMIT) {
      setError(`Bericht is te lang (max ${BODY_LIMIT} tekens).`);
      return;
    }
    if (nextUrlError) {
      setError(nextUrlError);
      return;
    }

    const targetCount = subscriberCount ?? 0;
    const confirmed = confirm(
      `Notificatie versturen naar ${targetCount} abonnee${targetCount === 1 ? '' : 's'}?\n\nTitel: ${trimmedTitle}\nLink: ${targetUrl}`,
    );
    if (!confirmed) return;

    setSending(true);
    try {
      const result = await callAdmin<SendResult>('send-push', {
        title: trimmedTitle,
        body: trimmedBody,
        url: targetUrl,
      });
      setSuccess(result);
      clearDraft();
      void loadStats();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Verzenden mislukt.');
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <AdminShell backHref="/" backLabel="Terug naar de site">
        <AdminLoginCard
          authLoading={authLoading}
          email={email}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={signIn}
          password={password}
          sessionLoading={sessionLoading}
        />
        {authError && (
          <p className="mt-4 text-center text-sm font-semibold text-red-600">{authError}</p>
        )}
      </AdminShell>
    );
  }

  return (
    <AdminShell backHref="/admin" backLabel="Terug naar admin">
      <AdminPageHeader
        eyebrow="Push notificaties"
        title="Stuur een notificatie"
        subtitle="Maak snelle, duidelijke pushberichten met emoji, templates, live preview en verzendcontrole."
        sessionEmail={session.user?.email || undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void loadStats()} disabled={loadingStats} className="admin-btn-secondary">
              {loadingStats ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Vernieuw
            </button>
            <Link to="/admin" className="admin-btn-secondary">
              Meldpunt
            </Link>
            <button type="button" onClick={signOut} className="admin-btn-secondary">
              <LogOut size={14} /> Uitloggen
            </button>
          </div>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="admin-surface p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Users size={14} /> Abonnees
          </div>
          <div className="mt-2 text-3xl font-black text-slate-950">
            {loadingStats ? '...' : (subscriberCount ?? 0)}
          </div>
        </div>
        <div className="admin-surface p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <History size={14} /> Verzonden
          </div>
          <div className="mt-2 text-3xl font-black text-slate-950">{log.length}</div>
        </div>
        <div className="admin-surface p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={14} /> Klaar om te sturen
          </div>
          <div className={`mt-2 text-sm font-black ${canSend ? 'text-emerald-600' : 'text-slate-400'}`}>
            {canSend ? 'Alles staat goed' : 'Vul titel, link en abonnees aan'}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <div className="space-y-6">
          <section className="admin-surface p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="admin-eyebrow">Templates</p>
                <h2 className="text-xl font-black text-slate-950">Begin sneller</h2>
              </div>
              {hasDraft && (
                <button type="button" onClick={clearDraft} className="admin-btn-subtle">
                  <Trash2 size={14} /> Wis draft
                </button>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50"
                >
                  <span className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <Wand2 size={14} className="text-sky-600" /> {template.label}
                  </span>
                  <span className="mt-1 block truncate text-xs font-medium text-slate-500">{template.title}</span>
                </button>
              ))}
            </div>
          </section>

          <form onSubmit={handleSend} className="admin-surface space-y-5 p-5 sm:p-6">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
                  Titel
                  <span className={title.length > TITLE_LIMIT - 16 ? 'text-amber-600' : 'text-slate-400'}>
                    {title.length}/{TITLE_LIMIT}
                  </span>
                </span>
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onFocus={() => setActiveField('title')}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={TITLE_LIMIT}
                  placeholder="Bv. 🆕 Nieuwe update op HondAanZee"
                  className="admin-input"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Emoji invoegen in</span>
                <select
                  value={activeField}
                  onChange={(event) => setActiveField(event.target.value as ComposerField)}
                  className="admin-input"
                >
                  <option value="body">Berichttekst</option>
                  <option value="title">Titel</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
                Bericht
                <span className={body.length > BODY_LIMIT - 50 ? 'text-amber-600' : 'text-slate-400'}>
                  {body.length}/{BODY_LIMIT}
                </span>
              </span>
              <textarea
                ref={bodyRef}
                value={body}
                onFocus={() => setActiveField('body')}
                onChange={(event) => setBody(event.target.value)}
                maxLength={BODY_LIMIT}
                rows={5}
                placeholder="Korte tekst die in de notificatie komt. Schrijf concreet en menselijk."
                className="admin-textarea"
              />
            </label>

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
                <Sparkles size={15} className="text-sky-600" /> Emoji's
              </div>
              <div className="space-y-3">
                {EMOJI_GROUPS.map((group) => (
                  <div key={group.label} className="flex flex-wrap items-center gap-2">
                    <span className="w-14 text-xs font-black uppercase tracking-wider text-slate-400">{group.label}</span>
                    {group.items.map((emoji) => (
                      <button
                        key={`${group.label}-${emoji}`}
                        type="button"
                        onClick={() => insertIntoField(emoji)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg transition hover:border-sky-200 hover:bg-sky-50"
                        aria-label={`${emoji} invoegen`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Doel URL</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="/updates of /blog/slug"
                  className="admin-input"
                />
                <a
                  href={normalizedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn-secondary h-11 shrink-0"
                  aria-label="Open doel URL"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_URLS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setUrl(item.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${normalizedUrl === item.value ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {urlError ? (
                <span className="mt-2 block text-xs font-bold text-red-600">{urlError}</span>
              ) : (
                <span className="mt-2 block text-xs text-slate-500">
                  Wordt geopend als <code>{normalizedUrl}</code>
                </span>
              )}
            </label>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
            )}
            {success && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                Verstuurd naar {success.sent} van {success.total} toestellen
                {success.failed > 0 ? ` (${success.failed} mislukt` : ''}
                {success.expired > 0 ? `, ${success.expired} verlopen verwijderd` : ''}
                {success.failed > 0 ? ')' : ''}.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={!canSend} className="admin-btn-primary px-5 py-3">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending
                  ? 'Versturen...'
                  : `Verstuur naar ${subscriberCount ?? 0} abonnee${subscriberCount === 1 ? '' : 's'}`}
              </button>
              <button type="button" onClick={clearDraft} disabled={!hasDraft || sending} className="admin-btn-secondary px-5 py-3">
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="admin-surface overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="admin-eyebrow">Live preview</p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-black text-slate-950">
                <Smartphone size={18} className="text-sky-600" /> Zoals op telefoon
              </h2>
            </div>
            <div className="bg-slate-950 p-5">
              <div className="rounded-[2rem] border border-slate-700 bg-slate-900 p-4 text-white shadow-2xl">
                <div className="mb-3 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>HondAanZee</span>
                  <span>nu</span>
                </div>
                <div className="flex gap-3">
                  <img src="/notification-icon-192.png" alt="" className="h-11 w-11 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-black leading-snug">{previewTitle}</h3>
                    <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-slate-300">{previewBody}</p>
                    <div className="mt-3 inline-flex max-w-full items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-sky-300">
                      <LinkIcon size={11} />
                      <span className="truncate">{normalizedUrl}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2 px-5 py-4 text-xs text-slate-500">
              <p><strong className="text-slate-700">Tip:</strong> zet de belangrijkste woorden in de eerste 6 woorden.</p>
              <p><strong className="text-slate-700">Lengte:</strong> korter dan 90 tekens in de titel leest het best op mobiel.</p>
            </div>
          </section>

          <section className="admin-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <Bell size={16} className="text-sky-600" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">Checklist</h3>
            </div>
            <ul className="space-y-2 text-sm font-medium">
              <li className={title.trim() ? 'text-emerald-700' : 'text-slate-500'}>✓ Titel ingevuld</li>
              <li className={body.length <= BODY_LIMIT ? 'text-emerald-700' : 'text-red-700'}>✓ Bericht binnen limiet</li>
              <li className={!urlError ? 'text-emerald-700' : 'text-red-700'}>✓ Geldige link</li>
              <li className={(subscriberCount ?? 0) > 0 ? 'text-emerald-700' : 'text-slate-500'}>✓ Minstens 1 abonnee</li>
            </ul>
          </section>
        </aside>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-slate-500" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
              Laatste verzendingen
            </h3>
          </div>
          <button type="button" onClick={() => void loadStats()} disabled={loadingStats} className="admin-btn-subtle">
            {loadingStats ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Refresh
          </button>
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-slate-500">Nog geen notificaties verstuurd.</p>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {log.map((entry) => (
              <li key={entry.id} className="admin-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900">{entry.title}</h4>
                    {entry.body && <p className="mt-1 text-sm text-slate-600">{entry.body}</p>}
                  </div>
                  <button type="button" onClick={() => reuseLogEntry(entry)} className="admin-btn-subtle shrink-0 px-3 py-2 text-xs">
                    <Copy size={13} /> Hergebruik
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>{formatDateTime(entry.created_at)}</span>
                  <span><strong className="text-emerald-600">{entry.sent_count}</strong> verzonden</span>
                  {entry.failed_count > 0 && (
                    <span><strong className="text-red-600">{entry.failed_count}</strong> mislukt</span>
                  )}
                  <span>{entry.total_count} totaal</span>
                  {entry.url && <span className="truncate">→ {entry.url}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
};

export default AdminNotifications;
