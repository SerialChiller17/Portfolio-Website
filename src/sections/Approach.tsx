import { motion, useReducedMotion } from "framer-motion";
import { ChapterRule } from "../components/ChapterRule";
import { approachCopy, descentBands } from "../data";

const blockEase = [0.16, 1, 0.3, 1] as const;
const band = descentBands.find((entry) => entry.id === "approach");

function RunwayLights() {
  return (
    <svg
      aria-hidden="true"
      className="appr-runway-art"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
      viewBox="0 0 320 150"
    >
      <path className="appr-runway-edge" d="M138 8 L52 148" />
      <path className="appr-runway-edge" d="M182 8 L268 148" />
      <path className="appr-runway-center" d="M160 10 L160 148" />
      {[20, 44, 72, 104, 140].map((y, index) => {
        const spread = 22 + index * 13;

        return (
          <g className="appr-runway-light" key={y} style={{ animationDelay: `${index * 0.32}s` }}>
            <circle cx={160 - spread} cy={y} r={1.6 + index * 0.5} />
            <circle cx={160 + spread} cy={y} r={1.6 + index * 0.5} />
          </g>
        );
      })}
    </svg>
  );
}

export function Approach() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Approach"
      className="appr-section section-pad relative overflow-hidden"
      id="approach"
    >
      <div className="bg-noise opacity-[0.1]" />

      <div className="relative mx-auto max-w-7xl">
        {band ? (
          <ChapterRule
            chapter={band.chapter}
            feet={band.feet}
            fl={band.fl}
            title="Approach"
          />
        ) : null}

        <div className="appr-head">
          <h2 className="appr-heading">{approachCopy.heading}</h2>
          <p className="appr-lede">{approachCopy.lede}</p>
        </div>

        <div className="appr-themes" aria-label={approachCopy.themes.kicker}>
          <p className="appr-kicker">{approachCopy.themes.kicker}</p>
          <div className="appr-theme-grid">
            {approachCopy.themes.items.map((theme, index) => (
              <motion.div
                className="appr-theme"
                key={theme.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                  duration: 0.6,
                  ease: blockEase
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{theme.title}</h3>
                <p>{theme.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="appr-split">
          <motion.article
            className="appr-runway"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: blockEase }}
          >
            <RunwayLights />
            <p className="appr-kicker">{approachCopy.runway.kicker}</p>
            <h3 className="appr-runway-title">{approachCopy.runway.title}</h3>
            <p className="appr-runway-body">{approachCopy.runway.body}</p>
          </motion.article>

          <motion.article
            className="appr-bench"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.1,
              duration: 0.7,
              ease: blockEase
            }}
          >
            <div className="appr-bench-head">
              <p className="appr-kicker">{approachCopy.bench.kicker}</p>
              <span className="appr-bench-note">{approachCopy.bench.note}</span>
            </div>
            <ul className="appr-bench-list">
              {approachCopy.bench.items.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
