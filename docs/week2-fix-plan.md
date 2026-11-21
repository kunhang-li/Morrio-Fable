## Week 2 Review Fixes

### Summary

This PR addresses the remaining Week 2 code review feedback, including three original bug fixes, onboarding improvements, draft autosaving, and regression testing.

### Bug Fixes and Root Causes

**Bug 1 — Onboarding skips the final prompt**

The onboarding flow used an incorrect boundary condition (`currentStep >= prompts.length - 1`), causing the final prompt to be skipped. The fix ensures that all prompts are displayed and onboarding completes only after the final submission.

**Bug 2 — Incorrect HTTP status for missing story title**

The story creation endpoint returned HTTP 200 when the title was missing. The response was corrected to HTTP 400 to accurately represent invalid input.

**Bug 3 — Duplicate media timeline entries**

The frontend appended a temporary upload item and later appended the server-confirmed item without removing the temporary one. The fix replaces the temporary item with the confirmed record.

### Additional Features

- Added an onboarding completion progress bar.
- Added automatic draft saving with a 30-second interval and 500ms input debounce.
- Added save status indicators and retry handling.
- Added support for automatically creating a story on the first autosave without requiring a manual Save.
- Added draft persistence through SQLite and the PATCH API.

### Testing

- Jest and Supertest API regression tests.
- Playwright onboarding and media upload regression tests.
- Manual verification of draft autosave behavior.

### Documentation

- `docs/week2-fix-plan.md`
- `dev-journal/week2-bugs.md`
- Week 2 Reflection

### Resolution of Review Feedback

The new-story autosave limitation has been addressed. New stories can now be created and saved automatically without requiring an initial manual Save.