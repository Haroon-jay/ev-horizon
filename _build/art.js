/* Generative SVG art system — animated light-trace EVs, no external images.
   Animation keyframes live in assets/css/style.css (.ev-glide, .ev-spin, …)
   and are disabled automatically under prefers-reduced-motion. */

let uid = 0;
function id(name) { return `${name}-${++uid}`; }

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const PALETTES = [
  ['#00D4FF', '#7CFF6B'],
  ['#00D4FF', '#7C5CFF'],
  ['#7CFF6B', '#00D4FF'],
  ['#38E8D2', '#00D4FF'],
  ['#7C5CFF', '#00D4FF'],
];

/**
 * Light-trace EV silhouette (local coords: nose at x≈250, ground at y=80).
 * Returns a <g> — caller positions it with translate/scale. ~290 units wide
 * including the headlight beam.
 */
function carTrace(a, b, { glideDur = 7, spinDur = 1.7, beam = true } = {}) {
  const wheel = (cx) => `
    <g>
      <circle cx="${cx}" cy="80" r="18" fill="none" stroke="${a}" stroke-width="3"/>
      <circle cx="${cx}" cy="80" r="7.5" fill="none" stroke="${b}" stroke-width="1.8" stroke-opacity="0.9"/>
      <g class="ev-spin" style="animation-duration:${spinDur}s">
        <line x1="${cx - 13}" y1="80" x2="${cx + 13}" y2="80" stroke="${a}" stroke-width="1.6" stroke-opacity="0.55"/>
        <line x1="${cx}" y1="67" x2="${cx}" y2="93" stroke="${a}" stroke-width="1.6" stroke-opacity="0.55"/>
        <line x1="${cx - 9}" y1="71" x2="${cx + 9}" y2="89" stroke="${a}" stroke-width="1.3" stroke-opacity="0.4"/>
      </g>
    </g>`;
  return `
  <g class="ev-glide" style="animation-duration:${glideDur}s">
    <ellipse cx="128" cy="86" rx="155" ry="11" fill="${a}" opacity="0.09"/>
    <path d="M10 80 C10 66 18 56 34 51 C50 31 82 19 118 17 C156 15 188 25 210 39 C228 43 242 51 248 61 C251 69 248 76 240 79 L218 80"
          fill="none" stroke="${a}" stroke-width="3" stroke-linecap="round"/>
    <path d="M44 50 C62 34 96 24 126 23 C158 22 184 30 200 40"
          fill="none" stroke="${b}" stroke-width="1.8" stroke-opacity="0.85"/>
    <line x1="84" y1="80" x2="164" y2="80" stroke="${a}" stroke-width="2" stroke-opacity="0.5"/>
    <line x1="4" y1="62" x2="-12" y2="62" stroke="${b}" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.8"/>
    ${wheel(62)}
    ${wheel(186)}
    ${beam ? `
    <line class="ev-beam" x1="252" y1="61" x2="292" y2="61" stroke="${b}" stroke-width="3" stroke-linecap="round"/>
    <line class="ev-beam" x1="246" y1="49" x2="276" y2="49" stroke="${b}" stroke-width="1.6" stroke-linecap="round" style="animation-delay:0.6s"/>` : ''}
  </g>`;
}

/** Animated speed streaks (placed behind the car, local coords). */
function streaks(a, n, seedNum) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const y = 30 + ((seedNum >> (i * 2)) % 55);
    const len = 120 + ((seedNum >> (i * 3)) % 90);
    const dur = (1.4 + ((seedNum >> i) % 14) / 10).toFixed(1);
    const cls = i % 2 ? 'ev-streak2' : 'ev-streak';
    out += `<line class="${cls}" style="animation-duration:${dur}s" x1="${-20 - len}" y1="${y}" x2="-12" y2="${y}"
      stroke="${a}" stroke-width="${i % 2 ? 1.4 : 2}" stroke-opacity="${i % 2 ? 0.3 : 0.5}"
      stroke-dasharray="26 64" stroke-linecap="round"/>`;
  }
  return out;
}

/**
 * Abstract "horizon + driving EV" card art. Deterministic per seed, animated.
 */
