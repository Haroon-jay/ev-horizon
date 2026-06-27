const article = {
  slug: 'robotaxis-explained',
  title: 'Robotaxis Explained: How Driverless Taxis Actually Work',
  seoTitle: 'Robotaxis Explained: How Driverless Taxis Work in 2026 | EV Horizon',
  metaDescription:
    'Robotaxis explained: how driverless taxis work, where Waymo, Tesla and Apollo Go operate today, the economics behind them and what still stands in the way.',
  category: 'future',
  date: '2026-04-30',
  readTime: 7,
  author: 'EV Horizon Editorial',
  excerpt:
    'Driverless taxis are no longer a demo — they complete hundreds of thousands of paid rides every week. Here is how they work and where this is going.',
  imageSuggestion:
    'Sleek autonomous EV at night with visible sensor glow, city lights bokeh, no driver visible, cyan lidar arcs sweeping the street.',
  keywords: ['robotaxis', 'autonomous vehicles', 'driverless taxi', 'Waymo', 'Tesla robotaxi', 'self-driving cars', 'AI in transportation'],
  brands: ['Waymo', 'Tesla', 'Baidu', 'Zoox'],
  models: [],
  body: [
    {
      h2: 'From science fiction to Tuesday afternoon',
      paragraphs: [
        'In a growing list of cities, you can open an app and a car with no driver arrives, navigates traffic, and drops you off. Waymo alone provides hundreds of thousands of paid driverless rides every week across US cities. Baidu’s Apollo Go does the same at scale in China. Tesla runs its robotaxi service in a widening set of US cities, and Amazon’s Zoox deploys a vehicle with no steering wheel at all. The question has shifted from "will this work?" to "how fast does it spread?"',
      ],
    },
    {
      h2: 'How a robotaxi actually drives',
      paragraphs: [
        'Every robotaxi solves three problems continuously: perception (what is around me?), prediction (what will it do next?), and planning (what should I do?). Most operators — Waymo, Zoox, Apollo Go — answer the first question with sensor fusion: lidar builds a precise 3D map, radar sees through rain and darkness, and cameras read color, signs and signals. Redundancy is the point: each sensor covers the others’ blind spots.',
        'Tesla takes the contrarian path: cameras only, processed by neural networks trained on billions of kilometers of fleet driving data. The bet is that vision plus enough data beats expensive sensors — and it keeps hardware costs low enough to make every Tesla a potential robotaxi. The industry has not settled this argument, and the answer will shape who wins the decade.',
      ],
    },
    {
      h2: 'The brutal economics — and the prize',
      paragraphs: [
        'A human driver is roughly 60–70% of a taxi fare. Remove the driver and the cost per kilometer collapses — eventually, analysts project, below the cost of owning a personal car. That is the trillion-dollar prize: not replacing taxis, but replacing car ownership for a slice of urban households. It is also why robotaxis are nearly all electric: EVs have lower running costs and are far easier for software to control precisely, a convergence we explore in <a href="/articles/future-of-electric-mobility/">The Future of Electric Mobility</a>.',
        'The hard part is utilization. A robotaxi must run nearly constantly to repay its sensor suite and remote-supervision infrastructure. That is why services launch city by city, dense core first — and why profitability per city, not technology, is now the metric insiders watch.',
      ],
    },
    {
      h2: 'What still stands in the way',
      paragraphs: [
        'Three things. Regulation: every jurisdiction approves autonomous operation separately, creating a slow patchwork of permissions. Edge cases: construction zones, hand signals from traffic officers, emergency vehicles — the last 0.1% of driving situations consumes most of the engineering effort. And trust: every incident involving an autonomous vehicle receives intense scrutiny, fairly or not, even as the leading operators publish data showing fewer injury crashes per kilometer than human drivers in their service areas.',
        'The realistic outlook: steady expansion through the late 2020s — more cities, airports, highways — rather than an overnight revolution. Personal cars with true unsupervised autonomy remain the harder, later problem.',
      ],
    },
  ],
  faq: [
    {
      q: 'Are robotaxis available to the public today?',
      a: 'Yes. Waymo operates fully driverless public services in multiple US cities, Baidu Apollo Go in several Chinese cities, and Tesla runs its robotaxi service in a growing list of locations. Availability depends on your city.',
    },
    {
      q: 'Are robotaxis safer than human drivers?',
      a: 'Leading operators publish data showing fewer injury-causing crashes per million kilometers than human benchmarks in the same areas. The data is promising but still limited to specific cities and conditions.',
    },
    {
      q: 'Why are all robotaxis electric?',
      a: 'Lower running costs per kilometer, simpler mechanical maintenance, precise software control and quiet city operation make EVs the natural platform for autonomous fleets.',
    },
    {
      q: 'Will robotaxis replace car ownership?',
      a: 'In dense cities, partially — for some households the per-ride cost will undercut ownership. In suburban and rural areas, personal vehicles are expected to dominate for decades.',
    },
  ],
  related: ['future-of-electric-mobility', 'tesla-vs-byd-who-is-winning-the-ev-race', 'top-evs-coming-soon'],
  youtubeIdea:
    'I Took 5 Robotaxi Rides in One Day — POV ride-along comparing Waymo, Tesla and Zoox: comfort, hesitations, weird moments and cost per ride.',
  shortsIdea:
    '"There is no driver in this car. Watch what it does here." — 25-second POV clip of a robotaxi handling a complex intersection.',
};

export default article;
