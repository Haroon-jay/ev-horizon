export const SITE_URL = 'https://www.evhorizon.media'; // change to your real domain before launch
export const SITE_NAME = 'EV Horizon';
export const SITE_TAGLINE = 'Tracking the Future of Electric Mobility';
export const SITE_DESCRIPTION =
  'EV Horizon covers electric cars, EV news, reviews, buying guides, charging technology, battery innovation and future mobility — with free interactive EV calculators.';
export const CONTACT_EMAIL = 'hello@evhorizon.media';
export const ADS_EMAIL = 'partnerships@evhorizon.media';

// Real form submissions (newsletter + contact) — no backend needed.
// 1. Sign up free at https://formspree.io  2. Create a form  3. Paste its endpoint below
//    (looks like https://formspree.io/f/abcdwxyz) and rebuild.
// Leave blank to keep the front-end demo behaviour.
export const FORM_ENDPOINT = 'https://formspree.io/f/mdavrzpp';

export const NAV = [
  { href: 'news/', label: 'EV News' },
  { href: 'reviews/', label: 'Reviews' },
  { href: 'guides/', label: 'Guides' },
  { href: 'tools/', label: 'EV Tools' },
];

export const NAV_MORE = [
  { href: 'battery-charging/', label: 'Battery & Charging' },
  { href: 'future-mobility/', label: 'Future Mobility' },
  { href: 'videos/', label: 'Videos' },
  { href: 'about/', label: 'About' },
  { href: 'contact/', label: 'Contact' },
];

export const CATEGORIES = {
  news: {
    key: 'news',
    slug: 'news',
    label: 'EV News',
    title: 'EV News — Electric Vehicle News & Industry Updates',
    description:
      'The latest electric vehicle news: new EV launches, battery breakthroughs, charging networks, sales trends and the companies shaping electric mobility.',
    intro:
      'New models, battery breakthroughs, charging milestones and the business of electric mobility — reported clearly, without the hype.',
  },
  reviews: {
    key: 'reviews',
    slug: 'reviews',
    label: 'Reviews',
    title: 'EV Reviews & Comparisons — Electric Car Reviews',
    description:
      'Independent electric car reviews and head-to-head EV comparisons. Real range, charging performance, practicality and value — tested against the spec sheet.',
    intro:
      'Honest, neutral reviews and comparisons. We focus on what actually matters: real-world range, charging speed, practicality and value.',
  },
  guides: {
    key: 'guides',
    slug: 'guides',
    label: 'Buying Guides',
    title: 'EV Buying Guides — How to Choose Your Electric Car',
    description:
      'Beginner-friendly EV buying guides: charging explained, used EV checklists, ownership costs and common myths — everything you need before you buy.',
    intro:
      'Everything you need to know before you buy — written for first-time EV buyers, with zero jargon.',
  },
  battery: {
    key: 'battery',
    slug: 'battery-charging',
    label: 'Battery & Charging',
    title: 'EV Battery Technology & Charging — Explained',
    description:
      'EV battery technology and charging explained: solid-state batteries, degradation, charging curves, fast charging and the science behind electric range.',
    intro:
      'The technology inside the pack — solid-state chemistry, degradation, charging curves and fast charging — explained in plain language.',
  },
  future: {
    key: 'future',
    slug: 'future-mobility',
    label: 'Future Mobility',
    title: 'Future Mobility — Robotaxis, Autonomy & Smart Cities',
    description:
      'The future of transportation: robotaxis, autonomous vehicles, smart cities and AI in transportation. Where electric mobility goes next.',
    intro:
      'Robotaxis, autonomous driving, smart cities and AI — a clear-eyed look at where transportation is heading.',
  },
};

// Articles cross-listed on category pages beyond their primary category
export const CROSS_LIST = {
  battery: ['ev-charging-explained'],
};

export const SOCIALS = [
  { label: 'YouTube', href: 'https://youtube.com/@evhorizon' },
  { label: 'X / Twitter', href: 'https://x.com/evhorizon' },
  { label: 'Instagram', href: 'https://instagram.com/evhorizon' },
  { label: 'TikTok', href: 'https://tiktok.com/@evhorizon' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/evhorizon' },
];
