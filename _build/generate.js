/* ==========================================================================
   EV Horizon static site generator
   Run:  node generate.js   (from the _build folder)
   Output: plain HTML/CSS/JS in the parent folder — host it anywhere.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, CONTACT_EMAIL, ADS_EMAIL, CATEGORIES, CROSS_LIST, SOCIALS } from './site.js';
import { cardArt, showcaseBackdrop, showcaseCar, showcaseFront } from './art.js';
import { esc, rel, fmtDate, layout, breadcrumbs, breadcrumbsLd, articleCard, artFor, sectionHead, adSlot, mockAd, newsletterBand, videoCard, socialIcon } from './templates.js';

/* Demo advertiser inventory — fictional EV-industry brands, used to show how
   real sponsor / AdSense placements would look. Clearly labelled as ads. */
const ADS = {
  voltpath: { brand: 'VoltPath', mark: 'V', accent: '#00D4FF', tag: 'Ad',
    headline: '60,000+ fast chargers. One app. Zero range anxiety.', cta: 'Get the app' },
  amperly: { brand: 'Amperly', mark: 'A', accent: '#7CFF6B', tag: 'Ad',
    headline: 'EV insurance, done right.', sub: 'Specialist cover with battery & home-charger protection built in.',
    price: 'from $39/mo', cta: 'Get a quote →' },
  gridhome: { brand: 'GridHome', mark: 'G', accent: '#ffb454', tag: 'Sponsored',
    headline: 'Install home charging in a weekend', sub: 'A step-by-step Level 2 setup guide — presented by GridHome.',
    cta: 'Read the guide →' },
  lumen: { brand: 'Lumen Energy', mark: 'L', accent: '#b88cff', tag: 'Ad',
    headline: 'Solar + EV charging, bundled.', sub: 'Power your car on sunshine. Home solar plans built for EV owners.',
    cta: 'See plans →' },
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..');

/* ---------------------------------------------------------------------- */
/* Load content                                                            */
/* ---------------------------------------------------------------------- */

const contentDir = path.join(__dirname, 'content');
const articleFiles = fs.readdirSync(contentDir).filter((f) => f.endsWith('.js'));
const articles = [];
for (const f of articleFiles) {
  const mod = await import(pathToFileURL(path.join(contentDir, f)).href);
  articles.push(mod.default);
}
articles.sort((x, y) => (x.date < y.date ? 1 : -1));

// Photo pipeline: if assets/img/<slug>.(jpg|jpeg|png|webp|avif) exists,
// the article automatically uses it everywhere instead of generated art.
const IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
for (const a of articles) {
  if (a.image) continue; // explicit path set in the content file wins
  for (const ext of IMG_EXTS) {
    const relPath = `assets/img/${a.slug}.${ext}`;
    if (fs.existsSync(path.join(OUT, relPath))) { a.image = relPath; break; }
  }
}

const bySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
const byCat = (key) => {
  const extra = (CROSS_LIST[key] || []).map((s) => bySlug[s]).filter(Boolean);
  const main = articles.filter((a) => a.category === key);
  const seen = new Set();
  return [...main, ...extra].filter((a) => (seen.has(a.slug) ? false : seen.add(a.slug)));
};

/* ---------------------------------------------------------------------- */
/* Tools & videos data                                                     */
/* ---------------------------------------------------------------------- */

const ICONS = {
  cost: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
  time: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  savings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l5-5 4 4 8-8"/><path d="M14 8h6v6"/></svg>',
  range: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="11" r="3"/><path d="M12 2a8 8 0 0 1 8 8c0 5.3-8 12-8 12S4 15.3 4 10a8 8 0 0 1 8-8z"/></svg>',
  health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/><path d="M7 10.5l2 3 2-5 2 3h2"/></svg>',
};

function field({ id, label, labelKm, labelMi, value, defKm, defMi, step = 'any', hint = '', min = '0' }) {
  const lab = labelKm
    ? `<label for="${id}" data-label-km="${esc(labelKm)}" data-label-mi="${esc(labelMi)}">${esc(labelKm)}</label>`
    : `<label for="${id}">${esc(label)}</label>`;
  const defaults = defKm != null ? ` data-default-km="${defKm}" data-default-mi="${defMi}"` : '';
  const val = value != null ? value : defKm;
  return `<div class="field">${lab}<input type="number" id="${id}" value="${val}" min="${min}" step="${step}" inputmode="decimal"${defaults}>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}</div>`;
}

function selectField({ id, label, options, hint = '' }) {
  const opts = options.map((o, i) => `<option value="${o.v}"${i === 0 ? ' selected' : ''}>${esc(o.t)}</option>`).join('');
  return `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}">${opts}</select>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}</div>`;
}

function resultRow(id, label, { primary = false, green = false, labelKm, labelMi } = {}) {
  const cls = primary ? ' primary' : green ? ' green' : '';
  const lab = labelKm
    ? `<span class="r-label" data-label-km="${esc(labelKm)}" data-label-mi="${esc(labelMi)}">${esc(labelKm)}</span>`
    : `<span class="r-label">${esc(label)}</span>`;
  return `<div class="result-row${cls}">${lab}<span class="r-value" id="${id}">—</span></div>`;
}

const UNIT_TOGGLE = `<div class="unit-toggle" role="group" aria-label="Units">
  <button type="button" data-unit="km" class="active">km · L</button>
  <button type="button" data-unit="mi">miles · gal</button>
</div>`;

const TOOLS = [
  {
    slug: 'charging-cost',
    name: 'EV Charging Cost Calculator',
    short: 'What a charge really costs — at home or at a fast charger.',
    icon: ICONS.cost,
    title: 'EV Charging Cost Calculator — What Does It Cost to Charge?',
    description: 'Calculate exactly what it costs to charge an electric car: energy needed, total cost and cost per 100 km or 100 miles, at home or at a public charger.',
    toggle: true,
    form: () => [
      field({ id: 'cap', label: 'Battery Capacity (kWh)', value: 60, step: '1' }),
      `<div class="field-row">${field({ id: 'from', label: 'Current Charge (%)', value: 20, step: '1' })}${field({ id: 'to', label: 'Target Charge (%)', value: 80, step: '1' })}</div>`,
      field({ id: 'price', label: 'Electricity Price ($/kWh)', value: '0.15', step: '0.01', hint: 'Home: ~$0.10–0.20 · DC fast: ~$0.35–0.60' }),
      field({ id: 'eff', label: 'Charging Efficiency (%)', value: 92, step: '1', hint: 'Typical: 90–95% (some energy is lost as heat)' }),
      field({ id: 'cons', labelKm: 'Vehicle Efficiency (kWh/100km)', labelMi: 'Vehicle Efficiency (mi/kWh)', defKm: 17, defMi: '3.8', step: '0.1' }),
    ].join('\n'),
    results: () => [
      resultRow('r-energy', 'Energy added to battery'),
      resultRow('r-grid', 'Energy drawn from grid'),
      resultRow('r-cost', 'Cost to charge', { primary: true }),
      resultRow('r-per100', '', { labelKm: 'Driving cost per 100 km', labelMi: 'Driving cost per 100 mi' }),
      '<p class="result-note">Grid energy exceeds battery energy because chargers lose a little power as heat.</p>',
    ].join('\n'),
    explain: [
      ['How it works', 'Energy needed = battery capacity × (target % − current %). We divide by charging efficiency to get the energy actually drawn from the grid, then multiply by your electricity price.'],
      ['Make it cheaper', 'Charge overnight on off-peak tariffs, set an 80% daily limit, and save DC fast charging for road trips. Our guide <a href="/articles/ev-charging-explained/">EV Charging Explained</a> covers every option.'],
    ],
    related: ['ev-charging-explained', 'cost-of-owning-an-ev'],
  },
  {
    slug: 'charging-time',
    name: 'EV Charging Time Calculator',
    short: 'How long until you’re charged — on any charger.',
    icon: ICONS.time,
    title: 'EV Charging Time Calculator — How Long to Charge an EV?',
    description: 'Estimate how long it takes to charge any electric car: enter battery size, charge level and charger power for an instant charging time estimate.',
    toggle: false,
    form: () => [
      field({ id: 'cap', label: 'Battery Capacity (kWh)', value: 60, step: '1' }),
      `<div class="field-row">${field({ id: 'from', label: 'Current Charge (%)', value: 20, step: '1' })}${field({ id: 'to', label: 'Target Charge (%)', value: 80, step: '1' })}</div>`,
      field({ id: 'power', label: 'Charger Power (kW)', value: 11, step: '0.1', hint: '2.3 = wall socket · 7–22 = home wallbox · 50–350 = DC fast charger' }),
    ].join('\n'),
    results: () => [
      resultRow('r-time', 'Estimated charging time', { primary: true }),
      resultRow('r-energy', 'Energy required'),
      '<p class="result-note" id="r-note"></p>',
    ].join('\n'),
    explain: [
      ['How it works', 'Charging time = energy needed ÷ charger power. Real DC fast-charging sessions slow down above ~80% to protect the battery, so trips beyond 80% take longer than the linear estimate.'],
      ['Pro tip', 'On road trips, charge from low state of charge to 80% — it’s the fastest part of the curve. Background in <a href="/articles/ev-charging-explained/">EV Charging Explained</a>.'],
    ],
    related: ['ev-charging-explained', 'solid-state-batteries-explained'],
  },
  {
    slug: 'savings',
    name: 'EV Savings Calculator',
    short: 'Gas vs electric: your monthly, yearly and 5-year savings.',
    icon: ICONS.savings,
    title: 'EV Savings Calculator — Electric vs Gas Cost Comparison',
    description: 'Compare what you spend on gasoline with what an EV would cost: monthly, yearly and 5-year savings calculated from your real driving and local prices.',
    toggle: true,
    form: () => [
      field({ id: 'dist', labelKm: 'Monthly Distance (km)', labelMi: 'Monthly Distance (miles)', defKm: 1500, defMi: 900, step: '10' }),
      field({ id: 'fuel', labelKm: 'Fuel Consumption (L/100km)', labelMi: 'Fuel Economy (MPG)', defKm: '7.5', defMi: 31, step: '0.1' }),
      field({ id: 'fprice', labelKm: 'Fuel Price ($/L)', labelMi: 'Fuel Price ($/gallon)', defKm: '1.60', defMi: '3.60', step: '0.01' }),
      field({ id: 'eveff', labelKm: 'EV Efficiency (kWh/100km)', labelMi: 'EV Efficiency (mi/kWh)', defKm: 17, defMi: '3.8', step: '0.1' }),
      field({ id: 'eprice', label: 'Electricity Price ($/kWh)', value: '0.15', step: '0.01' }),
    ].join('\n'),
    results: () => [
      resultRow('r-gas', 'Monthly gas cost'),
      resultRow('r-ev', 'Monthly EV cost'),
      resultRow('r-month', 'Monthly savings', { primary: true }),
      resultRow('r-year', 'Yearly savings', { green: true }),
      resultRow('r-five', '5-year savings', { green: true }),
      '<p class="result-note">Energy only — EVs typically save another $1,000–2,000 over five years on maintenance.</p>',
    ].join('\n'),
    explain: [
      ['How it works', 'We calculate your monthly fuel bill from distance, consumption and fuel price, then the cost of driving the same distance on electricity. The difference is your saving — extended to a year and five years.'],
      ['The full picture', 'Purchase price, insurance, maintenance and depreciation matter too. Read <a href="/articles/cost-of-owning-an-ev/">The Real Cost of Owning an EV</a> for the complete breakdown.'],
    ],
    related: ['cost-of-owning-an-ev', 'common-ev-myths'],
  },
  {
    slug: 'range',
    name: 'EV Range Calculator',
    short: 'Real-world range for any EV, in any weather.',
    icon: ICONS.range,
    title: 'EV Range Calculator — Real-World Electric Car Range',
    description: 'Estimate real-world EV range from battery size, efficiency, weather and driving style — including city, highway and winter range.',
    toggle: true,
    form: () => [
      field({ id: 'cap', label: 'Battery Capacity (kWh)', value: 60, step: '1' }),
      field({ id: 'eff', labelKm: 'Vehicle Efficiency (kWh/100km)', labelMi: 'Vehicle Efficiency (mi/kWh)', defKm: 17, defMi: '3.8', step: '0.1', hint: 'Efficient sedan ≈ 14–16 · crossover ≈ 17–19 · large SUV/truck ≈ 20–28 kWh/100km' }),
      selectField({ id: 'weather', label: 'Weather', options: [
        { v: '1', t: 'Mild (~20°C / 68°F)' },
        { v: '0.95', t: 'Hot (35°C / 95°F)' },
        { v: '0.84', t: 'Cold (0°C / 32°F)' },
        { v: '0.72', t: 'Freezing (−10°C / 14°F)' },
      ]}),
      selectField({ id: 'style', label: 'Driving Style', options: [
        { v: '1', t: 'Normal' },
        { v: '1.05', t: 'Relaxed / eco' },
        { v: '0.86', t: 'Spirited / fast highway' },
      ]}),
    ].join('\n'),
    results: () => [
      resultRow('r-range', 'Estimated range', { primary: true }),
      resultRow('r-city', 'City range'),
      resultRow('r-hwy', 'Highway range'),
      resultRow('r-winter', 'Winter range', { green: false }),
      '<p class="result-note">City range beats highway range in an EV — regenerative braking recovers energy in stop-and-go traffic.</p>',
    ].join('\n'),
    explain: [
      ['How it works', 'Base range = battery capacity ÷ consumption. We then apply real-world multipliers for temperature and driving style drawn from published fleet data.'],
      ['Why winter range drops', 'Cold batteries are less efficient and cabin heating draws power. Heat pumps and preconditioning recover much of the loss — see <a href="/articles/common-ev-myths/">Common EV Myths</a>.'],
    ],
    related: ['common-ev-myths', 'best-electric-suvs'],
  },
  {
    slug: 'battery-health',
    name: 'Battery Health Checker',
    short: 'Estimate a battery’s state of health in 60 seconds.',
    icon: ICONS.health,
    title: 'EV Battery Health Checker — Estimate State of Health',
    description: 'Answer six quick questions about age, mileage and charging habits to estimate an EV battery’s state of health — ideal before buying a used EV.',
    toggle: false,
    form: () => [
      selectField({ id: 'age', label: 'Vehicle age', options: [
        { v: '0.5', t: 'Under 1 year' }, { v: '1.5', t: '1–2 years' }, { v: '3.5', t: '3–4 years' }, { v: '6', t: '5–7 years' }, { v: '9', t: '8+ years' },
      ]}),
      selectField({ id: 'mileage', label: 'Total mileage', options: [
        { v: '0', t: 'Under 20,000 km (12k mi)' }, { v: '1', t: '20–60,000 km (12–37k mi)' }, { v: '2.5', t: '60–120,000 km (37–75k mi)' }, { v: '4', t: '120–200,000 km (75–125k mi)' }, { v: '6', t: 'Over 200,000 km (125k mi)' },
      ]}),
      selectField({ id: 'fast', label: 'DC fast charging frequency', options: [
        { v: '0', t: 'Rarely — mostly home charging' }, { v: '1', t: 'A few times a month' }, { v: '2', t: 'Weekly' }, { v: '4', t: 'Most charges are DC fast' },
      ]}),
      selectField({ id: 'full', label: 'Charged to 100%…', options: [
        { v: '0', t: 'Rarely — usually capped at 80–90%' }, { v: '1', t: 'Sometimes' }, { v: '3', t: 'Daily (NMC/NCA battery)' }, { v: '0.5', t: 'Daily, but it’s an LFP battery' },
      ]}),
      selectField({ id: 'climate', label: 'Climate', options: [
        { v: '0', t: 'Temperate' }, { v: '1', t: 'Cold winters' }, { v: '1.5', t: 'Hot summers' }, { v: '3', t: 'Very hot all year' },
      ]}),
      selectField({ id: 'observed', label: 'Noticed range loss?', options: [
        { v: '0', t: 'None noticeable' }, { v: '1', t: 'Slight' }, { v: '3', t: 'Noticeable' }, { v: '6', t: 'Significant' },
      ]}),
    ].join('\n'),
    results: () => [
      '<div class="score-meter"><div class="bar"><div class="fill" id="r-fill"></div></div></div>',
      resultRow('r-soh', 'Estimated state of health', { primary: true }),
      '<div class="result-row"><span class="r-label">Verdict</span></div><p id="r-verdict" style="color:var(--text);font-weight:500;margin-top:-8px;"></p>',
      '<div class="result-row"><span class="r-label">Tips</span></div><ul id="r-tips" style="color:var(--muted);font-size:14.5px;padding-left:20px;margin-top:-6px;"></ul>',
      '<p class="result-note">A habit-based estimate, not a measurement. For a purchase decision, request a diagnostic SoH report — our <a href="/articles/used-ev-buying-guide/">Used EV Buying Guide</a> shows how.</p>',
    ].join('\n'),
    explain: [
      ['How it works', 'We start from the fleet-average degradation rate (~1.8% per year) and adjust for the factors that accelerate or slow it: mileage, fast-charging share, 100% charging habits, climate and observed symptoms.'],
      ['Why LFP is different', 'LFP batteries (most BYDs, standard-range Teslas) tolerate daily full charges far better than NMC packs — that’s why the answer options treat them differently.'],
    ],
    related: ['used-ev-buying-guide', 'solid-state-batteries-explained'],
  },
];

const VIDEOS = [
  { title: 'Top 10 EVs Coming in 2027', duration: '12:45', formats: ['YouTube', 'Shorts', 'Newsletter'], desc: 'A countdown of the launches that will actually matter — ranked by impact, not hype.', article: 'top-evs-coming-soon' },
  { title: 'Tesla vs BYD: The $100 Billion EV War', duration: '10:18', formats: ['YouTube', 'Shorts', 'TikTok'], desc: 'Sales maps, battery teardowns and the two very different bets shaping the EV decade.', article: 'tesla-vs-byd-who-is-winning-the-ev-race' },
  { title: 'The Future of EV Batteries', duration: '14:02', formats: ['YouTube', 'Infographic'], desc: 'From LFP to solid-state: where the next leap in range and charging speed comes from.', article: 'solid-state-batteries-explained' },
  { title: 'EV Charging for Absolute Beginners', duration: '9:36', formats: ['YouTube', 'Reel'], desc: 'Home charging, public AC and a 350 kW hub — with live cost and time numbers on screen.', article: 'ev-charging-explained' },
  { title: 'I Inspected a Used EV So You Don’t Get Burned', duration: '11:24', formats: ['YouTube', 'Shorts'], desc: 'Running the full EV Horizon checklist on a real used EV, battery diagnostics included.', article: 'used-ev-buying-guide' },
  { title: 'EV Myths vs Data', duration: '8:51', formats: ['YouTube', 'TikTok', 'Reel'], desc: 'The seven claims that refuse to die, fact-checked with sources on screen.', article: 'common-ev-myths' },
];

/* ---------------------------------------------------------------------- */
/* Output helpers                                                          */
/* ---------------------------------------------------------------------- */

const written = [];
function write(relPath, html) {
  const full = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  written.push(relPath);
}

function page(relDir, opts) {
  const depth = relDir === '' ? 0 : relDir.split('/').filter(Boolean).length;
  const root = depth === 0 ? '' : '../'.repeat(depth);
  const html = layout({ ...opts, root, path: relDir === '' ? '' : relDir + '/', content: rel(opts.content, root) });
  write(relDir === '' ? 'index.html' : `${relDir}/index.html`, html);
}

const ORG_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  slogan: SITE_TAGLINE,
  logo: `${SITE_URL}/assets/favicon.svg`,
  email: CONTACT_EMAIL,
  sameAs: SOCIALS.map((s) => s.href),
};

