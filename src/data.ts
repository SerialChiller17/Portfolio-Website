export type IconKey =
  | "youtube"
  | "linkedin"
  | "substack"
  | "mail"
  | "home"
  | "shorts"
  | "arrow"
  | "chart"
  | "brain"
  | "sparkles"
  | "menu"
  | "close"
  | "volume"
  | "muted";

export type LinkItem = {
  label: string;
  href?: string;
  icon: IconKey;
  external?: boolean;
  isPlaceholder?: boolean;
  note?: string;
};

export type NavItem = {
  label: string;
  href?: string;
  isExternal?: boolean;
  isPlaceholder?: boolean;
  menu?: Array<{
    label: string;
    href: string;
  }>;
};

export type ShortItem = {
  id: string;
  title: string;
  url: string;
  posterSrc: string;
  previewSrc: string;
  publishedAt?: string;
};

export type LandscapeChannel = {
  id: "norupaiyaa";
  name: "noRupaiyaa";
  genre: "Finance";
  type: "landscape";
  url: string;
  channelId: string;
  accent: string;
  previewSrc: string;
  posterSrc: string;
  trailerUrl: string;
};

export type ShortsChannel = {
  id: "nomaaya";
  name: "noMaaya";
  genre: "Ideas";
  type: "shorts";
  url: string;
  channelId: string;
  accent: string;
  shorts: ShortItem[];
};

export type Channel = LandscapeChannel | ShortsChannel;

export type Project = {
  slug: string;
  title: string;
  kind?: "life-weeks" | "market-rider";
  description?: string;
  proof?: string;
  tags?: string[];
  href?: string;
  route?: string;
  icon?: Extract<IconKey, "chart" | "brain" | "sparkles">;
  isPlaceholder?: boolean;
};

export type LoopTrack = {
  title: string;
  artist: string;
};

export type LoopBook = {
  title: string;
  author: string;
  coverSrc: string;
  amazonHref?: string;
  note?: string;
};

export type AboutPrinciple = {
  title: string;
  body: string;
};

export type ProofNumber = {
  value: string;
  label: string;
};

export const siteMeta = {
  title: "Jay Gupta | Generalist: Content, Systems & Operations",
  description:
    "Jay Gupta never picked a lane: two YouTube channels past 6.3M views, AI systems that compress hours into minutes, founder's-office work, and four years in UPSC's top 1%. One long descent through all of it.",
  image: "/social-preview.png"
};

export type DescentBand = {
  id: string;
  chapter: string;
  title: string;
  fl: string;
  feet: number;
  blurb?: string;
  inPlan: boolean;
};

// The descent: every band the page passes through, top to ground.
export const descentBands: DescentBand[] = [
  {
    id: "top",
    chapter: "00",
    title: "Cruise",
    fl: "FL390",
    feet: 39000,
    inPlan: false
  },
  {
    id: "flight-plan",
    chapter: "00",
    title: "Flight plan",
    fl: "FL350",
    feet: 35000,
    inPlan: false
  },
  {
    id: "work",
    chapter: "01",
    title: "Broadcast",
    fl: "FL280",
    feet: 28000,
    blurb: "Two channels. 6.3M+ organic views. $0 ad spend.",
    inPlan: true
  },
  {
    id: "operations",
    chapter: "02",
    title: "Operations",
    fl: "FL210",
    feet: 21000,
    blurb: "Founder's office, advisory, design, words.",
    inPlan: true
  },
  {
    id: "now",
    chapter: "03",
    title: "Inputs",
    fl: "FL140",
    feet: 14000,
    blurb: "What I watch, hear, and read.",
    inPlan: true
  },
  {
    id: "systems",
    chapter: "04",
    title: "Systems",
    fl: "FL070",
    feet: 7000,
    blurb: "AI pipelines that turn hours into minutes.",
    inPlan: true
  },
  {
    id: "journeys",
    chapter: "05",
    title: "The Long Game",
    fl: "FL030",
    feet: 3000,
    blurb: "Training, pivots, and the next runways.",
    inPlan: true
  },
  {
    id: "connect",
    chapter: "06",
    title: "Ground",
    fl: "GND",
    feet: 0,
    blurb: "Send word.",
    inPlan: true
  }
];

