# Byte Banner — CTA Experiment Lab

Live ElevenLabs TTS docs with injectable CTA placement variants (Control, A–D) for conversion testing.

**Live demo:** [https://byte-banner-production.up.railway.app/](https://byte-banner-production.up.railway.app/)

**Whitepaper form sticky:** [https://byte-banner-production.up.railway.app/whitepaper](https://byte-banner-production.up.railway.app/whitepaper)

## Run locally

```bash
python3 server.py --port 8765
```

Open [http://127.0.0.1:8765/](http://127.0.0.1:8765/) for the docs CTA lab, or [http://127.0.0.1:8765/whitepaper](http://127.0.0.1:8765/whitepaper) for the whitepaper form.

Requires Python 3 and network access (proxies `elevenlabs.io` and injects the experiment UI).

## Deploy

Hosted on Railway from this GitHub repo (`Dockerfile` + `HOST`/`PORT` env). `render.yaml` is also included if you prefer Render.

## Variants

| ID | Placement |
|----|-----------|
| Control | No CTA |
| A | Above-the-fold banner under the H1 |
| B | Sticky bottom bar (dismissible) |
| C | Scroll-depth card after ~40% scroll |
| D | Inline before “Voice quality” |

Use the left **CTA Experiment Lab** panel to switch variants and Desktop / Mobile (390px) preview.

## Whitepaper lead form

The [live whitepaper](https://join.elevenlabs.io/whitepapers/enterprise-agent-operating-model) keeps the register form beside the cover. If that form is `position: sticky` on the hero row, two things go wrong:

1. **It docks under the scrolled header.** Sticky `top` is `0` / the nav height, so the form climbs into the title row.
2. **It unsticks at the end of the body/hero pair.** The form’s parent is only as tall as the cover+form row (and Framer stacks often use `overflow: clip`), so sticky cannot follow the “In this white paper, you'll learn how to:” section.

**Proposed:** keep sticky on scroll, but pin the **top of the form** to the **top of the body area** — the rest position of that heading, just below the header + the details section padding. Do this in Framer:

1. Put the cover, the details copy, and the form in **one** horizontal stack / grid. Left column = cover then “In this white paper…”. Right column = form.
2. Set the form to **Sticky**. Set **Top** to `header height + details padding` (about 148px on desktop), **not** `0` and not flush to the nav.
3. Set **Overflow** to **Visible** on every ancestor of that stack. `clip` / `hidden` kills sticky.
4. Make the left column taller than the form (include the bullets, plus a short spacer if the copy is shorter than the form) so sticky has room to travel. Unpin naturally when the next section (footer CTA) reaches the form.
5. If the form is taller than the remaining viewport, set `max-height: calc(100vh - top)` and overflow-y auto so the **top** of the form stays on the pin line.

The `/whitepaper` lab toggles **Current** (sticky to header, trapped in the hero pair) vs **Proposed** (pin to the body heading).
