# Growerr evidence log

Checks recorded on 22 November 2026 from `C:\Growwer\growerr`. No external participant, screen-reader session, or axe audit is claimed.

## Environment

- Windows, Node.js v22.16.0, npm 10.9.2.
- Next.js 15.5.29, React 19.1.1.
- Local production build served with `next start -p 3100`.
- Browser runs: installed Google Chrome driven by Playwright (headless), plus visual screenshot review at 1440, 768, and 360 px.

## Dependency, test, lint and build

| Check | Command | Result |
|---|---|---|
| Reproducible install | `npm ci --no-audit --no-fund` | Passed; 363 packages installed from `package-lock.json`. |
| Domain tests | `npm test` | Passed: six-question model, unique option values, answer validation, sanitising, summary rows, suggested topics, copy text, Groww URL and progress (36 checks). |
| Lint | `npm run lint` | Passed: no ESLint warnings or errors. `next lint` printed its own deprecation notice. |
| Production build | `npm run build` | Passed. `/`, `/about`, `/start`, `/icon.svg` and `/_not-found` compiled and prerendered; `/start` is 7.65 kB. |
| Icon route | `GET /icon.svg` | Served by the production build; the new leaf icon is advertised in the page head. |

## Browser flow — local production build

| ID | Check | Observed result |
|---|---|---|
| B01 | Routes and titles | `/`, `/start` and `/about` returned `200`. Titles were “Growerr — a clearer first step into investing”, “Find your starting point — Growerr” and “Privacy & independence — Growerr”. |
| B02 | Entry and initial state | “Find my starting point” opened `/start`. Step 1 showed progress `aria-valuenow="1"`, “0 answered”, the heading had focus, and Continue was disabled until an answer was chosen. |
| B03 | Persistence | Selecting “Learn by doing” enabled Continue and wrote `{"goal":"learn"}` to `growerr:onboarding:v1`. |
| B04 | Back navigation | After moving to step 2, Back returned to step 1 with “Learn by doing” still selected. |
| B05 | Complete six-step flow | Answers were given for reason, timeline, 20% drop reaction, starting amount, experience, and priority. The last step showed “See my starting point”; the summary appeared after submitting. |
| B06 | Summary content | The summary showed six answer cards: Learn by doing; 7 years or more; “You would hold on, even if a fall felt uncomfortable.”; ₹500 – ₹5,000; Complete beginner; Understanding as I go. It showed three “Explore first” topics. |
| B07 | Groww handoff | The “Continue to Groww” link had `href="https://groww.in/"`, `target="_blank"`, and `rel="noopener noreferrer"`. The page stated that the link opens in a new tab and that answers are not sent anywhere. |
| B08 | Copy summary | “Copy my starting point” put the six rows, three topics, and the independent/not-advice sentence on the clipboard. |
| B09 | Edit from summary | “Change” on Your timeline opened step 2, and choosing “3 to 7 years” returned directly to the summary with the card updated. |
| B10 | Reload | Reloading `/start` reopened the saved summary instead of restarting the questions. |
| B11 | Start over | “Start over” cleared `growerr:onboarding:v1` and returned to step 1 with no answer selected. |
| B12 | Keyboard | The first Tab focused “Skip to content”; Enter set `#main`. In the radio group, ArrowDown selected the next option. After Continue, focus moved to the next step heading. |
| B13 | Delete answers dialog | “Delete my answers” opened an `alertdialog` with focus on Cancel. Cancel kept the stored answer; confirming removed the key and showed “Your onboarding answers were removed from this browser.” |
| B14 | Responsive layout | At 360×800, 768×900 and 1440×900 on `/`, `/start`, `/about` and the saved summary, `documentElement.scrollWidth === innerWidth` and `body.scrollWidth === innerWidth` (no horizontal page overflow). |
| B15 | Visual review | Screenshots at 1440, 768 and 360 px were inspected. The hero preview, question cards, summary cards, Groww handoff, About page and mobile stacking were legible with no clipped controls. |
| B16 | Runtime errors | No page errors or console errors were recorded in the desktop or mobile runs. |

## Changes made for this revision

- Replaced the previous decision-reflection product with a six-question onboarding flow and a Groww handoff.
- Removed the unused journey, library, snapshot, learn, and old data modules.
- Added `lib/onboarding.ts`, `components/Onboarding.tsx`, and `components/PrivacyActions.tsx`.
- Rewrote the landing and privacy pages, metadata, navigation, footer, site icon, and visual system.
- Saved partial answers in browser storage and restored a completed summary on return.
- Added edit-from-summary, start-over, copy-summary, and clear-my-answers controls.
- Converted internal hash links to `next/link` so lint passes.
- Suppressed the focus ring on programmatically focused `h1` elements, which are not keyboard tab stops.
- Moved the hero “Made for beginners” card below the preview so it no longer covers the preview footer.

## Coach revision — source and local checks (22 November 2026)

### Official references fetched

- Google's official `create-interaction.md` with `api-version=v1` was fetched. It documents `POST https://generativelanguage.googleapis.com/v1/interactions`, the `x-goog-api-key` and `Content-Type: application/json` headers, `model`, `input`, `system_instruction`, `response_format`, `generation_config`, `store`, and responses with a `status` plus `steps[].content[].text`.
- Google's official `structured-output.md` was fetched. Its REST example uses `response_format: { type: "text", mime_type: "application/json", schema: ... }` with `gemini-4-hydrogen`, matching the request builder. The implementation was changed from the beta endpoint to the stable v1 endpoint, and the beta-only `Api-Revision` header was removed.
- Google's `interactions-overview.md` was fetched; it describes Interactions as the recommended API and `generateContent` as legacy.
- The previously unverified SEBI page `https://investor.sebi.gov.in/ssis/entering-the-market.html` was fetched and returned the_module “Understanding & Preparing to Enter the Market”, so its source entry was kept. The other SEBI and AMFI source URLs listed in `lib/education.ts` were also fetched and returned their expected education pages.

