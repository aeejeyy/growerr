# Growerr evidence log

Checks recorded on 22 November 2026 from `C:\Growwer\growerr`. No external participant, screen-reader session or axe audit is claimed.

## Environment

- Windows, Node.js v22.16.0, npm 10.9.2.
- Next.js 15.5.29, React 19.1.1.
- Local production server: `npm start` on `http://localhost:3000`.
- Browser runs: in-app Chromium for the main journey; installed Google Chrome driven by Playwright for viewport and corruption checks.

## Dependency, test, lint and build

| Check | Command | Result |
|---|---|---|
| Reproducible install | `npm ci --no-audit --no-fund` | Passed; 363 packages installed from `package-lock.json`. |
| Domain tests | `npm test` | Passed: arithmetic, invalid values, draft, demo label, create/edit/review/delete, export, corrupted data, clear-all (12 checks). |
| Lint | `npm run lint` | Passed: no ESLint warnings or errors. `next lint` printed its own deprecation notice. |
| Production build | `npm run build` | Passed. All routes compiled, type-checked and generated; `/snapshot/[id]` is dynamic, the other pages are static. |
| Icon route | `GET /icon.svg` | `200`, `content-type: image/svg+xml`; the page advertises `/icon.svg` and a browser run produced no 4xx responses. |

## Production browser journey

| ID | Check | Observed result |
|---|---|---|
| T01 | Synthetic example from the landing page | `/journey?demo=1` loaded with `Example Stock` and the synthetic label on the journey and on the saved snapshot. |
| T02 | Optional amount left blank | Clearing the amount replaced the arithmetic box with “Enter an optional positive amount…” and Continue remained usable. |
| T03 | Invalid amount | `-10` was rejected with “Enter an amount above zero…” and focus returned to the amount field. |
| T04 | Valid arithmetic | `3500` at 30% showed `₹1,050.00 less` and the “not a prediction” wording. |
| T05 | Save and refresh | Saving moved to `/snapshot/48e144df-…`; after a full refresh the title, amount, claims, original question and synthetic label were still present. The draft key was removed after saving. |
| T06 | Edit and save | The question and title were changed and saved. The snapshot showed the new question/title while “Then and now” retained the original question and rationale. |
| T07 | Dated review | A review with what changed, what still held, next question and confidence saved; the page showed `REVIEW 1 · 22 NOV 2026` with the original reflection still visible. |
| T08 | JSON export | `/about` download produced `growerr-data.json`. Parsing it showed 1 snapshot, `isSyntheticDemo: true`, amount 3500, 30%, the saved review, the original question and `draft: null`. |
| T09 | Delete dialog, Escape and Cancel | The dialog had `role="alertdialog"`, correct labelling and focus on Cancel. Escape and the Cancel button both closed it and left the record intact. |
| T10 | Confirm deletion | Confirming removed the record, redirected to `/library` and showed “No decisions saved here yet.” |
| T11 | Clear-all Cancel and confirm | With a saved draft, Cancel left both storage keys; confirming removed the records and draft keys and showed the removal status. |
| T12 | Corrupted storage recovery | Injecting `corrupted json` into the records key made `/library` show the read error and recovery link. Export from `/about` downloaded `growerr-recovery.json` containing the raw corrupted text; clear-all then removed both keys. |
| T13 | Keyboard navigation | On `/`, the first Tab focused “Skip to content”; Enter set `#main` and the next Tab reached the first main action. On `/start`, seven Tabs reached the first scenario; Enter opened the journey, focus moved to the step heading, and the next Tab reached the question textarea. Escape closed the delete dialog. |
| T14 | Responsive layout | Chrome runs at 360×800, 768×900 and 1440×900 on `/`, `/journey?demo=1`, `/about` and a snapshot found `scrollWidth === innerWidth` (no horizontal page overflow). The landing was block layout at 360/768 and grid at 1440; the three steps were one column at 360/768 and three columns at 1440; step actions wrapped at 360; the smallest button/input height was about 44 px. No page or console errors were recorded. |
| T15 | Synthetic data in the layout check | The snapshot used for T14 was the exported synthetic snapshot injected into a fresh browser profile; the synthetic label, original question and dated review were present. |

## Fixes made during verification

- `tests/run.mjs`: use `fileURLToPath` so the TypeScript compile step works on Windows instead of passing `/C:/...` paths.
- `components/Snapshot.tsx`: memoised the record loader so the effect dependency list is complete and lint is clean.
- `package.json` / lockfile: upgraded Next.js and `eslint-config-next` from 15.5.3 to 15.5.29 after npm reported a security advisory for 15.5.3.
- `app/icon.svg`: added the site icon so the served page advertises an icon instead of producing a console 404.
- `README.md`: updated the supported Node version and the now-verified install/build status.

## Not run

- No screen-reader session, automated accessibility audit (axe), external participant test or usability score.
- No claim is made about browsers or devices other than the Chrome/Chromium runs above.

## Deployment

Pending. Record the production URL, the production-branch deployment result and the logged-out private-browser check here after they are completed.