export const descentTapeStops = descentBands.filter((band) => band.inPlan);

export const siteCopy = {
  showEmail: true,
  email: "jay.gupta904@gmail.com",
  ui: {
    viewAction: "View",
    scrollProgressLabel: "Scroll progress"
  },
  hero: {
    name: "Jay Gupta",
    footnote: "reverse engineer",
    videoMp4: "/hero.mp4",
    videoWebm: "/hero.webm",
    poster: "/hero_poster.jpg",
    orbitCenter: { x: 0.48, y: 0.58 },
    description:
      "Content, AI systems, operations, design. I take things apart and ship something useful on top.",
    cta: "Begin the descent",
    secondaryCta: "Email me",
    altitudeFeet: "39,000",
    altitudeUnit: "FT",
    flightLevel: "FL390",
    altitudeMode: "CRUISE"
  },
  now:
    "You can tell a lot about a man by what he watches, what he listens to, and what he reads. Here is mine.",
  spotify: {
    label: "what's on while I build",
    playlistId: "3HIZ8tx8yTP5PmTL2IA787",
    playlistUrl:
      "https://open.spotify.com/playlist/3HIZ8tx8yTP5PmTL2IA787"
  },
  substack: {
    label: "notes when they are public",
    url: "",
    feedUrl: ""
  },
  aboutPage: {
    opening:
      "I trust the person who can take a system apart, explain the moving pieces, then make something useful from the mess.",
    intro:
      "My path has not been linear. That is the useful part. UPSC taught me pattern recognition under pressure. YouTube taught me packaging, distribution, and how quickly the market ignores unclear thinking. SalarySe gave me a closer look at real operations, not just ideas on a whiteboard. AI tools became the way I stopped repeating work and started building loops.",
    story:
      "For a while, everything looked unrelated. UPSC prep, finance explainers, founder's office work, research automation, MBA applications. Underneath, it was the same habit: find the system, learn its incentives, test the weak points, then build a repeatable way through it. That is still how I work.",
    pullQuotes: [
      "I like people who can show their working.",
      "A good system should leave fingerprints."
    ],
    principles: [
      {
        title: "Proof beats posture.",
        body:
          "I trust shipped work more than polished positioning. A rough loop that survives contact with reality is worth more than a perfect deck."
      },
      {
        title: "Distribution is part of the product.",
        body:
          "The idea is not finished when it is correct. It is finished when someone understands why it matters."
      },
      {
        title: "Taste is compression.",
        body:
          "Good taste is knowing what to remove because you understand what the thing is trying to become."
      },
      {
        title: "Tools should earn their place.",
        body:
          "AI is useful when it removes drag from a real workflow. It is theater when it only makes the demo look expensive."
      }
    ] satisfies AboutPrinciple[],
    numbers: [
      { value: "6.3M+", label: "organic views across two channels, $0 spend" },
      { value: "4x", label: "UPSC Mains, top 1% of 13L+ every attempt" },
      { value: "80+", label: "videos, scripts, and experiments shipped" }
    ] satisfies ProofNumber[],
    timeline: [
      {
        period: "2017–20",
        note: "BA in Gwalior, on a full-fee merit scholarship."
      },
      {
        period: "2021–24",
        note: "Four consecutive UPSC Mains. Top 1% every year, self-prepared."
      },
      {
        period: "2024",
        note: "Launched noRupaiyaa and noMaaya in December. Kept shipping."
      },
      {
        period: "2025",
        note: "Wrote for a UPSC interview-prep desk. Built the stock research pipeline. CAT: 98.3%ile."
      },
      {
        period: "2026",
        note: "Founder's office at SalarySe. AI advisory. Freelance design. XAT: 99%ile. This site."
      }
    ],
    colophon:
      "Colophon: this site began as a template, then got reverse-engineered and rebuilt with AI until it felt closer to how I actually think."
  },
  flightPlan: {
    kicker: "The flight plan",
    heading: "Jack of all trades",
    quote: {
      lead: "Master of none,",
      follow: "but still better than master of one."
    },
    body: []
  },
  channelsHeading: [
    { text: "What I", className: "text-cream" },
    { text: "Broadcast", className: "text-cream font-serif italic font-normal" },
    { text: "to the world...", className: "text-cream" }
  ],
  projectsHeading: [{ text: "Side Projects.", className: "text-cream font-bold" }],
  connectHeading: [
    { text: "Find me", className: "font-normal" },
    { text: "elsewhere.", className: "font-serif italic" }
  ],
  contactLine:
    "For hiring, collaboration, or a useful rabbit hole, email me. The rest of the work branches out from here.",
  messagePrompts: [
    "say what you came to say",
    "Don't be shy. Even spam emails have confidence.",
    "No CAPTCHA. I'm trusting your humanity.",
    "My therapist says I should network more.",
    "Send a message. I'll pretend I wasn't waiting.",
    "Warning: sending a message may lead to a conversation."
  ],
  footerLine: `wheels down · Jay Gupta · ${new Date().getFullYear()}`
};

