import { SITE_URL, SITE_NAME, SITE_TAGLINE, NAV, NAV_MORE, CATEGORIES, SOCIALS, FORM_ENDPOINT } from './site.js';
import { cardArt } from './art.js';

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Brand social icons (monochrome, inherit currentColor) */
const SOCIAL_ICONS = {
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.5v-7l6.5 3.5z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 1.5h3.7l-8 9.1L24 22.5h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.5h7.6l5.2 6.9zM17.6 20.3h2L6.5 3.6H4.3z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7 .1 5.7.1 4.8.4 4.1.6c-.8.3-1.4.7-2.1 1.4C1.3 2.7.9 3.3.6 4.1.4 4.8.1 5.7.1 7 0 8.3 0 8.7 0 12s0 3.7.1 5c0 1.3.3 2.2.5 2.9.3.8.7 1.4 1.4 2.1.7.7 1.3 1.1 2.1 1.4.7.2 1.6.5 2.9.5C8.3 24 8.7 24 12 24s3.7 0 5-.1c1.3 0 2.2-.3 2.9-.5.8-.3 1.4-.7 2.1-1.4.7-.7 1.1-1.3 1.4-2.1.2-.7.5-1.6.5-2.9.1-1.3.1-1.7.1-5s0-3.7-.1-5c0-1.3-.3-2.2-.5-2.9a5.8 5.8 0 0 0-1.4-2.1A5.8 5.8 0 0 0 19.9.6C19.2.4 18.3.1 17 .1 15.7 0 15.3 0 12 0z"/><path d="M12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/><circle cx="18.4" cy="5.6" r="1.4"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 0h-3.3v13.2a2.8 2.8 0 1 1-2.8-2.8c.3 0 .5 0 .8.1V7.2a6.1 6.1 0 0 0-.8-.1 6.1 6.1 0 1 0 6.1 6.1V6.7a7.4 7.4 0 0 0 4.3 1.4V4.8a4.3 4.3 0 0 1-4.3-4.3z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 0H3.6A3.6 3.6 0 0 0 0 3.6v16.8A3.6 3.6 0 0 0 3.6 24h16.8a3.6 3.6 0 0 0 3.6-3.6V3.6A3.6 3.6 0 0 0 20.4 0zM7.2 20.4H3.6V9h3.6zM5.4 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.2V9h3.4v1.6h.1a3.8 3.8 0 0 1 3.4-1.9c3.6 0 4.3 2.4 4.3 5.5z"/></svg>',
};
export function socialIcon(label) {
  const k = String(label).toLowerCase();
  if (k.indexOf('youtube') >= 0) return SOCIAL_ICONS.youtube;
  if (k.indexOf('instagram') >= 0) return SOCIAL_ICONS.instagram;
  if (k.indexOf('tiktok') >= 0) return SOCIAL_ICONS.tiktok;
  if (k.indexOf('linkedin') >= 0) return SOCIAL_ICONS.linkedin;
  return SOCIAL_ICONS.twitter; // X / Twitter
}

