# Implementation Plan

- [x] 1. Update development-guidelines.md
  - [x] 1.1 Fix file structure paths
    - Change `app/routes/*.tsx` to `src/routes/*.tsx`
    - Change `app/components/*.tsx` to `src/components/*.tsx`
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Update database schema section
    - Change "8 tables" to "18 tables"
    - List all 18 current tables
    - _Requirements: 2.1, 2.2_
  - [x] 1.3 Update screen requirements section
    - Expand from 7 screens to include all current routes
    - Add: Training Mode, Waitlist, Hackathon Landing, Items/Cosmetics
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 1.4 Update UI/UX requirements section
    - Remove "black and white only" restriction
    - Add RPG theme with dynamic backgrounds
    - Mention cosmetic transformations and XP animations
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Update structure.md
  - [x] 2.1 Fix directory tree to reflect src/ structure
    - Update root structure to show `src/` instead of `app/`
    - Add missing folders: hooks/, lib/
    - _Requirements: 5.1_
  - [x] 2.2 Update component organization
    - Document subfolders: dog/, layout/, training/, animations/, mood/
    - _Requirements: 5.2_
  - [x] 2.3 Fix import pattern examples
    - Update relative paths to use src/ based structure
    - _Requirements: 5.3_

- [x] 3. Update tech.md
  - [x] 3.1 Update AI services section
    - Add Claude for activity parsing alongside GPT-4
    - _Requirements: 6.1_
  - [x] 3.2 Update deployment section
    - Specify Netlify as frontend host
    - _Requirements: 6.2_
  - [x] 3.3 Clarify voice features
    - Document both Web Speech API (primary) and OpenAI Realtime API paths
    - _Requirements: 6.3_

- [x] 4. Verify product.md accuracy
  - [x] 4.1 Review product.md against current features
    - Confirm feature list matches implemented functionality
    - Add any missing features (cosmetics, waitlist, VR HUD)
    - _Requirements: All_

- [x] 5. Final verification
  - [x] 5.1 Run through verification checklist
    - Confirm all paths reference src/ not app/
    - Confirm 18 tables documented
    - Confirm all screens listed
    - Confirm RPG theme mentioned
    - Confirm Claude and Netlify mentioned
    - _Requirements: All_
