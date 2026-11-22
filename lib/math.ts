export type Percent = 10 | 20 | 30;
export function illustrativeDecline(amount: number, percent: Percent): number {
  if (!Number.isFinite(amount) || amount <= 0 || ![10, 20, 30].includes(percent)) throw new Error('Invalid illustration');
  return Math.round((amount * percent / 100) * 100) / 100;
}
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
}