/* ---------------------------------------------------------------------- */
/* HOME                                                                    */
/* ---------------------------------------------------------------------- */

function homePage() {
  const featured = articles.find((a) => a.featured) || articles[0];
  const latest = articles.filter((a) => a.slug !== featured.slug).slice(0, 6);
  const reviewSlugs = ['best-electric-suvs', 'tesla-vs-byd-who-is-winning-the-ev-race', 'top-evs-coming-soon'];
  const guideSlugs = ['ev-charging-explained', 'cost-of-owning-an-ev', 'used-ev-buying-guide'];
  const batterySlugs = ['solid-state-batteries-explained', 'ev-charging-explained'];
  const futureSlugs = ['robotaxis-explained', 'future-of-electric-mobility'];

  const content = `
  <!-- 1 · Hero -->
  <section class="hero">
    <div class="container">
      <div class="hero-grid">
        <div>
          <span class="kicker">${SITE_TAGLINE}</span>
          <h1>Electric Cars, EV News &amp; <span class="grad">Future Mobility</span></h1>
          <p class="lede">Explore electric vehicles, charging technology, EV reviews, battery innovation and the future of transportation — explained clearly, for everyone.</p>
          <div class="btn-row">
            <a class="btn btn-primary" href="/news/">Read EV News</a>
            <a class="btn btn-ghost" href="/guides/">Explore EV Guides</a>
          </div>
        </div>
        <div class="hero-art showcase-stage" data-tilt>
          <div class="showcase-scene">
            ${showcaseBackdrop()}
            <div class="showcase-car">${showcaseCar()}</div>
            ${showcaseFront()}
          </div>
          <div class="charge-game">
            <svg class="cg-cable-svg" aria-hidden="true">
              <path class="cg-cable-outer" d=""/>
              <path class="cg-cable-core" d=""/>
              <path class="cg-cable-flow" d=""/>
            </svg>
            <div class="cg-station" aria-hidden="true">
              <svg viewBox="0 0 60 120" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="6" width="40" height="98" rx="10" fill="#0d1420" stroke="#24364c" stroke-width="2"/>
                <rect x="17" y="16" width="26" height="22" rx="4" fill="#06121c" stroke="rgba(0,212,255,0.5)" stroke-width="1.5"/>
                <path d="M32 19 l-7 10 h5 l-4 9 9 -11 h-5 l5 -8 z" fill="#00D4FF"/>
                <circle cx="30" cy="50" r="3" fill="#7CFF6B"/>
                <rect x="14" y="58" width="32" height="3" rx="1.5" fill="#1a2638"/>
                <rect x="14" y="66" width="32" height="3" rx="1.5" fill="#1a2638"/>
                <rect x="44" y="74" width="12" height="16" rx="3" fill="#0d1420" stroke="#24364c" stroke-width="1.5"/>
                <rect x="4" y="104" width="52" height="10" rx="4" fill="#0a0f16" stroke="#1c2838" stroke-width="1.5"/>
              </svg>
            </div>
            <button type="button" class="cg-plug" aria-label="Charging plug — drag it to the car's charge port, or press Enter to plug in">
              <svg viewBox="0 0 46 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M14 24 H6 a4 4 0 0 0 -4 4 v8 a4 4 0 0 0 4 4 h8" fill="#0d1420" stroke="#00D4FF" stroke-width="2"/>
                <rect x="4" y="28" width="7" height="3" rx="1.5" fill="#7CFF6B"/>
                <rect x="4" y="33" width="7" height="3" rx="1.5" fill="#7CFF6B"/>
                <rect x="13" y="13" width="27" height="38" rx="9" fill="#0d1420" stroke="#00D4FF" stroke-width="2.2"/>
                <circle cx="26.5" cy="32" r="3.5" fill="#00D4FF"/>
                <rect x="38" y="27" width="8" height="10" rx="3" fill="#0e1622" stroke="#1d4257" stroke-width="1.5"/>
              </svg>
            </button>
            <div class="cg-ring" aria-hidden="true"></div>
            <div class="cg-hud" role="status" hidden>
              <div class="cg-batt"><div class="cg-fill"></div></div>
              <div class="cg-pct">0% · 0 km</div>
              <div class="cg-sub">DC fast charge — quick to 80%, taper to 100%</div>
            </div>
            <div class="cg-hint">⚡ Grab the cable to pull over &amp; charge</div>
          </div>
        </div>
      </div>
      <div class="hero-stats reveal">
        <div class="stat"><div class="num" data-count="10" data-suffix="+">10+</div><div class="lbl">In-depth articles &amp; guides</div></div>
        <div class="stat"><div class="num" data-count="5">5</div><div class="lbl">Free interactive EV tools</div></div>
        <div class="stat"><div class="num">Weekly</div><div class="lbl">The EV Brief newsletter</div></div>
        <div class="stat"><div class="num" data-count="100" data-suffix="%">100%</div><div class="lbl">Independent &amp; neutral</div></div>
      </div>
    </div>
  </section>

  <!-- 2 · Featured story -->
  <section class="section alt">
    <div class="container">
      ${sectionHead({ kicker: 'Featured story', title: 'The story everyone is asking about', root: '' })}
      <a class="featured-card reveal" href="/articles/${featured.slug}/">
        <div class="f-art">${cardArt(featured.slug, { title: featured.title, w: 900, h: 620 })}</div>
        <div class="f-body">
          <span class="chip">${CATEGORIES[featured.category].label}</span>
          <h3>${esc(featured.title)}</h3>
          <p>${esc(featured.excerpt)}</p>
          <span class="read-cta">Read the full story →</span>
        </div>
      </a>
    </div>
  </section>

  <!-- 3 · Latest EV news -->
  <section class="section">
    <div class="container">
      ${sectionHead({ kicker: 'Latest', title: 'Latest EV News & Analysis', sub: 'Every important development in electric mobility — minus the clickbait.', seeAll: { href: 'news/', label: 'All EV news' }, root: '' })}
      <div class="grid grid-3">
        ${latest.map((a) => articleCard(a, '')).join('\n')}
      </div>
    </div>
  </section>

  <!-- 4 · Reviews & comparisons -->
  <section class="section alt">
    <div class="container">
      ${sectionHead({ kicker: 'Reviews', title: 'Reviews & Comparisons', sub: 'Real range, real charging speed, real verdicts — tested against the spec sheet.', seeAll: { href: 'reviews/', label: 'All reviews' }, root: '' })}
      <div class="grid grid-3">
        ${reviewSlugs.map((s) => articleCard(bySlug[s], '')).join('\n')}
      </div>
    </div>
  </section>

  <!-- 5 · Buying guides -->
  <section class="section">
    <div class="container">
      ${sectionHead({ kicker: 'Start here', title: 'EV Buying Guides', sub: 'Considering the switch? These guides answer the questions that actually matter.', seeAll: { href: 'guides/', label: 'All guides' }, root: '' })}
      <div class="grid grid-3">
        ${guideSlugs.map((s) => articleCard(bySlug[s], '')).join('\n')}
      </div>
    </div>
  </section>

  <!-- 6 · EV tools -->
  <section class="section alt">
    <div class="container">
      ${sectionHead({ kicker: 'Interactive', title: 'Free EV Tools & Calculators', sub: 'Stop guessing. Calculate charging costs, range, savings and battery health with real numbers.', seeAll: { href: 'tools/', label: 'All tools' }, root: '' })}
      <div class="grid grid-3">
        ${TOOLS.map((t) => `<a class="card tool-card reveal" href="/tools/${t.slug}/">
          <span class="tool-icon">${t.icon}</span>
          <h3>${esc(t.name)}</h3>
          <p>${esc(t.short)}</p>
          <span class="tool-go">Open tool →</span>
        </a>`).join('\n')}
      </div>
    </div>
  </section>

  <!-- 7 · Battery technology -->
  <section class="section">
    <div class="container">
      ${sectionHead({ kicker: 'Deep tech', title: 'Battery Technology', sub: 'Solid-state chemistry, degradation, charging curves — the science behind the range.', seeAll: { href: 'battery-charging/', label: 'Battery & charging' }, root: '' })}
      <div class="grid grid-2">
        ${batterySlugs.map((s) => articleCard(bySlug[s], '')).join('\n')}
      </div>
      <div class="topic-chips">
        <a href="/battery-charging/">Solid-State Batteries</a>
        <a href="/battery-charging/">Battery Degradation</a>
        <a href="/battery-charging/">Charging Curves</a>
        <a href="/battery-charging/">Fast Charging</a>
        <a href="/tools/battery-health/">Battery Health Checker</a>
      </div>
    </div>
  </section>

  <!-- 8 · Future mobility -->
  <section class="section alt">
    <div class="container">
      ${sectionHead({ kicker: 'What’s next', title: 'Future Mobility', sub: 'Robotaxis, autonomy, smart cities — a clear-eyed look at where transport is heading.', seeAll: { href: 'future-mobility/', label: 'Future mobility' }, root: '' })}
      <div class="grid grid-2">
        ${futureSlugs.map((s) => articleCard(bySlug[s], '')).join('\n')}
      </div>
      <div class="topic-chips">
        <a href="/future-mobility/">Robotaxis</a>
        <a href="/future-mobility/">Autonomous Vehicles</a>
        <a href="/future-mobility/">Smart Cities</a>
        <a href="/future-mobility/">AI in Transportation</a>
      </div>
    </div>
  </section>

  <!-- 9 · Video content -->
  <section class="section">
    <div class="container">
      ${sectionHead({ kicker: 'EV Horizon Studio', title: 'Watch: Video Content', sub: 'Every big story, also as video — built for YouTube, Shorts, TikTok and Reels.', seeAll: { href: 'videos/', label: 'All videos' }, root: '' })}
      <div class="grid grid-3">
        ${VIDEOS.slice(0, 3).map((v) => videoCard(v, '')).join('\n')}
      </div>
    </div>
  </section>

  <!-- 10 · Newsletter -->
  ${newsletterBand('')}

  <!-- 11 · Advertising opportunities -->
  <section class="section alt" id="partners">
    <div class="container">
      ${sectionHead({ kicker: 'Partner with us', title: 'Advertising Opportunities', sub: 'EV Horizon reaches EV enthusiasts, first-time buyers and future-mobility professionals. Put your brand in front of them.', seeAll: { href: 'contact/#advertise', label: 'Advertise with us' }, root: '' })}
      <div class="ad-leaderboard">${mockAd('leaderboard', ADS.voltpath)}</div>
      <div class="ad-grid">
        ${mockAd('sidebar', ADS.amperly)}
        ${mockAd('native', ADS.gridhome)}
        ${mockAd('sidebar', ADS.lumen)}
      </div>
      <p class="ad-disclaimer">Example placements. Brands shown are illustrative — <a href="/contact/#advertise">advertise with EV Horizon →</a></p>
      <div class="topic-chips" style="justify-content:center;">
        <a href="/contact/#advertise">Partner Section — charging networks, insurers, fleet services →</a>
      </div>
    </div>
  </section>`;

  page('', {
    title: 'EV Horizon — Electric Cars, EV News & Future Mobility',
    description: SITE_DESCRIPTION,
    active: null,
    content,
    scripts: ['assets/js/charge-game.js'],
    jsonld: [
      ORG_LD,
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search/?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  });
}

/* ---------------------------------------------------------------------- */
/* CATEGORY PAGES                                                          */
/* ---------------------------------------------------------------------- */

function categoryPages() {
  for (const cat of Object.values(CATEGORIES)) {
    const items = byCat(cat.key);
    const trail = [{ label: 'Home', href: '' }, { label: cat.label }];
    const content = `
  <div class="page-hero">
    <div class="container">
      ${breadcrumbs('/', trail).replace(/href="\/"/g, 'href="/index.html"')}
      <h1>${esc(cat.label)}</h1>
      <p class="intro">${esc(cat.intro)}</p>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="grid grid-3">
        ${items.map((a) => articleCard(a, '/')).join('\n')}
      </div>
      <div class="ad-leaderboard" style="margin-top:48px;">${mockAd('leaderboard', ADS.voltpath)}</div>
    </div>
  </section>
  ${newsletterBand('/')}`;
    page(cat.slug, {
      title: `${cat.title} | ${SITE_NAME}`,
      description: cat.description,
      active: `${cat.slug}/`,
      content,
      jsonld: [
        breadcrumbsLd([{ label: 'Home', href: '' }, { label: cat.label, href: `${cat.slug}/` }]),
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: cat.title,
          url: `${SITE_URL}/${cat.slug}/`,
          description: cat.description,
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
        },
      ],
    });
  }
}

