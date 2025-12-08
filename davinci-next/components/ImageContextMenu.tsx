import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Copy, Eraser, MessageSquare, Image as ImageIcon, Frame, Repeat, FolderOpen } from 'lucide-react';

interface ImageContextMenuProps {
    isOpen: boolean;
    onClose: () => void;
    buttonRef?: React.RefObject<HTMLButtonElement>;
    onDelete?: () => void;
    onCopyToClipboard?: () => void;
    onRemoveBackground?: () => void;
    onDescribeWithAI?: () => void;
    onUseAsGuidance?: () => void;
    onEditInCanvas?: () => void;
    onIterate?: () => void;
    onOrganize?: () => void;
}

const ImageContextMenu: React.FC<ImageContextMenuProps> = ({
    isOpen,
    onClose,
    buttonRef,
    onDelete,
    onCopyToClipboard,
    onRemoveBackground,
    onDescribeWithAI,
    onUseAsGuidance,
    onEditInCanvas,
    onIterate,
    onOrganize
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [isPositioned, setIsPositioned] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef?.current && !buttonRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, buttonRef]);

    // Calculate position when menu opens or window resizes
    useEffect(() => {
        const calculatePosition = () => {
            if (!isOpen || !buttonRef?.current || !menuRef.current) return;

            const buttonRect = buttonRef.current.getBoundingClientRect();
            const menuWidth = 224; // 56 * 4 (Tailwind w-56)
            const menuHeight = menuRef.current.offsetHeight; // Use actual height from DOM
            const padding = 8;

            // Horizontal positioning (right-aligned by default)
            let left = buttonRect.right - menuWidth;

            // If menu would go off left edge, align to button's left
            if (left < padding) {
                left = buttonRect.left;
            }

            // If still off-screen, clamp to viewport
            if (left + menuWidth > window.innerWidth - padding) {
                left = window.innerWidth - menuWidth - padding;
            }

            // Vertical positioning
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;

            let top: number;

            if (spaceBelow >= menuHeight + padding) {
                // Enough space below - open downward
                top = buttonRect.bottom + padding;
            } else if (spaceAbove >= menuHeight + padding) {
                // Not enough space below but enough above - open upward
                top = buttonRect.top - menuHeight - padding;
            } else if (spaceBelow > spaceAbove) {
                // Not enough space either way, prefer below
                top = buttonRect.bottom + padding;
            } else {
                // Prefer above
                top = Math.max(padding, buttonRect.top - menuHeight - padding);
            }

            setPosition({ top, left });
            // Delay showing to ensure smooth animation
            requestAnimationFrame(() => setIsPositioned(true));
        };

        if (isOpen) {
            setIsPositioned(false);
            // Set initial position offscreen but visible in DOM for measurement
            setPosition({ top: 0, left: 0 });
            // Wait for menu to render, then calculate position
            requestAnimationFrame(() => {
                requestAnimationFrame(calculatePosition);
            });
        }

        // Recalculate on window resize or scroll
        window.addEventListener('resize', calculatePosition);
        window.addEventListener('scroll', calculatePosition, true);

        return () => {
            window.removeEventListener('resize', calculatePosition);
            window.removeEventListener('scroll', calculatePosition, true);
        };
    }, [isOpen, buttonRef]);

    if (!isOpen || !position) return null;

    const menuItems = [
        { icon: Trash2, label: 'Delete image', onClick: onDelete, color: 'text-red-400', premium: true },
        { icon: Copy, label: 'Copy to clipboard', onClick: onCopyToClipboard },
        { icon: Eraser, label: 'Remove Background', onClick: onRemoveBackground },
        { icon: MessageSquare, label: 'Describe with AI', onClick: onDescribeWithAI },
        { icon: ImageIcon, label: 'Use as Image Guidance', onClick: onUseAsGuidance },
        { icon: Frame, label: 'Edit in canvas', onClick: onEditInCanvas },
        { icon: Repeat, label: 'Iterate', onClick: onIterate },
        { icon: FolderOpen, label: 'Organize', onClick: onOrganize }
    ];

    const menuContent = (
        <div
            ref={menuRef}
            className={`fixed w-56 bg-[#18181b] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[100] transition-opacity duration-200 ${isPositioned ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            {menuItems.map((item, index) => (
                <button
                    key={index}
                    onClick={(e) => {
                        e.stopPropagation();
                        item.onClick?.();
                        onClose();
                    }}
                    className={`w-full px-3 py-2.5 text-left text-sm transition-colors flex items-center gap-3 ${item.color || 'text-zinc-300'
                        } hover:bg-white/10 ${index === 0 ? 'border-b border-white/5' : ''}`}
                >
                    <item.icon size={16} />
                    <span className="flex-1">{item.label}</span>
                    {item.premium && (
                        <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-semibold">
                            ◆
                        </span>
                    )}
                </button>
            ))}
        </div>
    );

    return createPortal(menuContent, document.body);
};

export default ImageContextMenu;
