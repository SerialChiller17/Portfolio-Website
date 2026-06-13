import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "../data";

const maxLife = 95;
const weeksPerYear = 52;
const basicsHours = 3;
const currentYear = new Date().getFullYear();
const compactLayoutWidth = 820;
const gridBottomInset = 24;

type GridMetrics = {
  columns: number;
  gap: number;
  weekSize: number;
};

type CategoryKey = "sleep" | "work" | "screen" | "basics" | "yours";

type Category = {
  key: CategoryKey;
  label: string;
  color: string;
};

type CellModel = {
  id: number;
  age: number;
  category?: CategoryKey;
  hidden: boolean;
  state: "lived" | "now" | "ahead" | "hidden";
};

const categories: Category[] = [
  { key: "sleep", label: "sleep", color: "var(--life-sleep)" },
  { key: "work", label: "work/study", color: "var(--life-work)" },
  { key: "screen", label: "screens", color: "var(--life-screen)" },
  { key: "basics", label: "basics", color: "var(--life-basics)" },
  { key: "yours", label: "free weeks", color: "var(--life-clean)" }
];

const categoryOrder = categories.map((category) => category.key);

function distributeWeeks(total: number, fractions: Record<CategoryKey, number>) {
  const raw = categoryOrder.map((key) => total * fractions[key]);
  const floor = raw.map(Math.floor);
  let remainder = total - floor.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ fraction: value - floor[index], index }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let index = 0; index < remainder; index += 1) {
    floor[order[index].index] += 1;
  }

  return floor;
}

function sliderFill(value: number, min: number, max: number): CSSProperties {
  const percentage = ((value - min) / (max - min)) * 100;

  return { "--p": `${percentage}%` } as CSSProperties;
}

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getAdaptiveGridMetrics({
  availableHeight,
  gridWidth,
  totalWeeks,
  viewportWidth
}: {
  availableHeight: number;
  gridWidth: number;
  totalWeeks: number;
  viewportWidth: number;
}): GridMetrics {
  if (viewportWidth <= compactLayoutWidth) {
    const gap = clamp(0.8, gridWidth / 420, 1.15);
    const weekSize = clamp(
      3.6,
      (gridWidth - (weeksPerYear - 1) * gap) / weeksPerYear,
      6
    );

    return { columns: weeksPerYear, gap, weekSize };
  }

  const targetWeekSize = clamp(
    6.2,
    Math.min(gridWidth / 88, availableHeight / 58),
    8.8
  );
  const gap = clamp(1.15, targetWeekSize * 0.2, 1.8);
  const maxRows = Math.max(
    1,
    Math.floor((availableHeight + gap) / (targetWeekSize + gap))
  );
  const minColumnsForHeight = Math.ceil(totalWeeks / maxRows);
  const maxColumnsForWidth = Math.floor((gridWidth + gap) / (5.2 + gap));
  const gridAspect = gridWidth / Math.max(availableHeight, 1);
  const readableAspect = clamp(1.05, gridAspect * 1.15, 1.8);
  const minColumnsForShape = Math.ceil(Math.sqrt(totalWeeks * readableAspect));
  const maxColumns = Math.max(weeksPerYear, Math.min(112, maxColumnsForWidth));
  const columns = Math.round(
    clamp(
      weeksPerYear,
      Math.max(minColumnsForHeight, minColumnsForShape),
      maxColumns
    )
  );
  const rows = Math.ceil(totalWeeks / columns);
  const weekSize = clamp(
    5.2,
    Math.min(
      (gridWidth - (columns - 1) * gap) / columns,
      (availableHeight - (rows - 1) * gap) / rows,
      8.8
    ),
    8.8
  );

  return {
    columns,
    gap: Number(gap.toFixed(2)),
    weekSize: Number(weekSize.toFixed(2))
  };
}

function hoursLabel(value: number) {
  return `${value}h/day`;
}

function clampInteger(value: number, min: number, max: number) {
  return Math.round(clamp(min, Number.isFinite(value) ? value : min, max));
}

