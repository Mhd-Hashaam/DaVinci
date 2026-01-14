'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image, Camera, Sparkles, Trash2, ArrowLeft, Smile } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';

interface ChangeAvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ILLUSTRATION_PRESETS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Cosmic',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Neon',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Galaxy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aurora',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Vortex',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Quantum',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Prism',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Nebula',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Phoenix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Dragon',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Warrior',
];

export function ChangeAvatarModal({ isOpen, onClose }: ChangeAvatarModalProps) {
    const { user, profile, updateProfile } = useAuth();
    const [selectedMode, setSelectedMode] = useState<'browse' | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            let avatarUrl = previewUrl;

            // If we have an uploaded file, upload to Supabase
            if (uploadedFile) {
                const fileExt = uploadedFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, uploadedFile, { cacheControl: '3600', upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                avatarUrl = urlData.publicUrl;
            }

            await updateProfile({ avatar_url: avatarUrl });
            resetAndClose();
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveImage = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ avatar_url: null });
            resetAndClose();
        } catch (error) {
            console.error('Remove error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSelectIllustration = (url: string) => {
        setPreviewUrl(url);
        setUploadedFile(null);
        setSelectedMode(null);
    };

    const resetAndClose = () => {
        setPreviewUrl(null);
        setUploadedFile(null);
        setSelectedMode(null);
        onClose();
    };

    if (!isOpen) return null;

    const currentAvatar = previewUrl || profile?.avatar_url;
    const hasChanges = previewUrl !== null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={resetAndClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg rounded-3xl overflow-hidden"
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
                        {selectedMode ? (
                            <button
                                onClick={() => setSelectedMode(null)}
                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-bold uppercase tracking-wider">Back</span>
                            </button>
                        ) : (
                            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">Avatar Identity</h2>
                        )}
                        <button
                            onClick={resetAndClose}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Current Avatar Preview */}
                    <div className="relative flex flex-col items-center py-8">
                        <div className="relative">
                            <div className="w-40 h-40 rounded-full overflow-hidden border border-white/10 shadow-2xl">
                                {currentAvatar ? (
                                    <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-4xl font-bold text-white/50">
                                        {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            {hasChanges && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center border-2 border-black"
                                >
                                    <Sparkles className="w-4 h-4 text-white" />
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Options / Browse View */}
                    {selectedMode === 'browse' ? (
                        <div className="relative px-8 pb-8">
                            <div className="grid grid-cols-4 gap-3 max-h-60 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                {ILLUSTRATION_PRESETS.map((preset, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectIllustration(preset)}
                                        className="aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all cursor-pointer group"
                                    >
                                        <img src={preset} alt={`Preset ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex items-center justify-center gap-10 px-8 py-8 border-b border-white/5">
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

                            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                    <Upload className="w-6 h-6 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white uppercase tracking-wider transition-colors">Device</span>
                            </button>

                            <button onClick={() => window.open('https://www.bitmoji.com/', '_blank')} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                    <Smile className="w-6 h-6 text-zinc-500 group-hover:text-green-400 transition-colors" />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white uppercase tracking-wider transition-colors">Bitmoji</span>
                            </button>

                            <button onClick={() => setSelectedMode('browse')} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                    <Image className="w-6 h-6 text-zinc-500 group-hover:text-pink-400 transition-colors" />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white uppercase tracking-wider transition-colors">Illustrations</span>
                            </button>

                            <button onClick={() => alert('Camera access requires native implementation')} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                    <Camera className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-white uppercase tracking-wider transition-colors">Camera</span>
                            </button>
                        </div>
                    )}

                    {/* Footer - Minimal */}
                    <div className="relative flex items-center justify-between px-8 py-6">
                        {profile?.avatar_url && !hasChanges ? (
                            <button
                                onClick={handleRemoveImage}
                                disabled={isSaving}
                                className="flex items-center gap-2 text-[10px] font-bold text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-widest cursor-pointer disabled:opacity-30"
                            >
                                <Trash2 className="w-3 h-3" />
                                Remove
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                onClick={resetAndClose}
                                className="px-5 py-2.5 rounded-xl text-zinc-500 text-xs font-bold hover:text-white transition-colors cursor-pointer"
                            >
                                CANCEL
                            </button>
                            {hasChanges && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 rounded-xl bg-purple-500 text-white text-xs font-black hover:bg-purple-400 transition-all cursor-pointer shadow-[0_0_20px_rgba(155,135,245,0.4)] disabled:opacity-50"
                                >
                                    {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
