'use client';

import { cn } from "@/lib/utils";

export function PromptInputLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={cn(
            // Default (Mobile): Fixed at bottom, full width with padding
            "fixed bottom-0 left-0 right-0 z-30 p-4 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent",
            // Desktop (lg+): Fixed top, centered
            "lg:fixed lg:top-4 lg:bottom-auto lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:w-full lg:max-w-3xl lg:bg-none lg:p-0"
        )}>
            {children}
        </div>
    );
}
