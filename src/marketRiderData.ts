export type MarketRiderMarket = "india" | "usa";

export type MarketMood = "steady" | "volatile" | "breakout" | "crashy";

export type MarketRiderStock = {
  ticker: string;
  name: string;
  market: MarketRiderMarket;
  mood: MarketMood;
  accent: string;
  description: string;
  points: number[];
};

export const moodCopy: Record<
  MarketMood,
  { label: string; multiplier: number; handling: string }
> = {
  steady: {
    label: "Steady climb",
    multiplier: 1,
    handling: "gentle slopes, clean landing window"
  },
  volatile: {
    label: "Volatility run",
    multiplier: 1.25,
    handling: "bigger ramps, better air-time bonus"
  },
  breakout: {
    label: "Breakout sprint",
    multiplier: 1.4,
    handling: "fast rises, boost chains pay more"
  },
  crashy: {
    label: "Crash test",
    multiplier: 1.55,
    handling: "sharp drops, high-risk recovery"
  }
};

function series(...points: number[]) {
  return points;
}

export const marketRiderStocks: MarketRiderStock[] = [
  {
    ticker: "RELIANCE",
    name: "Reliance Industries",
    market: "india",
    mood: "volatile",
    accent: "#66E3C4",
    description: "Energy, telecom, retail. Big rolling terrain with sudden lifts.",
    points: series(
      44, 46, 45, 48, 52, 51, 54, 56, 55, 59, 62, 60, 58, 63, 67, 65, 69, 72,
      70, 73, 77, 75, 79, 83, 81, 85, 88, 86, 90, 92
    )
  },
  {
    ticker: "HDFCBANK",
    name: "HDFC Bank",
    market: "india",
    mood: "steady",
    accent: "#93B7FF",
    description: "A smoother banking climb for learning the controls.",
    points: series(
      38, 39, 40, 41, 43, 42, 44, 45, 47, 48, 49, 51, 50, 52, 54, 55, 56, 57,
      59, 58, 60, 62, 63, 65, 66, 68, 69, 71, 72, 74
    )
  },
  {
    ticker: "BHARTIARTL",
    name: "Bharti Airtel",
    market: "india",
    mood: "breakout",
    accent: "#FF6B6B",
    description: "A telecom breakout with long ramps and quick speed pockets.",
    points: series(
      30, 31, 33, 34, 36, 37, 39, 42, 44, 47, 49, 52, 55, 57, 61, 64, 66, 70,
      73, 75, 78, 81, 83, 86, 88, 90, 91, 93, 95, 96
    )
  },
  {
    ticker: "ICICIBANK",
    name: "ICICI Bank",
    market: "india",
    mood: "steady",
    accent: "#F7B955",
    description: "Balanced banking terrain with forgiving landings.",
    points: series(
      35, 37, 38, 40, 41, 43, 42, 45, 47, 48, 50, 52, 51, 54, 56, 58, 57, 59,
      61, 63, 65, 64, 67, 69, 70, 72, 74, 73, 76, 78
    )
  },
  {
    ticker: "SBIN",
    name: "State Bank of India",
    market: "india",
    mood: "volatile",
    accent: "#7DD3FC",
    description: "Public-sector bank energy: broad waves, surprise bumps.",
    points: series(
      32, 35, 34, 37, 41, 39, 43, 45, 44, 48, 51, 49, 53, 57, 55, 58, 62, 60,
      64, 66, 63, 68, 71, 69, 72, 76, 74, 78, 80, 79
    )
  },
  {
    ticker: "TCS",
    name: "Tata Consultancy Services",
    market: "india",
    mood: "steady",
    accent: "#C7D2FE",
    description: "IT services line with measured, predictable rises.",
    points: series(
      50, 49, 51, 52, 53, 54, 53, 55, 56, 57, 58, 60, 59, 61, 62, 63, 64, 65,
      64, 66, 67, 69, 68, 70, 71, 72, 73, 72, 74, 75
    )
  },
  {
    ticker: "BAJFINANCE",
    name: "Bajaj Finance",
    market: "india",
    mood: "crashy",
    accent: "#FB7185",
    description: "Fast finance terrain with steep drawdowns and recovery ramps.",
    points: series(
      58, 62, 66, 64, 69, 73, 70, 76, 81, 78, 72, 65, 59, 55, 61, 68, 74, 71,
      77, 83, 80, 75, 69, 72, 78, 84, 82, 87, 91, 88
    )
  },
  {
    ticker: "LT",
    name: "Larsen & Toubro",
    market: "india",
    mood: "breakout",
    accent: "#A7F3D0",
    description: "Infrastructure lift, long construction ramps, clean boost lanes.",
    points: series(
      28, 30, 31, 33, 36, 38, 41, 43, 46, 48, 51, 53, 56, 59, 62, 64, 67, 69,
      72, 74, 77, 79, 80, 83, 85, 87, 89, 90, 92, 94
    )
  },
  {
    ticker: "HINDUNILVR",
    name: "Hindustan Unilever",
    market: "india",
    mood: "steady",
    accent: "#FDE68A",
    description: "Consumer staple cruise, soft slopes and fewer surprises.",
    points: series(
      42, 43, 44, 43, 45, 46, 47, 46, 48, 49, 50, 51, 50, 52, 53, 54, 55, 54,
      56, 57, 58, 59, 58, 60, 61, 62, 63, 62, 64, 65
    )
  },
  {
    ticker: "INFY",
    name: "Infosys",
    market: "india",
    mood: "volatile",
    accent: "#60A5FA",
    description: "IT terrain with choppy turns and short air pockets.",
    points: series(
      47, 45, 48, 51, 49, 53, 56, 54, 57, 60, 58, 55, 59, 63, 61, 64, 67, 65,
      62, 66, 70, 68, 71, 73, 70, 74, 77, 75, 79, 81
    )
  },
  {
    ticker: "NVDA",
    name: "NVIDIA",
    market: "usa",
    mood: "breakout",
    accent: "#9BE15D",
    description: "AI breakout terrain, almost a launch ramp with wheels.",
    points: series(
      22, 24, 27, 30, 34, 37, 41, 45, 49, 54, 58, 63, 67, 71, 76, 80, 84, 87,
      90, 92, 94, 95, 96, 97, 96, 98, 99, 98, 100, 99
    )
  },
  {
    ticker: "AAPL",
    name: "Apple",
    market: "usa",
    mood: "steady",
    accent: "#E5E7EB",
    description: "A polished hardware glide, steady enough for first runs.",
    points: series(
      45, 46, 48, 47, 49, 51, 52, 53, 55, 54, 56, 58, 57, 59, 61, 62, 63, 65,
      64, 66, 68, 69, 70, 72, 71, 73, 75, 76, 77, 78
    )
  },
  {
    ticker: "GOOG",
    name: "Alphabet",
    market: "usa",
    mood: "volatile",
    accent: "#7DD3FC",
    description: "Search, cloud, AI: smooth sections interrupted by fast kinks.",
    points: series(
      39, 41, 43, 42, 45, 48, 46, 50, 53, 51, 55, 58, 56, 60, 63, 61, 65, 68,
      66, 70, 73, 71, 75, 78, 76, 80, 83, 81, 85, 87
    )
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    market: "usa",
    mood: "steady",
    accent: "#86EFAC",
    description: "Enterprise-grade climb with wide, readable slopes.",
    points: series(
      40, 41, 42, 44, 45, 47, 48, 49, 51, 52, 54, 55, 56, 58, 59, 61, 62, 63,
      65, 66, 67, 69, 70, 72, 73, 74, 76, 77, 78, 80
    )
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    market: "usa",
    mood: "volatile",
    accent: "#FBBF24",
    description: "Retail and cloud waves, made for timing boost chains.",
    points: series(
      34, 36, 39, 37, 41, 44, 42, 46, 50, 48, 52, 55, 53, 57, 61, 58, 62, 66,
      64, 68, 71, 69, 73, 76, 74, 78, 82, 79, 84, 86
    )
  },
  {
    ticker: "AVGO",
    name: "Broadcom",
    market: "usa",
    mood: "breakout",
    accent: "#F87171",
    description: "Semiconductor stair-steps with big launch ledges.",
    points: series(
      26, 28, 31, 35, 38, 42, 45, 49, 52, 56, 59, 63, 66, 70, 73, 76, 79, 82,
      84, 87, 89, 91, 93, 92, 94, 96, 95, 97, 98, 97
    )
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    market: "usa",
    mood: "crashy",
    accent: "#F43F5E",
    description: "High drama: steep ramps, hard drops, and ugly landings.",
    points: series(
      52, 58, 63, 60, 68, 75, 70, 78, 84, 76, 69, 61, 55, 47, 54, 63, 71, 66,
      73, 82, 77, 69, 62, 70, 79, 86, 81, 88, 93, 85
    )
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    market: "usa",
    mood: "breakout",
    accent: "#818CF8",
    description: "A social network rebound shaped like a speed run.",
    points: series(
      24, 25, 27, 29, 33, 36, 39, 43, 46, 50, 54, 57, 61, 64, 68, 72, 75, 78,
      81, 84, 86, 88, 90, 91, 93, 94, 95, 96, 97, 96
    )
  },
  {
    ticker: "BRK-B",
    name: "Berkshire Hathaway",
    market: "usa",
    mood: "steady",
    accent: "#D6D3D1",
    description: "Old-school compounding, calmer slopes, fewer surprises.",
    points: series(
      48, 49, 50, 50, 51, 52, 53, 54, 55, 55, 56, 57, 58, 59, 60, 60, 61, 62,
      63, 64, 65, 65, 66, 67, 68, 69, 70, 70, 71, 72
    )
  },
  {
    ticker: "MU",
    name: "Micron Technology",
    market: "usa",
    mood: "volatile",
    accent: "#38BDF8",
    description: "Memory-cycle chop with air-time friendly waves.",
    points: series(
      31, 34, 38, 36, 41, 45, 43, 48, 52, 49, 54, 58, 55, 51, 57, 63, 60, 66,
      70, 67, 72, 76, 73, 78, 82, 79, 84, 88, 85, 90
    )
  }
];

export function getStocksByMarket(market: MarketRiderMarket) {
  return marketRiderStocks.filter((stock) => stock.market === market);
}
