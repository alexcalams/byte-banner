# Byte Banner — CTA Experiment Lab

Live ElevenLabs TTS docs with injectable CTA placement variants (Control, A–D) for conversion testing.

**Live demo:** [https://byte-banner-production.up.railway.app/](https://byte-banner-production.up.railway.app/)

## Run locally

```bash
python3 server.py --port 8765
```

Open [http://127.0.0.1:8765/](http://127.0.0.1:8765/).

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

## ElevenAPI landing archetypes

Experiment briefs for quickstart / pass-through and user-driven vs disruptive variants (paired with the live playground-first join.elevenlabs.io API LPs) live in:

[docs/elevenapi-landing-archetype-experiment-matrix.md](docs/elevenapi-landing-archetype-experiment-matrix.md)
