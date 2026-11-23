/**
 * Contract for every interactive lab.
 *
 * - Labs are self-contained client components with no network calls.
 * - All numbers are invented and the lab must show <SimBadge /> near any value.
 * - Call `onExplored()` once the person has meaningfully interacted
 *   (e.g. moved a slider AND triggered an outcome). It unlocks the checks.
 * - Never show real company names, tickers, live prices, returns or forecasts.
 */
export type LabProps = {
  onExplored: () => void;
  explored: boolean;
};
