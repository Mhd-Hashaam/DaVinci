import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FittingRoomProgressRecord } from '@/types/fittingRoomProgress';
import { FittingRoomProgressService } from '@/lib/services/fittingRoomProgress';
import { useAuth } from '@/lib/hooks/useAuth';
import { useFittingRoomStore } from '@/lib/store/fittingRoomStore';
import { useDaVinciUIStore } from '@/lib/store/davinciUIStore';
import { Loader2, Trash2, Edit2, Play, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export const MyWorks = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<FittingRoomProgressRecord[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadSnapshot = useFittingRoomStore(state => state.loadSnapshot);
    const openFittingRoom = useFittingRoomStore(state => state.openFittingRoom);
    const setPostLoginTab = useDaVinciUIStore(state => state.setPostLoginTab);

    useEffect(() => {
        if (user) {
            fetchSessions(true);
        } else {
            setInitialLoading(false);
        }
    }, [user]);

    const fetchSessions = async (isInitial = false) => {
        try {
            if (isInitial) setInitialLoading(true);
            setIsRefreshing(true);
            if (!user) return;

            const data = await FittingRoomProgressService.listProgress(user.id);
            setSessions(data);
        } catch (error: any) {
            console.error('[MyWorks] Failed to load sessions:', error);
            if (error.message?.toLowerCase().includes('session') || error.message?.toLowerCase().includes('sign in')) {
                toast.error('Session expired. Please sign out and sign in again.');
            } else {
                toast.error('Could not load your saved works. Please try again.');
            }
        } finally {
            setInitialLoading(false);
            setIsRefreshing(false);
        }
    };


    const handleOpenSession = (record: FittingRoomProgressRecord) => {
        try {
            loadSnapshot(record.state);
            openFittingRoom();
            toast.success(`Resumed "${record.title}"`);
        } catch (error) {
            console.error('Failed to restore session:', error);
            toast.error('This session data appears corrupted');
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening session
        if (!confirm('Are you sure you want to delete this saved session?')) return;

        setDeletingId(id);
        try {
            await FittingRoomProgressService.deleteProgress(id);
            setSessions(prev => prev.filter(s => s.id !== id));
            toast.success('Session deleted');
        } catch (error) {
            toast.error('Failed to delete session');
        } finally {
            setDeletingId(null);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col gap-4 p-1">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Session Resumption</h2>
                    <div className="p-1.5 opacity-50"><Loader2 size={14} className="animate-spin" /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-[4/3] rounded-xl border border-white/5 bg-white/[0.02] animate-pulse relative">
                            <div className="absolute bottom-3 left-3 w-1/2 h-2 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <p>Please sign in to view your saved works.</p>
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="flex flex-col gap-4 p-1">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Session Resumption</h2>
                    <button
                        onClick={() => fetchSessions()}
                        disabled={isRefreshing}
                        className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                    >
                        <Loader2 size={14} className={cn(isRefreshing && "animate-spin")} />
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Calendar size={24} className="opacity-50" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium text-zinc-400">No Saved Sessions</p>
                        <p className="text-xs mt-1 max-w-[200px]">Create designs in the Fitting Room and save them to see them here.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-1">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Session Resumption</h2>
                <button
                    onClick={() => fetchSessions()}
                    className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                    title="Refresh Sessions"
                >
                    <Loader2 size={14} className={cn(isRefreshing && "animate-spin")} />
                </button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sessions.map((session) => (
                    <motion.div
                        key={session.id}
                        layoutId={session.id}
                        className="group relative bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer"
                        onClick={() => handleOpenSession(session)}
                    >
                        {/* Aspects Ratio Container */}
                        <div className="aspect-[4/3] relative bg-black/20">
                            {session.preview_thumbnail_url ? (
                                <Image
                                    src={session.preview_thumbnail_url}
                                    alt={session.title}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    className="object-cover scale-150 transition-transform duration-500 group-hover:scale-[1.6]"
                                    quality={70}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                    <span className="text-xs">No Preview</span>
                                </div>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-full hover:scale-105 transition-transform cursor-pointer">
                                    <Play size={10} fill="currentColor" />
                                    Resume
                                </button>
                            </div>

                            {/* Delete Action (Top Right) */}
                            <button
                                onClick={(e) => handleDelete(session.id, e)}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-zinc-400 hover:text-red-400 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all z-10"
                                disabled={deletingId === session.id}
                            >
                                {deletingId === session.id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Trash2 size={12} />
                                )}
                            </button>
                        </div>

                        {/* Metadata */}
                        <div className="p-3">
                            <h3 className="text-sm font-medium text-zinc-200 truncate pr-4">
                                {session.title}
                            </h3>
                            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                                {new Date(session.updated_at).toLocaleDateString()}
                                <span className="w-1 h-1 rounded-full bg-zinc-700 mx-1" />
                                {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
