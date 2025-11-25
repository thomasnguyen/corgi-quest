# Design Document

## Overview

The hackathon landing page is a standalone marketing route (`/hackathon`) designed to showcase Corgi Quest to Kiroween judges. The page prioritizes immediate demo access while providing comprehensive context about the product, technical implementation, and Kiro integration. The design follows a single-page scroll layout with clear visual hierarchy, optimized for both desktop and mobile viewing.

## Architecture

### Route Structure

```
/hackathon → HackathonLandingPage component
/ → Main app (existing)
/demo-login → Auto-login handler (redirects to main app with test credentials)
```

The landing page is completely separate from the main application routing to avoid conflicts. The demo login flow uses a dedicated route that handles authentication and redirects to the main app.

### Component Hierarchy

```
HackathonLandingPage
├── HeroSection
│   ├── Headline
│   ├── Subheadline
│   ├── CTAButtons (Launch Demo, Watch Demo)
│   └── HeroVisual (screenshot or video loop)
├── DemoVideoSection
│   ├── VideoEmbed
│   └── VideoCaption
├── CoreValuesSection
│   ├── ValueCard (Real-Time Sync)
│   ├── ValueCard (AI Voice Coach)
│   └── ValueCard (Vision Pro HUD)
├── HowItWorksSection
│   ├── Step (Voice/Text Logging)
│   ├── Step (Claude → XP Engine)
│   └── Step (Convex Real-Time Sync)
├── TechStackSection
│   ├── KiroHighlight
│   └── TechLogos
├── RealDataSection
│   ├── TrainingScreenshots
│   └── EmotionalNote
├── FeatureGrid
│   ├── FeatureCard (Voice Logging)
│   ├── FeatureCard (Coach Mode)
│   ├── FeatureCard (Goals/Streaks)
│   ├── FeatureCard (Quests)
│   └── FeatureCard (Cosmetics)
├── VisionProSection
│   ├── HUDScreenshot
│   └── Caption
├── TestingInstructions
│   ├── AutoLoginCTA
│   └── BackupCredentials
└── FinalCTA
    ├── LaunchDemoButton
    └── GitHubLink
```

## Components and Interfaces

### HackathonLandingPage

Main container component for the landing page.

```typescript
export function HackathonLandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16 space-y-12 sm:space-y-16">
        <HeroSection />
        <DemoVideoSection />
        <CoreValuesSection />
        <HowItWorksSection />
        <TechStackSection />
        <RealDataSection />
        <FeatureGrid />
        <VisionProSection />
        <TestingInstructions />
        <FinalCTA />
      </div>
    </div>
  );
}
```

### HeroSection

Above-the-fold content with primary CTAs. Uses dark background with golden gradient text matching main app.

```typescript
interface HeroSectionProps {
  onWatchDemo?: () => void;
}

export function HeroSection({ onWatchDemo }: HeroSectionProps) {
  // Headline: "Train your dog together, level up in real-time"
  // - Use gradient text: bg-gradient-to-b from-[#feefd0] to-[#fcd587]
  // Subheadline: "AI-powered voice coaching + real-time sync + Vision Pro HUD"
  // - Use text-[#f9dca0] for subheadline
  // CTAs: 
  // - Launch Demo (primary): bg-[#f5c35f] with hover:bg-[#fcd587]
  // - Watch Demo (secondary): border-[#f5c35f] text-[#f5c35f] with hover effects
  // Visual: Screenshot or looping video with subtle border/shadow
}
```

### DemoVideoSection

Embedded demo video with context for judges.

```typescript
interface DemoVideoSectionProps {
  videoUrl: string;
  caption: string;
}

export function DemoVideoSection({ videoUrl, caption }: DemoVideoSectionProps) {
  // Embedded video (YouTube/Vimeo)
  // Caption explaining what to notice
  // Lazy loading for performance
}
```

### CoreValuesSection

Three key value propositions with icons.

