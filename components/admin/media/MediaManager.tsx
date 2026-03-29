'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Folder, File as FileIcon, Image as ImageIcon, Trash2, Home, UploadCloud, FileCode, Search, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { listMediaAction, deleteMediaAction, uploadMediaAction } from '@/app/admin/actions';

type FileObject = {
    name: string;
    id: string | null;
    updated_at: string;
    created_at: string;
    metadata: { size: number; mimetype: string } | null;
};

export default function MediaManager() {
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [files, setFiles] = useState<FileObject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadFiles = async (pathArr: string[]) => {
        setIsLoading(true);
        try {
            const folderStr = pathArr.join('/');
            const res = await listMediaAction(folderStr);
            if (res.error) throw res.error;
            
            // Supabase sometimes returns a blank '.emptyFolderPlaceholder' file
            const cleanFiles = (res.data || []).filter((f: FileObject) => f.name !== '.emptyFolderPlaceholder');
            setFiles(cleanFiles as unknown as FileObject[]);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load directory');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFiles(currentPath);
    }, [currentPath]);

    const handleNavigate = (folderName: string) => {
        setCurrentPath(p => [...p, folderName]);
    };

    const handleCrumbClick = (index: number) => {
        setCurrentPath(p => p.slice(0, index + 1));
    };

    const handleHomeClick = () => {
        setCurrentPath([]);
    };

    const handleDelete = async (fileName: string) => {
        if (!confirm(`Permanently delete ${fileName}?`)) return;
        
        try {
            const folderStr = currentPath.length > 0 ? `${currentPath.join('/')}/` : '';
            const fullPath = `${folderStr}${fileName}`;
            
            const res = await deleteMediaAction([fullPath]);
            if (res.error) throw res.error;
            
            setFiles(prev => prev.filter(f => f.name !== fileName));
            toast.success('File deleted');
        } catch (error: any) {
            toast.error('Failed to delete file');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            
            const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const folderStr = currentPath.length > 0 ? `${currentPath.join('/')}/` : '';
            const fullPath = `${folderStr}${Date.now()}_${cleanName}`;
            
            const res = await uploadMediaAction(fd, fullPath);
            if (res.error) throw new Error((res.error as any).message || 'Upload failed');
            
            toast.success('File uploaded to ' + (folderStr || 'root'));
            loadFiles(currentPath); // reload directory
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (file: FileObject) => {
        if (!file.id) return <Folder className="h-10 w-10 text-[var(--primary)] fill-[var(--primary)]/10" strokeWidth={1.5} />;
        
        const mime = file.metadata?.mimetype || '';
        if (mime.startsWith('image/')) return <ImageIcon className="h-10 w-10 text-zinc-400" strokeWidth={1} />;
        if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) return <FileCode className="h-10 w-10 text-[var(--primary)]/60" strokeWidth={1} />;
        
        return <FileIcon className="h-10 w-10 text-zinc-500" strokeWidth={1} />;
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-700 pb-20">
            {/* Standard Module Header (h-16) */}
            <div className="flex h-16 items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-6">
                    <h1 className="font-cormorant text-2xl font-light tracking-wide text-white">Media Library</h1>
                    <div className="hidden h-4 w-[1px] bg-white/10 sm:block" />
                    
                    {/* Breadcrumbs integrated into header */}
                    <div className="flex items-center gap-1 text-[11px] font-outfit font-light tracking-widest text-zinc-500 overflow-x-auto whitespace-nowrap hide-scrollbar uppercase">
                        <button onClick={handleHomeClick} className={`hover:text-white transition-colors flex items-center gap-1.5 ${currentPath.length === 0 ? 'text-[var(--primary)]' : ''}`}>
                            <Home size={12} /> Root
                        </button>
                        {currentPath.map((folder, i) => (
                            <React.Fragment key={folder + i}>
                                <ChevronRight size={10} className="text-zinc-700 mx-0.5 flex-shrink-0" />
                                <button 
                                    onClick={() => handleCrumbClick(i)} 
                                    className={`hover:text-white transition-colors ${i === currentPath.length - 1 ? 'text-[var(--primary)]' : ''}`}
                                >
                                    {folder}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="w-40 rounded-none border-b border-white/10 bg-transparent pl-8 pr-3 py-1 text-[11px] text-white placeholder-zinc-700 focus:border-[var(--primary)]/50 focus:outline-none transition-all font-outfit font-light tracking-wider"
                        />
                    </div>
                    
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleUpload} multiple={false} />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 rounded-none border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-2 text-[10px] font-medium tracking-[0.15em] text-[var(--primary)] uppercase transition-all hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50 disabled:opacity-50"
                    >
                        <UploadCloud size={14} strokeWidth={2} />
                        {isUploading ? '...' : 'Upload'}
                    </button>
                </div>
            </div>

            {/* Signature Golden Divider */}
            <div className="admin-divider flex-shrink-0" />

            {/* File Content Area */}
            <div className="p-8 flex flex-col gap-6">
                <div className="flex flex-col overflow-hidden rounded-2xl admin-panel bg-black/20">
                    {/* File Grid */}
                    <div className="p-6 bg-[#080808]/50">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-[var(--primary)]" />
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <Folder className="mb-4 h-16 w-16 text-[#222]" />
                        <h3 className="text-lg font-medium text-white">This folder is empty</h3>
                        <p className="mt-1 text-sm text-zinc-500">Upload a file or create a folder to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {files.map((file) => {
                            const isFolder = !file.id;

                            return (
                                <div 
                                    key={file.name} 
                                    className="group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-transparent p-4 text-center transition-all hover:bg-[#161616] hover:border-[#333]"
                                    onDoubleClick={() => isFolder ? handleNavigate(file.name) : window.open(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cms-media/${currentPath.length > 0 ? currentPath.join('/') + '/' : ''}${file.name}`, '_blank')}
                                >
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-lg bg-[#111] group-hover:bg-[#0A0A0A] transition-colors shadow-inner">
                                        {getFileIcon(file)}
                                    </div>
                                    
                                    <div className="w-full">
                                        <p className="truncate text-xs font-medium text-white group-hover:text-[var(--primary)] transition-colors" title={file.name}>
                                            {file.name}
                                        </p>
                                        {!isFolder && file.metadata && (
                                            <p className="mt-0.5 text-[10px] text-zinc-500">{formatSize(file.metadata.size)}</p>
                                        )}
                                    </div>

                                    {!isFolder && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }}
                                            className="absolute right-2 top-2 rounded-md bg-red-950/80 p-1.5 text-red-400 opacity-0 backdrop-blur transition-all group-hover:opacity-100 hover:bg-red-900 hover:text-white"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="border-t border-white/5 bg-black/40 px-6 py-3 flex justify-between items-center text-[10px] text-zinc-600 font-outfit uppercase tracking-widest">
                <span>{files.length} ITEMS DETECTED</span>
                <span>OPEN ON DOUBLE-CLICK</span>
            </div>
            </div>
        </div>
    </div>
    );
}
