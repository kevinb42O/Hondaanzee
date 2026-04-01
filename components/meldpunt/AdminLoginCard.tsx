import React from 'react';
import { Loader2, LogIn } from 'lucide-react';

interface AdminLoginCardProps {
  authLoading: boolean;
  email: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => Promise<void> | void;
  password: string;
  sessionLoading: boolean;
}

const AdminLoginCard: React.FC<AdminLoginCardProps> = ({
  authLoading,
  email,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  password,
  sessionLoading,
}) => (
  <div className="mb-8 flex min-h-[72vh] items-center justify-center">
    <section className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_40px_120px_-50px_rgba(15,23,42,0.5)]">
      <div className="border-b border-slate-100 px-7 py-6 sm:px-8">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Admin sign in</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Log in</h2>
      </div>

      <div className="px-7 py-7 sm:px-8 sm:py-8">
        {sessionLoading ? (
          <div className="flex items-center gap-3 rounded-[1.6rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600">
            <Loader2 size={16} className="animate-spin" />
            Sessie controleren...
          </div>
        ) : (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              await onSubmit();
            }}
            className="space-y-5"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Emailadres</span>
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Wachtwoord</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder="Voer je wachtwoord in"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
              />
            </label>

            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              Inloggen
            </button>
          </form>
        )}
      </div>
    </section>
  </div>
);

export default AdminLoginCard;
