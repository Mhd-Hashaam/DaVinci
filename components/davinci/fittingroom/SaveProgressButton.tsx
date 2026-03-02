import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { useDaVinciUIStore } from '@/lib/store/davinciUIStore';
import { CanvasCaptureService } from '@/lib/services/canvasCapture';
import { FittingRoomProgressService } from '@/lib/services/fittingRoomProgress';
import { SaveProgressModal } from './SaveProgressModal';
import { toast } from 'sonner';

interface SaveProgressButtonProps {
    mirrorRef: React.RefObject<HTMLDivElement | null>;
}

export const SaveProgressButton = ({ mirrorRef }: SaveProgressButtonProps) => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

    // Store Actions
    const getSnapshot = useFittingRoomStore(state => state.getSnapshot);
    const openAuthModal = useDaVinciUIStore(state => state.openAuthModal);
    const setPostLoginTab = useDaVinciUIStore(state => state.setPostLoginTab);
    const setPendingSaveFromMirror = useDaVinciUIStore(state => state.setPendingSaveFromMirror);
    const pendingSaveFromMirror = useDaVinciUIStore(state => state.pendingSaveFromMirror);

    // Watch for deferred save after Login
    React.useEffect(() => {
        if (user && pendingSaveFromMirror) {
            handleInitialClick();
            setPendingSaveFromMirror(false);
        }
    }, [user, pendingSaveFromMirror]);

    const handleInitialClick = async () => {
        // 1. Capture snapshot immediately (needed for auth flow backup or authentic save)
        if (!mirrorRef.current) return;

        try {
            const blob = await CanvasCaptureService.captureMirror(mirrorRef.current);
            const webpBlob = await CanvasCaptureService.compressToWebP(blob);
            const url = URL.createObjectURL(webpBlob);

            setPreviewBlob(webpBlob);
            setPreviewImage(url);

            if (!user) {
                // Unauthenticated Flow
                setPostLoginTab('myworks');
                setPendingSaveFromMirror(true);
                // We could stash the snapshot content in sessionStorage here if robust persistence across auth redirect is needed
                // For modal auth (in-place), state remains in memory usually. 
                // But full persistence: sessionStorage.setItem('pendingSnapshot', JSON.stringify(getSnapshot()));
                openAuthModal('signup');
            } else {
                // Authenticated Flow
                setIsModalOpen(true);
            }
        } catch (error) {
            toast.error('Failed to capture session');
            console.error(error);
        }
    };

    const handleSaveConfirm = async (title?: string) => {
        console.log('[SaveButton] Save confirm clicked with title:', title);
        if (!user || !previewBlob) {
            console.warn('[SaveButton] Missing user or previewBlob:', { hasUser: !!user, hasBlob: !!previewBlob });
            return;
        }

        const snapshot = getSnapshot();

        try {
            await FittingRoomProgressService.saveProgress({
                userId: user.id,
                title,
                previewBlob: previewBlob,
                state: snapshot
            });
            toast.success('Session saved to Profile');
        } catch (error: any) {
            console.error('[SaveButton] Save failed:', error);
            if (error.message?.toLowerCase().includes('session') || error.message?.toLowerCase().includes('sign in')) {
                toast.error('Session expired. Please sign out and sign in again.');
            } else if (error.message?.toLowerCase().includes('upload')) {
                toast.error('Image upload failed. Check your connection and try again.');
            } else {
                toast.error('Save failed. Please try again.');
            }
        }
    };


    return (
        <>
            <button
                onClick={handleInitialClick}
                className="group relative flex items-center justify-center h-10 w-10 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 z-10"
                aria-label="Save Progress"
            >
                <Save size={18} className="text-white/80 group-hover:text-white transition-colors" />

                {/* Tooltip */}
                <div className="absolute right-full mr-3 px-2 py-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Save Progress
                </div>
            </button>

            <SaveProgressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveConfirm}
                previewImage={previewImage}
            />
        </>
    );
};
