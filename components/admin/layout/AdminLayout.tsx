'use client';

import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminBottomNav from './AdminBottomNav';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        // Apply gold scrollbar skin to root window
        document.documentElement.classList.add('admin-scrollbar');
        return () => document.documentElement.classList.remove('admin-scrollbar');
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);

        // Targeted local tracking for precise border glow
        const target = e.target as HTMLElement;
        const panel = target.closest('.admin-panel') as HTMLElement;
        if (panel) {
            const pRect = panel.getBoundingClientRect();
            panel.style.setProperty('--local-mx', `${e.clientX - pRect.left}px`);
            panel.style.setProperty('--local-my', `${e.clientY - pRect.top}px`);
        }
    };

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="font-outfit admin-bg min-h-screen w-full relative text-white selection:bg-[var(--primary)] selection:text-black flex admin-scrollbar"
        >
            <AdminSidebar />
            
            <main className="flex-1 min-h-screen min-w-0 flex flex-col transition-all duration-300 sm:pb-0 sm:pl-0 sm:ml-56 relative z-10">
                <div className="flex-1 relative">
                    {children}
                </div>
            </main>

            <AdminBottomNav />
        </div>
    );
}
