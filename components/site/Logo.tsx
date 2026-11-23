export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#00D09C" />
      <path d="M16 42.5 26.5 32l7 7L48 24.5" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="24.5" r="4.5" fill="#fff" />
    </svg>
  );
}

export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span className={`text-[17px] font-bold tracking-tight ${tone === 'dark' ? 'text-ink' : 'text-white'}`}>Growerr</span>
    </span>
  );
}
