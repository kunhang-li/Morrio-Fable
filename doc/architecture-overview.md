# Fable Onboarding Editor Architecture

## Frontend

The React application is in `client/src/`. Vite serves the frontend at `http://localhost:3000` and forwards requests under `/api` and `/uploads` to the Express server at `http://localhost:4000`.

`App.jsx` starts with the onboarding flow and switches to the story editor when onboarding completes. `OnboardingFlow.jsx` loads prompts from `GET /api/prompts`, `useStoryProgress.js` tracks the current step, and `PromptCard.jsx` submits each response to the stories API.

In the editor, the first click on **Save** sends `POST /api/stories`. When the server returns the new story ID, the editor shows `MediaTimeline.jsx` and uses `PUT /api/stories/:id` for subsequent saves. The timeline uses the story-specific media endpoints to load and upload media.

## Backend and persistence

`server/index.js` configures JSON parsing and CORS, mounts the Express routers, and serves uploaded files under `/uploads`. The starter uses the `x-user-id` header to identify the demo user on story and media requests.

| Route group | Methods and paths | Role |
|---|---|---|
| Health | `GET /api/health` | Reports whether the API is running. |
| Prompts | `GET /api/prompts`, `GET /api/prompts/:id` | Lists prompts in order or retrieves one prompt. |
| Users | `GET /api/users`, `GET /api/users/:id` | Lists users or retrieves one user. |
| Stories | `GET /api/stories`, `POST /api/stories`, `GET /api/stories/:id`, `PUT /api/stories/:id` | Lists, creates, retrieves, and updates stories for the demo user. |
| Story media | `GET /api/stories/:id/media`, `POST /api/stories/:id/media` | Lists a story's media or uploads a file and creates its media record. |
| Static uploads | `GET /uploads/<filename>` | Serves files from `server/uploads/`. |

`server/db/database.js` opens the SQLite file specified by `DB_PATH`. `server/db/schema.sql` defines the `users`, `prompts`, `stories`, and `media_items` tables. The database keeps media metadata and file URLs, while Multer writes uploaded files to `server/uploads/`. `npm run seed` initializes the database and loads sample records. `npm test` runs the API suite in `tests/api.test.js` using Jest and Supertest.

## Key dependencies

These are the requirements declared in the starter project's `package.json`.

| Dependency | Declared requirement | Role |
|---|---|---|
| Node.js | `>=20` | Runs the server and development scripts. |
| React and React DOM | `^18.2.0` each | Define and render the UI. |
| Vite and its React plugin | `^5.4.10`, `^4.3.3` | Serve the frontend, process JSX, and proxy development requests. |
| Express | `^4.18.3` | Handles HTTP routing and middleware. |
| SQLite via `better-sqlite3` | `^12.10.0` for the driver | Stores and queries application data. |
| Multer | `^2.0.2` | Handles multipart file uploads. |
| dotenv and cors | `^16.4.5`, `^2.8.5` | Load environment variables and apply CORS headers. |
| concurrently | `^8.2.2` | Starts Vite and Express together with `npm run dev`. |
| Jest and Supertest | `^29.7.0`, `^6.3.4` | Run automated tests and exercise the Express API. |

## Local setup friction

After extracting the starter ZIP on Windows, I had an outer `fable-onboarding-editor` folder containing another folder with the same name. Cursor showed `package.json` in the file explorer, but PowerShell opened in the outer folder and `Test-Path .\package.json` returned `False`. I ran `cd .\fable-onboarding-editor` and checked again from the inner folder before continuing setup. Once the app was running, I reached the Story Editor, saved a test story, and saw the Media Timeline appear.
