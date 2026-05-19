# Notion OAuth Connector

An open-source starter for connecting a web app to Notion with OAuth 2.0, secure token storage, Redis-backed sessions, and direct Notion REST API calls.

This repository is a TypeScript monorepo with a Next.js frontend and an Express backend. It is useful as a reference implementation for teams that want to authenticate users with Notion, store tokens safely server-side, and query pages or databases from a browser UI.

## Features

- Notion OAuth 2.0 flow with PKCE and state validation
- Encrypted server-side access and refresh token storage
- PostgreSQL persistence for users, connections, and OAuth state
- Redis-backed HttpOnly sessions
- Next.js app with same-origin API rewrites to the backend
- Express API for auth, connection status, Notion queries, and disconnect
- Docker Compose setup for local PostgreSQL and Redis
- TypeScript across frontend and backend

## Important Note

Notion OAuth access tokens work with the Notion REST API at `api.notion.com`. They are not accepted by Notion's MCP endpoint at `mcp.notion.com`.

This project therefore uses the Notion REST API directly for operations such as listing pages, listing databases, fetching a page, and fetching a database.

## Tech Stack

- Frontend: Next.js, React, TypeScript
- Backend: Express, TypeScript, Zod
- Data: PostgreSQL, Redis
- Auth: Notion OAuth 2.0 with PKCE
- Tooling: npm workspaces, Docker Compose, Vitest

## Project Structure

```text
notion_connector/
  apps/
    web/                 Next.js frontend
      app/               App Router pages
      components/        UI and Notion components
      hooks/             React data hooks
      lib/               API client
      types/             Shared frontend types
    server/              Express backend
      src/
        config/          Environment and constants
        database/        PostgreSQL client, migrations, seeds
        middleware/      Session, auth, CSRF, rate limiting
        modules/         OAuth, token, Notion, and user logic
        routes/          Express routes
        utils/           Shared backend utilities
  docker-compose.yml     Local PostgreSQL and Redis
  package.json           Workspace scripts
  README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- Docker and Docker Compose
- A Notion integration with OAuth credentials

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd notion_connector
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Local Services

```bash
npm run docker:up
```

This starts PostgreSQL on port `5432` and Redis on port `6379`.

### 4. Configure Environment Variables

Create an environment file for the backend at `apps/server/.env`.

```env
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/callback

DATABASE_URL=postgresql://notion_user:notion_pass@localhost:5432/notion_mcp
REDIS_URL=redis://localhost:6379

TOKEN_ENCRYPTION_KEY=base64_encoded_32_byte_key
SESSION_SECRET=replace_with_at_least_64_random_characters

APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
NODE_ENV=development
PORT=4000
LOG_LEVEL=info
```

Generate a token encryption key with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Make sure your Notion integration redirect URI exactly matches:

```text
http://localhost:3000/callback
```

### 5. Run Database Migrations

```bash
npm run migrate
```

### 6. Start the App

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`.

The backend runs at `http://localhost:4000`.

## Available Scripts

```bash
npm run dev             # Start frontend and backend
npm run dev:web         # Start only the Next.js app
npm run dev:server      # Start only the Express API
npm run build           # Build both apps
npm run start           # Start the built backend
npm run migrate         # Run database migrations
npm run seed            # Seed the database
npm run lint            # Lint the backend
npm run test            # Run backend tests
npm run docker:up       # Start PostgreSQL and Redis
npm run docker:down     # Stop PostgreSQL and Redis
npm run docker:logs     # Tail service logs
```

## API Overview

Frontend requests are sent through Next.js rewrites under `/api/*`, then proxied to the Express backend.

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/auth/notion/connect` | `POST` | Create an OAuth authorization URL |
| `/api/auth/notion/callback` | `POST` | Exchange an OAuth code for tokens |
| `/api/notion/status` | `GET` | Check the current user's connection status |
| `/api/notion/query` | `POST` | Run a supported Notion operation |
| `/api/notion/disconnect` | `POST` | Remove the stored Notion connection |
| `/api/health` | `GET` | Health check |

Supported Notion actions include:

| Action | Notion REST API |
| --- | --- |
| `list_pages` | `POST /v1/search` filtered by page objects |
| `list_databases` | `POST /v1/search` filtered by database objects |
| `search_pages` | `POST /v1/search` |
| `get_page` | `GET /v1/pages/{pageId}` |
| `get_database` | `GET /v1/databases/{databaseId}` |

## Security Notes

- Tokens are encrypted with AES-256-GCM before being stored.
- The encryption key must be supplied through `TOKEN_ENCRYPTION_KEY`.
- Session cookies are HttpOnly and use Redis-backed session storage.
- OAuth state is one-time use and expires after a short window.
- Mutating requests are protected with origin and referer validation.
- Do not commit `.env` files or production secrets.

## Troubleshooting

### Notion Returns Empty Results

Make sure the relevant Notion pages are shared with your integration:

1. Open the page in Notion.
2. Select the page menu.
3. Choose "Add connections".
4. Select your integration.

### OAuth Callback Fails

Check that `NOTION_REDIRECT_URI` matches the redirect URI configured in Notion exactly, including protocol, host, port, and path.

### Sessions Do Not Persist

Confirm Redis is running with:

```bash
docker compose ps
```

Also check that `APP_URL` matches the frontend URL and that browser cookies are not being blocked.

### Database Connection Fails

Confirm PostgreSQL is running, then rerun migrations:

```bash
npm run docker:up
npm run migrate
```

## Contributing

Contributions are welcome. To propose a change:

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change.
4. Run tests and linting where applicable.
5. Open a pull request with a clear description.

Good first contributions include improving setup docs, adding tests, tightening validation, expanding supported Notion operations, and improving the example UI.

## License

This project is intended to be open source. Add a `LICENSE` file before publishing the repository publicly. The MIT License is a common choice for starter projects, but choose the license that fits your goals.

## Acknowledgements

Built with Notion's public OAuth and REST APIs.
