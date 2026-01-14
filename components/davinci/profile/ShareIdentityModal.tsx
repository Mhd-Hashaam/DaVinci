'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Link as LinkIcon, Check, Facebook, Twitter, Linkedin, MessageCircle, Mail } from 'lucide-react';

interface ShareIdentityModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
}

export function ShareIdentityModal({ isOpen, onClose, username }: ShareIdentityModalProps) {
    const [copied, setCopied] = useState(false);
    const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${username}` : '';

    const handleCopyLink = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        {
            name: 'WhatsApp',
            bgColor: 'bg-[#25D366]',
            icon: <MessageCircle className="w-7 h-7 fill-current" />,
            onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent('Check out my DaVinci profile! ' + profileUrl)}`, '_blank'),
        },
        {
            name: 'Facebook',
            bgColor: 'bg-[#1877F2]',
            icon: <Facebook className="w-7 h-7 fill-current" />,
            onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank'),
        },
        {
            name: 'X / Twitter',
            bgColor: 'bg-black border border-white/10',
            icon: <Twitter className="w-6 h-6 fill-current" />,
            onClick: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=Check out my DaVinci profile!`, '_blank'),
        },
        {
            name: 'LinkedIn',
            bgColor: 'bg-[#0A66C2]',
            icon: <Linkedin className="w-6 h-6 fill-current" />,
            onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank'),
        },
        {
            name: 'Email',
            bgColor: 'bg-zinc-600',
            icon: <Mail className="w-7 h-7" />,
            onClick: () => window.open(`mailto:?subject=Check out my DaVinci profile&body=${encodeURIComponent(profileUrl)}`, '_blank'),
        },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                        <h2 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">Share Identity</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative px-8 pb-8 space-y-8">
                        {/* Copy Link */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">
                                Profile URL
                            </label>
                            <div className="flex gap-2 p-2 bg-black/40 border border-white/10 rounded-2xl items-center">
                                <span className="flex-1 px-3 text-zinc-400 text-sm truncate select-all font-medium">
                                    {profileUrl}
                                </span>
                                <button
                                    onClick={handleCopyLink}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${copied
                                        ? 'bg-zinc-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                        }`}
                                >
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        {/* Social Sharing - Horizontal Scroll */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-zinc-300 pl-1">
                                Share
                            </label>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent -mx-2 px-2">
                                {shareOptions.map((option) => (
                                    <button
                                        key={option.name}
                                        onClick={option.onClick}
                                        className="flex flex-col items-center gap-2 min-w-[72px] group cursor-pointer"
                                    >
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${option.bgColor}`}>
                                            {option.icon}
                                        </div>
                                        <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                            {option.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>


                </motion.div>
            </div>
        </AnimatePresence>
    );
}
