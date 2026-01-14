'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Mail, Lock, User, ArrowRight, Github } from 'lucide-react';
import { BorderBeam } from '@/components/ui/border-beam';
import { FloatingDock } from '@/components/ui/floating-dock';
import { useUIStore } from '@/lib/store/uiStore';
import { supabase } from '@/lib/supabase/client';
import { IconBrandGithub, IconBrandX, IconBrandDiscord, IconBrandApple } from '@tabler/icons-react';

// --- Schemas ---
const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

// --- Components ---

export function SignInForm() {
    const { setAuthView, closeAuthModal } = useUIStore();
    const [loading, setLoading] = useState(false);
    const [signInError, setSignInError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (data: SignInValues) => {
        setLoading(true);
        setSignInError(null);
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                console.error("SignInForm: Supabase error", error);
                if (error.message.includes('Email not confirmed')) {
                    throw new Error("Please verify your email address before signing in. Check your inbox (and spam folder).");
                }
                throw error;
            }

            closeAuthModal();
        } catch (error: any) {
            console.error("SignInForm: Catch", error);
            setSignInError(error.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const email = document.querySelector<HTMLInputElement>('input[name="email"]')?.value;
        if (!email) {
            setSignInError("Please enter your email address first to reset your password.");
            return;
        }
        setLoading(true);
        setSignInError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });
            if (error) throw error;
            alert("Password reset email sent! Check your inbox.");
        } catch (error: any) {
            setSignInError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const socialLinks = [
        { title: "Apple", icon: <IconBrandApple className="h-full w-full text-neutral-300" />, href: "#" },
        { title: "Discord", icon: <IconBrandDiscord className="h-full w-full text-neutral-300" />, href: "#" },
    ];

    return (
        <div className="flex flex-col h-full justify-center px-8 py-10">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-zinc-400">Sign in to continue your creative journey</p>
                {signInError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {signInError}
                    </div>
                )}
            </div>

            {/* Tier 1: Google SSO */}
            <button
                className="relative group w-full py-3.5 px-4 bg-white text-black rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-zinc-100 transition-all mb-6 overflow-hidden cursor-pointer"
                onClick={() => supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                    }
                })}
            >
                <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="Google" />
                <span>Continue with Google</span>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/10 rounded-xl transition-colors pointer-events-none" />
            </button>

            {/* Tier 2: Secondary SSO (Dock) */}
            <div className="flex justify-center mb-8">
                <FloatingDock items={socialLinks} />
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#09090b] px-2 text-zinc-500">Or continue with email</span>
                </div>
            </div>

            {/* Tier 3: Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email address"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-0 transition-all cursor-text"
                        />
                        <BorderBeam size={80} duration={8} delay={9} borderWidth={1.5} colorFrom="#6366f1" colorTo="#a855f7" className="opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input
                            {...register('password')}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:ring-0 transition-all cursor-text"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer z-10"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                            )}
                        </button>
                        <BorderBeam size={80} duration={8} delay={9} borderWidth={1.5} colorFrom="#6366f1" colorTo="#a855f7" className="opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                    {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>}
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                        Forgot password?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <span>Sign In</span>}
                </button>
            </form>
            <div className="mt-8 text-center text-sm text-zinc-500">
                Don't have an account?{' '}
                <button onClick={() => setAuthView('signup')} className="text-white font-medium hover:underline cursor-pointer">
                    Sign Up
                </button>
            </div>
        </div>
    );
}

export function SignUpForm() {
    const { setAuthView, closeAuthModal } = useUIStore();
    const [loading, setLoading] = useState(false);
    const [signUpError, setSignUpError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (data: SignUpValues) => {
        setLoading(true);
        setSignUpError(null);
        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: { username: data.username }
                }
            });

            if (error) throw error;

            // If session exists, user is logged in (Auto Confirm enabled)
            if (authData.session) {
                closeAuthModal();
            } else {
                // Otherwise, email confirmation is required
                setSignUpError('Account created! 📧 Please check your email (and spam) to confirm your registration before logging in.');
                // We keep the modal open so they see the message.
            }
        } catch (error: any) {
            console.error(error);
            setSignUpError(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full justify-center px-8 py-10">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-zinc-400">Join the creative revolution</p>
                {signUpError && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${signUpError.includes('Account created') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                        {signUpError}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                    <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        <input
                            {...register('username')}
                            type="text"
                            placeholder="Username"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-0 transition-all cursor-text"
                        />
                        <BorderBeam size={80} duration={8} delay={9} borderWidth={1.5} colorFrom="#a855f7" colorTo="#ec4899" className="opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                    {errors.username && <p className="text-red-400 text-xs ml-1">{errors.username.message}</p>}
                </div>

                <div className="space-y-1">
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email address"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-0 transition-all cursor-text"
                        />
                        <BorderBeam size={80} duration={8} delay={9} borderWidth={1.5} colorFrom="#a855f7" colorTo="#ec4899" className="opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        <input
                            {...register('password')}
                            type={showPassword ? "text" : "password"}
                            placeholder="Set Password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:ring-0 transition-all cursor-text"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer z-10"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                            )}
                        </button>
                        <BorderBeam size={80} duration={8} delay={9} borderWidth={1.5} colorFrom="#a855f7" colorTo="#ec4899" className="opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                    {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <span>Create Account</span>}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-zinc-500">
                Already have an account?{' '}
                <button onClick={() => setAuthView('signin')} className="text-white font-medium hover:underline cursor-pointer">
                    Sign In
                </button>
            </div>
        </div>
    );
}
