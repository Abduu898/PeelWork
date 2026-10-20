# PROOFWORK — frontend foundation

An incremental implementation of `Proofwork.txt`, preserving the existing Bootstrap UI: yellow accents, dark borders, typography, card styling, and page layouts.

## Run the frontend

With Node.js installed:

```sh
npm run dev
```

Open **http://127.0.0.1:5173**. This preview needs no database and no dependency installation. Bootstrap and its icons load from the existing CDN links, so they require internet access.

```sh
npm test
```

## What works in this step

- Job search by keyword/company/category and location, with an accurate result count and empty state.
- Inline job details without a page reload, with keyboard focus and a close control.
- A separate, linkable details page for each sample job.
- Shared navigation/footer and reusable card/details components.
- Candidate login/registration previews include validation, password visibility, and guest browsing. They check fields without creating accounts or signing in.
- The admin preview shares the board's sample jobs. Add/edit/archive jobs, inspect companies, and change application statuses in memory. Changes reset on page reload and do not change the public board.
- Inline Application Studio includes guest contact details, a message, an optional PDF picker, and an editable review. Nothing is submitted or uploaded.

All opportunities and portfolio examples are fictional frontend fixtures. Authentication, application submission, uploads, and permanent saving are future backend work. Admin preview changes and application reviews exist only in the current page's memory.

## Frontend structure

```text
index.html                 Opportunity board and search
job-detail.html            Selected job and inline Application Studio
login.html                 Candidate sign in / registration preview
admin.html                 Interactive administrator preview
css/style.css              Teammate's design + small usability additions
js/
  components/shell.js      Shared navbar and footer
  components/jobs.js       Job cards and job details
  data/jobs.js             Fictional sample opportunities
  services/jobs.js         Frontend data adapter; future API boundary
  pages/board.js           Board interactions
  pages/detail.js          Detail page interactions
  pages/auth.js            Account form previews and password controls
  pages/admin.js           Temporary job management and application review
  pages/application.js     Application form and review
scripts/preview.js         Local static preview server
tests/frontend.test.js     Search, job selection, and HTML escaping checks
```

The original `server.js`, `db.js`, `schema.sql`, and `seed.sql` are unchanged. The existing backend is separate and still runs with `npm start` after installing its dependencies and setting up its existing MySQL database. This frontend increment does not use it.

See [the next frontend steps](docs/frontend-roadmap.md).
