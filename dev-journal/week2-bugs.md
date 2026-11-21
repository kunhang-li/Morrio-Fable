# Week 2 — Bug Fix Journal

## Overview

During Week 2, I worked on three bugs identified during the previous week's investigation. I also implemented an onboarding progress bar, added draft autosave functionality, and expanded regression testing.

## Bug 1 — Onboarding Skips the Final Prompt

**Affected files:**
- `client/src/components/OnboardingFlow.jsx`
- `client/src/components/PromptCard.jsx`
- `client/src/hooks/useStoryProgress.js`

**Root Cause:**

The onboarding component used an incorrect boundary condition:

`currentStep >= prompts.length - 1`

Because array indexing starts at zero, this caused the onboarding flow to complete before displaying the final prompt.

**Fix:**

I updated the boundary condition to check whether `currentStep` is outside the valid prompt range. The last prompt now completes through the existing `onComplete` callback in `PromptCard.jsx`.

**Verification:**

I tested the onboarding flow to confirm that all four prompts appear in order and that the Story Editor opens only after the final prompt is submitted. I also added a Playwright regression test.

## Bug 2 — Incorrect HTTP Status Code for Missing Story Title

**Affected file:**
- `server/routes/stories.js`

**Root Cause:**

The story creation endpoint returned HTTP 200 for a request that did not include a title.

**Fix:**

I changed the validation response from HTTP 200 to HTTP 400 while preserving the existing error message.

**Verification:**

I used Jest and Supertest to confirm that requests without a title return HTTP 400 and valid story creation requests return HTTP 201.

## Bug 3 — Duplicate Media Timeline Entries

**Affected file:**
- `client/src/components/MediaTimeline.jsx`

**Root Cause:**

The frontend added a temporary upload item and then appended the server-confirmed item without removing the temporary one.

**Fix:**

I updated the state management logic to replace the temporary media item with the server-confirmed record. I also handled failed uploads by removing temporary entries.

**Verification:**

I verified that uploading one image produces only one media card and added a Playwright regression test to prevent this behavior from returning.

## Additional Feature — Onboarding Progress Bar

I implemented a visual progress indicator using the current onboarding step and total prompt count. The progress bar updates as users complete prompts and uses a CSS transition to animate the percentage.

## Additional Feature — Draft Autosave

I added periodic draft saving to the Story Editor using React state, refs, a debounce timer, and a backend PATCH endpoint.

The draft-saving feature required changes to the SQLite schema to support `draft_content`.

During testing, I encountered two backend errors:

1. `SqliteError: no such column: draft_content`
2. `ReferenceError: title is not defined`

I investigated these issues using browser developer tools and the server logs, then corrected the database schema and PATCH route.

I added API regression tests covering successful draft saving, missing input, authentication, nonexistent stories, and draft persistence.

**Known issue requiring follow-up:**

The current implementation requires an initial manual save before autosave can begin. The code review identified this as a core requirement that must be resolved before merging.

## Testing Summary

The following test commands passed during development:

- `npm test`
- `npx playwright test`

Additional testing will be required after resolving the new-story autosave limitation.

## Lessons Learned

This work reinforced the importance of checking boundary conditions, using correct HTTP status codes, and managing optimistic frontend updates carefully.

I also learned that full-stack features require coordinated changes across React, Express, and SQLite, and that automated tests are important for preventing regressions.