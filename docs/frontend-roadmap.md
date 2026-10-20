# Small frontend steps

Based on the original project notes. Current priority: PeelWork frontend refinement.

## Step 1 — board foundation (implemented)

Shared navbar/footer, reusable job components, sample-data service, working search, accurate counts, and inline details. Existing page URLs stay usable. No framework migration in this step.

## Your review now

1. Run `npm run dev` and open http://127.0.0.1:5173.
2. Compare the yellow/black styling, hero, cards, and existing screens with your teammate's design.
3. Search for `React` and `Paris`, open another job's details, and check a narrow browser window.
4. Open Login and try the candidate registration form with sample details.
5. Open Admin preview to edit/archive a sample job and inspect applications. Changes reset on reload.
6. Open a job's Application Studio, complete the message, and review the application before submitting.

## Remaining screen alignment (implemented)

Candidate-focused account forms, administrator Jobs/Companies/Applications views, and an inline Application Studio now use the existing design. Interactive checks, temporary admin changes, and editable application reviews run only in the frontend. Account creation, real sign-in, uploads, and submission remain future backend integration.

## Step 2 — complete the board UI

Add contract/remote filters, a clear-filters action, and pagination once the sample set is larger. Refine mobile and keyboard behavior with the same design system.

## Step 3 — Application Studio preview (initial version implemented)

Contact fields, a message, and an editable review are implemented. Next connect account state and application history.

## Later

Candidate dashboard and admin UI, then backend integration, authentication, SQL persistence, and eventually optional AI. The roadmap's PostgreSQL/React/TypeScript migration should be a deliberate later step, not bundled into this design-preserving frontend pass.
