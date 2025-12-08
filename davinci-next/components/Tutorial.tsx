import React, { useState, useEffect } from 'react';
import { X, ArrowDown, ArrowRight, MousePointer2, Sparkles, Eye } from 'lucide-react';

interface TutorialProps {
    onClose: () => void;
}

interface TutorialStep {
    id: string;
    title: string;
    description: string;
    targetElement: string; // CSS selector
    position: 'top' | 'bottom' | 'left' | 'right';
    highlightHover?: boolean; // Show hover state on image
    forceShowIcons?: boolean; // Force display hover icons
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to DaVinci AI Studio! 👋',
        description: 'Let me show you around. Click Next to start the guided tour.',
        targetElement: 'body',
        position: 'bottom',
    },
    {
        id: 'prompt-bar',
        title: 'Step 1: Type Your Idea Here 💭',
        description: 'Write what you want to create. Try: "Colorful abstract pattern"',
        targetElement: '[data-tutorial-target="prompt-bar"]',
        position: 'bottom',
    },
    {
        id: 'generate',
        title: 'Step 2: Click Generate ✨',
        description: 'Press this button to create your AI design!',
        targetElement: 'button:has(.fill-current)',
        position: 'left',
    },
    {
        id: 'hover-image',
        title: 'Step 3: Hover Over Any Image 🖱️',
        description: 'Move your mouse over an image to see the action buttons appear!',
        targetElement: '.group:has(img)',
        position: 'right',
        highlightHover: true,
    },
    {
        id: 'bookmark',
        title: 'Bookmark Icon - Save Favorites 🔖',
        description: 'Click this bookmark icon to save designs you love!',
        targetElement: 'button[title="Bookmark"]',
        position: 'right',
        forceShowIcons: true,
    },
    {
        id: 'mockup',
        title: 'Mockup Icon - See on Clothes 👕',
        description: 'Click this pointer icon to preview your design on a t-shirt!',
        targetElement: 'button[title="Select for Mockup"]',
        position: 'right',
        forceShowIcons: true,
    },
    {
        id: 'edit',
        title: 'Edit Icon - Customize Design 🎨',
        description: 'Click this sparkle icon to open the editor and customize your design!',
        targetElement: 'button[title="Edit with AI"]',
        position: 'right',
        forceShowIcons: true,
    },
    {
        id: 'complete',
        title: 'You\'re All Set! 🎉',
        description: 'Now you know how to create, save, and customize designs. Have fun!',
        targetElement: 'body',
        position: 'bottom',
    },
];

