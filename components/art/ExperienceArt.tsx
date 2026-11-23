import type { ExperienceId } from '../../lib/journey/types';

/**
 * Small illustrated scenes, one per experience. Pure SVG in the brand palette, so they stay crisp
 * at any size and weigh almost nothing. Elements with `art-*` classes animate gently on hover
 * (see globals.css) and are static when the user prefers reduced motion.
 */

const C = {
  mint: '#00D09C',
  mintDark: '#00A47E',
  mint100: '#CCF5EB',
  mint50: '#E6FAF5',
  blue: '#5367FF',
  blue50: '#EEF0FF',
  amber: '#F5A524',
  amber50: '#FEF6E7',
  red: '#EB5B3C',
  red50: '#FDEFEC',
  ink: '#1B1D29',
  soft: '#6B6E7E',
  line: '#E9E9EB',
  white: '#FFFFFF'
};

type Tone = 'mint' | 'blue' | 'amber';
const BG: Record<Tone, [string, string]> = {
  mint: [C.mint50, '#F3FCF9'],
  blue: [C.blue50, '#F7F8FF'],
  amber: [C.amber50, '#FFFBF3']
};

export const EXPERIENCE_TONE: Record<ExperienceId, Tone> = {
  'EXP-01': 'mint',
  'EXP-02': 'blue',
  'EXP-03': 'amber',
  'EXP-04': 'blue',
  'EXP-05': 'mint',
  'EXP-06': 'blue',
  'EXP-07': 'amber',
  'EXP-08': 'mint',
  'EXP-09': 'amber',
  'EXP-10': 'blue'
};

function Frame({ id, tone, children }: { id: string; tone: Tone; children: React.ReactNode }) {
  const [a, b] = BG[tone];
  return (
    <>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect width="160" height="100" rx="14" fill={`url(#bg-${id})`} />
      <circle cx="140" cy="14" r="26" fill={C.white} opacity="0.55" />
      <circle cx="18" cy="92" r="20" fill={C.white} opacity="0.5" />
      {children}
    </>
  );
}