export function LifeInWeeksProject({ project }: { project: Project }) {
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const [age, setAge] = useState(25);
  const [life, setLife] = useState(80);
  const [sleep, setSleep] = useState(8);
  const [work, setWork] = useState(8);
  const [screens, setScreens] = useState(3);
  const [focusedCategory, setFocusedCategory] = useState<CategoryKey | null>(null);
  const [readout, setReadout] = useState("hover a week");
  const [gridMetrics, setGridMetrics] = useState<GridMetrics>({
    columns: 72,
    gap: 1.4,
    weekSize: 7.4
  });

  useEffect(() => {
    if (age >= life) {
      setAge(Math.max(1, life - 1));
    }
  }, [age, life]);

  const model = useMemo(() => {
    const livedWeeks = Math.floor(age * weeksPerYear);
    const totalWeeks = life * weeksPerYear;
    const remainingWeeks = Math.max(0, totalWeeks - livedWeeks);
    const rawHours: Record<CategoryKey, number> = {
      sleep,
      work,
      screen: screens,
      basics: basicsHours,
      yours: Math.max(0, 24 - sleep - work - screens - basicsHours)
    };
    const claimedHours = Object.values(rawHours).reduce(
      (sum, value) => sum + value,
      0
    );
    const cleanHours = rawHours.yours;
    const divisor = Math.max(24, claimedHours);
    const fractions: Record<CategoryKey, number> = {
      sleep: rawHours.sleep / divisor,
      work: rawHours.work / divisor,
      screen: rawHours.screen / divisor,
      basics: rawHours.basics / divisor,
      yours: rawHours.yours / divisor
    };
    const counts = distributeWeeks(remainingWeeks, fractions);
    const futureCategories: CategoryKey[] = [];

    categoryOrder.forEach((key, index) => {
      for (let week = 0; week < counts[index]; week += 1) {
        futureCategories.push(key);
      }
    });

    let futureIndex = 0;
    const cells: CellModel[] = Array.from(
      { length: maxLife * weeksPerYear },
      (_, id) => {
        if (id >= totalWeeks) {
          return { id, age: Math.floor(id / weeksPerYear), hidden: true, state: "hidden" };
        }

        if (id < livedWeeks) {
          return { id, age: Math.floor(id / weeksPerYear), hidden: false, state: "lived" };
        }

        if (id === livedWeeks) {
          return { id, age, hidden: false, state: "now" };
        }

        const category = futureCategories[futureIndex] ?? "yours";
        futureIndex += 1;

        return {
          id,
          age: Math.floor(id / weeksPerYear),
          category,
          hidden: false,
          state: "ahead"
        };
      }
    );

    return {
      cells,
      cleanHours,
      counts,
      livedWeeks,
      remainingWeeks,
      totalWeeks
    };
  }, [age, life, screens, sleep, work]);

  const axisMarks = useMemo(() => {
    const marks: number[] = [];

    for (let year = 0; year <= life; year += 10) {
      marks.push(year);
    }

    if (marks[marks.length - 1] !== life) {
      marks.push(life);
    }

    return marks;
  }, [life]);

  useEffect(() => {
    function measureGrid() {
      const wrap = gridWrapRef.current;

      if (!wrap) {
        return;
      }

      const wrapRect = wrap.getBoundingClientRect();
      const wrapStyles = getComputedStyle(wrap);
      const axis = wrap.querySelector<HTMLElement>(".life-weeks-axis");
      const columnGap =
        Number.parseFloat(wrapStyles.columnGap) ||
        Number.parseFloat(wrapStyles.gap) ||
        0;
      const gridWidth =
        wrap.clientWidth - (axis?.offsetWidth ?? 0) - columnGap;

      if (gridWidth <= 0) {
        return;
      }

      const availableHeight = Math.max(
        260,
        window.innerHeight - wrapRect.top - gridBottomInset
      );
      const nextMetrics = getAdaptiveGridMetrics({
        availableHeight,
        gridWidth,
        totalWeeks: model.totalWeeks,
        viewportWidth: window.innerWidth
      });

      setGridMetrics((currentMetrics) =>
        currentMetrics.columns === nextMetrics.columns &&
        currentMetrics.gap === nextMetrics.gap &&
        currentMetrics.weekSize === nextMetrics.weekSize
          ? currentMetrics
          : nextMetrics
      );
    }

    measureGrid();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measureGrid);

    if (resizeObserver && gridWrapRef.current) {
      resizeObserver.observe(gridWrapRef.current);
    }

    window.addEventListener("resize", measureGrid);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measureGrid);
    };
  }, [model.totalWeeks]);

  const gridStyle = {
    "--life-column-count": gridMetrics.columns,
    "--life-week-gap": `${gridMetrics.gap}px`,
    "--life-week-size": `${gridMetrics.weekSize}px`
  } as CSSProperties;

  function handleCellHover(cell: CellModel) {
    if (cell.hidden) {
      return;
    }

    setReadout(cellReadout(cell));
  }

  function cellReadout(cell: CellModel) {
    const year = currentYear - age + cell.age;

    if (cell.state === "now") {
      return `you are here - age ${age} - ${currentYear}`;
    }

    const state =
      cell.state === "lived"
        ? "lived"
        : cell.category === "yours"
          ? "unclaimed"
          : (categories.find((category) => category.key === cell.category)?.label ??
            "claimed");

    return `age ${cell.age} - ${year} - ${state}`;
  }

  return (
    <article className="life-weeks" id={project.slug} style={gridStyle}>
      <div className="life-weeks-rail">
        <div className="life-weeks-rail-layout">
          <p className="life-weeks-lede">
            A small map of time. Each square is a week.
          </p>

          <div className="life-weeks-ages">
            <label className="life-weeks-age-field">
              <span className="life-weeks-age-head">
                <span className="life-weeks-value">
                  <input
                    aria-label="Type your age in years"
                    inputMode="numeric"
                    max={Math.max(1, life - 1)}
                    min={1}
                    onChange={(event) =>
                      setAge(
                        clampInteger(
                          Number(event.currentTarget.value),
                          1,
                          Math.max(1, life - 1)
                        )
                      )
                    }
                    type="number"
                    value={age}
                  />
                </span>
                <span className="life-weeks-unit">yrs</span>
                <span className="life-weeks-caption">
                  <span>your</span>
                  <span>age</span>
                </span>
              </span>
              <input
                aria-label="Your age in years"
                max={Math.max(1, life - 1)}
                min={1}
                onChange={(event) => setAge(Number(event.currentTarget.value))}
                style={sliderFill(age, 1, Math.max(1, life - 1))}
                type="range"
                value={age}
              />
            </label>

            <label className="life-weeks-age-field">
              <span className="life-weeks-age-head">
                <span className="life-weeks-value">
                  <input
                    aria-label="Type expected life in years"
                    inputMode="numeric"
                    max={95}
                    min={60}
                    onChange={(event) =>
                      setLife(clampInteger(Number(event.currentTarget.value), 60, 95))
                    }
                    type="number"
                    value={life}
                  />
                </span>
                <span className="life-weeks-unit">yrs</span>
                <span className="life-weeks-caption">
                  <span>expected</span>
                  <span>life</span>
                  <em>{model.remainingWeeks.toLocaleString()} weeks remaining</em>
                </span>
              </span>
              <input
                aria-label="Expected life in years"
                max={95}
                min={60}
                onChange={(event) => setLife(Number(event.currentTarget.value))}
                style={sliderFill(life, 60, 95)}
                type="range"
                value={life}
              />
            </label>
          </div>

          <div className="life-weeks-days">
            <label className="life-weeks-day">
              <span>
                sleep <b>{hoursLabel(sleep)}</b>
              </span>
              <input
                aria-label="Daily sleep hours"
                max={12}
                min={4}
                onChange={(event) => setSleep(Number(event.currentTarget.value))}
                style={sliderFill(sleep, 4, 12)}
                type="range"
                value={sleep}
              />
            </label>

            <label className="life-weeks-day">
              <span>
                work / study <b>{hoursLabel(work)}</b>
              </span>
              <input
                aria-label="Daily work or study hours"
                max={14}
                min={0}
                onChange={(event) => setWork(Number(event.currentTarget.value))}
                style={sliderFill(work, 0, 14)}
                type="range"
                value={work}
              />
            </label>

            <label className="life-weeks-day">
              <span>
                screens <b>{hoursLabel(screens)}</b>
              </span>
              <input
                aria-label="Daily screen hours"
                max={10}
                min={0}
                onChange={(event) => setScreens(Number(event.currentTarget.value))}
                style={sliderFill(screens, 0, 10)}
                type="range"
                value={screens}
              />
            </label>
          </div>

          <div className="life-weeks-legend">
            {categories.map((category, index) => {
              const weeks = model.counts[index];
              const pct =
                model.remainingWeeks === 0
                  ? 0
                  : Math.round((weeks / model.remainingWeeks) * 100);

              return (
                <button
                  className={`life-weeks-legend-row ${
                    category.key === "yours" ? "life-weeks-legend-row-clean" : ""
                  }`}
                  key={category.key}
                  onBlur={() => setFocusedCategory(null)}
                  onFocus={() => setFocusedCategory(category.key)}
                  onMouseEnter={() => setFocusedCategory(category.key)}
                  onMouseLeave={() => setFocusedCategory(null)}
                  type="button"
                >
                  <i style={{ background: category.color }} />
                  <span className="life-weeks-legend-label">{category.label}</span>
                  <span className="life-weeks-legend-weeks">
                    {weeks.toLocaleString()} weeks
                  </span>
                  <span className="life-weeks-legend-percent">{pct}%</span>
                </button>
              );
            })}
          </div>

          <p className="life-weeks-note">
            Basics are food, movement, commute and admin. Fixed at 3h/day.
          </p>

          <div className="life-weeks-focal life-weeks-focal-clean">
            <div className="life-weeks-big">
              {model.counts[categoryOrder.indexOf("yours")].toLocaleString()}
            </div>
            <div className="life-weeks-focal-label">unclaimed time</div>
            <p>
              free weeks out of {model.remainingWeeks.toLocaleString()} still ahead.
              about {model.cleanHours}h/day left unscheduled.
            </p>
          </div>

          <p className="life-weeks-close">
            The point is not panic. The point is to notice{" "}
            <b>what keeps taking the squares.</b>
          </p>
        </div>
      </div>

      <div className="life-weeks-grid-panel">
        <div className="life-weeks-grid-title">
          Each square is one week. Colors show where the time goes.
        </div>
        <div aria-live="polite" className="life-weeks-readout">
          {readout}
        </div>
        <div className="life-weeks-grid-wrap" ref={gridWrapRef}>
          <div aria-hidden="true" className="life-weeks-axis">
            {axisMarks.map((mark) => (
              <span key={mark} style={{ top: `${(mark / life) * 100}%` }}>
                {mark}
              </span>
            ))}
          </div>
          <div
            aria-label="Life in weeks map"
            className={`life-weeks-grid ${
              focusedCategory ? `is-focused focus-${focusedCategory}` : ""
            }`}
            onMouseLeave={() => setReadout("hover a week")}
            role="img"
          >
            <span
              aria-hidden="true"
              className="life-weeks-now-label"
              style={
                {
                  "--now-col": model.livedWeeks % gridMetrics.columns,
                  "--now-row": Math.floor(model.livedWeeks / gridMetrics.columns)
                } as CSSProperties
              }
            >
              you are here
            </span>
            {axisMarks
              .filter((mark) => mark > 0 && mark < life)
              .map((mark) => (
                <div
                  aria-hidden="true"
                  className="life-weeks-decade-line"
                  key={mark}
                  style={{ top: `${(mark / life) * 100}%` }}
                />
              ))}

            {model.cells.map((cell) => (
              <span
                aria-hidden="true"
                className={`life-weeks-cell ${
                  cell.state === "lived" ? "is-lived" : ""
                } ${cell.state === "now" ? "is-now" : ""} ${
                  cell.state === "ahead" ? "is-ahead" : ""
                } ${cell.hidden ? "is-hidden" : ""}`}
                data-cat={cell.category}
                key={cell.id}
                onMouseEnter={() => handleCellHover(cell)}
                title={cell.hidden ? undefined : cellReadout(cell)}
                style={
                  {
                    "--col": cell.id % weeksPerYear,
                    "--wide-col": cell.id % gridMetrics.columns,
                    "--cell-color":
                      cell.category
                        ? categories.find((category) => category.key === cell.category)
                            ?.color
                        : undefined
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
