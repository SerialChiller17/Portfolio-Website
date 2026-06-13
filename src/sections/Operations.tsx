import { motion, useReducedMotion } from "framer-motion";
import { ChapterRule } from "../components/ChapterRule";
import { descentBands, operationsCopy } from "../data";

const rowEase = [0.16, 1, 0.3, 1] as const;
const band = descentBands.find((entry) => entry.id === "operations");

export function Operations() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Operations"
      className="ops-section section-pad relative overflow-hidden"
      id="operations"
    >
      <div className="bg-noise opacity-[0.1]" />

      <div className="relative mx-auto max-w-7xl">
        {band ? (
          <ChapterRule
            chapter={band.chapter}
            feet={band.feet}
            fl={band.fl}
            title="Operations"
          />
        ) : null}

        <div className="ops-head">
          <h2 className="ops-heading">{operationsCopy.heading}</h2>
          <p className="ops-lede">{operationsCopy.lede}</p>
        </div>

        <div className="ops-log">
          {operationsCopy.entries.map((entry, index) => (
            <motion.article
              className="ops-entry"
              key={entry.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: shouldReduceMotion ? 0 : index * 0.06,
                duration: 0.65,
                ease: rowEase
              }}
            >
              <div className="ops-entry-when">
                <span>{entry.period}</span>
                <small>{entry.kind}</small>
              </div>
              <div className="ops-entry-what">
                <h3>
                  {entry.role}
                  <em> — {entry.org}</em>
                </h3>
                <p>{entry.summary}</p>
              </div>
              <ul className="ops-entry-facts" aria-label="Highlights">
                {entry.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
