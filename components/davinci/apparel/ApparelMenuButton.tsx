'use client';

import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface ApparelMenuButtonProps {
    onClick?: () => void;
}

export const ApparelMenuButton: React.FC<ApparelMenuButtonProps> = ({ onClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dotsRef = useRef<(SVGCircleElement | null)[]>([]);

    // Grid positions for 3x3 dots (menu state)
    const gridPositions = [
        { cx: 6, cy: 6 },   // top-left
        { cx: 14, cy: 6 },  // top-center
        { cx: 22, cy: 6 },  // top-right
        { cx: 6, cy: 14 },  // middle-left
        { cx: 14, cy: 14 }, // center
        { cx: 22, cy: 14 }, // middle-right
        { cx: 6, cy: 22 },  // bottom-left
        { cx: 14, cy: 22 }, // bottom-center
        { cx: 22, cy: 22 }, // bottom-right
    ];

    // X pattern positions (open state)
    const xPositions = [
        { cx: 7, cy: 7 },    // top-left diagonal
        { cx: 14, cy: 6 },   // top (fades out)
        { cx: 21, cy: 7 },   // top-right diagonal
        { cx: 6, cy: 14 },   // left (fades out)
        { cx: 14, cy: 14 },  // center
        { cx: 22, cy: 14 },  // right (fades out)
        { cx: 7, cy: 21 },   // bottom-left diagonal
        { cx: 14, cy: 22 },  // bottom (fades out)
        { cx: 21, cy: 21 },  // bottom-right diagonal
    ];

    useGSAP(() => {
        const tl = gsap.timeline();

        if (isOpen) {
            // Morph to X pattern
            dotsRef.current.forEach((dot, i) => {
                if (dot) {
                    // Fade out middle cross dots (1, 3, 5, 7)
                    if ([1, 3, 5, 7].includes(i)) {
                        tl.to(dot, {
                            opacity: 0,
                            scale: 0.5,
                            duration: 0.3,
                            ease: 'power2.in'
                        }, 0);
                    } else {
                        // Move diagonal and center dots to X positions
                        tl.to(dot, {
                            attr: { cx: xPositions[i].cx, cy: xPositions[i].cy },
                            scale: 1.2,
                            duration: 0.4,
                            ease: 'back.out(2)'
                        }, 0);
                    }
                }
            });
        } else {
            // Back to grid
            dotsRef.current.forEach((dot, i) => {
                if (dot) {
                    tl.to(dot, {
                        attr: { cx: gridPositions[i].cx, cy: gridPositions[i].cy },
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        ease: 'back.out(1.5)'
                    }, 0);
                }
            });
        }
    }, { dependencies: [isOpen] });

    const handleClick = () => {
        setIsOpen(!isOpen);
        onClick?.();
    };

    return (
        <button
            onClick={handleClick}
            className="group p-2 cursor-pointer transition-all duration-300"
            aria-label="Menu"
        >
            <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-zinc-400 group-hover:text-white transition-colors"
            >
                {gridPositions.map((pos, i) => (
                    <circle
                        key={i}
                        ref={(el) => { dotsRef.current[i] = el; }}
                        cx={pos.cx}
                        cy={pos.cy}
                        r="2"
                        fill="currentColor"
                        className="origin-center"
                    />
                ))}
            </svg>

        </button >
    );
};
