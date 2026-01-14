import { create } from 'zustand';

interface UIState {
    isAuthModalOpen: boolean;
    authView: 'signin' | 'signup' | 'forgot-password';
    openAuthModal: (view?: 'signin' | 'signup') => void;
    closeAuthModal: () => void;
    setAuthView: (view: 'signin' | 'signup' | 'forgot-password') => void;
}

export const useUIStore = create<UIState>((set) => ({
    isAuthModalOpen: false,
    authView: 'signin',
    openAuthModal: (view = 'signin') => set({ isAuthModalOpen: true, authView: view }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
    setAuthView: (view) => set({ authView: view }),
}));
