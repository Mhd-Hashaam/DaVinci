'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, User, Globe, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import type { ProfileRow } from '@/types/database';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AVATAR_PRESETS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Cosmic',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Neon',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Galaxy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aurora',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Vortex',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Quantum',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Prism',
];

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { profile, user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'details' | 'avatar'>('details');
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form state
    const [formData, setFormData] = useState({
        username: profile?.username || '',
        full_name: profile?.full_name || '',
        bio: profile?.bio || '',
        website: profile?.website || '',
    });

    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(profile?.avatar_url || null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            let avatarUrl = selectedAvatar;

            // If user uploaded a new file, upload it to storage
            if (uploadedFile) {
                const fileExt = uploadedFile.name.split('.').pop();
                const fileName = `${user.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, uploadedFile, {
                        cacheControl: '3600',
                        upsert: true,
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                avatarUrl = urlData.publicUrl;
            }

            // Update profile
            const updates: Partial<ProfileRow> = {
                ...formData,
                avatar_url: avatarUrl,
            };

            const result = await updateProfile(updates);

            if (result?.success) {
                onClose();
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedAvatar(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-auto rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-20 flex items-center justify-between px-8 py-6 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Sparkles className="w-6 h-6 text-purple-500" />
                                    Edit Profile
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Customize your identity</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 px-8 py-4 bg-black/20 border-b border-white/5">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'details'
                                        ? 'bg-white text-black'
                                        : 'bg-white/5 text-zinc-500 hover:text-white'
                                    }`}
                            >
                                <User className="w-4 h-4 inline mr-2" />
                                Details
                            </button>
                            <button
                                onClick={() => setActiveTab('avatar')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'avatar'
                                        ? 'bg-white text-black'
                                        : 'bg-white/5 text-zinc-500 hover:text-white'
                                    }`}
                            >
                                <Upload className="w-4 h-4 inline mr-2" />
                                Avatar
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {activeTab === 'details' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none transition-all"
                                            placeholder="Your display name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none transition-all resize-none"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:border-purple-500 focus:outline-none transition-all"
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'avatar' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Preview */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-2xl mb-4">
                                            {selectedAvatar ? (
                                                <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white">
                                                    {formData.username?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500">Current Avatar</p>
                                    </div>

                                    {/* Upload Zone */}
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 bg-white/5 hover:bg-white/10 transition-all text-center">
                                            <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                                            <p className="text-white font-medium">Click or drag to upload</p>
                                            <p className="text-xs text-zinc-500 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>

                                    {/* Presets */}
                                    <div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-pink-500" />
                                            Preset Avatars
                                        </h3>
                                        <div className="grid grid-cols-4 gap-4">
                                            {AVATAR_PRESETS.map((preset, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setSelectedAvatar(preset);
                                                        setUploadedFile(null);
                                                    }}
                                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === preset
                                                            ? 'border-purple-500 ring-4 ring-purple-500/30'
                                                            : 'border-white/10 hover:border-white/30'
                                                        }`}
                                                >
                                                    <img src={preset} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 flex items-center justify-end gap-4 px-8 py-6 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-sm font-bold hover:from-purple-500 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
