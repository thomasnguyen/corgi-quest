# AI Recommendations Daily Cache Implementation

## Summary
Updated AI recommendations to be cached for the entire day, preventing multiple API calls to OpenAI.

## Changes Made

### 1. Component Behavior (`src/components/quests/AIRecommendations.tsx`)

**Before:**
- Automatically generated recommendations on first load if no cache existed
- Would call OpenAI API every time the component mounted without cache

**After:**
- Only loads cached recommendations automatically
- Requires explicit user action (clicking refresh button) to generate new recommendations
- Recommendations are cached for the entire day (until midnight)

### 2. User Experience Improvements

**Empty State:**
- Added clear call-to-action button to generate recommendations
- Updated messaging to explain that user needs to click refresh
- Shows "Generate Recommendations" button in empty state

**Cache Indicator:**
- Shows "Generated: X time ago • Cached for today" timestamp
- Updated description to mention daily caching
- Makes it clear recommendations won't change until next day or manual refresh

### 3. Caching Behavior

**How it works:**
1. Recommendations are generated when user clicks refresh button
2. Results are cached in `ai_recommendations` table with today's date
3. Cache persists for entire day (YYYY-MM-DD format)
4. Next day, cache is automatically stale and new recommendations can be generated
5. User can manually refresh at any time to regenerate

**Database:**
- Uses existing `ai_recommendations` table
- Indexed by `dogId` and `date` for fast lookups
- Stores recommendations as JSON string

### 4. API Call Prevention

**Before:** Could call OpenAI API multiple times per day
**After:** Only calls OpenAI API when:
- User explicitly clicks refresh button
- No cache exists for today AND user clicks generate

This prevents unnecessary API costs and rate limiting issues.

## Testing

To test the caching:
1. Go to Quests tab → AI Recommendations
2. Click "Generate Recommendations" (first time)
3. Recommendations are displayed and cached
4. Navigate away and come back - recommendations load instantly from cache
5. Click refresh button - new recommendations are generated and cached
6. Wait until next day - cache is stale, can generate fresh recommendations

## Benefits

✅ Prevents multiple OpenAI API calls per day
✅ Reduces API costs
✅ Avoids rate limiting issues
✅ Faster load times (cached data loads instantly)
✅ Clear user experience with explicit refresh action
✅ Automatic daily refresh (cache expires at midnight)
