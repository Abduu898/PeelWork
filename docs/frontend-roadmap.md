# PeelWork product roadmap

PeelWork currently has a working Express, MySQL, and vanilla JavaScript MVP.

## Implemented

- Public job search and job details
- Candidate registration, login, profiles, applications, and application tracking
- Company profiles and company-scoped job management
- Company hiring inbox with pipeline filters and status actions
- Super-admin company and listing management
- SQL schema, seed data, and incremental migrations
- Responsive frontend with shared navigation and reusable job components

## Next priorities

1. Replace localStorage authentication with HttpOnly cookies.
2. Persist sessions and add session expiration.
3. Upload resumes to secure object storage and link them to applications.
4. Replace SHA-256 passwords with Argon2 or bcrypt.
5. Add request validation, rate limiting, structured error logging, and integration tests.
6. Deploy the Node.js application and managed MySQL database.

The static frontend preview remains available with `npm run dev` for isolated UI work.
