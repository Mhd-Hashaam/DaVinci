'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSessionManager, SessionManager } from '@/lib/storage/SessionManager';
import type { GeneratedImage } from '@/types';
import type { SettingsRow } from '@/types/database';

interface UseSessionReturn {
    // Session
    sessionId: string;
    isLoading: boolean;
    isReady: boolean;

    // Images
    images: GeneratedImage[];
    saveImage: (image: GeneratedImage) => Promise<void>;
    deleteImage: (imageId: string) => Promise<void>;

    // Bookmarks
    bookmarks: GeneratedImage[];
    toggleBookmark: (imageId: string) => Promise<boolean>;
    isBookmarked: (imageId: string) => boolean;

    // Settings
    settings: Partial<SettingsRow>;
    updateSettings: (settings: Partial<SettingsRow>) => void;
}

/**
 * React hook for Supabase-backed session management
 * Handles loading, saving, and syncing app state
 */
export function useSession(): UseSessionReturn {
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [images, setImages] = useState<GeneratedImage[]>([]);
    const [bookmarks, setBookmarks] = useState<GeneratedImage[]>([]);
    const [settings, setSettings] = useState<Partial<SettingsRow>>({});

    const managerRef = useRef<SessionManager | null>(null);

    // Initialize session manager
    useEffect(() => {
        const manager = getSessionManager();
        managerRef.current = manager;

        // Load all data from Supabase
        async function loadSession() {
            setIsLoading(true);
            try {
                const [loadedImages, loadedBookmarks, loadedSettings] = await Promise.all([
                    manager.loadImages(),
                    manager.loadBookmarks(),
                    manager.loadSettings(),
                ]);

                setImages(loadedImages);
                setBookmarks(loadedBookmarks);
                if (loadedSettings) {
                    setSettings(loadedSettings);
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setIsLoading(false);
                setIsReady(true);
            }
        }

        loadSession();
    }, []);

    // Auto-save settings periodically
    useEffect(() => {
        if (!managerRef.current || !isReady) return;

        const manager = managerRef.current;
        manager.startAutoSave(settings, 30000); // Save every 30 seconds

        return () => {
            manager.stopAutoSave();
        };
    }, [settings, isReady]);

    // Save image and add to local state
    const saveImage = useCallback(async (image: GeneratedImage) => {
        setImages(prev => [image, ...prev]);

        if (managerRef.current) {
            await managerRef.current.saveImage(image);
        }
    }, []);

    // Delete image
    const deleteImage = useCallback(async (imageId: string) => {
        setImages(prev => prev.filter(img => img.id !== imageId));

        if (managerRef.current) {
            await managerRef.current.deleteImage(imageId);
        }
    }, []);

    // Toggle bookmark
    const toggleBookmark = useCallback(async (imageId: string, fallbackImage?: GeneratedImage) => {
        // Try to find image in local state, or use fallback
        const image = images.find(img => img.id === imageId) || fallbackImage;

        if (!image) {
            console.warn('Cannot bookmark: Image not found and no fallback provided');
            return false;
        }

        const isCurrentlyBookmarked = bookmarks.some(b => b.id === imageId);

        if (isCurrentlyBookmarked) {
            setBookmarks(prev => prev.filter(b => b.id !== imageId));
        } else {
            setBookmarks(prev => [image, ...prev]);
        }

        if (managerRef.current) {
            // We might need to ensure the image is saved to storage if it's a gallery image
            // But for now, just toggling bookmark capability
            return managerRef.current.toggleBookmark(imageId, image);
        }
        return !isCurrentlyBookmarked;
    }, [images, bookmarks]);

    // Check if bookmarked
    const isBookmarked = useCallback((imageId: string) => {
        return bookmarks.some(b => b.id === imageId);
    }, [bookmarks]);

    // Update settings
    const updateSettings = useCallback((newSettings: Partial<SettingsRow>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    return {
        sessionId: managerRef.current?.session || '',
        isLoading,
        isReady,
        images,
        saveImage,
        deleteImage,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        settings,
        updateSettings,
    };
}
