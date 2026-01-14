'use client';

import React, { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useDaVinciUIStore } from '@/lib/store/davinciUIStore';
import { DaVinciSignInForm, DaVinciSignUpForm } from './DaVinciAuthForms';
import { TheVinciOrb } from './TheVinciOrb';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function DaVinciAuthModal() {
    const { isAuthModalOpen, closeAuthModal, authView } = useDaVinciUIStore();
    const imagePanelRef = useRef<HTMLDivElement>(null);
    const formPanelRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // URL Persistence
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Determine visibility from Store OR URL
    const isUrlAuth = searchParams.get('modal') === 'auth';
    const isOpen = isAuthModalOpen || isUrlAuth;

    const handleClose = () => {
        closeAuthModal(); // Close store state

        // Remove URL param if present
        if (isUrlAuth) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete('modal');
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }
    };

    useGSAP(() => {
        if (window.innerWidth >= 768 && isOpen) { // Only animate on desktop/md+ and if open
            // Fade Out Content (Start of Slide)
            gsap.to('.auth-content-fade', { opacity: 0, filter: 'blur(10px)', duration: 0.8, ease: "power3.in" });

            if (authView === 'signup') {
                // Sign Up State: Form goes Left (0%), Image goes Right (40%)
                gsap.to(formPanelRef.current, { left: '0%', duration: 1.8, ease: "power4.inOut" });
                gsap.to(imagePanelRef.current, { left: '40%', duration: 1.8, ease: "power4.inOut" });
            } else {
                // Sign In State (Default): Image on Left (0%), Form on Right (60%)
                gsap.to(imagePanelRef.current, { left: '0%', duration: 1.8, ease: "power4.inOut" });
                gsap.to(formPanelRef.current, { left: '60%', duration: 1.8, ease: "power4.inOut" });
            }

            // Fade In Content (End of Slide)
            gsap.to('.auth-content-fade', { opacity: 1, filter: 'blur(0px)', duration: 1, delay: 0.8, ease: "power3.out" });
        }
    }, [authView, isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                    className="relative w-[90vw] h-[95vh] z-10"
                >
                    <div
                        ref={containerRef}
                        className="relative w-full h-full bg-[#0a0a15] shadow-2xl overflow-hidden flex md:block" // Flex for mobile (stacking), Block for desktop (absolute)
                        style={{
                            clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)"
                        }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 z-50 p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10 cursor-pointer bg-black/20"
                        >
                            <X size={20} />
                        </button>

                        {/* --- IMAGE PANEL (60%) --- */}
                        <div
                            ref={imagePanelRef}
                            className="
                                hidden md:flex 
                                md:absolute md:top-0 md:w-[60%] md:h-full 
                                md:left-0 /* Default Start Position (SignIn) */
                                flex-col items-center justify-center relative overflow-hidden bg-black
                            "
                        >
                            <img
                                src="/3 Body Embodiment.jpg"
                                alt="DaVinci Art"
                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                        </div>

                        {/* --- FORM PANEL (40%) --- */}
                        <div
                            ref={formPanelRef}
                            className="
                                w-full h-full relative z-10 
                                md:absolute md:top-0 md:w-[40%] md:h-full 
                                md:left-[60%] /* Default Start Position (SignIn) */
                                flex flex-col items-center justify-center px-10 py-8
                                bg-[#0a0a15] /* Background to cover image when sliding */
                            "
                        >
                            {/* Header with Brain Icon */}
                            <div className="flex flex-col items-center mb-4">
                                <span className="auth-content-fade text-zinc-100 text-2xl tracking-tighter font-sans mb-4">
                                    Join <span className="text-purple-400">VinCi</span>
                                </span>
                                <div className="relative flex items-center justify-center w-full">
                                    <TheVinciOrb size={128} position={[-0.1, 0.2, 0]} width={280} height={140} debug={true} orbScale={1} />
                                </div>
                            </div>

                            {/* Stable Wrapper for Blur Animation */}
                            <div className="w-full auth-content-fade">
                                <AnimatePresence mode="wait">
                                    {authView === 'signin' ? (
                                        <div key="signin" className="w-full">
                                            <DaVinciSignInForm />
                                        </div>
                                    ) : (
                                        <div key="signup" className="w-full">
                                            <DaVinciSignUpForm />
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