/* ---------------------------------------------------------------------- */
/* ARTICLE PAGES                                                           */
/* ---------------------------------------------------------------------- */

function articlePages() {
  for (const a of articles) {
    const cat = CATEGORIES[a.category];
    const trail = [{ label: 'Home', href: '' }, { label: cat.label, href: `${cat.slug}/` }, { label: a.title }];
    const body = a.body
      .map((sec) => `<h2>${esc(sec.h2)}</h2>\n${sec.paragraphs.map((p) => `<p>${p}</p>`).join('\n')}`)
      .join('\n');
    const faq = a.faq
      .map((f, i) => `<details class="faq-item"${i === 0 ? ' open' : ''}><summary>${esc(f.q)}</summary><div class="faq-a">${esc(f.a)}</div></details>`)
      .join('\n');
    const related = (a.related || []).map((s) => bySlug[s]).filter(Boolean).slice(0, 3);
    const latestList = articles.filter((x) => x.slug !== a.slug).slice(0, 4)
      .map((x) => `<li><span class="mini-cat">${CATEGORIES[x.category].label}</span><a href="/articles/${x.slug}/">${esc(x.title)}</a></li>`)
      .join('\n');
    const toolsList = TOOLS.slice(0, 4)
      .map((t) => `<li><a href="/tools/${t.slug}/">${esc(t.name)}</a></li>`)
      .join('\n');

    const content = `
  <div class="page-hero">
    <div class="container">
      ${breadcrumbs('/', trail)}
      <h1>${esc(a.title)}</h1>
      <div class="article-meta-row">
        <span class="chip">${cat.label}</span>
        <span>${esc(a.author)}</span><span class="dot">•</span>
        <span>Updated ${fmtDate(a.date)}</span><span class="dot">•</span>
        <span>${a.readTime} min read</span>
      </div>
    </div>
  </div>
  <div class="container article-layout">
    <article class="prose">
      <div class="article-hero-art">${artFor(a, '/', { w: 900, h: 420 })}</div>
      ${a.imageCredit ? `<p class="img-credit">${esc(a.imageCredit)}</p>` : ''}
      <p style="font-size:18.5px;color:var(--text);">${esc(a.excerpt)}</p>
      ${body}
      <div class="faq-block">
        <h2 style="padding-top:0;">Frequently asked questions</h2>
        ${faq}
      </div>
    </article>
    <aside class="sidebar">
      ${mockAd('sidebar', ADS.amperly)}
      <div class="sidebar-box">
        <h4>⚡ Try our EV tools</h4>
        <ul>${toolsList}</ul>
      </div>
      <div class="sidebar-box">
        <h4>Latest on EV Horizon</h4>
        <ul>${latestList}</ul>
      </div>
    </aside>
  </div>
  <section class="related-section">
    <div class="container">
      ${sectionHead({ kicker: 'Keep reading', title: 'Related stories', root: '' })}
      <div class="grid grid-3">
        ${related.map((r) => articleCard(r, '/')).join('\n')}
      </div>
    </div>
  </section>
  ${newsletterBand('/')}`;

    page(`articles/${a.slug}`, {
      title: a.seoTitle,
      description: a.metaDescription,
      active: `${cat.slug}/`,
      ogType: 'article',
      content,
      jsonld: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.metaDescription,
          datePublished: a.date,
          dateModified: a.date,
          author: { '@type': 'Organization', name: a.author, url: SITE_URL },
          publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/favicon.svg` } },
          image: `${SITE_URL}/assets/og-cover.png`,
          mainEntityOfPage: `${SITE_URL}/articles/${a.slug}/`,
          articleSection: cat.label,
          keywords: (a.keywords || []).join(', '),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: a.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        },
        breadcrumbsLd([{ label: 'Home', href: '' }, { label: cat.label, href: `${cat.slug}/` }, { label: a.title, href: `articles/${a.slug}/` }]),
      ],
    });
  }
}

/* ---------------------------------------------------------------------- */
/* TOOLS                                                                   */
/* ---------------------------------------------------------------------- */

function toolsPages() {
  // Index
  const content = `
  <div class="page-hero">
    <div class="container">
      ${breadcrumbs('/', [{ label: 'Home', href: '' }, { label: 'EV Tools' }])}
      <h1>Free EV Tools &amp; Calculators</h1>
      <p class="intro">Five interactive calculators that replace guesswork with numbers — charging cost, charging time, savings, range and battery health.</p>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="grid grid-3">
        ${TOOLS.map((t) => `<a class="card tool-card reveal" href="/tools/${t.slug}/">
          <span class="tool-icon">${t.icon}</span>
          <h3>${esc(t.name)}</h3>
          <p>${esc(t.short)}</p>
          <span class="tool-go">Open tool →</span>
        </a>`).join('\n')}
      </div>
      <div class="tool-explainer" style="padding-bottom:0;">
        <div class="inner">
          <h3>How our calculators work</h3>
          <p>Every tool runs instantly in your browser — no signup, no data collected. The math uses real-world factors (charging losses, temperature effects, charging-curve behavior) drawn from published fleet data, not lab figures.</p>
          <p>Results are estimates for guidance. For background, start with <a href="/articles/ev-charging-explained/">EV Charging Explained</a> and <a href="/articles/cost-of-owning-an-ev/">The Real Cost of Owning an EV</a>.</p>
        </div>
      </div>
    </div>
  </section>
  ${newsletterBand('/')}`;
  page('tools', {
    title: `Free EV Tools & Calculators — Charging, Range, Savings | ${SITE_NAME}`,
    description: 'Five free EV calculators: charging cost, charging time, fuel savings, real-world range and battery health. Instant results, no signup.',
    active: 'tools/',
    content,
    jsonld: [breadcrumbsLd([{ label: 'Home', href: '' }, { label: 'EV Tools', href: 'tools/' }])],
  });

  // Individual tools
  for (const t of TOOLS) {
    const relatedLinks = t.related.map((s) => bySlug[s]).filter(Boolean)
      .map((a) => `<li><a href="/articles/${a.slug}/">${esc(a.title)}</a></li>`).join('');
    const explain = t.explain.map(([h, p]) => `<h3>${esc(h)}</h3><p>${p}</p>`).join('\n');
    const content = `
  <div class="page-hero">
    <div class="container">
      ${breadcrumbs('/', [{ label: 'Home', href: '' }, { label: 'EV Tools', href: 'tools/' }, { label: t.name }])}
      <h1>${esc(t.name)}</h1>
      <p class="intro">${esc(t.short)}</p>
    </div>
  </div>
  <div class="container calc-layout" data-tool="${t.slug}">
    <div class="calc-card">
      <h2>Your inputs</h2>
      ${t.toggle ? UNIT_TOGGLE : ''}
      ${t.form()}
    </div>
    <div class="results-card" aria-live="polite">
      <h2>Results</h2>
      ${t.results()}
    </div>
  </div>
  <div class="container tool-explainer">
    <div class="inner">
      ${explain}
      <h3>Related reading</h3>
      <ul style="padding-left:20px;color:var(--muted);">${relatedLinks}</ul>
      <p style="margin-top:14px;opacity:0.8;">Estimates for guidance only — see our <a href="/disclaimer/">disclaimer</a>.</p>
    </div>
  </div>
  ${newsletterBand('/')}`;
    page(`tools/${t.slug}`, {
      title: `${t.title} | ${SITE_NAME}`,
      description: t.description,
      active: 'tools/',
      content,
      scripts: ['assets/js/tools.js'],
      jsonld: [
        breadcrumbsLd([{ label: 'Home', href: '' }, { label: 'EV Tools', href: 'tools/' }, { label: t.name, href: `tools/${t.slug}/` }]),
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: t.name,
          url: `${SITE_URL}/tools/${t.slug}/`,
          description: t.description,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      ],
    });
  }
}

/* ---------------------------------------------------------------------- */
/* VIDEOS                                                                  */
/* ---------------------------------------------------------------------- */

function videosPage() {
  const yt = SOCIALS[0].href;
  const content = `
  <div class="page-hero">
    <div class="container">
      ${breadcrumbs('/', [{ label: 'Home', href: '' }, { label: 'Videos' }])}
      <h1>EV Horizon Studio</h1>
      <p class="intro">Every major EV Horizon story is produced for video too — long-form YouTube explainers, Shorts, TikToks and Reels. The channel launches alongside our first season of explainers.</p>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="grid grid-3">
        ${VIDEOS.map((v) => videoCard(v, '/', yt)).join('\n')}
      </div>
      <div class="tool-explainer" style="padding-bottom:0;">
        <div class="inner">
          <h3>One story, every format</h3>
          <p>EV Horizon is built content-first: each article ships with a long-form video script, a Shorts hook, a TikTok cut, an Instagram Reel and a newsletter feature. Read the source articles behind these videos in <a href="/news/">EV News</a>, <a href="/guides/">Guides</a> and <a href="/battery-charging/">Battery &amp; Charging</a>.</p>
          <div class="btn-row" style="margin-top:18px;">
            <a class="btn btn-primary" href="${yt}" target="_blank" rel="noopener">Subscribe on YouTube</a>
            <a class="btn btn-ghost" href="/contact/">Pitch us a video idea</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  ${newsletterBand('/')}`;
  page('videos', {
    title: `EV Videos — YouTube Explainers, Shorts & Reels | ${SITE_NAME}`,
    description: 'EV Horizon Studio: video explainers on electric cars, batteries and future mobility — built for YouTube, Shorts, TikTok and Instagram Reels.',
    active: 'videos/',
    content,
    jsonld: [breadcrumbsLd([{ label: 'Home', href: '' }, { label: 'Videos', href: 'videos/' }])],
  });
}

/* ---------------------------------------------------------------------- */
/* SEARCH                                                                  */
/* ---------------------------------------------------------------------- */

function searchPage() {
  const filters = [
    ['all', 'All'], ['news', 'News'], ['reviews', 'Reviews'], ['guides', 'Guides'],
    ['battery', 'Battery'], ['future', 'Future'], ['tool', 'Tools'],
  ].map(([v, t], i) => `<button data-type="${v}"${i === 0 ? ' class="active"' : ''}>${t}</button>`).join('\n');

  const content = `
  <div class="page-hero search-hero">
    <div class="container">
      ${breadcrumbs('/', [{ label: 'Home', href: '' }, { label: 'Search' }])}
      <h1>Search EV Horizon</h1>
      <input type="search" id="search-input" placeholder="Search by brand, model, category or keyword…" aria-label="Search EV Horizon">
      <div class="search-filters">${filters}</div>
      <p class="intro" id="search-count" style="margin-top:10px;font-size:15px;"></p>
    </div>
  </div>
  <section class="search-results">
    <div class="container" id="search-results"></div>
  </section>`;
  page('search', {
    title: `Search — Articles, Reviews, Guides & Tools | ${SITE_NAME}`,
    description: 'Search EV Horizon by brand, model, category, article or keyword — across EV news, reviews, buying guides, battery technology and tools.',
    content,
    scripts: ['assets/js/search-data.js', 'assets/js/search.js'],
    jsonld: [breadcrumbsLd([{ label: 'Home', href: '' }, { label: 'Search', href: 'search/' }])],
  });

  // Search index
  const index = [
    ...articles.map((a) => ({
      type: a.category,
      categoryLabel: CATEGORIES[a.category].label,
      title: a.title,
      excerpt: a.excerpt,
      keywords: a.keywords || [],
      brands: a.brands || [],
      models: a.models || [],
      url: `../articles/${a.slug}/`,
    })),
    ...TOOLS.map((t) => ({
      type: 'tool',
      categoryLabel: 'EV Tool',
      title: t.name,
      excerpt: t.short,
      keywords: t.description.split(' ').slice(0, 12),
      brands: [],
      models: [],
      url: `../tools/${t.slug}/`,
    })),
    { type: 'page', categoryLabel: 'Page', title: 'About EV Horizon', excerpt: 'Who we are, how we work and where EV Horizon is going.', keywords: ['about', 'mission', 'team'], brands: [], models: [], url: '../about/' },
    { type: 'page', categoryLabel: 'Page', title: 'Contact & Advertising', excerpt: 'Get in touch, pitch a story or partner with EV Horizon.', keywords: ['contact', 'advertise', 'partnership', 'sponsor'], brands: [], models: [], url: '../contact/' },
    { type: 'page', categoryLabel: 'Page', title: 'EV Horizon Studio — Videos', excerpt: 'YouTube explainers, Shorts, TikToks and Reels.', keywords: ['video', 'youtube', 'shorts'], brands: [], models: [], url: '../videos/' },
  ];
  write('assets/js/search-data.js', `/* Generated — do not edit by hand. Rebuild with: node _build/generate.js */\nvar SEARCH_INDEX = ${JSON.stringify(index, null, 1)};\n`);
}

/* ---------------------------------------------------------------------- */
/* STATIC PAGES                                                            */
/* ---------------------------------------------------------------------- */

function aboutPage() {
  const content = `
  <div class="page-hero">
    <div class="container">
      ${breadcrumbs('/', [{ label: 'Home', href: '' }, { label: 'About' }])}
      <h1>Making electric mobility easy to understand</h1>
      <p class="intro">${SITE_NAME} — ${SITE_TAGLINE}.</p>
    </div>
  </div>
  <div class="container static-page">
    <p style="font-size:18px;">EV Horizon was created from a passion for electric vehicles, future transportation and sustainable innovation. Our goal is simple: make EV technology easy to understand — through news, reviews, guides and interactive tools that turn confusing jargon into clear answers.</p>
    <p>The shift to electric mobility is the biggest change in transportation in a century, and most coverage of it falls into two traps: breathless hype or impenetrable engineering. EV Horizon sits deliberately in between — enthusiastic about the technology, honest about its trade-offs, and always written for the person who just wants a straight answer.</p>

    <h2>What we cover</h2>
    <div class="value-grid">
      <div class="v-item"><h3>EV News</h3><p>The launches, breakthroughs and business moves that actually matter — without the clickbait.</p></div>
      <div class="v-item"><h3>Reviews &amp; Comparisons</h3><p>Real range, real charging speed and honest verdicts, tested against the spec sheet.</p></div>
      <div class="v-item"><h3>Buying Guides</h3><p>Beginner-friendly answers for first-time buyers — from charging basics to used EV checklists.</p></div>
      <div class="v-item"><h3>Interactive Tools</h3><p>Five free calculators for charging cost, charging time, savings, range and battery health.</p></div>
      <div class="v-item"><h3>Battery &amp; Charging Tech</h3><p>Solid-state cells, degradation, charging curves — the science, explained in plain language.</p></div>
      <div class="v-item"><h3>Future Mobility</h3><p>Robotaxis, autonomous driving and smart cities — a clear-eyed look at what’s next.</p></div>
    </div>

    <h2>How we work</h2>
    <ul>
      <li><strong>Independent and neutral.</strong> We are not affiliated with any automaker. No fanboy language, for any brand.</li>
      <li><strong>Beginner-friendly by default.</strong> If a sentence needs an engineering degree, we rewrite it.</li>
      <li><strong>Numbers over adjectives.</strong> Claims come with data; estimates come with assumptions.</li>
      <li><strong>Clearly labelled partnerships.</strong> Any future sponsored content will always be marked as such.</li>
    </ul>

    <h2>More than a website</h2>
    <p>EV Horizon is built content-first: every story is designed to live as an article, a YouTube explainer, a Short, a TikTok, a Reel, an infographic and a newsletter feature. The <a href="/videos/">EV Horizon Studio</a> page previews our video slate, and the Weekly EV Brief delivers the biggest stories to your inbox every week.</p>
    <p>Questions, ideas, corrections or partnership inquiries — we read everything. <a href="/contact/">Get in touch</a>.</p>
  </div>
  ${newsletterBand('/')}`;
  page('about', {
    title: `About EV Horizon — Independent EV News, Reviews & Tools`,
    description: 'EV Horizon was created from a passion for electric vehicles and sustainable innovation. We make EV technology easy to understand through news, reviews, guides and interactive tools.',
    content,
    jsonld: [
      { ...ORG_LD, '@type': 'Organization' },
      breadcrumbsLd([{ label: 'Home', href: '' }, { label: 'About', href: 'about/' }]),
    ],
  });
}

function contactPage() {
  const socials = SOCIALS.map((s) => `<a href="${s.href}" target="_blank" rel="noopener"><span class="soc-ico" aria-hidden="true">${socialIcon(s.label)}</span>${esc(s.label)}</a>`).join('\n');
  const content = `
  <div class="page-hero">
    <div class="container">
      ${breadcrumbs('/', [{ label: 'Home', href: '' }, { label: 'Contact' }])}
      <h1>Get in touch</h1>
      <p class="intro">Questions, story tips, corrections or partnerships — we read everything and reply within two working days.</p>
    </div>
  </div>
  <div class="container contact-grid">
    <div class="form-card">
      <h2>Send us a message</h2>
      <form data-contact>
        <div class="field"><label for="c-name">Your name</label><input type="text" id="c-name" name="name" required></div>
        <div class="field"><label for="c-email">Email address</label><input type="email" id="c-email" name="email" required></div>
        <div class="field"><label for="c-topic">Topic</label>
          <select id="c-topic" name="topic">
            <option>General</option>
            <option>Advertising &amp; Partnerships</option>
            <option>Story tip</option>
            <option>Correction</option>
            <option>Press</option>
          </select>
        </div>
        <div class="field"><label for="c-msg">Message</label><textarea id="c-msg" name="message" required></textarea></div>
        <button class="btn btn-primary" type="submit">Send message</button>
      </form>
      <p class="form-success" role="status">Thanks — your message is on its way. We’ll reply within two working days.</p>
      <p class="form-note">Or email us directly: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
    </div>
    <div class="info-stack">
      <div class="form-card" id="advertise">
        <h2>Advertise with us</h2>
        <p style="color:var(--muted);font-size:15px;margin-bottom:16px;">EV Horizon reaches EV enthusiasts, future buyers and mobility professionals. Available placements:</p>
        <ul style="color:var(--muted);padding-left:20px;font-size:14.5px;">
          <li>Display — leaderboard &amp; sidebar placements</li>
          <li>Sponsored content — clearly labelled native articles</li>
          <li>Newsletter sponsorship — solo placement in the Weekly EV Brief</li>
          <li>Brand partnerships — chargers, insurance, fleet &amp; energy services</li>
        </ul>
        <p style="margin-top:16px;font-size:14.5px;"><a href="mailto:${ADS_EMAIL}">${ADS_EMAIL}</a></p>
      </div>
      <div class="form-card">
        <h2>Join the Weekly EV Brief</h2>
        <form class="newsletter-form" data-newsletter style="margin-top:6px;">
          <input type="hidden" name="_subject" value="New EV Brief subscriber">
          <input type="email" name="email" placeholder="you@example.com" aria-label="Email address" required>
          <button class="btn btn-green" type="submit">Join</button>
        </form>
        <p class="form-success" role="status">You’re in — welcome aboard.</p>
      </div>
      <div class="form-card">
        <h2>Follow EV Horizon</h2>
        <div class="social-links" style="margin-top:8px;">${socials}</div>
      </div>
    </div>
  </div>`;
  page('contact', {
    title: `Contact EV Horizon — Questions, Tips & Advertising`,
    description: 'Contact EV Horizon: send a message, pitch a story, join the Weekly EV Brief newsletter or explore advertising and partnership opportunities.',
    content,
    jsonld: [
      breadcrumbsLd([{ label: 'Home', href: '' }, { label: 'Contact', href: 'contact/' }]),
      { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact EV Horizon', url: `${SITE_URL}/contact/` },
    ],
  });
}

function legalPages() {
  const updated = 'June 10, 2026';
  const privacy = `
  <div class="page-hero">
    <div class="container">
      ${breadcrumbs('/', [{ label: 'Home', href: '' }, { label: 'Privacy Policy' }])}
      <h1>Privacy Policy</h1>
      <p class="intro">Plain-language version first: we collect as little as possible, and we never sell your data.</p>
    </div>
  </div>
  <div class="container static-page">
    <p class="updated">Last updated: ${updated}</p>
    <h2>What we collect</h2>
    <p>EV Horizon is a content website. Our interactive calculators run entirely in your browser — the numbers you enter are never transmitted or stored. If you subscribe to our newsletter, we store your email address with our email service provider solely to send you the Weekly EV Brief. If you contact us, we keep your message to respond to it.</p>
    <h2>Analytics</h2>
    <p>We may use privacy-respecting, aggregate analytics to understand which articles and tools are useful (page views, approximate region, device type). We do not build individual profiles.</p>
    <h2>Cookies</h2>
    <p>The site itself does not require cookies to function. If advertising is introduced in the future (see below), ad partners may use cookies subject to your consent where required by law.</p>
    <h2>Future advertising</h2>
    <p>EV Horizon may display advertising (such as Google AdSense) or clearly labelled sponsored content in the future. If that happens, this policy will be updated and any required consent mechanisms will be added before launch.</p>
    <h2>Your rights</h2>
    <p>You can unsubscribe from the newsletter with one click at any time, and you may request access to or deletion of any personal data we hold by emailing <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
    <h2>Contact</h2>
    <p>Privacy questions: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
  </div>`;
  page('privacy', {
    title: `Privacy Policy | ${SITE_NAME}`,
    description: 'EV Horizon privacy policy: what we collect (very little), how we use it, and your rights. Calculators run entirely in your browser.',
    content: privacy,
    jsonld: [breadcrumbsLd([{ label: 'Home', href: '' }, { label: 'Privacy Policy', href: 'privacy/' }])],
  });

  const disclaimer = `
  <div class="page-hero">
    <div class="container">
      ${breadcrumbs('/', [{ label: 'Home', href: '' }, { label: 'Disclaimer' }])}
      <h1>Disclaimer</h1>
      <p class="intro">What you can and can’t rely on EV Horizon for.</p>
    </div>
  </div>
  <div class="container static-page">
    <p class="updated">Last updated: ${updated}</p>
    <h2>Editorial independence</h2>
    <p>EV Horizon is independent and is not affiliated with, endorsed by, or sponsored by any vehicle manufacturer. Brand and model names are used for identification and commentary only and remain the property of their respective owners.</p>
    <h2>Information, not advice</h2>
    <p>Content on EV Horizon is provided for general information and education. It is not financial, legal or purchasing advice. Vehicle prices, specifications, incentives and availability change frequently and vary by market — always verify details with manufacturers and local dealers before making decisions.</p>
    <h2>Calculator estimates</h2>
    <p>Our interactive tools produce estimates based on stated assumptions and typical real-world factors. Actual charging costs, charging times, range and battery health vary with vehicle, climate, infrastructure and usage. Estimates are a starting point for your own research, not a guarantee.</p>
    <h2>Future affiliate &amp; sponsored content</h2>
    <p>EV Horizon may in the future earn commissions through affiliate links or publish sponsored content. Any such content will be clearly labelled, and it will never change an editorial verdict.</p>
    <h2>External links</h2>
    <p>Links to external sites are provided for convenience; we are not responsible for their content or practices.</p>
    <h2>Questions</h2>
    <p>Contact us at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
  </div>`;
  page('disclaimer', {
    title: `Disclaimer | ${SITE_NAME}`,
    description: 'EV Horizon disclaimer: editorial independence, calculator estimate accuracy, and how future affiliate or sponsored content will be handled.',
    content: disclaimer,
    jsonld: [breadcrumbsLd([{ label: 'Home', href: '' }, { label: 'Disclaimer', href: 'disclaimer/' }])],
  });
}

/* ---------------------------------------------------------------------- */
/* SEO files                                                               */
/* ---------------------------------------------------------------------- */

function seoFiles() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: '', priority: '1.0', lastmod: today },
    ...Object.values(CATEGORIES).map((c) => ({ loc: `${c.slug}/`, priority: '0.8', lastmod: today })),
    { loc: 'tools/', priority: '0.9', lastmod: today },
    ...TOOLS.map((t) => ({ loc: `tools/${t.slug}/`, priority: '0.8', lastmod: today })),
    ...articles.map((a) => ({ loc: `articles/${a.slug}/`, priority: '0.7', lastmod: a.date })),
    { loc: 'videos/', priority: '0.6', lastmod: today },
    { loc: 'search/', priority: '0.4', lastmod: today },
    { loc: 'about/', priority: '0.5', lastmod: today },
    { loc: 'contact/', priority: '0.5', lastmod: today },
    { loc: 'privacy/', priority: '0.2', lastmod: today },
    { loc: 'disclaimer/', priority: '0.2', lastmod: today },
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE_URL}/${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  write('sitemap.xml', xml);
  write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /_build/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
}

/* ---------------------------------------------------------------------- */
/* Run                                                                     */
/* ---------------------------------------------------------------------- */

homePage();
categoryPages();
articlePages();
toolsPages();
videosPage();
searchPage();
aboutPage();
contactPage();
legalPages();
seoFiles();

console.log(`Generated ${written.length} files:`);
written.forEach((f) => console.log('  ' + f));
