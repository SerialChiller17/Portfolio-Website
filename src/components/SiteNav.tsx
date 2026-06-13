import { useReducedMotion } from "framer-motion";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navItems, siteCopy } from "../data";
import { SCROLL_TARGET_OFFSET } from "../lib/scroll";
import { Icon } from "./Icon";

function easeOutQuart(value: number) {
  return 1 - Math.pow(1 - value, 4);
}

function scrollToHash(hash: string, reduceMotion: boolean) {
  const target = document.querySelector<HTMLElement>(hash);

  if (!target) {
    return;
  }

  if (reduceMotion) {
    target.scrollIntoView();
    return;
  }

  const start = window.scrollY;
  const end = target.getBoundingClientRect().top + start - SCROLL_TARGET_OFFSET;
  const distance = end - start;
  const duration = 620;
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeOutQuart(progress));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(maxScroll <= 0 ? 0 : window.scrollY / maxScroll);
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return Math.min(Math.max(progress, 0), 1);
}

function useActiveSection(enabled: boolean) {
  const sectionIds = useMemo(
    () =>
      navItems
        .map((item) => item.href)
        .filter((href): href is string => Boolean(href?.startsWith("/#")))
        .map((href) => href.slice(2)),
    []
  );
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    if (!enabled) {
      setActiveSection("");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-34% 0px -50% 0px",
        threshold: [0.12, 0.35, 0.68]
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [enabled, sectionIds]);

  return activeSection;
}

export function SiteNav() {
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollProgress = useScrollProgress();
  const activeSection = useActiveSection(location.pathname === "/");
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function updateNavState() {
      setIsNavScrolled(window.scrollY > 12);
    }

    updateNavState();
    window.addEventListener("scroll", updateNavState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateNavState);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);

    if (location.hash) {
      window.requestAnimationFrame(() => {
        scrollToHash(location.hash, Boolean(shouldReduceMotion));
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash, location.pathname, shouldReduceMotion]);

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.setAttribute("data-nav-open", "true");
    } else {
      document.documentElement.removeAttribute("data-nav-open");
    }

    return () => {
      document.documentElement.removeAttribute("data-nav-open");
    };
  }, [isMenuOpen]);

  function handleHashClick(
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    const hash = href.slice(1);

    event.preventDefault();
    setIsMenuOpen(false);

    if (location.pathname !== "/") {
      navigate({ pathname: "/", hash });
      return;
    }

    scrollToHash(hash, Boolean(shouldReduceMotion));
    window.history.replaceState(null, "", `/${hash}`);
  }

  return (
    <>
      <div
        aria-label={siteCopy.ui.scrollProgressLabel}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(scrollProgress * 100)}
        className="scroll-progress"
        data-testid="scroll-progress"
        role="progressbar"
      >
        <span style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>

      <nav
        aria-label="Primary navigation"
        className={`site-nav ${isNavScrolled ? "site-nav-scrolled" : ""} ${
          isMenuOpen ? "site-nav-open" : ""
        }`}
      >
        <Link
          aria-label="Jay Gupta home"
          className="site-wordmark focus-ring"
          to="/"
        >
          Jay Gupta
        </Link>

        <button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="nav-menu-button focus-ring"
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
        >
          <Icon className="h-4 w-4" icon={isMenuOpen ? "close" : "menu"} />
        </button>

        <div className="site-nav-links">
          {navItems
            .filter((item) => item.href)
            .map((item) => {
              const href = item.href as string;
              const active =
                href === "/about"
                  ? location.pathname === "/about"
                  : href === "/projects"
                    ? location.pathname.startsWith("/projects")
                    : location.pathname === "/" &&
                      href.startsWith("/#") &&
                      activeSection === href.slice(2);

              if (href.startsWith("/#")) {
                return (
                  <div className="site-nav-item" key={item.label}>
                    <a
                      aria-current={active ? "page" : undefined}
                      className={`site-nav-link focus-ring ${
                        active ? "site-nav-link-active" : ""
                      }`}
                      href={href}
                      onClick={(event) => handleHashClick(event, href)}
                    >
                      {item.label}
                    </a>
                  </div>
                );
              }

              if (item.isExternal) {
                return (
                  <div className="site-nav-item" key={item.label}>
                    <a
                      className="site-nav-link focus-ring"
                      href={href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {item.label}
                    </a>
                  </div>
                );
              }

              return (
                <div
                  className={`site-nav-item ${
                    item.menu?.length ? "site-nav-item-has-menu" : ""
                  }`}
                  key={item.label}
                >
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`site-nav-link focus-ring ${
                      active ? "site-nav-link-active" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    to={href}
                  >
                    {item.label}
                  </Link>
                  {item.menu?.length ? (
                    <div
                      aria-label={`${item.label} menu`}
                      className="site-nav-dropdown"
                      role="menu"
                    >
                      {item.menu.map((menuItem) => (
                        <Link
                          className="site-nav-dropdown-link focus-ring"
                          key={menuItem.href}
                          onClick={() => setIsMenuOpen(false)}
                          role="menuitem"
                          to={menuItem.href}
                        >
                          {menuItem.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
        </div>
      </nav>
    </>
  );
}
