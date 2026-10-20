# JobBoard / HireLoop

A lightweight job-board MVP built with Express, MySQL, Bootstrap, and vanilla JavaScript. The project supports public job browsing, candidate applications, company-owned listings, and separate super-admin management.

## Current phase

The frontend and backend are connected. The current MVP includes:

- Public job search and job details.
- Candidate registration and login.
- Candidate dashboard with submitted applications and statuses.
- Guest applications without an account.
- Company-admin dashboards scoped to one company.
- Listing creation, editing, and deletion for company admins.
- Application inboxes for company admins.
- Application status updates: `pending`, `reviewed`, `accepted`, and `rejected`.
- Super-admin access to all companies, company admins, and listings.
- Responsive Bootstrap UI with the yellow neo-brutalist visual style.

The application flow uses a name, email, optional resume filename, and message. Resume files are not uploaded yet.

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

The default local database connection is configured in [`db.js`](./db.js):

```text
host: localhost
user: hireloop
password: password123
database: hireloop
```

Update [`db.js`](./db.js) if your local MySQL credentials are different.

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

The older static frontend preview is still available with:

```sh
npm run dev
```

That preview is useful for isolated UI work, but it does not provide the real authentication, MySQL persistence, dashboards, or application API. Use `npm start` for the current integrated project.

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

- `GET /me/applications`

### Company admin

- `GET /company/profile`
- `GET /company/ads`
- `POST /company/ads`
- `PUT /company/ads/:id`
- `DELETE /company/ads/:id`
- `GET /company/applications`
- `PATCH /applications/:id/status`

### Super admin

- `GET /admin/companies`
- `POST /admin/company-admins`
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
- Passwords use SHA-256 for this school project; production applications should use a password-hashing algorithm such as Argon2 or bcrypt.
- Guest applications are stored but are not linked to a candidate dashboard.
- Resume files are validated and displayed by filename only; they are not uploaded or persisted.
- Bootstrap and icons are loaded from a CDN.

## Testing

Run the existing Node test suite with:

```sh
npm test
```

For an integrated manual check:

1. Start the server with `npm start`.
2. Open the public board.
3. Log in as the candidate account and submit an application.
4. Confirm it appears in the candidate dashboard.
5. Log in as a company admin and confirm it appears in that company’s application inbox.
6. Change the application status and confirm the updated status appears for the candidate.
7. Log in as the super admin and confirm access to all companies and listings.
