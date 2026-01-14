import React from 'react';
import { Sparkles, Zap, Brain, Image as ImageIcon } from 'lucide-react';
import { AIModel } from '../types/settings';

interface ModelSelectorProps {
    selected: AIModel;
    onChange: (model: AIModel) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selected, onChange }) => {
    const models: { id: AIModel; label: string; description: string; icon: React.ReactNode; color: string }[] = [
        {
            id: 'gemini-2.5-flash',
            label: 'Gemini 2.5 Flash',
            description: 'Fastest generation, great for iteration',
            icon: <Zap size={16} />,
            color: 'text-yellow-400'
        },
        {
            id: 'gemini-1.5-pro',
            label: 'Gemini 1.5 Pro',
            description: 'High reasoning, better complex prompts',
            icon: <Brain size={16} />,
            color: 'text-blue-400'
        },
        {
            id: 'imagen-3',
            label: 'Imagen 3',
            description: 'Photorealistic, best for artistic styles',
            icon: <ImageIcon size={16} />,
            color: 'text-purple-400'
        }
    ];

    return (
        <div className="space-y-3">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={12} className="text-indigo-400" />
                AI Model
            </label>

            <div className="relative">
                <button
                    className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group"
                    onClick={() => {
                        // This could toggle a dropdown, but for now we'll just cycle or show a list
                        // For this implementation, let's render the list directly below instead of a dropdown button
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white/5 ${models.find(m => m.id === selected)?.color}`}>
                            {models.find(m => m.id === selected)?.icon}
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-white">
                                {models.find(m => m.id === selected)?.label}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                                {models.find(m => m.id === selected)?.description}
                            </div>
                        </div>
                    </div>
                </button>

                <div className="mt-2 space-y-1">
                    {models.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => onChange(model.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${selected === model.id
                                ? 'bg-indigo-600/10 border border-indigo-600/20'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className={`p-1.5 rounded-md ${selected === model.id ? 'bg-indigo-600/20' : 'bg-white/5'} ${model.color}`}>
                                {model.icon}
                            </div>
                            <div className="text-left flex-1">
                                <div className={`text-xs font-medium ${selected === model.id ? 'text-indigo-300' : 'text-zinc-300'}`}>
                                    {model.label}
                                </div>
                            </div>
                            {selected === model.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModelSelector;
