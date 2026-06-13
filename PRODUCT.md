# PRODUCT.md - Jay Gupta Personal Site

## What This Is
A personal site for Jay Gupta. It works as a hub: a striking intro, a clear sense of who he is, and direct routes out to his YouTube channels, projects, LinkedIn, Substack, and email. Static, no backend.

## Who It's For
Anyone Jay sends the link to: recruiters and founders, potential collaborators, and viewers who want to find all his work in one place.

## Primary Goal
Make it obvious in ten seconds who Jay is and what he makes, then route the visitor to the right channel, project, or profile in one click. The YouTube channels are the priority destination.

## Home Sections
1. Hero - name, one-line positioning, social quick-links, and primary CTA.
2. Work - the YouTube channels and channel media.
3. The Loop - what Jay watches, listens to, and reads.
4. Connect - outbound links for YouTube, LinkedIn, Substack, and email.

## Separate Pages
- About - the longer personal story, in his voice.
- Projects - "Side Projects", a Lab index reached from the top nav.

## Hero
- Name: Jay Gupta.
- Description: "I build across content, operations, and AI tooling. I take systems apart and ship something useful on top."
- Asterisk footnote: "still reverse engineering the systems".
- Primary CTA: "See the work" scrolls to Work.

## About
The About page explains the non-linear path: UPSC, YouTube, finance explainers, founder's office work, and practical AI systems.

## Work
One card per real channel. Flagship is the finance channel. The flagship card uses local 16:9 video with readable foreground copy layered over the media. For noRupaiyaa, expose separate Home and Shorts links. Avoid stat-padding and placeholder cards.

## The Loop
A watch, listen, read section. The YouTube list is maintained in `src/youtube-recommended.json`, with build-time oEmbed metadata baked into `src/generated/the-loop.json`.

## Projects
Projects live under the Lab route, not as a home-page section. `/projects` is the Lab index titled "Side Projects". Each individual experiment has its own page, such as `/projects/life-in-weeks` and `/projects/market-rider`. The top nav Lab item links to `/projects` and exposes a dropdown generated from the same project list.

## Connect
Outbound buttons:
- LinkedIn: https://www.linkedin.com/in/jaygupta2000
- YouTube: flagship channel
- Substack: URL pending
- Email: jay.gupta904@gmail.com, if public

## Success Criteria
- Loads fast, no layout shift, works cleanly on a phone.
- Every outbound link works and opens in a new tab.
- Reads premium and personal, not like a template.
- Content is easy to swap from typed data files, not buried in markup.

## Non-Goals
No CMS, no backend, no auth, no analytics for now. No blog engine; writing lives on Substack.
