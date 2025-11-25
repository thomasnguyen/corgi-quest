# Design Document

## Overview

The Weekly Summary Modal is a full-screen overlay component that displays aggregated training data from the past 7 days. It automatically appears on Sunday evenings (after 6 PM) or Monday mornings (before 10 AM) and can be manually triggered via a button. The modal uses Convex real-time subscriptions to display current data and updates live if activities are logged while viewing.

The design follows Corgi Quest's black/white minimalist wireframe aesthetic and mobile-first approach, ensuring the summary is easy to scan and celebrate progress.

## Architecture

### Component Hierarchy

```
Layout.tsx (or Overview page)
└── useWeeklySummary hook
    └── WeeklySummaryModal
        ├── Header (date range + close button)
        ├── WeeklyStats section
        ├── StreakHighlights section
        ├── ActivityBreakdown section
        ├── StatProgress section
        ├── MoodInsights section (conditional)
        ├── PartnerContribution section (conditional)
        ├── FirecrawlTips section
        └── Footer (Got it button)
```

### Data Flow

```
1. User opens app → Layout.tsx checks useWeeklySummary hook
2. Hook determines if modal should show (time window + dismissal state)
3. If yes → Render WeeklySummaryModal with dogId
4. Modal subscribes to getWeeklySummary query (Convex)
5. Query aggregates data from multiple tables
6. Modal renders sections based on data
7. User dismisses → Call dismissWeeklySummary mutation
8. Mutation stores dismissal in localStorage (client-side)
9. Next week → Reset dismissal flag
```

### State Management

- **Server State**: Managed by Convex queries (real-time subscriptions)
- **Client State**: Dismissal state stored in localStorage
- **Component State**: Loading, error states managed locally in modal

## Components and Interfaces

### 1. WeeklySummaryModal Component

**File**: `src/components/summary/WeeklySummaryModal.tsx`

**Props Interface**:
```typescript
interface WeeklySummaryModalProps {
  dogId: Id<"dogs">;
  isOpen: boolean;
  onClose: () => void;
}
```

**Component Structure**:
```tsx
export default function WeeklySummaryModal({
  dogId,
  isOpen,
  onClose,
}: WeeklySummaryModalProps) {
  // Calculate week date range (Monday-Sunday)
  const { weekStartDate, weekEndDate } = getWeekDateRange();
  
  // Subscribe to weekly summary data
  const summaryData = useQuery(api.queries.getWeeklySummary, {
    dogId,
    weekStartDate,
    weekEndDate,
  });
  
  // Handle dismissal
  const handleDismiss = () => {
    // Store dismissal in localStorage
    const dismissalKey = `weeklySummaryDismissed_${weekEndDate}`;
    localStorage.setItem(dismissalKey, Date.now().toString());
    onClose();
  };
  
  // Loading state
  if (!summaryData) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (summaryData.error) {
    return <ErrorMessage />;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#1a1a1f] border-2 border-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <Header weekStartDate={weekStartDate} weekEndDate={weekEndDate} onClose={handleDismiss} />
        
        {/* Content sections */}
        <div className="p-4 space-y-4">
          <WeeklyStats data={summaryData} />
          <StreakHighlights data={summaryData} />
          <ActivityBreakdown data={summaryData} />
          <StatProgress data={summaryData} />
          {summaryData.moodInsights && <MoodInsights data={summaryData.moodInsights} />}
          {summaryData.partnerContribution && <PartnerContribution data={summaryData.partnerContribution} />}
          {summaryData.firecrawlTips.length > 0 && <FirecrawlTips tips={summaryData.firecrawlTips} />}
        </div>
        
        {/* Footer */}
        <Footer onDismiss={handleDismiss} />
      </div>
    </div>
  );
}
```

### 2. useWeeklySummary Hook

**File**: `src/hooks/useWeeklySummary.ts`

**Purpose**: Determines when to show the weekly summary modal

**Interface**:
```typescript
interface UseWeeklySummaryReturn {
  shouldShowModal: boolean;
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
}

export function useWeeklySummary(dogId: Id<"dogs"> | undefined): UseWeeklySummaryReturn
```

