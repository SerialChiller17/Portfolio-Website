import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import {
  channels,
  connectLinks,
  descentBands,
  navItems,
  siteCopy,
  siteMeta
} from "./data";
import loopFeed from "./generated/the-loop.json";
import { getStocksByMarket, marketRiderStocks } from "./marketRiderData";

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

function mockReducedMotion() {
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  }));
}

function hasOwnValue(object: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function mockDescentLayout(sectionTops: Record<string, number>) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 800
  });

  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    function getMockRect(this: Element) {
      const element = this as HTMLElement;
      const absoluteTop = sectionTops[element.id] ?? 100000;
      const top = absoluteTop - window.scrollY;
      const height = element.id === "top" ? 800 : 1000;

      return {
        x: 0,
        y: top,
        top,
        bottom: top + height,
        left: 0,
        right: 1000,
        width: 1000,
        height,
        toJSON: () => ({})
      };
    }
  );
}

function setMockScroll(scrollY: number) {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: scrollY
  });

  act(() => {
    fireEvent.scroll(window);
  });
}

function expectAltimeterReadout(element: Element, readout: string) {
  expect(element.querySelector(".altimeter-readout-text")).toHaveTextContent(readout);
}

describe("Jay Gupta personal site v3", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("keeps metadata, hero video, and the no-fake-link rule intact", () => {
    renderAt("/");

    expect(document.title).toBe(siteMeta.title);
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
    ).toBe(siteMeta.description);

    const video = screen.getByLabelText("Hero background video") as HTMLVideoElement;
    expect(video).toHaveAttribute("poster", "/hero_poster.jpg");
    expect(video.autoplay).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
    expect(video.playsInline).toBe(true);
    expect(Array.from(video.querySelectorAll("source")).map((source) => source.src)).toEqual([
      "http://localhost:3000/hero.webm",
      "http://localhost:3000/hero.mp4"
    ]);

    expect(document.querySelector(".hero-orbit")).not.toBeInTheDocument();
    expect(screen.getByText("* reverse engineer")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Jay Gupta" })).getByRole(
        "link",
        { name: /Email me/ }
      )
    ).toHaveAttribute("href", "#connect");

    document.querySelectorAll("a[href]").forEach((link) => {
      expect(link.getAttribute("href")).not.toBe("#");
      expect(link.getAttribute("href")).not.toBe("");
    });
  });

  it("introduces the hero as a quiet FL390 descent instrument", () => {
    renderAt("/");

    expect(siteCopy.hero).toMatchObject({
      altitudeFeet: "39,000",
      flightLevel: "FL390",
      altitudeMode: "CRUISE"
    });

    const hud = document.querySelector(".altimeter");
    expect(hud).toBeInTheDocument();
    expect(hud).toHaveAttribute("data-mode", "CRUISE");
    expectAltimeterReadout(hud as HTMLElement, "39,000 FT");
    expect(within(hud as HTMLElement).getByText("FL390")).toBeInTheDocument();

    expect(document.querySelector(".altimeter-chapter")).not.toBeInTheDocument();
    expect(document.querySelector(".altimeter-tape-svg")).toBeInTheDocument();
    expect(document.querySelectorAll(".altimeter-major-tick")).toHaveLength(7);
    expect(document.querySelectorAll(".altimeter-minor-tick")).toHaveLength(18);
    expect(
      document.querySelectorAll('.altimeter-stop-hit[aria-hidden="true"]')
    ).toHaveLength(descentBands.filter((band) => band.inPlan).length);
    expect(document.querySelector(".hero-altitude")).not.toBeInTheDocument();
    expect(document.querySelector(".hero-descent-hud")).not.toBeInTheDocument();
    expect(document.querySelector(".altimeter")).not.toHaveClass("altimeter-parked");
  });

  it("keeps the descent instrument persistent and navigable after the hero", () => {
    renderAt("/");

    const descent = screen.getByRole("navigation", { name: "Descent" });
    const stops = descentBands.filter((band) => band.inPlan);

    expect(descent).not.toHaveAttribute("aria-hidden");
    expect(descent).not.toHaveClass("altimeter-parked");
    expect(descent).toHaveAttribute("data-mode", "CRUISE");
    expect(within(descent).getAllByRole("link")).toHaveLength(stops.length);
    expect(
      within(descent).getByRole("link", { name: /Broadcast\s+FL280/i })
    ).toHaveAttribute("href", "#work");
    expect(
      within(descent).getByRole("link", { name: /Ground\s+GND/i })
    ).toHaveAttribute("href", "#connect");
    expect(
      descent.querySelectorAll('.altimeter-stop-hit[aria-hidden="true"]')
    ).toHaveLength(stops.length);
  });

  it("derives readout, active stop, marker, and mode from one altitude state", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    mockDescentLayout({
      top: 0,
      "flight-plan": 1000,
      work: 2400,
      operations: 3900,
      now: 5400,
      systems: 6900,
      journeys: 8400,
      approach: 9900,
      connect: 11400
    });

    renderAt("/");
    setMockScroll(2800);

    const descent = screen.getByRole("navigation", { name: "Descent" });

    expect(within(descent).getByText("26,000")).toBeInTheDocument();
    expectAltimeterReadout(descent, "26,000 FT");
    expect(within(descent).getByText("FL260")).toBeInTheDocument();
    expect(within(descent).getByText("DESCENT")).toBeInTheDocument();
    expect(descent).toHaveAttribute("data-mode", "DESCENT");
    expect(descent).toHaveAttribute("data-altitude", "26000");
    expect(descent).toHaveAttribute("data-active-stop", "work");
    expect(
      within(descent).getByRole("link", { name: /Broadcast\s+FL280/i })
    ).toHaveAttribute("aria-current", "location");
    expect(descent).toHaveAttribute("data-tape-progress", "0.0476");

    setMockScroll(3882);

    expectAltimeterReadout(descent, "21,000 FT");
    expect(within(descent).getByText("FL210")).toBeInTheDocument();
    expect(descent).toHaveAttribute("data-mode", "DESCENT");
    expect(descent).toHaveAttribute("data-altitude", "21000");
    expect(descent).toHaveAttribute("data-active-stop", "operations");
    expect(
      within(descent).getByRole("link", { name: /Operations\s+FL210/i })
    ).toHaveAttribute("aria-current", "location");
    expect(descent).toHaveAttribute("data-tape-progress", "0.1667");

    setMockScroll(9882);

    expectAltimeterReadout(descent, "1,000 FT");
    expect(within(descent).getByText("FL010")).toBeInTheDocument();
    expect(within(descent).getByText("APPROACH")).toBeInTheDocument();
    expect(descent).toHaveAttribute("data-mode", "APPROACH");
    expect(descent).toHaveAttribute("data-active-stop", "approach");
    expect(descent).toHaveAttribute("data-tape-progress", "0.8333");

    setMockScroll(11000);

    expectAltimeterReadout(descent, "300 FT");
    expect(within(descent).getByText("GND")).toBeInTheDocument();
    expect(within(descent).getByText("LANDED")).toBeInTheDocument();
    expect(descent).toHaveAttribute("data-mode", "LANDED");
    expect(descent).toHaveAttribute("data-active-stop", "connect");
    expect(
      within(descent).getByRole("link", { name: /Ground\s+GND/i })
    ).toHaveAttribute("aria-current", "location");

    setMockScroll(11400);

    expectAltimeterReadout(descent, "0 FT");
    expect(within(descent).getByText("LANDED")).toBeInTheDocument();
    expect(descent).toHaveAttribute("data-mode", "LANDED");
    expect(descent).toHaveAttribute("data-altitude", "0");
    expect(descent).toHaveAttribute("data-tape-progress", "1.0000");
  });

  it("renders home as the full descent without inline about or projects", () => {
    renderAt("/");

    expect(
      screen.getByRole("heading", { level: 1, name: "Jay Gupta" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /^About$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Flight plan" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Systems" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Operations" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Journeys" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Projects" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "The Loop" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Approach" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();

    expect(
      Array.from(
        document.querySelectorAll(
          "main #work, main #operations, main #now, main #systems, main #journeys, main #approach, main #connect"
        )
      ).map((section) => section.id)
    ).toEqual([
      "work",
      "operations",
      "now",
      "systems",
      "journeys",
      "approach",
      "connect"
    ]);
  });

  it("descends through the new chapters with real content", () => {
    renderAt("/");

    const plan = screen.getByRole("navigation", { name: "Descent chapters" });
    const planLinks = within(plan).getAllByRole("link");

    expect(
      planLinks.map((link) => ({
        href: link.getAttribute("href"),
        label: link.textContent
      }))
    ).toEqual([
      expect.objectContaining({ href: "#work", label: expect.stringMatching(/Broadcast.*FL280/s) }),
      expect.objectContaining({ href: "#operations", label: expect.stringMatching(/Operations.*FL210/s) }),
      expect.objectContaining({ href: "#now", label: expect.stringMatching(/Inputs.*FL140/s) }),
      expect.objectContaining({ href: "#systems", label: expect.stringMatching(/Systems.*FL070/s) }),
      expect.objectContaining({ href: "#journeys", label: expect.stringMatching(/The Long Game.*FL030/s) }),
      expect.objectContaining({ href: "#approach", label: expect.stringMatching(/Approach.*FL010/s) }),
      expect.objectContaining({ href: "#connect", label: expect.stringMatching(/Ground.*GND/s) })
    ]);

    const systems = screen.getByRole("region", { name: "Systems" });
    expect(
      within(systems).getByText("YouTube Intelligence System")
    ).toBeInTheDocument();
    expect(
      within(systems).getByText("Stock Research Pipeline")
    ).toBeInTheDocument();
    expect(within(systems).getByRole("link", { name: /Step inside/i })).toHaveAttribute(
      "href",
      "/projects/life-in-weeks"
    );

    const operations = screen.getByRole("region", { name: "Operations" });
    expect(
      within(operations).getByRole("heading", { name: /Founder's Office — SalarySe/ })
    ).toBeInTheDocument();
    expect(
      within(operations).getByRole("heading", {
        name: /AI Advisor — an equity research firm/
      })
    ).toBeInTheDocument();
    expect(
      within(operations).getByRole("heading", {
        name: /Design & Marketing — a real-estate developer/
      })
    ).toBeInTheDocument();

    const journeys = screen.getByRole("region", { name: "Journeys" });
    expect(within(journeys).getByText("4×")).toBeInTheDocument();
    expect(within(journeys).getAllByText(/MAINS ✓/)).toHaveLength(4);
    expect(within(journeys).getByText(/Obsidian vault/)).toBeInTheDocument();
    expect(within(journeys).getByText("CAT 2025")).toBeInTheDocument();
    expect(within(journeys).getByText("XAT 2026")).toBeInTheDocument();

    const approach = screen.getByRole("region", { name: "Approach" });
    expect(within(approach).getByText("Business school.")).toBeInTheDocument();
    expect(within(approach).getByText(/Sketches, not promises/)).toBeInTheDocument();
  });

  it("uses React Router navigation with About and Projects as their own pages", () => {
    const home = renderAt("/");

    expect(navItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "About", href: "/about" }),
        expect.objectContaining({
          label: "Lab",
          href: "/projects",
          menu: expect.arrayContaining([
            expect.objectContaining({ label: "Life in Weeks" }),
            expect.objectContaining({ label: "Market Rider" })
          ])
        }),
        expect.objectContaining({ label: "Connect", href: "/#connect" })
      ])
    );
    expect(navItems.map((item) => item.label)).not.toEqual(
      expect.arrayContaining(["Work", "Systems", "Journeys"])
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about"
    );
    expect(screen.queryByRole("link", { name: "Work" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Systems" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Journeys" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lab" })).toHaveAttribute(
      "href",
      "/projects"
    );
    expect(
      screen.getByRole("menuitem", { name: "Life in Weeks" })
    ).toHaveAttribute("href", "/projects/life-in-weeks");
    expect(
      screen.getByRole("menuitem", { name: "Market Rider" })
    ).toHaveAttribute("href", "/projects/market-rider");

    home.unmount();
    const about = renderAt("/about");

    expect(screen.getByRole("main", { name: "About Jay Gupta" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /I trust the person who can take a system apart/i
      })
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 1, name: "Jay Gupta" })).not.toBeInTheDocument();
    expect(screen.getByText(/UPSC taught me pattern recognition/i)).toBeInTheDocument();
    expect(screen.getByText(/6\.3M\+ organic views/i)).toBeInTheDocument();
    expect(screen.getByText(/4x UPSC Mains/i)).toBeInTheDocument();
    expect(screen.getByText(/80\+ videos/i)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "The long way around" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Four consecutive UPSC Mains/i)).toBeInTheDocument();
    expect(screen.getByText(/reverse-engineered and rebuilt with AI/i)).toBeInTheDocument();

    about.unmount();
    const projectsPage = renderAt("/projects");

    expect(screen.getByRole("main", { name: "Jay Gupta projects" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Side Projects."
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/A small index of experiments, tools, and odd ideas/i)
    ).toBeInTheDocument();
    const labDirectory = screen.getByRole("navigation", { name: "Lab directory" });
    expect(
      within(labDirectory).getByRole("link", { name: /Life in Weeks/i })
    ).toHaveAttribute("href", "/projects/life-in-weeks");
    expect(
      within(labDirectory).getByRole("link", { name: /Market Rider/i })
    ).toHaveAttribute("href", "/projects/market-rider");
    expect(screen.queryByRole("link", { name: /Open Life in Weeks/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Open Market Rider/i })).not.toBeInTheDocument();
    expect(document.querySelectorAll(".project-card")).toHaveLength(0);
    expect(screen.queryByLabelText("Your age in years")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Market Rider game canvas")).not.toBeInTheDocument();

    projectsPage.unmount();
  });

  it("renders each Lab project on its own page", () => {
    const life = renderAt("/projects/life-in-weeks");

    expect(screen.getByRole("main", { name: "Life in Weeks project" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: /Your life,\s*in weeks\./i
      })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Your age in years")).toHaveValue("25");
    expect(screen.getByLabelText("Expected life in years")).toHaveValue("80");
    expect(screen.getByLabelText("Type your age in years")).toHaveValue(25);
    expect(screen.getByLabelText("Type expected life in years")).toHaveValue(80);
    expect(screen.getByText("2,860 weeks remaining")).toBeInTheDocument();
    expect(
      screen.getByText("Each square is one week. Colors show where the time goes.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/daily claims/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Daily screen hours")).toHaveValue("3");
    expect(screen.getAllByText(/unclaimed time/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/still clean/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/238/).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByLabelText("Market Rider game canvas")).not.toBeInTheDocument();

    life.unmount();
    renderAt("/projects/market-rider");

    expect(screen.getByRole("main", { name: "Market Rider project" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation", { name: "Primary navigation" }))
        .getByRole("link", { name: "Lab" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("heading", { level: 2, name: "Market Rider" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "India market" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "USA market" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Restart run/i })).toBeInTheDocument();
    expect(
      screen.getByLabelText("Market Rider game canvas")
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Your age in years")).not.toBeInTheDocument();
    expect(screen.queryByText("Your next rabbit hole")).not.toBeInTheDocument();
    expect(screen.queryByText("YouTube Intelligence System")).not.toBeInTheDocument();
    expect(screen.queryByText("Automated Stock Research Pipeline")).not.toBeInTheDocument();
  });

  it("ships a static stock universe for Market Rider", () => {
    const indiaStocks = getStocksByMarket("india");
    const usaStocks = getStocksByMarket("usa");

    expect(marketRiderStocks).toHaveLength(20);
    expect(indiaStocks).toHaveLength(10);
    expect(usaStocks).toHaveLength(10);
    expect(indiaStocks.map((stock) => stock.ticker)).toContain("RELIANCE");
    expect(usaStocks.map((stock) => stock.ticker)).toContain("AAPL");

    marketRiderStocks.forEach((stock) => {
      expect(stock.points.length).toBeGreaterThanOrEqual(24);
      expect(["steady", "volatile", "breakout", "crashy"]).toContain(stock.mood);
      stock.points.forEach((point) => {
        expect(point).toBeGreaterThanOrEqual(0);
        expect(point).toBeLessThanOrEqual(100);
      });
    });
  });

  it("models exactly two public channels with minimal copy and resolved IDs", () => {
    const rawChannels = channels as Array<Record<string, unknown>>;

    expect(rawChannels).toHaveLength(2);
    expect(rawChannels[0]).toMatchObject({
      name: "noRupaiyaa",
      genre: "Finance",
      type: "landscape",
      url: "https://www.youtube.com/@noRupaiyaa",
      channelId: "UCobaq6e-B5QlGcwR8wU4DBA",
      accent: expect.any(String)
    });
    expect(rawChannels[1]).toMatchObject({
      name: "noMaaya",
      genre: "Philosophy",
      type: "shorts",
      url: "https://www.youtube.com/@noMaaya",
      channelId: "UCJyzUk_Yr57x9jdoD2VbjRQ",
      accent: expect.any(String)
    });
    expect(rawChannels.some((channel) => hasOwnValue(channel, "description"))).toBe(false);
    expect(rawChannels.some((channel) => hasOwnValue(channel, "stat"))).toBe(false);
    expect(rawChannels.every((channel) => channel.accent)).toBe(true);
  });

  it("renders Work as a two-channel video section without descriptions or stats", () => {
    renderAt("/");

    const work = screen.getByRole("region", { name: "Work" });
    const heading = within(work).getByRole("heading", {
      level: 2,
      name: "What I Broadcast to the world..."
    });
    expect(
      heading
        .querySelector(".font-serif.italic")
        ?.textContent?.replace(/\s+/g, " ")
        .trim()
    ).toBe("Broadcast");
    expect(within(work).getByText(/01\s+\u00b7\s+Finance/)).toBeInTheDocument();
    expect(within(work).getByText("noRupaiyaa")).toBeInTheDocument();
    expect(
      within(work).getByRole("link", { name: /02\s+\u00b7\s+Philosophy\s+\u00b7\s+noMaaya/ })
    ).toHaveAttribute("href", "https://www.youtube.com/@noMaaya");
    expect(within(work).queryByText("Systems Lab")).not.toBeInTheDocument();
    expect(within(work).queryByText("Reading Desk")).not.toBeInTheDocument();
    expect(within(work).queryByText(/latest video/i)).not.toBeInTheDocument();
    expect(within(work).queryByText(/views without paid distribution/i)).not.toBeInTheDocument();
    expect(within(work).queryByText(/AI workflows/i)).not.toBeInTheDocument();

    const trailer = within(work).getByLabelText(
      "noRupaiyaa trailer preview"
    ) as HTMLVideoElement;
    expect(trailer).toHaveAttribute("poster", "/media/norupaiyaa-poster.jpg");
    expect(trailer).toHaveAttribute("preload", "metadata");
    expect(trailer.autoplay).toBe(true);
    expect(trailer.loop).toBe(true);
    expect(trailer.muted).toBe(true);
    expect(trailer.playsInline).toBe(true);

    expect(
      within(work).getByRole("link", {
        name: "Open noRupaiyaa trailer with sound"
      })
    ).toHaveAttribute("href", "/media/norupaiyaa-finance.mp4");
    expect(within(work).getByRole("link", { name: "Watch noRupaiyaa" })).toHaveAttribute(
      "href",
      "https://www.youtube.com/@noRupaiyaa"
    );
    expect(within(work).getByRole("link", { name: "Watch noMaaya" })).toHaveAttribute(
      "href",
      "https://www.youtube.com/@noMaaya"
    );

    const shorts = within(work).getAllByLabelText(/noMaaya Short preview:/i);
    expect(shorts).toHaveLength(4);
    shorts.forEach((short) => {
      const video = short as HTMLVideoElement;
      expect(video).toHaveAttribute("poster");
      expect(video).toHaveAttribute("preload", "metadata");
      expect(video.loop).toBe(true);
      expect(video.muted).toBe(true);
      expect(video.playsInline).toBe(true);
    });

    within(work)
      .getAllByRole("link", { name: /Open noMaaya Short:/i })
      .forEach((link) => {
        expect(link).toHaveAttribute("href");
        expect(link.getAttribute("href")).toMatch(/^https:\/\/www\.youtube\.com\/shorts\//);
      });
  });

  it("toggles the inline noRupaiyaa trailer audio without leaving the feature", () => {
    renderAt("/");

    const work = screen.getByRole("region", { name: "Work" });
    const trailer = within(work).getByLabelText(
      "noRupaiyaa trailer preview"
    ) as HTMLVideoElement;
    const toggle = within(work).getByRole("button", {
      name: "Unmute noRupaiyaa trailer"
    });

    expect(trailer.muted).toBe(true);
    fireEvent.click(toggle);
    expect(trailer.muted).toBe(false);
    expect(
      within(work).getByRole("button", { name: "Mute noRupaiyaa trailer" })
    ).toBeInTheDocument();
  });

  it("replaces the old Spotify and Substack panels with The Loop", () => {
    renderAt("/");

    const loop = screen.getByRole("region", { name: "The Loop" });
    expect(within(loop).queryByText(/^\/\/ the loop/i)).not.toBeInTheDocument();
    expect(
      within(loop).getByRole("heading", {
        level: 2,
        name: /You can tell a lot about a man/i
      })
    ).toBeInTheDocument();

    const filmLinks = within(loop).getAllByRole("link", {
      name: /Open YouTube video:/i
    });
    expect(filmLinks).toHaveLength(loopFeed.videos.length * 2);
    expect(filmLinks[0]).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=h6fcK_fRYaI"
    );
    expect(
      within(loop).getAllByRole("img", { name: /YouTube thumbnail:/i })[0]
    ).toHaveAttribute(
      "src",
      "https://i.ytimg.com/vi/h6fcK_fRYaI/hqdefault.jpg"
    );

    expect(
      within(loop).getByRole("link", { name: /open in spotify/i })
    ).toHaveAttribute("href", siteCopy.spotify.playlistUrl);
    expect(within(loop).getByText("~J~")).toBeInTheDocument();
    expect(within(loop).getByText(/side a/i)).toBeInTheDocument();
    expect(
      within(loop).getByRole("heading", { level: 3, name: "Books, on rotation." })
    ).toBeInTheDocument();
    expect(
      within(loop).getByRole("img", { name: /Book cover: Why Bharat Matters/i })
    ).toHaveAttribute("src", "/media/books/why-bharat-matters.png");
    expect(
      within(loop).getByRole("button", { name: "Previous book" })
    ).toBeInTheDocument();
    fireEvent.click(within(loop).getByRole("button", { name: "Next book" }));
    expect(
      within(loop).getByText("Sapiens: A Brief History of Humankind")
    ).toBeInTheDocument();
    expect(within(loop).getByText("Yuval Noah Harari")).toBeInTheDocument();
    fireEvent.click(within(loop).getByRole("button", { name: "Show Meditations" }));
    expect(
      within(loop).getByRole("img", { name: /Book cover: Meditations/i })
    ).toHaveAttribute("src", "/media/books/meditations.png");
    expect(
      within(loop).getByText("Meditations")
    ).toBeInTheDocument();
    expect(within(loop).getByText("Marcus Aurelius")).toBeInTheDocument();
    expect(within(loop).queryByText(/read on substack/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle("Jay Gupta Spotify playlist")).not.toBeInTheDocument();
    expect(screen.queryByText(/Substack URL needed/i)).not.toBeInTheDocument();
  });

  it("turns Connect into a dispatch card while keeping the social exits", () => {
    renderAt("/");

    const connect = screen.getByRole("contentinfo", {
      name: "Find me elsewhere."
    });
    const dispatchHead = connect.querySelector(".connect-letter-head");

    expect(dispatchHead?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      "Dispatch · to Jay"
    );
    expect(within(connect).getByLabelText("From")).toHaveAttribute(
      "placeholder",
      "your name"
    );
    expect(within(connect).getByLabelText("Reply to")).toHaveAttribute(
      "type",
      "email"
    );
    expect(connect.querySelector(".connect-typewriter")).toBeInTheDocument();
    expect(connect.querySelector(".connect-typewriter-cursor")).toBeInTheDocument();
    expect(
      within(connect).getByRole("button", { name: /Fold & send/i })
    ).toBeInTheDocument();
    const revealButton = within(connect).getByRole("button", {
      name: /Reveal address/i
    });
    expect(revealButton).toBeInTheDocument();
    expect(within(connect).queryByText(siteCopy.email)).not.toBeInTheDocument();
    fireEvent.click(revealButton);
    expect(within(connect).getByText(siteCopy.email)).toBeInTheDocument();
    expect(within(connect).getByRole("link", { name: "YouTube" })).toHaveAttribute(
      "href",
      "https://www.youtube.com/@noRupaiyaa"
    );
    expect(within(connect).getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/jaygupta2000"
    );
  });

  it("types and backspaces playful message prompts until the visitor starts typing", () => {
    vi.useFakeTimers();
    renderAt("/");

    const connect = screen.getByRole("contentinfo", {
      name: "Find me elsewhere."
    });
    const messageField = within(connect).getByLabelText(
      "Message"
    ) as HTMLTextAreaElement;
    const typewriter = connect.querySelector(".connect-typewriter-text");

    expect(typewriter).toHaveTextContent("");

    act(() => {
      vi.advanceTimersByTime(45);
    });

    expect(typewriter).toHaveTextContent(siteCopy.messagePrompts[0].slice(0, 1));

    for (let index = 1; index < siteCopy.messagePrompts[0].length; index += 1) {
      act(() => {
        vi.advanceTimersByTime(45);
      });
    }

    expect(typewriter).toHaveTextContent(siteCopy.messagePrompts[0]);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    act(() => {
      vi.advanceTimersByTime(24);
    });

    expect(typewriter?.textContent?.length).toBeLessThan(
      siteCopy.messagePrompts[0].length
    );

    for (let index = 1; index < siteCopy.messagePrompts[0].length; index += 1) {
      act(() => {
        vi.advanceTimersByTime(24);
      });
    }

    act(() => {
      vi.advanceTimersByTime(360);
    });

    act(() => {
      vi.advanceTimersByTime(45);
    });

    expect(typewriter).toHaveTextContent(siteCopy.messagePrompts[1].slice(0, 1));

    fireEvent.change(messageField, {
      target: { value: "This is a real note." }
    });

    act(() => {
      vi.advanceTimersByTime(8400);
    });

    expect(messageField).toHaveValue("This is a real note.");
    expect(connect.querySelector(".connect-typewriter")).not.toBeInTheDocument();
  });

  it("does not publish unavailable destinations in nav or footer", () => {
    renderAt("/");

    expect(navItems.some((item) => item.label === "Writing" && item.href)).toBe(false);
    expect(connectLinks.some((link) => link.label === "Substack" && link.href)).toBe(false);
    expect(screen.queryByRole("link", { name: "Writing" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Substack" })).not.toBeInTheDocument();
  });

  it("does not autoplay videos when reduced motion is preferred", () => {
    mockReducedMotion();

    renderAt("/");

    const hero = screen.getByLabelText("Hero background video") as HTMLVideoElement;
    expect(hero.autoplay).toBe(false);
    expect(hero).not.toHaveAttribute("autoplay");
    expect(hero).toHaveAttribute("poster", "/hero_poster.jpg");

    const work = screen.getByRole("region", { name: "Work" });
    const trailer = within(work).getByLabelText(
      "noRupaiyaa trailer preview"
    ) as HTMLVideoElement;
    expect(trailer.autoplay).toBe(false);
    expect(trailer).not.toHaveAttribute("autoplay");

    within(work)
      .getAllByLabelText(/noMaaya Short preview:/i)
      .forEach((short) => {
        expect((short as HTMLVideoElement).autoplay).toBe(false);
        expect(short).not.toHaveAttribute("autoplay");
      });
  });
});
