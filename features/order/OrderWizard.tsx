'use client';

import React, { useState, useEffect } from 'react';
import {
    X, ChevronRight, ChevronLeft, Check, Shirt, Palette, Ruler,
    ShoppingCart, Package, Loader2, CreditCard, MapPin, Truck, Sparkles
} from 'lucide-react';
import { calculatePrice, formatPrice, getDiscountLabel } from '@/lib/pricing';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { GeneratedImage } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderWizardProps {
    image: GeneratedImage;
    mockupType: string;
    onClose: () => void;
    onSuccess?: (orderId: string) => void;
}

const STEPS = ['config', 'review', 'shipping', 'pay'];
const SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

const COLORS = [
    { id: 'white', label: 'White', hex: '#FFFFFF', class: 'bg-white' },
    { id: 'black', label: 'Black', hex: '#000000', class: 'bg-black' },
    { id: 'navy', label: 'Navy', hex: '#1E3A8A', class: 'bg-blue-900' },
    { id: 'red', label: 'Red', hex: '#DC2626', class: 'bg-red-600' },
    { id: 'olive', label: 'Olive', hex: '#3f4d38', class: 'bg-[#3f4d38]' },
    { id: 'sand', label: 'Sand', hex: '#d6cba0', class: 'bg-[#d6cba0]' },
];

const MOCKUP_TYPES = [
    { id: 'tshirt', label: 'Classic Tee', basePrice: 29.99 },
    { id: 'hoodie', label: 'Premium Hoodie', basePrice: 49.99 },
    { id: 'longsleeve', label: 'Long Sleeve', basePrice: 34.99 },
];

