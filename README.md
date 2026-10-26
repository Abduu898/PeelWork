# PeelWork

PeelWork is a lightweight job marketplace MVP built with Express, MySQL, Bootstrap, and vanilla JavaScript. Its vibe is simple: strip away long forms, ghosting, and generic filters so people can get to better matches faster.

## Current phase

The frontend and backend are connected. The current MVP includes:

- Public job search and job details.
- Candidate registration and login.
- Candidate profile editing with contact, skills, experience, education, and portfolio details.
- Candidate dashboard with submitted applications and statuses.
- Guest applications without an account.
- Company-admin dashboards scoped to one company.
- Editable company profiles with industry, size, work model, benefits, website, and LinkedIn details.
- Listing creation, editing, and deletion for company admins.
- Company application inboxes with candidate profile context, pipeline filters, and status actions.
- Application status updates: `pending`, `reviewed`, `accepted`, and `rejected`.
- Super-admin access to all companies, company admins, and listings.
- Responsive Bootstrap UI with PeelWork's yellow neo-brutalist visual style.

The application flow uses a name, email, optional local resume selection, and message. Resume files are currently validated and displayed by filename only; they are not uploaded or saved yet.

## Requirements

- Node.js
- MySQL
- Internet access for Bootstrap and Bootstrap Icons CDN assets

## Setup

Install dependencies:

```sh
npm install
```

Create the development database and seed data. The schema script recreates the `hireloop` database:

```sh
mysql -u root -p < schema.sql
mysql -u root -p hireloop < seed.sql
```

Configure the database connection with environment variables. Start by copying
the example file:

```sh
cp .env.example .env
```

Then update `.env` with your local MySQL credentials:

```text
DB_HOST=localhost
DB_PORT=3306
DB_USER=hireloop
DB_PASSWORD=your-password
DB_NAME=hireloop
```

The `.env` file is ignored by Git and must never be committed. The application
loads these values in [`db.js`](./db.js). If `DB_PASSWORD` is empty, the local
connection uses an empty MySQL password.

If you already created the database before candidate profiles were added, apply the
non-destructive migration before starting the server:

```sh
mysql -u root -p hireloop < migrations/001_candidate_profiles.sql
```

This adds candidate profile fields, links applications to candidate accounts, and
backfills that link for existing applications using the applicant email.

For existing databases, also apply the company profile migration:

```sh
mysql -u root -p hireloop < migrations/002_company_profiles.sql
```

## Run the application

Start the Express server:

```sh
npm start
```

Open:

```text
http://127.0.0.1:3000/
```

Keep the server terminal running while using the application. Stopping Node causes the browser to show `ERR_CONNECTION_REFUSED`.

The dedicated job marketplace is available at:

```text
http://127.0.0.1:3000/jobs.html
```

The frontend preview is also available with:

```sh
npm run dev
```

The preview serves the frontend on port `5173` and proxies API requests to the integrated server on port `3000`. Start `npm start` in another terminal before using login, dashboards, profile saving, or applications. For the simplest setup, use `npm start` and open `http://127.0.0.1:3000/`.

## Seed accounts

These accounts are created by [`seed.sql`](./seed.sql):

| Role | Email | Password | Dashboard |
|---|---|---|---|
| Super admin | `admin@hireloop.com` | `admin123` | `super-admin.html` |
| TechCorp company admin | `techcorp@hireloop.com` | `company123` | `admin.html` |
| DesignStudio company admin | `designstudio@hireloop.com` | `company123` | `admin.html` |
| Candidate | `user@hireloop.com` | `user123` | `candidate-dashboard.html` |

These are development credentials only.

## Main routes

### Public

- `GET /ads`
- `GET /ads/:id`
- `GET /categories`
- `POST /ads/:id/applications`

### Authentication

- `POST /auth/register/candidate`
- `POST /auth/login`
- `POST /auth/logout`

### Candidate

- `GET /me/profile`
- `PUT /me/profile`
- `GET /me/applications`

### Company admin

- `GET /company/profile`
- `PUT /company/profile`
- `GET /company/ads`
- `POST /company/ads`
- `PUT /company/ads/:id`
- `DELETE /company/ads/:id`
- `GET /company/applications`
- `PATCH /applications/:id/status`

### Super admin

- `GET /admin/companies`
- `POST /admin/companies` (creates a company and its first company admin atomically)
- `GET /admin/ads`
- `PUT /admin/ads/:id`
- `DELETE /admin/ads/:id`

## Project structure

```text
server.js                 Express API and role-based authorization
db.js                     MySQL connection pool
schema.sql                Canonical database schema
seed.sql                  Development companies, jobs, and accounts
index.html                Public job board and search
jobs.html                 Dedicated searchable jobs marketplace
job-detail.html           Job details and application form
login.html                Login and candidate registration
candidate-dashboard.html  Candidate application dashboard
admin.html                Company-admin dashboard
super-admin.html          Super-admin dashboard
css/style.css             Shared Bootstrap overrides and visual system
js/
  components/             Shared navigation, footer, cards, and details
  pages/                  Page-specific frontend controllers
  services/               API adapters
scripts/preview.js        Static frontend preview server
tests/                    Frontend tests
```

## Known MVP limitations

- Sessions are stored in memory and disappear when the server restarts.
- The browser stores the session token in `localStorage`; production should use an HttpOnly cookie and persistent session storage.
- Passwords use SHA-256 for this school project; production applications should use a password-hashing algorithm such as Argon2 or bcrypt.
- Guest applications are stored but are not linked to a candidate dashboard.
- Resume files are validated and displayed by filename only; they are not uploaded or persisted.
- Bootstrap and icons are loaded from a CDN.

## Testing

Run the Node test suite with:

```sh
npm test
```

The frontend tests import browser-side modules that call API-relative URLs.
They require a browser-like fetch base URL or a test fetch mock; starting the
Express server alone does not provide that base URL to Node's test runner.

For an integrated manual check:

1. Start the server with `npm start`.
2. Open the public board and select **Find Jobs**, or open `jobs.html` directly.
3. Log in as the candidate account and submit an application.
4. Confirm it appears in the candidate dashboard.
5. Log in as a company admin and confirm it appears in that company’s application inbox.
6. Change the application status and confirm the updated status appears for the candidate.
7. Log in as the super admin and confirm access to all companies and listings.