const InteractiveTutorial: React.FC<TutorialProps> = ({ onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    useEffect(() => {
        const updatePositions = () => {
            const element = document.querySelector(step.targetElement);
            if (!element) return;

            const rect = element.getBoundingClientRect();
            setHighlightRect(rect);

            // Tooltip dimensions (approximate)
            const tooltipWidth = 384; // max-w-sm = 384px
            const tooltipHeight = 300; // approximate height
            const padding = 20; // spacing from element

            // Calculate initial tooltip position based on step position
            let top = 0, left = 0;

            switch (step.position) {
                case 'bottom':
                    top = rect.bottom + padding;
                    left = rect.left + rect.width / 2;
                    break;
                case 'top':
                    top = rect.top - tooltipHeight - padding;
                    left = rect.left + rect.width / 2;
                    break;
                case 'right':
                    top = rect.top + rect.height / 2;
                    left = rect.right + padding;
                    break;
                case 'left':
                    top = rect.top + rect.height / 2;
                    left = rect.left - tooltipWidth - padding;
                    break;
            }

            // Viewport boundaries
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Adjust horizontal position if needed (for bottom/top positions that are centered)
            if (step.position === 'bottom' || step.position === 'top') {
                // Tooltip is centered, so check both edges
                const tooltipLeft = left - tooltipWidth / 2;
                const tooltipRight = left + tooltipWidth / 2;

                if (tooltipLeft < padding) {
                    // Too far left, align to left edge
                    left = tooltipWidth / 2 + padding;
                } else if (tooltipRight > viewportWidth - padding) {
                    // Too far right, align to right edge
                    left = viewportWidth - tooltipWidth / 2 - padding;
                }
            } else {
                // For left/right positions, tooltip is not centered horizontally
                if (left + tooltipWidth > viewportWidth - padding) {
                    // Goes off right edge, flip to left side
                    left = rect.left - tooltipWidth - padding;
                } else if (left < padding) {
                    // Goes off left edge, flip to right side
                    left = rect.right + padding;
                }
            }

            // Adjust vertical position if needed
            if (step.position === 'left' || step.position === 'right') {
                // Tooltip is vertically centered
                const tooltipTop = top - tooltipHeight / 2;
                const tooltipBottom = top + tooltipHeight / 2;

                if (tooltipTop < padding) {
                    // Too high, align to top
                    top = tooltipHeight / 2 + padding;
                } else if (tooltipBottom > viewportHeight - padding) {
                    // Too low, align to bottom
                    top = viewportHeight - tooltipHeight / 2 - padding;
                }
            } else {
                // For bottom/top positions
                if (top + tooltipHeight > viewportHeight - padding) {
                    // Goes off bottom, flip to top
                    top = rect.top - tooltipHeight - padding;
                } else if (top < padding) {
                    // Goes off top, flip to bottom
                    top = rect.bottom + padding;
                }
            }

            // Final boundary clamp to ensure tooltip is always visible
            top = Math.max(padding, Math.min(top, viewportHeight - tooltipHeight - padding));
            left = Math.max(padding, Math.min(left, viewportWidth - padding));

            setTooltipPosition({ top, left });
        };

        updatePositions();
        window.addEventListener('resize', updatePositions);

        // Force show hover icons when on icon steps
        if (step.forceShowIcons) {
            const iconButton = document.querySelector(step.targetElement);
            if (iconButton) {
                // Find parent image card and force hover state
                const imageCard = iconButton.closest('.group');
                if (imageCard) {
                    // Find the overlay div within this card
                    const overlay = imageCard.querySelector('.absolute.inset-0.bg-gradient-to-t');
                    if (overlay) {
                        overlay.classList.add('!opacity-100');
                    }
                }
            }
        }

        return () => {
            window.removeEventListener('resize', updatePositions);
            // Remove forced opacity from all overlays
            document.querySelectorAll('.absolute.inset-0.bg-gradient-to-t').forEach(el => {
                el.classList.remove('!opacity-100');
            });
        };
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <>
            {/* Dark Overlay with Spotlight */}
            <div
                className={`fixed inset-0 z-[200] pointer-events-none transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            >
                <svg className="absolute inset-0 w-full h-full">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {highlightRect && (
                                <rect
                                    x={highlightRect.x - 8}
                                    y={highlightRect.y - 8}
                                    width={highlightRect.width + 16}
                                    height={highlightRect.height + 16}
                                    rx="16"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.85)"
                        mask="url(#spotlight-mask)"
                    />
                </svg>

                {/* Highlight Border */}
                {highlightRect && step.id !== 'welcome' && step.id !== 'complete' && (
                    <div
                        className="absolute border-4 border-indigo-500 rounded-2xl animate-pulse shadow-2xl shadow-indigo-500/50"
                        style={{
                            top: `${highlightRect.top - 8}px`,
                            left: `${highlightRect.left - 8}px`,
                            width: `${highlightRect.width + 16}px`,
                            height: `${highlightRect.height + 16}px`,
                        }}
                    />
                )}

                {/* Simulated Hover State */}
                {step.highlightHover && highlightRect && (
                    <div
                        className="absolute bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 animate-pulse"
                        style={{
                            top: `${highlightRect.top}px`,
                            left: `${highlightRect.left}px`,
                            width: `${highlightRect.width}px`,
                            height: `${highlightRect.height}px`,
                        }}
                    >
                        <div className="text-white text-sm font-semibold bg-black/50 px-4 py-2 rounded-full">
                            <MousePointer2 size={16} className="inline mr-2" />
                            Hover here!
                        </div>
                    </div>
                )}
            </div>

            {/* Tooltip Card */}
            <div
                className={`fixed z-[201] pointer-events-auto transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                style={{
                    top: `${tooltipPosition.top}px`,
                    left: `${tooltipPosition.left}px`,
                    transform: step.position === 'bottom' || step.position === 'top' ? 'translateX(-50%)' : 'none',
                }}
            >
                <div className="relative bg-gradient-to-br from-purple-950 via-purple-950 to-black rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-purple-900/30">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full text-white flex items-center justify-center transition-all shadow-lg"
                    >
                        <X size={16} />
                    </button>

                    {/* Step counter */}
                    <div className="text-xs font-bold text-white/70 mb-2">
                        Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2">
                        {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 text-sm mb-4 leading-relaxed">
                        {step.description}
                    </p>

                    {/* Progress dots */}
                    <div className="flex gap-1 mb-4">
                        {TUTORIAL_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all ${idx === currentStep
                                    ? 'w-6 bg-white'
                                    : idx < currentStep
                                        ? 'w-1.5 bg-white/50'
                                        : 'w-1.5 bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold transition-all text-sm"
                            >
                                ← Back
                            </button>
                        )}
                        <button
                            onClick={isLastStep ? handleClose : handleNext}
                            className="flex-1 px-4 py-2 bg-white hover:bg-white/90 rounded-xl text-indigo-600 font-bold transition-all text-sm shadow-lg"
                        >
                            {isLastStep ? '✓ Got it!' : 'Next →'}
                        </button>
                    </div>

                    {/* Skip link */}
                    {!isLastStep && (
                        <button
                            onClick={handleClose}
                            className="w-full text-center text-xs text-white/50 hover:text-white/80 mt-2 transition-colors"
                        >
                            Skip tutorial
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default InteractiveTutorial;
