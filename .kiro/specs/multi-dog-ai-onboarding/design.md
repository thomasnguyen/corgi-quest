# Design Document

## Overview

The multi-dog AI onboarding system enables households to manage multiple dogs with seamless context switching and voice-powered onboarding. The design leverages existing Convex real-time infrastructure, Web Speech API for voice input, and OpenAI for natural language parsing. The system maintains a single "active dog" per user session, with all app data (stats, quests, activity feed) updating in real-time when the active dog changes.

The onboarding flow is optimized for mobile demo scenarios: tap dog chip → tap add dog → speak one sentence → see new dog become active. Total interaction time: 4-7 seconds.

## Architecture

### Component Hierarchy

```
Layout (existing)
├── TopResourceBar (modified)
│   └── DogChip (new)
│       └── DogMenu (new bottom sheet)
│           ├── DogList (new)
│           └── AddDogButton (new)
└── AddDogModal (new)
    ├── VoiceInputScreen (new)
    │   ├── MicrophoneButton (new)
    │   └── ListeningIndicator (reused from training mode)
    └── ConfirmationScreen (new)
        ├── ParsedDogInfo (new)
        └── ActionButtons (new)
```

### Data Flow

```
User taps dog chip
  → DogMenu opens (bottom sheet)
  → User taps "+ Add new dog"
  → AddDogModal opens (full screen)
  → User taps microphone
  → Web Speech API captures audio
  → Transcript sent to OpenAI action
  → AI returns structured dog profile
  → ConfirmationScreen shows parsed data
  → User confirms
  → Convex mutation creates dog + stats + quest
  → Active dog switches to new dog
  → All app data updates via Convex subscriptions
  → Toast notification appears
  → Quest banner shows (auto-dismiss after 4s)
```

### State Management

- **Active Dog Selection**: Stored in localStorage per user session
- **Dog List**: Real-time Convex subscription to `dogs` table filtered by household
- **Voice Transcript**: Local component state (ephemeral)
- **AI Parsing**: Convex action with OpenAI API call
- **Dog Creation**: Convex mutation with optimistic updates

## Components and Interfaces

### 1. DogChip Component

**Location**: `src/components/dog/DogChip.tsx`

**Props**:
```typescript
interface DogChipProps {
  dogId: Id<"dogs">;
  dogName: string;
  dogLevel: number;
  onClick: () => void;
}
```

**Behavior**:
- Displays dog name, emoji avatar (🐶), and dropdown indicator (▼)
- Minimum touch target: 44x44px
- Positioned in TopResourceBar (replaces or augments existing layout)
- Opens DogMenu on tap

**Styling**:
- Black and white theme with accent color for active state
- Text shadow for readability over backgrounds
- Smooth tap feedback animation

### 2. DogMenu Component

**Location**: `src/components/dog/DogMenu.tsx`

**Props**:
```typescript
interface DogMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeDogId: Id<"dogs">;
  onDogSelect: (dogId: Id<"dogs">) => void;
  onAddDog: () => void;
}
```

**Behavior**:
- Bottom sheet modal (slides up from bottom)
- Displays all household dogs with active dog marked "(current)"
- "+ Add new dog" button with primary accent styling
- Dismissible via backdrop tap or swipe down
- Uses Convex `useQuery` to subscribe to household dogs

**Query**:
```typescript
const dogs = useQuery(api.queries.getHouseholdDogs, { 
  householdId 
});
```

### 3. AddDogModal Component

**Location**: `src/components/dog/AddDogModal.tsx`

**Props**:
```typescript
interface AddDogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (dogId: Id<"dogs">) => void;
}
```

**State Machine**:
```typescript
type ModalState = 
  | { stage: "voice-input" }
  | { stage: "listening" }
  | { stage: "processing"; transcript: string }
  | { stage: "confirmation"; parsedData: ParsedDogData }
  | { stage: "creating" }
  | { stage: "error"; message: string };
```

