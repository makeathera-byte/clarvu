# Technical Debt

## Known Issues & Limitations

### 1. Database Types
- **Issue**: No generated TypeScript types from Supabase schema
- **Impact**: Manual type definitions may drift from actual schema
- **Solution**: Generate types using `supabase gen types typescript`
- **Priority**: Medium

### 2. Reminder System
- **Issue**: ActivityMonitorWrapper and ReminderClient use window global for communication
- **Impact**: Not ideal React pattern, but functional
- **Solution**: Consider using Context API or event emitter pattern
- **Priority**: Low

### 3. Context Detection
- **Issue**: Lightweight detection engine may have false positives
- **Impact**: Suggestions may not always be accurate
- **Solution**: Improve pattern matching or consider ML-based detection
- **Priority**: Low

### 4. Error Handling
- **Issue**: Some API routes lack comprehensive error handling
- **Impact**: Generic error messages may not be user-friendly
- **Solution**: Add more specific error types and messages
- **Priority**: Medium

### 5. Performance
- **Issue**: No caching for frequently accessed data (settings, categories)
- **Impact**: Extra database queries on each page load
- **Solution**: Implement React Query or SWR for client-side caching
- **Priority**: Low

### 6. Notification Permissions
- **Issue**: Browser notifications require user permission
- **Impact**: Reminders won't work if denied
- **Solution**: Already handled with inline banner fallback
- **Priority**: None (handled)

### 7. Type Safety
- **Issue**: Some `any` types still exist in codebase
- **Impact**: Reduced type safety
- **Solution**: Gradually replace with proper types
- **Priority**: Low

### 8. Edge Functions
- **Issue**: Daily/weekly/monthly summaries run on cron, no real-time updates
- **Impact**: Users may not see summaries immediately
- **Solution**: Consider adding manual trigger option
- **Priority**: Low

## Hacks & Workarounds

1. **Window Global for Activity Monitoring**
   - Used to connect ActivityMonitorWrapper and ReminderClient
   - Works but not ideal React pattern
   - See Reminder System issue above

2. **Type Casting in Pattern Detection**
   - Some pattern detection functions cast types to `any[]`
   - Due to Supabase response structure variations
   - Should be resolved with generated types

3. **Environment Variable Suppression**
   - Using `NODE_OPTIONS=--no-deprecation` to suppress warnings
   - Warnings come from dependencies, not our code
   - Acceptable workaround until dependencies update

## Optimization Opportunities

1. **Database Queries**
   - Batch queries where possible
   - Add indexes for frequently queried columns
   - Consider materialized views for aggregations

2. **Bundle Size**
   - Review and optimize imports
   - Consider code splitting for dashboard tabs
   - Lazy load heavy components

3. **API Routes**
   - Add rate limiting
   - Implement request caching where appropriate
   - Add request/response logging for debugging

## Future Enhancements

1. **Real-time Updates**
   - Add Supabase Realtime subscriptions for live updates
   - WebSocket connections for collaborative features

2. **Offline Support**
   - Service worker for offline functionality
   - Local storage for pending logs

3. **Advanced Analytics**
   - More sophisticated pattern detection
   - Predictive insights using ML/AI
   - Export data functionality

4. **Mobile App**
   - React Native version
   - Native notifications
   - Background activity tracking

---

**Last Updated**: Mark 10 Refactor Pass  
**Status**: Active monitoring

