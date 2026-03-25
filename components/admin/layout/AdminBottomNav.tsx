'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV_LINKS } from './AdminSidebar';

// We only show top 4 links on mobile bottom nav + maybe a menu for the rest
const BOTTOM_NAV_LINKS = ADMIN_NAV_LINKS.slice(0, 4);

export default function AdminBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 z-40 h-16 w-full border-t border-white/5 sm:hidden" style={{ backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', background: 'transparent' }}>
            <div className="flex h-full items-center justify-around px-2">
                {BOTTOM_NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center justify-center gap-1.5 p-2 transition-all duration-300 ${
                                isActive ? 'text-[var(--primary)] drop-shadow-[0_0_12px_rgba(197,165,114,0.4)]' : 'text-white/30 hover:text-white/70'
                            }`}
                        >
                            <Icon size={22} strokeWidth={isActive ? 1.5 : 1} />
                            <span className="text-[10px] font-light tracking-[0.2em] uppercase">{link.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
