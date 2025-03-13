
import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: { id: string; email: string; firstname?: string; lastname?: string } | null;
  login: (email: string, password: string, userData?: { firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (email: string, password: string, userData?: { firstName: string; lastName: string }) => {
    try {
      let authResponse;
      
      if (userData) {
        authResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstname: userData.firstName,
              lastname: userData.lastName,
            },
          },
        });
      } else {
        authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (authResponse.error) {
        throw authResponse.error;
      }

      const user = authResponse.data.user;
      if (!user) {
        throw new Error('No user data returned');
      }

      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select()
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            firstname: userData?.firstName,
            lastname: userData?.lastName,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        set({
          user: {
            id: user.id,
            email: user.email!,
            firstname: userData?.firstName,
            lastname: userData?.lastName,
          }
        });
      } else if (existingUser) {
        set({
          user: {
            id: existingUser.id,
            email: existingUser.email,
            firstname: existingUser.firstname || undefined,
            lastname: existingUser.lastname || undefined,
          }
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));