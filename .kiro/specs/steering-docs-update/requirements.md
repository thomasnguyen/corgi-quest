# Requirements Document

## Introduction

This spec covers updating the Corgi Quest steering documentation to accurately reflect the current state of the project. The steering docs guide Kiro's AI assistance and need to stay in sync with the actual codebase structure, database schema, UI patterns, and feature set.

## Glossary

- **Steering Docs**: Markdown files in `.kiro/steering/` that provide context and guidelines to Kiro for consistent AI assistance
- **Convex Schema**: The database schema defined in `convex/schema.ts` that specifies all tables and their fields
- **Routes**: File-based routing pages in `src/routes/` that define the app's screens
- **Components**: Reusable React components in `src/components/`

## Requirements

### Requirement 1: Update File Structure Paths

**User Story:** As a developer using Kiro, I want the steering docs to reference correct file paths, so that AI-generated code is placed in the right locations.

#### Acceptance Criteria

1. WHEN the development-guidelines.md references route paths THEN the Steering_Docs SHALL specify `src/routes/*.tsx` instead of `app/routes/*.tsx`
2. WHEN the development-guidelines.md references component paths THEN the Steering_Docs SHALL specify `src/components/*.tsx` instead of `app/components/*.tsx`
3. WHEN the structure.md references directory organization THEN the Steering_Docs SHALL reflect the actual `src/` based structure

### Requirement 2: Update Database Schema Documentation

**User Story:** As a developer using Kiro, I want the steering docs to accurately list all database tables, so that AI assistance understands the full data model.

#### Acceptance Criteria

1. WHEN the development-guidelines.md references table count THEN the Steering_Docs SHALL specify 18 tables instead of 8 tables
2. WHEN listing database tables THEN the Steering_Docs SHALL include all current tables: users, households, dogs, dog_stats, activities, activity_stat_gains, daily_goals, streaks, presence, mood_logs, ai_recommendations, firecrawl_tips, cosmetic_items, equipped_items, newly_unlocked_items, quests, waitlist_users, updates_subscribers
3. WHEN the structure.md references schema THEN the Steering_Docs SHALL note the schema comment indicates 13 tables but actual count is 18

### Requirement 3: Update Screen Requirements

**User Story:** As a developer using Kiro, I want the steering docs to list all current screens, so that AI understands the full app navigation.

#### Acceptance Criteria

1. WHEN the development-guidelines.md lists screens THEN the Steering_Docs SHALL include all current routes beyond the original 7
2. WHEN listing screens THEN the Steering_Docs SHALL include: Overview, Quests, Activity, Stat Detail, Training Mode, Log Confirmation, Quest Detail, Waitlist, Hackathon Landing, Items/Cosmetics view
3. WHEN describing navigation THEN the Steering_Docs SHALL reflect the current bottom nav structure

### Requirement 4: Update UI/UX Guidelines

**User Story:** As a developer using Kiro, I want the steering docs to reflect the current visual design, so that AI-generated UI matches the app's style.

#### Acceptance Criteria

1. WHEN the development-guidelines.md describes color scheme THEN the Steering_Docs SHALL update from "black and white only" to reflect the RPG theme with dynamic backgrounds
2. WHEN describing UI patterns THEN the Steering_Docs SHALL mention cosmetic transformations and themed backgrounds
3. WHEN describing animations THEN the Steering_Docs SHALL include XP animations, level-up effects, and floating XP indicators

### Requirement 5: Synchronize Structure Documentation

**User Story:** As a developer using Kiro, I want the structure.md to match the actual project layout, so that file organization guidance is accurate.

#### Acceptance Criteria

1. WHEN the structure.md shows directory tree THEN the Steering_Docs SHALL reflect actual folders including hooks/, lib/, and component subfolders
2. WHEN listing component organization THEN the Steering_Docs SHALL include subfolders: dog/, layout/, training/, animations/, mood/
3. WHEN describing import patterns THEN the Steering_Docs SHALL use correct relative paths based on src/ structure

### Requirement 6: Update Tech Stack Documentation

**User Story:** As a developer using Kiro, I want the tech.md to list all current technologies, so that AI understands the full stack.

#### Acceptance Criteria

1. WHEN the tech.md lists AI services THEN the Steering_Docs SHALL include Claude for activity parsing (in addition to GPT-4)
2. WHEN listing deployment THEN the Steering_Docs SHALL specify Netlify as the frontend host
3. WHEN describing voice features THEN the Steering_Docs SHALL include both Web Speech API and OpenAI Realtime API paths
