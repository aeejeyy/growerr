import type { Metadata } from 'next';
import JourneyApp from '../../components/journey/JourneyApp';

export const metadata: Metadata = {
  title: 'Your journey — Growerr',
  description: 'Tell Growerr what you want to understand, then learn through interactive simulations that adapt to what you show.'
};

export default function StartPage() {
  return <JourneyApp />;
}
