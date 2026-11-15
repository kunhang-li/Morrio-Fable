Week 1 Reflection
What surprised me
I was surprised that the story editor could appear to work even though the onboarding flow had skipped the last question. I also expected a failed save to return an HTTP error. Sending the request directly from PowerShell showed me that the API could return 200 OK while the response body reported a missing title. Checking both the UI and the HTTP response gave me more information than either test alone.
What slowed me down
The starter ZIP unpacked into two folders with the same name. I could see package.json in Cursor, but PowerShell was in the outer folder and could not find it. Running Test-Path .\package.json from the inner folder helped me confirm where the commands belonged. I also spent time tracing when the Media Timeline appears. Saving a story first gave the editor the story ID it needed.
Open questions
How should the onboarding flow behave if a prompt response fails to save? When a media upload fails, what feedback should the timeline show and how should a retry work? I also want to see which tests would catch the final-prompt boundary and the mismatch between the API status and its response body.