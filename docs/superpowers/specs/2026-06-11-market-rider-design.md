# Market Rider Design

## Goal

Add a playful Labs project where visitors ride a small motorcycle across static line charts for selected India and USA stocks. The feature should feel like a polished personal-site experiment, not a full trading simulator.

## Product Fit

The site is static and portfolio-led. Market Rider belongs on `/projects` under the Lab navigation, alongside Life in Weeks. It should reinforce Jay's finance/channel context while staying light, fast, and fun.

## Experience

The player chooses a market and stock, then rides a bike from left to right over the stock chart. The chart is the terrain. The bike auto-advances so laptop and mobile players do not need precise steering.

Controls:
- Desktop: Space or ArrowUp jumps, ArrowRight boosts, ArrowLeft leans back, ArrowDown leans forward.
- Mobile: large touch buttons for jump, boost, and balance.
- Restart resets score and bike position on the selected stock.

Scoring:
- Distance increases score.
- Air time and clean landings add bonuses.
- Boost chains add a temporary multiplier.
- Crashes occur when the bike lands with an extreme angle or falls below the terrain.

Small addition:
- Each stock has a market mood: steady, volatile, breakout, or crashy.
- Mood changes difficulty and scoring. Volatile and breakout charts produce bigger jumps and higher multipliers. Steady charts are easier and score lower.

## Data

No live market data is required. Store static normalized chart series in a TypeScript file. Include 10 India options and 10 USA options. Each chart has ticker, company name, market, mood, accent color, seed-like price points, and a brief description.

## Architecture

Create a focused `MarketRiderProject` React component for UI and canvas ownership. Keep chart definitions and pure helpers in a separate data/model file so tests can cover stock lists, terrain generation, and scoring-friendly metadata without rendering canvas.

The canvas loop uses `requestAnimationFrame`, a capped device pixel ratio, precomputed terrain points, simple physics, and event listeners scoped to the component. React state should update only for coarse UI values like selected stock, run status, score readout, and crash state.

## Visual Direction

Dark cinematic arcade, matching the current Projects page. The chart should be a luminous line over a matte black plotting field. The bike can be a simple drawn silhouette with wheels, frame, and rider linework. Avoid heavy image assets.

## Accessibility And Performance

Provide button controls with clear labels, keyboard support, and touch support. Respect reduced motion by keeping the game playable but less animated: lower camera shake, no particle burst, and simpler idle motion.

Performance target:
- No backend, no live fetches.
- Canvas only draws the visible chart and rider each frame.
- Cap DPR at 2.
- Avoid per-frame React state updates.

## Tests

Add tests that verify:
- Market Rider appears in the Lab nav and Projects page.
- Stock universe includes 10 India and 10 USA stocks.
- Each stock has enough points to generate terrain.
- The selected stock controls render and restart control is present.

## Non-Goals

No real-time market data, trading advice, accounts, leaderboards, backend storage, or external physics engine.
