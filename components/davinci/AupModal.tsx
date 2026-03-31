'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, AlertTriangle, Check, X } from 'lucide-react';

interface AupModalProps {
    isOpen: boolean;
    onAccept: () => Promise<void>;
    onDecline: () => void;
}

const TERMS = [
    {
        icon: Shield,
        title: 'Safe & Respectful Content Only',
        text: 'Do not generate content that is violent, hateful, sexually explicit, or depicts real individuals without consent.'
    },
    {
        icon: AlertTriangle,
        title: 'No Harmful Intent',
        text: 'AI generation must not be used to produce misleading images, propaganda, or content that could cause real-world harm.'
    },
    {
        icon: Sparkles,
        title: 'Platform & App Store Rules Apply',
        text: 'All output is subject to Google Play and Apple App Store guidelines. Violations will result in account suspension.'
    },
];

export function AupModal({ isOpen, onAccept, onDecline }: AupModalProps) {
    const [isAccepting, setIsAccepting] = useState(false);

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            await onAccept();
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onDecline} />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                        style={{
                            backgroundImage: 'url("/Mockups/Background.webp")',
                            backgroundSize: 'cover',
                        }}
                    >
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-2xl" />

                        <div className="relative p-7 flex flex-col gap-5">
                            {/* Close button */}
                            <button
                                onClick={onDecline}
                                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                            >
                                <X size={14} />
                            </button>

                            {/* Header */}
                            <div className="flex flex-col items-center text-center gap-2 pt-2">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/20 flex items-center justify-center mb-1">
                                    <Sparkles className="text-violet-300" size={22} />
                                </div>
                                <h2 className="font-cormorant text-2xl font-light text-white leading-tight">
                                    Before You Create
                                </h2>
                                <p className="font-outfit text-[13px] text-zinc-400 leading-relaxed">
                                    DaVinci AI is a powerful creative tool. To use it, you must agree to our Acceptable Use Policy.
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/8" />

                            {/* Terms List */}
                            <div className="flex flex-col gap-3.5">
                                {TERMS.map((term, i) => {
                                    const Icon = term.icon;
                                    return (
                                        <div key={i} className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Icon size={14} className="text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="font-outfit text-[12px] font-semibold text-white mb-0.5">{term.title}</p>
                                                <p className="font-outfit text-[11px] text-zinc-500 leading-relaxed">{term.text}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/8" />

                            {/* CTA */}
                            <div className="flex flex-col gap-2.5">
                                <button
                                    onClick={handleAccept}
                                    disabled={isAccepting}
                                    className="w-full h-11 rounded-xl flex items-center justify-center gap-2 font-outfit text-[13px] font-semibold text-white transition-all cursor-pointer disabled:opacity-60"
                                    style={{
                                        background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
                                        boxShadow: '0 4px 30px rgba(168,85,247,0.35)'
                                    }}
                                >
                                    {isAccepting ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check size={15} />
                                            I Agree — Start Creating
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={onDecline}
                                    className="w-full h-9 rounded-xl flex items-center justify-center font-outfit text-[11px] text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
