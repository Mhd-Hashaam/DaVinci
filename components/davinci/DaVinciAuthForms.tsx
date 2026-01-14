'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useDaVinciUIStore } from '@/lib/store/davinciUIStore';
import { supabase } from '@/lib/supabase/client';
import { IconBrandGoogle, IconBrandApple, IconBrandFacebook } from '@tabler/icons-react';

// --- Schemas ---
const signInSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export function DaVinciSignInForm() {
    const { setAuthView, closeAuthModal } = useDaVinciUIStore();
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
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    throw new Error("Please verify your email address before signing in.");
                }
                throw error;
            }

            closeAuthModal();
        } catch (error: any) {
            setSignInError(error.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full">
            {/* SIGN IN Title Removed as requested */}

            {signInError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
                    {signInError}
                </div>
            )}

            {/* SSO Section - Now at the top */}
            <div className="mb-6">
                {/* Continue with - Between lines */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-[1px] bg-white/10 flex-1"></div>
                    <span className="text-xs text-zinc-400 font-sans">Continue with</span>
                    <div className="h-[1px] bg-white/10 flex-1"></div>
                </div>
                <div className="flex justify-center gap-5">
                    <SocialButton
                        icon={<img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="Google" />}
                        color="bg-white"
                        textColor="text-black"
                        onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback?returnTo=/davinci` } })}
                    />
                    <SocialButton
                        icon={<IconBrandApple size={22} />}
                        color="bg-gradient-to-br from-zinc-700 to-zinc-900"
                        onClick={() => { }}
                    />
                    <SocialButton
                        icon={<IconBrandFacebook size={22} />}
                        color="bg-[#1877F2]"
                        onClick={() => { }}
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-[1px] bg-white/10 flex-1"></div>
                <span className="text-xs text-zinc-500 font-sans">or continue with email</span>
                <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 w-full max-w-[380px] mx-auto">
                {/* Name Input - Renamed as requested */}
                <div className="space-y-1">
                    <div className="relative">
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="Name"
                            className="w-full bg-zinc-950 !border !border-white/10 rounded-lg py-2 px-3 text-white text-sm font-sans focus:outline-none focus:!border-purple-500/50 transition-all placeholder:text-zinc-500"
                        />
                    </div>
                    {errors.name && <p className="text-red-400 text-[10px] ml-2">{errors.name.message}</p>}
                </div>

                {/* Email Input - Smaller and black */}
                <div className="space-y-1">
                    <div className="relative">
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-zinc-950 !border !border-white/10 rounded-lg py-2 px-3 text-white text-sm font-sans focus:outline-none focus:!border-purple-500/50 transition-all placeholder:text-zinc-500"
                        />
                    </div>
                    {errors.email && <p className="text-red-400 text-[10px] ml-2">{errors.email.message}</p>}
                </div>

                {/* Password Input - Smaller and black */}
                <div className="space-y-1">
                    <div className="relative">
                        <input
                            {...register('password')}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full bg-zinc-950 !border !border-white/10 rounded-lg py-2 px-3 pr-10 text-white text-sm font-sans focus:outline-none focus:!border-purple-500/50 transition-all placeholder:text-zinc-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        >
                            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-[10px] ml-2">{errors.password.message}</p>}
                </div>

                {/* AUTHENTICATE Button - Cyan to purple gradient like mockup */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-lg font-medium text-sm tracking-tight transition-all transform hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <span className="flex items-center gap-1 font-sans">
                            Continue <span className="text-xs opacity-70">&gt;&gt;</span>
                        </span>
                    )}
                </button>
            </form>



            {/* Switch to Sign Up */}
            <div className="text-center mt-8">
                <button onClick={() => setAuthView('signup')} className="text-xs text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer">
                    Initiate New Sequence (Sign Up)
                </button>
            </div>
        </div>
    );
}

export function DaVinciSignUpForm() {
    const { setAuthView, closeAuthModal } = useDaVinciUIStore();
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
                options: { data: { name: data.name } }
            });

            if (error) throw error;

            if (authData.session) {
                closeAuthModal();
            } else {
                setSignUpError('Account created! 📧 Verification signal sent.');
            }
        } catch (error: any) {
            setSignUpError(error.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full">
            {/* SIGN UP Title Removed as requested */}

            {signUpError && (
                <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 text-xs text-center">
                    {signUpError}
                </div>
            )}

            {/* SSO Section - Now at the top */}
            <div className="mb-6">
                {/* Continue with - Between lines */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="h-[1px] bg-white/10 flex-1"></div>
                    <span className="text-xs text-zinc-400 font-sans">Continue with</span>
                    <div className="h-[1px] bg-white/10 flex-1"></div>
                </div>
                <div className="flex justify-center gap-5">
                    <SocialButton
                        icon={<img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="Google" />}
                        color="bg-white"
                        textColor="text-black"
                        onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback?returnTo=/davinci` } })}
                    />
                    <SocialButton
                        icon={<IconBrandApple size={22} />}
                        color="bg-gradient-to-br from-zinc-700 to-zinc-900"
                        onClick={() => { }}
                    />
                    <SocialButton
                        icon={<IconBrandFacebook size={22} />}
                        color="bg-[#1877F2]"
                        onClick={() => { }}
                    />
                </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-[1px] bg-white/10 flex-1"></div>
                <span className="text-xs text-zinc-500 font-sans">or continue with email</span>
                <div className="h-[1px] bg-white/10 flex-1"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 w-full max-w-[380px] mx-auto">
                <div className="space-y-1">
                    <div className="relative">
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="Name"
                            className="w-full bg-zinc-950 !border !border-white/10 rounded-lg py-2 px-3 text-white text-sm font-sans focus:outline-none focus:!border-cyan-500/50 transition-all placeholder:text-zinc-500"
                        />
                    </div>
                    {errors.name && <p className="text-red-400 text-[10px] ml-2">{errors.name.message}</p>}
                </div>

                <div className="space-y-1">
                    <div className="relative">
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-zinc-950 !border !border-white/10 rounded-lg py-2 px-3 text-white text-sm font-sans focus:outline-none focus:!border-cyan-500/50 transition-all placeholder:text-zinc-500"
                        />
                    </div>
                    {errors.email && <p className="text-red-400 text-[10px] ml-2">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                    <div className="relative">
                        <input
                            {...register('password')}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full bg-zinc-950 !border !border-white/10 rounded-lg py-2 px-3 pr-10 text-white text-sm font-sans focus:outline-none focus:!border-cyan-500/50 transition-all placeholder:text-zinc-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        >
                            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-[10px] ml-2">{errors.password.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white rounded-lg font-medium text-sm tracking-tight transition-all transform hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <span className="flex items-center gap-1 font-sans">
                            Continue <span className="text-xs opacity-70">&gt;&gt;</span>
                        </span>
                    )}
                </button>
            </form>

            <div className="text-center mt-6">
                <button onClick={() => setAuthView('signin')} className="text-xs text-zinc-400 hover:text-blue-400 transition-colors cursor-pointer">
                    Return to Login Sequence
                </button>
            </div>
        </div>
    );
}

function SocialButton({ icon, color, onClick, textColor = "text-white" }: { icon: React.ReactNode, color: string, onClick: () => void, textColor?: string }) {
    return (
        <button
            onClick={onClick}
            className={`w-14 h-14 rounded-full ${color} ${textColor} flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-1 cursor-pointer border border-white/20`}
        >
            {icon}
        </button>
    );
}
