'use client';

import React, { useState, useRef } from 'react';
import { createWardrobeItemAction, updateWardrobeItemAction, deleteWardrobeItemAction, uploadMediaAction, renameMediaAction } from '@/app/admin/actions';
import { Edit2, FileCode, Plus, Search, ChevronDown, Filter, Trash2, Shirt, Loader2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { CMSWardrobeRow, CMSWardrobeInsert } from '@/types/cms';

export default function ClosetManager({ initialItems }: { initialItems: CMSWardrobeRow[] }) {
    const [items, setItems] = useState<CMSWardrobeRow[]>(initialItems);
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [inlineFormData, setInlineFormData] = useState<any>(null);

    const draftThumbRef = useRef<HTMLInputElement>(null);
    const draftModelRef = useRef<HTMLInputElement>(null);
    const [draftThumbFile, setDraftThumbFile] = useState<File | null>(null);
    const [draftModelFile, setDraftModelFile] = useState<File | null>(null);
    const [draftName, setDraftName] = useState('');
    const [isDraftUploading, setIsDraftUploading] = useState(false);
    const [isDraftOpen, setIsDraftOpen] = useState(true);

    const handleStartEdit = (item: CMSWardrobeRow) => {
        setEditingId(item.id);
        setInlineFormData({
            name: item.name || '',
            brand: item.brand || '',
            category: item.category || 'T-Shirts',
            is_published: item.is_published ?? true,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setInlineFormData(null);
    };

    const thumbUpdateRef = useRef<HTMLInputElement>(null);
    const modelUpdateRef = useRef<HTMLInputElement>(null);
    const [updatingAssetFor, setUpdatingAssetFor] = useState<string | null>(null);

    const handleDraftUpload = async () => {
        if (!draftThumbFile && !draftModelFile) {
            toast.error('Please stage at least one asset (Snapshot or GLB)');
            return;
        }
        if (!draftName) {
            toast.error('Please provide an apparel name');
            return;
        }

        setIsDraftUploading(true);
        const loadingId = toast.loading('Creating new apparel...');
        
        try {
            let modelUrl = '';
            let thumbUrl = '';

            // Upload GLB via Route Handler (bypasses Server Action JSON serialization limits)
            if (draftModelFile) {
                toast.loading('Uploading 3D Model...', { id: loadingId });
                const cleanName = draftModelFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const uploadPath = `wardrobe/model_${Date.now()}_${cleanName}`;
                
                const modelFd = new FormData();
                modelFd.append('file', draftModelFile);
                modelFd.append('path', uploadPath);
                
                const res = await fetch('/api/upload', { method: 'POST', body: modelFd });
                const result = await res.json();
                if (!res.ok) throw new Error(`GLB Upload Failed: ${result.error || res.statusText}`);
                modelUrl = result.publicUrl || '';
                if (!modelUrl) throw new Error('GLB uploaded but no URL returned');
            }

            // Upload Thumbnail (if provided)
            if (draftThumbFile) {
                toast.loading('Uploading Snapshot...', { id: loadingId });
                const thumbFd = new FormData();
                thumbFd.append('file', draftThumbFile);
                const thumbRes = await uploadMediaAction(thumbFd, `wardrobe/thumb_${Date.now()}_${draftThumbFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
                if (thumbRes.error) {
                    const errMsg = typeof thumbRes.error === 'string' ? thumbRes.error : (thumbRes.error as any).message || JSON.stringify(thumbRes.error);
                    throw new Error(`Snapshot Upload Failed: ${errMsg}`);
                }
                thumbUrl = thumbRes.data?.publicUrl || '';
            }

            toast.loading('Saving record...', { id: loadingId });
            const nextOrderBase = items.length > 0 ? Math.max(...items.map((i: CMSWardrobeRow) => i.display_order || 0)) : 0;

            const payload: CMSWardrobeInsert = {
                name: draftName,
                brand: 'DaVinci Core',
                category: 'T-Shirts',
                thumbnail_url: thumbUrl,
                model_path: modelUrl,
                is_published: true,
                display_order: nextOrderBase + 1,
            };

            const res = await createWardrobeItemAction(payload);
            if (res.error) {
                const errMsg = typeof res.error === 'string' ? res.error : (res.error as any).message || JSON.stringify(res.error);
                throw new Error(`DB Insert Failed: ${errMsg}`);
            }
            if (res.data) setItems(prev => [res.data, ...prev]);

            toast.success(`Apparel "${draftName}" created successfully!`, { id: loadingId });
            
            // Reset Draft
            setDraftThumbFile(null);
            setDraftModelFile(null);
            setDraftName('');
            if (draftThumbRef.current) draftThumbRef.current.value = '';
            if (draftModelRef.current) draftModelRef.current.value = '';
        } catch (error: any) {
            console.error('Apparel creation error:', error);
            toast.error(error.message || 'Creation failed — check console', { id: loadingId });
        } finally {
            setIsDraftUploading(false);
        }
    };

    const handleAssetUpdate = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string, type: 'model' | 'thumbnail') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const loadingId = toast.loading(`Updating ${type}...`);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const prefix = type === 'model' ? 'model' : 'thumb';
            const path = `wardrobe/${prefix}_${Date.now()}_${cleanName}`;

            const uploadRes = await uploadMediaAction(fd, path);
            if (uploadRes.error) throw new Error((uploadRes.error as any).message);

            const publicUrl = uploadRes.data?.publicUrl || '';
            const updates = type === 'model' ? { model_path: publicUrl } : { thumbnail_url: publicUrl };

            const res = await updateWardrobeItemAction(itemId, updates);
            if (res.error) throw new Error((res.error as any).message);

            setItems(prev => prev.map((c: CMSWardrobeRow) => c.id === itemId ? { ...c, ...updates } : c));
            toast.success(`${type === 'model' ? '3D Model' : 'Snapshot'} updated!`, { id: loadingId });
        } catch (error: any) {
            toast.error(error.message || `Failed to update ${type}`, { id: loadingId });
        } finally {
            if (type === 'model' && modelUpdateRef.current) modelUpdateRef.current.value = '';
            if (type === 'thumbnail' && thumbUpdateRef.current) thumbUpdateRef.current.value = '';
        }
    };

    const handleInlineSubmit = async (e: React.FormEvent, itemId: string) => {
        e.preventDefault();

        // Guard BEFORE setting state
        const item = items.find((i: CMSWardrobeRow) => i.id === itemId);
        if (!item || !inlineFormData) {
            toast.error('Nothing to save');
            return;
        }

        setSubmittingId(itemId);

        try {
            const finalUpdates = { ...inlineFormData };

            // Rename in storage if name changed
            if (inlineFormData.name !== item.name && item.thumbnail_url) {
                try {
                    const urlParts = item.thumbnail_url.split('/cms-media/');
                    if (urlParts.length > 1) {
                        const oldPath = urlParts[1];
                        const extension = oldPath.split('.').pop();
                        const cleanNewName = inlineFormData.name.replace(/[^a-zA-Z0-9]/g, '_');
                        const timestamp = oldPath.split('_')[1] || Date.now();
                        const newPath = `wardrobe/thumb_${timestamp}_${cleanNewName}.${extension}`;

                        const renameRes = await renameMediaAction(oldPath, newPath);
                        if (!renameRes.error && renameRes.data?.publicUrl) {
                            finalUpdates.thumbnail_url = renameRes.data.publicUrl;
                        }
                    }
                } catch (err) {
                    console.warn('Storage rename failed, proceeding with DB update:', err);
                }
            }

            const res = await updateWardrobeItemAction(itemId, finalUpdates);
            if (res.error) throw new Error((res.error as any).message || 'Update failed');

            setItems(prev => prev.map((c: CMSWardrobeRow) => c.id === itemId ? { ...c, ...finalUpdates } : c));
            toast.success('Saved');
            handleCancelEdit();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        } finally {
            setSubmittingId(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try {
            const res = await deleteWardrobeItemAction(id);
            if (res.error) throw res.error;
            setItems(prev => prev.filter((c: CMSWardrobeRow) => c.id !== id));
            toast.success('Deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete');
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">The Closet</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    <p className="hidden font-outfit text-[11px] font-light uppercase tracking-[0.2em] text-zinc-500 sm:block">
                        3D Wardrobe Engine
                    </p>
                </div>
                <div className="text-[10px] font-outfit uppercase tracking-[0.2em] text-zinc-500">
                    {items.length} Garments
                </div>
            </div>

            <div className="admin-divider flex-shrink-0" />

            {/* Controls */}
            <div className="flex flex-col gap-6 px-8 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-black/40 px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5">
                        All Garments <ChevronDown size={14} />
                    </button>
                    <button className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-black/40 px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5">
                        <Filter size={14} className="text-[var(--primary)]" /> Filter <ChevronDown size={14} />
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setIsDraftOpen(!isDraftOpen); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-6 py-2.5 font-outfit text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ${isDraftOpen ? 'border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'border-[var(--primary)]/30 bg-[var(--primary)]/5 text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50'}`}
                    >
                        <Plus size={16} strokeWidth={2.5} className={isDraftOpen ? "rotate-45" : ""} />
                        {isDraftOpen ? 'Close Draft' : 'New Apparel'}
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input
                            type="text"
                            placeholder="Search Closet"
                            className="w-48 rounded-lg border border-white/5 bg-black/40 py-2.5 pl-10 pr-4 font-outfit text-[11px] text-white placeholder-zinc-600 focus:border-[var(--primary)]/30 focus:outline-none transition-all cursor-text"
                        />
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="p-8 pb-32">
                <input type="file" accept="image/*" className="hidden" ref={draftThumbRef} onChange={(e) => setDraftThumbFile(e.target.files?.[0] || null)} />
                <input type="file" accept=".glb,model/gltf-binary" className="hidden" ref={draftModelRef} onChange={(e) => setDraftModelFile(e.target.files?.[0] || null)} />
                <input type="file" accept="image/*" className="hidden" ref={thumbUpdateRef} onChange={(e) => updatingAssetFor && handleAssetUpdate(e, updatingAssetFor, 'thumbnail')} />
                <input type="file" accept=".glb,model/gltf-binary" className="hidden" ref={modelUpdateRef} onChange={(e) => updatingAssetFor && handleAssetUpdate(e, updatingAssetFor, 'model')} />

                {isDraftOpen && (
                    <div className="mb-12 max-w-[720px]">
                        <div className="flex flex-col w-full h-[360px] overflow-hidden rounded-2xl bg-[#0e0e11] border border-dashed border-[var(--primary)]/40 hover:border-[var(--primary)]/60 transition-all duration-500">
                            
                            {/* Split Zones */}
                            <div className="flex flex-row flex-1">
                                {/* LEFT: GLB Section */}
                                <div 
                                    onClick={() => !isDraftUploading && draftModelRef.current?.click()} 
                                    className={`shrink-0 w-[240px] flex flex-col items-center justify-center border-r border-white/5 cursor-pointer transition-all bg-[#0a0a0c] hover:bg-[#151520]`}
                                >
                                    {draftModelFile ? (
                                        <>
                                            <div className="w-20 h-20 rounded-3xl bg-[#151520] border border-indigo-500/20 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/5">
                                                <FileCode size={32} className="text-indigo-400" strokeWidth={1} />
                                            </div>
                                            <span className="font-outfit text-[11px] text-indigo-400 uppercase tracking-widest truncate max-w-[160px] font-bold text-center mb-3">{draftModelFile.name}</span>
                                            <button onClick={(e) => { e.stopPropagation(); setDraftModelFile(null); if(draftModelRef.current) draftModelRef.current.value=''; }} className="font-outfit text-[9px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer uppercase tracking-widest px-3 py-1 bg-white/5 rounded border border-white/10">Remove</button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 rounded-3xl bg-[#151520] border border-white/10 flex items-center justify-center mb-6 transition-all duration-300">
                                                <Plus size={32} className="text-zinc-600 transition-colors duration-300" strokeWidth={1} />
                                            </div>
                                            <span className="font-outfit text-[11px] text-zinc-400 uppercase tracking-widest transition-colors duration-300 text-center">Add 3D Model</span>
                                        </>
                                    )}
                                </div>

                                {/* RIGHT: Snapshot Section */}
                                <div 
                                    onClick={() => !isDraftUploading && draftThumbRef.current?.click()} 
                                    className={`flex-1 relative flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden bg-[#070709] hover:bg-[#0a0a0c] group`}
                                >
                                    {draftThumbFile ? (
                                        <>
                                            <img src={URL.createObjectURL(draftThumbFile)} alt="Draft Snapshot" className="absolute inset-0 w-full h-full object-contain opacity-95 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <button onClick={(e) => { e.stopPropagation(); setDraftThumbFile(null); if(draftThumbRef.current) draftThumbRef.current.value=''; }} className="absolute top-6 right-6 z-20 font-outfit text-[9px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer bg-black/60 px-3 py-1.5 rounded border border-white/10 uppercase tracking-widest backdrop-blur-md">Remove</button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 rounded-3xl bg-[#151520] border border-white/10 flex items-center justify-center mb-6 transition-all duration-300">
                                                <Shirt size={32} className="text-zinc-600 transition-colors duration-300" strokeWidth={1} />
                                            </div>
                                            <span className="font-outfit text-[11px] text-zinc-400 uppercase tracking-widest transition-colors duration-300 text-center">Add Snapshot</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Draft Footer */}
                            <div className="p-6 bg-[#0a0a0c] border-t border-white/5 flex flex-row gap-8 items-center h-[100px]">
                                <input 
                                    type="text"
                                    placeholder="Enter Garment Name..."
                                    value={draftName}
                                    onChange={e => setDraftName(e.target.value)}
                                    disabled={isDraftUploading}
                                    className="flex-1 bg-transparent text-white font-cormorant text-3xl focus:outline-none placeholder:text-zinc-800"
                                />
                                <button 
                                    onClick={handleDraftUpload}
                                    disabled={!draftName || !draftModelFile || !draftThumbFile || isDraftUploading}
                                    className="shrink-0 cursor-pointer bg-[var(--primary)] text-black px-10 py-3.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-20 hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-md"
                                >
                                    {isDraftUploading ? <Loader2 size={16} className="animate-spin" /> : 'Create Apparel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                    {/* Apparel Content Cards */}
                    {items.map((item: CMSWardrobeRow) => {
                        const isSaving = submittingId === item.id;

                        return (
                            <div
                                key={item.id}
                                className="group relative overflow-hidden rounded-2xl bg-[#0e0e11] border border-white/5 hover:border-[var(--primary)]/30 flex h-[360px] transition-colors max-w-[720px]"
                            >
                                {editingId === item.id ? (
                                    // ── Inline Edit Form (Re-designed) ──────────────────────────────
                                    <form onSubmit={(e) => handleInlineSubmit(e, item.id)} className="w-full flex flex-col bg-[#0a0a0c] z-50 p-10">
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="flex-1">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={inlineFormData.name}
                                                    onChange={(e) => setInlineFormData({ ...inlineFormData, name: e.target.value })}
                                                    placeholder="Asset Name"
                                                    className="w-full border-b border-[var(--primary)]/40 bg-transparent py-2 font-cormorant text-4xl text-white placeholder-zinc-700 focus:border-[var(--primary)] focus:outline-none transition-all"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="ml-6 p-2 text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>

                                        <div className="flex gap-12 flex-1 items-start">
                                            {/* Left side: Form fields */}
                                            <div className="flex-[0.8] space-y-6">
                                                <div className="flex flex-col gap-2">
                                                    <label className="font-outfit text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">Brand Identity</label>
                                                    <input
                                                        type="text"
                                                        value={inlineFormData.brand}
                                                        onChange={(e) => setInlineFormData({ ...inlineFormData, brand: e.target.value })}
                                                        placeholder="Brand Name"
                                                        className="bg-[#151518] rounded-lg p-3.5 font-outfit text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/50 transition-all border border-white/5"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="font-outfit text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">Classification</label>
                                                    <select
                                                        value={inlineFormData.category}
                                                        onChange={(e) => setInlineFormData({ ...inlineFormData, category: e.target.value })}
                                                        className="bg-[#151518] rounded-lg p-3.5 font-outfit text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/50 transition-all border border-white/5 cursor-pointer appearance-none"
                                                    >
                                                        <option value="T-Shirts" className="bg-[#111]">T-Shirts</option>
                                                        <option value="Hoodies" className="bg-[#111]">Hoodies</option>
                                                        <option value="Accessories" className="bg-[#111]">Accessories</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Right side: Update Buttons */}
                                            <div className="flex-1 flex gap-4 h-[140px] mt-6">
                                                <button 
                                                    type="button"
                                                    onClick={() => { setUpdatingAssetFor(item.id); modelUpdateRef.current?.click(); }}
                                                    className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-[#151518] hover:bg-indigo-500/10 transition-all group/btn border border-white/5 hover:border-indigo-500/30"
                                                >
                                                    <FileCode size={24} className="text-zinc-600 group-hover/btn:text-indigo-400 mb-4 transition-colors" strokeWidth={1.5} />
                                                    <span className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 group-hover/btn:text-white transition-colors">Update .GLB</span>
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => { setUpdatingAssetFor(item.id); thumbUpdateRef.current?.click(); }}
                                                    className="flex-1 flex flex-col items-center justify-center rounded-2xl bg-[#151518] hover:bg-[var(--primary)]/10 transition-all group/btn border border-white/5 hover:border-[var(--primary)]/30"
                                                >
                                                    <Shirt size={24} className="text-zinc-600 group-hover/btn:text-[var(--primary)] mb-4 transition-colors" strokeWidth={1.5} />
                                                    <span className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 group-hover/btn:text-white transition-colors">Update Snapshot</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                                            <label className="flex items-center gap-3 cursor-pointer group/check">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${inlineFormData.is_published ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-[#151518] border-white/10 group-hover/check:border-white/30'}`}>
                                                    {inlineFormData.is_published && <Check size={14} className="text-black" strokeWidth={3} />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={inlineFormData.is_published}
                                                    onChange={(e) => setInlineFormData({ ...inlineFormData, is_published: e.target.checked })}
                                                    className="hidden"
                                                />
                                                <span className="font-outfit text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 group-hover/check:text-zinc-300 transition-colors">Published in Boutique</span>
                                            </label>

                                            <button
                                                type="submit"
                                                disabled={isSaving}
                                                className="flex items-center gap-3 font-outfit text-[12px] uppercase tracking-[0.2em] bg-[var(--primary)] text-black px-8 py-3.5 rounded-lg font-bold cursor-pointer disabled:opacity-50 hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                                            >
                                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
                                                {isSaving ? 'Syncing...' : 'Apply Changes'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    // ── Read View ─────────────────────────────────────
                                    <>
                                        {/* HOVER OVERLAY: GALLERY STYLE */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none" />
                                        
                                        {/* Actions (Top Right) */}
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 z-40 translate-y-[-10px] group-hover:translate-y-0">
                                            <button
                                                onClick={() => handleStartEdit(item)}
                                                className="p-3 rounded-xl bg-black/40 hover:bg-[var(--primary)] text-white/40 hover:text-black backdrop-blur-xl border border-white/10 transition-all cursor-pointer shadow-2xl"
                                                title="Modify Asset"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.name || 'Item')}
                                                disabled={isSaving}
                                                className="p-3 rounded-xl bg-black/40 hover:bg-red-600 text-white/40 hover:text-white backdrop-blur-xl border border-white/10 transition-all cursor-pointer shadow-2xl disabled:opacity-50"
                                                title="Remove Permanent"
                                            >
                                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            </button>
                                        </div>

                                        {/* Metadata (Bottom Left) */}
                                        <div className="absolute top-8 left-8 opacity-0 group-hover:opacity-100 transition-all duration-300 z-40 translate-y-[10px] group-hover:translate-y-0 pointer-events-none flex flex-col items-start translate-x-[-10px] group-hover:translate-x-0">
                                            <h3 className="font-cormorant text-2xl text-white leading-none break-words max-w-[200px]">
                                                {item.name}
                                            </h3>
                                        </div>

                                        {/* LEFT: GLB Zone */}
                                        <div className="shrink-0 w-[240px] flex flex-col items-center justify-center border-r border-white/5 bg-[#0a0a0c]">
                                            <div className="relative mb-6">
                                                <div className={`w-20 h-20 rounded-3xl bg-[#151520] border ${item.model_path ? 'border-indigo-500/20' : 'border-red-500/20'} flex items-center justify-center`}>
                                                    <FileCode size={32} className={item.model_path ? 'text-indigo-400' : 'text-zinc-600'} strokeWidth={1} />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-[#0a0a0c] ${item.model_path ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            </div>
                                            <span className="font-outfit text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium text-center line-clamp-1 max-w-[140px]">
                                                {item.model_path ? item.name + '.GLB' : 'ORPHAN_ENTRY'}
                                            </span>
                                        </div>

                                        {/* RIGHT: Snapshot Zone (Super Simple) */}
                                        <div className="flex-1 relative flex items-center justify-center bg-[#070709] overflow-hidden group/ss">
                                            <div className="absolute inset-1 rounded-lg border border-white/[0.03] pointer-events-none" />
                                            {item.thumbnail_url ? (
                                                    <img
                                                        src={item.thumbnail_url}
                                                        alt={item.name || 'Apparel'}
                                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                                    />
                                            ) : (
                                                <Shirt size={48} className="text-zinc-800 opacity-20" />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
