### Bug 1 — Onboarding skips the final prompt

1. Open `http://localhost:3000` and refresh the page to start at **Step 1 of 4**.
2. Type a response in the text box and click **Next**.
3. On **Step 2 of 4**, type a response and click **Next**.
4. On **Step 3 of 4**, type a response and click **Next**.
5. Check which screen appears after submitting Step 3.

**Expected:** The app displays **Step 4 of 4** with the prompt “What does home mean to you?”

**Actual:** The app opens the **Story Editor** immediately after Step 3, skipping the final prompt.

**Initial hypothesis.** The onboarding completion check in `client/src/components/OnboardingFlow.jsx` (line 28) appears to end the flow one step too early. The prompt index starts at `0`, so with four prompts, index `3` points to the fourth prompt. After Step 3 is submitted, `currentStep` advances to `3`. The condition `currentStep >= prompts.length - 1` becomes true at that point, so `onComplete()` runs before the fourth prompt can render.

### Bug 2 — Missing title returns HTTP 200 instead of HTTP 400

**Expected:** `POST /api/stories` returns `400 Bad Request` when the request body is missing the required `title` field.

**Actual:** The same request returns `200 OK` with the response body `{"error":"Title is required"}`.

**Root cause:** The title-validation branch in `server/routes/stories.js` explicitly sets the HTTP status to `200`. The incorrect status code is the bug. The response body already identifies the missing title.

### Bug 3 — One image upload produces two timeline cards

1. Complete the onboarding steps until the **Story Editor** appears.
2. Enter a title in the **Story title** field and click **Save**.
3. Wait for **Saved** and the **Media Timeline** section to appear.
4. Under **Media Timeline**, click **Choose File**, select exactly one PNG or JPG, and click **Open**.
5. Wait for the upload to finish, then count the new cards labeled `image`.

**Expected:** One uploaded file adds one card to the timeline.

**Actual:** One uploaded file adds two cards labeled `image`.

**Initial hypothesis.** The upload handler in `client/src/components/MediaTimeline.jsx` appears to add the same upload to `mediaItems` twice. Lines 21–22 append a temporary item before the server responds. Lines 34–35 append the saved item returned by the server. Both items remain in the array, so one successful upload produces two timeline cards.