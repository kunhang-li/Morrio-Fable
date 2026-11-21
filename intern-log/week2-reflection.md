# Week 2 Reflection

During Week 2 of my Morrio Fable internship, I focused on fixing three bugs, improving the onboarding experience, and implementing an automatic draft-saving feature.

The first bug involved the onboarding flow skipping the final prompt. I discovered that the completion condition used an incorrect boundary check. This helped me better understand how zero-based indexing affects React component rendering.

The second bug was related to API error handling. The story creation endpoint returned HTTP 200 even when the title was missing. I changed the response to HTTP 400 and added a regression test. This experience reminded me that HTTP status codes are an important part of API design.

The third bug caused duplicate media entries in the timeline. After examining the React state updates, I found that the application added a temporary media item and then appended the server-confirmed item without removing the temporary one. I fixed this by replacing the temporary item with the saved item.

I also worked on two new features: an onboarding progress bar and an automatic draft-saving indicator. The progress bar provides users with feedback about their completion percentage. The auto-save feature introduced additional challenges because it required coordination between React state, backend API routes, and SQLite.

One particularly useful debugging experience involved an HTTP 500 error during draft saving. By checking Chrome DevTools and the server logs, I identified problems involving the database schema and an undefined variable in the backend route. This taught me the importance of checking errors at multiple layers rather than assuming a problem originates in the frontend.

Another lesson was the value of automated regression testing. I used Jest and Playwright to verify existing functionality and reduce the risk of introducing new bugs.

Overall, this week helped me improve my understanding of React state management, API validation, database changes, debugging, and Git workflows. In future development, I want to write tests earlier, make smaller commits, and verify database migrations before testing new features.