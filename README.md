Corgi Quest is a real-time multiplayer dog training RPG where couples level up their dog together by turning daily training into shared quests, XP, and stat progression. It transforms behavior training into a cooperative adventure, letting both partners see live updates, track goals, and build consistency as a team.

## Tech Stack

### Core Technologies
- **TanStack Start** - React framework with file-based routing
- **Convex** - Real-time backend database with live subscriptions
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **OpenAI Realtime API** - Voice-based activity logging with audio-to-audio conversations

### Development Tools
- **Sentry** - Error monitoring and performance tracking
  - Real-time error reporting
  - Session replay for debugging
  - Performance monitoring
  - User-friendly error boundaries
- **CodeRabbit** - AI-powered code reviews on pull requests
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework

### Deployment & Infrastructure
- **Netlify** - Hosting and CI/CD
- **Cloudflare** - Edge utilities and media hosting (planned)

## Error Monitoring

This project uses **Sentry** for error monitoring and performance tracking. To set up Sentry:

1. Create a free account at [sentry.io](https://sentry.io)
2. Create a new React project and copy your DSN
3. Add to `.env.local`:
   ```bash
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
   ```

See [SENTRY_SETUP.md](./SENTRY_SETUP.md) for detailed setup instructions and testing.

**Features:**
- Automatic error capture and reporting
- User-friendly error boundary with recovery
- Performance monitoring and session replay
- Manual error capture with context

**Monitored by Sentry** 🛡️