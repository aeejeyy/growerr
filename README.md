# Growerr

A free, independent onboarding experience for people who are new to investing. Six simple questions become a plain-language starting point, and then the user can continue to Groww to explore account options and beginner guides. An optional educational guide lets users talk through one general question at a time.

Growerr is not a broker, does not open accounts or execute trades, is not affiliated with Groww, and does not provide investment advice. The guide is general education only: no products, rankings, forecasts, guarantees, buy/sell/hold calls, or suitability labels.

## The flow

1. **Landing** — a short explanation of what Growerr does, who it is for, and how the Groww handoff works.
2. **Six questions** — one question per screen: reason, timeline, reaction to a market fall, optional starting amount, experience, and what matters most.
3. **Starting point** — a six-row summary with an “Explore first” list of educational topics. Every answer can be changed from the summary.
4. **Continue to Groww** — a clearly labelled external link to `https://groww.in/`, opened in a new tab with `noopener noreferrer`.
5. **Optional guide** — `/coach` offers one short clarification at a time, reflects what the user said, uses only fixed SEBI/AMFI education notes, names unknowns, and asks one optional next learning question.

Answers are saved under the versioned key `growerr:onboarding:v1` in this browser only. They are not posted to a server or shared with Groww, and they are never included in a guide request. A returning visitor sees their saved summary. “Start over” on the summary or “Delete my answers” on `/about` removes the saved data.

## Run locally

Requires Node.js 20.9 or later and npm with access to the package registry.

1. `npm ci` (or `npm install`)
2. `npm run dev`
3. Open `http://localhost:3000`
4. Run `npm test`, `npm run lint`, and `npm run build` before deployment.

`package-lock.json` is committed so installs are reproducible on a host such as Vercel.

## Routes

- `/` — landing page, explanation, and calls to action
- `/start` — the six-question onboarding and summary
- `/coach` — optional educational guide with source links and clear static/AI labels
- `/api/coach` — POST endpoint that calls Gemini when configured, or returns a clearly labelled static educational reply
- `/about` — privacy, independence, what is asked and why, guide data handling, and clear-my-answers
- `/icon.svg` — site icon

## Privacy and independence

- No account, name, email, phone number, PAN, Aadhaar, bank details, broker login, holdings, or income details.
- Onboarding answers stay in browser storage; no server-side storage, analytics script, or mailing list is used for them.
- Guide messages and recent turns are posted to `/api/coach`. When `GEMINI_API_KEY` is configured, they are sent to Gemini for that reply; `store: false` requests no provider-side storage for later retrieval. Growerr does not persist the conversation.
- The guide clears obvious private details locally before sending and asks users not to paste credentials, identity numbers, bank/card details, or exact holdings.
- No onboarding answers are sent to Groww; the Groww link opens a separate platform under its own terms and privacy policy.
- The summary, suggested topics, and guide explanations are educational, not recommendations. Investments can fall as well as rise.

## Deployment

Live production deployment: **https://growerr.vercel.app**

The Vercel project `growerr` is connected to the private GitHub repository `aeejeyy/growerr` and deploys the `main` branch with the standard Next.js preset. No secret or environment variable is needed for the site or its static educational guide. Local and production browser checks are recorded in `EVIDENCE.md`.

## Optional AI guide configuration

The AI path is optional and uses Gemini's stable Interactions API (`POST https://generativelanguage.googleapis.com/v1/interactions`) with the `gemini-4-hydrogen` model by default. Set these as server-side environment variables in Vercel or in `.env.local` for local development; never commit or paste the key into chat:

- `GEMINI_API_KEY` — required to enable the AI path. The key stays on the server and is sent only as the `x-goog-api-key` header to Google.
- `GEMINI_MODEL` — optional model override. Defaults to `gemini-4-hydrogen`.
- `GEMINI_ENDPOINT` — optional endpoint override for testing. Defaults to the stable v1 Interactions endpoint above.

The route uses structured JSON output, `store: false`, a fixed system prompt, approval-checked education notes, bounded history, and server-side validation. Sensitive or advice-seeking messages are short-circuited before any provider call. If the key is missing, the provider fails, or a response is unsafe or invalid, the UI shows a “Static guide” badge and an honest notice; it does not invent a model reply. Live AI success is not claimed unless a key is configured and the response is verified.

## Testing and honest limitations

`npm test` covers the six-question model, option uniqueness, answer validation and sanitising, summary rows, suggested topics, copy text, the Groww URL, progress calculations, education source validation, sensitive/advice detection, relevant-note selection, model-reply validation, static fallback behaviour, and the Gemini request/extraction shape. Dependency installation, tests, lint, production build, browser flows, keyboard focus, responsive widths, and the local static-fallback API path were run; see `EVIDENCE.md`.

No screen-reader session, automated accessibility audit (axe), external participant test, or usability score has been completed. No claim is made about browsers or devices beyond the Chrome/Chromium runs recorded in the evidence log.
