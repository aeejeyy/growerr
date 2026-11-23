# Verification evidence

Only checks that were actually run are recorded here.

## Automated (`npm test`, 475 checks)

- **Library integrity:** 10 experiences. Every core check has an alternative and a transfer question. Every id resolves. Each check accepts its right answer and rejects a wrong one.
- **Static intent classification:** 20/20 labelled utterances.
- **Personalised planning:**
  - User A ("₹5,000… stocks vs mutual funds"): EXP-01 → EXP-02 → EXP-04
  - User B ("I understand stocks and mutual funds, but not limit orders"): EXP-05 → EXP-06 → EXP-07
  - Platform beginner: EXP-08 first
  - Every plan item carries a reason.
- **Claimed vs demonstrated:** discovery claims never produce "demonstrated".
- **Adaptation after a wrong answer:**
  - It shows an alternative explanation, then a different check.
  - The misconception is recorded, then resolved once a fresh example is answered correctly.
  - A second miss schedules a remedial experience.
  - An all-wrong run is "needs review" with no dimension demonstrated.
- **Demonstrated understanding:** all 10 experiences reach "demonstrated" only when every check, including the transfer question, is answered correctly.
- **Navigation:** skip, revisit, add from library and finish early all work. The summary carries the disclaimer and has no advice phrasing.
- **Safety:**
  - Advice requests and sensitive identifiers are detected.
  - AI output with advice or return promises is rejected, and so are invalid intents and non-objects.
  - Unknown experience and misconception ids are stripped.
- **Persistence:** state round-trips. Tampered or foreign state is sanitised.

## Manual (local browser)

- Discovery, then plan, then EXP-01 run end to end. A wrong answer showed the alternative explanation and a fresh example, the profile updated live, and the result was "Understanding demonstrated".
- The summary showed the resolved misconception. The Groww handoff dialog opened without navigating away.
- All 10 labs rendered with no console errors and no horizontal overflow at 375px. The landing and journey pages had no overflow at 375px.

## Not yet verified

- Live Gemini responses on production. See the deployment notes in the commit history.
