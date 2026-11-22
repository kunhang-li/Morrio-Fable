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

**After:**
```jsx
setMediaItems(prev => [
  ...prev.filter(item => item.id !== newItem.id),
  saved
]);
```

The server-confirmed record replaces the temporary item, preventing duplicate media cards.

### Regression Testing

- Jest and Supertest validate the backend story API.
- Playwright verifies that all onboarding prompts appear.
- Playwright verifies that one media upload creates only one card.