export const loopCopy = {
  fullListHref: "",
  spotifyTracks: [
    { title: "Beautiful Things", artist: "Benson Boone" },
    { title: "Those Eyes", artist: "New West" },
    { title: "blue", artist: "yung kai" },
    { title: "I Think They Call This Love", artist: "Cover" },
    { title: "I Ain't Worried", artist: "OneRepublic" },
    { title: "There's Nothing Holdin' Me Back", artist: "Shawn Mendes" },
    { title: "Rude", artist: "MAGIC!" },
    { title: "Viva La Vida", artist: "Coldplay" }
  ] satisfies LoopTrack[],
  read: {
    label: "books and articles",
    title: "On the shelf.",
    note: "Reading that shapes my ideas, worldview and psyche.",
    books: [
      {
        title: "Why Bharat Matters",
        author: "S. Jaishankar",
        coverSrc: "/media/books/why-bharat-matters.png"
      },
      {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        coverSrc: "/media/books/sapiens.png"
      },
      {
        title: "The Precipice: Existential Risk and the Future of Humanity",
        author: "Toby Ord",
        coverSrc: "/media/books/the-precipice.png"
      },
      {
        title: "Beyond Good and Evil",
        author: "Friedrich Nietzsche",
        coverSrc: "/media/books/beyond-good-and-evil.png"
      },
      {
        title: "The Republic",
        author: "Plato",
        coverSrc: "/media/books/the-republic.png"
      },
      {
        title: "The India Way: Strategies for an Uncertain World",
        author: "S. Jaishankar",
        coverSrc: "/media/books/the-india-way.png"
      },
      {
        title: "Days at the Morisaki Bookshop",
        author: "Satoshi Yagisawa",
        coverSrc: "/media/books/days-at-the-morisaki-bookshop.png"
      },
      {
        title: "Tuesdays with Morrie: An Old Man, a Young Man, and Life's Greatest Lesson",
        author: "Mitch Albom",
        coverSrc: "/media/books/tuesdays-with-morrie.png"
      },
      {
        title: "Meditations",
        author: "Marcus Aurelius",
        coverSrc: "/media/books/meditations.png"
      }
    ] satisfies LoopBook[]
  }
};

export type SystemItem = {
  id: string;
  name: string;
  year: string;
  tagline: string;
  description: string;
  specs: Array<[string, string]>;
};

