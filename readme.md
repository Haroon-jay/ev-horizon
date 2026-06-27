# EV Horizon

**Tracking the Future of Electric Mobility** — a premium EV media website covering electric cars, EV news, reviews, buying guides, charging technology, battery innovation and future mobility, with five free interactive EV calculators.

Built with pure **HTML / CSS / JavaScript** — no frameworks, no build step required to host it. Works on any static host (GitHub Pages, Netlify, Vercel, cPanel, university hosting).

---

## Quick start — view the site

The site needs a local web server (clean URLs like `/news/` resolve to folders):

```bash
cd ev-horizon
python3 -m http.server 8000
# open http://localhost:8000
```

Or just drag the folder into Netlify / publish via GitHub Pages — it works as-is.

## What's inside

```
ev-horizon/
├── index.html                  Home (11 sections: hero → advertising)
├── news/ reviews/ guides/      Category pages
├── battery-charging/ future-mobility/
├── articles/<slug>/            10 full articles (Article + FAQ + Breadcrumb schema)
├── tools/                      5 interactive calculators (km/miles toggle, USD)
│   ├── charging-cost/  charging-time/  savings/  range/  battery-health/
├── videos/                     EV Horizon Studio (YouTube-ready content)
├── search/                     Global search (brand, model, category, keyword)
├── about/ contact/ privacy/ disclaimer/
├── sitemap.xml  robots.txt
├── assets/                     CSS, JS, favicon, OG image (all self-contained)
├── _build/                     Site generator — how you keep publishing (see below)
└── CONTENT-PLAYBOOK.md         Per-article SEO + video/Shorts repurposing plan
```

## Publishing new content

Articles live as structured data in `_build/content/`. To publish:

1. Copy any file in `_build/content/` (e.g. `common-ev-myths.js`) and rewrite its fields
   (title, SEO title, meta description, body sections, FAQ, related links, video ideas).
2. Rebuild the site (requires Node.js, no dependencies to install):

```bash
cd _build
node generate.js     # regenerates all pages, sitemap, search index
node playbook.js     # refreshes CONTENT-PLAYBOOK.md
```

Every page — category listings, home sections, related-article boxes, search index and sitemap — updates automatically. Card artwork is generated per-article (deterministic SVG), so new articles get unique visuals with zero design work.

## Adding real car photos

The build has a photo pipeline with automatic fallback: drop an image named after an
article's slug into `assets/img/` (e.g. `tesla-vs-byd-who-is-winning-the-ev-race.jpg`),
rebuild, and that article uses the photo on cards, the featured story and the article page.
Articles without a photo keep their generated SVG artwork. See `assets/img/HOW-TO-ADD-PHOTOS.txt`
for legitimate sources (manufacturer press kits, Unsplash/Pexels) and optional
`imageAlt` / `imageCredit` fields.

## Going live (production checklist)

1. **Domain** — set your real domain in `_build/site.js` (`SITE_URL`) and rebuild. Canonical URLs, Open Graph tags and the sitemap all derive from it.
2. **Newsletter** — forms currently show a front-end success state. Connect them to Mailchimp / Buttondown / ConvertKit by pointing the `<form data-newsletter>` elements at your provider's endpoint (one place: `assets/js/main.js`).
3. **Contact form** — currently opens the visitor's mail app, prefilled. Swap for Formspree/Netlify Forms by adding their action URL in `contact/index.html` or `_build/generate.js`.
4. **Emails** — replace `hello@evhorizon.media` / `partnerships@evhorizon.media` in `_build/site.js`.
5. **Analytics** — add a privacy-friendly snippet (Plausible/GoatCounter) to `_build/templates.js` → `layout()`, rebuild.
6. **Ads** — the dashed placeholders (leaderboard, sidebar, sponsored, newsletter sponsor) mark exactly where AdSense / sponsor tags go later.
7. **Search Console** — submit `sitemap.xml` after deploying.

## SEO already in place

Semantic HTML5 · mobile-first responsive design · meta titles & descriptions on every page · canonical URLs · Open Graph + Twitter Cards (with generated OG image) · JSON-LD schema (Organization, WebSite + SearchAction, Article, FAQPage, BreadcrumbList, CollectionPage, WebApplication) · visible + schema breadcrumbs · heavy internal linking · XML sitemap · robots.txt · fast loading (no frameworks, inline SVG artwork, two font families, deferred JS).

## Course requirement mapping

| Requirement | Where |
|---|---|
| Website/blog structure | 13 sections, category architecture, breadcrumbs |
| High-quality content | 10 articles (600–1000 words, FAQ, internal links) |
| Navigation | Sticky header, footer columns, breadcrumbs, related stories |
| Marketing communication | Hero messaging, newsletter CTAs, About brand story |
| Search functionality | `/search/` — by brand, model, category, article, keyword |
| Contact functionality | `/contact/` — form, newsletter, advertise section, socials |
| Images | Generative SVG art system (unique per article, no licensing) |
| Articles | `/articles/…` ×10 |
| Videos | `/videos/` EV Horizon Studio + home video section |
| Infographics | Interactive calculators + per-article infographic plan (playbook) |
| Advertising opportunities | Home §11 + labelled ad placeholders + `/contact/#advertise` |
| Visitor interaction | 5 calculators, search, forms, FAQ accordions |
| Continue publishing | `_build/` generator + content files |
