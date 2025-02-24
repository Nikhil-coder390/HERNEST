import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isDoctor: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsDoctor: (isDoctor: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isDoctor: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile, isDoctor: profile?.is_doctor || false }),
  setIsDoctor: (isDoctor) => set({ isDoctor }),
}));