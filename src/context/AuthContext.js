import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigError } from '../config/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const withTimeout = (promise, ms, message) => {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(message));
      }, ms);
    });

    return Promise.race([promise, timeout]).finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  };

  const ensureProfileRecord = async (authUser) => {
    if (!supabase || !authUser?.id || !authUser?.email) {
      return;
    }

    const displayNameFromMeta = authUser.user_metadata?.display_name;
    const fallbackName = authUser.email.split('@')[0];
    const displayName = (displayNameFromMeta || fallbackName || 'User').trim();

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: authUser.id,
        email: authUser.email,
        display_name: displayName,
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.error('Profile upsert warning:', profileError.message);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setError(supabaseConfigError || 'Supabase is not configured.');
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          10000,
          'Session request timed out. Please check your connection.'
        );
        if (error) throw error;
        const currentUser = data?.session?.user || null;
        setUser(currentUser);
        if (currentUser) {
          await ensureProfileRecord(currentUser);
        }
      } catch (err) {
        console.error('Session error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const sessionUser = session?.user || null;
        setUser(sessionUser);
        if (sessionUser && event === 'SIGNED_IN') {
          await ensureProfileRecord(sessionUser);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, displayName) => {
    if (!supabase) {
      const configError = new Error(supabaseConfigError || 'Supabase is not configured.');
      setError(configError.message);
      return { user: null, error: configError };
    }

    try {
      setError(null);
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      }),
        15000,
        'Sign up timed out. Please try again.'
      );
      if (error) throw error;

      if (data?.user?.identities && data.user.identities.length === 0) {
        const existingUserError = new Error('An account with this email already exists. Please log in instead.');
        return { user: null, error: existingUserError };
      }

      const signedUpUser = data?.user || null;
      if (signedUpUser) {
        await ensureProfileRecord(signedUpUser);
      }
      return { user: data.user, error: null };
    } catch (err) {
      const handledError = err instanceof Error ? err : new Error(String(err));
      setError(handledError.message);
      return { user: null, error: handledError };
    }
  };

  const signIn = async (email, password) => {
    if (!supabase) {
      const configError = new Error(supabaseConfigError || 'Supabase is not configured.');
      setError(configError.message);
      return { user: null, error: configError };
    }

    try {
      setError(null);
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        15000,
        'Login timed out. Please check your connection and try again.'
      );
      if (error) throw error;
      setUser(data.user);
      await ensureProfileRecord(data.user);
      return { user: data.user, error: null };
    } catch (err) {
      const handledError = err instanceof Error ? err : new Error(String(err));
      setError(handledError.message);
      return { user: null, error: handledError };
    }
  };

  const signOut = async () => {
    if (!supabase) {
      const configError = new Error(supabaseConfigError || 'Supabase is not configured.');
      setError(configError.message);
      return { error: configError };
    }

    try {
      setError(null);
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        10000,
        'Sign out timed out. Please try again.'
      );
      if (error) throw error;
      setUser(null);
      return { error: null };
    } catch (err) {
      const handledError = err instanceof Error ? err : new Error(String(err));
      setError(handledError.message);
      return { error: handledError };
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
