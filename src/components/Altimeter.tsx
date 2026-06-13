import { useReducedMotion } from "framer-motion";
import { MouseEvent, useEffect, useMemo, useRef } from "react";
import { descentBands, descentTapeStops, type DescentBand } from "../data";
import { SCROLL_TARGET_OFFSET, smoothScrollToHash } from "../lib/scroll";

const CRUISE_FEET =
  descentBands.find((band) => band.id === "top")?.feet ??
  descentBands[0]?.feet ??
  39000;
const DESCENT_FEET =
  descentBands.find((band) => band.id === "flight-plan")?.feet ?? 35000;
const TAPE_WIDTH = 34;
const TAPE_HEIGHT = 240;
const SPINE_X = 22;
const TICK_RIGHT_X = 22;
const MAJOR_TICK_LEFT_X = 10;
const ACTIVE_TICK_LEFT_X = 6;
const MINOR_TICK_LEFT_X = 16;

type SectionMark = {
  band: DescentBand;
  top: number;
};

type InstrumentMode = "CRUISE" | "DESCENT" | "LANDED";

type DescentState = {
  activeStop: DescentBand | null;
  altitude: number;
  fl: string;
  mode: InstrumentMode;
  tapeProgress: number;
};

function roundFeet(feet: number) {
  return Math.max(0, Math.round(feet / 100) * 100);
}

function formatFeet(feet: number) {
  return roundFeet(feet).toLocaleString("en-US");
}

function flForFeet(feet: number, activeStop: DescentBand | null) {
  if (activeStop?.id === "connect") {
    return "GND";
  }

  const rounded = roundFeet(feet);

  if (rounded < 500) {
    return "GND";
  }

  return `FL${String(Math.round(rounded / 100)).padStart(3, "0")}`;
}

function stopProgress(index: number) {
  return index / Math.max(descentTapeStops.length - 1, 1);
}

function collectMarks() {
  return descentBands
    .map((band) => {
      const element = document.getElementById(band.id);

      if (!element) {
        return null;
      }

      return {
        band,
        top:
          band.id === "top"
            ? 0
            : element.getBoundingClientRect().top +
              window.scrollY -
              SCROLL_TARGET_OFFSET
      };
    })
    .filter((mark): mark is SectionMark => mark !== null)
    .sort((a, b) => a.top - b.top);
}

function interpolateAltitude(marks: SectionMark[], position: number) {
  if (marks.length === 0) {
    return CRUISE_FEET;
  }

  if (position <= marks[0].top) {
    return marks[0].band.feet;
  }

  for (let index = 0; index < marks.length; index += 1) {
    const current = marks[index];
    const next = marks[index + 1];

    if (!next) {
      return current.band.feet;
    }

    if (position > next.top) {
      continue;
    }

    const span = Math.max(next.top - current.top, 1);
    const progress = Math.min(Math.max((position - current.top) / span, 0), 1);

    return current.band.feet + (next.band.feet - current.band.feet) * progress;
  }

  return marks[marks.length - 1].band.feet;
}

function activeStopForAltitude(altitude: number) {
  const rounded = roundFeet(altitude);
  const firstStop = descentTapeStops[0];
  const groundStop = descentTapeStops.find((stop) => stop.id === "connect");

  if (!firstStop || rounded > firstStop.feet) {
    return null;
  }

  if (groundStop && rounded < 500) {
    return groundStop;
  }

  for (let index = 0; index < descentTapeStops.length - 1; index += 1) {
    const current = descentTapeStops[index];
    const next = descentTapeStops[index + 1];

    if (rounded <= current.feet && rounded > next.feet) {
      return current;
    }
  }

  return groundStop ?? descentTapeStops[descentTapeStops.length - 1] ?? null;
}

function tapeProgressForAltitude(altitude: number) {
  const firstStop = descentTapeStops[0];
  const lastStop = descentTapeStops[descentTapeStops.length - 1];

  if (!firstStop || !lastStop || descentTapeStops.length < 2) {
    return 0;
  }

  if (altitude >= firstStop.feet) {
    return 0;
  }

  if (altitude <= lastStop.feet) {
    return 1;
  }

  for (let index = 0; index < descentTapeStops.length - 1; index += 1) {
    const current = descentTapeStops[index];
    const next = descentTapeStops[index + 1];

    if (altitude <= current.feet && altitude >= next.feet) {
      const segment = (current.feet - altitude) / Math.max(current.feet - next.feet, 1);
      return Math.min(
        Math.max((index + segment) / (descentTapeStops.length - 1), 0),
        1
      );
    }
  }

  return 1;
}

