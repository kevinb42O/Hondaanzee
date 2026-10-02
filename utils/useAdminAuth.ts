import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient.ts';

export const ADMIN_LOGIN_EMAIL = 'admin@hondaanzee.be';

export const useAdminAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [email, setEmail] = useState(ADMIN_LOGIN_EMAIL);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminAccess, setAdminAccess] = useState<'loading' | 'allowed' | 'denied' | 'error'>('loading');
  const [accessRevision, setAccessRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (!session) { setAdminAccess('denied'); return; }
    setAdminAccess('loading');
    void supabase.functions.invoke('admin-members', { body: { action: 'access' }, headers: { 'x-admin-access-token': session.access_token } }).then(({ data, error }) => {
      if (!active) return;
      setAdminAccess(error ? error.context instanceof Response && error.context.status === 403 ? 'denied' : 'error' : data?.allowed === true ? 'allowed' : 'denied');
    }).catch(() => { if (active) setAdminAccess('error'); });
    return () => { active = false; };
  }, [session?.access_token, accessRevision]);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) {
        return;
      }

      if (error) {
        setAuthError(error.message);
      }

      setSession(data.session ?? null);
      setSessionLoading(false);
    };

    void loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setSessionLoading(false);
      setAuthError(null);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    setAuthLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setAuthError(error.message || 'Kon niet inloggen.');
    } else {
      setPassword('');
    }

    setAuthLoading(false);
  };

  const signOut = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message || 'Kon niet uitloggen. Probeer opnieuw.');
  };

  return {
    adminAccess,
    retryAdminAccess: () => setAccessRevision(value => value + 1),
    authError,
    authLoading,
    email,
    password,
    session,
    sessionLoading,
    setAuthError,
    setEmail,
    setPassword,
    signIn,
    signOut,
  };
};
