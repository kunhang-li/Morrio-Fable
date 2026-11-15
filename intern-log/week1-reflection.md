# Week 1 Reflection

## What surprised me

I was surprised that the Story Editor opened normally even though the onboarding flow had skipped the last question. When I clicked **Next** on Step 3, I expected to see Step 4 of 4. Instead, I landed in an editor where I could still enter a title and save a story. If I had only checked whether I could reach the editor, I would have missed the skipped prompt. That experience made me pay closer attention to what happens between screens.

The story-save endpoint surprised me for a different reason. When I left the title blank in the browser, the form checked it before sending a request. I used PowerShell to send a request directly to the API without a title. The response body said `Title is required`, but the HTTP status line said `200 OK`. Looking at both parts of the response helped me describe the issue precisely. I also saw two cards appear in the Media Timeline after uploading one image. Tracing the upload handler helped me connect those two cards to two updates to the same list.

## What slowed me down

The starter ZIP unpacked into two folders with the same name. I could see `package.json` in Cursor, but my PowerShell terminal was in the outer folder. `Test-Path .\package.json` returned `False` until I moved into the inner folder. I had to check which directory the terminal was using before I could run the project commands.

I also spent time figuring out when the Media Timeline becomes available. I initially focused on entering text in the editor. After I saved a story, the timeline appeared. Reading the code afterward helped me understand that the editor needs the story ID returned by the server before it can show media for that story.

## Open questions

If an onboarding answer fails to save, should the app keep the user on the same prompt and offer a retry? I also want to understand what feedback the timeline should show if an upload fails, especially when the user tries to upload the same file again. For testing, I would like to see how to check that Step 4 appears before onboarding ends and that a request without a title returns `400 Bad Request`.