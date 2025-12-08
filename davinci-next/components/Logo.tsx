import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M16 2L3.5 9.2V22.8L16 30L28.5 22.8V9.2L16 2Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-zinc-700"
            />
            <path
                d="M16 8L9 12V20L16 24L23 20V12L16 8Z"
                fill="url(#logo-gradient)"
            />
            <defs>
                <linearGradient id="logo-gradient" x1="9" y1="8" x2="23" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export default Logo;
