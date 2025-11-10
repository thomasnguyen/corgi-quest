# Mood Reminder Implementation (Task 69)

## Overview
Implemented a daily mood reminder system that prompts users to log Bumi's mood after 6pm if they haven't done so already today.

## Files Created

### 1. `src/hooks/useMoodReminder.ts`
Custom React hook that manages the mood reminder logic:
- Checks if current time is after 6pm (18:00)
- Queries `getTodaysMoods` to check if mood has been logged today
- Manages localStorage for dismissal state
- Supports two dismissal types:
  - **"full"**: Dismisses for the entire day
  - **"remindLater"**: Dismisses for 2 hours, then shows again

**localStorage Keys:**
- `moodReminderDismissed_YYYY-MM-DD`: Stores dismissal timestamp
- `moodReminderRemindLater_YYYY-MM-DD`: Flag indicating "remind later" was clicked

**Logic:**
1. Only shows if time >= 6pm
2. Only shows if no mood logged today
3. Respects dismissal state (full or 2-hour delay)
4. Automatically clears "remind later" flag after 2 hours

### 2. `src/components/mood/MoodReminderPopup.tsx`
Modal popup component that displays the reminder:
- Shows title: "How is Bumi feeling today?"
- Displays helpful description about mood tracking
- Three action buttons:
  - **"Log Mood Now"**: Opens MoodPicker inline
  - **"Remind Me Later (2 hours)"**: Dismisses for 2 hours
  - **"Dismiss for Today"**: Dismisses until tomorrow
- Integrates with existing MoodPicker component
- Handles mood logging mutation directly
- Auto-closes after successful mood log

**Design:**
- Black background with 80% opacity overlay
- White border on card
- Follows app's black/white minimalist aesthetic
- Mobile-responsive with padding

## Files Modified

### 3. `src/components/layout/Layout.tsx`
Integrated mood reminder into main layout:
- Added `useMoodReminder` hook
- Queries first user for userId (needed for mood logging)
- Conditionally renders `MoodReminderPopup` when `shouldShowReminder` is true
- Passes dismissal handler to popup

## How It Works

### User Flow
1. User opens app after 6pm
2. System checks if mood has been logged today
3. If no mood logged and not dismissed:
   - Popup appears with reminder
4. User has 3 options:
   - **Log Mood Now**: Opens mood picker, logs mood, closes popup
   - **Remind Me Later**: Dismisses for 2 hours, will show again
   - **Dismiss**: Dismisses for rest of the day

### Technical Flow
```
Layout mounts
    ↓
useMoodReminder hook runs
    ↓
Check time >= 6pm? → No → Don't show
    ↓ Yes
Query getTodaysMoods
    ↓
Has mood today? → Yes → Don't show
    ↓ No
Check localStorage dismissal
    ↓
Dismissed today? → Yes (full) → Don't show
    ↓ No (or remind later expired)
Show MoodReminderPopup
    ↓
User clicks action
    ↓
Update localStorage + close popup
```

### localStorage Management
- Keys are date-specific (e.g., `moodReminderDismissed_2025-11-10`)
- Automatically resets at midnight (new date = new keys)
- "Remind Later" stores timestamp and checks if 2 hours have passed
- Clean separation between full dismissal and temporary dismissal

## Testing

### Manual Testing Steps
1. **Test after 6pm with no mood logged:**
   - Set system time to after 6pm
   - Ensure no mood logged today
   - Open app → Popup should appear

2. **Test "Log Mood Now":**
   - Click "Log Mood Now"
   - Select mood and confirm
   - Popup should close
   - Mood should appear in feed

3. **Test "Remind Me Later":**
   - Click "Remind Me Later"
   - Popup should close
   - Refresh page → Popup should NOT appear
   - Wait 2 hours (or manipulate localStorage)
   - Refresh page → Popup should appear again

4. **Test "Dismiss for Today":**
   - Click "Dismiss for Today"
   - Popup should close
   - Refresh page → Popup should NOT appear
   - Even after 2 hours, should stay dismissed

5. **Test before 6pm:**
   - Set system time to before 6pm
   - Open app → Popup should NOT appear

6. **Test with mood already logged:**
   - Log a mood
   - Refresh page → Popup should NOT appear

### Edge Cases Handled
- ✅ Popup only shows once per day (unless "remind later")
- ✅ Dismissal state persists across page refreshes
- ✅ Automatically resets at midnight (new date)
- ✅ Handles missing dogId or userId gracefully
- ✅ Handles query loading states
- ✅ Respects 2-hour delay for "remind later"

## Requirements Met
✅ **Requirement 26**: Daily mood reminder after 6pm
- Hook checks if current time is after 6pm
- Queries getTodaysMoods to check if mood logged today
- Shows dismissible popup if conditions met
- Popup shows "How is Bumi feeling today?" with mood options
- Three action buttons: "Log Mood Now", "Remind Me Later" (2hr), "Dismiss" (for day)
- Stores dismissal state in localStorage with date-specific keys
- Only shows once per day (unless "remind later" expires)

## Future Enhancements (Optional)
- Add animation when popup appears
- Add sound notification (optional)
- Allow customizing reminder time (not just 6pm)
- Show reminder on specific days only (e.g., weekdays)
- Track reminder effectiveness (how often users log vs dismiss)