function modeForAltitude(altitude: number, activeStop: DescentBand | null) {
  if (activeStop?.id === "connect") {
    return "LANDED";
  }

  if (altitude > DESCENT_FEET) {
    return "CRUISE";
  }

  return "DESCENT";
}

function deriveDescentState(marks: SectionMark[], position: number): DescentState {
  const altitude = roundFeet(interpolateAltitude(marks, position));
  const activeStop = activeStopForAltitude(altitude);
  const mode = modeForAltitude(altitude, activeStop);

  return {
    activeStop,
    altitude,
    fl: flForFeet(altitude, activeStop),
    mode,
    tapeProgress: tapeProgressForAltitude(altitude)
  };
}

function compactLabel(state: DescentState) {
  if (!state.activeStop) {
    return `${state.fl} · ${state.mode}`;
  }

  return `${state.fl} · CH ${state.activeStop.chapter} ${state.activeStop.title.toUpperCase()}`;
}

function majorTicks() {
  return descentTapeStops.map((stop, index) => ({
    index,
    stop,
    y: stopProgress(index) * TAPE_HEIGHT
  }));
}

function minorTicks() {
  const ticks: Array<{ key: string; y: number }> = [];

  for (let index = 0; index < descentTapeStops.length - 1; index += 1) {
    for (let minor = 1; minor <= 3; minor += 1) {
      ticks.push({
        key: `${index}-${minor}`,
        y: ((index + minor / 4) / (descentTapeStops.length - 1)) * TAPE_HEIGHT
      });
    }
  }

  return ticks;
}

