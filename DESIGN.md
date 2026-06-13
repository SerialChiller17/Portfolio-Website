# DESIGN.md - Jay Gupta Personal Site

## Aesthetic
Dark, moody, cinematic. Bright off-white text over flat blacks. Generous space, large display type, subtle grain, and a personal tone. Premium, not corporate.

## Fonts
Load Google Fonts in `index.html`:
- Almarai - global default.
- Instrument Serif - italic accent text.
- Hanken Grotesk and IBM Plex Mono - used inside The Loop section.

Global default:
`Almarai, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`.

Tailwind tokens:
- `colors.primary`: `#F1EFE5`
- `colors.cream`: `#F1EFE5`
- `fontFamily.serif`: `"Instrument Serif", serif`

## Color System
- Background: `#000000` global.
- Panels: `#101010`.
- Cards: `#212121`.
- Primary text: `#F1EFE5`.
- Secondary text: gray utilities (`text-gray-400`, `text-gray-500`) and `text-primary` opacity variants.
- Navbar link: `rgba(241, 239, 229, 0.8)`, hover `#F1EFE5`.

## Navigation
- Fixed top nav with Jay Gupta wordmark.
- Items: About, Work, Projects, Writing, Connect.
- About routes to `/about`.
- Work and Connect scroll on the home page.
- Projects routes to `/projects`.
- Projects also has a dropdown menu populated from the project list in `src/data.ts`.
- On mobile, the dropdown appears nested under Projects inside the opened nav menu.

## Hero
- Full-bleed first viewport.
- Background video with scrim, vignette, subtle noise, and bottom-aligned content.
- Giant "Jay Gupta" display title.
- Supporting copy and CTA remain compact and readable on phones.

## Work
- Home-page section for YouTube channels.
- Flagship channel uses local 16:9 video without crop mismatch.
- noMaaya uses short-form previews.
- No stat padding, no fake metrics, no placeholder channel cards.
- Do not add decorative or automatic numbers to short grids unless the number itself carries meaning.

## The Loop
- Home-page section.
- Headline: "You can tell a lot about a man by what he watches, what he listens to, and what he reads. Here is mine."
- Watch: horizontal 35mm film strip, keyboard-accessible YouTube frames, build-time thumbnails and metadata.
- Listen: spinning vinyl and tracklist.
- Read: tilted dispatch card.
- Song lists, short lists, and book lists should not show numbers by default. Add numbering only when order or rank is meaningful.
- Motion respects `prefers-reduced-motion`.

## Projects
- Separate Lab area, not a home-page section.
- `/projects` is the Lab index named "Side Projects."
- Each Lab project has its own route, for example `/projects/life-in-weeks` and `/projects/market-rider`.
- "Life in Weeks" is an interactive map where each square is one week.
- "Market Rider" is a lightweight canvas game where a motorcycle rides static stock-chart terrain.
- Project entries are driven from `src/data.ts`; the Projects nav dropdown is generated from that same list.
- Project cards may include optional icon, title, description, proof, tags, and view link. Full interactive projects render on their own pages instead of inside the shelf.

## Connect
- Footer section with large pill buttons.
- Keep unavailable destinations out of rendered links until real URLs exist.

## Responsive
- Home, About, and Projects must pass the responsive audit across phone, tablet, laptop, and desktop viewports.
- No horizontal document overflow.
- No nested vertical scrollbars.
- Text must not spill or clip.

## Implementation Note
Keep editable content in typed data files, primarily `src/data.ts` and `src/youtube-recommended.json`, so future changes do not require digging through markup.
