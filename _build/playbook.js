/* Generates CONTENT-PLAYBOOK.md from the article content files. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CATEGORIES } from './site.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, 'content');
const articles = [];
for (const f of fs.readdirSync(contentDir).filter((f) => f.endsWith('.js'))) {
  articles.push((await import(pathToFileURL(path.join(contentDir, f)).href)).default);
}
articles.sort((a, b) => (a.date < b.date ? 1 : -1));

const wordCount = (a) =>
  a.body.reduce((n, s) => n + s.paragraphs.join(' ').replace(/<[^>]+>/g, '').split(/\s+/).length, 0);

let md = `# EV Horizon — Content Playbook

How every EV Horizon story becomes a blog post, a YouTube video, a Short, a TikTok, a Reel, a newsletter feature and an infographic.

## The repurposing pipeline

1. **Article** — published on the site (SEO-optimized, FAQ schema, internal links).
2. **YouTube video** — long-form explainer based on the article outline.
3. **YouTube Short / TikTok / Reel** — one hook per article, cut vertical, under 35 seconds.
4. **Newsletter** — the Weekly EV Brief features one lead story + tool of the week.
5. **Infographic** — one chart or comparison per article, exported for Instagram/Pinterest.

## Target keywords (site-wide)

electric cars · EV news · electric vehicle news · EV reviews · electric car reviews · EV buying guide · EV charging · EV battery technology · future mobility · electric vehicles

## Publishing cadence (suggested)

- 2 articles per week (1 news/analysis + 1 evergreen guide or review)
- 1 long-form video per week, 3 Shorts per week
- Newsletter every Friday

## Monetization roadmap

1. **Now (foundation):** ad placeholders live, traffic building, newsletter list growing.
2. **Phase 2:** Google AdSense on article pages; affiliate links in buying guides (chargers, accessories).
3. **Phase 3:** newsletter sponsorships (solo placement), sponsored content (clearly labelled).
4. **Phase 4:** brand partnerships — charging networks, EV insurance, fleet services; YouTube ad revenue.

---

# Article-by-article plan

`;

for (const a of articles) {
  md += `## ${a.title}

| | |
|---|---|
| **URL** | /articles/${a.slug}/ |
| **Category** | ${CATEGORIES[a.category].label} |
| **Published** | ${a.date} · ~${wordCount(a)} words · ${a.readTime} min read |
| **SEO title** | ${a.seoTitle} |
| **Meta description** | ${a.metaDescription} |
| **Target keywords** | ${(a.keywords || []).join(', ')} |

**Featured image suggestion:** ${a.imageSuggestion}

**YouTube video idea:** ${a.youtubeIdea}

**Shorts / TikTok / Reel idea:** ${a.shortsIdea}

**Internal links:** ${(a.related || []).map((s) => `/articles/${s}/`).join(' · ')}

`;
}

fs.writeFileSync(path.resolve(__dirname, '..', 'CONTENT-PLAYBOOK.md'), md);
console.log('CONTENT-PLAYBOOK.md written');
