'use client';

import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Frame, Check, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { createGraphicsItemAction, updateGraphicsItemAction, deleteGraphicsItemAction, uploadMediaAction } from '@/app/admin/actions';
import AdminModal from '@/components/admin/ui/AdminModal';
import type { CMSGraphicsRow, CMSGraphicsInsert, CMSCategoryRow } from '@/types/cms';
import Image from 'next/image';

interface ArtWallManagerProps {
    initialItems: CMSGraphicsRow[];
    categories: CMSCategoryRow[];
}

export default function ArtWallManager({ initialItems, categories }: ArtWallManagerProps) {
    const [items, setItems] = useState<CMSGraphicsRow[]>(initialItems);
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CMSGraphicsRow | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mainFileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        is_published: true,
    });

    const handleOpenModal = (item?: CMSGraphicsRow) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title || '',
                category_id: item.categories?.[0]?.id || '',
                is_published: item.is_published || true,
            });
            setPreviewUrl(item.storage_url || '');
            setSelectedFile(null);
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                category_id: categories.length > 0 ? categories[0].id : '',
                is_published: true,
            });
            setPreviewUrl(null);
            setSelectedFile(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleMainFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            // Reset for fresh upload
            setEditingItem(null);
            setFormData({
                title: file.name.split('.')[0] || '',
                category_id: categories.length > 0 ? categories[0].id : '',
                is_published: true,
            });
            setIsModalOpen(true);
            if (mainFileInputRef.current) mainFileInputRef.current.value = '';
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let storageUrl = editingItem?.storage_url || '';

            if (selectedFile) {
                const fd = new FormData();
                fd.append('file', selectedFile);
                const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const uploadRes = await uploadMediaAction(fd, `artwall/${Date.now()}_${cleanName}`);
                if (uploadRes.error) throw new Error((uploadRes.error as any).message || 'Upload failed');
                storageUrl = uploadRes.data?.publicUrl || '';
            } else if (!editingItem) {
                throw new Error("Please select an image");
            }

            if (editingItem) {
                const res = await updateGraphicsItemAction(editingItem.id, {
                    ...formData,
                    storage_url: storageUrl
                });
                if (res.error) throw res.error;
                
                setItems(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...formData, storage_url: storageUrl } : c));
                toast.success('Art Wall item updated');
            } else {
                const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order || 0)) + 1 : 0;
                
                const payload: CMSGraphicsInsert = {
                    ...formData,
                    storage_url: storageUrl,
                    display_order: nextOrder,
                    variants: {},
                    metadata: {}
                };
                
                const res = await createGraphicsItemAction(payload);
                if (res.error) throw res.error;
                
                if (res.data) setItems(prev => [...prev, res.data]);
                toast.success('Added to Art Wall');
            }
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;
        try {
            const res = await deleteGraphicsItemAction(id);
            if (res.error) throw res.error;
            setItems(prev => prev.filter(c => c.id !== id));
            toast.success('Deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete');
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-20">
            {/* Standard Module Header (h-16) */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">Art Wall</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    <p className="hidden font-outfit text-[11px] font-light uppercase tracking-[0.2em] text-zinc-500 sm:block">
                        Fitting Room Graphics
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="text-[10px] font-outfit uppercase tracking-[0.2em] text-zinc-500">
                        {items.length} Graphics
                    </div>
                </div>
            </div>

            {/* Signature Golden Divider */}
            <div className="admin-divider flex-shrink-0" />

            {/* Content Stats Sub-header */}
            <div className="p-8 pb-0">
                <div className="flex items-center gap-4">
                    <h2 className="font-outfit text-[13px] font-light text-white">Graphics</h2>
                    <span className="text-zinc-600 font-outfit text-[11px]">·</span>
                    <span className="text-zinc-500 font-outfit text-[10px] uppercase tracking-widest">{items.length} items</span>
                </div>
            </div>

            {/* Premium Masonry Area */}
            <div className="p-8">
                <div className="columns-2 sm:columns-3 lg:columns-5 xl:columns-7 2xl:columns-8 gap-3 space-y-3">
                    
                    {/* Hidden Input for Quick Upload Start */}
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={mainFileInputRef}
                        onChange={handleMainFileSelect}
                    />

                    {/* Upload / "Add Graphic" Card */}
                    <div 
                        onClick={() => mainFileInputRef.current?.click()}
                        className="group relative break-inside-avoid mb-3 overflow-hidden rounded-lg admin-panel cursor-pointer bg-black/40 border border-dashed border-white/10 hover:border-[var(--primary)]/30 transition-all duration-500 min-h-[200px] flex items-center justify-center"
                    >
                        {/* Static State */}
                        <div className="flex flex-col items-center justify-center gap-4 transition-all duration-500 group-hover:scale-105 group-hover:opacity-0">
                            <Plus size={32} className="text-zinc-600" strokeWidth={1} />
                            <span className="font-outfit text-[10px] font-light uppercase tracking-[0.3em] text-zinc-500 text-center">
                                Art Wall
                            </span>
                        </div>

                        {/* Hover State: Upload Prompt */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 scale-95 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100 text-center px-4">
                            <div className="relative">
                                <Frame size={32} className="text-[var(--primary)]" strokeWidth={1} />
                                <div className="absolute inset-0 blur-xl bg-[var(--primary)]/30" />
                            </div>
                            <span className="font-outfit text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--primary)]">
                                New Graphic
                            </span>
                        </div>
                    </div>

                    {items.map((item) => {
                        const category = item.categories?.[0];
                        
                        return (
                            <div 
                                key={item.id} 
                                className="group relative break-inside-avoid mb-3 overflow-hidden rounded-lg bg-zinc-900/20 transition-all duration-500"
                            >
                                {/* Main Image */}
                                <div className="w-full bg-black/60">
                                    <Image 
                                        src={item.storage_url || ''} 
                                        alt={item.title || 'Graphic'} 
                                        width={400}
                                        height={600}
                                        className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-105" 
                                    />
                                </div>

                                {/* Action Overlay (Buttons) */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 z-20">
                                    <button 
                                        onClick={() => handleOpenModal(item)}
                                        className="rounded-full bg-white/10 p-3 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:scale-110 active:scale-95"
                                        title="Edit"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id, item.title || 'Item')}
                                        className="rounded-full bg-red-500/10 p-3 text-red-400 backdrop-blur-md border border-red-500/20 transition-all hover:bg-red-500 hover:text-white hover:scale-110 active:scale-95"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                
                                {/* Status Badges */}
                                <div className="absolute top-3 left-3 flex gap-2 z-20">
                                    {item.is_published && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(197,165,114,0.8)]" />
                                    )}
                                </div>
                                
                                {/* Information Overlay (Hover Only) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 pointer-events-none z-10">
                                    <h3 className="font-cormorant text-base text-white truncate font-light tracking-wide">
                                        {item.title}
                                    </h3>
                                    <span className="font-outfit text-[8px] uppercase tracking-widest text-[#C5A572] mt-1 block">
                                        {category ? category.name : 'Uncategorized'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            <AdminModal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? "Edit Graphic" : "Add Graphic"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                        <div onClick={() => fileInputRef.current?.click()} className="relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-none border border-dashed border-white/20 bg-white/5 p-8 text-zinc-500 transition-colors hover:border-[var(--primary)]/50 hover:bg-white/10 hover:text-[var(--primary)] aspect-video w-full">
                            {previewUrl ? (
                                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                            ) : (
                                <>
                                    <UploadCloud size={32} />
                                    <span className="text-sm font-medium">Click to upload graphic</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-300">Title</label>
                        <input type="text" required value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full rounded-none border-b border-white/10 bg-transparent px-0 py-2 font-outfit text-sm text-white placeholder-zinc-600 focus:border-[var(--primary)] focus:outline-none transition-colors" />
                    </div>
                    
                    <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-300">Category</label>
                        <select required value={formData.category_id} onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value }))} className="w-full rounded-none border-b border-white/10 bg-black/40 px-0 py-2 font-outfit text-sm text-white focus:border-[var(--primary)] focus:outline-none cursor-pointer">
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" id="isPublished" checked={formData.is_published} onChange={(e) => setFormData(p => ({ ...p, is_published: e.target.checked }))} className="h-4 w-4 appearance-none rounded-none border border-white/20 bg-white/5 checked:bg-[var(--primary)] checked:border-[var(--primary)] transition-colors cursor-pointer relative" />
                        <label htmlFor="isPublished" className="text-sm font-medium text-zinc-300 cursor-pointer">Published</label>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#222]">
                        <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="rounded-none border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-8 py-2.5 font-outfit text-[11px] tracking-widest text-[var(--primary)] uppercase transition-all hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Graphic'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
}
