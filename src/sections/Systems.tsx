import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChapterRule } from "../components/ChapterRule";
import { Icon } from "../components/Icon";
import { descentBands, systemsCopy } from "../data";

const cardEase = [0.22, 1, 0.36, 1] as const;
const band = descentBands.find((entry) => entry.id === "systems");

function SystemSchematic({ seed }: { seed: number }) {
  const drift = seed * 14;

  return (
    <svg
      aria-hidden="true"
      className="sys-schematic"
      fill="none"
      viewBox="0 0 160 90"
    >
      <path
        className="sys-schematic-path"
        d={`M8 ${64 - drift * 0.4} C 40 ${58 - drift * 0.5}, 52 ${
          30 + drift * 0.3
        }, 84 ${32 + drift * 0.2} S 138 ${18 + drift * 0.4}, 152 ${
          14 + drift * 0.3
        }`}
      />
      <circle className="sys-schematic-node" cx="8" cy={64 - drift * 0.4} r="3" />
      <rect
        className="sys-schematic-node"
        height="6"
        width="6"
        x="81"
        y={29 + drift * 0.2}
      />
      <circle
        className="sys-schematic-node sys-schematic-node-end"
        cx="152"
        cy={14 + drift * 0.3}
        r="3.4"
      />
    </svg>
  );
}

export function Systems() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Systems"
      className="sys-section section-pad relative overflow-hidden"
      id="systems"
    >
      <div className="field-grid" />
      <div className="bg-noise opacity-[0.1]" />

      <div className="relative mx-auto max-w-7xl">
        {band ? (
          <ChapterRule
            chapter={band.chapter}
            feet={band.feet}
            fl={band.fl}
            title="Systems"
          />
        ) : null}

        <div className="sys-head">
          <h2 className="sys-heading">{systemsCopy.heading}</h2>
          <p className="sys-lede">{systemsCopy.lede}</p>
        </div>

        <div className="sys-grid">
          {systemsCopy.items.map((item, index) => (
            <motion.article
              className="sys-card"
              key={item.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{
                delay: shouldReduceMotion ? 0 : index * 0.1,
                duration: 0.7,
                ease: cardEase
              }}
            >
              <SystemSchematic seed={index} />
              <div className="sys-card-top">
                <span>SYS {String(index + 1).padStart(2, "0")}</span>
                <span>{item.year}</span>
              </div>
              <h3 className="sys-card-title">{item.name}</h3>
              <p className="sys-card-tagline">{item.tagline}</p>
              <p className="sys-card-copy">{item.description}</p>
              <dl className="sys-specs">
                {item.specs.map(([key, value]) => (
                  <div className="sys-spec" key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="sys-lab"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: cardEase }}
        >
          <div className="sys-lab-weeks" aria-hidden="true" />
          <div className="sys-lab-copy">
            <p className="sys-lab-kicker">{systemsCopy.lab.kicker}</p>
            <h3>{systemsCopy.lab.title}</h3>
            <p>{systemsCopy.lab.description}</p>
          </div>
          <Link className="sys-lab-cta focus-ring" to={systemsCopy.lab.href}>
            {systemsCopy.lab.cta}
            <Icon className="h-4 w-4" icon="arrow" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