export const systemsCopy = {
  heading: "What I build.",
  lede:
    "Repetition is a bug. Each of these started as a chore I refused to do twice.",
  items: [
    {
      id: "yt-intel",
      name: "YouTube Intelligence System",
      year: "2026",
      tagline: "A second brain for a watching habit.",
      description:
        "Classifies what I watch, extracts LLM-written summaries, and files structured notes into Notion. Then sends weekly learning reports with gap-based recommendations on what to study next.",
      specs: [
        ["input", "hours of video"],
        ["output", "linked notes in Notion"],
        ["cadence", "weekly learning reports"]
      ]
    },
    {
      id: "stock-pipeline",
      name: "Stock Research Pipeline",
      year: "2025",
      tagline: "An afternoon of research, in minutes.",
      description:
        "A multi-agent system: one layer writes a dynamic research questionnaire from any topic, another runs the web research and ships a clean PDF. Built for equities; generalises to any research domain that repeats.",
      specs: [
        ["input", "a ticker or a topic"],
        ["output", "a clean research PDF"],
        ["compression", "8–10× faster"]
      ]
    },
    {
      id: "comment-engine",
      name: "Comment Engine",
      year: "2025",
      tagline: "The audience never waits.",
      description:
        "An n8n + LLM loop that drafts replies for roughly 150 comments a day across both channels, holding response time to about two minutes each, in my voice, not a bot's.",
      specs: [
        ["input", "~150 comments / day"],
        ["output", "replies that sound like me"],
        ["time per reply", "~2 minutes"]
      ]
    }
  ] satisfies SystemItem[],
  lab: {
    kicker: "From the lab",
    title: "Life in Weeks",
    description:
      "An interactive map of a life measured in weeks: what's already gone, and what the remaining ones are claimed by.",
    cta: "Step inside",
    href: "/projects/life-in-weeks"
  }
};

export type OperationEntry = {
  id: string;
  period: string;
  role: string;
  org: string;
  kind: string;
  summary: string;
  facts: string[];
  asset?: {
    label: string;
    href: string;
    previewHref: string;
  };
};

export const operationsCopy = {
  heading: "Where I'm deployed.",
  lede:
    "The day job, the side desks, and the freelance seats, all running at once, on purpose.",
  entries: [
    {
      id: "salaryse",
      period: "2026 onward",
      role: "Founder's Office",
      org: "SalarySe",
      kind: "fintech · Gurugram",
      summary:
        "Shipping a 0-to-1 device-leasing launch across product, tech, and ops, and building LLM automations that cut recurring research from hours to minutes.",
      facts: [
        "2,600+ funded startups scraped & scored for GTM",
        "TAM sized bottom-up and top-down, then triangulated",
        "internal product training to operationalise go-live"
      ]
    },
    {
      id: "advisory",
      period: "2026 onward",
      role: "AI Advisor",
      org: "an equity research firm",
      kind: "advisory · India",
      summary:
        "Advising on where AI actually earns a place in equity research, and where it's just expensive theater.",
      facts: ["research workflow design", "adoption without the hype"]
    },
    {
      id: "design-desk",
      period: "2026 onward",
      role: "Design & Marketing",
      org: "a real-estate developer",
      kind: "freelance",
      summary:
        "Brochures, hoardings, and media campaign - end to end.",
      facts: [],
      asset: {
        label: "View brochure",
        href: "https://docs.google.com/presentation/d/19WAWxXNsudcFvZG9kO784_Q1OkI930WfhLMcutDD99Y/edit?usp=sharing",
        previewHref:
          "https://docs.google.com/presentation/d/19WAWxXNsudcFvZG9kO784_Q1OkI930WfhLMcutDD99Y/preview"
      }
    },
    {
      id: "upsc-desk",
      period: "2025",
      role: "Content Writer",
      org: "a UPSC interview-prep programme",
      kind: "remote",
      summary:
        "Model answers and study material for an invite-only interview-prep programme, mentored by serving and retired civil servants.",
      facts: ["35+ candidates served"]
    }
  ] satisfies OperationEntry[]
};

