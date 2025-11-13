import { createFileRoute, Link } from '@tanstack/react-router'
import { Code, Zap, Cloud, Eye, DollarSign, Shield, Bot } from 'lucide-react'

export const Route = createFileRoute('/tech-demo')({
  component: TechDemo,
})

function TechDemo() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-amber-900">
          Corgi Quest: Tech Stack Showcase
        </h1>
        <p className="text-lg text-gray-700">
          Built for the TanStack Start Hackathon - showcasing what modern web tech can do
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* TanStack Start */}
        <FeatureCard
          icon={<Zap className="w-8 h-8 text-orange-500" />}
          title="TanStack Start"
          description="Full-stack framework powering our routing and SSR"
          features={[
            'File-based routing with auto-generated route tree',
            'Server functions for AI tip fetching',
            'Selective SSR (voice interface runs client-only)',
            'Route data caching (5min stale, 10min GC)',
            'Netlify deployment integration',
          ]}
          demoLinks={[
            { label: 'Full SSR Demo', path: '/demo/start/ssr/full-ssr' },
            { label: 'Data-Only SSR', path: '/demo/start/ssr/data-only' },
            { label: 'SPA Mode', path: '/demo/start/ssr/spa-mode' },
            { label: 'Server Functions', path: '/demo/start/server-funcs' },
          ]}
        />

        {/* Convex */}
        <FeatureCard
          icon={<Zap className="w-8 h-8 text-blue-500" />}
          title="Convex"
          description="Real-time backend that keeps everything in sync"
          features={[
            '13 tables with comprehensive schema',
            'Instant cross-device sync (try it on 2 phones!)',
            'Optimistic updates for voice logging',
            'Cron jobs for daily goal resets',
            'Presence system (see when partner is active)',
            'Batch queries to avoid N+1 problems',
          ]}
          stats={[
            { label: 'Queries', value: '21' },
            { label: 'Mutations', value: '11' },
            { label: 'Actions', value: '3' },
            { label: 'Cron Jobs', value: '1' },
          ]}
        />

        {/* Cloudflare */}
        <FeatureCard
          icon={<Cloud className="w-8 h-8 text-orange-400" />}
          title="Cloudflare Workers"
          description="Edge computing for global performance"
          features={[
            'Edge proxy for Firecrawl API',
            '1-hour cache with 24h stale-while-revalidate',
            'CORS handling for client requests',
            'Reduces API costs and improves latency',
          ]}
          codeSnippet={`// Edge caching at Cloudflare
cache: {
  ttl: 3600,      // 1 hour
  swr: 86400      // 24h stale
}`}
        />

        {/* Firecrawl */}
        <FeatureCard
          icon={<Bot className="w-8 h-8 text-green-500" />}
          title="Firecrawl"
          description="AI-powered web scraping for training content"
          features={[
            'Scrapes AKC.org training articles',
            'Markdown extraction with structured parsing',
            'Cached in Convex for instant access',
            'Powers quest recommendations',
          ]}
          codeSnippet={`// Scrape training tips
const tips = await firecrawl.scrape({
  url: 'akc.org/expert-advice/training',
  formats: ['markdown']
})`}
        />

        {/* Sentry */}
        <FeatureCard
          icon={<Shield className="w-8 h-8 text-purple-500" />}
          title="Sentry"
          description="Production monitoring and error tracking"
          features={[
            'Session replay (10% sample, 100% on errors)',
            'Performance monitoring',
            'Custom error boundaries',
            'User context tracking',
            'Browser tracing integration',
          ]}
          stats={[
            { label: 'Error Tracking', value: '✓' },
            { label: 'Session Replay', value: '✓' },
            { label: 'Performance', value: '✓' },
          ]}
        />

        {/* OpenAI */}
        <FeatureCard
          icon={<Eye className="w-8 h-8 text-teal-500" />}
          title="OpenAI Realtime API"
          description="Voice-first activity logging"
          features={[
            'WebSocket streaming audio (24kHz PCM16)',
            'Server-side Voice Activity Detection',
            'Function calling for structured data extraction',
            'Real-time conversation states',
            'Audio visualization with waveforms',
          ]}
          codeSnippet={`// Voice function calling
const tools = [{
  name: 'saveActivity',
  description: 'Save dog activity with XP',
  parameters: { type, duration, ... }
}]`}
        />

        {/* Autumn */}
        <FeatureCard
          icon={<DollarSign className="w-8 h-8 text-green-600" />}
          title="Autumn"
          description="Stripe integration made simple"
          features={[
            'Sandbox mode implemented',
            'One-time payments for premium features',
            'Convex action for checkout creation',
            'Ready for production deployment',
          ]}
        />

        {/* CodeRabbit */}
        <FeatureCard
          icon={<Code className="w-8 h-8 text-pink-500" />}
          title="CodeRabbit"
          description="AI-powered code reviews"
          features={[
            'Automated PR reviews',
            'Code quality suggestions',
            'Security vulnerability detection',
            'Continuous improvement',
          ]}
        />
      </div>

      <div className="mt-12 p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
        <h2 className="text-2xl font-bold mb-4 text-amber-900">
          Why This Stack?
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <h3 className="font-semibold mb-2">Real-time by Default</h3>
            <p className="text-sm">
              Convex subscriptions mean my wife and I see updates instantly.
              When she logs a walk, I see the XP update within milliseconds.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Type-Safe End-to-End</h3>
            <p className="text-sm">
              TypeScript + Convex validators = zero runtime type errors.
              70+ TypeScript files with strict mode enabled.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Production-Ready</h3>
            <p className="text-sm">
              Sentry monitoring, edge caching, PWA support, image optimization.
              Built to actually deploy and use daily.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">AI-First Experience</h3>
            <p className="text-sm">
              Voice logging with OpenAI Realtime API, context-aware recommendations,
              and web scraping for training content.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg transition"
        >
          Try the App
        </Link>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  demoLinks?: { label: string; path: string }[]
  stats?: { label: string; value: string }[]
  codeSnippet?: string
}

function FeatureCard({
  icon,
  title,
  description,
  features,
  demoLinks,
  stats,
  codeSnippet,
}: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {features.map((feature, i) => (
          <li key={i} className="text-sm flex items-start gap-2">
            <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-lg font-bold text-amber-600">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {codeSnippet && (
        <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto mb-4">
          <code>{codeSnippet}</code>
        </pre>
      )}

      {demoLinks && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 mb-2">Live Demos:</p>
          {demoLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className="block text-sm text-amber-600 hover:text-amber-700 hover:underline"
            >
              → {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
