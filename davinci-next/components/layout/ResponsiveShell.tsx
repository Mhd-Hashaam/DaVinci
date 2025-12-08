'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface ResponsiveShellProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    bottomSheet?: React.ReactNode;
    // If not provided, we might transform sidebar or just hide it
    className?: string;
}

export function ResponsiveShell({
    children,
    sidebar,
    bottomSheet,
    className
}: ResponsiveShellProps) {
    return (
        <div className={cn("flex flex-col md:flex-row min-h-screen", className)}>
            {/* Desktop Sidebar - Hidden on Mobile */}
            <aside className="hidden md:block h-screen sticky top-0 bg-black/90 z-40 w-fit">
                {sidebar}
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>

            {/* Mobile Bottom Sheet/Nav - Visible on Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 border-t border-white/10 p-4 pb-safe">
                {bottomSheet || <div className="text-xs text-center text-zinc-500">Mobile Navigation</div>}
            </div>
        </div>
    );
}
