# Known Issues & Considerations

## Issues Identified During Implementation

This file documents known issues, problematic scenarios, and edge cases that have been identified during development.

### 1. Settings Change & Daily Progress
- **Issue**: When user changes reminder frequency, does daily progress (waterConsumed) stay the same or reset?
- **Current Implementation**: Progress stays, but progress bar may look different
- **Example**: If user sets 8 reminders and drinks 4, then changes to 10 reminders, they'll have 4/10 (40%)
- **Status**: ✅ Implemented - no reset on settings change
- **Potential Fix**: Add warning message in settings page about impact
- **Priority**: Medium

### 2. Time Wrapping (Sleep After Midnight)
- **Issue**: If user sets sleep time before wake time (e.g., wake 8am, sleep 2am), the system interprets sleep as next day
- **Current Implementation**: Handles via `sleepDate.setDate(sleepDate.getDate() + 1)` when sleep < wake
- **Edge Case**: If actual sleep time crosses midnight (11pm to 2am), next reminder calculation may be off
- **Status**: ✅ Implemented - needs testing
- **Testing Needed**: 
  - Wake 23:00, Sleep 02:00
  - Wake 22:00, Sleep 06:00
- **Priority**: High

### 3. Morning Recalculation
- **Issue**: Next reminder time is calculated based on current time, not when user woke up
- **Current Implementation**: Uses `new Date()` for wake time, which is today's date
- **Problem**: If app loads at 3pm, it calculates intervals from 3pm using today's wake time
- **Status**: ⚠️ Needs fix
- **Fix Required**: Store wake-up timestamp when day starts, or use first load time as reference
- **Priority**: High

### 4. Daily Reset
- **Issue**: App never automatically resets daily progress at midnight or wake time
- **Current Implementation**: User must manually reset or continue from yesterday's count
- **Status**: ❌ Not implemented
- **Needed**: Background task or daily reset check
- **Priority**: High

### 5. Browser Notifications
- **Issue**: Browser notifications for reminders not implemented
- **Current Implementation**: None
- **Status**: ❌ Not implemented
- **Consideration**: Requires user permission, may not work on all platforms
- **Priority**: Low (nice-to-have)

### 6. Performance with Animations
- **Issue**: Wave animation in bottle uses SVG data URL and continuous animation
- **Potential Problem**: On low-end devices or extended usage, may drain battery
- **Current Implementation**: 15s loop animation
- **Status**: ⚠️ May need optimization
- **Optimization Option**: Use CSS-only wave or stop animation when not viewing
- **Priority**: Low (acceptable for personal use)

### 7. Data Loss Risk
- **Issue**: All data stored in localStorage only - no backup
- **Current Implementation**: Single JSON in localStorage
- **Risk**: Browser clear cache = all data lost
- **Status**: ⚠️ Known limitation
- **Future Enhancement**: Add export/import functionality
- **Priority**: Low (personal use)

## Validation Rules Implemented

### ✅ Wake & Sleep Times
- [x] Wake time must be valid time format (HH:MM)
- [x] Sleep time must be valid time format (HH:MM)
- [x] Wake and sleep times cannot be identical
- [x] Handles same-day and next-day sleep times

### ✅ Reminder Frequency
- [x] Must be positive integer (1-20)
- [x] Cannot be 0 or negative
- [x] Upper limit: 20 reminders per day
- [x] Shows helpful interval calculation (minutes between reminders)

### ✅ State Management
- [x] localStorage persistence
- [x] Derived stores for progress, remaining, nextReminderTime
- [x] TypeScript validation

## Testing Checklist

- [ ] Test wake time after sleep time (next-day scenario)
- [ ] Test settings form validation with invalid inputs
- [ ] Test progress calculation at different reminder frequencies
- [ ] Test mobile responsiveness (portrait/landscape)
- [ ] Test localStorage persistence across sessions
- [ ] Test undo functionality with edge cases (empty, full)
- [ ] Test animation performance on older devices

## Future Enhancements (Nice-to-Have)

- [ ] Browser notifications for reminders (requires permissions)
- [ ] Dark mode support
- [ ] i18n integration with existing Paraglide setup (en, es, id)
- [ ] Export/import user data (JSON)
- [ ] History/statistics (weekly/monthly charts)
- [ ] Customizable water intake amounts per reminder
- [ ] Streak tracking
- [ ] Integration with health apps
- [ ] Automatic wake/sleep detection if device supports