**Logic**:
```typescript
export function useWeeklySummary(dogId: Id<"dogs"> | undefined) {
  const [shouldShowModal, setShouldShowModal] = useState(false);
  
  useEffect(() => {
    if (!dogId) {
      setShouldShowModal(false);
      return;
    }
    
    // Get current date/time
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
    const currentHour = now.getHours();
    
    // Check if we're in the time window
    const isSundayEvening = dayOfWeek === 0 && currentHour >= 18;
    const isMondayMorning = dayOfWeek === 1 && currentHour < 10;
    const isInTimeWindow = isSundayEvening || isMondayMorning;
    
    if (!isInTimeWindow) {
      setShouldShowModal(false);
      return;
    }
    
    // Calculate week end date (most recent Sunday)
    const weekEndDate = getLastSunday();
    
    // Check localStorage for dismissal
    const dismissalKey = `weeklySummaryDismissed_${weekEndDate}`;
    const dismissedAt = localStorage.getItem(dismissalKey);
    
    if (dismissedAt) {
      setShouldShowModal(false);
      return;
    }
    
    // All conditions met: show modal
    setShouldShowModal(true);
  }, [dogId]);
  
  const { weekStartDate, weekEndDate } = getWeekDateRange();
  
  return {
    shouldShowModal,
    weekStartDate,
    weekEndDate,
  };
}
```

### 3. Helper Functions

**File**: `src/lib/dateUtils.ts`

```typescript
/**
 * Get the date range for the most recent complete week (Monday-Sunday)
 */
export function getWeekDateRange(): { weekStartDate: string; weekEndDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate last Sunday
  const daysToLastSunday = dayOfWeek === 0 ? 0 : dayOfWeek;
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - daysToLastSunday);
  lastSunday.setHours(0, 0, 0, 0);
  
  // Calculate Monday of that week
  const monday = new Date(lastSunday);
  monday.setDate(lastSunday.getDate() - 6);
  
  return {
    weekStartDate: monday.toISOString().split('T')[0],
    weekEndDate: lastSunday.toISOString().split('T')[0],
  };
}

/**
 * Format date range for display
 */
export function formatWeekRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
}
```

## Data Models

### WeeklySummary Interface

```typescript
interface WeeklySummary {
  // Date range
  weekStartDate: string; // YYYY-MM-DD
  weekEndDate: string; // YYYY-MM-DD
  
  // Weekly stats
  totalActivities: number;
  totalXpGained: number;
  levelsGained: {
    overall: number;
    stats: {
      INT: number;
      PHY: number;
      IMP: number;
      SOC: number;
    };
  };
  daysGoalsMet: number; // Out of 7
  
  // Streak info
  currentStreak: number;
  longestStreak: number;
  
  // Activity breakdown
  topActivity: {
    name: string;
    count: number;
  } | null;
  activityVariety: number; // Unique activity types
  totalActivityTime: number; // Minutes
  
  // Stat progress
  highestStat: {
    type: "INT" | "PHY" | "IMP" | "SOC";
    level: number;
  } | null;
  mostImprovedStat: {
    type: "INT" | "PHY" | "IMP" | "SOC";
    xpGained: number;
  } | null;
  
  // Mood insights (optional)
  moodInsights?: {
    mostCommon: MoodType;
    trend: "improving" | "stable" | "needs_attention";
    totalMoods: number;
  };
  
  // Partner contribution (optional)
  partnerContribution?: {
    currentUserActivities: number;
    partnerActivities: number;
    partnerName: string;
  };
  
  // Firecrawl tips
  firecrawlTips: Array<{
    title: string;
    description: string;
  }>;
}

type MoodType = "calm" | "anxious" | "reactive" | "playful" | "tired" | "neutral";
```

### Convex Query Return Type

The `getWeeklySummary` query returns the `WeeklySummary` interface directly.

## Backend Implementation

### Query: getWeeklySummary

**File**: `convex/queries.ts`

**Implementation Strategy**:

