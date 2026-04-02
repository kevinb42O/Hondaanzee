import React from 'react';
import { Loader2, LockKeyhole, LogIn } from 'lucide-react';

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
  <div className="flex min-h-[72vh] items-center justify-center">
    <section className="admin-surface w-full max-w-md p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
          <LockKeyhole size={18} />
        </div>
        <div>
          <p className="admin-eyebrow">Admin sign in</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Log in</h2>
        </div>
      </div>
      <div>
        {sessionLoading ? (
          <div className="admin-surface-subtle flex items-center gap-3 px-4 py-4 text-sm font-medium text-slate-600">
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
                className="admin-input"
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
                className="admin-input"
              />
            </label>

            <button
              type="submit"
              disabled={authLoading}
              className="admin-btn-primary w-full"
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
