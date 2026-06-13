import { motion, useReducedMotion } from "framer-motion";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { siteCopy, socialLinks } from "../data";
import { Icon } from "../components/Icon";
import { Magnetic } from "../components/Magnetic";
import { SmartLink } from "../components/SmartLink";
import { WordsPullUp } from "../components/AnimatedText";
import { smoothScrollToHash } from "../lib/scroll";

const fadeEase = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const cursorFrame = useRef<number>();
  const mediaPrefersReducedMotion =
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shouldPauseHeroVideo = Boolean(
    shouldReduceMotion || mediaPrefersReducedMotion()
  );

  const resetCursor = useCallback(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    frame.style.setProperty("--spotlight-x", "50%");
    frame.style.setProperty("--spotlight-y", "50%");
    frame.style.setProperty("--signature-x", "0px");
    frame.style.setProperty("--signature-y", "0px");
    frame.style.setProperty("--signature-tilt", "0deg");
  }, []);

  const moveCursor = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (
        shouldReduceMotion ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ) {
        return;
      }

      const frame = frameRef.current;

      if (!frame) {
        return;
      }

      const rect = frame.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      const normalizedX = (x - 50) / 50;
      const normalizedY = (y - 50) / 50;

      if (cursorFrame.current) {
        cancelAnimationFrame(cursorFrame.current);
      }

      cursorFrame.current = requestAnimationFrame(() => {
        frame.style.setProperty("--spotlight-x", `${x.toFixed(2)}%`);
        frame.style.setProperty("--spotlight-y", `${y.toFixed(2)}%`);
        frame.style.setProperty("--signature-x", `${(normalizedX * 5).toFixed(2)}px`);
        frame.style.setProperty("--signature-y", `${(normalizedY * -4).toFixed(2)}px`);
        frame.style.setProperty(
          "--signature-tilt",
          `${(normalizedX * 1.4).toFixed(2)}deg`
        );
      });
    },
    [shouldReduceMotion]
  );

  useEffect(() => {
    return () => {
      if (cursorFrame.current) {
        cancelAnimationFrame(cursorFrame.current);
      }
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    const video = heroVideoRef.current;

    if (!frame || !video) {
      return;
    }

    if (shouldPauseHeroVideo) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
          return;
        }

        video.pause();
      },
      { threshold: 0.18 }
    );

    observer.observe(frame);

    return () => observer.disconnect();
  }, [shouldPauseHeroVideo]);

  function handleInternalClick(
    event: MouseEvent<HTMLAnchorElement>,
    href?: string
  ) {
    if (!href?.startsWith("#")) {
      return;
    }

    event.preventDefault();
    smoothScrollToHash(href, Boolean(shouldReduceMotion));
  }

  return (
    <section className="hero-shell" id="top" aria-label="Jay Gupta">
      <div
        className="hero-frame"
        onMouseLeave={resetCursor}
        onMouseMove={moveCursor}
        ref={frameRef}
      >
        <video
          aria-label="Hero background video"
          autoPlay={!shouldPauseHeroVideo}
          className="hero-video"
          loop
          muted
          playsInline
          poster={siteCopy.hero.poster}
          preload="metadata"
          ref={heroVideoRef}
        >
          <source src={siteCopy.hero.videoWebm} type="video/webm" />
          <source src={siteCopy.hero.videoMp4} type="video/mp4" />
        </video>
        <div className="hero-video-vignette" />
        <div className="hero-gradient" />
        <div className="hero-glow" />
        <div className="hero-spotlight" />
        <div className="noise-overlay opacity-[0.82] mix-blend-overlay" />
        <div className="hero-vignette" />

        <div className="hero-content">
          <div className="lg:col-span-8">
            <h1 aria-label={siteCopy.hero.name} className="hero-title">
              <WordsPullUp signature showAsterisk text={siteCopy.hero.name} />
            </h1>
            <p className="hero-footnote">* {siteCopy.hero.footnote}</p>
          </div>

          <motion.div
            className="hero-side lg:col-span-4"
            initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.42,
              duration: 0.72,
              ease: fadeEase
            }}
          >
            <p className="max-w-sm text-xs leading-[1.2] text-primary/70 sm:text-sm md:text-base">
              {siteCopy.hero.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <SmartLink
                  className="social-button"
                  external={link.external ?? true}
                  href={link.href}
                  key={link.label}
                  label={link.label}
                >
                  <Icon className="h-5 w-5" icon={link.icon} />
                  <span className="sr-only">{link.label}</span>
                </SmartLink>
              ))}
            </div>

            <motion.div
              className="hero-actions"
              initial={shouldReduceMotion ? false : { y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: shouldReduceMotion ? 0 : 0.58,
                duration: 0.72,
                ease: fadeEase
              }}
            >
              <Magnetic strength={10}>
                <a
                  className="hero-cta group focus-ring"
                  href="#flight-plan"
                  onClick={(event) => handleInternalClick(event, "#flight-plan")}
                >
                  {siteCopy.hero.cta}
                  <span className="hero-cta-icon">
                    <Icon className="h-4 w-4 rotate-90" icon="arrow" />
                  </span>
                </a>
              </Magnetic>

              <Magnetic strength={8}>
                <a
                  className="hero-cta hero-cta-secondary group focus-ring"
                  href="#connect"
                  onClick={(event) => handleInternalClick(event, "#connect")}
                >
                  {siteCopy.hero.secondaryCta}
                  <span className="hero-cta-icon">
                    <Icon className="h-4 w-4" icon="mail" />
                  </span>
                </a>
              </Magnetic>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
