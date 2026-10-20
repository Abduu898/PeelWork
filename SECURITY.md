# Security Policy

## Supported Versions

Only the current main branch of HireLoop is actively maintained with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within **HireLoop**, please follow responsible disclosure guidelines:

1. **Do NOT open a public GitHub Issue.**
2. Send an email to the repository owner or submit a private security advisory through GitHub.
3. Include detailed steps to reproduce the vulnerability, including payload examples or request logs.

### Known Architectural Notes (Local MVP Scope)

* **Authentication**: Session state is managed via client-side `localStorage` for evaluation purposes.
* **Database**: SQL queries use parameterized prepared statements (`mysql2`) to prevent SQL injection.
* **Environment**: Server configurations and database credentials are intended for local execution (`localhost`). Never commit production secrets or API keys to this repository.
