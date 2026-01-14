'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface ResponsiveShellProps {
    sidebar: React.ReactNode;
    bottomSheet?: React.ReactNode;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    // Props for active tab/navigation
    activeTab?: string;
    setActiveTab?: (tab: string) => void;
    children: React.ReactNode;
    className?: string;
}

export function ResponsiveShell({
    children,
    sidebar,
    bottomSheet,
    sidebarOpen,
    setSidebarOpen,
    className
}: ResponsiveShellProps) {
    return (
        <div className={cn("flex flex-col md:flex-row min-h-screen", className)}>
            {/* Desktop Sidebar */}
            <aside className="hidden md:block h-screen sticky top-0 bg-[#09090b] z-40 shrink-0">
                {sidebar}
            </aside>

            {/* Mobile Sidebar Overlay & Drawer */}
            <div className={cn(
                "fixed inset-0 z-50 md:hidden transition-all duration-300",
                sidebarOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
            )}>
                {/* Backdrop */}
                <div
                    className={cn(
                        "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
                        sidebarOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* Drawer */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-[280px] bg-[#09090b] border-r border-white/10 shadow-2xl transition-transform duration-300 ease-out transform",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    {sidebar}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative min-h-screen">
                {children}
            </main>

            {/* Mobile Bottom Bar (optional, currently using drawer) */}
            {bottomSheet && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 border-t border-white/10 p-4 pb-safe">
                    {bottomSheet}
                </div>
            )}
        </div>
    );
}
