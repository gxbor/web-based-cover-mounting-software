import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, SavedConfig } from '../types/auth';
import { BookConfig } from '../types/book';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  showProfileModal: boolean;
  savedConfigs: SavedConfig[];
  setUser: (user: User | null) => void;
  setShowAuthModal: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
  saveConfig: (config: BookConfig, name?: string) => void;
  deleteConfig: (id: string) => void;
  updateConfig: (id: string, updates: Partial<SavedConfig>) => void;
  logout: () => void;
  initializeAuthListener: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      showAuthModal: false,
      showProfileModal: false,
      savedConfigs: [],
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setShowAuthModal: (show) => set({ showAuthModal: show }),
      setShowProfileModal: (show) => set({ showProfileModal: show }),
      saveConfig: (config, name) => set((state) => {
        const newConfig: SavedConfig = {
          id: Date.now().toString(),
          name: name || `Book ${state.savedConfigs.length + 1}`,
          config,
          timestamp: Date.now()
        };
        return {
          savedConfigs: [...state.savedConfigs, newConfig]
        };
      }),
      deleteConfig: (id) => set((state) => ({
        savedConfigs: state.savedConfigs.filter(config => config.id !== id)
      })),
      updateConfig: (id, updates) => set((state) => ({
        savedConfigs: state.savedConfigs.map(config => 
          config.id === id ? { ...config, ...updates } : config
        )
      })),
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        savedConfigs: [],
        showAuthModal: false,
        showProfileModal: false,
        isLoading: false
      }),
      initializeAuthListener: () => {
        // Set up Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            set({
              user: {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.email?.split('@')[0] || '',
                savedConfigs: []
              },
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              savedConfigs: [],
              isLoading: false
            });
          }
        });

        // Clean up listener on unmount
        return () => unsubscribe();
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        savedConfigs: state.savedConfigs,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);