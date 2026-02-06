import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApparelProduct } from '@/lib/apparelProducts';
import { FittingRoomSnapshot, DecalState } from '@/types/fittingRoomProgress';

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

    // 3D Mode State
    viewMode: '2d' | '3d';
    setViewMode: (mode: '2d' | '3d') => void;
    selected3DModelPath: string | null;
    set3DModel: (path: string | null) => void;
    shirtColor: string;
    setShirtColor: (color: string) => void;
    // 3D placement state (persisted here for snapshots)
    decalState: DecalState | undefined;
    setDecalState: (state: DecalState) => void;

    // Snapshot / Resume Navigation
    shouldOpenFromProgress: boolean;
    setShouldOpenFromProgress: (val: boolean) => void;
    getSnapshot: () => FittingRoomSnapshot;
    loadSnapshot: (snapshot: FittingRoomSnapshot) => void;
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

            // 3D Mode State
            viewMode: '2d',
            setViewMode: (mode) => set({ viewMode: mode }),
            selected3DModelPath: '/Apparel Media/Shirt 3D Models/basic_t-shirt.glb',
            set3DModel: (path) => set({ selected3DModelPath: path }),
            shirtColor: '#ffffff',
            setShirtColor: (color) => set({ shirtColor: color }),

            decalState: undefined,
            setDecalState: (state) => set({ decalState: state }),

            // Snapshot Implementation
            shouldOpenFromProgress: false,
            setShouldOpenFromProgress: (val) => set({ shouldOpenFromProgress: val }),

            getSnapshot: () => {
                const state = get();
                return {
                    version: 1,
                    closet: {
                        selectedShirts: state.selectedShirts.map(s => ({
                            id: s.id,
                            apparelProductId: s.apparelProductId
                        })),
                        activeShirtId: state.activeShirtId,
                        closetMode: 'all'
                    },
                    artWall: {
                        designs: state.designs,
                        activeDesignId: state.activeDesignId
                    },
                    mirror: {
                        viewMode: state.viewMode,
                        selected3DModelPath: state.selected3DModelPath,
                        shirtColor: state.shirtColor,
                        decalState: state.decalState
                    },
                    meta: {
                        savedFromView: 'myworks',
                        savedAt: new Date().toISOString()
                    }
                };
            },

            loadSnapshot: (snapshot: FittingRoomSnapshot) => {
                // Look up full product objects from registry
                const { apparelProducts } = require('@/lib/apparelProducts');
                const restoredShirts = snapshot.closet.selectedShirts
                    .map(s => apparelProducts.find((p: any) => p.id === s.id))
                    .filter(Boolean);

                set({
                    selectedShirts: restoredShirts,
                    activeShirtId: snapshot.closet.activeShirtId,
                    designs: snapshot.artWall.designs.map(d => ({
                        ...d,
                        thumbnail: d.thumbnail || '/assets/design-fallback.png',
                        fullImage: d.fullImage || '/assets/design-fallback.png',
                    })),
                    activeDesignId: snapshot.artWall.activeDesignId,
                    viewMode: snapshot.mirror.viewMode,
                    selected3DModelPath: snapshot.mirror.selected3DModelPath,
                    shirtColor: snapshot.mirror.shirtColor,
                    decalState: snapshot.mirror.decalState,
                    shouldOpenFromProgress: true
                });
            },
        }),
        {
            name: 'fitting-room-storage', // localStorage key
            partialize: (state) => ({
                // Only persist selections, not modal state
                selectedShirts: state.selectedShirts,
                activeShirtId: state.activeShirtId,
                designs: state.designs,
                activeDesignId: state.activeDesignId,
                closetMode: state.closetMode,
                // 3D Mode persistence
                viewMode: state.viewMode,
                selected3DModelPath: state.selected3DModelPath,
                shirtColor: state.shirtColor,
            }),
        }
    )
);

// We need to patch the store to include the navigation methods since they were added to the interface but not the initial state above
// Actually, I should just fix the create call above.
// Re-writing the end of the create function to include new properties.
