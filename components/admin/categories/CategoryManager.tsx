'use client';

import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronDown, Filter, ArrowRight, Loader2, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction, uploadMediaAction, removeGalleryItemFromCategoryAction, createGalleryItemAction } from '@/app/admin/actions';
import AdminModal from '@/components/admin/ui/AdminModal';
import ImagePickerModal from './ImagePickerModal';
import { cn } from '@/lib/utils';
import type { CMSCategoryRow, CMSCategoryInsert, CMSGalleryRow, CMSGalleryInsert } from '@/types/cms';

interface CategoryManagerProps {
    initialData: CMSCategoryRow[];
    galleryItems: CMSGalleryRow[];
}

export default function CategoryManager({ initialData, galleryItems }: CategoryManagerProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<CMSCategoryRow[]>(initialData);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CMSCategoryRow | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingIcon, setIsUploadingIcon] = useState(false);

    // Upload & Picker State
    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
    const [activeCategoryForPicker, setActiveCategoryForPicker] = useState<CMSCategoryRow | null>(null);
    const [isUploadingGraphic, setIsUploadingGraphic] = useState<Record<string, boolean>>({});

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const graphicUploadRef = useRef<HTMLInputElement>(null);
    const activeUploadCategoryRef = useRef<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        color: '#C5A572',
        icon: '',
        is_active: true
    });

    // Filtering categories based on search
    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handlers
    const handleOpenModal = (category?: CMSCategoryRow) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                color: category.color || '#C5A572',
                icon: category.icon || '',
                is_active: category.is_active ?? true
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', color: '#C5A572', icon: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleOpenImagePicker = (category: CMSCategoryRow) => {
        setActiveCategoryForPicker(category);
        setIsImagePickerOpen(true);
    };

    const triggerDeviceUpload = (categoryId: string) => {
        activeUploadCategoryRef.current = categoryId;
        if (graphicUploadRef.current) {
            graphicUploadRef.current.value = ''; // Reset input
            graphicUploadRef.current.click();
        }
    };

    const handleDeviceUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeUploadCategoryRef.current) return;
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const categoryId = activeUploadCategoryRef.current;

        setIsUploadingGraphic(prev => ({ ...prev, [categoryId]: true }));
        let successCount = 0;

        try {
            for (const file of files) {
                const fd = new FormData();
                fd.append('file', file);
                const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

                // 1. Upload Media
                console.log(`[CategoryManager] Uploading file for category ${categoryId}...`);
                const uploadRes = await uploadMediaAction(fd, `gallery/${Date.now()}_${cleanName}`);
                if (uploadRes.error) {
                    console.error('[CategoryManager] Upload Media Error:', uploadRes.error);
                    throw uploadRes.error;
                }

                if (uploadRes.data?.publicUrl) {
                    const storageUrl = uploadRes.data.publicUrl;
                    const pathParts = storageUrl.split('/');
                    const storagePath = pathParts.slice(pathParts.indexOf('cms-media') + 1).join('/');

                    // 2. Insert into Gallery & Link to Category
                    const nextOrder = galleryItems.length > 0 ? Math.max(...galleryItems.map(i => i.display_order)) + 1 : 0;

                    const payload: CMSGalleryInsert = {
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        storage_url: storageUrl,
                        aspect_ratio: '1:1', // Default, user can change later in gallery
                        category_ids: [categoryId],
                        is_published: true,
                        is_featured: false,
                        display_order: nextOrder,
                        variants: {},
                        metadata: {}
                    };

                    console.log(`[CategoryManager] Creating gallery item...`, payload);
                    const createRes = await createGalleryItemAction(payload);
                    if (createRes.error) {
                        console.error('[CategoryManager] Create Gallery Item Error:', createRes.error);
                        throw createRes.error;
                    }
                    successCount++;
                }
            }
            if (successCount > 0) {
                toast.success(`Successfully added ${successCount} graphic(s) to category!`);
                router.refresh(); // Crucial to update the UI
            }
        } catch (err: any) {
            console.error('[CategoryManager] Catch block caught error:', err);
            toast.error(err.message || 'Error uploading graphics');
        } finally {
            setIsUploadingGraphic(prev => ({ ...prev, [categoryId]: false }));
            activeUploadCategoryRef.current = null;
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            name: val,
            slug: prev.slug === '' || prev.slug === val.slice(0, -1).toLowerCase().replace(/[^a-z0-9]+/g, '-')
                ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                : prev.slug
        }));
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingIcon(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const res = await uploadMediaAction(fd, `categories/${Date.now()}_${cleanName}`);
            if (res.error) throw res.error;
            if (res.data?.publicUrl) {
                setFormData(prev => ({ ...prev, icon: res.data.publicUrl }));
                toast.success('Icon uploaded');
            }
        } catch (err: any) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setIsUploadingIcon(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingCategory) {
                const res = await updateCategoryAction(editingCategory.id, formData);
                if (res.error) throw res.error;
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
                toast.success('Category updated');
            } else {
                const nextOrder = categories.length > 0 ? Math.max(...categories.map(c => c.display_order)) + 1 : 0;
                const payload: CMSCategoryInsert = {
                    ...formData,
                    display_order: nextOrder
                };
                const res = await createCategoryAction(payload);
                if (res.error) throw res.error;
                if (res.data) setCategories(prev => [...prev, res.data]);
                toast.success('Category created');
            }
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;
        try {
            const res = await deleteCategoryAction(id);
            if (res.error) throw res.error;
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success('Category deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete');
        }
    };

    const handleRemoveItemFromCategory = async (e: React.MouseEvent, categoryId: string, galleryId: string) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const res = await removeGalleryItemFromCategoryAction(categoryId, galleryId);
            if (res.error) throw res.error;
            toast.success('Graphic removed from category');
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || 'Failed to remove graphic');
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-20">
            {/* Hidden Input for direct graphic uploads */}
            <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={graphicUploadRef}
                onChange={handleDeviceUploadChange}
            />

            {/* Header */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">Categories</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    <p className="hidden font-outfit text-[11px] font-light uppercase tracking-[0.2em] text-zinc-500 sm:block">
                        Organization System
                    </p>
                </div>
                <div className="text-[10px] font-outfit uppercase tracking-[0.2em] text-zinc-500">
                    {categories.length} Categories
                </div>
            </div>

            <div className="admin-divider flex-shrink-0" />

            {/* Controls aligned per user request */}
            <div className="flex flex-col gap-6 px-8 py-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Bar on Top Left */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input
                            type="text"
                            placeholder="Search shelves..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-48 rounded-lg border border-white/5 bg-black/40 py-2.5 pl-10 pr-4 font-outfit text-[11px] text-white placeholder-zinc-600 focus:border-[var(--primary)]/30 focus:outline-none transition-all cursor-text"
                        />
                    </div>
                </div>

                {/* All Categories, Filter, Add New Category on Right */}
                <div className="flex items-center gap-4">
                    <button className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-black/40 px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5">
                        All Categories <ChevronDown size={14} />
                    </button>
                    <button className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 bg-black/40 px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-zinc-400 transition-all hover:bg-white/5">
                        <Filter size={14} className="text-[var(--primary)]" /> Filter <ChevronDown size={14} />
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-6 py-2.5 font-outfit text-[11px] font-medium tracking-[0.2em] text-[var(--primary)] uppercase transition-all hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50"
                    >
                        <Plus size={16} strokeWidth={2} />
                        New Category
                    </button>
                </div>
            </div>

            {/* Shelves Layout */}
            <div className="p-8 flex flex-col gap-0">
                {filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-dashed border-white/10">
                        <h3 className="font-cormorant text-2xl text-white">No categories found</h3>
                        <p className="mt-2 font-outfit text-sm font-light text-zinc-400">Try adjusting your search or create a new category.</p>
                    </div>
                ) : (
                    filteredCategories.map((cat, index) => {
                        const itemsInCat = galleryItems.filter(i => i.categories?.some(c => c.id === cat.id));
                        const isUploading = isUploadingGraphic[cat.id];

                        return (
                            <div key={cat.id} className="flex flex-col gap-6 py-12 group/shelf">
                                {index !== 0 && (
                                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)]/70 to-transparent mb-16" />
                                )}
                                {/* Shelf Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Dynamic Icon */}
                                        <div className="relative group w-12 h-12 rounded-xl border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center">
                                            {cat.icon ? (
                                                <img src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div
                                                    className="w-full h-full opacity-30"
                                                    style={{ backgroundColor: cat.color || '#333' }}
                                                />
                                            )}
                                        </div>

                                        {/* Name and Actions */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-baseline gap-3">
                                                <h3 className="font-cormorant text-2xl text-white tracking-wide">{cat.name}</h3>
                                                <span className="font-outfit text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-light whitespace-nowrap">
                                                    {itemsInCat.length} {itemsInCat.length === 1 ? 'Asset' : 'Assets'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-1.5 rounded-md hover:bg-white/10 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                                    title="Edit Category"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    className="p-1.5 rounded-md hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                                                    title="Delete Category"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shelf Actions */}
                                    <div className="flex items-center gap-4">
                                        {/* Hoverable Add Graphics Split Button */}
                                        <div className="relative group/addbtn flex items-center justify-center h-8 w-[130px]">
                                            {isUploadingGraphic[cat.id] ? (
                                                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
                                                    <Loader2 size={14} className="animate-spin" />
                                                    <span className="text-[10px] font-outfit uppercase tracking-widest">Uploading...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Default State (Fades out on hover) */}
                                                    <button className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[10px] font-outfit uppercase tracking-widest text-[var(--primary)] transition-all group-hover/addbtn:opacity-0 group-hover/addbtn:scale-95 pointer-events-none group-hover/addbtn:pointer-events-none cursor-pointer">
                                                        <Plus size={12} />
                                                        Add Graphics
                                                    </button>

                                                    {/* Hover State (Fades in on hover) */}
                                                    <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 opacity-0 scale-95 transition-all group-hover/addbtn:opacity-100 group-hover/addbtn:scale-100 pointer-events-none group-hover/addbtn:pointer-events-auto shadow-[0_0_15px_rgba(197,165,114,0.15)]">
                                                        <button
                                                            onClick={() => triggerDeviceUpload(cat.id)}
                                                            className="flex-1 h-full flex items-center justify-center rounded-l-md hover:bg-[var(--primary)]/20 text-[var(--primary)]/70 hover:text-[var(--primary)] transition-colors cursor-pointer"
                                                            title="Upload from Device"
                                                        >
                                                            <Upload size={14} />
                                                        </button>
                                                        <div className="w-[1px] h-4 bg-[var(--primary)]/20" />
                                                        <button
                                                            onClick={() => handleOpenImagePicker(cat)}
                                                            className="flex-1 h-full flex items-center justify-center rounded-r-md hover:bg-[var(--primary)]/20 text-[var(--primary)]/70 hover:text-[var(--primary)] transition-colors cursor-pointer"
                                                            title="Select from Gallery"
                                                        >
                                                            <ImageIcon size={14} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <button className="flex items-center gap-1 text-[10px] font-outfit uppercase tracking-widest text-zinc-500 hover:text-white transition-colors cursor-pointer group">
                                            Show All
                                            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </div>

                                {/* Single Row Grid (Max 4) */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
                                    {itemsInCat.length > 0 ? (
                                        itemsInCat.slice(0, 4).map(item => (
                                            <div key={item.id} className="relative aspect-[4/5] rounded-lg overflow-hidden bg-zinc-900/20 group cursor-default">
                                                <img
                                                    src={item.storage_url}
                                                    alt={item.title || 'Graphic'}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                                {/* Text Overlay */}
                                                <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-10">
                                                    <h4 className="font-cormorant text-base text-white truncate drop-shadow-md">{item.title || 'Untitled'}</h4>
                                                </div>

                                                {/* Remove from Category Button */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                                    <button
                                                        onClick={(e) => handleRemoveItemFromCategory(e, cat.id, item.id)}
                                                        className="p-1.5 rounded-md bg-black/60 hover:bg-red-600 text-white/50 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-xl"
                                                        title="Remove from category"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full min-h-[150px] border border-dashed border-white/10 bg-white/[0.02] rounded-md flex flex-col items-center justify-center gap-4 transition-all hover:bg-white/[0.04] group/empty relative overflow-hidden p-6">
                                            {isUploadingGraphic[cat.id] ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <Loader2 className="animate-spin text-[var(--primary)]" size={24} />
                                                    <p className="font-outfit text-[11px] uppercase tracking-[0.2em] text-[var(--primary)] animate-pulse">Processing...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 group-hover/empty:text-[var(--primary)] transition-colors">
                                                        <Plus size={20} />
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <p className="font-outfit text-[10px] uppercase tracking-[0.2em] text-zinc-500">No graphics assigned yet</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <button
                                                                onClick={() => triggerDeviceUpload(cat.id)}
                                                                className="font-cormorant text-[17px] text-[var(--primary)] hover:text-white transition-colors cursor-pointer"
                                                            >
                                                                Upload from Device
                                                            </button>
                                                            <span className="text-zinc-600 text-xs px-1">or</span>
                                                            <button
                                                                onClick={() => handleOpenImagePicker(cat)}
                                                                className="font-cormorant text-[17px] text-[var(--primary)] hover:underline cursor-pointer decoration-[var(--primary)]/30 underline-offset-4"
                                                            >
                                                                Select from Gallery
                                                            </button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create / Edit Modal */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? "Edit Category" : "New Category"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Icon Upload Row */}
                    <div className="flex items-center gap-6">
                        <div className="relative group w-20 h-20 rounded-2xl border border-white/10 bg-black/40 overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {formData.icon ? (
                                <img src={formData.icon} alt="Category Icon" className="w-full h-full object-cover" />
                            ) : (
                                <Upload size={24} className="text-zinc-600" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {isUploadingIcon ? <Loader2 className="animate-spin text-white" size={20} /> : <Edit2 className="text-white" size={20} />}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleIconUpload}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="mb-2 block font-outfit text-[11px] font-light tracking-[0.1em] uppercase text-zinc-400">Category Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleNameChange}
                                className="w-full rounded-none border-b border-white/10 bg-transparent px-0 py-2 font-cormorant text-xl text-white placeholder-zinc-600 focus:border-[var(--primary)] focus:outline-none transition-colors"
                                placeholder="e.g. Halloween"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-2 block font-outfit text-[11px] font-light tracking-[0.1em] uppercase text-zinc-400">URL Slug</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                                className="w-full rounded-none border-b border-white/10 bg-transparent px-0 py-2 font-mono text-xs text-zinc-400 placeholder-zinc-600 focus:border-[var(--primary)] focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-outfit text-[11px] font-light tracking-[0.1em] uppercase text-zinc-400">Color/Theme</label>
                            <div className="flex gap-3 h-10">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                    className="h-full w-10 cursor-pointer rounded-none bg-transparent p-0 border-0"
                                />
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={(e) => setFormData(p => ({ ...p, color: e.target.value }))}
                                    className="flex-1 rounded-none border-b border-white/10 bg-transparent px-0 text-xs font-mono text-zinc-400 focus:border-[var(--primary)] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.is_active}
                            onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                            className="h-4 w-4 appearance-none rounded-none border border-white/20 bg-white/5 checked:bg-[var(--primary)] checked:border-[var(--primary)] transition-colors cursor-pointer"
                        />
                        <label htmlFor="isActive" className="font-outfit text-xs tracking-wider text-zinc-300 cursor-pointer">
                            Active (Visible in App)
                        </label>
                    </div>

                    <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            disabled={isSubmitting || isUploadingIcon}
                            className="px-4 py-2 font-outfit text-[11px] uppercase tracking-widest text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isUploadingIcon}
                            className="rounded-none border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-8 py-2.5 font-outfit text-[11px] tracking-widest text-[var(--primary)] uppercase transition-all hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                            {isSubmitting ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* Image Picker Modal */}
            {activeCategoryForPicker && (
                <ImagePickerModal
                    isOpen={isImagePickerOpen}
                    onClose={() => setIsImagePickerOpen(false)}
                    categoryId={activeCategoryForPicker.id}
                    categoryName={activeCategoryForPicker.name}
                    allGalleryItems={galleryItems}
                    onSuccess={() => {
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
