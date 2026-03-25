'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Edit2, Trash2, Search, ChevronDown, Filter, Eye, Diamond, Loader2, Check, X, ArrowUpDown, ChevronLeft, ChevronRight, Star, Users } from 'lucide-react';
import { toast } from 'sonner';
import CmsPagination from '../ui/CmsPagination';
import { 
    createGalleryItemAction, 
    updateGalleryItemAction, 
    deleteGalleryItemAction, 
    uploadMediaAction, 
    renameMediaAction,
    deleteGalleryItemsAction,
    bulkAddGalleryItemsToCategoriesAction,
    bulkUpdateGalleryItemsAction
} from '@/app/admin/actions';
import type { CMSGalleryRow, CMSGalleryInsert, CMSCategoryRow } from '@/types/cms';

interface GalleryManagerProps {
    initialItems: CMSGalleryRow[];
    categories: CMSCategoryRow[];
}

export default function GalleryManager({ initialItems, categories }: GalleryManagerProps) {
    const [items, setItems] = useState<CMSGalleryRow[]>(initialItems);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 120;
    
    // Selection State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [showBulkCategories, setShowBulkCategories] = useState(false);
    const [bulkRenameValue, setBulkRenameValue] = useState('');
    const [submittingId, setSubmittingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [inlineFormData, setInlineFormData] = useState<any>(null);
    const [isInlineCategoryOpen, setIsInlineCategoryOpen] = useState(false);
    const mainFileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ current: number, total: number } | null>(null);

    // Dropdown Refs for Click-Outside
    const categoryRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'order'>('newest');
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Click Outside Logic
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
                setIsStatusOpen(false);
            }
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset page on filter/sort change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategoryId, statusFilter, sortBy]);

    // Scroll to top on page change
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const activeCategory = categories.find(c => c.id === selectedCategoryId);

    const filteredItems = items.filter(item => {
        const matchesSearch = searchQuery === '' || 
            (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.categories || []).some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = !selectedCategoryId || 
            (item.categories || []).some(c => c.id === selectedCategoryId);
        
        const matchesStatus = 
            statusFilter === 'all' ||
            (statusFilter === 'published' && item.is_published) ||
            (statusFilter === 'draft' && !item.is_published) ||
            (statusFilter === 'featured' && item.is_featured);

        return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'title_desc') return (b.title || '').localeCompare(a.title || '');
        if (sortBy === 'order') return (a.display_order || 0) - (b.display_order || 0);
        return 0;
    });

    const isFiltering = searchQuery !== '' || selectedCategoryId !== null || statusFilter !== 'all';

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Curation Category Helpers
    const topPicksCat = categories.find(c => c.slug === 'top-picks' || c.name === 'Top Picks');
    const communityCat = categories.find(c => c.slug === 'community' || c.name === 'Community Creations');

    const handleStartEdit = (item: CMSGalleryRow) => {
        setEditingId(item.id);
        setInlineFormData({
            title: item.title || '',
            category_ids: item.categories?.map(c => c.id) || [],
            is_published: item.is_published ?? true,
            is_featured: item.is_featured ?? false,
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setInlineFormData(null);
    };

    const getImageAspectRatio = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const img = new (window as any).Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                if (ratio > 1.25) resolve('16:9');
                else if (ratio < 0.8) resolve('9:16');
                else if (ratio >= 0.8 && ratio <= 1.25 && ratio !== 1) resolve('4:3');
                else resolve('1:1');
            };
            img.onerror = () => resolve('1:1');
            img.src = URL.createObjectURL(file);
        });
    };

    const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploadingFiles(prev => [...prev, ...files.map(f => f.name)]);
        setUploadProgress({ current: 0, total: files.length });

        let successCount = 0;
        let failCount = 0;

        // Process sequentially to avoid overwhelming server/rate limits
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const aspectRatio = await getImageAspectRatio(file);

                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const uploadPath = `gallery/${Date.now()}_${cleanName}`;

                const uploadRes = await uploadMediaAction(uploadFormData, uploadPath);
                if (uploadRes.error) throw new Error(uploadRes.error.message || 'Upload failed');
                const storageUrl = uploadRes.data?.publicUrl || '';

                // We need the most up-to-date data for order, but React state might be stale in loop
                // Calculate nextOrder safely or rely on backend defaults. For now, max of current items state.
                const nextOrder = items.length > 0 ? Math.max(...items.map((i: CMSGalleryRow) => i.display_order)) + 1 : 0;
                const payload: CMSGalleryInsert = {
                    title: file.name.split('.')[0],
                    storage_url: storageUrl,
                    aspect_ratio: aspectRatio,
                    category_ids: categories.length > 0 ? [categories[0].id] : [],
                    is_published: true,
                    is_featured: false,
                    display_order: nextOrder + i, // Increment manually within loop since state won't update
                    variants: {},
                    metadata: {}
                };

                const res = await createGalleryItemAction(payload);
                if (res.error) throw new Error(res.error.message || 'Failed to create gallery entry');

                if (res.data) {
                    setItems(prev => [res.data, ...prev]);
                    successCount++;
                }
            } catch (error: any) {
                failCount++;
                const errorMessage = error?.message || String(error);
                console.error(`Failed to upload ${file.name}:`, errorMessage);
                // Don't toast every single failure in a large batch to avoid spam
                if (files.length < 5) toast.error(`Failed: ${errorMessage}`);
            } finally {
                setUploadingFiles(prev => prev.filter(name => name !== file.name));
                setUploadProgress(prev => prev ? { ...prev, current: i + 1 } : null);
            }
        }

        if (successCount > 0) toast.success(`Successfully uploaded ${successCount} images`);
        if (failCount > 0) toast.error(`Failed to upload ${failCount} images`);
        
        setUploadProgress(null);
        if (mainFileInputRef.current) mainFileInputRef.current.value = '';
    };

    const handleInlineSubmit = async (e: React.FormEvent, itemId: string) => {
        e.preventDefault();
        console.log('[GALLERY] handleInlineSubmit START:', itemId);

        const item = items.find((i: CMSGalleryRow) => i.id === itemId);
        if (!item || !inlineFormData) {
            console.log('[GALLERY] Guard failed: item or formData missing');
            toast.error('Nothing to save');
            return;
        }

        setSubmittingId(itemId);

        try {
            const finalUpdates = { ...inlineFormData };
            // category_ids are already sanitized in state

            console.log('[GALLERY] Sending updates:', finalUpdates);

            // Rename storage file if title changed
            if (inlineFormData.title !== item.title && item.storage_url) {
                try {
                    const urlParts = item.storage_url.split('/cms-media/');
                    if (urlParts.length > 1) {
                        const oldPath = urlParts[1];
                        const extension = oldPath.split('.').pop();
                        const cleanNewTitle = inlineFormData.title.replace(/[^a-zA-Z0-9]/g, '_');
                        const timestamp = oldPath.split('_')[0] || Date.now();
                        const newPath = `gallery/${timestamp}_${cleanNewTitle}.${extension}`;

                        const renameRes = await renameMediaAction(oldPath, newPath);
                        if (!renameRes.error && renameRes.data?.publicUrl) {
                            finalUpdates.storage_url = renameRes.data.publicUrl;
                        }
                    }
                } catch (err) {
                    console.warn('[GALLERY] Storage rename failed:', err);
                }
            }

            const res = await updateGalleryItemAction(itemId, finalUpdates);
            console.log('[GALLERY] Action response:', JSON.stringify(res));

            if (res.error) {
                console.error('[GALLERY] Server returned error:', res.error);
                toast.error(res.error.message || 'Update failed');
                return;
            }

            // Update local state - re-map categories from main list to keep full objects
            const updatedCategories = categories.filter(c => finalUpdates.category_ids.includes(c.id));
            setItems(prev => prev.map((c: CMSGalleryRow) => c.id === itemId ? { ...c, ...finalUpdates, categories: updatedCategories } : c));
            toast.success('Saved');
            handleCancelEdit();
            console.log('[GALLERY] Save complete');
        } catch (error: any) {
            console.error('[GALLERY] Catch block error:', error);
            toast.error(error.message || 'Failed to save');
        } finally {
            setSubmittingId(null);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"?`)) return;
        try {
            const res = await deleteGalleryItemAction(id);
            if (res.error) throw res.error;
            setItems(prev => prev.filter((c: CMSGalleryRow) => c.id !== id));
            toast.success('Deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete');
        }
    };

    const toggleSelectItem = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} selected items?`)) return;

        setIsBulkDeleting(true);
        try {
            const idsArray = Array.from(selectedIds);
            const res = await deleteGalleryItemsAction(idsArray);
            if (res.error) throw res.error;

            setItems(prev => prev.filter(item => !selectedIds.has(item.id)));
            setSelectedIds(new Set());
            setIsSelectionMode(false);
            toast.success(`Deleted ${idsArray.length} items`);
        } catch (error: any) {
            toast.error(error.message || 'Bulk delete failed');
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const handleBulkRename = async () => {
        if (selectedIds.size === 0 || !bulkRenameValue.trim()) return;
        setIsBulkUpdating(true);
        try {
            const idsArray = Array.from(selectedIds);
            const res = await bulkUpdateGalleryItemsAction(idsArray, { title: bulkRenameValue });
            if (res.error) throw res.error;

            setItems(prev => prev.map(item => 
                selectedIds.has(item.id) ? { ...item, title: bulkRenameValue } : item
            ));
            setBulkRenameValue('');
            setIsSelectionMode(false);
            setSelectedIds(new Set());
            toast.success(`Renamed ${idsArray.length} items`);
        } catch (error: any) {
            toast.error(error.message || 'Bulk rename failed');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleBulkCategorize = async (categoryIds: string[]) => {
        if (selectedIds.size === 0 || categoryIds.length === 0) return;
        setIsBulkUpdating(true);
        try {
            const idsArray = Array.from(selectedIds);
            const res = await bulkAddGalleryItemsToCategoriesAction(idsArray, categoryIds);
            if (res.error) throw res.error;

            // Update local state categories for these items
            const newCats = categories.filter(c => categoryIds.includes(c.id));
            setItems(prev => prev.map(item => 
                selectedIds.has(item.id) ? { ...item, categories: [...(item.categories || []), ...newCats.filter(nc => !item.categories?.some(oc => oc.id === nc.id))] } : item
            ));
            
            setShowBulkCategories(false);
            setIsSelectionMode(false);
            setSelectedIds(new Set());
            toast.success(`Categorized ${idsArray.length} items`);
        } catch (error: any) {
            toast.error(error.message || 'Bulk categorization failed');
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleSelectAll = () => {
        const allIds = filteredItems.map(item => item.id);
        setSelectedIds(new Set(allIds));
        toast.info(`Selected all ${allIds.length} visible items`);
    };

    const handleDeselectAll = () => {
        setSelectedIds(new Set());
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">Gallery</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    <p className="hidden font-outfit text-[11px] font-light uppercase tracking-[0.2em] text-zinc-500 sm:block">
                        Curate Visual Collections
                    </p>
                </div>
                <div className="text-[10px] font-outfit uppercase tracking-[0.2em] text-zinc-500">
                    {items.length} Assets
                </div>
            </div>

            <div className="admin-divider flex-shrink-0" />

            {/* Controls */}
            <div className="flex flex-col gap-6 px-8 py-4 sm:flex-row sm:items-center sm:justify-between relative z-30">
                <div className="flex items-center gap-4">
                    <div className="relative" ref={categoryRef}>
                        <button 
                            onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsStatusOpen(false); setIsSortOpen(false); }}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-black/40 px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5 min-w-[160px] justify-between group"
                        >
                            <span className="truncate group-hover:text-white transition-colors">{activeCategory ? activeCategory.name : 'All Categories'}</span>
                            <ChevronDown size={14} className={cn("transition-transform duration-300", isCategoryOpen && "rotate-180")} />
                        </button>

                        {isCategoryOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                    onClick={() => { setSelectedCategoryId(null); setIsCategoryOpen(false); }}
                                    className="w-full px-4 py-2.5 text-left font-outfit text-[11px] uppercase tracking-widest text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => { setSelectedCategoryId(cat.id); setIsCategoryOpen(false); }}
                                        className={cn(
                                            "w-full px-4 py-2.5 text-left font-outfit text-[11px] uppercase tracking-widest transition-colors flex items-center justify-between cursor-pointer",
                                            selectedCategoryId === cat.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        {cat.name}
                                        {selectedCategoryId === cat.id && <Eye size={10} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="relative" ref={statusRef}>
                        <button 
                            onClick={() => { setIsStatusOpen(!isStatusOpen); setIsCategoryOpen(false); setIsSortOpen(false); }}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-black/40 px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5 min-w-[120px] justify-between group"
                        >
                            <span className="flex items-center gap-2 group-hover:text-white transition-colors">
                                <Filter size={14} className={cn("transition-colors", statusFilter !== 'all' ? "text-[var(--primary)]" : "text-zinc-600")} /> 
                                {statusFilter === 'all' ? 'Filter' : statusFilter}
                            </span>
                            <ChevronDown size={14} className={cn("transition-transform duration-300", isStatusOpen && "rotate-180")} />
                        </button>

                        {isStatusOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {[
                                    { id: 'all', label: 'All Assets' },
                                    { id: 'published', label: 'Published Only' },
                                    { id: 'draft', label: 'Drafts Only' },
                                    { id: 'featured', label: 'Featured Only' }
                                ].map(opt => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => { setStatusFilter(opt.id as any); setIsStatusOpen(false); }}
                                        className={cn(
                                            "w-full px-4 py-2.5 text-left font-outfit text-[11px] uppercase tracking-widest transition-colors flex items-center justify-between cursor-pointer",
                                            statusFilter === opt.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        {opt.label}
                                        {statusFilter === opt.id && <Check className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={sortRef}>
                        <button 
                            onClick={() => { setIsSortOpen(!isSortOpen); setIsCategoryOpen(false); setIsStatusOpen(false); }}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-black/40 px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5 min-w-[130px] justify-between group"
                        >
                            <span className="flex items-center gap-2 group-hover:text-white transition-colors">
                                <ArrowUpDown size={14} className={cn("transition-colors", sortBy !== 'newest' ? "text-[var(--primary)]" : "text-zinc-600")} /> 
                                {sortBy === 'newest' ? 'Newest' : 
                                 sortBy === 'oldest' ? 'Oldest' : 
                                 sortBy === 'title_asc' ? 'Title A-Z' : 
                                 sortBy === 'title_desc' ? 'Title Z-A' : 'Custom'}
                            </span>
                            <ChevronDown size={14} className={cn("transition-transform duration-300", isSortOpen && "rotate-180")} />
                        </button>

                        {isSortOpen && (
                            <div className="absolute top-full left-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {[
                                    { id: 'newest', label: 'Newest First' },
                                    { id: 'oldest', label: 'Oldest First' },
                                    { id: 'title_asc', label: 'Title (A-Z)' },
                                    { id: 'title_desc', label: 'Title (Z-A)' },
                                    { id: 'order', label: 'Display Order' }
                                ].map(opt => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => { setSortBy(opt.id as any); setIsSortOpen(false); }}
                                        className={cn(
                                            "w-full px-4 py-2.5 text-left font-outfit text-[11px] uppercase tracking-widest transition-colors flex items-center justify-between cursor-pointer",
                                            sortBy === opt.id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-zinc-500 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        {opt.label}
                                        {sortBy === opt.id && <Check className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-4 w-[1px] bg-white/10" />

                    {/* NEW SELECT BUTTON */}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setIsSelectionMode(!isSelectionMode);
                                setSelectedIds(new Set());
                            }}
                            className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 font-outfit text-[11px] uppercase tracking-widest transition-all",
                                isSelectionMode 
                                    ? "bg-white/10 border-white/20 text-white" 
                                    : "border-white/5 bg-black/40 text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isSelectionMode ? <X size={14} /> : <Diamond size={14} className="text-zinc-600 group-hover:text-[var(--primary)]" />}
                            {isSelectionMode ? 'Cancel' : 'Select'}
                        </button>

                        {isSelectionMode && (
                            <button 
                                onClick={selectedIds.size === filteredItems.length ? handleDeselectAll : handleSelectAll}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all"
                            >
                                {selectedIds.size === filteredItems.length ? <X size={14} /> : <Check size={14} strokeWidth={3} />}
                                {selectedIds.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => mainFileInputRef.current?.click()}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-6 py-2.5 font-outfit text-[11px] font-medium tracking-[0.2em] text-[var(--primary)] uppercase transition-all hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50"
                    >
                        <Plus size={16} strokeWidth={2} />
                        Add Graphic
                    </button>
                    <div className="relative">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", searchQuery ? "text-[var(--primary)]" : "text-zinc-600")} size={16} />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-48 rounded-lg border border-white/5 bg-black/40 py-2.5 pl-10 pr-4 font-outfit text-[11px] text-white placeholder-zinc-600 focus:border-[var(--primary)]/30 focus:outline-none transition-all cursor-text"
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="p-8">
                <div className="columns-1 gap-3 [column-fill:_balance] sm:columns-2 lg:columns-3 xl:columns-4 space-y-3">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        ref={mainFileInputRef}
                        onChange={handleMainFileSelect}
                    />

                    {/* New Graphic Placeholder (Only in All view) */}
                    {!isFiltering && (
                        <div
                            onClick={() => !uploadProgress && mainFileInputRef.current?.click()}
                            className={cn(
                                "group relative break-inside-avoid overflow-hidden rounded-lg bg-black/40 border border-dashed hover:border-[var(--primary)]/30 transition-all duration-500 flex flex-col items-center justify-center p-8 min-h-[150px]",
                                uploadProgress ? "cursor-default border-[var(--primary)]/50" : "cursor-pointer border-white/10"
                            )}
                        >
                            <div className="flex flex-col items-center justify-center gap-4 w-full z-10">
                                <div className="relative">
                                    {uploadProgress ? (
                                        <Loader2 size={40} className="text-[var(--primary)] animate-spin" strokeWidth={1} />
                                    ) : (
                                        <Plus size={40} className="text-zinc-600 transition-colors group-hover:text-[var(--primary)]" strokeWidth={1} />
                                    )}
                                    <div className="absolute inset-0 blur-2xl bg-[var(--primary)]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex flex-col items-center w-full gap-3">
                                    <span className={cn(
                                        "font-outfit text-[11px] font-light uppercase tracking-[0.3em] transition-colors",
                                        uploadProgress ? "text-[var(--primary)]" : "text-zinc-500 group-hover:text-[var(--primary)]"
                                    )}>
                                        {uploadProgress ? `Uploading files...` : 'New Graphic'}
                                    </span>
                                    
                                    {/* Upload Progress UI */}
                                    {uploadProgress && (
                                        <div className="w-full max-w-[80%] flex flex-col gap-2">
                                            <div className="flex w-full justify-between items-end font-outfit text-[9px] uppercase tracking-widest text-zinc-400">
                                                <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                                                <span className="text-[var(--primary)]">{uploadProgress.current} / {uploadProgress.total}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[var(--primary)] transition-all duration-300 ease-out"
                                                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Cards */}
                    {filteredItems.length === 0 && isFiltering && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                            <Search size={40} className="text-zinc-700 mb-4" strokeWidth={1} />
                            <h3 className="font-cormorant text-xl text-white">No matches found</h3>
                            <p className="font-outfit text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Try broading your search or changing categories</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setSelectedCategoryId(null); setStatusFilter('all'); }}
                                className="mt-6 font-outfit text-[10px] uppercase tracking-widest text-[var(--primary)] hover:text-white transition-colors cursor-pointer border-b border-[var(--primary)]/30 hover:border-white pb-1"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {paginatedItems.map((item: CMSGalleryRow) => {
                        const itemCategories = item.categories || [];
                        const isSaving = submittingId === item.id;
                        const isSelected = selectedIds.has(item.id);

                        return (
                            <div
                                key={item.id}
                                onClick={() => isSelectionMode && toggleSelectItem(item.id)}
                                className={cn(
                                    "group relative break-inside-avoid rounded-lg transition-all duration-500 mb-3",
                                    editingId === item.id ? "z-[60]" : "overflow-hidden",
                                    isSelectionMode && "cursor-pointer",
                                    isSelected && "ring-2 ring-[var(--primary)] shadow-[0_0_20px_var(--primary)/20]"
                                )}
                            >
                                {/* Image Container */}
                                <div className="relative overflow-hidden rounded-lg bg-zinc-900/20">
                                    <img
                                        src={item.storage_url || ''}
                                        alt={item.title || 'Gallery Image'}
                                        className={cn(
                                            "w-full h-auto object-cover transition-transform duration-1000",
                                            !isSelectionMode && "group-hover:scale-105",
                                            isSelected && "scale-105"
                                        )}
                                        loading="lazy"
                                    />
                                    
                                    {/* Selection Overlay & Checkbox */}
                                    {isSelectionMode && (
                                        <>
                                            <div className={cn(
                                                "absolute inset-0 transition-opacity duration-300",
                                                isSelected ? "bg-[var(--primary)]/10" : "bg-black/20 group-hover:bg-black/5"
                                            )} />
                                            <div className={cn(
                                                "absolute top-3 left-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 z-30",
                                                isSelected 
                                                    ? "bg-[var(--primary)] border-[var(--primary)] text-black scale-100" 
                                                    : "bg-black/50 border-white/20 text-transparent scale-90"
                                            )}>
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        </>
                                    )}

                                    {/* Hover Overlay Gradient */}
                                    {!isSelectionMode && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />}
                                    
                                    {/* Top Right Controls (Hidden in Selection Mode) */}
                                    {!isSelectionMode && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-[-4px] group-hover:translate-y-0 flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartEdit(item);
                                                }}
                                                className="p-1.5 rounded-md bg-black/40 hover:bg-[var(--primary)] text-white/50 hover:text-black backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-xl"
                                                title="Edit Metadata"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id, item.title || 'Untitled');
                                                }}
                                                className="p-1.5 rounded-md bg-black/40 hover:bg-red-600 text-white/50 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-xl"
                                                title="Delete Asset"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Read View (Hover Metadata Overlay) */}
                                    {editingId !== item.id && !isSelectionMode && (
                                        <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-10 flex flex-col gap-0.5">
                                            <h3 className="font-cormorant text-lg leading-snug text-white truncate drop-shadow-md">
                                                {item.title || 'Untitled'}
                                            </h3>
                                            <p className="font-outfit text-[9px] text-zinc-300 uppercase tracking-widest truncate drop-shadow-md">
                                                {itemCategories.length > 0 ? itemCategories.map(c => c.name).join(' · ') : 'Uncategorized'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Inline Edit Form (Renders below image when active) */}
                                {editingId === item.id && (
                                    <div className="px-3 py-3 mt-1 bg-[#0a0a0a] border border-white/10 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                        <form onSubmit={(e) => handleInlineSubmit(e, item.id)} className="space-y-2.5">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={inlineFormData.title}
                                                onChange={(e) => setInlineFormData({ ...inlineFormData, title: e.target.value })}
                                                placeholder="Title"
                                                className="w-full border-b border-[var(--primary)]/40 bg-transparent py-0.5 font-cormorant text-base text-white placeholder-zinc-600 focus:border-[var(--primary)] focus:outline-none"
                                            />

                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsInlineCategoryOpen(!isInlineCategoryOpen)}
                                                    className="w-full flex cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-black/40 px-3 py-1.5 font-outfit text-[10px] uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5"
                                                >
                                                    <span className="truncate">
                                                        {inlineFormData.category_ids.length > 0 
                                                            ? `${inlineFormData.category_ids.length} Categories Selected` 
                                                            : 'Select Categories'}
                                                    </span>
                                                    <ChevronDown size={12} className={cn("transition-transform duration-300", isInlineCategoryOpen && "rotate-180")} />
                                                </button>

                                                {isInlineCategoryOpen && (
                                                    <div className="absolute bottom-full left-0 mb-1 w-full max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-[#0a0a0a] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 custom-scrollbar">
                                                        {categories.length === 0 ? (
                                                            <div className="px-3 py-2 text-[10px] text-zinc-600 italic">No categories available</div>
                                                        ) : (
                                                            [...categories]
                                                                .sort((a, b) => {
                                                                    const isACuration = a.id === topPicksCat?.id || a.id === communityCat?.id;
                                                                    const isBCuration = b.id === topPicksCat?.id || b.id === communityCat?.id;
                                                                    if (isACuration && !isBCuration) return -1;
                                                                    if (!isACuration && isBCuration) return 1;
                                                                    return 0;
                                                                })
                                                                .map(c => {
                                                                    const isSelected = inlineFormData.category_ids.includes(c.id);
                                                                    const isSpecial = c.id === topPicksCat?.id || c.id === communityCat?.id;
                                                                    return (
                                                                        <label
                                                                            key={c.id}
                                                                            className={cn(
                                                                                "flex items-center gap-2 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors",
                                                                                isSpecial && "bg-[var(--primary)]/5 border-l-2 border-[var(--primary)]/40"
                                                                            )}
                                                                        >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => {
                                                                                const newIds = isSelected 
                                                                                    ? inlineFormData.category_ids.filter((id: string) => id !== c.id)
                                                                                    : [...inlineFormData.category_ids, c.id];
                                                                                setInlineFormData({ ...inlineFormData, category_ids: newIds });
                                                                            }}
                                                                            className="h-3 w-3 cursor-pointer accent-[var(--primary)] rounded border-zinc-700 bg-zinc-900"
                                                                        />
                                                                         <span className={cn(
                                                                            "font-outfit text-[10px] uppercase tracking-widest truncate",
                                                                            isSpecial ? "text-[var(--primary)] font-medium" : "text-zinc-300"
                                                                        )}>
                                                                            {c.name} {isSpecial && '★'}
                                                                        </span>
                                                                    </label>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={inlineFormData.is_published}
                                                        onChange={(e) => setInlineFormData({ ...inlineFormData, is_published: e.target.checked })}
                                                        className="h-3 w-3 cursor-pointer accent-[var(--primary)]"
                                                    />
                                                    <span className="font-outfit text-[10px] text-zinc-500">Published</span>
                                                </label>
                                                <label className="flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={inlineFormData.is_featured}
                                                        onChange={(e) => setInlineFormData({ ...inlineFormData, is_featured: e.target.checked })}
                                                        className="h-3 w-3 cursor-pointer accent-[#C5A572]"
                                                    />
                                                    <span className="font-outfit text-[10px] text-[#C5A572]">Featured</span>
                                                </label>
                                            </div>

                                            <div className="flex items-center justify-end gap-4 pt-0.5 border-t border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    disabled={isSaving}
                                                    className="font-outfit text-[9px] uppercase tracking-widest text-zinc-600 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isSaving}
                                                    className="flex items-center gap-1.5 font-outfit text-[9px] uppercase tracking-widest text-[var(--primary)] font-semibold cursor-pointer disabled:opacity-60"
                                                >
                                                    {isSaving && <Loader2 size={10} className="animate-spin" />}
                                                    {isSaving ? 'Saving' : 'Save'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <CmsPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    className="mt-8 pb-12"
                />
            </div>
            {/* Bulk Action Bar */}
            {isSelectionMode && selectedIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500">
                    <div className="flex items-center gap-6 px-6 py-4 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[600px]">
                        {/* Count */}
                        <div className="flex flex-col gap-0.5 pr-6 border-r border-white/10">
                            <span className="font-outfit text-[10px] uppercase tracking-widest text-[var(--primary)] font-medium">Selected</span>
                            <span className="font-cormorant text-2xl text-white leading-none">{selectedIds.size} <span className="text-sm opacity-50">Assets</span></span>
                        </div>

                        {/* Bulk Actions */}
                        <div className="flex items-center gap-4 flex-1">
                            {/* Rename */}
                            <div className="flex items-center gap-2 group flex-1 max-w-[200px]">
                                <input 
                                    type="text" 
                                    placeholder="Bulk rename..."
                                    value={bulkRenameValue}
                                    onChange={(e) => setBulkRenameValue(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-md px-3 py-1.5 text-xs font-outfit text-white focus:outline-none focus:border-[var(--primary)]/50 transition-all placeholder:text-zinc-600"
                                />
                                <button 
                                    onClick={handleBulkRename}
                                    disabled={isBulkUpdating || !bulkRenameValue.trim()}
                                    className="p-1.5 rounded-md text-zinc-400 hover:text-[var(--primary)] hover:bg-white/5 transition-all disabled:opacity-30 cursor-pointer"
                                    title="Apply Rename"
                                >
                                    {isBulkUpdating ? <Loader2 size={14} className="animate-spin" /> : <Edit2 size={14} />}
                                </button>
                            </div>

                                <div className="h-6 w-[1px] bg-white/10" />

                                {/* Quick Curation */}
                                <div className="flex items-center gap-2">
                                    {topPicksCat && (
                                        <button 
                                            onClick={() => handleBulkCategorize([topPicksCat.id])}
                                            disabled={isBulkUpdating}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs font-outfit text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all cursor-pointer disabled:opacity-30"
                                            title="Add to Top Picks"
                                        >
                                            <Star size={14} />
                                            <span className="hidden lg:inline text-[10px] uppercase tracking-wider font-semibold">Top Picks</span>
                                        </button>
                                    )}
                                    {communityCat && (
                                        <button 
                                            onClick={() => handleBulkCategorize([communityCat.id])}
                                            disabled={isBulkUpdating}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-outfit text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer disabled:opacity-30"
                                            title="Add to Community"
                                        >
                                            <Users size={14} />
                                            <span className="hidden lg:inline text-[10px] uppercase tracking-wider font-semibold">Community</span>
                                        </button>
                                    )}
                                </div>

                                <div className="h-6 w-[1px] bg-white/10" />

                            {/* Categorize */}
                            <div className="relative group">
                                <button 
                                    onClick={() => setShowBulkCategories(!showBulkCategories)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-xs font-outfit text-zinc-300 hover:text-white hover:border-white/10 transition-all cursor-pointer"
                                >
                                    <Filter size={14} className="text-[var(--primary)]" />
                                    Add Categories
                                    <ChevronDown size={12} className={cn("transition-transform duration-300", showBulkCategories && "rotate-180")} />
                                </button>

                                {showBulkCategories && (
                                    <div className="absolute bottom-full left-0 mb-3 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-[110]">
                                        <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto pr-1">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleBulkCategorize([cat.id])}
                                                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-all group/cat cursor-pointer"
                                                >
                                                    <Diamond size={10} className="text-zinc-700 group-hover/cat:text-[var(--primary)]" />
                                                    <span className="font-outfit text-[11px] text-zinc-400 group-hover/cat:text-white truncate">{cat.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Danger Section */}
                        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                            <button 
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all font-outfit text-[10px] uppercase tracking-widest disabled:opacity-50 cursor-pointer group"
                            >
                                {isBulkDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} className="group-hover:scale-110 transition-transform" />}
                                Delete
                            </button>

                            <button 
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedIds(new Set());
                                }}
                                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                                title="Close selection"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