### Commands

| Check | Command | Result |
|---|---|---|
| Domain and safety tests | `npm test` | Passed with 109 checks: onboarding model plus education source shape, relevant-note selection, sensitive detection, advice-boundary detection, static replies, model-reply validation, Gemini request shape, and response extraction. |
| Lint | `npm run lint` | Passed with no ESLint warnings or errors; `next lint` printed only its deprecation notice. |
| Production build | `npm run build` | Passed. Routes include static `/`, `/coach`, `/about`, `/start`, `/icon.svg` and dynamic `ƒ /api/coach`. `/coach` is 9.81 kB. |
| API contract | `node` fetch script against local `next start` | Five POST cases returned `Cache-Control: no-store`; static fallback, sensitive, advice, and open-answer replies were labelled `mode: "static"`; empty input returned `400`. |

### Coach API observations

| Case | Observed result |
|---|---|
| `What is a SIP?` with no `GEMINI_API_KEY` | `mode: "static"`, `reason: "missing_key"`, notice “The AI service is not configured here…”; one explanation linked to `https://www.mutualfundssahihai.com/en/what-is-sip`. |
| `My PAN is ABCDE1234F` | Short-circuited as `reason: "sensitive"` with no model call; notice tells the user not to share or repeat private details. |
| `Which fund should I buy?` | Short-circuited as `reason: "advice_boundary"`; notice states the guide cannot give buy/sell/hold calls and suggests a SEBI-registered Investment Adviser. |
| `Not sure` | Accepted as a complete answer: “That is fine — we can leave that open.” |
| Empty message | HTTP 400 with “A message is required.” |

### Browser flow — local production build

| ID | Check | Observed result |
|---|---|---|
| C01 | Route and title | `/coach` returned `200` with title “Educational guide — Growerr” and the “Talk it through…” heading. |
| C02 | Static guide UI | The SIP prompt produced a “Static guide” badge, the missing-key notice, one optional next question, and the AMFI SIP source link. |
| C03 | Sensitive input | A PAN-like value was cleared from the textarea, showed a warning, added no message to the transcript, and made zero `/api/coach` requests. |
| C04 | Advice boundary | An advice request produced the buy/sell/hold boundary and SEBI-registered Investment Adviser notice. |
| C05 | Open answer | The quick answer “Not sure” produced the open-answer reflection; Clear conversation removed all messages and disabled itself. |
| C06 | Onboarding isolation | The summary contains an “Ask the guide” link to `/coach`. After seeding six saved answers, the only guide request body was `{"message":"What is a mutual fund?","history":[]}`; no saved answer text appeared and local storage was unchanged. |
| C07 | Responsive layout | `/coach` had `documentElement.scrollWidth === innerWidth` and `body.scrollWidth === innerWidth` at 768 and 360 px. |
| C08 | Runtime errors | No page errors or console errors were recorded in the coach or full onboarding browser runs. |
| C09 | Existing flow regression | The original onboarding browser script still passed all route, flow, persistence, edit, delete, keyboard, Groww-link and responsive checks. |
| C10 | Screenshots | Full-page screenshots were captured at 1440 px and 360 px. They were not visually inspected in this environment; no visual-review claim is made. |

## Not run

- No live Gemini success is claimed: no `GEMINI_API_KEY` was provided, so only the static fallback path was exercised.
- No screen-reader session, automated accessibility audit (axe), external participant test, or usability score.
- No claim is made about browsers or devices other than the Chrome/Chromium runs above.
- No real Groww account creation, login, payment, or trading flow was attempted.

## Deployment

- GitHub repository: `https://github.com/aeejeyy/growerr` (private), branch `main`; onboarding code revision `2b3a636`.
- Vercel project `growerr`: connected to `aeejeyy/growerr`, Production Branch `main`.
- Production URL: `https://growerr.vercel.app` (alias of the current Ready Production deployment listed by Vercel).
- Verified on 22 November 2026 from a fresh isolated Chrome context with no cookies or local storage, so the check was effectively logged out/private:
  - `/`, `/start` and `/about` returned `200` with the new titles; no Vercel authentication or protection page appeared.
  - The full six-question flow passed: disabled Continue before selection, saved partial answers, Back preserving an answer, all six steps, summary with six rows and three topics, and the Groww handoff configured as `https://groww.in/` with `target="_blank"` and `rel="noopener noreferrer"`.
  - Copy-summary, edit-from-summary, reload-restores-summary, and start-over-clears-storage all passed on the public URL.
  - The About-page delete dialog focused Cancel; Cancel preserved the saved answer; confirming removed it and showed the status message.
  - Keyboard checks passed: skip link to `#main`, ArrowDown inside the radio group, and focus moving to the next step heading after Continue.
  - At 360×800 and 768×900, `/`, `/start`, `/about` and the saved summary had `scrollWidth === innerWidth` with no page overflow.
  - No page errors or console errors were recorded.
- No Groww login, account creation, payment, or trading step was performed. The public site contains no application authentication; records remain local to each browser.
