import type { Metadata } from 'next';
import Onboarding from '../../components/Onboarding';

export const metadata: Metadata = {
  title: 'Find your starting point — Growerr',
  description: 'Six simple questions about your goals, timeline and comfort with risk, turned into a clear starting point for investing.'
};

export default function StartPage() {
  return (
    <div className="page onboarding-page">
      <Onboarding />
    </div>
  );
}
