# BlogSphere

BlogSphere is a full-stack, editorial-style blogging platform for readers and writers. Discover stories, search by topic, create an account, and publish and manage your own writing.

## Features

- Responsive home feed with search and category filters.
- Account registration and sign-in with bcrypt password hashing and signed, HTTP-only JWT cookies.
- Protected author dashboard and profile pages.
- Create, read, update and delete posts, with server-side ownership enforcement.
- Post categories, tags, optional cover image URL, author bylines and reading-time estimates.
- Input validation, rate limiting, security headers, clear empty/loading/error states and delete confirmation.
- MongoDB/Mongoose persistence; no production data is hardcoded.

## Technology

- React 18, Vite, React Router and custom responsive CSS.
- Node.js, Express, Mongoose and MongoDB.
- Zod, bcryptjs, JWT, HTTP-only cookies, Helmet and CORS.
- Node.js test runner, Vitest and Supertest.

## Prerequisites

- Node.js 20 or newer and npm.
- A MongoDB instance: local MongoDB Community Server, or a hosted MongoDB deployment.
- Internet access for the first integration-test run, so `mongodb-memory-server` can download its temporary MongoDB binary if it is not cached.

## Setup (Windows PowerShell)

From the project root:

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` and set a private, random `JWT_SECRET` of at least 32 characters. Never commit `.env`.

### Database setup

For local MongoDB, install and start MongoDB Community Server, then keep:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/blogsphere
```

For MongoDB Atlas or another hosted instance, set `MONGODB_URI` to its connection string and allow the development machine's IP in the database network access settings. Do not put database credentials in source control.

## Run locally

With MongoDB running and `.env` configured, start both services from the root:

```powershell
npm run dev
```

The Vite frontend is at <http://localhost:5173>; the Express API is at <http://localhost:5000>. Vite proxies `/api` requests to the API. Alternatively, use two PowerShell terminals:

```powershell
npm run dev --workspace server
npm run dev --workspace client
```

The backend will not start serving if MongoDB cannot be reached. The health endpoint is `GET http://localhost:5000/api/health`; it reports `database: "connected"` when ready and returns HTTP 503 while disconnected.

In VS Code, you can start the full-stack demo from **Terminal → Run Task → Run BlogSphere demo** if that task is configured in your workspace. Otherwise, run `npm run dev:demo` from the project root. Open <http://127.0.0.1:5173> after the terminal reports that the API and Vite server are ready. This is the recommended option when you do not have MongoDB configured.

Do not use the Live Server extension to run `client/index.html`: this is a Vite/React application, and Live Server does not compile its JSX or proxy API requests. If opened that way, the page now explains how to start the app. The demo task runs both the frontend and API with temporary demo data.

### Try the local demo without installing MongoDB

The demo starts an in-memory MongoDB instance, creates three sample stories, and binds the API to `127.0.0.1` only:

```powershell
npm run dev:demo
```

Sign in with `writer@blogsphere.local` and `BlogSphereDemo123!`, or register a new account. The demo database is temporary: all accounts and posts are erased when you stop the process. It is for local evaluation only and must not be used or exposed in production. The first run may need internet access to download the MongoDB binary used by `mongodb-memory-server`.

To keep data between runs, use the normal `npm run dev` workflow with a local or hosted MongoDB connection in the root `.env` file.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000`. |
| `NODE_ENV` | No | `development`, `test` or `production`. |
| `MONGODB_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Private signing secret, at least 32 characters. |
| `CLIENT_ORIGIN` | No | Allowed frontend origin; defaults to `http://localhost:5173`. |
| `COOKIE_SECURE` | No | `true` for HTTPS-only cookies; defaults to true in production and false otherwise. |
| `VITE_API_URL` | No | Frontend API base URL when not using the Vite development proxy. |

Production deployments must use HTTPS, a strong secret, an explicit frontend origin and a production database. Configure `COOKIE_SECURE=true` when serving over HTTPS.

## API overview

All responses use `{ "success": true, "data": ... }` on success and `{ "success": false, "error": ... }` on failure. Authentication uses the `blogsphere_token` HTTP-only cookie; browser requests include credentials.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create account and sign in. |
| `POST` | `/api/auth/login` | Public | Sign in. |
| `GET` | `/api/auth/me` | Signed in | Return current user. |
| `POST` | `/api/auth/logout` | Public | Clear the session cookie. |
| `GET` | `/api/posts?q=&category=` | Public | Search/filter published stories. |
| `GET` | `/api/posts/:id` | Public | Read a story. |
| `GET` | `/api/posts/authors/:id` | Public | Read a writer profile and their stories. |
| `GET` | `/api/posts/mine` | Signed in | List the current writer's stories. |
| `POST` | `/api/posts` | Signed in | Publish a story. |
| `PUT` | `/api/posts/:id` | Owner only | Edit a story. |
| `DELETE` | `/api/posts/:id` | Owner only | Delete a story. |

## Tests and production build

```powershell
npm test
npm run build
```

The server tests include integration coverage against a temporary MongoDB process for registration, login/logout, protected access, post persistence, search, CRUD and ownership enforcement. The first integration-test run downloads a MongoDB binary if one is not cached. This does not verify connectivity to your separately configured local or hosted database.

## Deployment

1. Provision MongoDB and configure its network access and credentials.
2. Deploy the Express server on a Node.js host with `npm install` and `npm start`, setting `MONGODB_URI`, a strong `JWT_SECRET`, `NODE_ENV=production`, `COOKIE_SECURE=true`, `PORT`, and the frontend `CLIENT_ORIGIN`.
3. Build the client with `npm run build --workspace client` and deploy `client/dist` to a static host.
4. Set `VITE_API_URL` to the deployed API origin when the frontend and API do not share an origin; configure CORS to allow only the frontend URL and send credentials.
5. Serve both over HTTPS. For cross-site frontend/API domains, cookie `SameSite` policy may need a deployment-specific adjustment; keep CSRF protections appropriate to the chosen topology.

## Known limitations

- Cover images are external URLs only; the app does not upload or host image files.
- Search uses MongoDB text indexing and is limited to the 50 most recent matching stories.
- The current API does not implement drafts, comments, likes, pagination or password recovery.
- Cross-site deployments may require coordinated cookie/CORS configuration and CSRF protections.
- No database-backed end-to-end verification is claimed until a configured MongoDB instance is tested.
