'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProfileHeroProps {
    onEdit?: () => void;
}

export function ProfileHero({ onEdit }: ProfileHeroProps) {
    const { user, profile } = useAuth();

    // Format join date
    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    return (
        <div className="relative w-full mb-8">
            {/* Cover Image */}
            <div className="h-48 md:h-64 w-full rounded-b-3xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 animate-gradient-x" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>

            {/* Profile Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20">
                <div className="flex flex-col md:flex-row items-end md:items-end gap-6 mb-4">

                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#09090b] overflow-hidden bg-[#09090b] shadow-2xl ring-2 ring-white/10">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                                    {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        {/* Online Indicator */}
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#09090b] rounded-full" />
                    </motion.div>

                    {/* User Info */}
                    <div className="flex-1 pb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-3xl font-bold text-white"
                                >
                                    {profile?.full_name || 'Creator'}
                                </motion.h1>
                                <div className="flex items-center gap-2 text-zinc-400 mt-1">
                                    <span className="font-medium">@{profile?.username || 'user'}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-xs">
                                        <Calendar size={12} /> Joined {joinedDate}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onEdit}
                                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                                >
                                    <Edit2 size={14} />
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Bio & Meta */}
                        {profile?.bio && (
                            <p className="text-zinc-300 mt-4 max-w-2xl text-sm leading-relaxed">
                                {profile.bio}
                            </p>
                        )}

                        {/* LinksRow */}
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-500">
                            {profile?.website && (
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                                    <LinkIcon size={14} />
                                    {new URL(profile.website).hostname}
                                </a>
                            )}
                            <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>Earth, Milky Way</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
