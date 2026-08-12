# Byte Banner — CTA Experiment Lab

Live ElevenLabs TTS docs with injectable CTA placement variants (Control, A–D) for conversion testing — plus **ElevenAPI landing archetype experiment pages** matched to the join.elevenlabs.io design language.

**Live demo:** [https://byte-banner-production.up.railway.app/](https://byte-banner-production.up.railway.app/)

**API LP experiments:** [https://byte-banner-production.up.railway.app/experiments/](https://byte-banner-production.up.railway.app/experiments/)

## Run locally

```bash
python3 server.py --port 8765
```

Open:

- [http://127.0.0.1:8765/](http://127.0.0.1:8765/) — docs CTA placement lab
- [http://127.0.0.1:8765/experiments/](http://127.0.0.1:8765/experiments/) — 20 landing archetype prototypes

Requires Python 3 and network access (proxies `elevenlabs.io` for the docs lab).

## Deploy

Hosted on Railway from this GitHub repo (`Dockerfile` + `HOST`/`PORT` env). `render.yaml` is also included if you prefer Render.

## Docs CTA variants

| ID | Placement |
|----|-----------|
| Control | No CTA |
| A | Above-the-fold banner under the H1 |
| B | Sticky bottom bar (dismissible) |
| C | Scroll-depth card after ~40% scroll |
| D | Inline before “Voice quality” |

Use the left **CTA Experiment Lab** panel to switch variants and Desktop / Mobile (390px) preview.

## ElevenAPI landing archetypes

Experiment briefs: [docs/elevenapi-landing-archetype-experiment-matrix.md](docs/elevenapi-landing-archetype-experiment-matrix.md)

**20 HTML prototypes** (design tokens from the Framer source LPs: KMR Waldenburg, Inter, off-white/ink palette, coral accent):

| Product | Q1 | Q2 | UD | D |
|---------|----|----|----|---|
| developer-api | `/experiments/developer-api/q1` | `…/q2` | `…/ud` | `…/d` |
| voice-design | `/experiments/voice-design/q1` | … | … | … |
| speech-to-text | `/experiments/speech-to-text/q1` | … | … | … |
| conversational-ai | `/experiments/conversational-ai/q1` | … | … | … |
| dubbing-translation | `/experiments/dubbing-translation/q1` | … | … | … |

Aliases also work: `/api/{product}/q1` (etc.).

Regenerate pages after content edits:

```bash
python3 scripts/generate_experiments.py
```
