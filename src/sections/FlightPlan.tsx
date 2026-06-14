import { motion, useReducedMotion } from "framer-motion";
import { MouseEvent } from "react";
import { descentTapeStops, siteCopy } from "../data";
import { smoothScrollToHash } from "../lib/scroll";

const rowEase = [0.16, 1, 0.3, 1] as const;

export function FlightPlan() {
  const shouldReduceMotion = useReducedMotion();
  const stops = descentTapeStops;

  function handleJump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    smoothScrollToHash(`#${id}`, Boolean(shouldReduceMotion));
  }

  return (
    <section
      aria-label="Flight plan"
      className="fp-section section-pad relative overflow-hidden"
      id="flight-plan"
    >
      <div className="field-grid" />
      <div className="bg-noise opacity-[0.1]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="fp-grid">
          <div className="fp-intro">
            <p className="section-rule-label">{siteCopy.flightPlan.kicker}</p>
            <motion.h2
              className="fp-heading"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: rowEase }}
            >
              {siteCopy.flightPlan.heading}
            </motion.h2>
            <motion.p
              className="fp-quote"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: shouldReduceMotion ? 0 : 0.08, duration: 0.7, ease: rowEase }}
            >
              <span className="fp-quote-lead">{siteCopy.flightPlan.quote.lead}</span>
              <span className="fp-quote-follow">{siteCopy.flightPlan.quote.follow}</span>
            </motion.p>
            {siteCopy.flightPlan.body.length > 0 ? (
              <motion.div
                className="fp-body"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.12, duration: 0.7, ease: rowEase }}
              >
                {siteCopy.flightPlan.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </motion.div>
            ) : null}
          </div>

          <nav aria-label="Descent chapters" className="fp-plan">
            {stops.map((band, index) => (
              <motion.a
                className="fp-stop focus-ring"
                href={`#${band.id}`}
                key={band.id}
                onClick={(event) => handleJump(event, band.id)}
                initial={shouldReduceMotion ? false : { opacity: 0, x: 26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: shouldReduceMotion ? 0 : index * 0.07,
                  duration: 0.6,
                  ease: rowEase
                }}
              >
                <span className="fp-stop-node" aria-hidden="true">
                  <i />
                </span>
                <span className="fp-stop-main">
                  <span className="fp-stop-title">
                    <b>{band.title}</b>
                    <small>{band.blurb}</small>
                  </span>
                </span>
                <span className="fp-stop-alt" aria-hidden="true">
                  <span>{band.fl}</span>
                  <small>
                    {band.feet > 0
                      ? `${band.feet.toLocaleString("en-US")} ft`
                      : "ground"}
                  </small>
                </span>
              </motion.a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
