# Growerr

A mobile-first, browser-local investment decision reflection tool. It helps people understand terminology and uncertainty, record unverified claims and their own reasoning, and revisit a decision. It does not provide personalized advice or execute trades.

## Run locally

Requires Node.js 20.9 or later and npm with access to the package registry. Install the locked dependencies, then run:

1. `npm install` (or `npm ci`)
2. `npm run dev`
3. Open `http://localhost:3000`
4. Run `npm test`, `npm run lint`, and `npm run build` before deployment.

`package-lock.json` is committed so installs are reproducible on a host such as Vercel.

## Routes

- `/`: landing, privacy summary and links to a new or synthetic journey
- `/start`: choose Exploring, Considering, or Revisiting
- `/journey`: five-step draft with local autosave; query parameters `scenario=...`, `demo=1`, and `edit=...` select the entry path
- `/library`: saved snapshots
- `/snapshot/[id]`: edit, review, and delete one snapshot
- `/learn`: plain-language glossary
- `/about`: methodology, privacy, data export and clear-all

## Data and safety

Drafts and snapshots use versioned `localStorage` keys, with no server account. The JSON export includes snapshots, draft, schema version and synthetic labels. Malformed stored content is preserved for raw export from About, rather than automatically destroyed. Clearing browser data loses the records; there is no cloud sync or encrypted backup. Avoid typing personal identifiers into free-text fields.

The downside display is arithmetic only. It accepts an optional positive hypothetical amount and a 10%, 20%, or 30% decline; it is not a forecast or maximum loss. Every advice claim is labelled unverified. Sample data uses the fictional `Example Stock` and is labelled synthetic wherever it appears.

## Deployment

Connect this repository to a Next.js-capable host, such as Vercel. Use the standard framework preset and no secrets or external integrations. Run dependency installation and build first, then verify every route with a logged-out private browser window, including direct refresh on a snapshot route in the same browser. Since decisions live locally, another browser cannot open the same snapshot ID. Do not put an app URL in the assignment until it has been deployed and checked.

## Testing and honest limitations

`npm test` checks deterministic arithmetic, invalid values, local draft, synthetic fixture, snapshot create/edit/review/delete, JSON export, corrupted data, and clear-all. Dependency installation, tests, lint, production build, the main browser journey, keyboard focus order and responsive layouts were run locally and are recorded in `EVIDENCE.md`. No screen-reader session, axe audit, external participant test or usability score has been completed. Complete any additional checks you need before release.

The applicant must write their own 300–700-word first-person submission. Do not present this code or the synthetic fixture as participant validation or live market research.
