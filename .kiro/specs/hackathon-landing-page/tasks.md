# Implementation Plan

- [x] 1. Set up route and base structure
  - Create `/hackathon` route in `src/routes/hackathon.tsx`
  - Set up dark theme container with max-w-4xl layout
  - Add responsive spacing (py-8 sm:py-12 md:py-16)
  - _Requirements: 13.1, 13.4, 13.5, 12.1, 12.2_

- [x] 2. Create HeroSection component
  - Build `src/components/hackathon/HeroSection.tsx`
  - Implement headline with golden gradient text (from-[#feefd0] to-[#fcd587])
  - Add subheadline with cream text (#f9dca0)
  - Create primary CTA button (Launch Demo) with golden background (#f5c35f)
  - Create secondary CTA button (Watch Demo) with golden border
  - Add hero visual placeholder (screenshot or video loop)
  - Ensure hero is visible without scrolling on all viewports
  - _Requirements: 1.1, 1.2, 13.2, 13.3_

- [x] 3. Implement demo auto-login flow
  - Create demo login handler that navigates to main app
  - Configure test account credentials from environment variables
  - Add error handling with fallback to manual credentials
  - Test navigation flow from landing page to main app
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 4. Build DemoVideoSection component
  - Create `src/components/hackathon/DemoVideoSection.tsx`
  - Embed video with lazy loading
  - Add caption explaining key features for judges
  - Implement responsive video container with aspect ratio
  - Add CTA after video to launch demo
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Create CoreValuesSection component
  - Build `src/components/hackathon/CoreValuesSection.tsx`
  - Create ValueCard sub-component with icon, title, description
  - Add three value cards: Real-Time Sync, AI Voice Coach, Vision Pro HUD
  - Use lucide-react icons (Users, Mic, Glasses)
  - Implement responsive grid (md:grid-cols-3)
  - Style with dark theme and golden accents
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 13.2, 13.3_

- [x] 6. Build HowItWorksSection component
  - Create `src/components/hackathon/HowItWorksSection.tsx`
  - Create Step sub-component with number, title, description, icon
  - Add three steps: Log Session, Claude → XP Engine, Convex Sync
  - Use lucide-react icons (MessageSquare, Zap, RefreshCw)
  - Implement responsive layout (flex-col md:flex-row)
  - Use judge-focused technical language
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 13.2_

- [x] 7. Create TechStackSection component with Kiro emphasis
  - Build `src/components/hackathon/TechStackSection.tsx`
  - Create dedicated Kiro subsection with special styling
  - List Kiro features: Specs, Steering, Hooks, Vibe Coding
  - Add tech logos grid: Kiro, Convex, Claude, TanStack, visionOS, Firecrawl, DALL·E
  - Apply visual emphasis to Kiro (border, background color, or icon)
  - Use color-coding or subtle styling to highlight Kiro integration
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 13.3_

- [x] 8. Build RealDataSection component
  - Create `src/components/hackathon/RealDataSection.tsx`
  - Add optimized screenshots of real Bumi training logs
  - Include emotional note about training motivation (< 100 words)
  - Optimize images for fast loading (< 500KB per screenshot)
  - Implement lazy loading for images
  - Style with dark theme and golden text
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 11.2, 11.3, 13.2_

- [x] 9. Create FeatureGrid component
  - Build `src/components/hackathon/FeatureGrid.tsx`
  - Create FeatureCard sub-component with icon, title, description
  - Add five features: Voice Logging, Coach Mode, Goals/Streaks, Quests, Cosmetics
  - Use lucide-react icons (Mic, MessageCircle, Target, Map, Sparkles)
  - Implement responsive grid (md:grid-cols-2 lg:grid-cols-3)
  - Ensure mobile stacking with proper spacing
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 12.2, 13.3_

- [x] 10. Build VisionProSection component
  - Create `src/components/hackathon/VisionProSection.tsx`
  - Add large HUD screenshot showing real-time training data
  - Include caption about real-time use (< 50 words)
  - Optimize image for fast loading while maintaining clarity
  - Implement lazy loading
  - Style with dark theme
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 11.2, 13.2_

- [x] 11. Create TestingInstructions component
  - Build `src/components/hackathon/TestingInstructions.tsx`
  - Display auto-login CTA prominently
  - Show backup credentials in styled code blocks
  - List testing steps: voice logging, real-time sync, cosmetics
  - Use numbered list for easy scanning
  - Ensure credentials are easily copyable on mobile
  - Style with dark background and golden borders
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 13.1, 13.2, 13.3_

- [x] 12. Build FinalCTA component
  - Create `src/components/hackathon/FinalCTA.tsx`
  - Add "Launch Demo" button with golden styling
  - Add "View GitHub" link that opens in new tab
  - Use high-contrast styling to draw attention
  - Implement proper hover states
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 13.3_

- [ ] 13. Optimize images and assets
  - Convert all images to WebP format with JPEG fallbacks
  - Compress screenshots to < 500KB each
  - Compress hero visual to < 2MB
  - Implement responsive images with srcset
  - Add proper alt text to all images
  - _Requirements: 1.5, 6.5, 8.5, 11.2, 11.5_

- [ ] 14. Implement lazy loading
  - Add lazy loading to all below-the-fold images
  - Implement lazy loading for video embed
  - Add skeleton screens for loading states
  - Test scroll-triggered loading behavior
  - _Requirements: 11.3, 11.4_

- [x] 15. Add mobile optimizations
  - Test responsive layout on mobile viewports (< 768px)
  - Verify vertical stacking of all sections
  - Ensure touch targets are minimum 44x44px
  - Test font sizes for mobile readability (16px minimum)
  - Verify no horizontal scrolling on narrow viewports
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ]* 16. Performance optimization
  - Measure initial page load time (target: < 2 seconds)
  - Measure time to interactive (target: < 3 seconds)
  - Run Lighthouse performance audit (target: > 90)
  - Optimize total page size (target: < 3MB)
  - Add loading indicators for slow connections
  - _Requirements: 11.1, 11.2, 11.3_

- [ ]* 17. Accessibility improvements
  - Add ARIA labels to all interactive elements
  - Verify keyboard navigation works for all CTAs
  - Test color contrast (WCAG AA standards)
  - Add alt text to all images
  - Test with screen reader
  - _Requirements: 12.3, 12.5_

- [ ] 18. Error handling
  - Add error handling for failed demo auto-login
  - Add fallback for failed image loads
  - Add error message for failed video embed
  - Implement retry logic for failed loads (max 3 attempts)
  - Add fallback message if main app is unreachable
  - _Requirements: 1.2, 1.4_

- [ ] 19. Final testing and polish
  - Test demo button navigation flow end-to-end
  - Verify all external links open in new tabs
  - Test on multiple browsers (Chrome, Safari, Firefox)
  - Test on multiple devices (desktop, tablet, mobile)
  - Verify color scheme matches main app
  - Check all copy for typos and clarity
  - _Requirements: 1.2, 10.4, 13.1, 13.2, 13.3, 13.4, 13.5_