```typescript
export const getWeeklySummary = query({
  args: {
    dogId: v.id("dogs"),
    weekStartDate: v.string(), // YYYY-MM-DD
    weekEndDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    // Convert dates to timestamps
    const startTime = new Date(args.weekStartDate).getTime();
    const endTime = new Date(args.weekEndDate).getTime() + 24 * 60 * 60 * 1000; // End of Sunday
    
    // 1. Get all activities for the week
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startTime),
          q.lt(q.field("createdAt"), endTime)
        )
      )
      .collect();
    
    // 2. Calculate total XP gained
    const activityIds = activities.map(a => a._id);
    const allStatGains = await Promise.all(
      activityIds.map(activityId =>
        ctx.db
          .query("activity_stat_gains")
          .withIndex("by_activity", (q) => q.eq("activityId", activityId))
          .collect()
      )
    );
    
    const totalXpGained = allStatGains.flat().reduce((sum, sg) => sum + sg.xpAmount, 0);
    
    // 3. Get current stats and calculate levels gained
    const currentStats = await ctx.db
      .query("dog_stats")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .collect();
    
    // Calculate XP gained per stat this week
    const statXpMap = new Map<string, number>();
    allStatGains.flat().forEach(sg => {
      const current = statXpMap.get(sg.statType) || 0;
      statXpMap.set(sg.statType, current + sg.xpAmount);
    });
    
    // Estimate levels gained (100 XP per level)
    const levelsGained = {
      overall: Math.floor(totalXpGained / 100),
      stats: {
        INT: Math.floor((statXpMap.get("INT") || 0) / 100),
        PHY: Math.floor((statXpMap.get("PHY") || 0) / 100),
        IMP: Math.floor((statXpMap.get("IMP") || 0) / 100),
        SOC: Math.floor((statXpMap.get("SOC") || 0) / 100),
      },
    };
    
    // 4. Get daily goals for the week
    const weekDates = getWeekDates(args.weekStartDate, args.weekEndDate);
    const dailyGoals = await Promise.all(
      weekDates.map(date =>
        ctx.db
          .query("daily_goals")
          .withIndex("by_dog_and_date", (q) =>
            q.eq("dogId", args.dogId).eq("date", date)
          )
          .first()
      )
    );
    
    const daysGoalsMet = dailyGoals.filter(dg =>
      dg && dg.physicalPoints >= dg.physicalGoal && dg.mentalPoints >= dg.mentalGoal
    ).length;
    
    // 5. Get streak info
    const streak = await ctx.db
      .query("streaks")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .first();
    
    // 6. Calculate activity breakdown
    const activityCounts = new Map<string, number>();
    let totalActivityTime = 0;
    
    activities.forEach(activity => {
      const count = activityCounts.get(activity.activityName) || 0;
      activityCounts.set(activity.activityName, count + 1);
      totalActivityTime += activity.durationMinutes || 0;
    });
    
    const topActivity = activityCounts.size > 0
      ? Array.from(activityCounts.entries())
          .sort((a, b) => b[1] - a[1])[0]
      : null;
    
    // 7. Calculate stat progress
    const highestStat = currentStats.length > 0
      ? currentStats.reduce((max, stat) => stat.level > max.level ? stat : max)
      : null;
    
    const mostImprovedStat = Array.from(statXpMap.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    // 8. Get mood insights (if applicable)
    const moodLogs = await ctx.db
      .query("mood_logs")
      .withIndex("by_dog_and_created", (q) => q.eq("dogId", args.dogId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startTime),
          q.lt(q.field("createdAt"), endTime)
        )
      )
      .collect();
    
    let moodInsights = undefined;
    if (moodLogs.length >= 3) {
      const moodCounts = new Map<string, number>();
      moodLogs.forEach(ml => {
        const count = moodCounts.get(ml.mood) || 0;
        moodCounts.set(ml.mood, count + 1);
      });
      
      const mostCommon = Array.from(moodCounts.entries())
        .sort((a, b) => b[1] - a[1])[0][0] as MoodType;
      
      // Simple trend calculation (compare first half to second half)
      const midpoint = Math.floor(moodLogs.length / 2);
      const firstHalf = moodLogs.slice(0, midpoint);
      const secondHalf = moodLogs.slice(midpoint);
      
      const positiveMoods = ["calm", "playful"];
      const firstHalfPositive = firstHalf.filter(ml => positiveMoods.includes(ml.mood)).length;
      const secondHalfPositive = secondHalf.filter(ml => positiveMoods.includes(ml.mood)).length;
      
      let trend: "improving" | "stable" | "needs_attention";
      if (secondHalfPositive > firstHalfPositive) {
        trend = "improving";
      } else if (secondHalfPositive < firstHalfPositive) {
        trend = "needs_attention";
      } else {
        trend = "stable";
      }
      
      moodInsights = {
        mostCommon,
        trend,
        totalMoods: moodLogs.length,
      };
    }
    
    // 9. Get partner contribution (if applicable)
    const dog = await ctx.db.get(args.dogId);
    let partnerContribution = undefined;
    
    if (dog) {
      const household = await ctx.db.get(dog.householdId);
      if (household) {
        const users = await ctx.db
          .query("users")
          .withIndex("by_household", (q) => q.eq("householdId", household._id))
          .collect();
        
        if (users.length >= 2) {
          const userActivityCounts = new Map<string, number>();
          activities.forEach(activity => {
            const count = userActivityCounts.get(activity.userId) || 0;
            userActivityCounts.set(activity.userId, count + 1);
          });
          
          // Assume first user is current user (in real app, pass userId)
          const currentUser = users[0];
          const partner = users[1];
          
          partnerContribution = {
            currentUserActivities: userActivityCounts.get(currentUser._id) || 0,
            partnerActivities: userActivityCounts.get(partner._id) || 0,
            partnerName: partner.name,
          };
        }
      }
    }
    
    // 10. Get Firecrawl tips
    const firecrawlCache = await ctx.db
      .query("firecrawl_tips")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .order("desc")
      .first();
    
    let firecrawlTips: Array<{ title: string; description: string }> = [];
    if (firecrawlCache) {
      try {
        const tips = JSON.parse(firecrawlCache.tips);
        firecrawlTips = tips.slice(0, 2); // Take first 2 tips
      } catch (error) {
        console.error("Failed to parse Firecrawl tips:", error);
      }
    }
    
    // Return complete summary
    return {
      weekStartDate: args.weekStartDate,
      weekEndDate: args.weekEndDate,
      totalActivities: activities.length,
      totalXpGained,
      levelsGained,
      daysGoalsMet,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      topActivity: topActivity ? { name: topActivity[0], count: topActivity[1] } : null,
      activityVariety: activityCounts.size,
      totalActivityTime,
      highestStat: highestStat ? { type: highestStat.statType, level: highestStat.level } : null,
      mostImprovedStat: mostImprovedStat ? { type: mostImprovedStat[0] as any, xpGained: mostImprovedStat[1] } : null,
      moodInsights,
      partnerContribution,
      firecrawlTips,
    };
  },
});

// Helper function to generate array of dates for the week
function getWeekDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}
```

