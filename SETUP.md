# Corgi Quest - Setup Guide

## Project Structure

```
corgi-quest/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities, types, and Convex client
│   │   ├── convex.ts   # Convex client configuration
│   │   ├── types.ts    # TypeScript type definitions
│   │   ├── utils.ts    # Utility functions
│   │   └── index.ts    # Central exports
│   └── routes/         # TanStack Start file-based routing
│       ├── __root.tsx  # Root layout with ConvexProvider
│       └── index.tsx   # Home page
├── convex/
│   ├── schema.ts       # Database schema (8 tables)
│   ├── test.ts         # Test query
│   └── _generated/     # Auto-generated Convex types
├── .env.local          # Environment variables (Convex URL)
└── package.json
```

## Technology Stack

- **Frontend**: TanStack Start (React + TypeScript)
- **Backend**: Convex (real-time database)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **TypeScript**: Strict mode enabled

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Convex Development Server
```bash
npx convex dev
```

This will:
- Watch for changes to Convex functions
- Push schema and functions to your deployment
- Generate TypeScript types in `convex/_generated/`

### 3. Start Development Server
In a separate terminal:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Convex Integration

### Database Schema
The schema defines 8 tables:
- `users` - Partners in a household
- `households` - Shared account
- `dogs` - The pet character
- `dog_stats` - Four character attributes (INT, PHY, IMP, SOC)
- `activities` - Logged training events
- `activity_stat_gains` - XP awards per activity
- `daily_goals` - Daily physical/mental tracking
- `streaks` - Consecutive days meeting goals

### Using Convex in Components

**Queries (read data with real-time subscriptions):**
```typescript
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

function MyComponent() {
  const data = useQuery(api.myModule.myQuery, { arg: "value" });
  
  if (data === undefined) return <div>Loading...</div>;
  
  return <div>{data.message}</div>;
}
```

**Mutations (write data):**
```typescript
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

function MyComponent() {
  const myMutation = useMutation(api.myModule.myMutation);
  
  const handleClick = () => {
    myMutation({ arg: "value" });
  };
  
  return <button onClick={handleClick}>Submit</button>;
}
```

## TypeScript Configuration

TypeScript strict mode is enabled with:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

## Environment Variables

### Local Environment (.env.local)

The `.env.local` file contains:
- `CONVEX_DEPLOYMENT` - Your Convex deployment ID
- `VITE_CONVEX_URL` - Your Convex deployment URL
- `OPENAI_API_KEY` - Your OpenAI API key for Realtime API (voice logging)

The Convex variables are automatically set when you run `npx convex dev`.

### Setting Up OpenAI API Key

**For Local Development:**
1. Get your API key from https://platform.openai.com/api-keys
2. Add it to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

**For Convex Deployment (Required for Production):**
1. Open the Convex dashboard:
   ```bash
   npx convex dashboard
   ```
2. Navigate to Settings → Environment Variables
3. Add a new environment variable:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-proj-`)
4. Click "Save"

The `OPENAI_API_KEY` is used by the `generateSessionToken` action to create ephemeral session tokens for the OpenAI Realtime API, which powers the voice-based activity logging feature.

## Next Steps

1. Implement database seeding (Task 3)
2. Create Convex queries for real-time subscriptions (Task 4)
3. Build the UI components and routes (Tasks 7+)

## Verification

To verify the setup is working:
1. Visit http://localhost:3000
2. You should see a green "✓ Convex Connected!" message
3. Check the browser console for any errors
4. Open the Convex dashboard: `npx convex dashboard`
