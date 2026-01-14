'use client';

import { cn } from "@/lib/utils";

export function PromptInputLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={cn(
            // Default (Mobile): Fixed at bottom, full width with padding
            "fixed bottom-0 left-0 right-0 z-30 p-4 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent",
            // Desktop (lg+): Relative flow, centered
            "lg:relative lg:top-auto lg:bottom-auto lg:left-0 lg:right-0 lg:translate-x-0 lg:w-full lg:max-w-4xl lg:mx-auto lg:mt-8 lg:mb-6 lg:bg-none lg:p-0"
        )}>
            {children}
        </div>
    );
}
