import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { PromptEnhance } from '../types/settings';

interface PromptEnhanceDropdownProps {
    selected: PromptEnhance;
    onChange: (value: PromptEnhance) => void;
}

const PromptEnhanceDropdown: React.FC<PromptEnhanceDropdownProps> = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const options: PromptEnhance[] = ['Auto', 'Manual', 'Off'];

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
                <Sparkles size={12} className="text-yellow-500" />
                Prompt Enhance
            </label>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all text-sm"
                >
                    <span className="text-zinc-200 font-medium">{selected}</span>
                    <ChevronDown size={16} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#18181b] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
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
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptEnhanceDropdown;
