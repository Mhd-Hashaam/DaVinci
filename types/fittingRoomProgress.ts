export interface NormalizedClosetState {
    selectedShirts: Array<{
        id: string; // The specific wardrobe item ID
    }>;
    activeShirtId: string | null;
    closetMode: 'trending' | 'saved' | 'all';
}

export interface NormalizedArtWallState {
    // Designs can be fully embedded or normalized. 
    // Embedding critical fields ensures preview works even if design is later deleted.
    designs: Array<{
        id: string;
        name: string;
        thumbnail: string | null;
        fullImage: string | null;
        category?: string;
    }>;
    activeDesignId: string | null;
}

export interface DecalState {
    pos: [number, number, number];
    scale: number;
    rot: number;
}

export interface NormalizedMirrorState {
    selected3DModelPath: string | null;
    shirtColor: string;
    decalState?: DecalState; // Only relevant in 3D mode
}

export interface FittingRoomSnapshot {
    version: number;
    closet: NormalizedClosetState;
    artWall: NormalizedArtWallState;
    mirror: NormalizedMirrorState;
    meta: {
        savedFromView: 'create' | 'gallery' | 'myworks';
        savedAt: string;
    };
}

export interface FittingRoomProgressRecord {
    id: string;
    user_id: string;
    title: string;
    preview_url: string | null;
    preview_thumbnail_url: string | null;
    state: FittingRoomSnapshot;
    created_at: string;
    updated_at: string;
    app_version: string;
    schema_version: number;
}
