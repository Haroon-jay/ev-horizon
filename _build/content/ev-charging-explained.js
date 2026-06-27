const article = {
  slug: 'ev-charging-explained',
  title: 'EV Charging Explained: AC, DC, Connectors and Real Charging Times',
  seoTitle: 'EV Charging Explained: Levels, Speeds & Connectors (2026 Guide) | EV Horizon',
  metaDescription:
    'EV charging explained simply: AC vs DC, charging levels, connector types, real charging times and what it costs. The beginner-friendly guide to charging an electric car.',
  category: 'guides',
  date: '2026-05-28',
  readTime: 8,
  author: 'EV Horizon Editorial',
  excerpt:
    'Kilowatts, connectors, charging curves — EV charging sounds complicated until someone explains it properly. This guide does exactly that, in plain language.',
  imageSuggestion:
    'Close-up of a glowing charging port on a dark EV at night, cyan light trail flowing from a sleek charging station into the car.',
  keywords: ['EV charging explained', 'how to charge an electric car', 'AC vs DC charging', 'EV charging levels', 'CCS', 'NACS', 'home charging'],
  brands: ['Tesla', 'Hyundai', 'BYD'],
  models: [],
  body: [
    {
      h2: 'The one idea that explains everything: AC vs DC',
      paragraphs: [
        'Every EV battery stores direct current (DC), but the grid delivers alternating current (AC). So the only real question in charging is: where does the conversion happen? With AC charging — at home or at a workplace — a small converter inside your car does the work, which limits speed to roughly 7–22 kW. With DC fast charging, a large converter inside the station feeds DC straight into the battery, enabling 50 kW to 350 kW and beyond.',
        'That single distinction explains why home charging takes hours and highway charging takes minutes. Neither is "better" — they solve different problems. AC charging is for where your car sleeps; DC charging is for the days you drive far.',
      ],
    },
    {
      h2: 'Charging levels in practice',
      paragraphs: [
        'Level 1 is a standard household socket: 2–3 kW, adding roughly 10–15 km of range per hour. It is slow, but if you drive under 40 km a day, it can genuinely be enough. Level 2 is a dedicated home or public AC charger: 7–22 kW, fully charging most EVs overnight in 6–10 hours. This is how the vast majority of EV owners charge most of the time.',
        'DC fast charging (sometimes called Level 3) runs from 50 kW at older stations to 250–350 kW at modern hubs. A typical 10–80% session on a modern EV takes 18–35 minutes. Note the 80%: charging slows dramatically near full to protect the battery — a behavior called the charging curve, which we cover in our <a href="/articles/solid-state-batteries-explained/">battery technology explainer</a>.',
        'Want to know exactly how long your car would take? Try our <a href="/tools/charging-time/">EV Charging Time Calculator</a> — it does the math for any battery size and charger power.',
      ],
    },
    {
      h2: 'Connectors: the alphabet soup, decoded',
      paragraphs: [
        'There are really only four connectors that matter. CCS2 dominates Europe and most of the world for DC fast charging. NACS — the elegant plug Tesla designed — has become the standard in North America, with nearly every automaker adopting it. CHAdeMO is the legacy Japanese standard, now fading. GB/T is China’s national standard, used by BYD and everyone else in the world’s biggest EV market.',
        'In practice, you rarely need to think about this: your car has one port, and navigation apps filter chargers automatically. Adapters bridge most remaining gaps.',
      ],
    },
    {
      h2: 'What charging actually costs',
      paragraphs: [
        'Home charging is where EVs quietly win. At a typical residential rate of $0.15 per kWh, filling a 60 kWh battery from 10% to 80% costs about $6.50 — roughly the price of two liters of gasoline for 300+ km of driving. Off-peak overnight tariffs can cut that in half.',
        'DC fast charging costs more — typically $0.35–$0.60 per kWh — which is why the golden rule of EV ownership is: charge slowly and cheaply by default, fast-charge only when traveling. Run your own numbers with our <a href="/tools/charging-cost/">Charging Cost Calculator</a>, and see the bigger financial picture in <a href="/articles/cost-of-owning-an-ev/">The Real Cost of Owning an EV</a>.',
      ],
    },
    {
      h2: 'Five habits of happy EV owners',
      paragraphs: [
        'One: set a charge limit of 80% for daily driving and 100% only before long trips (LFP batteries are the exception — they like occasional full charges). Two: plug in whenever you are parked at home, like a phone. Three: precondition the battery before fast charging in winter. Four: use apps to check charger status before you arrive. Five: don’t camp at a fast charger past 80% — the last 20% is slow and the queue behind you is real.',
        'If you’re still shopping for your first EV, our <a href="/articles/used-ev-buying-guide/">Used EV Buying Guide</a> and <a href="/articles/common-ev-myths/">EV myths breakdown</a> are the perfect next reads.',
      ],
    },
  ],
  faq: [
    {
      q: 'How long does it take to charge an electric car?',
      a: 'On a home Level 2 charger, 6–10 hours for a full charge — typically done overnight. On a modern DC fast charger, 18–35 minutes from 10% to 80%, depending on the car and station power.',
    },
    {
      q: 'Is it cheaper to charge an EV at home or at a public charger?',
      a: 'Home charging is usually 2–4x cheaper. Typical home rates are $0.10–$0.20 per kWh versus $0.35–$0.60 per kWh at DC fast chargers.',
    },
    {
      q: 'Does fast charging damage the battery?',
      a: 'Occasional fast charging causes negligible harm on modern EVs with good thermal management. Using DC fast charging as your only charging method, every day for years, can accelerate degradation slightly — but studies show the effect is smaller than most people fear.',
    },
    {
      q: 'Can I charge an EV in the rain?',
      a: 'Yes. Charging connectors and ports are sealed and the system checks the connection electronically before any current flows. Charging in rain or snow is completely safe.',
    },
  ],
  related: ['cost-of-owning-an-ev', 'solid-state-batteries-explained', 'common-ev-myths'],
  youtubeIdea:
    'EV Charging for Absolute Beginners — a real-world walkthrough: home charging, public AC, and a 350 kW hub, with live cost and time numbers on screen.',
  shortsIdea:
    '"Why your EV charges to 80% fast and 100% slow" — 25-second charging-curve animation.',
};

export default article;
