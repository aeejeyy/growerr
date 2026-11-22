# Growerr

A free, independent onboarding experience for people who are new to investing. Six simple questions become a plain-language starting point, and then the user can continue to Groww to explore account options and beginner guides.

Growerr is not a broker, does not open accounts or execute trades, is not affiliated with Groww, and does not provide investment advice.

## The flow

1. **Landing** — a short explanation of what Growerr does, who it is for, and how the Groww handoff works.
2. **Six questions** — one question per screen: reason, timeline, reaction to a market fall, optional starting amount, experience, and what matters most.
3. **Starting point** — a six-row summary with an “Explore first” list of educational topics. Every answer can be changed from the summary.
4. **Continue to Groww** — a clearly labelled external link to `https://groww.in/`, opened in a new tab with `noopener noreferrer`.

Answers are saved under the versioned key `growerr:onboarding:v1` in this browser only. They are not posted to a server or shared with Groww. A returning visitor sees their saved summary. “Start over” on the summary or “Delete my answers” on `/about` removes the saved data.

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
- `/about` — privacy, independence, what is asked and why, and clear-my-answers
- `/icon.svg` — site icon

## Privacy and independence

- No account, name, email, phone number, PAN, Aadhaar, bank details, broker login, holdings, or income details.
- No server-side storage, analytics script, or mailing list.
- No answers are sent to Groww; the Groww link opens a separate platform under its own terms and privacy policy.
- The summary and suggested topics are educational, not recommendations. Investments can fall as well as rise.

## Deployment

Live production deployment: **https://growerr.vercel.app**

The Vercel project `growerr` is connected to the private GitHub repository `aeejeyy/growerr` and deploys the `main` branch with the standard Next.js preset. No secrets, environment variables, or external integrations are required. Local and production browser checks are recorded in `EVIDENCE.md`.

## Testing and honest limitations

`npm test` covers the six-question model, option uniqueness, answer validation and sanitising, summary rows, suggested topics, copy text, the Groww URL, and progress calculations. Dependency installation, tests, lint, production build, the full browser flow, keyboard focus, and responsive widths were run locally and against the production URL; see `EVIDENCE.md`.

No screen-reader session, automated accessibility audit (axe), external participant test, or usability score has been completed. No claim is made about browsers or devices beyond the Chrome/Chromium runs recorded in the evidence log.
