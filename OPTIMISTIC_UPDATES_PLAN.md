# Optimistic Updates Improvement Plan

## Problem Summary

The current implementation has race conditions with optimistic updates:

1. **Issue**: When creating a note, the POST request is async but there's no blocking mechanism to prevent subsequent operations (color changes, title edits) from firing PATCH requests before the note exists on the server.

2. **Symptom**: In tests (and potentially production), color/title updates can fail with 404 errors because the PATCH request reaches the server before the POST completes.

3. **Current Workaround**: Tests use `page.waitForResponse()` to explicitly wait for each API call to complete, but users shouldn't have to wait - the UI should handle this gracefully.

## Location of Issue

- **File**: [src/routes/my/+layout.svelte:25-49](src/routes/my/+layout.svelte#L25-L49)
- **Function**: `handleCreateNote()`
- **Flow**:
  1. Line 26: `boardState.createNewNote()` - optimistic creation
  2. Lines 27-30: Navigate to note editor
  3. Line 36-39: POST /api/notes (async, no blocking)
  4. User can interact immediately → triggers PATCH before POST completes

## Proposed Solutions

### Option 1: Quick Fix - Pending Operations Tracker (Recommended First Step)

**Effort**: ~2 hours
**Risk**: Low
**Benefits**:

- Prevents race conditions
- Improves UX with loading states
- Minimal code changes

**Implementation**:

1. **Update boardState** ([src/lib/state/boardState.svelte](src/lib/state/boardState.svelte)):

   ```typescript
   class BoardState {
     pendingOperations = $state<Set<string>>(new Set());

     createNewNote() {
       const note = /* ... */;
       this.pendingOperations.add(note.id);
       return note;
     }

     markOperationComplete(noteId: string) {
       this.pendingOperations.delete(noteId);
     }

     isNotePending(noteId: string): boolean {
       return this.pendingOperations.has(noteId);
     }
   }
   ```

2. **Update handleCreateNote** ([src/routes/my/+layout.svelte:25](src/routes/my/+layout.svelte#L25)):

   ```typescript
   async function handleCreateNote() {
     const newNote = boardState.createNewNote();
     goto(`/my/board?id=${newNote.id}`, ...);

     const resp = await tryFetch<Note>('/api/notes', {
       method: 'POST',
       body: JSON.stringify(newNote)
     });

     boardState.markOperationComplete(newNote.id);

     if (resp.type === 'error') {
       boardState.deleteNoteById(newNote.id);
       // ... error handling
     }
   }
   ```

3. **Update NoteEditor UI** ([src/components/NoteEditor.svelte](src/components/NoteEditor.svelte)):
   - Disable color picker, title input, save button while `boardState.isNotePending(note.id)`
   - Show "Saving..." spinner/message
   - OR queue operations until creation completes

4. **Consider**: Queue operations instead of blocking
   - Store pending edits
   - Apply them after POST completes
   - Better UX (no disabled inputs)

### Option 2: Use a Proper State Management Library

**Effort**: ~1-2 weeks
**Risk**: Medium (larger refactor)
**Benefits**:

- Professional-grade optimistic updates
- Request deduplication
- Automatic retry logic
- Better error handling

**Options to Evaluate**:

1. **TanStack Query** (formerly React Query)
   - Has Svelte adapter: `@tanstack/svelte-query`
   - Battle-tested
   - Excellent docs
   - Handles mutations, caching, retries

2. **SWR for Svelte**
   - `swrev` - SWR for Svelte
   - Simpler API than TanStack
   - Good for read-heavy apps

3. **Custom solution with Svelte stores**
   - Full control
   - More work to implement
   - Need to handle edge cases

**Recommended**: Start with TanStack Query

- Most robust
- Wide adoption
- Handles optimistic updates out of the box

### Option 3: Backend Change - Accept Idempotent Operations

**Effort**: ~4 hours
**Risk**: Low-Medium
**Benefits**:

- Eliminates race condition at source
- More robust architecture

**Implementation**:

1. Allow PATCH/DELETE before POST completes
2. Queue operations in backend if note doesn't exist yet
3. Apply queued operations after POST
4. Return proper status codes (202 Accepted?)

**Tradeoffs**:

- More complex backend logic
- Harder to reason about
- May not be worth it vs frontend solutions

## Recommended Approach

**Phase 1**: Quick Fix (This Sprint)

- Implement pending operations tracker
- Add loading states to UI
- Prevents race conditions immediately
- Low risk, high value

**Phase 2**: Evaluate TanStack Query (Next Sprint)

- Prototype with one feature (notes CRUD)
- Compare complexity vs benefits
- Decide if worth full migration

**Phase 3**: If not using library, improve custom solution

- Add request queueing
- Better error recovery
- Retry logic

## Testing Strategy

After implementing any solution:

1. **Remove `waitForResponse()` from Playwright tests**
   - Tests should work without explicit waits
   - UI should handle synchronization

2. **Add specific optimistic update tests**
   - Create note → immediately edit title
   - Create note → immediately change color
   - Update note → immediately delete
   - Rapid successive updates

3. **Test error scenarios**
   - Network failure during optimistic update
   - Server rejects optimistic change
   - Concurrent edits from multiple tabs

## Related Files to Review

- [src/lib/state/boardState.svelte](src/lib/state/boardState.svelte) - State management
- [src/components/NoteEditor.svelte](src/components/NoteEditor.svelte) - Note editing UI
- [src/components/Board.svelte](src/components/Board.svelte) - Board component
- [src/routes/my/+layout.svelte](src/routes/my/+layout.svelte) - Layout with handleCreateNote
- [src/routes/my/board/+page.svelte](src/routes/my/board/+page.svelte) - Board page with handlers
- [tests/noteManagement.test.ts](tests/noteManagement.test.ts) - Current workaround with waitForResponse

## Success Criteria

✅ No race condition errors in tests or production
✅ Smooth UX - no blocking/disabled inputs (if using queue approach)
✅ Clear feedback when operations are pending
✅ Proper error handling and rollback
✅ Tests pass without explicit `waitForResponse()` calls

## Notes

- Current test fixes are good and necessary - they expose the real problem
- The production code needs fixing, not the tests
- Optimistic updates are hard to get right - using a library is often worth it
- Consider how this scales: what about collaborative editing in the future?
