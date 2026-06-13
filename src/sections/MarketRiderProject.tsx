import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "../data";
import {
  getStocksByMarket,
  moodCopy,
  type MarketMood,
  type MarketRiderMarket,
  type MarketRiderStock
} from "../marketRiderData";

type TerrainPoint = {
  x: number;
  y: number;
  value: number;
};

type ControlKey = "jump" | "boost" | "leanBack" | "leanForward";

type Controls = Record<ControlKey, boolean>;

type RiderState = {
  x: number;
  y: number;
  vy: number;
  angle: number;
  angleVelocity: number;
  grounded: boolean;
  crashed: boolean;
  score: number;
  airTime: number;
  boostChain: number;
  jumpLatch: boolean;
  completed: boolean;
};

const markets: Array<{ id: MarketRiderMarket; label: string }> = [
  { id: "india", label: "India" },
  { id: "usa", label: "USA" }
];

const moodStyles: Record<MarketMood, { gravity: number; jump: number; speed: number }> = {
  steady: { gravity: 760, jump: 385, speed: 1 },
  volatile: { gravity: 805, jump: 430, speed: 1.08 },
  breakout: { gravity: 780, jump: 455, speed: 1.14 },
  crashy: { gravity: 835, jump: 445, speed: 1.18 }
};

const initialControls: Controls = {
  jump: false,
  boost: false,
  leanBack: false,
  leanForward: false
};

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildTerrain(stock: MarketRiderStock, width: number, height: number) {
  const left = clamp(34, width * 0.075, 72);
  const right = clamp(34, width * 0.055, 56);
  const top = clamp(42, height * 0.15, 72);
  const bottom = clamp(54, height * 0.2, 92);
  const min = Math.min(...stock.points);
  const max = Math.max(...stock.points);
  const range = Math.max(1, max - min);

  return stock.points.map((point, index) => {
    const progress = index / Math.max(1, stock.points.length - 1);

    return {
      x: left + progress * (width - left - right),
      y: top + (1 - (point - min) / range) * (height - top - bottom),
      value: point
    };
  });
}

function terrainYAt(terrain: TerrainPoint[], x: number) {
  if (x <= terrain[0].x) {
    return terrain[0].y;
  }

  const last = terrain[terrain.length - 1];

  if (x >= last.x) {
    return last.y;
  }

  for (let index = 1; index < terrain.length; index += 1) {
    const point = terrain[index];
    const previous = terrain[index - 1];

    if (x <= point.x) {
      const progress = (x - previous.x) / Math.max(1, point.x - previous.x);
      return previous.y + (point.y - previous.y) * progress;
    }
  }

  return last.y;
}

function terrainAngleAt(terrain: TerrainPoint[], x: number) {
  const before = terrainYAt(terrain, x - 8);
  const after = terrainYAt(terrain, x + 8);

  return Math.atan2(after - before, 16);
}

function makeInitialRider(terrain: TerrainPoint[]): RiderState {
  const x = terrain[0]?.x ?? 56;
  const y = terrainYAt(terrain, x) - 18;

  return {
    x,
    y,
    vy: 0,
    angle: terrainAngleAt(terrain, x),
    angleVelocity: 0,
    grounded: true,
    crashed: false,
    score: 0,
    airTime: 0,
    boostChain: 1,
    jumpLatch: false,
    completed: false
  };
}

function drawBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  stock: MarketRiderStock
) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(8, 8, 8, 1)");
  gradient.addColorStop(0.5, "rgba(17, 17, 17, 1)");
  gradient.addColorStop(1, "rgba(4, 4, 4, 1)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.save();
  context.globalAlpha = 0.16;
  context.strokeStyle = "rgba(241, 239, 229, 0.18)";
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += 44) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.restore();

  context.save();
  context.globalAlpha = 0.12;
  context.fillStyle = stock.accent;
  context.beginPath();
  context.arc(width * 0.78, height * 0.18, Math.max(width, height) * 0.28, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawTerrain(
  context: CanvasRenderingContext2D,
  terrain: TerrainPoint[],
  height: number,
  stock: MarketRiderStock
) {
  context.save();
  context.lineJoin = "round";
  context.lineCap = "round";

  const area = context.createLinearGradient(0, 0, 0, height);
  area.addColorStop(0, `${stock.accent}33`);
  area.addColorStop(0.65, `${stock.accent}08`);
  area.addColorStop(1, "rgba(0, 0, 0, 0)");

  context.beginPath();
  terrain.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.lineTo(terrain[terrain.length - 1].x, height - 24);
  context.lineTo(terrain[0].x, height - 24);
  context.closePath();
  context.fillStyle = area;
  context.fill();

  context.shadowBlur = 18;
  context.shadowColor = stock.accent;
  context.strokeStyle = stock.accent;
  context.lineWidth = 3;
  context.beginPath();
  terrain.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.stroke();

  context.shadowBlur = 0;
  context.strokeStyle = "rgba(241, 239, 229, 0.22)";
  context.lineWidth = 1;
  context.beginPath();
  terrain.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y + 5);
    } else {
      context.lineTo(point.x, point.y + 5);
    }
  });
  context.stroke();

  context.restore();
}