const SCENES: Record<ExperienceId, (id: string) => React.ReactNode> = {
  // A company split into equal shares; one share pulled out.
  'EXP-01': (id) => (
    <Frame id={id} tone="mint">
      <g transform="translate(66 50)">
        {Array.from({ length: 8 }, (_, i) => {
          const a0 = (i * Math.PI) / 4 - Math.PI / 2;
          const a1 = a0 + Math.PI / 4;
          const r = 30;
          const d = `M0 0 L${(r * Math.cos(a0)).toFixed(2)} ${(r * Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(2)} ${(r * Math.sin(a1)).toFixed(2)} Z`;
          return <path key={i} d={d} fill={i === 1 ? 'transparent' : i % 2 ? C.mint : C.mint100} stroke={C.white} strokeWidth="1.5" />;
        })}
      </g>
      {/* The missing slice, pulled out along its own direction. */}
      <g transform="translate(76 45)">
        <g className="art-lift">
          <path d="M0 0 L21.21 -21.21 A30 30 0 0 1 30 0 Z" fill={C.mintDark} stroke={C.white} strokeWidth="1.5" />
        </g>
      </g>
      <path d="M112 40 C 120 44, 122 52, 120 58" fill="none" stroke={C.soft} strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="2 2" />
      <rect x="102" y="60" width="40" height="17" rx="8.5" fill={C.white} stroke={C.line} />
      <text x="122" y="71.5" textAnchor="middle" fontSize="8" fontWeight="700" fill={C.mintDark} fontFamily="Inter, sans-serif">1 share</text>
    </Frame>
  ),
  // One coin into one company vs a basket holding many.
  'EXP-02': (id) => (
    <Frame id={id} tone="blue">
      <g>
        <rect x="22" y="44" width="30" height="34" rx="4" fill={C.white} stroke={C.line} />
        <rect x="28" y="50" width="6" height="6" rx="1" fill={C.blue50} />
        <rect x="40" y="50" width="6" height="6" rx="1" fill={C.blue50} />
        <rect x="28" y="62" width="6" height="6" rx="1" fill={C.blue50} />
        <rect x="40" y="62" width="6" height="6" rx="1" fill={C.blue50} />
        <g className="art-drop">
          <circle cx="37" cy="28" r="8" fill={C.amber} />
          <text x="37" y="31" textAnchor="middle" fontSize="9" fontWeight="700" fill={C.white} fontFamily="Inter, sans-serif">₹</text>
        </g>
      </g>
      <line x1="80" y1="22" x2="80" y2="82" stroke={C.line} strokeDasharray="3 3" />
      <g>
        <path d="M98 52 H146 L140 80 H104 Z" fill={C.blue} />
        <path d="M98 52 H146" stroke={C.ink} strokeOpacity="0.15" strokeWidth="2" />
        <g className="art-bob">
          {[
            [108, 46, C.mint],
            [118, 42, C.amber],
            [128, 45, C.mint100],
            [138, 43, C.red],
            [113, 36, C.blue50],
            [124, 33, C.mint],
            [134, 35, C.amber50]
          ].map(([x, y, f], i) => (
            <circle key={i} cx={x as number} cy={y as number} r="6" fill={f as string} stroke={C.white} strokeWidth="1.5" />
          ))}
        </g>
      </g>
    </Frame>
  ),
  // Slow, long-term growth vs short, frequent moves.
  'EXP-03': (id) => (
    <Frame id={id} tone="amber">
      <path d="M14 78 C 44 74, 60 62, 80 56 S 120 34, 146 24" fill="none" stroke={C.mint} strokeWidth="3" strokeLinecap="round" className="art-draw" />
      <path d="M14 70 L26 58 L36 66 L48 50 L58 62 L70 46 L80 58" fill="none" stroke={C.amber} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <g transform="translate(140 18)">
        <path d="M0 8 C -6 2, -2 -6, 0 -8 C 2 -6, 6 2, 0 8 Z" fill={C.mintDark} />
        <path d="M0 8 V14" stroke={C.mintDark} strokeWidth="2" />
      </g>
      <g transform="translate(84 40)" className="art-pulse">
        <path d="M2 -8 L-4 2 H1 L-2 10 L6 -1 H1 Z" fill={C.amber} />
      </g>
      <text x="16" y="92" fontSize="7" fontWeight="600" fill={C.soft} fontFamily="Inter, sans-serif">days</text>
      <text x="116" y="92" fontSize="7" fontWeight="600" fill={C.soft} fontFamily="Inter, sans-serif">years</text>
    </Frame>
  ),
  // A bumpy path that still trends somewhere.
  'EXP-04': (id) => (
    <Frame id={id} tone="blue">
      <path d="M12 64 H148" stroke={C.line} strokeDasharray="3 3" />
      <path
        d="M12 64 L26 52 L36 60 L50 40 L62 56 L74 46 L86 70 L98 54 L112 60 L124 34 L136 44 L148 28"
        fill="none"
        stroke={C.blue}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="art-draw"
      />
      <path d="M12 64 L26 52 L36 60 L50 40 L62 56 L74 46 L86 70 L98 54 L112 60 L124 34 L136 44 L148 28 V88 H12 Z" fill={C.blue} opacity="0.08" />
      <circle cx="86" cy="70" r="4" fill={C.red} stroke={C.white} strokeWidth="1.5" />
      <circle cx="124" cy="34" r="4" fill={C.mint} stroke={C.white} strokeWidth="1.5" />
      <g transform="translate(86 80)">
        <path d="M0 -3 L-3 1 H3 Z" fill={C.red} transform="rotate(180)" />
      </g>
    </Frame>
  ),
  // Order book: buyers and sellers; a market order takes the best price.
  'EXP-05': (id) => (
    <Frame id={id} tone="mint">
      {[30, 24, 18].map((w, i) => (
        <g key={`a${i}`}>
          <rect x={80 - w - 2} y={18 + i * 11} width={w} height="8" rx="2" fill={C.red} opacity={0.25 + i * 0.2} />
          <text x="86" y={25 + i * 11} fontSize="7" fontWeight="600" fill={C.soft} fontFamily="Inter, sans-serif">{102 - i}</text>
        </g>
      ))}
      <rect x="40" y="52" width="80" height="1.5" fill={C.ink} opacity="0.15" />
      {[22, 30, 26].map((w, i) => (
        <g key={`b${i}`}>
          <rect x={80 - w - 2} y={58 + i * 11} width={w} height="8" rx="2" fill={C.mint} opacity={0.9 - i * 0.25} />
          <text x="86" y={65 + i * 11} fontSize="7" fontWeight="600" fill={C.soft} fontFamily="Inter, sans-serif">{99 - i}</text>
        </g>
      ))}
      <g className="art-nudge">
        <rect x="108" y="36" width="40" height="16" rx="8" fill={C.ink} />
        <text x="128" y="47" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={C.white} fontFamily="Inter, sans-serif">Buy now</text>
        <path d="M106 44 L100 41" stroke={C.ink} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </Frame>
  ),
  // A price line and the limit price you chose.
  'EXP-06': (id) => (
    <Frame id={id} tone="blue">
      <path d="M14 30 L30 38 L44 34 L58 48 L72 44 L86 60 L100 56 L114 66 L130 58 L146 62" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M14 60 H146" stroke={C.mintDark} strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="16" y="64" width="44" height="14" rx="7" fill={C.mintDark} />
      <text x="38" y="73.5" textAnchor="middle" fontSize="7" fontWeight="700" fill={C.white} fontFamily="Inter, sans-serif">Your limit</text>
      <g transform="translate(86 60)" className="art-pulse">
        <circle r="7" fill={C.mint} opacity="0.25" />
        <circle r="3.5" fill={C.mintDark} />
      </g>
    </Frame>
  ),
  // A limit set below the market: the order waits.
  'EXP-07': (id) => (
    <Frame id={id} tone="amber">
      <path d="M14 40 L30 34 L46 42 L62 30 L78 38 L94 28 L110 36 L126 30 L146 34" fill="none" stroke={C.ink} strokeOpacity="0.6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M14 70 H146" stroke={C.amber} strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="16" y="82" fontSize="7" fontWeight="700" fill="#8A5A00" fontFamily="Inter, sans-serif">Limit too low</text>
      <g transform="translate(126 62)" className="art-tilt">
        <rect x="-9" y="-12" width="18" height="2.5" rx="1" fill={C.amber} />
        <rect x="-9" y="9.5" width="18" height="2.5" rx="1" fill={C.amber} />
        <path d="M-6 -9.5 H6 L1 0 L6 9.5 H-6 L-1 0 Z" fill={C.white} stroke={C.amber} strokeWidth="1.5" />
        <path d="M-3 7 H3 L0 3 Z" fill={C.amber} />
      </g>
    </Frame>
  ),
  // A simplified broker app screen.
  'EXP-08': (id) => (
    <Frame id={id} tone="mint">
      <g className="art-lift">
        <rect x="56" y="10" width="48" height="84" rx="8" fill={C.ink} />
        <rect x="59" y="14" width="42" height="76" rx="5" fill={C.white} />
        <rect x="63" y="19" width="20" height="4" rx="2" fill={C.ink} opacity="0.8" />
        <rect x="63" y="27" width="34" height="14" rx="3" fill={C.mint50} />
        <path d="M65 37 L71 33 L76 35 L82 30 L95 31" fill="none" stroke={C.mint} strokeWidth="1.5" />
        {[46, 55, 64].map((y) => (
          <g key={y}>
            <circle cx="66" cy={y + 3} r="2.5" fill={C.line} />
            <rect x="71" y={y + 1} width="16" height="3" rx="1.5" fill={C.line} />
            <rect x="90" y={y + 1} width="7" height="3" rx="1.5" fill={C.mint100} />
          </g>
        ))}
        <rect x="59" y="80" width="42" height="10" fill={C.white} />
        {[66, 76, 86, 94].map((x, i) => (
          <circle key={x} cx={x} cy="85" r="2" fill={i === 0 ? C.mintDark : C.line} />
        ))}
      </g>
      <g className="art-bob">
        <rect x="112" y="30" width="34" height="14" rx="7" fill={C.white} stroke={C.line} />
        <text x="129" y="39.5" textAnchor="middle" fontSize="7" fontWeight="700" fill={C.ink} fontFamily="Inter, sans-serif">Holdings</text>
        <rect x="14" y="56" width="34" height="14" rx="7" fill={C.white} stroke={C.line} />
        <text x="31" y="65.5" textAnchor="middle" fontSize="7" fontWeight="700" fill={C.ink} fontFamily="Inter, sans-serif">Orders</text>
      </g>
    </Frame>
  ),
  // A receipt listing charges.
  'EXP-09': (id) => (
    <Frame id={id} tone="amber">
      <g className="art-lift">
        <path d="M50 12 H110 V86 L104 82 L98 86 L92 82 L86 86 L80 82 L74 86 L68 82 L62 86 L56 82 L50 86 Z" fill={C.white} stroke={C.line} />
        <rect x="58" y="22" width="28" height="4" rx="2" fill={C.ink} opacity="0.8" />
        {[34, 44, 54].map((y, i) => (
          <g key={y}>
            <rect x="58" y={y} width={[30, 22, 26][i]} height="3" rx="1.5" fill={C.line} />
            <rect x="94" y={y} width="9" height="3" rx="1.5" fill={C.amber} opacity="0.6" />
          </g>
        ))}
        <path d="M58 64 H103" stroke={C.line} />
        <rect x="58" y="70" width="18" height="4" rx="2" fill={C.ink} opacity="0.7" />
        <rect x="90" y="70" width="13" height="4" rx="2" fill={C.amber} />
      </g>
      <g className="art-bob">
        <circle cx="126" cy="64" r="12" fill={C.amber} />
        <circle cx="126" cy="64" r="8.5" fill="none" stroke={C.white} strokeOpacity="0.6" />
        <text x="126" y="68" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.white} fontFamily="Inter, sans-serif">₹</text>
      </g>
    </Frame>
  ),
  // Order → executed → holding.
  'EXP-10': (id) => (
    <Frame id={id} tone="blue">
      <path d="M30 50 H130" stroke={C.blue} strokeWidth="2" strokeDasharray="4 4" className="art-flow" />
      {[
        [30, C.white, C.blue, 'Order'],
        [80, C.white, C.blue, 'Executed'],
        [130, C.mint, C.mint, 'Holding']
      ].map(([x, fill, stroke, label], i) => (
        <g key={i}>
          <circle cx={x as number} cy="50" r="13" fill={fill as string} stroke={stroke as string} strokeWidth="2" />
          <text x={x as number} y="78" textAnchor="middle" fontSize="7.5" fontWeight="700" fill={C.soft} fontFamily="Inter, sans-serif">{label as string}</text>
        </g>
      ))}
      <rect x="24" y="45" width="12" height="10" rx="2" fill="none" stroke={C.blue} strokeWidth="1.5" />
      <path d="M27 48 H33 M27 51 H31" stroke={C.blue} strokeWidth="1.2" />
      <path d="M75 50 L79 54 L86 46" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M124 52 L128 48 L132 51 L137 45" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  )
};

export default function ExperienceArt({ id, className, title }: { id: ExperienceId; className?: string; title?: string }) {
  const key = id.toLowerCase();
  return (
    <svg viewBox="0 0 160 100" className={`block h-auto w-full ${className ?? ''}`} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {SCENES[id](key)}
    </svg>
  );
}
