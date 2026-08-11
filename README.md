# Byte Banner — CTA Experiment Lab

Live ElevenLabs TTS docs with injectable CTA placement variants (Control, A–D) for conversion testing.

## Run locally

```bash
python3 server.py --port 8765
```

Open [http://127.0.0.1:8765/](http://127.0.0.1:8765/).

Requires Python 3 and network access (proxies `elevenlabs.io` and injects the experiment UI).

## Variants

| ID | Placement |
|----|-----------|
| Control | No CTA |
| A | Above-the-fold banner under the H1 |
| B | Sticky bottom bar (dismissible) |
| C | Scroll-depth card after ~40% scroll |
| D | Inline before “Voice quality” |

Use the left **CTA Experiment Lab** panel to switch variants and Desktop / Mobile (390px) preview.
