# Quick Start: Innovative Kiro Hooks

## 🚀 What Makes These Hooks Innovative?

Most hooks focus on code quality (linting, testing, docs). These hooks go beyond:

1. **Marketing Content Generator** - Turns completed tasks into tweet ideas
2. **Performance Budget Enforcer** - Catches mobile performance issues
3. **Accessibility Audit** - Ensures inclusive design
4. **Demo Script Generator** - Creates presentation scripts
5. **Cross-Reference Validator** - Validates schema ↔ queries ↔ components
6. **Changelog Generator** - Auto-generates user-facing changelogs

## 🎯 Why These Are Useful for Kiroween

### For Judges
- **Marketing hook** shows you're thinking about launch
- **Demo script hook** shows presentation preparation
- **Changelog hook** shows user-focused development

### For Development
- **Performance hook** ensures mobile-first quality
- **Accessibility hook** ensures inclusive design
- **Cross-reference hook** catches integration bugs

### For Collaboration
- **Changelog** keeps partners informed
- **Marketing content** helps with social media
- **Demo script** aligns on presentation

## 📋 How to Use

### 1. Marketing Content Generator

**When to use:** After completing major features

```bash
# Complete some tasks in .kiro/specs/training-mode/tasks.md
# Mark them [x]
# Save the file
# Check marketing/tweet-ideas.md
```

**What you get:**
- 3 tweet options per feature
- Demo talking points
- Technical highlights
- Ready to post (just add screenshots)

### 2. Performance Budget Enforcer

**When to use:** Always active (saves on every component)

**What it catches:**
- Heavy animations
- Expensive re-renders
- Unoptimized images
- Heavy Convex subscriptions
- Large bundle imports

**Example alert:**
```
⚡ Performance Check: TrainingModeInterface

Potential issue: Multiple useEffect hooks causing re-renders
Impact: Voice recording may lag on older phones

Suggested fix:
Combine effects or use useCallback for stable references
```

### 3. Accessibility Audit

**When to use:** Always active (saves on every component)

**What it catches:**
- Missing ARIA labels
- Poor color contrast
- No keyboard navigation
- Images without alt text
- Small touch targets

**Example alert:**
```
♿ Accessibility Check: StatOrb

Issue: Button has onClick but no aria-label
WCAG Level: A

Suggested fix:
<button onClick={...} aria-label="View Physical stat details">
```

### 4. Demo Script Generator

**When to use:** Before presenting to judges

```bash
# Open Command Palette (Cmd+Shift+P)
# Type "Kiro: Trigger Hook Manually"
# Select "Demo Script Generator"
# Review marketing/demo-script.md
```

**What you get:**
- 5-minute presentation outline
- Feature demo sequence
- Technical deep dive points
- Kiro integration showcase
- Demo checklist

### 5. Cross-Reference Validator

**When to use:** Always active (saves on schema/queries/mutations)

**What it catches:**
- Queries referencing non-existent tables
- Mutations using wrong field types
- Missing indexes for queries
- Orphaned references
- Naming inconsistencies

**Example alert:**
```
🔗 Cross-Reference Check

Inconsistency detected:
Query 'getDogStats' uses index 'by_dog_and_stat' 
but schema only defines 'by_dog'

Suggested fix:
Add index to schema or update query to use existing index
```

### 6. Changelog Generator

**When to use:** Automatic (when tasks complete)

**What you get:**
```markdown
## Nov 15, 2024 - Training Mode

### ✨ Features
- Added voice-activated training mode with wake word detection
- Implemented real-time activity feed with partner sync

### ⚡ Performance
- Optimized stat orb animations for mobile

### 🔧 Technical
- Refactored Convex queries for better caching
```

## 🎨 Customization Ideas

### Add Your Own Hooks

**Social Media Scheduler:**
- Trigger: Manual
- Action: Generate week of social posts
- Output: `marketing/social-calendar.md`

**Competitor Analysis:**
- Trigger: Manual
- Action: Compare features with other dog training apps
- Output: `marketing/competitive-analysis.md`

**User Story Generator:**
- Trigger: On spec creation
- Action: Generate user stories from requirements
- Output: `[spec]/user-stories.md`

**API Documentation:**
- Trigger: On Convex function save
- Action: Generate API docs with examples
- Output: `docs/api-reference.md`

**Deployment Checklist:**
- Trigger: Manual
- Action: Generate pre-launch checklist
- Output: `deployment/checklist.md`

## 💡 Pro Tips

1. **Combine hooks** - Marketing + Changelog work great together
2. **Customize prompts** - Edit `.kiro.hook` files to match your voice
3. **Review before committing** - Auto-generated content needs human touch
4. **Disable when not needed** - Toggle hooks off during deep work
5. **Share with team** - Commit hooks so everyone benefits

## 🏆 For Kiroween Judges

These hooks demonstrate:
- **Creative automation** beyond typical dev tasks
- **Product thinking** (marketing, accessibility, performance)
- **Presentation prep** (demo scripts, changelogs)
- **Quality assurance** (cross-references, budgets, audits)
- **Team collaboration** (shared standards, documentation)

This is how Kiro becomes a true development partner, not just a code generator.
