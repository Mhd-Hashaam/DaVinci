'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, FileText, Check, Save } from 'lucide-react';
import { toast } from 'sonner';
import { upsertSiteContentAction, deleteSiteContentAction } from '@/app/admin/actions';
import AdminModal from '@/components/admin/ui/AdminModal';
import type { CMSSiteContentRow, CMSSiteContentInsert } from '@/types/cms';

export default function ContentManager({ initialItems }: { initialItems: CMSSiteContentRow[] }) {
    const [items, setItems] = useState<CMSSiteContentRow[]>(initialItems);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CMSSiteContentRow | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // For fast layout/filtering
    const [selectedPage, setSelectedPage] = useState<string>('All');

    const [formData, setFormData] = useState<CMSSiteContentInsert>({
        page: 'Global',
        section: 'Hero',
        key: '',
        value: '',
        content_type: 'text'
    });

    // Grouping items by Page and Section
    const groupedItems = useMemo(() => {
        const groups: Record<string, CMSSiteContentRow[]> = {};
        const filtered = selectedPage === 'All' ? items : items.filter(i => i.page === selectedPage);
        
        filtered.forEach(item => {
            const groupKey = `${item.page} - ${item.section}`;
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(item);
        });
        return groups;
    }, [items, selectedPage]);

    const uniquePages = useMemo(() => {
        const pages = new Set(items.map(i => i.page));
        return ['All', ...Array.from(pages)];
    }, [items]);

    const handleOpenModal = (item?: CMSSiteContentRow) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                page: item.page,
                section: item.section,
                key: item.key,
                value: item.value || '',
                content_type: item.content_type || 'text'
            });
        } else {
            setEditingItem(null);
            setFormData({
                page: 'Global',
                section: 'Hero',
                key: '',
                value: '',
                content_type: 'text'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Upsert handles both create and update based on the page,section,key constraint
            const res = await upsertSiteContentAction(formData);
            if (res.error) throw res.error;
            
            if (res.data) {
                // Remove old copy if exists, add new row to local state
                setItems(prev => {
                    const filtered = prev.filter(i => i.id !== res.data.id && !(i.page === formData.page && i.section === formData.section && i.key === formData.key));
                    return [...filtered, res.data];
                });
            }
            toast.success('Content saved successfully');
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save content');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, key: string) => {
        if (!confirm(`Are you sure you want to delete the content key "${key}"?`)) return;
        try {
            const res = await deleteSiteContentAction(id);
            if (res.error) throw res.error;
            setItems(prev => prev.filter(c => c.id !== id));
            toast.success('Content deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete content');
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-20">
            {/* Standard Module Header (h-16) */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">Site Engine</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    <p className="hidden font-outfit text-[11px] font-light uppercase tracking-[0.2em] text-zinc-500 sm:block">
                        Dynamic Copy Management
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <select 
                        value={selectedPage} 
                        onChange={(e) => setSelectedPage(e.target.value)}
                        className="rounded-none border-b border-white/10 bg-transparent px-2 py-2 font-outfit text-[10px] uppercase tracking-[0.2em] text-zinc-500 focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                    >
                        {uniquePages.map(p => <option key={p} value={p} className="bg-[#111]">{p}</option>)}
                    </select>
                    
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 rounded-none border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-2 text-[10px] font-medium tracking-[0.15em] text-[var(--primary)] uppercase transition-all hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50"
                    >
                        <Plus size={14} strokeWidth={2} />
                        Add Block
                    </button>
                </div>
            </div>

            {/* Signature Golden Divider */}
            <div className="admin-divider flex-shrink-0" />

            {/* List Area */}
            <div className="p-8">
                <div className="space-y-4">
                {Object.keys(groupedItems).length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-black/40 p-16 text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-zinc-600" strokeWidth={1} />
                        <h3 className="font-cormorant text-2xl text-white">No content strings found</h3>
                        <p className="mt-2 font-outfit text-sm font-light text-zinc-400">Add text strings to make your website dynamic.</p>
                    </div>
                ) : (
                    Object.entries(groupedItems).map(([groupName, groupItems]) => (
                        <div key={groupName} className="overflow-hidden rounded-2xl admin-panel">
                            <div className="border-b border-white/5 px-8 py-5">
                                <h3 className="font-cormorant text-xl tracking-wide text-white">{groupName}</h3>
                            </div>
                            <ul className="divide-y divide-white/5">
                                {groupItems.map(item => (
                                    <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 transition-colors hover:bg-white/5 group gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/5 border border-[var(--primary)]/20 px-2 py-0.5">
                                                    {item.key}
                                                </span>
                                                <span className="font-outfit text-[9px] uppercase tracking-widest text-zinc-500 border border-white/5 px-2 py-0.5">{item.content_type}</span>
                                            </div>
                                            <p className="font-outfit text-sm text-zinc-400 truncate font-light">
                                                {item.content_type === 'html' ? '‹html› content block' : item.value}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-center">
                                            <button 
                                                onClick={() => handleOpenModal(item)}
                                                className="flex items-center gap-1.5 rounded-none border border-white/5 bg-white/5 px-3 py-1.5 font-outfit text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                                            >
                                                <Edit2 size={12} /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item.id, item.key)}
                                                className="rounded-none border border-red-500/10 bg-red-500/5 p-1.5 text-red-500/60 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
                </div>
            </div>

            <AdminModal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? "Edit Content Block" : "Add Content Block"}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-2 block font-outfit text-[11px] font-light tracking-[0.1em] uppercase text-zinc-400">Page Route</label>
                            <input type="text" required value={formData.page} onChange={(e) => setFormData(p => ({ ...p, page: e.target.value }))} className="w-full rounded-none border-b border-white/10 bg-transparent px-0 py-2 font-outfit text-sm text-white placeholder-zinc-600 focus:border-[var(--primary)] focus:outline-none transition-colors" placeholder="e.g. Home" />
                        </div>
                        <div>
                            <label className="mb-2 block font-outfit text-[11px] font-light tracking-[0.1em] uppercase text-zinc-400">Page Section</label>
                            <input type="text" required value={formData.section} onChange={(e) => setFormData(p => ({ ...p, section: e.target.value }))} className="w-full rounded-none border-b border-white/10 bg-transparent px-0 py-2 font-outfit text-sm text-white placeholder-zinc-600 focus:border-[var(--primary)] focus:outline-none transition-colors" placeholder="e.g. Hero" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                        <div className="col-span-2">
                            <label className="mb-2 block font-outfit text-[11px] font-light tracking-[0.1em] uppercase text-zinc-400">Identifier Key</label>
                            <input type="text" required value={formData.key} onChange={(e) => setFormData(p => ({ ...p, key: e.target.value }))} className="w-full rounded-none border-b border-white/10 bg-transparent font-mono px-0 py-2 text-sm text-white placeholder-zinc-600 focus:border-[var(--primary)] focus:outline-none transition-colors" placeholder="e.g. headline_text" />
                        </div>
                        <div>
                            <label className="mb-2 block font-outfit text-[11px] font-light tracking-[0.1em] uppercase text-zinc-400">Format</label>
                            <select value={formData.content_type} onChange={(e) => setFormData(p => ({ ...p, content_type: e.target.value as any }))} className="w-full rounded-none border-b border-white/10 bg-black/40 px-0 py-2 font-outfit text-sm text-white focus:border-[var(--primary)] focus:outline-none cursor-pointer">
                                <option value="text" className="bg-[#111]">Plain Text</option>
                                <option value="html" className="bg-[#111]">HTML</option>
                                <option value="json" className="bg-[#111]">JSON</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 flex justify-between font-outfit text-[11px] font-light tracking-[0.1em] uppercase text-zinc-400">
                            Content Value
                            {formData.content_type === 'html' && <span className="text-zinc-600">Supports raw HTML tags</span>}
                        </label>
                        <textarea 
                            required 
                            rows={6}
                            value={formData.value || ''} 
                            onChange={(e) => setFormData(p => ({ ...p, value: e.target.value }))} 
                            className="w-full rounded-none border border-white/10 bg-white/5 px-4 py-3 font-outfit text-sm text-white placeholder-zinc-600 focus:border-[var(--primary)] focus:outline-none custom-scrollbar resize-none" 
                            placeholder={formData.content_type === 'html' ? "<h1>Hero Title</h1>\n<p>Subtitle here</p>" : "Enter text here..."}
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-white/5">
                        <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 rounded-none border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-8 py-2.5 font-outfit text-[11px] tracking-widest text-[var(--primary)] uppercase transition-all hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50 disabled:opacity-50">
                            <Save size={14} /> {isSubmitting ? 'Saving...' : 'Save Content'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}