export function OrderWizard({ image, mockupType: initialMockup, onClose, onSuccess }: OrderWizardProps) {
    const [step, setStep] = useState(0);
    const [config, setConfig] = useState({
        type: initialMockup || 'tshirt',
        color: 'black',
        size: 'L',
        quantity: 1
    });

    // Simulated Form State
    const [shipping, setShipping] = useState({ name: '', address: '', city: '', zip: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived State
    const priceBreakdown = calculatePrice(config.size, config.quantity); // Note: Simplified pricing hook usage
    // Override base price for this demo based on type selection
    const basePrice = MOCKUP_TYPES.find(t => t.id === config.type)?.basePrice || 29.99;
    const total = (basePrice * config.quantity) * (config.size.includes('XL') ? 1.1 : 1);

    const handleNext = () => setStep(prev => Math.min(STEPS.length - 1, prev + 1));
    const handleBack = () => setStep(prev => Math.max(0, prev - 1));

    const handleSubmit = async () => {
        if (!isSupabaseConfigured()) {
            // Local fallback
            setTimeout(() => {
                alert('Demo Mode: Order Successful!');
                onClose();
            }, 1500);
            return;
        }

        setIsSubmitting(true);
        try {
            const sessionId = localStorage.getItem('davinci_session_id') || 'unknown';
            await (supabase as any).from('orders').insert({
                session_id: sessionId,
                image_id: image.id,
                mockup_type: config.type,
                size: config.size,
                color: config.color,
                quantity: config.quantity,
                total_price: total,
                status: 'paid',
                metadata: { shipping }
            });
            setTimeout(() => {
                onSuccess?.('ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase());
                onClose();
            }, 1000);
        } catch (e) {
            console.error(e);
            alert('Failed to place order.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8"
        >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-full max-w-5xl bg-[#09090b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-colors">
                    <X size={20} />
                </button>

                {/* Left: Product Preview */}
                <div className="w-full lg:w-1/2 bg-[#121214] p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent opacity-50" />

                    <motion.div layoutId="product-image" className="relative w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                        <img src={image.url} className="w-full h-full object-cover" alt="Design" />

                        {/* Overlay to simulate shirt texture/mockup could go here */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={14} className="text-yellow-400" />
                                <span className="text-xs font-medium text-yellow-400 uppercase tracking-wider">Premium Quality</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{MOCKUP_TYPES.find(t => t.id === config.type)?.label}</h3>
                            <p className="text-zinc-400 text-sm">Designed by AI • {config.color} • {config.size}</p>
                        </div>
                    </motion.div>

                    {/* Thumbnails of other views could go here */}
                </div>

                {/* Right: Steps & Config */}
                <div className="w-full lg:w-1/2 flex flex-col bg-[#09090b] overflow-y-auto">
                    {/* Header */}
                    <div className="p-8 pb-4 border-b border-white/5">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Customize Order</h2>
                            <div className="text-sm font-mono text-zinc-500">Step {step + 1}/{STEPS.length}</div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
                            {STEPS.map((s, i) => (
                                <div key={s} className={`h-full flex-1 transition-all duration-500 ${i <= step ? 'bg-indigo-500' : 'bg-transparent'}`} />
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 p-8">
                        <AnimatePresence mode="wait">
                            {step === 0 && (
                                <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    {/* Type */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-zinc-400">Apparel Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {MOCKUP_TYPES.map(type => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setConfig(c => ({ ...c, type: type.id }))}
                                                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${config.type === type.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/10 text-zinc-400 hover:border-white/20'}`}
                                                >
                                                    <span className="font-medium">{type.label}</span>
                                                    {config.type === type.id && <Check size={16} className="text-indigo-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-zinc-400">Color</label>
                                        <div className="flex gap-3 flex-wrap">
                                            {COLORS.map(color => (
                                                <button
                                                    key={color.id}
                                                    onClick={() => setConfig(c => ({ ...c, color: color.id }))}
                                                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${config.color === color.id ? 'border-indigo-500 scale-110' : 'border-transparent ring-1 ring-white/20 hover:scale-105'}`}
                                                    title={color.label}
                                                >
                                                    <div className={`w-8 h-8 rounded-full ${color.class} ${color.id === 'white' ? 'border border-black/10' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Size */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-zinc-400">Size</label>
                                        <div className="flex gap-2 text-sm">
                                            {SIZES.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setConfig(c => ({ ...c, size }))}
                                                    className={`w-12 h-12 rounded-lg border font-medium transition-all ${config.size === size ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-white/10 text-zinc-400 hover:border-white/30'}`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Item Price</span>
                                                <span className="text-white">{formatPrice(basePrice)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-zinc-400">Size Upgrade</span>
                                                <span className="text-white">{config.size.includes('XL') ? '+10%' : '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-y border-white/10">
                                                <span className="text-zinc-400">Quantity</span>
                                                <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                                                    <button onClick={() => setConfig(c => ({ ...c, quantity: Math.max(1, c.quantity - 1) }))} className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded">-</button>
                                                    <span className="text-white font-mono w-4 text-center">{config.quantity}</span>
                                                    <button onClick={() => setConfig(c => ({ ...c, quantity: c.quantity + 1 }))} className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded">+</button>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold pt-1">
                                                <span className="text-white">Total</span>
                                                <span className="text-indigo-400">{formatPrice(total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-zinc-500">Full Name</label>
                                            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="John Doe"
                                                value={shipping.name} onChange={e => setShipping(s => ({ ...s, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase font-bold text-zinc-500">Address</label>
                                            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="123 Street Name"
                                                value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase font-bold text-zinc-500">City</label>
                                                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="New York"
                                                    value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase font-bold text-zinc-500">ZIP / Postcode</label>
                                                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="10001"
                                                    value={shipping.zip} onChange={e => setShipping(s => ({ ...s, zip: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center space-y-4">
                                        <CreditCard size={48} className="mx-auto text-indigo-400 mb-2" />
                                        <h3 className="text-lg font-medium text-white">Payment Method</h3>
                                        <p className="text-zinc-500 text-sm">For this demo, no real payment is processed.</p>
                                        <div className="bg-black/20 p-4 rounded-lg text-left border border-white/5">
                                            <p className="text-zinc-400 text-xs uppercase mb-1">Total Amount</p>
                                            <p className="text-2xl font-bold text-white">{formatPrice(total)}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <LockIcon />}
                                        {isSubmitting ? 'Processing...' : 'Pay Securely'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    {step < 3 && (
                        <div className="p-8 border-t border-white/10 flex justify-between items-center bg-[#09090b]">
                            <button
                                onClick={handleBack}
                                disabled={step === 0}
                                className={`text-sm font-medium transition-colors ${step === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white'}`}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2"
                            >
                                {step === 2 ? 'Continue to Payment' : 'Next Step'}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

function LockIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
    )
}
