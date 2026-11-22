import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Growerr — a clearer first step into investing',
  description: 'Six simple questions turn into a personal starting point for your investing journey. Independent, private, and free.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="brand" aria-label="Growerr home">
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path d="M12 21v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 14c0-4 3.2-7 8-7 0 5-3.2 8-8 8Z" fill="currentColor" />
                  <path d="M12 17c0-3.2-2.6-5.6-6.2-5.6 0 3.8 2.6 5.6 6.2 5.6Z" fill="currentColor" opacity=".7" />
                </svg>
              </span>
              Growerr
            </Link>
            <nav className="nav" aria-label="Main navigation">
              <Link href="/#how" className="nav-secondary">How it works</Link>
              <Link href="/about">Privacy</Link>
              <Link href="/start" className="button primary button-small">Get started</Link>
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <Link href="/" className="brand" aria-label="Growerr home">
                <span className="brand-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <path d="M12 21v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M12 14c0-4 3.2-7 8-7 0 5-3.2 8-8 8Z" fill="currentColor" />
                    <path d="M12 17c0-3.2-2.6-5.6-6.2-5.6 0 3.8 2.6 5.6 6.2 5.6Z" fill="currentColor" opacity=".7" />
                  </svg>
                </span>
                Growerr
              </Link>
              <p>A clearer first step into investing.</p>
            </div>
            <nav className="footer-links" aria-label="Footer navigation">
              <Link href="/#how">How it works</Link>
              <Link href="/about">Privacy &amp; independence</Link>
              <Link href="/start">Get started</Link>
            </nav>
            <p className="footer-disclaimer">
              Growerr is an independent educational tool. It is not affiliated with Groww and does not provide investment advice.
              Groww is a separate platform with its own terms and privacy policy.
            </p>
            <p className="footer-meta">© 2026 Growerr · Answers stay in your browser.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
