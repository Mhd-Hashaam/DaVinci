'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface EditNameModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EditNameModal({ isOpen, onClose }: EditNameModalProps) {
    const { profile, user, updateProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
    });

    // Sync form data when modal opens or profile changes
    useEffect(() => {
        if (isOpen && profile) {
            setFormData({
                username: profile.username || '',
                bio: profile.bio || '',
            });
        }
    }, [isOpen, profile]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            const result = await updateProfile({
                username: formData.username || null,
                bio: formData.bio || null,
            });

            if (result?.success) {
                onClose();
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                />

                {/* Modal - Ultra Glassmorphism */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md rounded-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                        backdropFilter: 'blur(50px) saturate(200%)',
                        WebkitBackdropFilter: 'blur(50px) saturate(200%)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 40px 80px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.02)'
                    }}
                >
                    {/* Glossy Overlay/Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-purple-500/10 pointer-events-none opacity-50" />

                    {/* Header */}
                    <div className="relative flex items-center justify-between px-8 py-6">
                        <h2 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">Profile Identity</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative px-8 pb-8 space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-zinc-200 text-base placeholder-zinc-600 focus:border-purple-500/30 focus:outline-none transition-all"
                                placeholder="Your name..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">
                                Bio <span className="text-zinc-700">(optional)</span>
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-zinc-200 text-base placeholder-zinc-600 focus:border-purple-500/30 focus:outline-none transition-all resize-none"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>

                    {/* Footer - Minimal */}
                    <div className="relative flex items-center justify-end gap-3 px-8 py-6">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-zinc-500 text-xs font-bold hover:text-white transition-colors cursor-pointer"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2.5 rounded-xl bg-purple-500 text-white text-xs font-black hover:bg-purple-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(155,135,245,0.4)] disabled:opacity-50"
                        >
                            {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
