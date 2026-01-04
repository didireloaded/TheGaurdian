import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session: session,
        loading: false,
        isAuthenticated: !!session,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session: session,
        loading: false,
        isAuthenticated: !!session,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

// Hook for protected routes - redirects to auth if not logged in
export function useRequireAuth() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  return { user, loading, isAuthenticated };
}

// Hook for auth actions
export function useAuthActions() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });

      navigate('/auth', { replace: true });
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully',
      });

      navigate('/', { replace: true });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          display_name: fullName,
        });
      }

      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account',
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the reset link',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Password reset failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Password updated',
        description: 'Your password has been changed successfully',
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Password update failed',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };

  return {
    signOut,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
  };
}