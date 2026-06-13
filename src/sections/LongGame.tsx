import { motion, useReducedMotion } from "framer-motion";
import { ChapterRule } from "../components/ChapterRule";
import { descentBands, longGameCopy } from "../data";

const blockEase = [0.16, 1, 0.3, 1] as const;
const band = descentBands.find((entry) => entry.id === "journeys");

function Contours() {
  return (
    <svg
      aria-hidden="true"
      className="game-contours"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 760"
    >
      <path d="M 180 700 C 60 600, 80 460, 230 420 C 380 380, 470 470, 470 570 C 470 670, 300 800, 180 700 Z" />
      <path d="M 200 660 C 110 590, 130 480, 250 450 C 370 420, 430 490, 430 560 C 430 640, 290 730, 200 660 Z" />
      <path d="M 225 620 C 160 570, 180 500, 270 480 C 350 462, 392 510, 390 555 C 388 610, 290 670, 225 620 Z" />
      <path d="M 900 260 C 790 220, 770 90, 900 50 C 1030 10, 1140 80, 1130 170 C 1120 260, 1010 300, 900 260 Z" />
      <path d="M 915 225 C 835 195, 825 105, 920 80 C 1010 55, 1090 105, 1082 165 C 1075 225, 995 255, 915 225 Z" />
      <path d="M 935 190 C 880 170, 875 120, 940 105 C 1000 90, 1045 125, 1040 160 C 1035 195, 990 210, 935 190 Z" />
      <path d="M 620 480 C 540 450, 540 360, 630 340 C 720 320, 790 370, 780 425 C 770 480, 700 510, 620 480 Z" />
    </svg>
  );
}

export function LongGame() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Journeys"
      className="game-section section-pad relative overflow-hidden"
      id="journeys"
    >
      <Contours />
      <div className="bg-noise opacity-[0.1]" />

      <div className="relative mx-auto max-w-7xl">
        {band ? (
          <ChapterRule
            chapter={band.chapter}
            feet={band.feet}
            fl={band.fl}
            title="The Long Game"
          />
        ) : null}

        <div className="game-head">
          <h2 className="game-heading">{longGameCopy.heading}</h2>
          <p className="game-lede">{longGameCopy.lede}</p>
        </div>

        <div className="game-grid">
          <motion.article
            className="game-upsc"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.75, ease: blockEase }}
          >
            <p className="game-kicker">{longGameCopy.upsc.kicker}</p>
            <div className="game-stat-row">
              <span className="game-stat">{longGameCopy.upsc.stat}</span>
              <p className="game-stat-label">{longGameCopy.upsc.statLabel}</p>
            </div>

            <div aria-label="Mains qualified, year by year" className="game-years">
              {longGameCopy.upsc.years.map((year) => (
                <span className="game-year" key={year}>
                  <b>{year}</b>
                  <small>MAINS ✓</small>
                </span>
              ))}
            </div>

            <p className="game-copy">{longGameCopy.upsc.copy}</p>
            <p className="game-vault">
              <span aria-hidden="true" className="game-vault-glyph">
                ◈
              </span>
              {longGameCopy.upsc.vault}
            </p>
          </motion.article>

          <motion.article
            className="game-pivot"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{
              delay: shouldReduceMotion ? 0 : 0.12,
              duration: 0.75,
              ease: blockEase
            }}
          >
            <p className="game-kicker">{longGameCopy.pivot.kicker}</p>
            <p className="game-pivot-line">{longGameCopy.pivot.copy}</p>

            <div className="game-exams">
              {longGameCopy.pivot.exams.map((exam) => (
                <div className="game-exam" key={exam.name}>
                  <span className="game-exam-name">{exam.name}</span>
                  <span className="game-exam-value">
                    {exam.value}
                    <small>{exam.suffix}</small>
                  </span>
                  <span className="game-exam-detail">{exam.detail}</span>
                </div>
              ))}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
