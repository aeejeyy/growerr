import type { Metadata } from 'next';
import Journey from '../../components/Journey';

export const metadata: Metadata = {
  title: 'Start your journey — Growerr',
  description: 'Tell Growerr what you are trying to understand, then learn through short hypothetical scenarios that adapt as you go.'
};

export default function StartPage() {
  return (
    <div className="page journey-page">
      <Journey />
    </div>
  );
}