/** Rewrite site-absolute hrefs/srcs (href="/x/") to relative ones for portability. */
export function rel(html, root) {
  return html.replace(/(href|src)="\/(?!\/)/g, `$1="${root}`);
}

export function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

const LOGO_SVG = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="16" cy="16" r="14.5" stroke="#00D4FF" stroke-width="2"/>
  <path d="M5 19h22" stroke="#7CFF6B" stroke-width="2" stroke-linecap="round"/>
  <path d="M10 19c0-5 2.6-8.5 6-8.5s6 3.5 6 8.5" stroke="#00D4FF" stroke-width="2" stroke-linecap="round"/>
  <path d="M14.2 10.2L17 13l-2.4 1.4 3.2 3.2" stroke="#F5F7FA" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const SEARCH_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>`;

export function header(root, active) {
  const link = (n) => {
    const isActive = active === n.href ? ' class="active" aria-current="page"' : '';
    return `<a href="${root}${n.href}"${isActive}>${n.label}</a>`;
  };
  const links = NAV.map(link).join('\n        ');
  const moreLinks = NAV_MORE.map(link).join('\n            ');
  const caret = `<svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="${root}index.html" aria-label="${SITE_NAME} — home">
        ${LOGO_SVG}
        <span><span class="logo-ev">EV</span> Horizon</span>
      </a>
      <nav class="main-nav" aria-label="Main navigation">
        ${links}
        <div class="nav-more">
          <button type="button" aria-haspopup="true" aria-expanded="false">More ${caret}</button>
          <div class="nav-more-menu">
            <div class="menu-inner">
            ${moreLinks}
            </div>
          </div>
        </div>
      </nav>
      <form class="header-search" action="${root}search/" method="get" role="search">
        <input type="search" name="q" placeholder="Search EVs…" aria-label="Search EV Horizon">
        <button type="submit" aria-label="Search">${SEARCH_ICON}</button>
      </form>
      <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;
}

export function footer(root) {
  const exploreLinks = Object.values(CATEGORIES)
    .map((c) => `<li><a href="${root}${c.slug}/">${c.label}</a></li>`)
    .join('\n            ');
  const socials = SOCIALS.map((s) => `<a class="soc-btn" href="${s.href}" rel="noopener" target="_blank" aria-label="${esc(s.label)}" title="${esc(s.label)}">${socialIcon(s.label)}</a>`).join('\n            ');
  return `<footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="logo" href="${root}index.html">${LOGO_SVG}<span><span class="logo-ev">EV</span> Horizon</span></a>
          <p>${SITE_TAGLINE}. Independent coverage of electric vehicles, charging technology, battery innovation and the road ahead.</p>
          <form class="newsletter-form" data-newsletter>
            <input type="hidden" name="_subject" value="New EV Brief subscriber">
            <input type="email" name="email" placeholder="Your email" aria-label="Email address" required>
            <button class="btn btn-primary" type="submit">Join</button>
          </form>
          <p class="form-success" role="status">You're on the list — welcome to the Weekly EV Brief.</p>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <ul>
            ${exploreLinks}
            <li><a href="${root}tools/">EV Tools</a></li>
            <li><a href="${root}videos/">Videos</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="${root}about/">About EV Horizon</a></li>
            <li><a href="${root}contact/">Contact</a></li>
            <li><a href="${root}contact/#advertise">Advertise With Us</a></li>
            <li><a href="${root}search/">Search</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Follow</h4>
          <div class="soc-row">
            ${socials}
          </div>
          <p class="soc-tag">New stories as videos, Shorts &amp; Reels.</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span data-year>2026</span> ${SITE_NAME}. All rights reserved.</span>
        <div class="legal-links">
          <a href="${root}privacy/">Privacy Policy</a>
          <a href="${root}disclaimer/">Disclaimer</a>
        </div>
      </div>
    </div>
  </footer>`;
}

/**
 * Full page shell.
 */
export function layout({
  title,
  description,
  path,          // canonical path, e.g. 'articles/foo/' or '' for home
  root,          // relative prefix back to site root, e.g. '../../'
  active = null, // nav href to highlight
  content,
  jsonld = [],
  scripts = [],  // extra script paths relative to root
  ogType = 'website',
}) {
  const canonical = `${SITE_URL}/${path}`;
  const ld = jsonld
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join('\n  ');
  const extraScripts = scripts.map((s) => `<script src="${root}${s}" defer></script>`).join('\n  ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="#05070A">
  <link rel="icon" type="image/svg+xml" href="${root}assets/favicon.svg">

  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_URL}/assets/og-cover.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${SITE_URL}/assets/og-cover.png">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${root}assets/css/style.css">
  <meta name="form-endpoint" content="${FORM_ENDPOINT}">
  ${ld}
</head>
<body>
  ${header(root, active)}
  <main id="main">
${content}
  </main>
  ${footer(root)}
  <script src="${root}assets/js/main.js" defer></script>
  <script src="${root}assets/js/cursor.js" defer></script>
  ${extraScripts}
</body>
</html>`;
}

export function breadcrumbs(root, trail) {
  // trail: [{label, href?}] — last item has no href
  const items = trail
    .map((t) => (t.href != null ? `<li><a href="${root}${t.href}">${esc(t.label)}</a></li>` : `<li aria-current="page">${esc(t.label)}</li>`))
    .join('');
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${items}</ol></nav>`;
}

export function breadcrumbsLd(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.label,
      ...(t.href != null ? { item: `${SITE_URL}/${t.href}` } : {}),
    })),
  };
}

/** Photo if the article has one (resolved at build time), generated art otherwise. */
export function artFor(a, root, { w, h } = {}) {
  if (a.image) {
    return `<img src="${root}${a.image}" alt="${esc(a.imageAlt || a.title)}" loading="lazy">`;
  }
  return cardArt(a.slug, { title: a.title, ...(w ? { w, h } : {}) });
}

export function articleCard(a, root, { chipClass = '' } = {}) {
  const cat = CATEGORIES[a.category];
  return `<a class="card reveal" href="${root}articles/${a.slug}/">
    <div class="card-art">${artFor(a, root)}</div>
    <div class="card-body">
      <span class="chip ${chipClass}">${cat.label}</span>
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.excerpt)}</p>
      <div class="card-meta"><span>${fmtDate(a.date)}</span><span>·</span><span>${a.readTime} min read</span></div>
    </div>
  </a>`;
}

export function sectionHead({ kicker, title, sub, seeAll, root }) {
  return `<div class="section-head">
    <div>
      <div class="s-kicker">${esc(kicker)}</div>
      <h2>${esc(title)}</h2>
      ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
    </div>
    ${seeAll ? `<a class="see-all" href="${root}${seeAll.href}">${esc(seeAll.label)} →</a>` : ''}
  </div>`;
}

export function adSlot(label, note, cls = '') {
  return `<div class="ad-slot ${cls}" role="note" aria-label="Advertising placeholder">
    <span>${esc(label)}</span>
    <small>${esc(note)}</small>
  </div>`;
}

/* Realistic (but fictional) demo advertisements — clearly labelled "Ad"/"Sponsored".
   These mark exactly where a real AdSense unit or direct-sold sponsor tag would sit. */
export function mockAd(format, ad) {
  const tag = esc(ad.tag || 'Ad');
  const accent = ad.accent || 'var(--accent)';
  const brand = `<span class="mad-brand"><span class="mad-logo" aria-hidden="true">${esc(ad.mark || ad.brand[0])}</span>${esc(ad.brand)}</span>`;

  if (format === 'leaderboard') {
    return `<div class="mad mad--leaderboard" role="note" aria-label="Example advertisement" style="--mad-accent:${accent}">
      <span class="mad-tag">${tag}</span>
      ${brand}
      <span class="mad-headline">${esc(ad.headline)}</span>
      <span class="mad-cta">${esc(ad.cta)}</span>
    </div>`;
  }
  if (format === 'native') {
    return `<div class="mad mad--native" role="note" aria-label="Sponsored content example" style="--mad-accent:${accent}">
      <span class="mad-tag">${tag}</span>
      <span class="mad-kicker">${brand}</span>
      <h3 class="mad-title">${esc(ad.headline)}</h3>
      <p class="mad-sub">${esc(ad.sub)}</p>
      <span class="mad-cta">${esc(ad.cta)}</span>
    </div>`;
  }
  return `<div class="mad mad--sidebar" role="note" aria-label="Example advertisement" style="--mad-accent:${accent}">
    <span class="mad-tag">${tag}</span>
    ${brand}
    <span class="mad-headline">${esc(ad.headline)}</span>
    <p class="mad-sub">${esc(ad.sub)}</p>
    ${ad.price ? `<span class="mad-price">${esc(ad.price)}</span>` : ''}
    <span class="mad-cta">${esc(ad.cta)}</span>
  </div>`;
}

export function newsletterBand(root, { headline = 'Join the Weekly EV Brief', sub = 'Get the biggest EV stories, new tools and honest analysis — every week, free, no spam.' } = {}) {
  return `<section class="section" aria-label="Newsletter signup">
    <div class="container">
      <div class="newsletter-band reveal">
        <h2>${esc(headline)}</h2>
        <p>${esc(sub)}</p>
        <form class="newsletter-form" data-newsletter>
          <input type="hidden" name="_subject" value="New EV Brief subscriber">
          <input type="email" name="email" placeholder="you@example.com" aria-label="Email address" required>
          <button class="btn btn-primary" type="submit">Subscribe</button>
        </form>
        <p class="form-success" role="status">You're in. The next EV Brief lands in your inbox this week.</p>
        <p class="form-note">One email a week · Unsubscribe anytime · We never share your address</p>
      </div>
    </div>
  </section>`;
}

export function videoCard(v, root, href) {
  const target = href || root + 'videos/';
  const ext = target.indexOf('http') === 0 ? ' target="_blank" rel="noopener"' : '';
  return `<a class="card video-card reveal" href="${target}"${ext}>
    <div class="card-art">${cardArt('video-' + v.title, { title: v.title })}
      <div class="play-btn"><span class="play-circle"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span></div>
      <span class="duration">${v.duration}</span>
    </div>
    <div class="card-body">
      <span class="chip green">EV Horizon Studio</span>
      <h3>${esc(v.title)}</h3>
      <p>${esc(v.desc)}</p>
      <div class="format-badges">${v.formats.map((f) => `<span>${f}</span>`).join('')}</div>
    </div>
  </a>`;
}
