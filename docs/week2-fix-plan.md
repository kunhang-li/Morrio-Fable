# Week 2 — Bug Analysis and Fix Plan

## Overview

During Week 1, I reproduced three known bugs in the Fable Onboarding Editor application. I investigated the frontend components, React hooks, and backend API to identify the root causes.

The goal of my Week 2 analysis was to identify the affected files, plan specific fixes, and decide how to verify the results.

## Bug 1 — Onboarding Skips the Final Prompt

**Affected files:**
- `client/src/components/OnboardingFlow.jsx`
- `client/src/hooks/useStoryProgress.js`
- `client/src/components/PromptCard.jsx`

**Root cause:**

The onboarding flow uses a zero-based index to track the current prompt.

In `OnboardingFlow.jsx`, the original condition was:

```javascript
if (currentStep >= prompts.length - 1) {
  onComplete && onComplete();
  return null;
}
```

For four prompts, the valid indexes are `0, 1, 2, 3`. When `currentStep` reaches `3`, the condition becomes true before the fourth prompt can render.

The `advance()` function in `useStoryProgress.js` manages the step counter, while `PromptCard.jsx` already uses `isLast` to determine when the final prompt has been submitted.

**Fix approach:**

Remove the premature completion condition and use a defensive out-of-range check instead:

```javascript
if (currentStep >= prompts.length) {
  return null;
}
```

The final submission remains responsible for calling `onComplete()`, so onboarding does not finish until the user submits Step 4.

**Testing plan:**

Verify that all four prompts appear in the correct order and that the Story Editor opens only after clicking Finish on Step 4.

## Bug 2 — Story Save Validation Returns HTTP 200

**Affected file:** `server/routes/stories.js`

**Root cause:**

The story creation endpoint validates `title`, but the error branch returns HTTP 200:

```javascript
return res.status(200).json({ error: 'Title is required' });
```

HTTP 200 indicates success even though the request is invalid.

**Fix approach:**

Change the validation response to HTTP 400:

```javascript
return res.status(400).json({ error: 'Title is required' });
```

Keep the existing validation condition and error message unchanged.

**Testing plan:**

Send a POST request without a title and verify that it returns HTTP 400. Also verify that a valid story request continues to return HTTP 201. Add a regression test using Jest and Supertest.

## Bug 3 — Media Timeline Displays Duplicate Entries

**Affected file:** `client/src/components/MediaTimeline.jsx`

**Root cause:**

The `handleUpload()` function first adds a temporary item named `newItem` to the `mediaItems` state.

After the server confirms the upload, the function appends the `saved` item again. This causes one upload to display two cards.

**Fix approach:**

Keep the optimistic upload so users receive immediate visual feedback, but replace the temporary item with the server-confirmed record:

```javascript
setMediaItems(prev => [
  ...prev.filter(item => item.id !== newItem.id),
  saved
]);
```

If the upload fails, remove the temporary item and display an error message. Reuse the existing `uploading` state to prevent repeated submissions.

**Testing plan:**

Upload one image and verify that exactly one card remains after confirmation. Upload a second image and confirm that the timeline contains two cards. Add an end-to-end test using Playwright.

## Conclusion

My approach is to fix each bug independently, verify the behavior after each change, and then run the existing tests to check for regressions.

I also plan to document the changes in Git commits and use a Pull Request for code review.