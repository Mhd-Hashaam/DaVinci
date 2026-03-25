'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function AdminModal({ isOpen, onClose, title, children }: AdminModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
                    />
                    
                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4 sm:p-0"
                    >
                        <div 
                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                            style={{
                                backgroundImage: `url('/Mockups/Background.webp')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {/* Subtle Overlay to ensure readability */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl z-0" />
                            
                            <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/5 px-8 py-6">
                                <h3 className="font-cormorant text-2xl font-medium tracking-wide text-white">{title}</h3>
                                <button 
                                    onClick={onClose}
                                    className="p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                                >
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            </div>
                            
                            {/* Body */}
                            <div className="p-8">
                                {children}
                            </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