## Error Handling

### Loading States

```tsx
// Show loading spinner while data is being fetched
if (!summaryData) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-white text-lg">Loading weekly summary...</div>
    </div>
  );
}
```

### Error States

```tsx
// Show error message if data fetch fails
if (summaryData.error) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#1a1a1f] border-2 border-red-500 rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-red-500 text-xl font-bold mb-4">Error</h2>
        <p className="text-gray-400 mb-4">
          Failed to load weekly summary. Please try again later.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

### Empty States

```tsx
// Show encouraging message when no activities exist
if (summaryData.totalActivities === 0) {
  return (
    <div className="p-4">
      <p className="text-gray-400 text-center mb-4">
        Start logging activities to see your weekly summary!
      </p>
      {summaryData.firecrawlTips.length > 0 && (
        <FirecrawlTips tips={summaryData.firecrawlTips} />
      )}
    </div>
  );
}
```

## Testing Strategy

### Unit Tests

1. **Date Calculation Tests**
   - Test `getWeekDateRange()` returns correct Monday-Sunday range
   - Test edge cases (year boundaries, leap years)
   - Test `formatWeekRange()` formatting

2. **Hook Tests**
   - Test `useWeeklySummary` returns correct `shouldShowModal` value
   - Test time window logic (Sunday evening, Monday morning)
   - Test dismissal state handling

3. **Component Tests**
   - Test modal renders all sections correctly
   - Test conditional sections (mood insights, partner contribution)
   - Test empty states
   - Test loading and error states

### Integration Tests

1. **Query Tests**
   - Test `getWeeklySummary` aggregates data correctly
   - Test with various data scenarios (no activities, partial week, etc.)
   - Test performance with large datasets

2. **Real-time Updates**
   - Test modal updates when activities are logged
   - Test dismissal syncs across devices

### Manual Testing

1. **Time Window Testing**
   - Manually change system time to Sunday 6 PM → verify modal appears
   - Manually change system time to Monday 9 AM → verify modal appears
   - Manually change system time to Tuesday → verify modal doesn't appear

2. **Dismissal Testing**
   - Dismiss modal → verify it doesn't reappear
   - Wait until next week → verify modal reappears

3. **Data Accuracy**
   - Log activities throughout the week
   - Verify all metrics are calculated correctly
   - Verify real-time updates work

## UI Styling

### Color Palette

- Background: `#1a1a1f` (dark gray)
- Border: `white` (2px solid)
- Text Primary: `white`
- Text Secondary: `#9ca3af` (gray-400)
- Accent: `#f5c35f` (gold, for special highlights)

