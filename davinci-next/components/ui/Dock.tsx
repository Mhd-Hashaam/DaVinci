'use client';

import { cn } from "@/lib/utils";
import { MotionValue, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export interface DockProps {
    className?: string;
    children: React.ReactNode;
}

export const Dock = ({ className, children }: DockProps) => {
    const mouseX = useMotionValue(Infinity);

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn(
                "mx-auto flex h-16 gap-4 items-end rounded-2xl bg-gray-50 dark:bg-neutral-900 px-4 pb-3",
                className
            )}
        >
            {/* Pass mouseX to children via context or cloneElement? 
          For simplicity in this standalone, we assume children are DockIcon 
          and we map them if they were passed as array, but React structures are strict.
          Better to use a Context or expect Children.map. 
          Actually, let's keep it simple: Children must be wrapped or handled here.
      */}
            {/* 
          Since we can't easily pass mouseX down without cloneElement or context, 
          let's just expose mouseX via Context if needed, but for now, 
          let's assume the user uses the DockIcon component which we export here and use Context.
       */}
            <DockContext.Provider value={{ mouseX }}>
                {children}
            </DockContext.Provider>
        </motion.div>
    );
};

import { createContext, useContext } from "react";

const DockContext = createContext<{ mouseX: MotionValue<number> }>({
    mouseX: null as any,
});

export const DockIcon = ({
    magnification = 60,
    distance = 140,
    children,
    className,
}: {
    magnification?: number;
    distance?: number;
    children: React.ReactNode;
    className?: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const { mouseX } = useContext(DockContext);

    const distanceCalc = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distanceCalc, [-distance, 0, distance], [40, magnification, 40]);

    const width = useSpring(widthSync, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    return (
        <motion.div
            ref={ref}
            style={{ width }}
            className={cn(
                "aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative",
                className
            )}
        >
            {children}
        </motion.div>
    );
};
