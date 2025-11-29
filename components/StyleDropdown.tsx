import React, { useState, useRef, useEffect } from 'react';
import { FlaskConical, ChevronDown, Zap, Film, Camera, Paintbrush, Box, Sparkles } from 'lucide-react';
import { StylePreset } from '../types/settings';

interface StyleDropdownProps {
    selected: StylePreset;
    onChange: (value: StylePreset) => void;
}

const StyleDropdown: React.FC<StyleDropdownProps> = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const options: StylePreset[] = ['Dynamic', 'Cinematic', 'Photography', 'Illustration', '3D Render', 'Anime'];

    const styleIcons: Record<StylePreset, React.ElementType> = {
        'Dynamic': Zap,
        'Cinematic': Film,
        'Photography': Camera,
        'Illustration': Paintbrush,
        '3D Render': Box,
        'Anime': Sparkles
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-2" ref={dropdownRef}>
            <label className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                <FlaskConical size={12} className="text-pink-500" />
                Style
            </label>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all text-sm"
                >
                    <span className="text-zinc-200 font-medium flex items-center gap-2">
                        {React.createElement(styleIcons[selected], { size: 16, className: 'text-indigo-400' })}
                        {selected}
                    </span>
                    <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#18181b] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                        {options.map(option => (
                            <button
                                key={option}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full px-3 py-2 text-left text-sm transition-colors
                                    ${selected === option
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-zinc-300 hover:bg-white/10'
                                    }
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    {React.createElement(styleIcons[option], { size: 14 })}
                                    {option}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StyleDropdown;
