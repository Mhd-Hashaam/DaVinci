import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApparelProduct } from '@/lib/apparelProducts';

// Design item interface for TheArtWall
export interface DesignItem {
    id: string;
    name: string;
    thumbnail: string;  // URL for grid display
    fullImage: string;  // URL for preview (high-res)
    category?: string;  // Optional grouping
}

interface FittingRoomState {
    // Modal
    isOpen: boolean;
    openFittingRoom: () => void;
    closeFittingRoom: () => void;

    // TheCloset - Shirt selection
    selectedShirts: ApparelProduct[];
    addShirt: (product: ApparelProduct) => void;
    removeShirt: (productId: string) => void;
    clearShirts: () => void;
    activeShirtId: string | null;
    setActiveShirt: (id: string | null) => void;
    closetMode: 'stacked' | 'expanded';
    toggleClosetMode: () => void;
    lastRemovedShirt: ApparelProduct | null;
    undoRemoveShirt: () => void;

    // TheArtWall - Design selection
    designs: DesignItem[];
    addDesign: (design: DesignItem) => void;
    removeDesign: (designId: string) => void;
    activeDesignId: string | null;
    setActiveDesign: (id: string | null) => void;
    clearDesigns: () => void;
    lastRemovedDesign: DesignItem | null;
    undoRemoveDesign: () => void;
    // Navigation Triggers
    shouldOpenApparel: boolean;
    triggerApparelView: () => void;
    resetApparelViewRequest: () => void;
    // ArtWall Navigation Triggers
    shouldOpenGallery: boolean;
    shouldOpenCreate: boolean;
    triggerGalleryView: () => void;
    triggerCreateView: () => void;
    resetArtWallNavigation: () => void;
}

export const useFittingRoomStore = create<FittingRoomState>()(
    persist(
        (set, get) => ({
            // Modal state
            isOpen: false,
            openFittingRoom: () => set({ isOpen: true }),
            closeFittingRoom: () => set({ isOpen: false }),

            // TheCloset state
            selectedShirts: [],
            addShirt: (product) => {
                const { selectedShirts } = get();
                // Max 10 shirts validation
                if (selectedShirts.length >= 10) return;
                // Prevent duplicates
                if (selectedShirts.some(s => s.id === product.id)) return;
                set({
                    selectedShirts: [...selectedShirts, product],
                    activeShirtId: product.id // Auto-select newly added
                });
            },
            removeShirt: (productId) => {
                const { selectedShirts, activeShirtId } = get();
                const removedShirt = selectedShirts.find(s => s.id === productId);
                const newShirts = selectedShirts.filter(s => s.id !== productId);
                set({
                    selectedShirts: newShirts,
                    lastRemovedShirt: removedShirt || null,
                    // Clear active if removed
                    activeShirtId: activeShirtId === productId ? null : activeShirtId
                });
            },
            clearShirts: () => set({ selectedShirts: [], activeShirtId: null }),
            activeShirtId: null,
            setActiveShirt: (id) => set({ activeShirtId: id }),
            closetMode: 'stacked',
            toggleClosetMode: () => set((state) => ({
                closetMode: state.closetMode === 'stacked' ? 'expanded' : 'stacked'
            })),
            lastRemovedShirt: null,
            undoRemoveShirt: () => {
                const { lastRemovedShirt, selectedShirts } = get();
                if (lastRemovedShirt && selectedShirts.length < 10) {
                    set({
                        selectedShirts: [...selectedShirts, lastRemovedShirt],
                        lastRemovedShirt: null
                    });
                }
            },

            // TheArtWall state
            designs: [],
            addDesign: (design) => {
                const { designs } = get();
                // Max 10 designs validation
                if (designs.length >= 10) return;
                // Prevent duplicates
                if (designs.some(d => d.id === design.id)) return;
                set({
                    designs: [...designs, design],
                    activeDesignId: design.id // Auto-select newly added
                });
            },
            removeDesign: (designId) => {
                const { designs, activeDesignId } = get();
                const removedDesign = designs.find(d => d.id === designId);
                const newDesigns = designs.filter(d => d.id !== designId);
                set({
                    designs: newDesigns,
                    lastRemovedDesign: removedDesign || null,
                    activeDesignId: activeDesignId === designId ? null : activeDesignId
                });
            },
            activeDesignId: null,
            setActiveDesign: (id) => set({ activeDesignId: id }),
            clearDesigns: () => set({ designs: [], activeDesignId: null }),
            lastRemovedDesign: null,
            undoRemoveDesign: () => {
                const { lastRemovedDesign, designs } = get();
                if (lastRemovedDesign && designs.length < 10) {
                    set({
                        designs: [...designs, lastRemovedDesign],
                        lastRemovedDesign: null
                    });
                }
            },

            // Navigation Triggers
            shouldOpenApparel: false,
            triggerApparelView: () => set({ shouldOpenApparel: true }),
            resetApparelViewRequest: () => set({ shouldOpenApparel: false }),

            // ArtWall Navigation Triggers
            shouldOpenGallery: false,
            shouldOpenCreate: false,
            triggerGalleryView: () => set({ shouldOpenGallery: true }),
            triggerCreateView: () => set({ shouldOpenCreate: true }),
            resetArtWallNavigation: () => set({ shouldOpenGallery: false, shouldOpenCreate: false }),
        }),
        {
            name: 'fitting-room-storage', // localStorage key
            partialize: (state) => ({
                // Only persist selections, not modal state
                selectedShirts: state.selectedShirts,
                activeShirtId: state.activeShirtId,
                // designs: state.designs, // Don't persist designs for now (starts empty)
                activeDesignId: state.activeDesignId,
                closetMode: state.closetMode,
            }),
        }
    )
);

// We need to patch the store to include the navigation methods since they were added to the interface but not the initial state above
// Actually, I should just fix the create call above.
// Re-writing the end of the create function to include new properties.