```typescript
interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function CoreValuesSection() {
  const values = [
    {
      icon: <Users />,
      title: "Real-Time Couples Sync",
      description: "Partners see each other's training progress instantly via Convex subscriptions"
    },
    {
      icon: <Mic />,
      title: "AI Voice Coach Mode",
      description: "Hands-free training with Claude-powered voice parsing and rep counting"
    },
    {
      icon: <Glasses />,
      title: "Vision Pro Training HUD",
      description: "Live stats and goals floating in your space during real training sessions"
    }
  ];
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {values.map(value => <ValueCard key={value.title} {...value} />)}
    </div>
  );
}
```

### HowItWorksSection

Technical flow diagram for judges.

```typescript
interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Log Session",
      description: "Voice or text input during real training",
      icon: <MessageSquare />
    },
    {
      number: 2,
      title: "Claude → XP Engine",
      description: "AI parses activity and calculates multi-stat XP",
      icon: <Zap />
    },
    {
      number: 3,
      title: "Convex Real-Time Sync",
      description: "Updates propagate instantly to all devices",
      icon: <RefreshCw />
    }
  ];
  
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {steps.map(step => <Step key={step.number} {...step} />)}
    </div>
  );
}
```

### TechStackSection

Visual display of technologies with Kiro emphasis.

```typescript
interface TechLogo {
  name: string;
  logo: string;
  category: "kiro" | "backend" | "ai" | "frontend";
}

export function TechStackSection() {
  // Kiro section with special styling
  // - Specs, Steering, Hooks, Vibe Coding
  // - Subtle background color or border
  
  // Tech logos grid
  // - Kiro, Convex, Claude, TanStack, visionOS, Firecrawl, DALL·E
  // - Color-coded by category
}
```

### FeatureGrid

Scannable grid of core features.

```typescript
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureGrid() {
  const features = [
    {
      icon: <Mic />,
      title: "Voice Logging",
      description: "Hands-free activity logging during training"
    },
    {
      icon: <MessageCircle />,
      title: "Coach Mode",
      description: "AI-guided training with rep counting"
    },
    {
      icon: <Target />,
      title: "Goals & Streaks",
      description: "Daily physical and mental training targets"
    },
    {
      icon: <Map />,
      title: "Quests",
      description: "Curated training activities with AI recommendations"
    },
    {
      icon: <Sparkles />,
      title: "Cosmetics",
      description: "AI-generated dog transformations on level-up"
    }
  ];
  
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map(feature => <FeatureCard key={feature.title} {...feature} />)}
    </div>
  );
}
```

### TestingInstructions

Clear instructions for judges to test the app. Uses dark theme with golden accents.

```typescript
export function TestingInstructions() {
  const testAccount = {
    email: "demo@corgiquest.app",
    password: "demo123"
  };
  
  return (
    <div className="bg-[#121216] border border-[#f5c35f]/20 p-6 rounded-lg">
      <h3 className="text-[#feefd0] text-xl font-bold mb-4">Testing Instructions</h3>
      <ol className="text-[#f9dca0] space-y-2 list-decimal list-inside">
        <li>Click "Launch Demo" for auto-login</li>
        <li>Try voice logging: "We practiced sit for 5 minutes"</li>
        <li>Check real-time sync (open on two devices)</li>
        <li>View cosmetics and level-up animations</li>
      </ol>
      <div className="mt-4 p-4 bg-[#0a0a0a] rounded border border-[#f5c35f]/10">
        <p className="text-[#f5c35f] text-sm mb-2">Backup credentials:</p>
        <code className="text-[#fcd587] block">{testAccount.email}</code>
        <code className="text-[#fcd587] block">{testAccount.password}</code>
      </div>
    </div>
  );
}
```

## Data Models

### Landing Page Content

```typescript
interface LandingPageContent {
  hero: {
    headline: string;
    subheadline: string;
    visualUrl: string;
  };
  demoVideo: {
    url: string;
    caption: string;
  };
  realData: {
    screenshots: string[];
    emotionalNote: string;
  };
  visionPro: {
    hudScreenshot: string;
    caption: string;
  };
  testAccount: {
    email: string;
    password: string;
  };
  githubUrl: string;
}
```

### Demo Login Flow

```typescript
interface DemoLoginRequest {
  redirectTo?: string;
}

interface DemoLoginResponse {
  success: boolean;
  redirectUrl: string;
}
```