function drawBike(
  context: CanvasRenderingContext2D,
  rider: RiderState,
  stock: MarketRiderStock
) {
  context.save();
  context.translate(rider.x, rider.y);
  context.rotate(rider.angle);
  context.lineCap = "round";
  context.lineJoin = "round";

  context.shadowBlur = 16;
  context.shadowColor = stock.accent;
  context.strokeStyle = "rgba(241, 239, 229, 0.95)";
  context.lineWidth = 2.2;

  context.beginPath();
  context.arc(-15, 10, 7, 0, Math.PI * 2);
  context.arc(17, 10, 7, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = stock.accent;
  context.lineWidth = 2.5;
  context.beginPath();
  context.moveTo(-15, 10);
  context.lineTo(-3, -4);
  context.lineTo(15, 10);
  context.lineTo(4, 10);
  context.lineTo(-3, -4);
  context.moveTo(1, -6);
  context.lineTo(12, -10);
  context.moveTo(12, -10);
  context.lineTo(20, -6);
  context.stroke();

  context.strokeStyle = "rgba(241, 239, 229, 0.86)";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(-2, -16, 4, 0, Math.PI * 2);
  context.moveTo(-1, -12);
  context.lineTo(4, -5);
  context.lineTo(11, -10);
  context.moveTo(3, -5);
  context.lineTo(-8, 3);
  context.stroke();

  context.restore();
}

function getCanvasContext(canvas: HTMLCanvasElement) {
  if (
    typeof navigator !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("jsdom")
  ) {
    return null;
  }

  try {
    return canvas.getContext("2d");
  } catch {
    return null;
  }
}

function formatScore(score: number) {
  return Math.max(0, Math.floor(score)).toLocaleString();
}

export function MarketRiderProject({ project }: { project: Project }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<Controls>({ ...initialControls });
  const riderRef = useRef<RiderState | null>(null);
  const [market, setMarket] = useState<MarketRiderMarket>("india");
  const marketStocks = useMemo(() => getStocksByMarket(market), [market]);
  const [ticker, setTicker] = useState(marketStocks[0].ticker);
  const selectedStock = marketStocks.find((stock) => stock.ticker === ticker) ?? marketStocks[0];
  const [runId, setRunId] = useState(0);
  const [score, setScore] = useState("0");
  const [status, setStatus] = useState("Ride the chart");
  const [isCrashed, setIsCrashed] = useState(false);

  useEffect(() => {
    if (!marketStocks.some((stock) => stock.ticker === ticker)) {
      setTicker(marketStocks[0].ticker);
    }
  }, [marketStocks, ticker]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = getCanvasContext(canvas);

    if (!context) {
      return undefined;
    }

    const canvasElement = canvas;
    const context2d = context;
    let animationFrame = 0;
    let lastTime = performance.now();
    let lastReadout = 0;
    let terrain = buildTerrain(selectedStock, 800, 360);
    const mood = moodStyles[selectedStock.mood];

    function measure() {
      const rect = canvasElement.getBoundingClientRect();
      const width = Math.max(320, Math.round(rect.width || canvasElement.clientWidth || 800));
      const height = Math.max(230, Math.round(rect.height || canvasElement.clientHeight || 360));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvasElement.width !== Math.round(width * dpr)) {
        canvasElement.width = Math.round(width * dpr);
        canvasElement.height = Math.round(height * dpr);
        context2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      terrain = buildTerrain(selectedStock, width, height);

      if (!riderRef.current) {
        riderRef.current = makeInitialRider(terrain);
      }

      return { width, height };
    }

    riderRef.current = null;
    setScore("0");
    setIsCrashed(false);
    setStatus(`${selectedStock.ticker}: ${moodCopy[selectedStock.mood].label}`);

    function frame(time: number) {
      const { width, height } = measure();
      const rider = riderRef.current ?? makeInitialRider(terrain);
      riderRef.current = rider;
      const dt = clamp(0, (time - lastTime) / 1000, 0.035);
      lastTime = time;

      if (!rider.crashed && !rider.completed) {
        const controls = controlsRef.current;
        const slopeAngle = terrainAngleAt(terrain, rider.x);
        const speedBoost = controls.boost ? 1.72 : 1;
        const speed = (width / 17.5) * mood.speed * speedBoost;

        rider.x += speed * dt;
        rider.score += speed * dt * 8 * moodCopy[selectedStock.mood].multiplier;

        if (controls.boost) {
          rider.boostChain = clamp(1, rider.boostChain + dt * 0.75, 4.5);
          rider.score += rider.boostChain * 18 * dt;
        } else {
          rider.boostChain = clamp(1, rider.boostChain - dt * 0.9, 4.5);
        }

        if (rider.grounded && controls.jump && !rider.jumpLatch) {
          rider.vy = -mood.jump;
          rider.grounded = false;
          rider.jumpLatch = true;
        }

        if (!controls.jump) {
          rider.jumpLatch = false;
        }

        const lean =
          (controls.leanForward ? 1 : 0) - (controls.leanBack ? 1 : 0);
        rider.angleVelocity += lean * 4.8 * dt;
        rider.vy += mood.gravity * dt;
        rider.y += rider.vy * dt;
        rider.angle += rider.angleVelocity * dt;
        rider.angleVelocity *= 0.92;

        const wheelBase = 16;
        const nextGroundY = terrainYAt(terrain, rider.x);

        if (rider.y >= nextGroundY - wheelBase && rider.vy >= -16) {
          const landingImpact = rider.vy;
          const angleDiff = Math.abs(rider.angle - slopeAngle);
          rider.y = nextGroundY - wheelBase;
          rider.vy = 0;

          if (!rider.grounded) {
            const cleanLanding = angleDiff < 0.58;
            rider.score += cleanLanding ? 120 + rider.airTime * 110 : 18;
            setStatus(cleanLanding ? "Clean landing" : "Heavy landing");
            rider.airTime = 0;
          }

          rider.grounded = true;
          rider.angle = rider.angle * 0.82 + slopeAngle * 0.18;

          if (angleDiff > 1.06 || landingImpact > 720) {
            rider.crashed = true;
            setIsCrashed(true);
            setStatus("Chart ate the landing");
          }
        } else {
          rider.grounded = false;
          rider.airTime += dt;
          rider.score += rider.airTime * 12 * dt;
        }

        if (Math.abs(rider.angle) > 1.75 || rider.y > height + 90) {
          rider.crashed = true;
          setIsCrashed(true);
          setStatus("Bike lost the line");
        }

        if (rider.x >= terrain[terrain.length - 1].x - 8) {
          rider.completed = true;
          rider.score += 600 * moodCopy[selectedStock.mood].multiplier;
          setStatus("Run cleared");
        }
      }

      drawBackground(context2d, width, height, selectedStock);
      drawTerrain(context2d, terrain, height, selectedStock);
      drawBike(context2d, rider, selectedStock);

      if (time - lastReadout > 160) {
        setScore(formatScore(rider.score));
        lastReadout = time;
      }

      animationFrame = window.requestAnimationFrame(frame);
    }

    animationFrame = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [runId, selectedStock]);

  useEffect(() => {
    function setControl(control: ControlKey, active: boolean) {
      controlsRef.current[control] = active;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        setControl("jump", true);
      }

      if (event.code === "ArrowRight") {
        setControl("boost", true);
      }

      if (event.code === "ArrowLeft") {
        setControl("leanBack", true);
      }

      if (event.code === "ArrowDown") {
        setControl("leanForward", true);
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code === "Space" || event.code === "ArrowUp") {
        setControl("jump", false);
      }

      if (event.code === "ArrowRight") {
        setControl("boost", false);
      }

      if (event.code === "ArrowLeft") {
        setControl("leanBack", false);
      }

      if (event.code === "ArrowDown") {
        setControl("leanForward", false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function setControl(control: ControlKey, active: boolean) {
    controlsRef.current[control] = active;
  }

  function restartRun() {
    controlsRef.current = { ...initialControls };
    setIsCrashed(false);
    setRunId((current) => current + 1);
  }

  const marketRiderStyle = {
    "--market-rider-accent": selectedStock.accent
  } as CSSProperties;

  return (
    <article
      aria-labelledby="market-rider-title"
      className="market-rider"
      id={project.slug}
      style={marketRiderStyle}
    >
      <div className="market-rider-head">
        <div>
          <p className="market-rider-kicker">02 / playable chart</p>
          <h2 id="market-rider-title">Market Rider</h2>
          <p>
            Ride a small motorcycle across static stock charts. No live prices,
            just a market-shaped toy for the Lab.
          </p>
        </div>
        <div className="market-rider-score" aria-live="polite">
          <span>score</span>
          <strong>{score}</strong>
          <small>{status}</small>
        </div>
      </div>

      <div className="market-rider-shell">
        <div className="market-rider-toolbar" aria-label="Market Rider controls">
          <div className="market-rider-market-toggle">
            {markets.map((marketOption) => (
              <button
                aria-label={`${marketOption.label} market`}
                aria-pressed={marketOption.id === market}
                className={marketOption.id === market ? "is-active" : ""}
                key={marketOption.id}
                onClick={() => setMarket(marketOption.id)}
                type="button"
              >
                {marketOption.label}
              </button>
            ))}
          </div>

          <label className="market-rider-select">
            <span>stock line</span>
            <select
              aria-label="Choose stock chart"
              onChange={(event) => setTicker(event.currentTarget.value)}
              value={selectedStock.ticker}
            >
              {marketStocks.map((stock) => (
                <option key={stock.ticker} value={stock.ticker}>
                  {stock.ticker} - {stock.name}
                </option>
              ))}
            </select>
          </label>

          <button
            className="market-rider-restart focus-ring"
            onClick={restartRun}
            type="button"
          >
            Restart run
          </button>
        </div>

        <div className={`market-rider-stage ${isCrashed ? "is-crashed" : ""}`}>
          <canvas
            aria-label="Market Rider game canvas"
            className="market-rider-canvas"
            ref={canvasRef}
          />
          <div className="market-rider-hud" aria-hidden="true">
            <span>{selectedStock.ticker}</span>
            <span>{moodCopy[selectedStock.mood].label}</span>
            <span>{moodCopy[selectedStock.mood].multiplier.toFixed(2)}x</span>
          </div>
        </div>

        <div className="market-rider-bottom">
          <div className="market-rider-copy">
            <b>{selectedStock.name}</b>
            <span>{selectedStock.description}</span>
            <em>{moodCopy[selectedStock.mood].handling}</em>
          </div>

          <div className="market-rider-keymap" aria-label="Desktop controls">
            <span>Space / Up: jump</span>
            <span>Right: boost</span>
            <span>Left / Down: balance</span>
          </div>
        </div>

        <div className="market-rider-touch" aria-label="Touch controls">
          <button
            onPointerCancel={() => setControl("leanBack", false)}
            onPointerDown={() => setControl("leanBack", true)}
            onPointerLeave={() => setControl("leanBack", false)}
            onPointerUp={() => setControl("leanBack", false)}
            type="button"
          >
            lean back
          </button>
          <button
            onClick={() => {
              setControl("jump", true);
              window.setTimeout(() => setControl("jump", false), 90);
            }}
            type="button"
          >
            jump
          </button>
          <button
            onPointerCancel={() => setControl("boost", false)}
            onPointerDown={() => setControl("boost", true)}
            onPointerLeave={() => setControl("boost", false)}
            onPointerUp={() => setControl("boost", false)}
            type="button"
          >
            boost
          </button>
          <button
            onPointerCancel={() => setControl("leanForward", false)}
            onPointerDown={() => setControl("leanForward", true)}
            onPointerLeave={() => setControl("leanForward", false)}
            onPointerUp={() => setControl("leanForward", false)}
            type="button"
          >
            lean forward
          </button>
        </div>
      </div>
    </article>
  );
}
