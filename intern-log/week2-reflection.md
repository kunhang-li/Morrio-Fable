# Week 2 Reflection

During Week 2 of my Morrio Fable internship, I focused on fixing three bugs, improving the onboarding experience, and implementing draft autosave functionality. These tasks helped me develop a better understanding of React state management, Express API validation, SQLite migrations, and automated regression testing.

## Bug 1 — Onboarding Skips the Final Prompt

The first bug was located in `client/src/components/OnboardingFlow.jsx`.

The onboarding component used the condition `currentStep >= prompts.length - 1`, causing the flow to complete before the last prompt could appear.

I corrected the boundary check to `currentStep >= prompts.length`, allowing the final question to remain visible.

I also reviewed the completion handling in `client/src/components/PromptCard.jsx` and the step management in `client/src/hooks/useStoryProgress.js`.

The main anti-pattern I identified was mixing completion logic with rendering conditions. A safer approach is to separate the boundary check from the final submission callback.

This experience taught me to pay closer attention to zero-based indexing and test the final transition of multi-step user interfaces.

## Bug 2 — Incorrect HTTP Status Code

The second bug was in the `POST /api/stories` handler in `server/routes/stories.js`.

The endpoint returned HTTP 200 when the request did not include a valid title. Although an error message was returned, the HTTP status incorrectly indicated success.

I changed the response to HTTP 400 and verified the behavior using Jest and Supertest in `tests/api.test.js`.

The anti-pattern was returning successful status codes for failed validation.

I learned that meaningful HTTP status codes are important for reliable communication between frontend applications and backend APIs.

## Bug 3 — Duplicate Media Timeline Entries

The third bug was located in `client/src/components/MediaTimeline.jsx`, specifically in the `handleUpload()` function.

The frontend initially added an optimistic media item and later appended the server-confirmed item without removing the temporary record.

I corrected the state update so the temporary item could be replaced with the server response.

During code review, I also learned that optimistic updates require defensive handling of missing or conflicting IDs. Without reliable identifiers, filtering temporary records can accidentally affect unrelated entries.

The main anti-pattern was failing to reconcile optimistic frontend state with server-confirmed data.

I used Playwright tests in `e2e/fable.spec.js` to verify that a single upload produces one media card.

## Additional Features — Progress Bar and Draft Autosave

I implemented an onboarding progress bar in `client/src/components/OnboardingFlow.jsx`, using progress information from `client/src/hooks/useStoryProgress.js`.

The progress bar displays completion percentage and provides visual feedback while users answer onboarding prompts.

I also implemented automatic draft saving in `client/src/components/StoryEditor.jsx`.

The autosave workflow checks for unsaved changes periodically, uses input debouncing, and displays saving status messages.

Drafts are persisted through the `PATCH /api/stories/:id/draft` handler in `server/routes/stories.js`.

The SQLite migration logic in `server/db/database.js` adds the `draft_content` column when it does not already exist.

During development, I encountered an HTTP 500 error caused by the missing database column and a `ReferenceError` caused by an undefined variable in the draft-saving route.

I used Chrome DevTools and backend logs to identify these issues.

Another important improvement involved the `saveDraft()` logic in `StoryEditor.jsx`. Initially, autosave required an existing story ID, meaning new users had to manually save once before automatic saving could begin.

I updated the workflow to create a new story automatically when the first draft save occurs.

This taught me that features should be tested from the beginning of the user's workflow, not only after an existing database record is available.

## Testing and Code Quality

I added backend regression tests using Jest and Supertest in `tests/api.test.js`.

I also used Playwright in `e2e/fable.spec.js` to test onboarding completion and media upload behavior.

These tests helped me understand the importance of choosing testing tools based on the application layer being verified.

I also learned that inline code comments should explain why a particular implementation exists, especially around boundary conditions, temporary IDs, and database migrations.

## Conclusion

Overall, Week 2 helped me improve my understanding of full-stack debugging, React state management, API design, database migrations, and regression testing.

The most important anti-patterns I identified were incorrect boundary conditions, misleading HTTP status codes, incomplete optimistic state reconciliation, and assuming that new stories already have database IDs.

In future development, I plan to write regression tests earlier, add meaningful inline comments, verify database migrations more carefully, and create smaller commits that are easier to review.