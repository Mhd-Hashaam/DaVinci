import React from 'react';
import { MoreHorizontal, Search } from 'lucide-react';
import Link from 'next/link';
import { getGalleryItems, getCategories, getAuditLog } from '@/lib/api/admin-cms';
import { DashboardGallerySection } from '@/components/admin/dashboard/DashboardGallerySection';
import { DashboardRecentActivity } from '@/components/admin/dashboard/DashboardRecentActivity';

export default async function AdminDashboardPage() {
    // 1. Fetch Data for Dashboard Components
    const [galleryRes, categoryRes, logRes] = await Promise.all([
        getGalleryItems(),
        getCategories(),
        getAuditLog({ limit: 5 })
    ]);

    const galleryItems = galleryRes.data || [];
    const categories = categoryRes.data || [];
    const logs = logRes.data || [];

    // Dashboard-specific filtering (e.g. latest creations)
    const latestItems = [...galleryItems].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="flex flex-col h-screen overflow-hidden animate-in fade-in duration-700 bg-transparent">
            {/* ── Top Header Section (Fixed Height 16 / 64px) ── */}
            <header className="flex items-center justify-between h-16 px-8 flex-shrink-0">
                <h1 className="font-cormorant text-3xl font-light tracking-wide text-white">Dashboard</h1>
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer group">
                        <Search size={14} className="group-hover:text-[var(--primary)] transition-colors" />
                        <span className="font-outfit text-[9px] uppercase tracking-[0.2em]">Search Admin</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-full bg-white/[0.04] border border-white/10 px-4 py-1.5 hover:bg-white/[0.08] transition-all cursor-pointer group">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10" />
                        <div className="flex flex-col">
                            <span className="font-outfit text-[11px] font-light text-zinc-100 group-hover:text-white transition-colors">Adrouithe</span>
                            <span className="font-outfit text-[8px] text-zinc-500 uppercase tracking-widest">Admin</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* SHARED HORIZONTAL DIVIDER - Precise alignment at 64px */}
            <div className="admin-divider flex-shrink-0" />

            {/* ── Main Content Area ── */}
            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-transparent">
                <div className="max-w-[1600px] mx-auto space-y-6">
                    
                    {/* ── Stat Cards (Ultra compact for 100vh) ── */}
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        <StatCard 
                            title="Gallery Items" 
                            value={galleryItems.length.toLocaleString()} 
                            trend="+12 this week" 
                            positive 
                        />
                        <StatCard title="Active Products" value="248" trend="+24 today" positive />
                        <StatCard title="Storage Used" value="1.5 GB" trend="75% of 2 GB" positive={false} showBar />
                        <StatCard title="Monthly Revenue" value="$10,920" trend="♦ 1,304" positive />
                    </div>

                    {/* ── Main Two-Column Grid ── */}
                    <div className="grid gap-8 lg:grid-cols-5">

                        {/* Left: Analytics + Activity (3/5 width) */}
                        <div className="lg:col-span-3 space-y-8">

                            {/* Analytics Overview */}
                            <div>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h2 className="font-cormorant text-2xl font-light tracking-wide text-white/90">Analytics Overview</h2>
                                    <div className="flex items-center gap-3">
                                        <button className="text-zinc-600 hover:text-white transition-colors cursor-pointer"><MoreHorizontal size={14} /></button>
                                    </div>
                                </div>

                                <div className="rounded-xl admin-panel p-6">
                                    {/* Chart stats row */}
                                    <div className="flex items-center gap-8 mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
                                            <span className="font-outfit text-sm font-medium text-white/90">25.8K</span>
                                            <span className="font-outfit text-[10px] text-zinc-500 uppercase tracking-widest">Views</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#8E7A5A]" />
                                            <span className="font-outfit text-sm font-medium text-white/90">$3,230</span>
                                        </div>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="relative h-44 w-full">
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
                                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d="M0,160 C60,140 100,100 150,90 C200,80 250,130 300,110 C350,90 400,40 450,45 C500,50 550,130 600,120 L600,200 L0,200 Z"
                                                fill="url(#areaGrad)"
                                            />
                                            <path
                                                d="M0,160 C60,140 100,100 150,90 C200,80 250,130 300,110 C350,90 400,40 450,45 C500,50 550,130 600,120"
                                                fill="none"
                                                stroke="var(--primary)"
                                                strokeWidth="1"
                                                strokeOpacity="0.4"
                                            />
                                            {/* Light points */}
                                            <circle cx="450" cy="45" r="2" fill="var(--primary)" className="animate-pulse" />
                                            <circle cx="150" cy="90" r="2" fill="var(--primary)" opacity="0.5" />
                                        </svg>
                                        <div className="absolute bottom-0 right-0">
                                            <span className="font-outfit text-[8px] text-zinc-600 uppercase tracking-[0.2em]">Last 7 Days ▾</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity — Unboxed & Compact */}
                            <DashboardRecentActivity logs={logs as any} />
                        </div>

                        {/* Right: Gallery Management (2/5 width) */}
                        <DashboardGallerySection items={latestItems} categories={categories} />
                    </div>
                </div>
            </main>
        </div>
    );
}

// ─── Stat Card (Ultra compact for 100vh) ───────────────────────────────────────
function StatCard({ title, value, trend, positive, showBar }: {
    title: string; value: string; trend: string; positive: boolean; showBar?: boolean;
}) {
    return (
        <div className="rounded-xl admin-panel p-5 transition-all duration-300 hover:bg-white/[0.03] group cursor-default">
            <p className="font-outfit text-[9px] font-extralight uppercase tracking-[0.25em] text-zinc-500 mb-3 group-hover:text-zinc-400 transition-colors">{title}</p>
            <p className="font-cormorant text-3xl font-light tracking-[0.05em] text-white/95 mb-2">{value}</p>
            {showBar && (
                <div className="w-full h-[1.5px] bg-white/5 rounded-full mb-3 overflow-hidden">
                    <div className="h-full w-3/4 bg-[var(--primary)] opacity-40 shadow-[0_0_8px_var(--primary)]" />
                </div>
            )}
            <p className={`font-outfit text-[10px] tracking-[0.1em] font-light ${positive ? 'text-zinc-400' : 'text-zinc-600'}`}>
               <span className="mr-1.5 opacity-50 text-[var(--primary)]">♦</span> {trend}
            </p>
        </div>
    );
}
