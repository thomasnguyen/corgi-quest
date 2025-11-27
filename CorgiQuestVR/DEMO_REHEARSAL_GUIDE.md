# VR API Integration - Demo Rehearsal Guide

## Demo Overview

**Duration**: 15-25 seconds  
**Scenario**: "Leave It" impulse control training with 5-rep goal  
**Objective**: Showcase real-time sync between VR and web app

## Pre-Demo Setup

### Equipment Checklist
- [ ] Apple Vision Pro (fully charged)
- [ ] Laptop/phone with web app open (https://corgi-quest.netlify.app)
- [ ] Both devices on same network (for optimal performance)
- [ ] VR app installed and tested
- [ ] Web app logged in to demo account
- [ ] Same dog selected on both devices

### Environment Setup
- [ ] Quiet space for voice commands
- [ ] Good lighting for VR tracking
- [ ] Clear area for movement (if needed)
- [ ] Backup plan prepared (mock data fallback)

### Pre-Flight Checks
1. Launch VR app - verify floating panels appear
2. Check web app - verify dog stats are visible
3. Test voice recognition - say "Hello" to confirm mic works
4. Verify both apps show same dog and stats

## Demo Script (15-25 seconds)

### Phase 1: Minimal UI (0-2s)
**VR View**: Floating panels with current stats  
**Web View**: Overview screen with dog stats  
**Narration**: "Here's Bumi's training dashboard in VR - his current stats, goals, and recent activities."

**Key Points**:
- Point out the 4 stat orbs (PHY, INT, IMP, SOC)
- Show today's goals (physical/mental progress)
- Highlight current streak

### Phase 2: Start Training (2-5s)
**Voice Command**: "Start training Leave It"  
**VR View**: Training mode activates, rep counter appears  
**Web View**: Activity feed shows "Training in VR" presence indicator  
**Narration**: "I'll start a training session with a voice command."

**Key Points**:
- Hands-free voice activation
- No buttons or controllers needed
- Real-time presence sync

### Phase 3: Mark Reps (5-15s)
**Voice Commands**: "Mark rep" × 5 (say each ~2 seconds apart)  
**VR View**: Rep counter increments: 1/5, 2/5, 3/5, 4/5, 5/5  
**Web View**: No immediate change (updates after session ends)  
**Narration**: "As I complete each rep, I mark it with my voice."

**Key Points**:
- Natural voice interaction
- Visual feedback in VR
- Simulates real training workflow

**Timing Tips**:
- Pause 2 seconds between each "Mark rep"
- Total time: ~10 seconds for 5 reps
- Don't rush - let the counter update

### Phase 4: Session Summary (15-20s)
**Voice Command**: "End session, completed 5 Leave It reps"  
**VR View**: Session summary appears with XP breakdown  
**Web View**: Activity feed updates with new entry  
**Narration**: "When I finish, I describe what we did, and AI parses it into structured data."

**Key Points**:
- Natural language processing
- AI determines XP allocation
- Automatic stat updates

**Expected XP Breakdown**:
- IMP (Impulse Control): +50 XP (primary stat)
- INT (Intelligence): +20 XP (secondary stat)

### Phase 5: Stats Update (20-23s)
**VR View**: Polls API, shows +IMP XP animation  
**Web View**: Stats update in real-time via Convex  
**Narration**: "Both apps sync instantly - the VR headset polls every 3 seconds, while the web app gets real-time updates."

**Key Points**:
- VR: 3-second polling
- Web: Instant Convex subscriptions
- Max 3-second delay between devices

**Visual Cues**:
- IMP stat orb glows/pulses
- XP bar fills up
- Level badge updates (if level-up occurs)

### Phase 6: Return to Minimal (23-25s)
**VR View**: Training mode exits, updated stats visible  
**Web View**: Activity feed shows completed session  
**Narration**: "And we're back to the minimal UI, with all progress saved and synced."

**Key Points**:
- Seamless transition
- Persistent data
- Ready for next session

## Timing Breakdown

| Phase | Duration | Cumulative | Key Action |
|-------|----------|------------|------------|
| 1. Minimal UI | 2s | 0-2s | Show floating panels |
| 2. Start Training | 3s | 2-5s | Voice: "Start training" |
| 3. Mark Reps | 10s | 5-15s | Voice: "Mark rep" × 5 |
| 4. Session Summary | 5s | 15-20s | Voice: "End session..." |
| 5. Stats Update | 3s | 20-23s | Show XP animation |
| 6. Return to Minimal | 2s | 23-25s | Show updated stats |

**Total**: 25 seconds (can be compressed to 15s if needed)

## Backup Plan (If API Fails)

### Scenario: API returns 404 or times out

**VR App Behavior**:
- Automatically falls back to mock data
- Displays warning: "Using offline mode"
- Demo continues seamlessly

**Narration Adjustment**:
"The VR app includes offline mode for unreliable networks - it falls back to mock data automatically, so training never stops."

**Key Points**:
- Graceful degradation
- User experience preserved
- Highlight resilience

### Scenario: Voice recognition fails

**Fallback**:
- Use hand gestures (if implemented)
- Or manually trigger actions via UI buttons
- Or restart VR app and try again

**Narration Adjustment**:
"Voice recognition works best in quiet environments - for the demo, I can also use manual controls."

## Real-Time Sync Verification

### Before Demo
1. Open web app on laptop
2. Position laptop screen visible to audience
3. Launch VR app
4. Verify both show same stats

### During Demo
**Watch for**:
- Activity feed updates on web app (Phase 4)
- Stat changes on both devices (Phase 5)
- Presence indicator on web app (Phase 2)

**If sync fails**:
- Mention "3-second polling interval"
- Wait a few more seconds
- Highlight that web app updates instantly via Convex

### After Demo
- Show activity feed on web app
- Point out XP breakdown matches VR
- Highlight timestamp synchronization

## Talking Points

### Technical Highlights
1. **Voice-First Design**: Hands-free training logging
2. **AI Parsing**: Natural language → structured data
3. **Real-Time Sync**: VR polling + Convex subscriptions
4. **Graceful Degradation**: Automatic fallback to mock data
5. **Cross-Platform**: visionOS + Web + Mobile

### Product Benefits
1. **Couples Training**: Both partners see progress instantly
2. **Consistency**: Gamification keeps training fun
3. **Hands-Free**: Perfect for active training sessions
4. **Data-Driven**: Track progress over time
5. **Reactive Dog Support**: Designed for real-world challenges

### Kiro Integration
1. **Spec-Driven Development**: Requirements → Design → Tasks
2. **Agent Hooks**: Automated documentation and testing
3. **Steering Files**: Consistent code patterns
4. **AI Assistance**: Accelerated development

## Practice Checklist

- [ ] Run through demo 3 times
- [ ] Time each phase
- [ ] Practice voice commands clearly
- [ ] Test backup plan (mock data fallback)
- [ ] Verify web app sync
- [ ] Prepare for Q&A
- [ ] Have demo script memorized
- [ ] Test in demo environment

## Common Issues & Solutions

### Issue: Voice commands not recognized
**Solution**: Speak clearly, pause between commands, check mic permissions

### Issue: VR app crashes
**Solution**: Restart app, verify iOS version, check memory usage

### Issue: Web app not updating
**Solution**: Refresh page, check Convex connection, verify same dog selected

### Issue: API returns 404
**Solution**: Use mock data fallback, mention "offline mode" feature

### Issue: Timing too slow
**Solution**: Reduce pauses between reps, skip narration for some phases

### Issue: Timing too fast
**Solution**: Add more narration, show more details in each phase

## Post-Demo Q&A Prep

### Expected Questions

**Q: How does the AI parsing work?**  
A: We use OpenAI GPT-4 to extract activity type, duration, and context from natural language. It determines which stats get XP based on the activity.

**Q: What if the network is slow?**  
A: The VR app polls every 3 seconds, so there's a max 3-second delay. The web app uses Convex for instant updates. Both have offline fallbacks.

**Q: Can you train multiple dogs?**  
A: Yes! The API supports multi-dog households. You can switch between dogs in both apps.

**Q: What about privacy/security?**  
A: For the demo, we're using open endpoints. Production would add API key authentication and user session tokens.

**Q: How long did this take to build?**  
A: The VR integration took about 2 days with Kiro's help - specs, design, implementation, and testing.

**Q: What's next for Corgi Quest?**  
A: We're adding more training modes, AI-generated cosmetics, and deeper analytics. The VR integration opens up new possibilities for immersive training.

## Success Criteria

- [ ] Demo completes in 15-25 seconds
- [ ] All voice commands recognized
- [ ] Stats update on both devices
- [ ] No crashes or errors
- [ ] Audience understands the value proposition
- [ ] Technical implementation is clear
- [ ] Kiro integration is highlighted

## Final Notes

- **Stay calm**: If something fails, use the backup plan
- **Be enthusiastic**: Show passion for the product
- **Engage audience**: Make eye contact, ask questions
- **Highlight Kiro**: Mention how Kiro accelerated development
- **Have fun**: This is a cool demo - enjoy it!