export function Altimeter() {
  const shouldReduceMotion = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const feetRef = useRef<HTMLSpanElement>(null);
  const flRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLSpanElement>(null);
  const phoneRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<SVGLineElement>(null);
  const hairlineRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const trackHeightRef = useRef(0);
  const stopRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const majorTickRefs = useRef<Record<string, SVGLineElement | null>>({});
  const stops = useMemo(() => descentTapeStops, []);
  const majors = useMemo(() => majorTicks(), []);
  const minors = useMemo(() => minorTicks(), []);

  useEffect(() => {
    let frame = 0;
    const fallbackUpdates: number[] = [];

    function measureTrack() {
      trackHeightRef.current = trackRef.current?.clientHeight ?? 0;
    }

    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const marks = collectMarks();

        if (marks.length === 0) {
          return;
        }

        if (trackHeightRef.current === 0) {
          measureTrack();
        }

        const state = deriveDescentState(marks, window.scrollY);
        const visualProgress =
          shouldReduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? stopProgress(
                state.activeStop
                  ? stops.findIndex((stop) => stop.id === state.activeStop?.id)
                  : 0
              )
            : state.tapeProgress;
        const markerY = visualProgress * trackHeightRef.current;
        const tapeY = visualProgress * TAPE_HEIGHT;
        const fullReadout = `${formatFeet(state.altitude)} FT`;
        const compact = compactLabel(state);

        navRef.current?.setAttribute("data-mode", state.mode);
        navRef.current?.setAttribute("data-altitude", String(state.altitude));
        navRef.current?.setAttribute("data-active-stop", state.activeStop?.id ?? "");
        navRef.current?.setAttribute("data-tape-progress", state.tapeProgress.toFixed(4));
        navRef.current?.style.setProperty(
          "--altimeter-progress",
          state.tapeProgress.toFixed(4)
        );

        if (feetRef.current) {
          feetRef.current.textContent = formatFeet(state.altitude);
        }

        if (flRef.current) {
          flRef.current.textContent = state.fl;
        }

        if (modeRef.current) {
          modeRef.current.textContent = state.mode;
        }

        if (compactRef.current) {
          compactRef.current.textContent = compact;
        }

        if (phoneRef.current) {
          phoneRef.current.textContent = `${fullReadout} · ${compact}`;
        }

        if (markerRef.current) {
          markerRef.current.style.transform = `translate3d(-50%, ${markerY.toFixed(
            2
          )}px, 0) translateY(-50%)`;
        }

        if (trailRef.current) {
          trailRef.current.setAttribute("y2", tapeY.toFixed(2));
        }

        if (hairlineRef.current) {
          hairlineRef.current.style.transform = `scaleX(${state.tapeProgress.toFixed(
            4
          )})`;
        }

        stops.forEach((stop) => {
          const link = stopRefs.current[stop.id];
          const tick = majorTickRefs.current[stop.id];
          const isActive = state.activeStop?.id === stop.id;

          if (link) {
            if (isActive) {
              link.setAttribute("aria-current", "location");
            } else {
              link.removeAttribute("aria-current");
            }
          }

          if (tick) {
            if (isActive) {
              tick.setAttribute("data-active", "true");
              tick.setAttribute("x1", String(ACTIVE_TICK_LEFT_X));
            } else {
              tick.removeAttribute("data-active");
              tick.setAttribute("x1", String(MAJOR_TICK_LEFT_X));
            }
          }
        });
      });
    }

    function handleResize() {
      measureTrack();
      update();
    }

    measureTrack();
    update();
    fallbackUpdates.push(window.setTimeout(update, 0));
    fallbackUpdates.push(window.setTimeout(update, 180));
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("hashchange", update);

    return () => {
      cancelAnimationFrame(frame);
      fallbackUpdates.forEach((timeout) => window.clearTimeout(timeout));
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("hashchange", update);
    };
  }, [shouldReduceMotion, stops]);

  function handleStopClick(
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) {
    event.preventDefault();
    smoothScrollToHash(`#${id}`, Boolean(shouldReduceMotion));
  }

  return (
    <nav
      aria-label="Descent"
      className="altimeter"
      data-active-stop=""
      data-altitude={CRUISE_FEET}
      data-mode="CRUISE"
      data-tape-progress="0.0000"
      ref={navRef}
    >
      <span className="altimeter-hairline" aria-hidden="true">
        <span ref={hairlineRef} />
      </span>

      <span className="altimeter-compact" aria-hidden="true">
        <span className="altimeter-compact-dot" />
        <span ref={compactRef}>FL390 · CRUISE</span>
      </span>

      <span className="altimeter-phone-readout">
        <span className="altimeter-compact-dot" aria-hidden="true" />
        <span ref={phoneRef}>39,000 FT · FL390 · CRUISE</span>
      </span>

      <div className="altimeter-readout" aria-hidden="true">
        <span className="altimeter-readout-text">
          <span className="altimeter-feet" ref={feetRef}>
            {formatFeet(CRUISE_FEET)}
          </span>
          <span className="altimeter-readout-space"> </span>
          <span className="altimeter-unit">FT</span>
        </span>
      </div>
      <div className="altimeter-fl" aria-hidden="true" ref={flRef}>
        FL390
      </div>
      <div className="altimeter-track" ref={trackRef}>
        <svg
          aria-hidden="true"
          className="altimeter-tape-svg"
          focusable="false"
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
          viewBox={`0 0 ${TAPE_WIDTH} ${TAPE_HEIGHT}`}
        >
          <line
            className="altimeter-spine"
            x1={SPINE_X}
            x2={SPINE_X}
            y1="0"
            y2={TAPE_HEIGHT}
          />
          <line
            className="altimeter-trail"
            ref={trailRef}
            x1={SPINE_X}
            x2={SPINE_X}
            y1="0"
            y2="0"
          />
          {minors.map((tick) => (
            <line
              className="altimeter-minor-tick"
              key={tick.key}
              x1={MINOR_TICK_LEFT_X}
              x2={TICK_RIGHT_X}
              y1={tick.y}
              y2={tick.y}
            />
          ))}
          {majors.map((tick) => (
            <line
              className="altimeter-major-tick"
              data-stop={tick.stop.id}
              key={tick.stop.id}
              ref={(node) => {
                majorTickRefs.current[tick.stop.id] = node;
              }}
              x1={MAJOR_TICK_LEFT_X}
              x2={TICK_RIGHT_X}
              y1={tick.y}
              y2={tick.y}
            />
          ))}
        </svg>
        <span className="altimeter-marker" aria-hidden="true" ref={markerRef}>
          <span className="altimeter-marker-index" />
          <span className="altimeter-marker-dot" />
        </span>
        {stops.map((stop, index) => (
          <a
            aria-label={`${stop.title} ${stop.fl}`}
            className="altimeter-stop focus-ring"
            href={`#${stop.id}`}
            key={stop.id}
            onClick={(event) => handleStopClick(event, stop.id)}
            ref={(node) => {
              stopRefs.current[stop.id] = node;
            }}
            style={{ top: `${stopProgress(index) * 100}%` }}
            title={`${stop.title} · ${stop.fl}`}
          >
            <span className="altimeter-stop-hit" aria-hidden="true" />
            <span className="altimeter-stop-label">{stop.title}</span>
          </a>
        ))}
      </div>
      <div className="altimeter-mode" ref={modeRef}>
        CRUISE
      </div>
    </nav>
  );
}
