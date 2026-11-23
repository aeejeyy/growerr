# Growerr evidence log — adaptive journey

Checks recorded on 23 November 2026 from `C:\Growwer\growerr`. This revision replaces the removed fixed-question flow with a browser-only adaptive journey. Only checks actually run are listed. No screen-reader session, axe audit, external participant test, usability score, or first-person assignment response is claimed.

## Environment

- Windows, Node.js v22.16.0, npm 10.9.2.
- Next.js 15.5.29, React 19.1.1.
- Local production build served with `node node_modules/next/dist/bin/next start -p 3100`.
- Browser checks used the in-app Chromium tab at an 800 px viewport, plus a separate headless Google Chrome instance driven through the Chrome DevTools Protocol for 375, 768 and 1440 px viewport checks.

## Commands

| Check | Command | Result |
|---|---|---|
| Domain and safety tests | `npm test` | Passed: `PASS: adaptive journey, safety and education model (337 checks)`. |
| Lint | `npm run lint` | Passed with no ESLint warnings or errors. `next lint` printed only its own deprecation notice. |
| Type check | `npx tsc --noEmit` | Passed with no output. |
| Production build | `npm run build` | Passed. Static routes: `/`, `/about`, `/coach`, `/icon.svg`, `/_not-found`. Dynamic routes: `/api/coach`, `/api/journey`. `/start` is 16.4 kB with 129 kB first-load JS. |
| Removed-flow reference scan | Case-insensitive grep for legacy flow terms and storage key across source, tests, README and this log | No matches after this log was rewritten. |

## Local browser flow — production build

| ID | Check | Observed result |
|---|---|---|
| B01 | Discovery opening | `/start` showed the exact opening question: “Tell me what got you interested in investing. You don't need to know any financial terms. Just tell me what you're trying to understand.” |
| B02 | Static fallback and structure | With no `GEMINI_API_KEY`, the reply was labelled: “The AI service is not configured here, so this is the built-in discovery guide.” It showed the reflection, an approved education note, unknowns, one optional question and quick replies. |
| B03 | Browser-only save | The journey was saved under `growerr:journey:v1`; no other journey storage key was used. |
| B04 | Pause and resume | “Pause journey” showed “Take a break.”, disabled scenario controls, and set `status: "paused"`. “Resume journey” restored `status: "active"` and the same scenario. |
| B05 | Wrong-answer adaptation | The wrong choice in `EXP-02` set the attempt to `needs-review`, left `same-thing` unresolved, showed an alternative explanation, and added `EXP-02` back to the candidate queue with a reason about another look. |
| B06 | Skip after review | “Skip this scenario” from that needs-review state moved to `EXP-04`, recorded `EXP-02` as `skipped`, and did not immediately reselect `EXP-02`. |
| B07 | Revisit and demonstrate | Revisiting `EXP-02`, answering all three steps correctly, and advancing marked `EXP-02` as `demonstrated` and resolved the misconception. |
| B08 | `EXP-06` activity | The invented condition control accepted `98`; the limit and market-order explanations were answered correctly; `EXP-06` was marked `demonstrated`. |
| B09 | Summary sections | The summary showed: “Original objective”, “Journey completed”, “Concepts explored”, “Concepts demonstrated”, “Topics needing further learning”, “Workflows practised”, and “Official education sources”. It also offered scenario revisit. |
| B10 | Copy summary | The browser's default clipboard call showed its explicit fallback status. With `navigator.clipboard.writeText` stubbed in-page to inspect the generated text, the summary contained all eight required headings and the general-education disclaimer. |
| B11 | Revisit from summary | “A hypothetical value path” reopened `EXP-04`; completing it marked all three scenarios `demonstrated` and returned to the summary. |
| B12 | Groww handoff | The optional link was `https://groww.in/` with `target="_blank"` and `rel="noopener noreferrer"`. No answer transfer was claimed. |
| B13 | Advice boundary | “Which fund should I buy?” produced the notice that Growerr cannot give buy/sell/hold calls and suggests a SEBI-registered Investment Adviser. |
| B14 | Sensitive input | A PAN-like value produced the warning not to share private details; the saved message list and facts did not contain that value. |
| B15 | Optional answer | “Prefer not to say” was accepted with “That is fine — we can leave that open.” and did not overwrite the stated objective. |
| B16 | Privacy clear | On `/about`, “Delete my journey” opened an `alertdialog`; confirming removed `growerr:journey:v1` and showed “Your Growerr journey was removed from this browser.” |
| B17 | Runtime errors | No console errors were recorded in the in-app tab during the journey run. |

## Responsive layout

A separate headless Chrome run loaded the local production build at 375, 768 and 1440 px. For `/`, `/about`, fresh `/start`, and `/start` with a saved summary, `document.documentElement.scrollWidth === innerWidth` and `document.body.scrollWidth === innerWidth`. No runtime exceptions were reported by CDP.

| Viewport | Routes checked | Result |
|---|---|---|
| 375 × 812 | `/`, `/about`, `/start`, `/start` summary | No horizontal page overflow |
| 768 × 900 | `/`, `/about`, `/start`, `/start` summary | No horizontal page overflow |
| 1440 × 900 | `/`, `/about`, `/start`, `/start` summary | No horizontal page overflow |

## Not run

- No live Gemini success is claimed: no server-side `GEMINI_API_KEY` was available for these checks, so only the labelled static path was exercised.
- No screen-reader session, automated accessibility audit (axe), external participant test, usability score, or first-person assignment response.
- No claim about browsers or devices other than the Chromium runs above.
- No Groww login, account creation, payment, or trading step was performed.
- Production verification for this revision is recorded below only after commit, push, deployment and a logged-out/private check.

## Deployment

Pending for this revision at the time of the local checks above. This section will be updated only after the new commit is deployed and verified.
