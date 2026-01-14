'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Zap, Pencil, Share2 } from 'lucide-react';
import { EditNameModal } from './EditNameModal';
import { ChangeAvatarModal } from './ChangeAvatarModal';
import { ShareIdentityModal } from './ShareIdentityModal';

interface DaVinciProfileHeroProps {
    profile: any;
    user: any;
}

export function DaVinciProfileHero({ profile, user }: DaVinciProfileHeroProps) {
    const [isEditNameOpen, setIsEditNameOpen] = useState(false);
    const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    // Only show username if profile is loaded; show skeleton otherwise
    const isProfileLoaded = profile !== null;
    const username = profile?.username || (isProfileLoaded ? 'Creator' : null);
    const displayName = username || user?.email?.split('@')[0] || 'Creator';
    const avatarUrl = profile?.avatar_url;

    return (
        <>
            <div className="relative w-full h-[350px] mb-12 rounded-[2rem] overflow-hidden group">
                {/* Background Canvas / Parallax Container */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#050505]" />
                    {/* Cyberpunk Grid/Scanline background */}
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />

                    {/* Horizontal Neon Beams */}
                    <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/4 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent blur-sm"
                    />
                    <motion.div
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent blur-[2px]"
                    />

                    {/* Floating Bokeh / Particles */}
                    <div className="absolute top-10 right-[10%] w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full animate-pulse" />
                    <div className="absolute bottom-10 left-[5%] w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full animate-pulse delay-700" />
                </div>

                {/* Content Container */}
                <div className="relative z-10 w-full h-full flex items-center px-12 gap-10">

                    {/* Avatar Section (Left) */}
                    <div className="relative flex-shrink-0">
                        {/* Retro-futuristic Avatar Frame */}
                        <div className="absolute inset-[-12px] border border-white/5 rounded-full" />
                        <div className="absolute inset-[-6px] border border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite]"
                            style={{ clipPath: 'polygon(0 0, 40% 0, 40% 100%, 0% 100%)' }} />
                        <div className="absolute inset-[-6px] border border-purple-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"
                            style={{ clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 60% 100%)' }} />

                        <div className="relative w-44 h-44 rounded-full overflow-hidden border-2 border-white/10 p-1 bg-black shadow-[0_0_30px_rgba(155,135,245,0.15)]">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#050505] flex items-center justify-center text-5xl font-bold text-white/20">
                                    {isProfileLoaded ? displayName[0].toUpperCase() : '?'}
                                </div>
                            )}
                            {/* Scanline overlay on avatar */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10%] w-full animate-[scan_3s_linear_infinite] pointer-events-none" />
                        </div>

                        {/* Edit Avatar Button */}
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={() => setIsChangeAvatarOpen(true)}
                            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg text-zinc-400 transition-all hover:bg-black hover:border-purple-500 hover:text-purple-400 hover:scale-110 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] z-20 cursor-pointer group"
                        >
                            <Pencil size={18} className="group-hover:rotate-12 transition-transform" />
                        </motion.button>
                    </div>

                    {/* Info Section (Right) */}
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >


                            <h1 className="text-6xl font-black text-white tracking-tighter mb-4 flex items-center gap-4">
                                <span className="relative">
                                    {isProfileLoaded ? (
                                        displayName
                                    ) : (
                                        <span className="inline-block w-48 h-12 bg-white/5 rounded-lg animate-pulse" />
                                    )}
                                    {/* Holographic Underline/Glow */}
                                    <div className="absolute -bottom-2 left-0 w-1/2 h-[3px] bg-gradient-to-r from-purple-400 to-transparent blur-[1px]" />
                                </span>

                                {/* Edit Name Button - Always Visible */}
                                <button
                                    onClick={() => setIsEditNameOpen(true)}
                                    className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg text-zinc-400 transition-all hover:bg-black hover:border-purple-500 hover:text-purple-400 hover:scale-110 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer group"
                                >
                                    <Pencil size={18} className="group-hover:rotate-12 transition-transform" />
                                </button>
                            </h1>

                            <div className="flex gap-8 items-center">
                                {/* Short Stats Summary */}
                                <div className="flex flex-col">
                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Creations</span>
                                    <span className="text-2xl font-mono text-white">128</span>
                                </div>
                                <div className="w-px h-8 bg-white/5" />
                                <div className="flex flex-col">
                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Following</span>
                                    <span className="text-2xl font-mono text-white">42</span>
                                </div>
                                <div className="w-px h-8 bg-white/5" />
                                <div className="flex flex-col">
                                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Followers</span>
                                    <span className="text-2xl font-mono text-white">962</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => setIsShareOpen(true)}
                                    className="px-6 py-2 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-full hover:bg-white/10 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                                >
                                    <Share2 size={14} />
                                    Share Identity
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Cyberpunk Accent (Far Right) */}
                    <div className="hidden lg:flex flex-col gap-1 items-end opacity-20 group-hover:opacity-40 transition-opacity">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-1 bg-white" style={{ width: `${60 - i * 8}px` }} />
                        ))}
                        <span className="text-[10px] font-mono mt-4">AX-709 // DAVINCI_CORE</span>
                    </div>
                </div>

                {/* CSS Animation for Scanline */}
                <style jsx>{`
                    @keyframes scan {
                        from { transform: translateY(-100%); }
                        to { transform: translateY(1000%); }
                    }
                `}</style>
            </div>

            {/* Modals */}
            <EditNameModal isOpen={isEditNameOpen} onClose={() => setIsEditNameOpen(false)} />
            <ChangeAvatarModal isOpen={isChangeAvatarOpen} onClose={() => setIsChangeAvatarOpen(false)} />
            <ShareIdentityModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} username={displayName} />
        </>
    );
}
