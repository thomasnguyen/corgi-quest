# Requirements Document

## Introduction

This specification defines the restructuring of Corgi Quest's routing architecture to position the hackathon landing page as the root entry point (`/`) and move the main application to a dedicated `/app` route. This change aligns the URL structure with the product's public-facing presentation strategy, where visitors first encounter the landing page before accessing the training application.

## Glossary

- **Root Route**: The base URL path (`/`) that serves as the primary entry point for visitors
- **Landing Page**: The hackathon showcase page currently at `/hackathon` that presents product features and demo information
- **Main Application**: The authenticated dog training RPG interface currently at `/` that includes stats, quests, and activity tracking
- **TanStack Router**: The file-based routing system used by TanStack Start where file names determine URL paths
- **Navigation Reference**: Any code that programmatically directs users between routes using the `navigate()` function or `<Link>` components

## Requirements

### Requirement 1

**User Story:** As a visitor, I want to land on the hackathon showcase page when I visit the root URL, so that I can learn about Corgi Quest before accessing the application.

#### Acceptance Criteria

1. WHEN a user navigates to the root URL (`/`) THEN the system SHALL display the hackathon landing page content
2. WHEN the landing page loads THEN the system SHALL display all sections including hero, demo video, core values, tech stack, and testing instructions
3. WHEN a user accesses the previous `/hackathon` URL THEN the system SHALL redirect to the root URL (`/`)
4. WHEN the landing page renders THEN the system SHALL maintain all existing styling, animations, and interactive elements
5. WHEN a user clicks "Launch Demo" or similar CTAs THEN the system SHALL navigate to the main application at `/app`

### Requirement 2

**User Story:** As an authenticated user, I want to access the main training application at `/app`, so that I can manage my dog's training progress.

#### Acceptance Criteria

1. WHEN a user navigates to `/app` THEN the system SHALL display the main application overview page
2. WHEN the overview page loads without a selected character THEN the system SHALL redirect to `/app/select-character`
3. WHEN a user completes character selection THEN the system SHALL redirect to `/app` instead of `/`
4. WHEN the main application renders THEN the system SHALL maintain all existing functionality including stats, quests, and activity tracking
5. WHEN a user navigates between app sections THEN the system SHALL preserve the `/app` path prefix

### Requirement 3

**User Story:** As a developer, I want all internal navigation references updated to reflect the new route structure, so that the application functions correctly after restructuring.

#### Acceptance Criteria

1. WHEN character selection completes THEN the system SHALL navigate to `/app` instead of `/`
2. WHEN training mode exits THEN the system SHALL navigate to `/app` instead of `/`
3. WHEN voice interface closes THEN the system SHALL navigate to `/app` instead of `/`
4. WHEN demo login completes THEN the system SHALL navigate to `/app` instead of `/`
5. WHEN the landing page CTA is clicked THEN the system SHALL navigate to `/app` instead of `/`
6. WHEN the overview page checks for character selection THEN the system SHALL redirect to `/app/select-character` instead of `/select-character`

### Requirement 4

**User Story:** As a developer, I want the file-based routing structure to match the new URL paths, so that TanStack Router correctly resolves routes.

#### Acceptance Criteria

1. WHEN the route files are restructured THEN the system SHALL move `src/routes/hackathon.tsx` to `src/routes/index.tsx`
2. WHEN the route files are restructured THEN the system SHALL move `src/routes/index.tsx` to `src/routes/app.index.tsx`
3. WHEN the route files are restructured THEN the system SHALL move all app-related routes to the `app/` subdirectory
4. WHEN TanStack Router generates the route tree THEN the system SHALL correctly map `/` to the landing page
5. WHEN TanStack Router generates the route tree THEN the system SHALL correctly map `/app` to the main application

### Requirement 5

**User Story:** As a user, I want seamless navigation between the landing page and application, so that I can easily move between public and authenticated sections.

#### Acceptance Criteria

1. WHEN a user is on the landing page THEN the system SHALL provide clear CTAs to access the application
2. WHEN a user is in the application THEN the system SHALL maintain consistent navigation patterns
3. WHEN a user manually enters `/hackathon` THEN the system SHALL redirect to `/` with a 301 permanent redirect
4. WHEN navigation occurs THEN the system SHALL preserve scroll position and state as appropriate
5. WHEN the browser back button is used THEN the system SHALL navigate correctly between landing and app sections

### Requirement 6

**User Story:** As a developer, I want to verify that all routes function correctly after restructuring, so that no navigation paths are broken.

#### Acceptance Criteria

1. WHEN the restructuring is complete THEN the system SHALL successfully render the landing page at `/`
2. WHEN the restructuring is complete THEN the system SHALL successfully render the app overview at `/app`
3. WHEN the restructuring is complete THEN the system SHALL successfully render character selection at `/app/select-character`
4. WHEN the restructuring is complete THEN the system SHALL successfully render all quest routes under `/app/quests`
5. WHEN the restructuring is complete THEN the system SHALL successfully render all stat routes under `/app/stats`
6. WHEN the restructuring is complete THEN the system SHALL successfully render the activity feed at `/app/activity`
7. WHEN the restructuring is complete THEN the system SHALL successfully render training mode at `/app/training-mode`
