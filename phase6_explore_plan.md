# Phase 6: Explore Section Implementation Plan

## Goal
Create a visually stunning "Explore" page that showcases community-generated images in a masonry grid layout, similar to Pinterest or Midjourney's showcase. This section will inspire users and demonstrate the capabilities of the AI models.

## User Review Required
- **Masonry Layout Library**: I plan to use a custom CSS column-based approach or a lightweight library like `react-masonry-css` if needed. For now, CSS columns are preferred for performance and simplicity.
- **Infinite Scroll**: Will simulate infinite scroll for now using mock data, as we don't have a real backend with pagination yet.

## Proposed Changes

### 1. New Components
#### [NEW] `components/ExploreGrid.tsx`
- **Purpose**: Displays images in a masonry layout.
- **Features**:
  - Responsive column count (1 on mobile, 2 on tablet, 3-4 on desktop, 5 on wide screens).
  - Image cards with hover effects (like/bookmark, author info, prompt preview).
  - "Load More" trigger for infinite scroll.

#### [NEW] `components/ExploreFilters.tsx`
- **Purpose**: Filter bar for the Explore section.
- **Options**:
  - Tabs: Trending, Recent, Top, Following.
  - Timeframe: Today, This Week, All Time.
  - Model: Filter by specific AI model.

### 2. Updates to Existing Components
#### [MODIFY] `App.tsx`
- Integrate `ExploreGrid` and `ExploreFilters` when `activeTab === 'explore'`.
- Manage `exploreImages` state separately from user's `images`.
- Implement mock data fetching for infinite scroll.

#### [MODIFY] `types/index.ts`
- Extend `GeneratedImage` or create `ExploreImage` type to include:
  - `author`: { name, avatar }
  - `likes`: number
  - `views`: number

### 3. Mock Data
#### [MODIFY] `constants.ts`
- Add a large set of diverse mock images for the Explore section to demonstrate the grid effectively.

## Verification Plan
### Automated Tests
- None for this UI-heavy phase.

### Manual Verification
1. **Layout**: Verify masonry layout works correctly on different screen sizes (resize window).
2. **Interactions**: Test hover effects on images (like button, overlay).
3. **Filtering**: Click different filter tabs and verify content updates (simulated).
4. **Infinite Scroll**: Scroll to bottom and verify more images load.
5. **Performance**: Ensure smooth scrolling with many images.
