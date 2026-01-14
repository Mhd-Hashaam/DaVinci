'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, User, Globe, FileText, Camera } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { BorderBeam } from '@/components/ui/border-beam';

const profileSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(20),
    full_name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
    bio: z.string().max(160, 'Bio must be less than 160 characters').optional().or(z.literal('')),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProfileValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { profile, setProfile, user } = useAuth();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: '',
            full_name: '',
            bio: '',
            website: '',
        }
    });

    // Sync form with profile data when modal opens
    useEffect(() => {
        if (isOpen && profile) {
            reset({
                username: profile.username || '',
                full_name: profile.full_name || '',
                bio: profile.bio || '',
                website: profile.website || '',
            });
        }
    }, [isOpen, profile, reset]);

    const onSubmit = async (data: ProfileValues) => {
        if (!user) {
            alert("No user found");
            return;
        }
        setLoading(true);

        try {
            const updates = {
                id: user.id, // Use user.id, not profile.id
                username: data.username,
                full_name: data.full_name,
                bio: data.bio,
                website: data.website,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates as any);

            if (error) throw error;

            // Update local state
            // If profile was null, we mistakenly can't spread it. 
            // Better to fetch fresh or mock it.
            setProfile({
                ...(profile || {}),
                ...updates,
                id: user.id // Ensure ID is present
            } as any);

            onClose();
        } catch (error: any) {
            console.error(error);
            alert('Error updating profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-[#09090b] rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                        <button
                            onClick={onClose}
                            className="text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Username */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400 ml-1">Username</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                <input
                                    {...register('username')}
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:ring-0 transition-all"
                                    placeholder="username"
                                />
                                <BorderBeam size={80} duration={8} borderWidth={1.5} colorFrom="#6366f1" colorTo="#a855f7" className="opacity-0 group-focus-within:opacity-100" />
                            </div>
                            {errors.username && <p className="text-red-400 text-xs ml-1">{errors.username.message}</p>}
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400 ml-1">Display Name</label>
                            <div className="relative group">
                                <input
                                    {...register('full_name')}
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-0 transition-all"
                                    placeholder="John Doe"
                                />
                                <BorderBeam size={80} duration={8} borderWidth={1.5} colorFrom="#6366f1" colorTo="#a855f7" className="opacity-0 group-focus-within:opacity-100" />
                            </div>
                            {errors.full_name && <p className="text-red-400 text-xs ml-1">{errors.full_name.message}</p>}
                        </div>

                        {/* Bio */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400 ml-1">Bio</label>
                            <div className="relative group">
                                <FileText className="absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                <textarea
                                    {...register('bio')}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:ring-0 transition-all resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                                <BorderBeam size={80} duration={8} borderWidth={1.5} colorFrom="#6366f1" colorTo="#a855f7" className="opacity-0 group-focus-within:opacity-100" />
                            </div>
                            {errors.bio && <p className="text-red-400 text-xs ml-1">{errors.bio.message}</p>}
                        </div>

                        {/* Website */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400 ml-1">Website</label>
                            <div className="relative group">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                                <input
                                    {...register('website')}
                                    type="url"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:ring-0 transition-all"
                                    placeholder="https://yourwebsite.com"
                                />
                                <BorderBeam size={80} duration={8} borderWidth={1.5} colorFrom="#6366f1" colorTo="#a855f7" className="opacity-0 group-focus-within:opacity-100" />
                            </div>
                            {errors.website && <p className="text-red-400 text-xs ml-1">{errors.website.message}</p>}
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={14} />}
                                Save Changes
                            </button>
                        </div>

                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
