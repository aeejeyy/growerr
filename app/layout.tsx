import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = {
  title: 'Growerr — think through an investment decision',
  description: 'A private, educational space to understand uncertainty, record your reasoning, and revisit a decision.'
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="header-inner"><Link href="/" className="brand" aria-label="Growerr home"><span className="brand-mark" aria-hidden="true">G</span> Growerr</Link>
      <nav className="nav" aria-label="Main navigation"><Link href="/start">Start</Link><Link href="/library">My decisions</Link><Link href="/learn">Learn</Link><Link href="/about">About & privacy</Link></nav></div></header>
    <main id="main">{children}</main></body></html>;
}
