'use client';

import React, { useState } from 'react';
import { Activity, Plus, Edit2, Trash2, ShieldAlert, Eye, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { CMSAuditLogRow } from '@/types/cms';

export default function ActivityTimeline({ initialLogs }: { initialLogs: any[] }) {
    const [logs] = useState(initialLogs);
    const [filter, setFilter] = useState<string>('all');

    const filteredLogs = filter === 'all' 
        ? logs 
        : logs.filter(log => log.action === filter || (filter === 'delete' && log.action === 'DELETE'));

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'INSERT': return <div className="rounded-full bg-[var(--primary)]/10 p-2 text-[var(--primary)]"><Plus size={16} /></div>;
            case 'UPDATE': return <div className="rounded-full bg-blue-500/20 p-2 text-blue-500"><Edit2 size={16} /></div>;
            case 'DELETE': return <div className="rounded-full bg-red-500/20 p-2 text-red-500"><Trash2 size={16} /></div>;
            default:       return <div className="rounded-full bg-zinc-500/20 p-2 text-zinc-500"><Activity size={16} /></div>;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'INSERT': return 'text-emerald-400';
            case 'UPDATE': return 'text-blue-400';
            case 'DELETE': return 'text-red-400';
            default:       return 'text-zinc-400';
        }
    };

    const formatActionText = (log: any) => {
        const username = log.profiles?.username || 'An admin';
        const target = log.object_id ? `(${log.object_id.split('-')[0]}...)` : '';
        
        switch (log.action) {
            case 'INSERT': return <span><span className="font-semibold text-white">{username}</span> created a new record in <span className="font-mono text-[var(--primary)] bg-[var(--primary)]/5 px-1 rounded">{log.table_name}</span> {target}</span>;
            case 'UPDATE': return <span><span className="font-semibold text-white">{username}</span> updated a record in <span className="font-mono text-[var(--primary)] bg-[var(--primary)]/5 px-1 rounded">{log.table_name}</span> {target}</span>;
            case 'DELETE': return <span><span className="font-semibold text-white">{username}</span> permanently deleted a record from <span className="font-mono text-red-400 bg-red-400/10 px-1 rounded">{log.table_name}</span> {target}</span>;
            default:       return <span><span className="font-semibold text-white">{username}</span> performed {log.action} on <span className="font-mono">{log.table_name}</span> {target}</span>;
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-20">
            {/* Standard Module Header (h-16) */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">Audit Log</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    <p className="hidden font-outfit text-[11px] font-light uppercase tracking-[0.2em] text-zinc-500 sm:block">
                        Mutation History
                    </p>
                </div>
                
                <div className="flex items-center gap-2 rounded-none border border-white/5 bg-white/[0.03] p-1">
                    <Filter size={12} className="ml-2 text-zinc-600" />
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent border-none text-[10px] uppercase tracking-widest text-zinc-400 focus:outline-none focus:ring-0 py-1 pl-1 pr-6 cursor-pointer font-outfit"
                    >
                        <option value="all" className="bg-[#111]">All Actions</option>
                        <option value="INSERT" className="bg-[#111]">Creations</option>
                        <option value="UPDATE" className="bg-[#111]">Updates</option>
                        <option value="DELETE" className="bg-[#111]">Deletions</option>
                    </select>
                </div>
            </div>

            {/* Signature Golden Divider */}
            <div className="admin-divider flex-shrink-0" />

            {/* Content Area */}
            <div className="p-8">
                <div className="rounded-2xl admin-panel p-8">
                {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <ShieldAlert className="mb-4 h-12 w-12 text-zinc-600" />
                        <h3 className="font-cormorant text-2xl text-white">No activity found</h3>
                        <p className="mt-2 font-outfit text-sm font-light text-zinc-400">Database triggers have not recorded any mutations yet.</p>
                    </div>
                ) : (
                    <div className="relative border-l border-white/10 ml-4 space-y-10 pb-4">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="relative pl-10">
                                <span className="absolute -left-[19px] top-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#0A0A0A] border border-white/5">
                                    {getActionIcon(log.action)}
                                </span>
                                
                                <div className="flex flex-col gap-3 rounded-none border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="font-outfit text-[13px] font-light text-zinc-300 leading-relaxed">
                                            {formatActionText(log)}
                                        </div>
                                        <time className="font-outfit text-[10px] uppercase tracking-widest text-zinc-600 whitespace-nowrap pt-1">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </time>
                                    </div>
                                    
                                    {log.changes && Object.keys(log.changes).length > 0 && (
                                        <div className="mt-3 rounded-none bg-black/40 p-4 overflow-x-auto custom-scrollbar border border-white/5">
                                            <pre className="text-[10px] text-[var(--primary)]/60 font-mono tracking-tight">
                                                {JSON.stringify(log.changes, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
