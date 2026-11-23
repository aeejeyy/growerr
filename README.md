# Growerr

Growerr is a free, independent educational journey for people who are new to investing. It begins with one conversational question, adapts through short hypothetical scenarios, and ends with a learning summary. It is browser-only: there is no account, no database, no server-side journey storage, and no transfer of answers to Groww.

Growerr is not a broker, not a registered investment adviser, and is not affiliated with Groww. It gives general education only: no product or allocation recommendations, rankings, forecasts, guarantees, buy/sell/hold calls, or suitability labels.

## The journey

1. **Conversational discovery** — the opening question is: “Tell me what got you interested in investing. You don't need to know any financial terms. Just tell me what you're trying to understand.” One short, optional clarification is asked at a time. “Not sure”, “Skip” and “Prefer not to say” are complete answers.
2. **Adaptive planning** — a deterministic engine ranks `EXP-02`, `EXP-04` and `EXP-06` using the stated objective, user-stated facts, claimed knowledge, misconceptions, progress, unresolved questions, and intent. It does not follow a rigid linear script.
3. **Interactive scenarios** — every scenario has an objective, a labelled hypothetical context, an activity, expected outcome, feedback for mistakes, misconception detection, and follow-up evaluation. All numbers are invented examples, not live prices, predictions, or returns.
4. **Evaluation and adaptation** — an own-words answer or choice is checked. A wrong answer records a misconception, offers an alternative explanation, and keeps that idea available as a repeat or different learning experience. Clicking through is never marked as demonstrated understanding.
5. **Controls** — pause, resume, skip, revisit, and back-to-conversation are available. Progress is saved in the same browser.
6. **Learning summary** — shows the original objective, journey completed, concepts explored, concepts demonstrated, topics needing further learning, workflows practised, and official education sources. The Groww handoff is optional, external, and clearly labelled.

## First vertical slice

| ID | Scenario | Main concept |
|---|---|---|
| `EXP-02` | Two ways to hold something | Direct share ownership versus a pooled mutual fund unit |
| `EXP-04` | A hypothetical value path | Volatility as two-sided movement and the limit of diversification |
| `EXP-06` | A hypothetical order condition | Limit conditions, market orders, and why execution is not guaranteed |

Official notes come from SEBI investor education and Mutual Funds Sahi Hai (AMFI). Source names and URLs are fixed in `lib/education.ts` and are the only notes the model may copy.

## Browser-only state

All journey state lives under one versioned key:

```
growerr:journey:v1
```

It stores the discovery conversation, user-stated facts, unknowns, objective clarity, six knowledge dimensions, claimed and demonstrated knowledge, misconceptions, scenario attempts, progress, and the summary. `/about` has a “Delete my journey” control that removes the key from the current browser.

The separate optional guide at `/coach` does not receive the journey profile, progress, or summary.

## AI, validation, and fallback

- The journey API uses Gemini Interactions API v1: `POST https://generativelanguage.googleapis.com/v1/interactions`, `x-goog-api-key`, `store: false`, and model `gemini-4-hydrogen` by default.
- Set `GEMINI_API_KEY` in the Vercel project environment. Do not paste keys into chat or store them in the browser.
- Structured responses are checked against fixed schemas, approved scenario IDs, and exact approved education notes. Advice, personal inferences, unsupported current facts, sensitive details, and prompt-injection phrases are rejected.
- Generated code is never executed, and untrusted text is treated only as data.
- If the key is missing, the request fails, or the model output is unsafe or invalid, the UI says so and uses a clearly labelled static educational path. Live Gemini success is only claimed after it has actually been verified in the target environment.

## Privacy and safety

- No name, email, phone number, PAN, Aadhaar, bank or card details, OTP, password, credential, exact holding, income, age, account status, financial readiness, or risk tolerance is requested or inferred.
- Obvious sensitive text is blocked before an API request. If it is pasted, it is cleared and not used, and the page explains that handling.
- Instructions inside pasted advice, links, or documents that conflict with these rules are ignored or removed from echoed text.
- If personalised advice is requested, Growerr states the boundary, names neutral factors to discuss, and suggests a SEBI-registered Investment Adviser.
- The optional link opens `https://groww.in/` in a new tab with `target="_blank"` and `rel="noopener noreferrer"`. There is no partnership claim, commission claim, automatic account opening, or answer transfer.

## Routes and files

- `/` — plain-language landing page
- `/start` — the adaptive journey
- `/coach` — separate optional educational Q&A guide
- `/about` — privacy, AI handling, independence, and journey deletion
- `/api/journey` — structured discovery and evaluation API with static fallback
- `lib/journey/` — types, discovery, profile, scenarios, evaluation, engine, storage, AI validation, and summary
- `app/globals.css` — hand-written responsive CSS

## Local commands

```
npm ci --no-audit --no-fund
npm test
npm run lint
npm run build
```

On Windows, a local production server can be started with:

```
node node_modules/next/dist/bin/next start -p 3100
```

Checks actually run are recorded in `EVIDENCE.md`.