export const longGameCopy = {
  heading: "The long game.",
  lede: "Four years of pressure, one mountain switch, and the next runways it opened.",
  upsc: {
    kicker: "UPSC Civil Services",
    stat: "4×",
    statHighlight: "Top 1% of 13 lakh+",
    statBody: "in a row. Self-prepared.",
    years: ["2021", "2022", "2023", "2024"],
    copy: "The exam never said yes. The training never left.",
    vault:
      "Four years of prep live on as a linked knowledge vault I still build on."
  },
  pivot: {
    kicker: "Then I switched mountains",
    copy: "Different range. Same altitude.",
    exams: [
      { name: "CAT 2025", value: "98.3", suffix: "%ile", detail: "99.7 in VARC" },
      { name: "XAT 2026", value: "99", suffix: "%ile", detail: "99.9 in GK" }
    ]
  }
};

export const approachCopy = {
  heading: "Where it points next.",
  lede: "The same training now has a different job: understand faster, explain cleaner, build in public.",
  themes: {
    kicker: "What stayed from the training",
    items: [
      {
        title: "AI × research",
        body: "Systems that compress how fast a person can understand something."
      },
      {
        title: "Story × distribution",
        body: "Whatever I build next ships with its own audience attached."
      },
      {
        title: "Craft × commerce",
        body: "Design and writing as levers inside real businesses, not decoration."
      }
    ]
  },
  runway: {
    kicker: "Runways open",
    title: "Exploring, on purpose.",
    body:
      "Content, marketing, a founder's office, a startup, or B-school, each a live runway. The plan isn't to pick fast. It's to commit hard once the right one is clear."
  },
  bench: {
    kicker: "Still on the board",
    note: "Sketches, not promises.",
    items: [
      "Opening the UPSC vault: years of linked notes, made public for aspirants.",
      "Turning the research pipeline into a tool other people can run.",
      "A video essay series where finance and philosophy stop pretending to be separate."
    ]
  }
};

export const socialLinks: LinkItem[] = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@noRupaiyaa",
    icon: "youtube",
    note: "Flagship finance channel"
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jaygupta2000",
    icon: "linkedin"
  },
  {
    label: "Email",
    href: "mailto:jay.gupta904@gmail.com",
    icon: "mail",
    external: false
  }
];

