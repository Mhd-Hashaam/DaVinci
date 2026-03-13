import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface SaveProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title?: string) => Promise<void>;
    previewImage: string | null;
}

export const SaveProgressModal = ({ isOpen, onClose, onSave, previewImage }: SaveProgressModalProps) => {
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    // Reset state when opening
    React.useEffect(() => {
        if (isOpen) {
            setTitle(`Session – ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
            setStatus('idle');
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (status === 'saving') return;
        setStatus('saving');
        try {
            await onSave(title);
            setStatus('success');
            // Close after brief delay to show success state
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <h2 className="text-sm font-medium text-white">Save Progress</h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                            >
                                <X size={16} className="text-zinc-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* Preview */}
                            <div className="relative aspect-[4/3] bg-zinc-800 rounded-lg overflow-hidden border border-white/5">
                                {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Session Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                                        No preview available
                                    </div>
                                )}
                            </div>

                            {/* Title Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-zinc-400 ml-1">Session Name</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Summer Collection Idea"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-600"
                                    maxLength={40}
                                />
                            </div>

                            {/* Tip */}
                            <p className="text-[10px] text-zinc-500 bg-white/5 px-3 py-2 rounded-md">
                                💡 Tip: Give your session a unique name to easily find it later in your profile.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-2 p-4 pt-0">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={status === 'saving' || status === 'success'}
                                className={`
                                    flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-2
                                    transition-all duration-200
                                    ${status === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                            'bg-white text-black hover:bg-white/90 cursor-pointer'}
                                `}
                            >
                                {status === 'saving' ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : status === 'success' ? (
                                    <>
                                        <Check size={12} />
                                        Saved
                                    </>
                                ) : status === 'error' ? (
                                    'Try Again'
                                ) : (
                                    'Save Session'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
