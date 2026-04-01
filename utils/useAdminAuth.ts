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
    await supabase.auth.signOut();
  };

  return {
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
