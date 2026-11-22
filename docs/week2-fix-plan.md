## Bug Fixes — Before and After

### Bug 1: Onboarding Skips Final Prompt

**Root cause:** The onboarding completion condition triggered when the current step reached the last valid prompt index, preventing the final prompt from appearing.

**Before:**

```jsx
if (currentStep >= prompts.length - 1) {
  onComplete && onComplete();
  return null;
}
```

**After:**

```jsx
if (currentStep >= prompts.length) {
  return null;
}
```

The final prompt is now displayed, and completion occurs after the user submits it.

**Additional verification:**

The Playwright regression test verifies that the Story Editor remains hidden before the final prompt is submitted and appears afterward.

```javascript
await expect(
  page.getByRole('heading', { name: 'Story Editor' })
).not.toBeVisible();

await page.getByRole('button', {
  name: 'Finish',
  exact: true
}).click();

await expect(
  page.getByRole('heading', { name: 'Story Editor' })
).toBeVisible();
```

This verifies the observable effect of onboarding completion.

### Bug 2: Missing Title Returns HTTP 200

**Root cause:** The story creation endpoint returned a successful HTTP status for invalid input.

**Before:**

```javascript
return res.status(200).json({ error: 'Title is required' });
```

**After:**

```javascript
return res.status(400).json({ error: 'Title is required' });
```

The API now correctly returns HTTP 400 when the story title is missing.

### Bug 3: Duplicate Media Timeline Entries

**Root cause:** The application added an optimistic media item and later appended the server-confirmed record without removing the temporary item.

**Before:**

```jsx
setMediaItems(prev => [...prev, saved]);
```

**After — Initial Fix:**

```jsx
setMediaItems(prev => [
  ...prev.filter(item => item.id !== newItem.id),
  saved
]);
```

The initial fix replaced the temporary media item with the server-confirmed record.

However, the code review identified a remaining edge case: if `newItem.id` was undefined, other entries with undefined IDs could also be removed unintentionally.

**After — Null-ID Guard:**

```jsx
setMediaItems(prev => [
  ...prev.filter(item =>
    newItem.id == null || item.id !== newItem.id
  ),
  saved
]);
```

This guard prevents the filter from accidentally deleting unrelated media items when the temporary ID is missing.

For reliable optimistic replacement, temporary upload items should also be assigned unique identifiers.

### Additional Fix: Draft Autosave for New Stories

**Root cause:** The original autosave implementation required an existing `storyId`. New stories did not have an ID until the user manually clicked Save, preventing automatic draft saving during the initial editing session.

**Before:**

```javascript
if (!storyId || savingRef.current) return;
```

This condition prevented autosave from running for new stories.

**After:**

The autosave flow now creates a story automatically when no `storyId` exists.

```javascript
let id = storyIdRef.current;

if (!id) {
  const createRes = await fetch('/api/stories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': String(userId)
    },
    body: JSON.stringify({
      title: snapshot.title.trim() || 'Untitled Story',
      content: ''
    })
  });

  if (!createRes.ok) {
    throw new Error('Failed to create story');
  }

  const created = await createRes.json();
  id = created.id;

  storyIdRef.current = id;
}
```

After creating the story, the application saves the draft through:

```javascript
await fetch(`/api/stories/${id}/draft`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': String(userId)
  },
  body: JSON.stringify({
    draft_content: snapshot.content,
    title: snapshot.title.trim() || 'Untitled Story'
  })
});
```

**Autosave behavior:**

- Automatically creates a story if no ID exists.
- Checks for unsaved changes every 30 seconds.
- Uses a 500ms debounce to avoid saving during continuous typing.
- Skips unnecessary requests when content has not changed.
- Displays `Saving...`, `Saved just now`, or `Save failed — click to retry`.
- Preserves the generated story ID to avoid duplicate creation when retrying.
- Persists draft content in SQLite using the `draft_content` column.

The manual Save button remains available for users who want to save immediately.

### Regression Testing

**Jest and Supertest — Backend API**

The API tests validate:

- Story creation with valid data returns HTTP 201.
- Missing story titles return HTTP 400.
- Missing authentication returns HTTP 401.
- Draft PATCH requests return HTTP 200 when successful.
- Invalid draft requests return HTTP 400.
- Nonexistent stories return HTTP 404.
- Draft content persists in SQLite.

**Playwright — Frontend E2E**

The end-to-end tests verify:

- All onboarding prompts appear in the correct order.
- Story Editor remains hidden until final prompt submission.
- Story Editor appears after the final prompt is submitted.
- One media upload produces one media card.

**MediaTimeline — Null-ID Unit Test**

Additional unit-level coverage should verify that the optimistic media filter preserves existing records when the temporary upload ID is missing.

Example cases:

```javascript
const existingItems = [
  { id: undefined, url: '/existing.png' },
  { id: 10, url: '/other.png' }
];

const newItem = { id: undefined };
const saved = { id: 11, url: '/uploaded.png' };

const result = [
  ...existingItems.filter(item =>
    newItem.id == null || item.id !== newItem.id
  ),
  saved
];

expect(result).toEqual([
  { id: undefined, url: '/existing.png' },
  { id: 10, url: '/other.png' },
  { id: 11, url: '/uploaded.png' }
]);
```

This checks the null-ID guard independently of the full browser upload workflow.

A second test should verify that a valid temporary ID removes exactly the matching placeholder while preserving unrelated entries.

**Test Commands**

```bash
npm test
npx playwright test
```

### Code Review Feedback Addressed

**1. Missing-ID handling in MediaTimeline**

Added a defensive guard to prevent unintended removal of unrelated media entries.

**2. Onboarding completion testing**

Added Playwright assertions verifying that the Story Editor appears only after the final prompt is submitted.

**3. Draft autosave for new stories**

Updated the autosave workflow to automatically create a story and persist its draft without requiring an initial manual Save.

**4. Additional unit test coverage**

Identified the missing-ID filter as a separate unit-test case, supplementing the existing Playwright media upload regression test.

### Conclusion

These changes improve the reliability of onboarding, story validation, media uploads, and draft autosaving.

The implementation addresses the original bug root causes and strengthens regression coverage across the frontend, backend, and database layers.