## 
## Co
rrectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Hero CTA Visibility

*For any* viewport size, the "Launch Demo" button should be visible without scrolling when the page loads.
**Validates: Requirements 1.1**

### Property 2: Demo Navigation Consistency

*For any* demo launch interaction (button click or auto-login), the system should navigate to the main application with test credentials applied.
**Validates: Requirements 1.2**

### Property 3: Image Optimization

*For any* image asset on the landing page, the file size should be optimized (< 500KB for screenshots, < 2MB for hero visuals) to ensure fast loading.
**Validates: Requirements 1.5, 11.2**

### Property 4: Video Embed Responsiveness

*For any* viewport size, the embedded demo video should maintain aspect ratio and fit within the container without overflow.
**Validates: Requirements 2.2, 2.4**

### Property 5: Mobile Touch Target Size

*For any* interactive element (buttons, links) on mobile viewports, the touch target should be at least 44x44 pixels.
**Validates: Requirements 9.5, 12.3**

### Property 6: Content Section Ordering

*For any* page load, sections should appear in the specified order: Hero → Video → Values → How It Works → Tech Stack → Real Data → Features → Vision Pro → Testing → Final CTA.
**Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1**

### Property 7: Kiro Visual Emphasis

*For any* rendering of the tech stack section, Kiro-related content should have distinct visual styling (background color, border, or icon) compared to other technologies.
**Validates: Requirements 5.1, 5.4**

### Property 8: Lazy Loading Below Fold

*For any* content below the initial viewport, images and videos should lazy-load only when scrolled into view.
**Validates: Requirements 11.3, 11.4**

### Property 9: Mobile Responsive Layout

*For any* mobile viewport (< 768px), the layout should stack vertically with no horizontal scrolling.
**Validates: Requirements 12.2, 12.4**

### Property 10: External Link Behavior

*For any* external link (GitHub), clicking should open in a new tab without navigating away from the landing page.
**Validates: Requirements 10.4**

### Property 11: Color Scheme Consistency

*For any* section of the landing page, the color palette should match the main app's dark theme with golden accents (backgrounds: #0a0a0a/#121216, text: #feefd0/#fcd587/#f5c35f/#f9dca0).
**Validates: Requirements 13.1, 13.2, 13.3, 13.4**

## Error Handling

### Navigation Errors

- If demo auto-login fails, display error message with backup credentials
- If main app is unreachable, show fallback message with GitHub link
- Log navigation errors to console for debugging

### Media Loading Errors

- If hero visual fails to load, show placeholder with gradient background
- If demo video fails to embed, show thumbnail with error message
- If screenshots fail to load, show alt text with descriptive content
- Implement retry logic for failed image loads (max 3 attempts)

### Performance Degradation

- If page load exceeds 5 seconds, show loading indicator
- If images are slow to load, show skeleton screens
- If video buffering occurs, display loading spinner overlay

### Mobile-Specific Errors

- If viewport is too narrow (< 320px), show message suggesting landscape mode
- If touch events fail, fall back to click events
- If lazy loading fails, load all images immediately

## Testing Strategy

### Unit Tests

We'll write unit tests for individual components to verify:

- HeroSection renders with correct headline and CTAs
- CoreValuesSection displays all three value cards
- HowItWorksSection shows steps in correct order
- TechStackSection includes all required logos
- FeatureGrid renders all five features
- TestingInstructions displays correct credentials
- FinalCTA includes both demo and GitHub links

### Integration Tests

We'll write integration tests to verify:

- Demo button navigates to correct route with test credentials
- Video embed loads and displays correctly
- External links open in new tabs
- Mobile responsive breakpoints work correctly
- Lazy loading triggers at appropriate scroll positions

### Visual Regression Tests

We'll capture screenshots to verify:

- Hero section layout on desktop and mobile
- Tech stack section with Kiro emphasis
- Feature grid spacing and alignment
- Vision Pro section image display

### Performance Tests

We'll measure:

- Initial page load time (target: < 2 seconds)
- Time to interactive (target: < 3 seconds)
- Image load times (target: < 1 second per image)
- Video embed load time (target: < 2 seconds)

