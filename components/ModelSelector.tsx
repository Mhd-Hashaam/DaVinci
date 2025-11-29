import React, { useState, useRef, useEffect } from 'react';
import { Cpu, ChevronDown } from 'lucide-react';
import { AIModel } from '../types/settings';

interface ModelSelectorProps {
    selected: AIModel;
    onChange: (value: AIModel) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const options: AIModel[] = ['Gemini 2.5 Flash', 'Gemini 1.5 Pro', 'Imagen 3'];

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
                <Cpu size={12} className="text-blue-500" />
                Model
            </label>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all text-sm group"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        <span className="text-zinc-200 font-medium">{selected}</span>
                    </div>
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
                                    w-full px-3 py-2.5 text-left text-sm transition-colors flex items-center gap-2
                                    ${selected === option
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-zinc-300 hover:bg-white/10'
                                    }
                                `}
                            >
                                {selected === option && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                )}
                                {selected !== option && <div className="w-2 h-2"></div>}
                                <span>{option}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelSelector;
