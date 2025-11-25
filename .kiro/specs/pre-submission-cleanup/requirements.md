# Pre-Submission Cleanup

## Overview
Clean up internal documentation, debug files, and example files before hackathon submission. Keep only production-ready code and user-facing documentation.

## What We're Cleaning

### High Priority - Remove Completely
1. **Debug/Performance Analysis Files (Root)**
   - `OPTIMIZATION_COMPLETE.md`
   - `PERFORMANCE_ANALYSIS.md`
   - `PERFORMANCE_METRICS.md`
   - `.cta.json`

2. **Kiro Internal Documentation**
   - `.kiro/HOOKS_OVERVIEW.md`
   - `.kiro/INNOVATIVE_HOOKS.md`
   - `.kiro/CHEAT_SHEET.md`
   - `.kiro/SETUP_GUIDE.md`

3. **Debug Components & Docs**
   - `src/components/animations/AnimationDebugPanel.tsx`
   - `src/components/animations/OPTIMIZATION_SUMMARY.md`
   - `src/components/animations/TESTING_GUIDE.md`

4. **Example/Template Files**
   - `marketing/tweet-ideas-example.md`
   - `scripts/optimize-images.js`

5. **Deployment Scripts (if not needed)**
   - `set-netlify-env.sh`

### Medium Priority - Review & Keep
1. **Stale Specs** - Keep core specs, remove if not in final product:
   - `.kiro/specs/waitlist-landing-page/` - KEEP (waitlist route exists)
   - `.kiro/specs/email-updates-signup/` - REMOVE (no email signup in app)

2. **Unused Routes** - All routes checked and are used:
   - `/select-character` - Used
   - `/waitlist` - Used
   - `/thanks` - Used
   - `/bumi` - Used

### Low Priority - Verify
1. `.env.example` - KEEP (good practice)
2. `marketing/README.md` and `QUICK_START.md` - KEEP (user-facing)
3. `.kiro/settings/mcp.json` - KEEP (workspace config)
4. All `.kiro/hooks/` - KEEP (showcase for judges)
5. All `.kiro/steering/` - KEEP (development standards)
6. `AGENTS.md` - KEEP (this is the showcase!)

## Success Criteria
- All debug files removed
- All internal Kiro docs removed (except AGENTS.md)
- Stale specs removed
- `.gitignore` verified
- Repo is clean and submission-ready
- No broken imports or references
