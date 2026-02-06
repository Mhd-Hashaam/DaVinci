import { create } from 'zustand';

type DaVinciAuthView = 'signin' | 'signup' | 'forgot-password' | 'update-password';

interface DaVinciUIState {
    isAuthModalOpen: boolean;
    authView: DaVinciAuthView;

    postLoginTab: string | null;
    setPostLoginTab: (tab: string | null) => void;

    // Deferred Action State
    pendingSaveFromMirror: boolean;
    setPendingSaveFromMirror: (pending: boolean) => void;

    // Actions
    openAuthModal: (view?: DaVinciAuthView) => void;
    closeAuthModal: () => void;
    setAuthView: (view: DaVinciAuthView) => void;
}

export const useDaVinciUIStore = create<DaVinciUIState>((set) => ({
    isAuthModalOpen: false,
    authView: 'signin',
    postLoginTab: null,
    pendingSaveFromMirror: false,

    openAuthModal: (view = 'signin') => set({ isAuthModalOpen: true, authView: view }),
    closeAuthModal: () => set({ isAuthModalOpen: false }),
    setAuthView: (view) => set({ authView: view }),
    setPostLoginTab: (tab) => set({ postLoginTab: tab }),
    setPendingSaveFromMirror: (pending) => set({ pendingSaveFromMirror: pending }),
}));
