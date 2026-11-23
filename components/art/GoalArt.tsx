import type { GoalId, LevelId } from '../../lib/journey/quickstart';

/** Illustrated icons for the quick-start choices. */

const mint = '#00D09C';
const mintDark = '#00A47E';
const mint100 = '#CCF5EB';
const blue = '#5367FF';
const blue50 = '#EEF0FF';
const amber = '#F5A524';
const amber50 = '#FEF6E7';
const ink = '#1B1D29';
const line = '#E9E9EB';

export function GoalArt({ id }: { id: GoalId }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
      {id === 'grow' && (
        <>
          <rect width="64" height="64" rx="18" fill="#E6FAF5" />
          <rect x="14" y="38" width="7" height="12" rx="2" fill={mint100} />
          <rect x="25" y="32" width="7" height="18" rx="2" fill={mint100} />
          <rect x="36" y="26" width="7" height="24" rx="2" fill={mint} opacity="0.55" />
          <g className="art-grow" style={{ transformOrigin: '50px 50px' }}>
            <path d="M50 50 V30" stroke={mintDark} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M50 36 C 42 36, 40 28, 40 24 C 46 24, 50 28, 50 36 Z" fill={mint} />
            <path d="M50 32 C 56 32, 60 26, 60 20 C 54 20, 50 24, 50 32 Z" fill={mintDark} />
          </g>
        </>
      )}
      {id === 'trade' && (
        <>
          <rect width="64" height="64" rx="18" fill={blue50} />
          {[
            [16, 22, 18, 'up'],
            [26, 28, 16, 'down'],
            [36, 18, 20, 'up'],
            [46, 24, 14, 'down']
          ].map(([x, y, h, d]) => (
            <g key={x as number}>
              <path d={`M${(x as number) + 3} ${(y as number) - 5} V${(y as number) + (h as number) + 5}`} stroke={d === 'up' ? mintDark : '#EB5B3C'} strokeWidth="1.5" />
              <rect x={x as number} y={y as number} width="6" height={h as number} rx="1.5" fill={d === 'up' ? mint : '#EB5B3C'} />
            </g>
          ))}
          <g className="art-nudge">
            <circle cx="50" cy="50" r="8" fill={blue} />
            <path d="M46 48 H54 M51 45 L54 48 L51 51" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </>
      )}
      {id === 'app' && (
        <>
          <rect width="64" height="64" rx="18" fill={amber50} />
          <g className="art-lift">
            <rect x="20" y="10" width="24" height="44" rx="5" fill={ink} />
            <rect x="22" y="13" width="20" height="38" rx="3" fill="#fff" />
            <rect x="25" y="17" width="10" height="3" rx="1.5" fill={ink} opacity="0.7" />
            <rect x="25" y="23" width="14" height="8" rx="2" fill={mint100} />
            {[34, 39, 44].map((y) => (
              <rect key={y} x="25" y={y} width="14" height="2.5" rx="1.25" fill={line} />
            ))}
          </g>
          <circle cx="48" cy="18" r="6" fill={amber} />
          <text x="48" y="21" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff" fontFamily="Inter, sans-serif">?</text>
        </>
      )}
      {id === 'curious' && (
        <>
          <rect width="64" height="64" rx="18" fill="#F3F4F6" />
          <circle cx="32" cy="32" r="17" fill="#fff" stroke={line} strokeWidth="2" />
          <g className="art-spin" style={{ transformOrigin: '32px 32px' }}>
            <path d="M32 19 L36 32 L32 45 L28 32 Z" fill={blue} opacity="0.15" />
            <path d="M32 19 L36 32 H28 Z" fill="#EB5B3C" />
            <path d="M32 45 L36 32 H28 Z" fill={blue} />
          </g>
          <circle cx="32" cy="32" r="2.5" fill={ink} />
          <circle cx="50" cy="14" r="3" fill={amber} />
          <circle cx="14" cy="50" r="2" fill={mint} />
        </>
      )}
    </svg>
  );
}

/** Seed → sapling → tree: how far along someone is. */
export function LevelArt({ id }: { id: LevelId }) {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="#E6FAF5" />
      <path d="M10 38 H38" stroke={mint100} strokeWidth="3" strokeLinecap="round" />
      {id === 'none' && (
        <g className="art-grow" style={{ transformOrigin: '24px 37px' }}>
          <ellipse cx="24" cy="35" rx="5" ry="3.5" fill="#B9874B" />
          <path d="M24 32 C 24 28, 26 26, 29 26" stroke={mintDark} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}
      {id === 'some' && (
        <g className="art-grow" style={{ transformOrigin: '24px 37px' }}>
          <path d="M24 37 V22" stroke={mintDark} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 28 C 16 28, 14 21, 14 18 C 20 18, 24 21, 24 28 Z" fill={mint} />
          <path d="M24 24 C 31 24, 34 18, 34 14 C 28 14, 24 17, 24 24 Z" fill={mintDark} />
        </g>
      )}
      {id === 'experienced' && (
        <g className="art-grow" style={{ transformOrigin: '24px 37px' }}>
          <path d="M24 37 V24" stroke="#8A6A3B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="18" r="9" fill={mint} />
          <circle cx="17" cy="23" r="6" fill={mintDark} />
          <circle cx="31" cy="23" r="6" fill={mintDark} />
          <circle cx="27" cy="15" r="2" fill={amber} />
          <circle cx="19" cy="17" r="1.8" fill={amber} />
        </g>
      )}
    </svg>
  );
}