### Accessibility Tests

We'll verify:

- All images have alt text
- All interactive elements have ARIA labels
- Keyboard navigation works for all CTAs
- Color contrast meets WCAG AA standards
- Touch targets meet minimum size requirements

### Property-Based Testing

We'll use **fast-check** (JavaScript property-based testing library) to verify universal properties:

- Each property-based test will run a minimum of 100 iterations
- Each test will be tagged with a comment referencing the design document property
- Tag format: `// Feature: hackathon-landing-page, Property {number}: {property_text}`

Example property test structure:

```typescript
import fc from 'fast-check';

// Feature: hackathon-landing-page, Property 3: Image Optimization
test('all images should be optimized for web', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        url: fc.webUrl(),
        type: fc.constantFrom('screenshot', 'hero', 'logo')
      })),
      (images) => {
        images.forEach(image => {
          const maxSize = image.type === 'hero' ? 2000000 : 500000;
          expect(getImageSize(image.url)).toBeLessThan(maxSize);
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

## Implementation Notes

### Route Setup

Create new route at `src/routes/hackathon.tsx` using TanStack Start file-based routing. This keeps the landing page completely separate from the main app routing.

### Demo Auto-Login

Implement a demo login handler that:
1. Accepts demo credentials from environment variables
2. Authenticates with Convex
3. Redirects to main app with session token
4. Falls back to manual login if auto-login fails

### Asset Optimization

- Use WebP format for all images with JPEG fallback
- Implement responsive images with srcset for different viewport sizes
- Compress videos to < 10MB for fast streaming
- Use CDN for static assets if available

### Kiro Integration Showcase

Emphasize Kiro usage through:
- Dedicated subsection in tech stack with border/background
- List of specific Kiro features used (Specs, Steering, Hooks)
- Visual icon or badge next to Kiro logo
- Brief description of how Kiro accelerated development

### Mobile Optimization

- Use mobile-first CSS approach
- Test on iOS Safari and Chrome Android
- Ensure touch targets are 44x44px minimum
- Optimize font sizes for mobile readability (16px minimum)
- Stack all sections vertically on mobile

### Performance Budget

- Total page size: < 3MB
- Initial load: < 2 seconds
- Time to interactive: < 3 seconds
- Lighthouse performance score: > 90

### Content Strategy

Keep all copy concise and scannable:
- Headlines: < 10 words
- Descriptions: < 50 words
- Section titles: < 5 words
- Use bullet points over paragraphs
- Emphasize action verbs

### Visual Hierarchy

1. Primary: Hero CTAs (Launch Demo)
2. Secondary: Demo video, core values
3. Tertiary: Feature details, testing instructions
4. Supporting: Tech logos, screenshots

Use size, color, and spacing to reinforce hierarchy.

### Color Palette (Matching Main App)

**Background Colors:**
- Primary background: `#0a0a0a` (very dark, almost black)
- Secondary background: `#121216` (slightly lighter dark)
- Card backgrounds: `#121216` with subtle borders

**Text Colors:**
- Primary headings: Gradient from `#feefd0` to `#fcd587` (cream to golden)
- Body text: `#f9dca0` (light cream)
- Accent text: `#f5c35f` (golden yellow)
- Muted text: `#f9dca0` with reduced opacity

**Interactive Elements:**
- Primary button background: `#f5c35f` (golden)
- Primary button hover: `#fcd587` (lighter golden)
- Secondary button border: `#f5c35f`
- Secondary button text: `#f5c35f`
- Links: `#f5c35f` with hover to `#fcd587`

**Borders and Dividers:**
- Subtle borders: `#f5c35f` with 10-20% opacity
- Section dividers: `#f5c35f` with 5% opacity

**Shadows:**
- Text shadows: `0px 1px 1px #1e1e1e` for depth
- Card shadows: Subtle dark shadows for elevation

### Typography (Matching Main App)

- Use system fonts or match main app font stack
- Minimum body text size: 16px (mobile readability)
- Heading sizes: 2xl-4xl for hierarchy
- Line height: 1.5-1.6 for readability
- Letter spacing: Slightly increased for golden text on dark backgrounds
