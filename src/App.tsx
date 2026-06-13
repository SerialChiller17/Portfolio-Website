import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import { Altimeter } from "./components/Altimeter";
import { SiteNav } from "./components/SiteNav";
import { siteMeta } from "./data";
import { About } from "./sections/About";
import { Channels } from "./sections/Channels";
import { Connect } from "./sections/Connect";
import { FlightPlan } from "./sections/FlightPlan";
import { Hero } from "./sections/Hero";
import { LongGame } from "./sections/LongGame";
import { Operations } from "./sections/Operations";
import { ProjectDetail, Projects } from "./sections/Projects";
import { Systems } from "./sections/Systems";
import { TheLoop } from "./sections/TheLoop";

const pageTransition = {
  duration: 0.34,
  ease: [0.16, 1, 0.3, 1]
} as const;

function setMetaContent(selector: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");

    const nameMatch = selector.match(/name="([^"]+)"/);
    const propertyMatch = selector.match(/property="([^"]+)"/);

    if (nameMatch) {
      element.name = nameMatch[1];
    }

    if (propertyMatch) {
      element.setAttribute("property", propertyMatch[1]);
    }

    document.head.appendChild(element);
  }

  element.content = content;
}

function HomePage() {
  return (
    <>
      <motion.main
        aria-label="Jay Gupta home"
        className="route-page"
        initial="initial"
        animate="enter"
        exit="exit"
        variants={{
          initial: { opacity: 0, clipPath: "inset(0 0 3% 0)" },
          enter: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
          exit: { opacity: 0, clipPath: "inset(2% 0 0 0)" }
        }}
        transition={pageTransition}
      >
        <Hero />
        <FlightPlan />
        <Channels />
        <Operations />
        <TheLoop />
        <Systems />
        <LongGame />
        <Connect />
      </motion.main>
      <Altimeter />
    </>
  );
}

function AboutPage() {
  return (
    <motion.main
      aria-label="About Jay Gupta"
      className="route-page"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        initial: { opacity: 0, clipPath: "inset(0 0 3% 0)" },
        enter: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
        exit: { opacity: 0, clipPath: "inset(2% 0 0 0)" }
      }}
      transition={pageTransition}
    >
      <About />
    </motion.main>
  );
}

function ProjectsPage() {
  return (
    <motion.main
      aria-label="Jay Gupta projects"
      className="route-page"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        initial: { opacity: 0, clipPath: "inset(0 0 3% 0)" },
        enter: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
        exit: { opacity: 0, clipPath: "inset(2% 0 0 0)" }
      }}
      transition={pageTransition}
    >
      <Projects />
      <Connect />
    </motion.main>
  );
}

function ProjectDetailPage({
  ariaLabel,
  slug
}: {
  ariaLabel: string;
  slug: string;
}) {
  return (
    <motion.main
      aria-label={ariaLabel}
      className="route-page"
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{
        initial: { opacity: 0, clipPath: "inset(0 0 3% 0)" },
        enter: { opacity: 1, clipPath: "inset(0 0 0% 0)" },
        exit: { opacity: 0, clipPath: "inset(2% 0 0 0)" }
      }}
      transition={pageTransition}
    >
      <ProjectDetail slug={slug} />
      <Connect />
    </motion.main>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode={shouldReduceMotion ? "sync" : "wait"}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route
          path="/projects/life-in-weeks"
          element={
            <ProjectDetailPage
              ariaLabel="Life in Weeks project"
              slug="life-in-weeks"
            />
          }
        />
        <Route
          path="/projects/market-rider"
          element={
            <ProjectDetailPage
              ariaLabel="Market Rider project"
              slug="market-rider"
            />
          }
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppShell() {
  useEffect(() => {
    document.title = siteMeta.title;
    setMetaContent('meta[name="description"]', siteMeta.description);
    setMetaContent('meta[property="og:title"]', siteMeta.title);
    setMetaContent('meta[property="og:description"]', siteMeta.description);
    setMetaContent('meta[property="og:image"]', siteMeta.image);
    setMetaContent('meta[name="twitter:title"]', siteMeta.title);
    setMetaContent('meta[name="twitter:description"]', siteMeta.description);
    setMetaContent('meta[name="twitter:image"]', siteMeta.image);
  }, []);

  return (
    <>
      <SiteNav />
      <AnimatedRoutes />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
