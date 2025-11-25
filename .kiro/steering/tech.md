---
inclusion: always
---

# Corgi Quest - Technology Stack

## Frontend Framework
- **TanStack Start**: File-based routing framework built on React Router
- **React 18+**: Functional components with hooks only
- **TypeScript**: Strict typing for all files

## Backend & Real-Time
- **Convex**: Real-time database and backend functions
  - All backend code lives in `convex/` folder
  - Use `useQuery` from "convex/react" for data subscriptions
  - Use `useMutation` from "convex/react" for mutations
  - Never use `fetch()` to call Convex - always use hooks
  - Use `v.id("tableName")` for ID validation

## Styling
- **Tailwind CSS**: Utility-first CSS framework
  - Core utilities only, no custom plugins
  - Mobile-first responsive design
  - Black and white color scheme only

## Icons & Assets
- **lucide-react**: Icon library for UI elements
- **DALL-E 3**: AI-generated dog cosmetic transformations

## Voice & AI
- **Web Speech API**: Browser-native speech recognition (primary)
- **OpenAI Realtime API**: Advanced voice processing (optional)
- **OpenAI GPT-4**: Activity parsing and recommendations

## Development Tools
- **npm**: Package manager
- **Vite**: Build tool (via TanStack Start)
- **ESLint**: Code linting
- **TypeScript**: Type checking

## Deployment
- **Convex Cloud**: Backend hosting and real-time infrastructure
- **Vercel/Netlify**: Frontend hosting (TBD)

## Technical Constraints
- Must work on mobile browsers (iOS Safari, Chrome)
- Real-time updates must be sub-second latency
- Voice recognition must work hands-free during training
- All data must sync between partners instantly
- Offline support is not required (v1)

## Architecture Decisions
- **No REST API**: All data access through Convex hooks
- **No Redux/Zustand**: Convex handles state management
- **No CSS-in-JS**: Tailwind only for styling
- **No class components**: Functional components with hooks only
- **No manual refetching**: Real-time subscriptions handle updates
