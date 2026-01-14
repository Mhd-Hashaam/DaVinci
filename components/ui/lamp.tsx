"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const LampContainer = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "relative flex min-h-screen flex-col items-center justify-center overflow-visible w-full z-0",
                className
            )}
        >
            <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
                {/* Left conic gradient - Dynamic Theme - Subtle */}
                <motion.div
                    initial={{ opacity: 0.3, width: "15rem" }}
                    whileInView={{ opacity: 0.5, width: "120rem" }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    style={{
                        backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
                        // Use CSS variable for the gradient start
                        // Tailwind v4 doesn't support easy dynamic rgba in strings without full config
                        // We use the CSS variable directly in the gradient stops via style if needed, 
                        // but here we can just use the classes that use the variables.
                    }}
                    className="absolute inset-auto right-1/2 h-56 overflow-visible w-[110rem] [background-image:conic-gradient(from_70deg_at_center_top,var(--lamp-color),transparent,transparent)] opacity-40 text-white"
                />

                {/* Right conic gradient - Dynamic Theme - Subtle */}
                <motion.div
                    initial={{ opacity: 0.3, width: "15rem" }}
                    whileInView={{ opacity: 0.5, width: "120rem" }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    style={{
                        backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
                    }}
                    className="absolute inset-auto left-1/2 h-56 w-[110rem] [background-image:conic-gradient(from_290deg_at_center_top,transparent,transparent,var(--lamp-color))] opacity-40 text-white"
                />

                {/* Central glow orb - Dynamic Theme */}
                <div
                    className="absolute inset-auto z-50 h-36 w-[110rem] -translate-y-1/2 rounded-full opacity-10 blur-[200px]"
                    style={{ backgroundColor: 'var(--lamp-color)' }}
                ></div>

                {/* Animated inner glow - Dynamic Theme */}
                <motion.div
                    initial={{ width: "8rem", opacity: 0.3 }}
                    whileInView={{ width: "60rem", opacity: 0.5 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full blur-3xl"
                    style={{ backgroundColor: 'var(--lamp-color)' }}
                ></motion.div>

                {/* The Bright Horizontal Line - Dynamic Theme */}
                <motion.div
                    initial={{ width: "15rem", opacity: 0.4 }}
                    whileInView={{ width: "120rem", opacity: 0.6 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        ease: "easeInOut",
                    }}
                    className="absolute inset-auto z-50 h-0.5 w-[110rem] -translate-y-[30rem]"
                    style={{ backgroundColor: 'var(--lamp-color)' }}
                ></motion.div>
            </div>

            <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5">
                {children}
            </div>
        </div>
    );
};