### Typography

- Headers: `text-xl font-bold`
- Subheaders: `text-lg font-semibold`
- Body: `text-base`
- Small text: `text-sm`

### Spacing

- Section padding: `p-4`
- Section gap: `space-y-4`
- List item gap: `space-y-2`
- Inline gap: `gap-2`

### Layout

```css
/* Modal container */
.modal-container {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 1rem;
}

/* Modal content */
.modal-content {
  background-color: #1a1a1f;
  border: 2px solid white;
  border-radius: 0.5rem;
  max-width: 28rem; /* max-w-md */
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

/* Section divider */
.section-divider {
  border-top: 1px solid #374151; /* gray-700 */
  margin: 1rem 0;
}
```

### Accessibility

- Focus trap: Use `react-focus-lock` or similar
- Keyboard navigation: ESC key closes modal
- ARIA labels: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`
- Screen reader announcements: Use `aria-live="polite"` for dynamic content

## Performance Considerations

### Query Optimization

1. **Use Indexes**: All queries use existing indexes (`by_dog_and_created`, `by_dog_and_date`, `by_dog`)
2. **Batch Fetching**: Use `Promise.all` to fetch related data in parallel
3. **Limit Data**: Only fetch data for the specific week (7 days)
4. **Cache Results**: Convex automatically caches query results

### Component Optimization

1. **Lazy Loading**: Only render modal when `isOpen` is true
2. **Memoization**: Use `useMemo` for expensive calculations
3. **Conditional Rendering**: Only render sections that have data

### Real-time Updates

- Convex subscriptions automatically update when data changes
- No polling or manual refetching required
- Updates are efficient (only changed data is sent)

## Integration Points

### Layout.tsx Integration

```tsx
// In Layout.tsx or Overview page
import { useWeeklySummary } from "@/hooks/useWeeklySummary";
import WeeklySummaryModal from "@/components/summary/WeeklySummaryModal";

export default function Layout() {
  const dogId = useSelectedCharacter();
  const { shouldShowModal, weekStartDate, weekEndDate } = useWeeklySummary(dogId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    if (shouldShowModal) {
      setIsModalOpen(true);
    }
  }, [shouldShowModal]);
  
  return (
    <>
      {/* Existing layout content */}
      
      {/* Weekly Summary Modal */}
      {isModalOpen && dogId && (
        <WeeklySummaryModal
          dogId={dogId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
```

### Manual Trigger Button

```tsx
// In Overview or Activity page
<button
  onClick={() => setIsModalOpen(true)}
  className="text-sm text-gray-400 hover:text-white transition-colors"
>
  View Weekly Summary
</button>
```

### Query Parameter Testing

For development and testing purposes, the modal can be triggered via a query parameter:

```tsx
// In Layout.tsx or Overview page
import { useSearchParams } from "@tanstack/react-router";

export default function Layout() {
  const searchParams = useSearchParams();
  const showWeeklySummary = searchParams.get("showWeeklySummary") === "true";
  
  useEffect(() => {
    if (showWeeklySummary) {
      setIsModalOpen(true);
    }
  }, [showWeeklySummary]);
  
  // ... rest of component
}
```

**Usage**: Navigate to `/?showWeeklySummary=true` to trigger the modal for testing.

## Future Enhancements

1. **Weekly Comparison**: Compare this week to last week with trend indicators
2. **Achievement Badges**: Unlock badges for milestones (e.g., "7-day streak!")
3. **Share Functionality**: Share weekly summary with partner or social media
4. **Export PDF**: Download weekly summary as PDF
5. **Custom Date Ranges**: Allow users to view summary for custom date ranges
6. **Weekly Goals**: Set weekly goals and track progress
7. **Animations**: Add smooth transitions and animations for better UX
8. **Push Notifications**: Send push notification when weekly summary is ready