export function cardArt(seed, { w = 800, h = 450, title = '' } = {}) {
  const n = hash(seed);
  const [a, b] = PALETTES[n % PALETTES.length];
  const glowX = 18 + (n % 64);
  const horizonY = h * (0.60 + ((n >> 3) % 12) / 100);
  const bgId = id('bg'), hzId = id('hz'), glId = id('gl'), grId = id('gr');

  // perspective grid converging on the horizon
  const cx = w * (0.3 + ((n >> 4) % 40) / 100);
  let grid = '';
  for (let i = -6; i <= 6; i++) {
    grid += `<line x1="${cx + i * 26}" y1="${horizonY}" x2="${cx + i * w * 0.22}" y2="${h + 40}" stroke="url(#${grId})" stroke-width="1"/>`;
  }
  for (let i = 1; i <= 4; i++) {
    const y = horizonY + Math.pow(i / 4, 1.7) * (h - horizonY);
    grid += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="url(#${grId})" stroke-width="1"/>`;
  }

  // twinkling sky dots
  let dots = '';
  for (let i = 0; i < 6; i++) {
    const dx = (hash(seed + 'd' + i) % w);
    const dy = (hash(seed + 'y' + i) % Math.round(horizonY * 0.7)) + 12;
    const dr = 1.5 + (hash(seed + 'r' + i) % 3);
    const delay = (hash(seed + 't' + i) % 30) / 10;
    dots += `<circle class="ev-twinkle" style="animation-delay:${delay}s" cx="${dx}" cy="${dy}" r="${dr}" fill="${i % 2 ? a : b}"/>`;
  }

  // small orbit ring accent in the sky
  const orbX = w * (0.15 + ((n >> 5) % 65) / 100);
  const orbY = horizonY * (0.3 + ((n >> 8) % 30) / 100);
  const orbR = 22 + ((n >> 7) % 26);

  // the car: scaled to card, sitting on the horizon, sometimes facing left
  const flip = ((n >> 6) % 3) === 0; // ~1/3 face left
  const scale = (w / 800) * (0.78 + ((n >> 9) % 20) / 100);
  const carW = 290 * scale;
  const margin = w * 0.06;
  const minX = margin + (flip ? 0 : 150 * scale);
  const maxX = w - carW - margin + (flip ? carW : 0);
  let tx = minX + (hash(seed + 'x') % Math.max(1, Math.round(maxX - minX)));
  const ty = horizonY - 80 * scale; // ground line of car sits on horizon
  const glideDur = 6 + ((n >> 10) % 4);
  const spinDur = 1.4 + ((n >> 11) % 8) / 10;
  const transform = flip
    ? `translate(${tx + carW}, ${ty}) scale(${-scale}, ${scale})`
    : `translate(${tx}, ${ty}) scale(${scale})`;

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escAttr(title || 'EV Horizon illustration')}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="${bgId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#101a2b"/>
      <stop offset="0.6" stop-color="#0a0f18"/>
      <stop offset="1" stop-color="#05070A"/>
    </linearGradient>
    <linearGradient id="${hzId}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${a}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${glId}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${a}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${grId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${a}" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#${bgId})"/>
  <ellipse cx="${(glowX / 100) * w}" cy="${horizonY}" rx="${w * 0.55}" ry="${h * 0.34}" fill="url(#${glId})"/>
  ${grid}
  <line x1="0" y1="${horizonY}" x2="${w}" y2="${horizonY}" stroke="url(#${hzId})" stroke-width="2.5"/>
  <line class="ev-scan" x1="0" y1="${horizonY}" x2="${w}" y2="${horizonY}" stroke="${b}" stroke-width="3"
        stroke-dasharray="90 1110" stroke-linecap="round" opacity="0.8"/>
  <circle cx="${orbX}" cy="${orbY}" r="${orbR}" fill="none" stroke="${b}" stroke-opacity="0.5" stroke-width="1.5"/>
  <circle class="ev-pulse" cx="${orbX}" cy="${orbY}" r="${orbR * 0.45}" fill="none" stroke="${a}" stroke-opacity="0.6" stroke-width="1.5"/>
  ${dots}
  <g transform="${transform}">
    ${streaks(a, 3, n)}
    ${carTrace(a, b, { glideDur, spinDur })}
  </g>
</svg>`;
}

/**
 * Hero art: large animated light-trace EV over a glowing horizon.
 */
export function heroArt() {
  const a = '#00D4FF', b = '#7CFF6B';
  const w = 880, h = 560;
  const gid = id('hbg'), hz = id('hhz'), gl = id('hgl'), fg = id('hfg');
  const horizonY = 400;
  let grid = '';
  for (let i = -8; i <= 8; i++) {
    grid += `<line x1="${440 + i * 30}" y1="${horizonY}" x2="${440 + i * 200}" y2="${h + 60}" stroke="${a}" stroke-opacity="0.06" stroke-width="1"/>`;
  }
  for (let i = 1; i <= 5; i++) {
    const y = horizonY + Math.pow(i / 5, 1.8) * (h - horizonY);
    grid += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${a}" stroke-opacity="0.07" stroke-width="1"/>`;
  }
  // car: scale 1.9 → ground 80*1.9=152; ty = horizonY - 152 = 248; width ~550 centered
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Futuristic electric car traced in light, driving toward a glowing horizon">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d1626"/>
      <stop offset="0.55" stop-color="#080d16"/>
      <stop offset="1" stop-color="#05070A"/>
    </linearGradient>
    <linearGradient id="${hz}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${a}" stop-opacity="0"/>
      <stop offset="0.45" stop-color="${a}"/>
      <stop offset="0.75" stop-color="${b}"/>
      <stop offset="1" stop-color="${b}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${gl}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${a}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
    <filter id="${fg}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" rx="20" fill="url(#${gid})"/>
  <ellipse cx="500" cy="${horizonY}" rx="480" ry="190" fill="url(#${gl})"/>
  ${grid}
  <line x1="20" y1="${horizonY}" x2="${w - 20}" y2="${horizonY}" stroke="url(#${hz})" stroke-width="3"/>
  <line class="ev-scan" x1="20" y1="${horizonY}" x2="${w - 20}" y2="${horizonY}" stroke="${b}" stroke-width="4"
        stroke-dasharray="110 1090" stroke-linecap="round" opacity="0.9"/>
  <g filter="url(#${fg})" transform="translate(170, 248) scale(1.9)">
    ${streaks(a, 4, hash('hero'))}
    ${carTrace(a, b, { glideDur: 8, spinDur: 1.5 })}
  </g>
  <circle class="ev-twinkle" cx="120" cy="120" r="2.5" fill="${b}"/>
  <circle class="ev-twinkle" style="animation-delay:1.1s" cx="790" cy="90" r="2" fill="${a}"/>
  <circle class="ev-twinkle" style="animation-delay:2.2s" cx="700" cy="170" r="1.8" fill="${b}"/>
  <circle class="ev-twinkle" style="animation-delay:0.6s" cx="220" cy="80" r="1.8" fill="${a}"/>
</svg>`;
}

/**
 * Backdrop for the interactive 3D showcase — glowing horizon, no car.
 */
export function showcaseBackdrop() {
  const a = '#00D4FF', b = '#7CFF6B';
  const w = 880, h = 560;
  const gid = id('sbg'), hz = id('shz'), gl = id('sgl'), ab = id('saur');
  const horizonY = 408;
  let grid = '';
  for (let i = -8; i <= 8; i++) {
    grid += `<line x1="${440 + i * 30}" y1="${horizonY}" x2="${440 + i * 200}" y2="${h + 60}" stroke="${a}" stroke-opacity="0.06" stroke-width="1"/>`;
  }
  for (let i = 1; i <= 5; i++) {
    const y = horizonY + Math.pow(i / 5, 1.8) * (h - horizonY);
    grid += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${a}" stroke-opacity="0.07" stroke-width="1"/>`;
  }

  // distant city skyline sitting on the horizon
  const buildings = [
    [26, 26, 38], [56, 18, 56], [78, 30, 30], [112, 20, 46], [136, 24, 26], [164, 16, 36],
    [338, 18, 22], [598, 20, 28],
    [664, 22, 40], [690, 30, 60], [724, 18, 34], [746, 26, 48], [776, 20, 30], [800, 28, 42], [832, 18, 26],
  ];
  let skyline = '';
  for (const [x, bw, bh] of buildings) {
    skyline += `<rect x="${x}" y="${horizonY - bh}" width="${bw}" height="${bh}" fill="#0a1422"/>`;
  }
  // antennas on the two tallest towers + a few lit windows
  skyline += `<line x1="65" y1="${horizonY - 56}" x2="65" y2="${horizonY - 70}" stroke="#16243a" stroke-width="1.5"/>
  <circle class="ev-twinkle" cx="65" cy="${horizonY - 72}" r="1.6" fill="#ff5c7a" style="animation-duration:2.2s"/>
  <line x1="705" y1="${horizonY - 60}" x2="705" y2="${horizonY - 76}" stroke="#16243a" stroke-width="1.5"/>
  <circle class="ev-twinkle" cx="705" cy="${horizonY - 78}" r="1.6" fill="#ff5c7a" style="animation-duration:3s"/>`;
  const winSpots = [
    [62, 44], [64, 30], [120, 32], [88, 18], [140, 16], [698, 48], [702, 30], [752, 34], [748, 20], [806, 28], [670, 24], [836, 16],
  ];
  winSpots.forEach(([x, dy], i) => {
    skyline += `<rect ${i % 3 === 0 ? `class="ev-twinkle" style="animation-delay:${(i * 0.7) % 3}s"` : ''} x="${x}" y="${horizonY - dy}" width="2.5" height="3.5" fill="${i % 2 ? a : '#9fd8e8'}" opacity="0.55"/>`;
  });

  // aurora bands drifting in the sky
  const aurora = `<g filter="url(#${ab})">
    <path class="ev-pulse" style="animation-duration:9s" d="M30 130 C200 80 400 145 580 100 C700 72 810 105 860 88"
          fill="none" stroke="${a}" stroke-width="34" stroke-opacity="0.07" stroke-linecap="round"/>
    <path class="ev-pulse" style="animation-duration:13s;animation-delay:3s" d="M90 190 C300 145 520 195 800 142"
          fill="none" stroke="${b}" stroke-width="24" stroke-opacity="0.055" stroke-linecap="round"/>
  </g>`;

  // extra stars
  const stars = [[60, 60, 1.4], [180, 150, 1.1], [320, 60, 1.5], [420, 180, 1], [540, 50, 1.3], [640, 230, 1.1], [760, 150, 1.4], [840, 230, 1]]
    .map(([x, y, r], i) => `<circle class="ev-twinkle" style="animation-delay:${(i * 0.9) % 3.4}s" cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? a : '#cfe9f5'}"/>`)
    .join('');

  // roadside scenery for the infinite-driving parallax (mid + near layers)
  const turbine = (x, ht) => {
    const hub = horizonY - ht;
    return `<g>
      <line x1="${x}" y1="${horizonY}" x2="${x}" y2="${hub}" stroke="#1b2a3e" stroke-width="3"/>
      <g class="wind-blades">
        <line x1="${x}" y1="${hub}" x2="${x}" y2="${hub - 24}" stroke="#2c4a68" stroke-width="2"/>
        <line x1="${x}" y1="${hub}" x2="${x + 21}" y2="${hub + 12}" stroke="#2c4a68" stroke-width="2"/>
        <line x1="${x}" y1="${hub}" x2="${x - 21}" y2="${hub + 12}" stroke="#2c4a68" stroke-width="2"/>
        <line x1="${x}" y1="${hub}" x2="${x}" y2="${hub + 24}" stroke="none" opacity="0"/>
      </g>
      <circle cx="${x}" cy="${hub}" r="2.5" fill="#3d5a7a"/>
    </g>`;
  };
  const pylon = (x) => `<g>
    <path d="M${x - 14} ${horizonY} L${x} ${horizonY - 52} L${x + 14} ${horizonY} M${x - 16} ${horizonY - 30} H${x + 16} M${x - 10} ${horizonY - 42} H${x + 10}"
      stroke="#1b2a3e" stroke-width="2" fill="none"/>
    <circle class="ev-twinkle" cx="${x}" cy="${horizonY - 52}" r="1.4" fill="#ff5c7a"/>
  </g>`;
  const tree = (x, s = 1) => `<g>
    <line x1="${x}" y1="${horizonY}" x2="${x}" y2="${horizonY - 10 * s}" stroke="#13202f" stroke-width="${2.5 * s}"/>
    <ellipse cx="${x}" cy="${horizonY - 17 * s}" rx="${8 * s}" ry="${11 * s}" fill="#0e1d2a"/>
  </g>`;
  const midContent =
    turbine(70, 74) + turbine(330, 58) + turbine(600, 82) +
    pylon(205) + pylon(745) +
    tree(135, 1) + tree(432, 1.25) + tree(680, 0.9) + tree(835, 1.1);

  const pole = (x) => `<g>
    <line x1="${x}" y1="492" x2="${x}" y2="366" stroke="#22364e" stroke-width="4"/>
    <line x1="${x}" y1="368" x2="${x + 28}" y2="368" stroke="#22364e" stroke-width="3"/>
    <circle cx="${x + 31}" cy="371" r="4" fill="${a}" opacity="0.9"/>
  </g>`;
  let dashes = '';
  for (let x = 0; x < 880; x += 130) dashes += `<line x1="${x}" y1="458" x2="${x + 48}" y2="458" stroke="${a}" stroke-opacity="0.22" stroke-width="3" stroke-linecap="round"/>`;
  for (let x = 40; x < 880; x += 170) dashes += `<line x1="${x}" y1="506" x2="${x + 66}" y2="506" stroke="${a}" stroke-opacity="0.13" stroke-width="4" stroke-linecap="round"/>`;
  const fastContent = pole(60) + pole(350) + pole(640) + dashes;

  const wrapLoop = (cls, content) =>
    `<g class="${cls}"><g>${content}</g><g transform="translate(880 0)">${content}</g></g>`;

  // floating energy lines (the dashes from the card art, drifting through the scene)
  const energy = [
    [50, 226, 64, 1.7], [180, 282, 44, 2.3], [298, 196, 36, 2.0], [560, 184, 48, 2.6],
    [646, 262, 56, 1.9], [752, 312, 70, 2.4], [96, 344, 52, 2.1], [806, 226, 40, 1.8],
  ].map(([x, y, len, dur], i) =>
    `<line class="${i % 2 ? 'ev-streak2' : 'ev-streak'}" style="animation-duration:${dur}s" x1="${x}" y1="${y}" x2="${x + len}" y2="${y}"
      stroke="${i % 3 === 1 ? b : a}" stroke-width="1.6" stroke-opacity="${i % 2 ? 0.28 : 0.42}"
      stroke-dasharray="16 44" stroke-linecap="round"/>`
  ).join('');
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d1626"/>
      <stop offset="0.55" stop-color="#080d16"/>
      <stop offset="1" stop-color="#05070A"/>
    </linearGradient>
    <linearGradient id="${hz}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${a}" stop-opacity="0"/>
      <stop offset="0.45" stop-color="${a}"/>
      <stop offset="0.75" stop-color="${b}"/>
      <stop offset="1" stop-color="${b}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${gl}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${a}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
    <filter id="${ab}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="24"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" rx="20" fill="url(#${gid})"/>
  ${aurora}
  ${stars}
  ${energy}
  <ellipse cx="460" cy="${horizonY}" rx="480" ry="190" fill="url(#${gl})"/>
  <ellipse class="ev-flash" cx="460" cy="${horizonY}" rx="480" ry="190" fill="url(#${gl})" opacity="0"/>
  ${wrapLoop('scroll-slow', skyline)}
  <g class="ev-arc" style="animation-delay:5.4s" opacity="0">
    <path d="M620 ${horizonY - 150} L600 ${horizonY - 110} L614 ${horizonY - 112} L590 ${horizonY - 64} L606 ${horizonY - 68} L584 ${horizonY - 18}"
          fill="none" stroke="${a}" stroke-width="4" opacity="0.35"/>
    <path d="M620 ${horizonY - 150} L600 ${horizonY - 110} L614 ${horizonY - 112} L590 ${horizonY - 64} L606 ${horizonY - 68} L584 ${horizonY - 18}"
          fill="none" stroke="#eaffff" stroke-width="1.4"/>
  </g>
  ${grid}
  <line x1="20" y1="${horizonY}" x2="${w - 20}" y2="${horizonY}" stroke="url(#${hz})" stroke-width="3"/>
  <line class="ev-scan" x1="20" y1="${horizonY}" x2="${w - 20}" y2="${horizonY}" stroke="${b}" stroke-width="4"
        stroke-dasharray="110 1090" stroke-linecap="round" opacity="0.9"/>
  ${wrapLoop('scroll-mid', midContent)}
  ${wrapLoop('scroll-fast', fastContent)}
  <circle class="ev-twinkle" cx="120" cy="120" r="2.5" fill="${b}"/>
  <circle class="ev-twinkle" style="animation-delay:1.1s" cx="790" cy="90" r="2" fill="${a}"/>
  <circle class="ev-twinkle" style="animation-delay:2.2s" cx="700" cy="180" r="1.8" fill="${b}"/>
  <circle class="ev-twinkle" style="animation-delay:0.6s" cx="220" cy="80" r="1.8" fill="${a}"/>
</svg>`;
}

/**
 * The showcase car — a detailed flagship-EV concept ("Horizon One"),
 * built for the 3D tilt stage. Rich gradients, glass canopy, light bars,
 * underglow and a faded reflection.
 */
export function showcaseCar() {
  const a = '#00D4FF', b = '#7CFF6B';
  const body = id('cbody'), glass = id('cglass'), rim = id('crim'),
        blur = id('cblur'), softGlow = id('cglow'), refl = id('crefl'), rocker = id('crocker');

  const wheel = (cx) => `
    <g>
      <circle cx="${cx}" cy="268" r="50" fill="#0a0e15" stroke="#1d2735" stroke-width="3"/>
      <circle cx="${cx}" cy="268" r="33" fill="#0c1320" stroke="url(#${rim})" stroke-width="2.5"/>
      <g class="ev-spin" style="animation-duration:4.5s">
        ${[0, 72, 144, 216, 288].map((deg) =>
          `<line x1="${cx}" y1="268" x2="${cx + 28 * Math.cos((deg * Math.PI) / 180)}" y2="${268 + 28 * Math.sin((deg * Math.PI) / 180)}" stroke="url(#${rim})" stroke-width="5" stroke-linecap="round"/>`
        ).join('')}
      </g>
      <circle cx="${cx}" cy="268" r="7" fill="#101826" stroke="${a}" stroke-width="1.5"/>
    </g>`;

  const carPaint = `
    <!-- body: low wedge supercar -->
    <path d="M100 248
      C86 247 78 241 79 231
      L84 196
      C86 184 94 177 108 174
      L210 160
      C228 146 244 135 258 131
      L390 126
      C408 125 424 129 436 135
      L540 174
      L676 220
      C696 227 706 235 707 243
      C707 249 702 252 692 253
      C560 256 220 256 100 248 Z"
      fill="url(#${body})" stroke="#2b3950" stroke-width="1.5"/>
    <!-- rear wing blade -->
    <g filter="url(#${softGlow})">
      <path d="M86 148 C124 140 158 138 182 143" fill="none" stroke="${a}" stroke-width="5" stroke-linecap="round"/>
      <path d="M84 141 L84 156" stroke="${a}" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <line x1="112" y1="174" x2="114" y2="146" stroke="#2b3950" stroke-width="3"/>
    <line x1="160" y1="170" x2="162" y2="141" stroke="#2b3950" stroke-width="3"/>
    <!-- roof rim light -->
    <path d="M108 174 L210 160 C228 146 244 135 258 131 L390 126" fill="none" stroke="#9ae9ff" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
    <path d="M390 126 C408 125 424 129 436 135 L540 174" fill="none" stroke="#9ae9ff" stroke-width="1.8" stroke-linecap="round" opacity="0.55"/>
    <path d="M540 174 L676 220" fill="none" stroke="#9ae9ff" stroke-width="1.4" stroke-linecap="round" opacity="0.3"/>
    <!-- beltline crease -->
    <path d="M124 196 C300 168 480 182 650 218" fill="none" stroke="#5e7d9c" stroke-width="1.5" opacity="0.5"/>
    <!-- glass canopy (teardrop) -->
    <path d="M262 138 C292 130 340 127 376 129 L428 133 L516 168
             C460 173 360 171 296 163 C282 153 270 146 262 138 Z"
      fill="url(#${glass})" stroke="#33495f" stroke-width="1"/>
    <path d="M274 137 C312 130 352 128 384 131" fill="none" stroke="#bdf1ff" stroke-width="1.6" opacity="0.55"/>
    <!-- side intake slashes (mid-engine signature) -->
    <path d="M282 196 L258 238" stroke="#1a2638" stroke-width="5" stroke-linecap="round" opacity="0.9"/>
    <path d="M304 200 L282 240" stroke="#1a2638" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
    <path d="M282 196 L258 238" stroke="${a}" stroke-width="1.2" stroke-linecap="round" opacity="0.35"/>
    <!-- door cut -->
    <path d="M342 164 C346 198 344 228 338 250" fill="none" stroke="#2b3a50" stroke-width="1.4" opacity="0.8"/>
    <path d="M520 170 C522 200 518 228 512 250" fill="none" stroke="#2b3a50" stroke-width="1.2" opacity="0.6"/>
    <!-- front light: blade + Y-tick -->
    <g filter="url(#${softGlow})">
      <path d="M608 202 C648 212 682 224 700 238" fill="none" stroke="${a}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M642 212 L656 202" stroke="${a}" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
      <path d="M642 212 L658 218" stroke="${a}" stroke-width="2" stroke-linecap="round" opacity="0.85"/>
    </g>
    <!-- front splitter -->
    <path d="M636 246 C664 248 686 250 698 251" fill="none" stroke="#3b4f68" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
    <!-- rear light blade -->
    <g filter="url(#${softGlow})">
      <path d="M92 198 C87 208 85 221 88 233" fill="none" stroke="${b}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M104 192 C99 200 97 210 98 220" stroke="${b}" stroke-width="1.8" stroke-linecap="round" opacity="0.6" fill="none"/>
    </g>
    <!-- rocker accent -->
    <g filter="url(#${softGlow})">
      <line x1="124" y1="256" x2="372" y2="256" stroke="${b}" stroke-width="3.5" stroke-linecap="round" opacity="0.95"/>
      <line x1="372" y1="256" x2="640" y2="256" stroke="${a}" stroke-width="3.5" stroke-linecap="round" opacity="0.95"/>
    </g>`;

  return `<svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Horizon One — flagship electric car concept">
  <defs>
    <linearGradient id="${body}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2c3b55"/>
      <stop offset="0.45" stop-color="#16202f"/>
      <stop offset="1" stop-color="#0a101a"/>
    </linearGradient>
    <linearGradient id="${glass}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#10293c"/>
      <stop offset="1" stop-color="#050d16"/>
    </linearGradient>
    <linearGradient id="${rim}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a8c5dd"/>
      <stop offset="1" stop-color="#3c4f68"/>
    </linearGradient>
    <linearGradient id="${rocker}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${b}"/>
      <stop offset="1" stop-color="${a}"/>
    </linearGradient>
    <linearGradient id="${refl}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.16"/>
      <stop offset="0.8" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <filter id="${softGlow}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="${blur}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
    <mask id="${refl}-m">
      <rect x="0" y="318" width="760" height="82" fill="url(#${refl})"/>
    </mask>
    <linearGradient id="${body}-beam" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${a}" stop-opacity="0.4"/>
      <stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <g class="cg-reveal">
  <!-- motion streaks (visible while driving) -->
  <g class="cg-streaks">
    <line class="ev-streak" style="animation-duration:0.8s" x1="-30" y1="150" x2="150" y2="150" stroke="${a}" stroke-width="2.5" stroke-opacity="0.55" stroke-dasharray="34 70" stroke-linecap="round"/>
    <line class="ev-streak2" style="animation-duration:1.1s" x1="-30" y1="198" x2="110" y2="198" stroke="${b}" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="26 66" stroke-linecap="round"/>
    <line class="ev-streak" style="animation-duration:0.95s" x1="-30" y1="244" x2="170" y2="244" stroke="${a}" stroke-width="2" stroke-opacity="0.45" stroke-dasharray="30 74" stroke-linecap="round"/>
  </g>
  <!-- headlight beam -->
  <polygon class="ev-beam" points="698,228 760,244 760,268 702,250" fill="url(#${body}-beam)" opacity="0.5"/>

  <!-- ground shadow + underglow -->
  <ellipse cx="380" cy="302" rx="340" ry="24" fill="#000" opacity="0.6" filter="url(#${blur})"/>
  <ellipse class="ev-pulse car-underglow" cx="380" cy="288" rx="300" ry="15" fill="${a}" opacity="0.45" filter="url(#${blur})"/>

  <!-- reflection -->
  <g transform="translate(0, 600) scale(1, -1)" mask="url(#${refl}-m)" opacity="0.5">
    ${carPaint}
  </g>

  <!-- car -->
  <g>
    ${carPaint}
    ${wheel(196)}
    ${wheel(564)}
  </g>

  <!-- charge port + bolt -->
  <circle cx="156" cy="186" r="4.5" fill="none" stroke="${a}" stroke-width="1.8" opacity="0.9"/>
  <circle class="ev-pulse" cx="156" cy="186" r="9" fill="none" stroke="${a}" stroke-width="1" opacity="0.4"/>
  <g class="ev-arc" style="animation-delay:1.2s" opacity="0" filter="url(#${softGlow})">
    <path d="M164 170 L174 152 L167 152 L178 134" fill="none" stroke="#eaffff" stroke-width="2.2" stroke-linejoin="round"/>
  </g>

  <!-- electric arcs crackling over the body -->
  <g class="ev-arc" opacity="0">
    <path d="M300 86 L320 72 L314 81 L342 68 L336 79 L366 70 L360 81 L392 72 L386 83 L420 88"
          fill="none" stroke="${a}" stroke-width="5" opacity="0.4" filter="url(#${softGlow})"/>
    <path d="M300 86 L320 72 L314 81 L342 68 L336 79 L366 70 L360 81 L392 72 L386 83 L420 88"
          fill="none" stroke="#eaffff" stroke-width="1.7"/>
  </g>
  <g class="ev-arc" style="animation-delay:2.1s" opacity="0">
    <path d="M652 192 L676 178 L668 190 L694 182 L686 194 L706 192"
          fill="none" stroke="${a}" stroke-width="4" opacity="0.4" filter="url(#${softGlow})"/>
    <path d="M652 192 L676 178 L668 190 L694 182 L686 194 L706 192"
          fill="none" stroke="#eaffff" stroke-width="1.5"/>
  </g>
  <g class="ev-arc" style="animation-delay:3.3s" opacity="0">
    <path d="M64 210 L42 198 L52 212 L32 206 L44 222"
          fill="none" stroke="${b}" stroke-width="4" opacity="0.4" filter="url(#${softGlow})"/>
    <path d="M64 210 L42 198 L52 212 L32 206 L44 222"
          fill="none" stroke="#eefff0" stroke-width="1.5"/>
  </g>

  <!-- current pulses through the light lines -->
  <line class="ev-current" x1="128" y1="259" x2="630" y2="259"
        stroke="#eaffff" stroke-width="2.6" stroke-linecap="round"
        stroke-dasharray="18 484" opacity="0.95" filter="url(#${softGlow})"/>
  <path class="ev-current2" d="M150 128 C210 106 290 96 360 96 C430 96 500 112 552 140"
        fill="none" stroke="#dffaff" stroke-width="2" stroke-linecap="round"
        stroke-dasharray="14 456" opacity="0.85"/>

  <!-- sparks rising from the underglow -->
  <circle class="ev-spark" cx="170" cy="276" r="2" fill="${a}"/>
  <circle class="ev-spark" style="animation-delay:0.5s" cx="262" cy="280" r="1.6" fill="${b}"/>
  <circle class="ev-spark" style="animation-delay:1.1s" cx="352" cy="278" r="2.2" fill="${a}"/>
  <circle class="ev-spark" style="animation-delay:1.7s" cx="450" cy="281" r="1.5" fill="${a}"/>
  <circle class="ev-spark" style="animation-delay:0.8s" cx="520" cy="277" r="2" fill="${b}"/>
  <circle class="ev-spark" style="animation-delay:2.2s" cx="600" cy="279" r="1.8" fill="${a}"/>
  </g>

  <!-- power-on: light traces the silhouette, then the car materializes -->
  <path class="cg-trace" pathLength="1" d="M100 248
      C86 247 78 241 79 231
      L84 196
      C86 184 94 177 108 174
      L210 160
      C228 146 244 135 258 131
      L390 126
      C408 125 424 129 436 135
      L540 174
      L676 220
      C696 227 706 235 707 243
      C707 249 702 252 692 253
      C560 256 220 256 100 248 Z"
      fill="none" stroke="${a}" stroke-width="2.5" stroke-linecap="round" filter="url(#${softGlow})"/>
</svg>`;
}

/**
 * Foreground driving layer — streetlight poles and near road dashes that
 * sweep past IN FRONT of the car. Scrolled by charge-game.js (.scroll-front).
 */
export function showcaseFront() {
  const a = '#00D4FF';
  const pole = (x) => `<g opacity="0.92">
    <line x1="${x}" y1="560" x2="${x}" y2="236" stroke="#0d1724" stroke-width="11"/>
    <line x1="${x}" y1="246" x2="${x - 62}" y2="246" stroke="#0d1724" stroke-width="7"/>
    <ellipse cx="${x - 69}" cy="250" rx="9" ry="4.5" fill="${a}" opacity="0.95"/>
    <ellipse cx="${x - 69}" cy="255" rx="17" ry="8" fill="${a}" opacity="0.22"/>
  </g>`;
  let dashes = '';
  for (let x = 0; x < 880; x += 225) {
    dashes += `<line x1="${x}" y1="545" x2="${x + 92}" y2="545" stroke="${a}" stroke-opacity="0.17" stroke-width="7" stroke-linecap="round"/>`;
  }
  const content = pole(430) + dashes;
  return `<svg class="showcase-front" viewBox="0 0 880 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <g class="scroll-front"><g>${content}</g><g transform="translate(880 0)">${content}</g></g>
</svg>`;
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
