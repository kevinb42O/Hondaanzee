import React, { useEffect, useState } from 'react';
import { Bell, Loader2, LogOut, Send, Users } from 'lucide-react';
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

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SendResult | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [log, setLog] = useState<PushLogEntry[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

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

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Titel is verplicht.');
      return;
    }
    if (trimmedTitle.length > 120) {
      setError('Titel is te lang (max 120 tekens).');
      return;
    }
    if (body.length > 400) {
      setError('Bericht is te lang (max 400 tekens).');
      return;
    }

    if (!confirm(`Notificatie versturen naar ${subscriberCount ?? 'alle'} abonnees?`)) {
      return;
    }

    setSending(true);
    try {
      const result = await callAdmin<SendResult>('send-push', {
        title: trimmedTitle,
        body: body.trim(),
        url: url.trim() || '/',
      });
      setSuccess(result);
      setTitle('');
      setBody('');
      setUrl('/');
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
        subtitle="Bericht wordt direct verstuurd naar alle aangemelde toestellen (Android, iOS PWA, desktop)."
        sessionEmail={session.user?.email || undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Meldpunt
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
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
            {loadingStats ? '…' : (subscriberCount ?? 0)}
          </div>
        </div>
      </div>

      <form onSubmit={handleSend} className="admin-surface mt-6 space-y-5 p-6">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Titel <span className="font-normal text-slate-400">({title.length}/120)</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Bv. Nieuwe blogpost: zomerregels strand"
            className="admin-input"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Bericht <span className="font-normal text-slate-400">({body.length}/400)</span>
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={400}
            rows={4}
            placeholder="Korte tekst die in de notificatie komt."
            className="admin-input"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Doel URL</span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/blog/zomerregels-strand of /"
            className="admin-input"
          />
          <span className="mt-1 block text-xs text-slate-500">
            Pad op de site (bv. <code>/blog</code>) of volledige URL.
          </span>
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

        <button
          type="submit"
          disabled={sending || !title.trim() || (subscriberCount ?? 0) === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending
            ? 'Versturen…'
            : `Verstuur naar ${subscriberCount ?? 0} abonnee${subscriberCount === 1 ? '' : 's'}`}
        </button>
      </form>

      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Bell size={16} className="text-slate-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">
            Laatste verzendingen
          </h3>
        </div>
        {log.length === 0 ? (
          <p className="text-sm text-slate-500">Nog geen notificaties verstuurd.</p>
        ) : (
          <ul className="space-y-2">
            {log.map((entry) => (
              <li key={entry.id} className="admin-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="font-bold text-slate-900">{entry.title}</h4>
                  <span className="text-xs text-slate-500">{formatDateTime(entry.created_at)}</span>
                </div>
                {entry.body && <p className="mt-1 text-sm text-slate-600">{entry.body}</p>}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>
                    <strong className="text-emerald-600">{entry.sent_count}</strong> verzonden
                  </span>
                  {entry.failed_count > 0 && (
                    <span>
                      <strong className="text-red-600">{entry.failed_count}</strong> mislukt
                    </span>
                  )}
                  <span>{entry.total_count} totaal</span>
                  {entry.url && <span>→ {entry.url}</span>}
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
