import { motion, useReducedMotion, useScroll } from "framer-motion";
import { useRef } from "react";
import { AnimatedLetter } from "../components/AnimatedText";
import { siteCopy } from "../data";

const pageEase = [0.16, 1, 0.3, 1] as const;

function ScrollRevealStory({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.82", "end 0.28"]
  });
  const characters = text.split("");

  return (
    <p className="about-story-copy" ref={ref}>
      {characters.map((character, index) => (
        <AnimatedLetter
          index={index}
          key={`${character}-${index}`}
          progress={scrollYProgress}
          total={characters.length}
        >
          {character}
        </AnimatedLetter>
      ))}
    </p>
  );
}

export function About() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="about-page relative overflow-hidden bg-black" id="about-page">
      <div className="field-grid" />
      <div className="bg-noise opacity-[0.1]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 md:px-8 lg:px-10 lg:pb-32 lg:pt-40">
        <motion.div
          className="about-hero-grid"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: pageEase }}
        >
          <div className="section-rule-label">About / Jay Gupta</div>
          <h1 className="about-page-title">{siteCopy.aboutPage.opening}</h1>
          <p className="about-page-intro">{siteCopy.aboutPage.intro}</p>
        </motion.div>

        <div className="about-proof-row" aria-label="Proof points">
          {siteCopy.aboutPage.numbers.map((number) => (
            <div className="about-proof" key={number.value}>
              <span className="sr-only">
                {number.value} {number.label}
              </span>
              <span>{number.value}</span>
              <p>{number.label}</p>
            </div>
          ))}
        </div>

        <div className="about-story-grid">
          <aside className="about-pullquotes" aria-label="Pull quotes">
            {siteCopy.aboutPage.pullQuotes.map((quote) => (
              <blockquote key={quote}>{quote}</blockquote>
            ))}
          </aside>

          <ScrollRevealStory text={siteCopy.aboutPage.story} />
        </div>

        <section className="about-timeline" aria-label="The long way around">
          <div>
            <p className="section-rule-label">The route so far</p>
            <h2>The long way around.</h2>
          </div>

          <ol className="about-timeline-list">
            {siteCopy.aboutPage.timeline.map((stop) => (
              <li className="about-timeline-stop" key={stop.period}>
                <span>{stop.period}</span>
                <p>{stop.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="about-principles" aria-label="How I think">
          <div>
            <p className="section-rule-label">How I think</p>
            <h2>Small rules I keep relearning.</h2>
          </div>

          <div className="about-principle-list">
            {siteCopy.aboutPage.principles.map((principle, index) => (
              <article className="about-principle" key={principle.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="about-colophon">
          <p>{siteCopy.aboutPage.colophon}</p>
        </footer>
      </div>
    </section>
  );
}