**Behavior**:
- Full-screen modal with smooth slide-up animation (200-300ms)
- Manages voice input → AI parsing → confirmation → creation flow
- Handles errors gracefully with retry option
- Auto-closes on successful dog creation

### 4. VoiceInputScreen Component

**Location**: `src/components/dog/VoiceInputScreen.tsx`

**Props**:
```typescript
interface VoiceInputScreenProps {
  onTranscriptComplete: (transcript: string) => void;
  onError: (error: string) => void;
}
```

**Behavior**:
- Large microphone button (60x60px minimum)
- Example text: "Example: Luna, golden retriever, friendly but distractible"
- Uses `useWebSpeechRecognition` hook (existing)
- Shows ListeningIndicator when active (reuse from training mode)
- Automatically stops listening after 10 seconds or on silence detection

**Voice Recognition**:
```typescript
const { 
  transcript, 
  isListening, 
  error, 
  startListening, 
  stopListening 
} = useWebSpeechRecognition();
```

### 5. ConfirmationScreen Component

**Location**: `src/components/dog/ConfirmationScreen.tsx`

**Props**:
```typescript
interface ConfirmationScreenProps {
  parsedData: ParsedDogData;
  onConfirm: (editedName?: string) => void;
  onRetry: () => void;
}

interface ParsedDogData {
  name: string;
  breed: string;
  traits: string[];
  starterQuest: {
    name: string;
    description: string;
    targetStat: "PHY" | "INT" | "IMP" | "SOC";
    reps: number;
  };
  initialStatEmphasis: {
    PHY: number;
    INT: number;
    IMP: number;
    SOC: number;
  };
}
```

**Behavior**:
- Displays parsed name (editable text input)
- Shows breed, traits, and starter quest (read-only)
- "Looks good" button (primary)
- "Try again" button (secondary)
- Validates name is not empty before allowing confirmation

## Data Models

### Extended Dogs Table

No schema changes needed. Existing `dogs` table supports multiple dogs per household:

```typescript
dogs: defineTable({
  name: v.string(),
  householdId: v.id("households"),
  overallLevel: v.number(),
  overallXp: v.number(),
  xpToNextLevel: v.number(),
  photoUrl: v.optional(v.string()),
  breed: v.optional(v.string()), // NEW: Add breed field
  traits: v.optional(v.array(v.string())), // NEW: Add traits array
  createdAt: v.number(),
}).index("by_household", ["householdId"]);
```

### New Quests Table Structure

Extend existing `quests` table to support dog-specific quests:

```typescript
quests: defineTable({
  dogId: v.optional(v.id("dogs")), // NEW: Link quest to specific dog
  name: v.string(),
  description: v.string(),
  durationMinutes: v.number(),
  statGains: v.array(
    v.object({
      statType: v.union(
        v.literal("INT"),
        v.literal("PHY"),
        v.literal("IMP"),
        v.literal("SOC")
      ),
      xpAmount: v.number(),
    })
  ),
  physicalPoints: v.number(),
  mentalPoints: v.number(),
  targetReps: v.optional(v.number()), // NEW: For rep-based quests
  createdAt: v.number(),
}).index("by_dog", ["dogId"]); // NEW: Index for dog-specific queries
```

### Active Dog Selection

Stored in localStorage (client-side only):

