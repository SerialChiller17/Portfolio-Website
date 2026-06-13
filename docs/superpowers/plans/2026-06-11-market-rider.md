# Market Rider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static canvas mini-game where visitors ride a small motorcycle across stock-chart terrain in the Lab page.

**Architecture:** Add local stock chart data and pure helpers in `src/marketRiderData.ts`. Add `src/sections/MarketRiderProject.tsx` for the React UI, input handling, and canvas loop. Wire the project into `src/data.ts`, `src/sections/Projects.tsx`, CSS, and tests.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind/CSS, Vitest, Testing Library, HTML canvas.

---

### Task 1: Tests And Data Contract

**Files:**
- Modify: `src/App.test.tsx`
- Create: `src/marketRiderData.ts`

- [ ] **Step 1: Write failing tests**

Add tests that expect the Lab nav to include Market Rider, `/projects` to render the game, and the stock universe to include 10 India and 10 USA charts with at least 24 points each.

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm test -- src/App.test.tsx`

Expected: tests fail because `marketRiderStocks` and Market Rider UI do not exist yet.

- [ ] **Step 3: Add stock data and pure helpers**

Create `src/marketRiderData.ts` with `MarketRiderStock`, `MarketMood`, `marketRiderStocks`, `getStocksByMarket`, and `getStockByTicker`.

- [ ] **Step 4: Run the targeted tests**

Run: `npm test -- src/App.test.tsx`

Expected: data import passes, UI tests still fail until the component is wired.

### Task 2: Project Wiring

**Files:**
- Modify: `src/data.ts`
- Modify: `src/sections/Projects.tsx`
- Create: `src/sections/MarketRiderProject.tsx`

- [ ] **Step 1: Extend project type**

Allow `Project.kind` to include `"market-rider"`.

- [ ] **Step 2: Add project entry**

Add a `Market Rider` project with slug `market-rider`, tags `finance`, `canvas`, and `game`, and icon `chart`.

- [ ] **Step 3: Render the component**

Update `Projects.tsx` to render `MarketRiderProject` when `project.kind === "market-rider"`.

- [ ] **Step 4: Add minimal component shell**

Create a component with stock selectors, score labels, restart button, desktop help, mobile controls, and a canvas element.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/App.test.tsx`

Expected: new Market Rider UI tests pass.

### Task 3: Canvas Game Loop

**Files:**
- Modify: `src/sections/MarketRiderProject.tsx`

- [ ] **Step 1: Add terrain generation**

Normalize stock points into canvas coordinates with margins and interpolation.

- [ ] **Step 2: Add bike physics**

Implement auto-forward velocity, terrain collision, jump, boost, lean, crash detection, scoring, and restart.

- [ ] **Step 3: Add keyboard, pointer, and touch controls**

Bind controls while the component is mounted. Keep per-frame values in refs.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/App.test.tsx`

Expected: tests pass.

### Task 4: Styling And Verification

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add Market Rider CSS**

Style the game as a full-width Projects artifact with responsive controls, no nested cards, stable canvas aspect ratio, and no horizontal overflow.

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: TypeScript and Vite build pass.

- [ ] **Step 3: Browser verify**

Run a local server and inspect `/projects#market-rider` at desktop and mobile widths. Confirm canvas is nonblank, controls are reachable, and layout does not overflow.
