## Week 2 reflection

During Week 2, I learned that code comments are most useful when they explain why a particular implementation is necessary rather than simply describing what each line does.

The following examples document important bug fixes and implementation decisions.

### Example 1 — Onboarding Boundary Check

**File:** `client/src/components/OnboardingFlow.jsx`

```jsx
// Prevent premature completion caused by zero-based indexing.
// The final prompt must remain visible until the user submits it.
if (currentStep >= prompts.length) {
  return null;
}
```

The original condition used `prompts.length - 1`, which incorrectly treated the final valid index as the end of the onboarding process.

This fix separates the rendering boundary from the completion event.

I learned that boundary conditions should be checked carefully, especially when using zero-based indexes in multi-step interfaces.

### Example 2 — API Validation and HTTP Status Codes

**File:** `server/routes/stories.js`

```javascript
// A missing title is a client validation error.
// Return HTTP 400 so the frontend can distinguish it from success.
if (!title || title.trim() === '') {
  return res.status(400).json({
    error: 'Title is required'
  });
}
```

The original endpoint returned HTTP 200 when a title was missing.

The corrected implementation returns HTTP 400, allowing frontend code and regression tests to identify invalid requests reliably.

This reinforced the importance of using meaningful HTTP status codes.

### Example 3 — Media Timeline Optimistic Updates

**File:** `client/src/components/MediaTimeline.jsx`

```jsx
// Replace the matching optimistic upload with the confirmed item.
// Guard against missing temporary IDs to preserve unrelated entries.
setMediaItems(prev => [
  ...prev.filter(item =>
    newItem.id == null || item.id !== newItem.id
  ),
  saved
]);
```

The original implementation appended the server-confirmed media item without removing the optimistic placeholder, creating duplicate entries.

The updated logic handles missing IDs defensively and avoids removing unrelated records when `newItem.id` is null or undefined.

I learned that optimistic UI updates require careful reconciliation with server responses.

### Example 4 — Autosave Debounce and Periodic Saving

**File:** `client/src/components/StoryEditor.jsx`

```javascript
const AUTOSAVE_INTERVAL = 30000;
const DEBOUNCE_DELAY = 500;

// Reset the debounce timer whenever the user edits the content.
// A draft becomes eligible for saving after 500ms without input.
clearTimeout(debounceRef.current);

debounceRef.current = setTimeout(() => {
  settledRef.current = true;
}, DEBOUNCE_DELAY);
```

The debounce delay is **500 milliseconds (0.5 seconds)**.

This prevents an autosave request from being triggered while the user is continuously typing.

I also implemented a periodic autosave check:

```javascript
// Check for unsaved changes every 30 seconds.
// Skip saving when the content is unchanged or still being edited.
useEffect(() => {
  const interval = setInterval(() => {
    saveDraft();
  }, AUTOSAVE_INTERVAL);

  return () => clearInterval(interval);
}, [saveDraft]);
```

The autosave interval is **30,000 milliseconds (30 seconds)**.

These two mechanisms serve different purposes:

- **500ms debounce:** Determines whether the user has stopped typing long enough for the draft to become eligible for saving.
- **30-second interval:** Determines when the application checks whether eligible unsaved changes should be persisted.

A draft is not necessarily saved immediately after 500ms. Instead, it becomes eligible for the next periodic save check.

The implementation also compares current content with the last successfully saved version to avoid unnecessary requests.

This helped me understand how debouncing, periodic scheduling, and change detection work together to reduce redundant API traffic.

### Example 5 — SQLite Migration Guard

**File:** `server/db/database.js`

```javascript
// Inspect the existing schema before applying the migration.
// This prevents duplicate-column errors on subsequent startups.
const columns = db.prepare(
  'PRAGMA table_info(stories)'
).all();

const hasDraftColumn = columns.some(
  column => column.name === 'draft_content'
);

// Add draft support only when the column does not already exist.
// Existing stories remain intact.
if (!hasDraftColumn) {
  db.exec(
    'ALTER TABLE stories ADD COLUMN draft_content TEXT'
  );
}
```

This migration uses `PRAGMA table_info(stories)` to inspect the existing columns.

The guard has two possible outcomes:

1. If `draft_content` does not exist, the application executes `ALTER TABLE` once to add the column.
2. If `draft_content` already exists, the application skips the migration.

This makes the migration **idempotent**, meaning repeated execution does not attempt to add the same column again.

The migration does not delete the existing `stories` table or recreate existing records.

I learned that schema migrations must account for both fresh installations and databases that already contain user data.

## Final Reflection on Implementation Choices

These examples helped me recognize several important software engineering patterns.

First, boundary checks and validation rules should explicitly represent their intended behavior. Small conditions can cause major issues when edge cases are overlooked.

Second, optimistic UI updates must carefully distinguish temporary records from server-confirmed data.

Third, performance-related decisions should use clear, measurable parameters. In the autosave implementation, the 500ms debounce and 30-second interval have different responsibilities and work together to reduce unnecessary requests.

Finally, database migrations should be safe to execute repeatedly. The `draft_content` migration guard protects existing databases and avoids duplicate-column errors.

Going forward, I will document implementation decisions directly in the source code, use automated tests to verify edge cases, and explain the reasoning behind timing values, validation rules, and database changes.