export const channels: Channel[] = [
  {
    id: "norupaiyaa",
    name: "noRupaiyaa",
    genre: "Finance",
    type: "landscape",
    url: "https://www.youtube.com/@noRupaiyaa",
    channelId: "UCobaq6e-B5QlGcwR8wU4DBA",
    accent: "rgba(216, 207, 163, 0.34)",
    previewSrc: "/media/norupaiyaa-finance.mp4",
    posterSrc: "/media/norupaiyaa-poster.jpg",
    trailerUrl: "/media/norupaiyaa-finance.mp4"
  },
  {
    id: "nomaaya",
    name: "noMaaya",
    genre: "Ideas",
    type: "shorts",
    url: "https://www.youtube.com/@noMaaya",
    channelId: "UCJyzUk_Yr57x9jdoD2VbjRQ",
    accent: "rgba(137, 172, 156, 0.34)",
    shorts: [
      {
        id: "_3YDGP3IYfE",
        title:
          "Jensen Huang: You Can't Build NVIDIA - Why Ignorance Is a Superpower",
        url: "https://www.youtube.com/shorts/_3YDGP3IYfE",
        posterSrc: "/media/nomaaya-_3YDGP3IYfE.webp",
        previewSrc: "/media/nomaaya-_3YDGP3IYfE-clip.webm",
        publishedAt: "2026-05-26T19:07:39+00:00"
      },
      {
        id: "q8hfP5Zhx4I",
        title: "This IITian Bet on AI Before the World Did",
        url: "https://www.youtube.com/shorts/q8hfP5Zhx4I",
        posterSrc: "/media/nomaaya-q8hfP5Zhx4I.webp",
        previewSrc: "/media/nomaaya-q8hfP5Zhx4I-clip.webm",
        publishedAt: "2025-06-24T00:00:00+00:00"
      },
      {
        id: "Vpvi62765kU",
        title: "Zakir Khan on the Javed Akhtar Quote",
        url: "https://www.youtube.com/shorts/Vpvi62765kU",
        posterSrc: "/media/nomaaya-Vpvi62765kU.webp",
        previewSrc: "/media/nomaaya-Vpvi62765kU-clip.webm",
        publishedAt: "2026-06-12T21:43:24+00:00"
      },
      {
        id: "k0FGDY1RoYU",
        title: "Take That Risk",
        url: "https://www.youtube.com/shorts/k0FGDY1RoYU",
        posterSrc: "/media/nomaaya-k0FGDY1RoYU.webp",
        previewSrc: "/media/nomaaya-k0FGDY1RoYU-clip.webm",
        publishedAt: "2026-06-14T00:00:00+05:30"
      },
      {
        id: "5liOrkm9fNU",
        title: "The Reality of Motivation - Chris Williamson",
        url: "https://www.youtube.com/shorts/5liOrkm9fNU",
        posterSrc: "/media/nomaaya-5liOrkm9fNU.webp",
        previewSrc: "/media/nomaaya-5liOrkm9fNU-clip.webm",
        publishedAt: "2025-06-25T00:00:00+00:00"
      },
      {
        id: "EqHlIS6lN4Q",
        title: "You can't Teach Hunger",
        url: "https://www.youtube.com/shorts/EqHlIS6lN4Q",
        posterSrc: "/media/nomaaya-EqHlIS6lN4Q.webp",
        previewSrc: "/media/nomaaya-EqHlIS6lN4Q-clip.webm",
        publishedAt: "2025-06-28T12:30:13+00:00"
      },
      {
        id: "JkQaf71KJ10",
        title: "The Real Field Marshall - Sam Manekshaw",
        url: "https://www.youtube.com/shorts/JkQaf71KJ10",
        posterSrc: "/media/nomaaya-JkQaf71KJ10.webp",
        previewSrc: "/media/nomaaya-JkQaf71KJ10-clip.webm",
        publishedAt: "2026-04-02T11:20:57+00:00"
      },
      {
        id: "1XbuD-DzbuU",
        title: "Hanuman Jayanti",
        url: "https://www.youtube.com/shorts/1XbuD-DzbuU",
        posterSrc: "/media/nomaaya-1XbuD-DzbuU.webp",
        previewSrc: "/media/nomaaya-1XbuD-DzbuU-clip.webm",
        publishedAt: "2026-02-24T10:45:01+00:00"
      }
    ]
  }
];

export const projects: Project[] = [
  {
    slug: "life-in-weeks",
    title: "Life in Weeks",
    kind: "life-weeks",
    route: "/projects/life-in-weeks",
    description:
      "An interactive map of a life measured in weeks, showing what time has already gone and what the remaining weeks are claimed by.",
    proof:
      "A small experiment for noticing where time goes before it becomes invisible.",
    tags: ["time", "interactive", "reflection"],
    icon: "sparkles"
  },
  {
    slug: "market-rider",
    title: "Market Rider",
    kind: "market-rider",
    route: "/projects/market-rider",
    description:
      "A tiny canvas game where a motorcycle rides the line chart of static stock prices.",
    proof:
      "Pick India or USA, choose a stock, then survive the chart's slope, drops, and breakouts.",
    tags: ["finance", "canvas", "game"],
    icon: "chart"
  }
];

const projectMenuItems = projects.map((project) => ({
  label: project.title,
  href: project.route ?? `/projects/${project.slug}`
}));

export const navItems: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Lab", href: "/projects", menu: projectMenuItems },
  siteCopy.substack.url
    ? { label: "Writing", href: siteCopy.substack.url, isExternal: true }
    : { label: "Writing", isPlaceholder: true },
  { label: "Connect", href: "/#connect" }
];

export const connectLinks: LinkItem[] = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@noRupaiyaa",
    icon: "youtube",
    note: "Flagship finance channel"
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jaygupta2000",
    icon: "linkedin"
  },
  {
    label: "Substack",
    href: siteCopy.substack.url || undefined,
    icon: "substack"
  },
  {
    label: "Email",
    href: "mailto:jay.gupta904@gmail.com",
    icon: "mail",
    external: false
  }
];
