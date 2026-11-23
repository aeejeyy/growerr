# Growerr — AI-powered adaptive investing onboarding

Growerr is an educational onboarding companion for adults in India who are new to investing, trading or brokerage apps. It works out what a person doesn't yet understand through conversation, then builds a personalised journey of interactive simulations. The journey adapts to what the person *demonstrates*, not to what they click through. It ends with a learning summary and an optional, clearly explained handoff to Groww.

> Growerr is not a broker or a SEBI-registered investment adviser, gives no recommendations, and is not affiliated with Groww. All simulations use invented numbers.

## User journey

1. **Conversational discovery** (`components/journey/DiscoveryChat.tsx`). It opens with: *"Tell me what got you interested in investing…"*. Context-aware follow-up questions (at most about three) clarify the goal, prior experience and concerns. Users can change direction at any time.
2. **Understanding profile** (`lib/journey/profile.ts`). It tracks six knowledge dimensions with four states (not assessed → needs introduction → developing → demonstrated). Anything the user *said* can only reach "developing". Only correct check answers can reach "demonstrated". Misconceptions are tracked as open or resolved. There are no scores.
3. **Journey planner** (`lib/journey/engine.ts`). It ranks the 10-experience library against intent, the AI's focus, topic matches, misconceptions and the profile. It inserts prerequisites and explains each step ("Why this is in your plan").
4. **Interactive experiences** (`lib/journey/experiences.ts`, `components/labs/*`). Each of EXP-01 to EXP-10 has an objective, starting context, an interactive simulation, an expected outcome, 2–3 concept checks (choice, sort, slider or explain-in-your-own-words), an alternative explanation with a fresh example for every check, and a transfer question on an unfamiliar example.
5. **Evaluation and adaptation**.
   - A wrong answer records the misconception, shows an alternative explanation and inserts a *new* check on the same concept.
   - A second miss schedules a remedial experience in the plan.
   - An experience is "demonstrated" only when every concept and the transfer question are answered correctly.
   - Every adaptive decision is logged in "How your journey adapted".
6. **Summary and handoff** (`components/journey/SummaryView.tsx`). It shows:
   - the objective and the journey taken
   - concepts demonstrated, misconceptions resolved and topics to revisit
   - the simulated workflows practised and official SEBI and AMFI resources
   - a copy or download option for the summary
   - an optional Groww link (`https://groww.in/`), preceded by a "what to expect" dialog.
   Nothing is shared with Groww.

Users can pause, resume, skip, revisit, add experiences from the library, or finish without visiting Groww. Progress is saved in `localStorage` under the key `growerr:journey:v2`.

## AI architecture

| Component | Where | Notes |
|---|---|---|
| Intent analyser and knowledge diagnostician | `lib/journey/discovery.ts` | One structured Gemini call returning intent, objective, concerns, signals, misconception ids, focus ids, a follow-up question and term explanations |
| Journey planner and adaptation engine | `lib/journey/engine.ts` | Deterministic, pure functions, fully unit-tested |
| Experience generator | `lib/journey/experiences.ts` | The AI only *selects* from approved scenarios. It never generates content that gets rendered |
| Evaluator | `lib/journey/evaluation.ts`, `lib/journey/ai-evaluator.ts` | Choice, sort and slider checks are deterministic. Explain answers are graded by AI, with guards against over-generous grading |
| Safety layer | `lib/education.ts`, `app/api/journey/route.ts` | Advice requests get a boundary reply. PAN, Aadhaar, bank details and OTPs are blocked before reaching the AI. AI output is validated against enums and approved ids and scanned for advice, return promises and unsupported facts |

- The Gemini client is in `lib/ai/gemini.ts`. It calls `generateContent` with a JSON response schema, server-side only. It uses `GEMINI_MODEL` if set, otherwise falls back through `gemini-2.5-flash`, `gemini-flash-latest` and `gemini-2.0-flash`.
- If the key is missing or a call fails, a rule-based guide takes over and the UI says so.

### Environment variables

| Name | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | for AI mode | Server-side Gemini key. Without it the static guide is used |
| `GEMINI_MODEL` | no | Preferred model id |

`GET /api/journey` returns `{ ai: "configured" | "not-configured" }` for health checks.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # engine, safety, validation and persistence suite
npm run lint
npm run build
```

Stack: Next.js 15 (App Router), React 19, Tailwind CSS, lucide-react and a self-hosted Inter font. Deployed on Vercel.
