import type { Metadata } from 'next';
import Coach from '../../components/Coach';

export const metadata: Metadata = {
  title: 'Educational guide — Growerr',
  description: 'A calm, source-backed guide that clarifies your questions and explains general investing ideas. No product recommendations.'
};

export default function CoachPage() {
  return (
    <div className="page coach-page-wrap">
      <Coach />
    </div>
  );
}
