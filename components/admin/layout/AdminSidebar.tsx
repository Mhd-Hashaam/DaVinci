'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Images, 
    FolderClosed, 
    Shirt, 
    Image as ImageIcon,
    Tags,
    Settings,
    Activity,
    LogOut,
    Frame,
    Star,
    Users
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export const ADMIN_NAV_LINKS = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Gallery', href: '/admin/gallery', icon: Images },
    { name: 'Top Picks', href: '/admin/top-picks', icon: Star },
    { name: 'Community', href: '/admin/community', icon: Users },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'The Closet', href: '/admin/closet', icon: Shirt },
    { name: 'Media', href: '/admin/media', icon: ImageIcon },
    { name: 'Site Engine', href: '/admin/content', icon: Frame },
    { name: 'Analytics', href: '/admin/analytics', icon: Activity },
    { name: 'Users / Audit', href: '/admin/users', icon: Activity },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { signOut } = useAuthStore();

    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-white/5 sm:flex bg-transparent">
            {/* Logo Area (Fixed Height 16 matching mockup header) */}
            <div className="flex h-16 items-center px-10">
                <span className="flex items-center gap-3 font-cormorant text-xl font-light text-white tracking-[0.15em] whitespace-nowrap">
                    <span className="text-[var(--primary)] text-lg font-thin">◇</span>
                    LeVinCi CMS
                </span>
            </div>

            {/* SHARED HORIZONTAL DIVIDER */}
            <div className="admin-divider" />

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-8 px-5 custom-scrollbar">
                <ul className="space-y-2">
                    {ADMIN_NAV_LINKS.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href));
                        
                        return (
                            <li key={link.href}>
                                <Link 
                                    href={link.href}
                                    className={`group flex items-center gap-5 rounded-xl px-5 py-3 text-[12px] font-medium tracking-[0.1em] uppercase transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-white/5 text-white shadow-sm' 
                                            : 'text-white/30 hover:bg-white/[0.03] hover:text-white/70'
                                    }`}
                                >
                                    <Icon size={20} strokeWidth={isActive ? 1.5 : 1.2} className="transition-transform duration-300 group-hover:scale-110" />
                                    {link.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Bottom Area */}
            <div className="mt-auto p-10">
                <button 
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-4 rounded-xl px-5 py-3 text-[12px] font-medium tracking-[0.1em] uppercase text-white/20 transition-all hover:bg-white/[0.03] hover:text-white/60"
                >
                    <LogOut size={20} strokeWidth={1} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
