'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useUIStore } from '@/lib/store/uiStore';
import { SignInForm, SignUpForm } from './AuthForms';

export function AuthModal() {
    const { isAuthModalOpen, authView, closeAuthModal } = useUIStore();

    if (!isAuthModalOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeAuthModal}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Shell */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative w-full max-w-5xl h-[600px] bg-[#09090b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex"
                >
                    {/* Close Button */}
                    <button
                        onClick={closeAuthModal}
                        className="absolute top-6 right-6 z-20 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Split Screen Layout */}
                    {/* We use flex-row for SignIn (Image Left, Form Right) or reverse? 
               User asked for: "Sign in modals that cover almost entire screen... 
               The sign in and sign up forms swape their places to left right with animation."
               
               Let's say:
               SignIn: Form Left, Visual Right
               SignUp: Visual Left, Form Right (Swapped)
            */}

                    <div className={`relative flex w-full h-full ${authView === 'signup' ? 'flex-row-reverse' : 'flex-row'}`}>

                        {/* 1. Form Side */}
                        <motion.div
                            layout
                            className="w-full md:w-1/2 h-full bg-[#09090b] relative z-10"
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                        >
                            <AnimatePresence mode="wait">
                                {authView === 'signin' ? (
                                    <motion.div
                                        key="signin"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="h-full"
                                    >
                                        <SignInForm />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="signup"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full"
                                    >
                                        <SignUpForm />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* 2. Visual Side */}
                        <motion.div
                            layout
                            className="hidden md:block w-1/2 h-full relative overflow-hidden"
                        >
                            {/* Dynamic Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={authView === 'signin'
                                        ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                                        : "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop"
                                    }
                                    className="w-full h-full object-cover transition-all duration-700"
                                    alt="Visual"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute bottom-12 left-12 right-12 z-10">
                                <motion.div
                                    key={authView}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h3 className="text-3xl font-bold text-white mb-4">
                                        {authView === 'signin' ? 'Redefine Reality.' : 'Join the Vanguard.'}
                                    </h3>
                                    <p className="text-zinc-300 text-lg leading-relaxed">
                                        {authView === 'signin'
                                            ? 'Access your personal studio and continue crafting the impossible with DaVinci AI.'
                                            : 'Start creating professional-grade generative art today. No credit card required for trial.'
                                        }
                                    </p>
                                </motion.div>
                            </div>

                            {/* Logo Overlay */}
                            <div className="absolute top-8 left-8 z-10">
                                <span className="text-2xl font-bold tracking-tighter text-white">DaVinci.</span>
                            </div>

                        </motion.div>

                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