```typescript
// Key: "activeDogId_{userId}"
// Value: Id<"dogs">
localStorage.setItem(`activeDogId_${userId}`, dogId);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:

- **UI Rendering Properties (1.3, 7.2)**: Both test that the dog chip updates when the active dog changes. These can be combined into a single property about dog chip updates.
- **Context Switching Properties (3.2, 3.3, 3.4)**: All test that different data views update when switching dogs. These can be combined into a comprehensive context switch property.
- **Real-time Sync Properties (9.2, 9.4)**: Both test Convex real-time synchronization. These can be combined into a single property about household data sync.
- **Performance Properties (10.1, 10.2)**: Both test timing requirements. Keep separate as they test different operations.

### Correctness Properties

Property 1: Dog chip updates on active dog change
*For any* active dog change, the dog chip should update to display the new dog's name and avatar within 200 milliseconds
**Validates: Requirements 1.3, 7.2**

Property 2: Dog menu displays all household dogs
*For any* household, when the dog menu opens, it should display all dogs in that household with the currently active dog marked as "current"
**Validates: Requirements 2.2, 9.1**

Property 3: Touch targets meet accessibility minimums
*For any* interactive element in the dog management UI, the touch target should be at least 44x44 pixels (dog chip) or 60x60 pixels (microphone button)
**Validates: Requirements 1.4, 10.5**

Property 4: Modal animations complete within timing bounds
*For any* modal or bottom sheet open/close action, the animation should complete within 200-300 milliseconds
**Validates: Requirements 2.1, 10.2**

Property 5: Dog menu dismissal methods work
*For any* open dog menu, both backdrop tap and swipe down gestures should close the menu
**Validates: Requirements 2.4**

Property 6: Dog list renders all dogs with required elements
*For any* set of dogs in a household, each dog in the menu should be rendered with a name and avatar in a tappable row
**Validates: Requirements 2.5**

Property 7: Dog selection updates active dog and closes menu
*For any* dog selection in the menu, that dog should become the active dog and the menu should close
**Validates: Requirements 3.1**

Property 8: Context switch updates all app data
*For any* active dog change, all displayed data (stats, XP, level, daily goals, streaks, activity feed, quests) should update to reflect the newly selected dog's data
**Validates: Requirements 3.2, 3.3, 3.4**

Property 9: Active dog selection persists across sessions
*For any* dog selection, storing the selection in localStorage and then reloading the app should restore the same active dog
**Validates: Requirements 3.5**

Property 10: Voice recording activates on microphone tap
*For any* microphone button tap, voice recording should activate and a "Listening…" indicator should display
**Validates: Requirements 4.4**

Property 11: Speech transcription uses Web Speech API
*For any* active voice recording session, the Web Speech API should be used to capture and transcribe speech in real-time
**Validates: Requirements 4.5**

Property 12: AI parser extracts required dog attributes
*For any* valid dog description sent to the AI parser, the response should include breed, personality traits, and suggested name
**Validates: Requirements 5.2**

Property 13: AI parser infers stat emphasis from traits
*For any* dog description with personality traits, the AI parser should return initial stat emphasis values for PHY, INT, IMP, and SOC
**Validates: Requirements 5.3**

Property 14: AI parser generates personalized starter quest
*For any* parsed dog profile, the AI should generate a starter quest that targets the dog's primary training need based on traits
**Validates: Requirements 5.4**

Property 15: AI parser error handling prompts retry
*For any* AI parsing failure or incomplete extraction, the system should display an error message prompting the user to try again
**Validates: Requirements 5.5**

Property 16: Confirmation screen displays all parsed data
*For any* successful AI parse, the confirmation screen should display the parsed name, breed, traits, and starter quest
**Validates: Requirements 6.1**

Property 17: Confirmation creates dog and closes modal
*For any* user confirmation on the confirmation screen, a dog profile should be created in the database and the onboarding modal should close
**Validates: Requirements 6.4**

Property 18: Retry action resets to voice input
*For any* "Try again" action on the confirmation screen, the modal should return to the voice input screen with cleared transcript
**Validates: Requirements 6.5**

Property 19: New dog becomes active immediately
*For any* successfully created dog, that dog should be set as the active dog and the dog chip should update to show the new dog
**Validates: Requirements 7.1, 7.2**

Property 20: New dog creation shows toast notification
*For any* successfully created dog, a toast notification should appear with the format "[DogName] added!"
**Validates: Requirements 7.3**

Property 21: New dog initializes with correct stat values
*For any* newly created dog, four stat records should be created (PHY, INT, IMP, SOC) with level 1 and XP 0, with slight emphasis based on parsed traits
**Validates: Requirements 7.4**

Property 22: Starter quest is assigned to new dog
*For any* newly created dog with a starter quest, the quest should be linked to that dog's ID in the database
**Validates: Requirements 7.5**

Property 23: Quest banner displays and auto-dismisses
*For any* new dog created with a starter quest, a banner should display with the quest name and rep count, then auto-dismiss after 4 seconds
**Validates: Requirements 8.1, 8.2**

Property 24: Quest banner navigation works
*For any* displayed quest banner, tapping it should navigate to the quest detail screen
**Validates: Requirements 8.3**

Property 25: Household dog data syncs in real-time
*For any* dog creation or data update, all household members should see the change in real-time via Convex subscriptions
**Validates: Requirements 9.2, 9.4**

Property 26: Active dog selection is user-specific
*For any* user's active dog change, other household members' active dog selections should remain unchanged
**Validates: Requirements 9.3**

Property 27: AI parsing completes within performance budget
*For any* voice input transcription sent to the AI parser, results should be displayed within 3 seconds
**Validates: Requirements 10.1**

Property 28: Touch interactions provide immediate feedback
*For any* touch interaction in the onboarding flow, visual feedback should appear immediately (within 100ms)
**Validates: Requirements 10.3**

Property 29: Responsive layout works on small screens
*For any* screen width >= 375px, the onboarding flow should display correctly without horizontal scrolling or cut-off content
**Validates: Requirements 10.4**

## Error Handling

### Voice Recognition Errors

**Scenario**: Web Speech API fails to initialize or loses permission
**Handling**:
- Display error message: "Microphone access required. Please enable in browser settings."
- Provide "Try again" button to re-request permissions
- Fall back to text input option (future enhancement)

**Scenario**: No speech detected after 10 seconds
**Handling**:
- Auto-stop listening
- Display hint: "No speech detected. Tap microphone to try again."
- Reset to voice input screen

### AI Parsing Errors

**Scenario**: OpenAI API returns error or times out
**Handling**:
- Display error message: "Unable to process description. Please try again."
- Log error to console for debugging
- Provide "Try again" button to return to voice input
- Preserve transcript in case of network error (allow retry without re-recording)

**Scenario**: AI returns incomplete data (missing breed or traits)
**Handling**:
- Display error: "Please provide more details about your dog (breed and personality)."
- Show example again
- Return to voice input screen

**Scenario**: AI cannot extract a name
**Handling**:
- Use placeholder name "New Dog" or "Dog [number]"
- Show confirmation screen with editable name field pre-filled with placeholder
- Require user to edit name before confirming

### Dog Creation Errors

**Scenario**: Convex mutation fails (network error, validation error)
**Handling**:
- Display error: "Failed to create dog profile. Please try again."
- Keep modal open with confirmation screen visible
- Provide "Try again" button to retry mutation
- Log error details for debugging

**Scenario**: Duplicate dog name in household
**Handling**:
- Allow duplicate names (no validation)
- Dogs are distinguished by ID, not name
- Future enhancement: suggest appending number if desired

### Context Switching Errors

**Scenario**: Active dog ID in localStorage points to non-existent dog
**Handling**:
- Fall back to first dog in household
- Clear invalid ID from localStorage
- Log warning to console

**Scenario**: No dogs in household after deletion
**Handling**:
- Show placeholder chip: "+ Add your first dog"
- Clicking placeholder opens AddDogModal directly
- Disable navigation to stats/quests until dog exists

## Testing Strategy

### Unit Testing

**Component Tests** (using Vitest + React Testing Library):

1. **DogChip Component**
   - Renders dog name and avatar correctly
   - Opens menu on click
   - Shows placeholder when no dog exists
   - Meets minimum touch target size (44x44px)

2. **DogMenu Component**
   - Displays all household dogs
   - Marks active dog as "current"
   - Closes on backdrop click
   - Closes on swipe down gesture
   - Opens AddDogModal on "+ Add new dog" click

3. **AddDogModal Component**
   - Manages state machine transitions correctly
   - Handles voice input → processing → confirmation flow
   - Handles errors and retry actions
   - Closes on successful dog creation

4. **VoiceInputScreen Component**
   - Activates Web Speech API on microphone tap
   - Shows listening indicator when active
   - Stops listening after 10 seconds
   - Handles speech recognition errors

5. **ConfirmationScreen Component**
   - Displays all parsed data fields
   - Allows name editing
   - Validates name is not empty
   - Triggers dog creation on confirm
   - Returns to voice input on retry

**Integration Tests**:

1. **Full Onboarding Flow**
   - Mock Web Speech API and OpenAI responses
   - Test complete flow from dog chip tap to successful dog creation
   - Verify all state transitions
   - Verify Convex mutations are called with correct data

2. **Context Switching**
   - Create multiple dogs
   - Switch between dogs
   - Verify all app data updates (stats, quests, activity feed)
   - Verify localStorage persistence

3. **Real-time Sync**
   - Mock multiple users in same household
   - Create dog as user A
   - Verify user B sees new dog in real-time
   - Verify active dog selections remain independent

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Test Configuration**: Each property test should run a minimum of 100 iterations

**Property Tests**:

1. **Property 8: Context switch updates all app data**
   ```typescript
   // Feature: multi-dog-ai-onboarding, Property 8: Context switch updates all app data
   // Validates: Requirements 3.2, 3.3, 3.4
   fc.assert(
     fc.property(
       fc.array(dogGenerator(), { minLength: 2, maxLength: 5 }),
       async (dogs) => {
         // For any set of dogs, switching between them should update all data
         for (const dog of dogs) {
           setActiveDog(dog._id);
           const displayedData = getDisplayedData();
           expect(displayedData.stats).toEqual(dog.stats);
           expect(displayedData.quests).toEqual(dog.quests);
           expect(displayedData.activities).toEqual(dog.activities);
         }
       }
     ),
     { numRuns: 100 }
   );
   ```

2. **Property 9: Active dog selection persists across sessions**
   ```typescript
   // Feature: multi-dog-ai-onboarding, Property 9: Active dog selection persists across sessions
   // Validates: Requirements 3.5
   fc.assert(
     fc.property(
       dogIdGenerator(),
       (dogId) => {
         // For any dog selection, it should persist after reload
         setActiveDog(dogId);
         simulateAppReload();
         expect(getActiveDog()).toEqual(dogId);
       }
     ),
     { numRuns: 100 }
   );
   ```

3. **Property 12: AI parser extracts required dog attributes**
   ```typescript
   // Feature: multi-dog-ai-onboarding, Property 12: AI parser extracts required dog attributes
   // Validates: Requirements 5.2
   fc.assert(
     fc.property(
       validDogDescriptionGenerator(),
       async (description) => {
         // For any valid dog description, AI should extract breed, traits, and name
         const parsed = await parseWithAI(description);
         expect(parsed).toHaveProperty('breed');
         expect(parsed).toHaveProperty('traits');
         expect(parsed.traits).toBeInstanceOf(Array);
         expect(parsed).toHaveProperty('name');
       }
     ),
     { numRuns: 100 }
   );
   ```

4. **Property 21: New dog initializes with correct stat values**
   ```typescript
   // Feature: multi-dog-ai-onboarding, Property 21: New dog initializes with correct stat values
   // Validates: Requirements 7.4
   fc.assert(
     fc.property(
       parsedDogDataGenerator(),
       async (parsedData) => {
         // For any new dog, stats should initialize correctly
         const dogId = await createDog(parsedData);
         const stats = await getStats(dogId);
         
         expect(stats).toHaveLength(4);
         expect(stats.map(s => s.statType)).toEqual(['PHY', 'INT', 'IMP', 'SOC']);
         stats.forEach(stat => {
           expect(stat.level).toBe(1);
           expect(stat.xp).toBe(0);
         });
       }
     ),
     { numRuns: 100 }
   );
   ```

5. **Property 25: Household dog data syncs in real-time**
   ```typescript
   // Feature: multi-dog-ai-onboarding, Property 25: Household dog data syncs in real-time
   // Validates: Requirements 9.2, 9.4
   fc.assert(
     fc.property(
       dogDataGenerator(),
       async (dogData) => {
         // For any dog creation/update, all household members should see it
         const userA = createMockUser();
         const userB = createMockUser();
         
         await userA.createDog(dogData);
         await waitForConvexSync();
         
         const userBDogs = await userB.getHouseholdDogs();
         expect(userBDogs).toContainEqual(expect.objectContaining(dogData));
       }
     ),
     { numRuns: 100 }
   );
   ```

**Generators**:

```typescript
// Generate random dog data
const dogGenerator = () => fc.record({
  _id: fc.string(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  breed: fc.string({ minLength: 3, maxLength: 30 }),
  traits: fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
  overallLevel: fc.integer({ min: 1, max: 20 }),
  overallXp: fc.integer({ min: 0, max: 1000 }),
});

// Generate valid dog descriptions
const validDogDescriptionGenerator = () => fc.string()
  .filter(s => s.includes('breed') || s.length > 20)
  .map(s => `${s}, friendly and playful`);

// Generate parsed dog data
const parsedDogDataGenerator = () => fc.record({
  name: fc.string({ minLength: 1, maxLength: 20 }),
  breed: fc.string({ minLength: 3, maxLength: 30 }),
  traits: fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
  initialStatEmphasis: fc.record({
    PHY: fc.integer({ min: 0, max: 10 }),
    INT: fc.integer({ min: 0, max: 10 }),
    IMP: fc.integer({ min: 0, max: 10 }),
    SOC: fc.integer({ min: 0, max: 10 }),
  }),
});
```

## Implementation Notes

### Convex Queries

**getHouseholdDogs**:
```typescript
export const getHouseholdDogs = query({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dogs")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .order("desc")
      .collect();
  },
});
```

**getDogQuests**:
```typescript
export const getDogQuests = query({
  args: { dogId: v.id("dogs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quests")
      .withIndex("by_dog", (q) => q.eq("dogId", args.dogId))
      .collect();
  },
});
```

### Convex Actions

**parseDogDescription**:
```typescript
export const parseDogDescription = action({
  args: { transcript: v.string() },
  handler: async (ctx, args) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a dog training assistant. Parse the user's dog description and return JSON with:
          - name: string (dog's name, or "New Dog" if not mentioned)
          - breed: string (dog breed)
          - traits: string[] (personality traits like "friendly", "reactive", "distractible")
          - initialStatEmphasis: { PHY: number, INT: number, IMP: number, SOC: number } (0-10 for each stat based on traits)
          - starterQuest: { name: string, description: string, targetStat: string, reps: number } (personalized quest based on primary training need)`
        },
        {
          role: "user",
          content: args.transcript
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    const parsed = JSON.parse(response.choices[0].message.content);
    return parsed;
  },
});
```

### Convex Mutations

**createDogWithStats**:
```typescript
export const createDogWithStats = mutation({
  args: {
    householdId: v.id("households"),
    name: v.string(),
    breed: v.string(),
    traits: v.array(v.string()),
    initialStatEmphasis: v.object({
      PHY: v.number(),
      INT: v.number(),
      IMP: v.number(),
      SOC: v.number(),
    }),
    starterQuest: v.object({
      name: v.string(),
      description: v.string(),
      targetStat: v.union(
        v.literal("PHY"),
        v.literal("INT"),
        v.literal("IMP"),
        v.literal("SOC")
      ),
      reps: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Create dog
    const dogId = await ctx.db.insert("dogs", {
      name: args.name,
      householdId: args.householdId,
      breed: args.breed,
      traits: args.traits,
      overallLevel: 1,
      overallXp: 0,
      xpToNextLevel: 100,
      createdAt: Date.now(),
    });
    
    // Create stats with emphasis
    const statTypes = ["PHY", "INT", "IMP", "SOC"] as const;
    for (const statType of statTypes) {
      await ctx.db.insert("dog_stats", {
        dogId,
        statType,
        level: 1,
        xp: args.initialStatEmphasis[statType], // Slight head start based on traits
        xpToNextLevel: 100,
      });
    }
    
    // Create starter quest
    const statGains = [
      {
        statType: args.starterQuest.targetStat,
        xpAmount: 50,
      },
    ];
    
    await ctx.db.insert("quests", {
      dogId,
      name: args.starterQuest.name,
      description: args.starterQuest.description,
      durationMinutes: 10,
      statGains,
      physicalPoints: args.starterQuest.targetStat === "PHY" ? 20 : 10,
      mentalPoints: args.starterQuest.targetStat === "INT" ? 20 : 10,
      targetReps: args.starterQuest.reps,
      createdAt: Date.now(),
    });
    
    return dogId;
  },
});
```

### LocalStorage Utilities

**activeDogStorage.ts**:
```typescript
export const getActiveDogId = (userId: string): string | null => {
  return localStorage.getItem(`activeDogId_${userId}`);
};

export const setActiveDogId = (userId: string, dogId: string): void => {
  localStorage.setItem(`activeDogId_${userId}`, dogId);
};

export const clearActiveDogId = (userId: string): void => {
  localStorage.removeItem(`activeDogId_${userId}`);
};
```

### Custom Hooks

**useActiveDog.ts**:
```typescript
export const useActiveDog = () => {
  const { selectedCharacterId } = useSelectedCharacter();
  const [activeDogId, setActiveDogIdState] = useState<string | null>(null);
  
  // Load from localStorage on mount
  useEffect(() => {
    if (selectedCharacterId) {
      const storedId = getActiveDogId(selectedCharacterId);
      setActiveDogIdState(storedId);
    }
  }, [selectedCharacterId]);
  
  // Update localStorage when changed
  const setActiveDogId = useCallback((dogId: string) => {
    if (selectedCharacterId) {
      setActiveDogIdState(dogId);
      setActiveDogId(selectedCharacterId, dogId);
    }
  }, [selectedCharacterId]);
  
  return { activeDogId, setActiveDogId };
};
```

## Performance Considerations

### Voice Recognition
- Use Web Speech API (native browser API, no external dependencies)
- Implement 10-second timeout to prevent indefinite listening
- Debounce transcript updates to avoid excessive re-renders

### AI Parsing
- Set 3-second timeout for OpenAI API calls
- Cache common breed/trait combinations (future optimization)
- Use streaming responses for faster perceived performance (future enhancement)

### Real-time Sync
- Leverage Convex's built-in optimistic updates for instant UI feedback
- Use Convex indexes for efficient dog queries by household
- Limit activity feed queries to last 50 activities per dog

### Animations
- Use CSS transforms for smooth 60fps animations
- Implement will-change hints for animated elements
- Debounce rapid dog switches to prevent animation jank

### Mobile Optimization
- Lazy load AddDogModal component (code splitting)
- Preload microphone icon and listening indicator assets
- Use requestAnimationFrame for smooth gesture handling
- Minimize re-renders during voice input with React.memo

## Security Considerations

### Voice Data
- Transcripts are ephemeral (not stored in database)
- Web Speech API processes audio locally in browser
- Only text transcripts are sent to OpenAI API

### API Keys
- OpenAI API key stored in Convex environment variables
- Never exposed to client-side code
- API calls made through Convex actions (server-side)

### Data Access
- Dogs are scoped to households (users can only see their household's dogs)
- Active dog selection is client-side only (localStorage)
- Convex queries enforce household-based access control

### Input Validation
- Sanitize dog names before storing (prevent XSS)
- Validate AI responses match expected schema
- Limit dog name length to 50 characters
- Limit traits array to 10 items maximum
