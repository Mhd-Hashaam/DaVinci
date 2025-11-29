import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings2, Image as ImageIcon, X, ChevronDown, Ratio } from 'lucide-react';
import { AspectRatio } from '../types';
import { ASPECT_RATIOS } from '../constants';

interface PromptBarProps {
  onGenerate: (prompt: string, aspectRatio: AspectRatio) => void;
  isGenerating: boolean;
}

const PromptBar: React.FC<PromptBarProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt, selectedRatio);
      setPrompt('');
      setShowSettings(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px';
    }
  }, [prompt]);

  // Click outside to close settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full relative z-30" ref={containerRef} data-tutorial-target="prompt-bar">

      {/* Main Input Bar */}
      <div
        className={`
            relative bg-[#18181b] border border-white/10 rounded-2xl shadow-lg
            transition-all duration-300 ring-1 ring-white/5 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50
            flex flex-col group overflow-visible z-20
          `}
      >
        <div className="flex items-start p-2 gap-2">

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`
                w-10 h-10 mt-0.5 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 border border-transparent
                ${showSettings ? 'bg-white text-black border-white/10' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white hover:border-white/5'}
              `}
            title="Generation Settings"
          >
            <Settings2 size={18} />
          </button>

          {/* Text Input */}
          <div className="flex-1 py-2">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isGenerating ? "Dreaming..." : "Describe your imagination..."}
              disabled={isGenerating}
              className="w-full bg-transparent text-white placeholder-zinc-500 resize-none outline-none text-base leading-relaxed scrollbar-hide min-h-[24px]"
              rows={1}
              style={{ maxHeight: '200px' }}
            />
          </div>

          {/* Action Buttons Right */}
          <div className="flex items-center gap-2 mt-0.5">
            {/* Image Upload (Mock) */}
            <button className="p-2.5 text-zinc-500 hover:text-white transition-colors rounded-xl hover:bg-white/5" title="Upload Reference Image">
              <ImageIcon size={20} />
            </button>

            {/* Send Button */}
            <button
              onClick={() => handleSubmit()}
              disabled={!prompt.trim() || isGenerating}
              className={`
                    h-10 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 font-medium
                    ${prompt.trim() && !isGenerating
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                }
                `}
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">Generate</span>
                  <Send size={16} className={prompt.trim() ? "fill-current" : ""} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Settings Indicator inside bar */}
        {!showSettings && selectedRatio !== '1:1' && (
          <div className="absolute top-2 right-36 pointer-events-none">
            <span className="bg-white/10 text-[10px] font-mono text-zinc-300 px-2 py-0.5 rounded-md border border-white/5">
              {selectedRatio}
            </span>
          </div>
        )}
      </div>

      {/* Dropdown Toolbar - Slides DOWN */}
      <div
        className={`
                absolute top-full left-0 right-0 mt-2
                bg-[#18181b] border border-white/10 rounded-xl p-4 shadow-2xl z-10
                transition-all duration-200 ease-out origin-top
                ${showSettings ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}
            `}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Ratio size={12} /> Aspect Ratio
            </span>
            <span className="text-xs text-zinc-500 font-mono">{selectedRatio}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => setSelectedRatio(ratio.value)}
                className={`
                            px-4 py-2.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 shrink-0
                            ${selectedRatio === ratio.value
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-white/5 text-zinc-400 border-transparent hover:bg-white/10 hover:text-white'
                  }
                        `}
              >
                <span className="opacity-90">{ratio.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptBar;