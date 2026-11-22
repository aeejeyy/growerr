import { Suspense } from 'react';
import Journey from '../../components/Journey';
export default function JourneyPage() { return <Suspense fallback={<div className="page narrow"><p>Loading your decision...</p></div>}><Journey /></Suspense>; }
