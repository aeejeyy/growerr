import Link from 'next/link';
import { Logo } from './Logo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Growerr home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link href="/#how" className="btn-ghost btn-sm hidden sm:inline-flex">How it works</Link>
          <Link href="/#library" className="btn-ghost btn-sm hidden md:inline-flex">Experiences</Link>
          <Link href="/about" className="btn-ghost btn-sm">About</Link>
          <Link href="/start" className="btn-primary btn-sm">Get started</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
            An adaptive onboarding companion that helps beginners understand investing and brokerage apps — before any money is involved.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <Link href="/start" className="text-ink-soft hover:text-ink">Get started</Link>
          <Link href="/#how" className="text-ink-soft hover:text-ink">How it works</Link>
          <Link href="/#library" className="text-ink-soft hover:text-ink">Experiences</Link>
          <Link href="/about" className="text-ink-soft hover:text-ink">About &amp; safety</Link>
          <Link href="/about#privacy" className="text-ink-soft hover:text-ink">Privacy</Link>
        </nav>
        <p className="text-xs leading-relaxed text-ink-muted md:col-span-2">
          Growerr is an independent educational prototype. It is not a broker or a SEBI-registered investment adviser, does not provide investment
          advice or recommendations, and is not affiliated with, endorsed by or partnered with Groww. All simulations use invented numbers — never live
          market data. Investments in securities markets are subject to market risks.
        </p>
      </div>
    </footer>
  );
}
