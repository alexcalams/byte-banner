#!/usr/bin/env python3
"""Generate all 20 ElevenAPI landing archetype experiment pages."""

from __future__ import annotations

import html
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "experiments"

API_KEYS = "https://elevenlabs.io/app/developers/api-keys"
SIGNUP = "https://elevenlabs.io/app/sign-up"
DOCS = "https://elevenlabs.io/docs"
SALES = "https://elevenlabs.io/contact-sales"
DUBBING_APP = "https://elevenlabs.io/app/dubbing"
AGENTS_APP = "https://elevenlabs.io/app/conversational-ai"

PRODUCTS = {
    "dev": {
        "slug": "developer-api",
        "eyebrow": "ElevenAPI",
        "title_suffix": "ElevenAPI for Developers",
        "control": "https://join.elevenlabs.io/api/developer-api",
    },
    "vd": {
        "slug": "voice-design",
        "eyebrow": "Voice Design API",
        "title_suffix": "Voice Design API",
        "control": "https://join.elevenlabs.io/api/voice-design",
    },
    "stt": {
        "slug": "speech-to-text",
        "eyebrow": "Speech to Text API",
        "title_suffix": "Speech to Text API",
        "control": "https://join.elevenlabs.io/api/speech-to-text",
    },
    "cai": {
        "slug": "conversational-ai",
        "eyebrow": "Conversational Agents API",
        "title_suffix": "Conversational AI API",
        "control": "https://join.elevenlabs.io/api/conversational-ai",
    },
    "dub": {
        "slug": "dubbing-translation",
        "eyebrow": "Dubbing API",
        "title_suffix": "Dubbing API",
        "control": "https://join.elevenlabs.io/api/dubbing-translation",
    },
}


def cta(product: str, variant_id: str, archetype: str, base: str = API_KEYS, **extra: str) -> str:
    from urllib.parse import urlencode

    params = {
        "utm_source": "paid",
        "utm_medium": "cpc",
        "utm_campaign": f"elevenapi_{product}",
        "utm_content": variant_id,
        "archetype": archetype,
        "product": product,
        "variant_id": variant_id,
        **extra,
    }
    return f"{base}?{urlencode(params)}"


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def shell(title: str, variant_id: str, body_class: str, body: str, extra_head: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{esc(title)}</title>
  <meta name="robots" content="noindex,nofollow" />
  <meta name="description" content="ElevenAPI experiment variant {esc(variant_id)}" />
  <link rel="icon" href="https://framerusercontent.com/images/7vs1s1ajFSteWsEkM5sFsuDeU.png" />
  <link rel="stylesheet" href="/experiments/shared/design.css" />
  {extra_head}
</head>
<body class="{body_class}" data-variant="{esc(variant_id)}">
{body}
  <div class="variant-tag" aria-hidden="true">{esc(variant_id)}</div>
  <script src="/experiments/shared/app.js" defer></script>
</body>
</html>
"""


def nav(escape_label: str | None = None, escape_href: str | None = None, minimal: bool = False) -> str:
    right = '<a class="nav-link" href="https://elevenlabs.io/docs" target="_blank" rel="noopener">Docs</a>'
    if escape_label and escape_href:
        right = f'<a class="nav-escape" href="{esc(escape_href)}">{esc(escape_label)}</a>'
    if minimal:
        return f"""
  <header class="nav">
    <div class="nav-inner">
      <a class="brand" href="https://elevenlabs.io" target="_blank" rel="noopener">
        <span class="brand-mark">11</span> ElevenLabs
      </a>
      <div class="nav-links">{right}</div>
    </div>
  </header>
"""
    return f"""
  <header class="nav">
    <div class="nav-inner">
      <a class="brand" href="/experiments/" >
        <span class="brand-mark">11</span> ElevenLabs
      </a>
      <div class="nav-links">
        <a class="nav-link" href="/experiments/">Experiments</a>
        {right}
      </div>
    </div>
  </header>
"""


def code_shell(install: str, panels: list[tuple[str, str, str]], default: str) -> str:
    tabs = []
    bodies = []
    for key, label, code in panels:
        tabs.append(
            f'<button type="button" class="code-tab" data-tab="{esc(key)}" aria-selected="{str(key == default).lower()}">{esc(label)}</button>'
        )
        hidden = "hidden" if key != default else ""
        bodies.append(f'<pre class="code-panel" data-panel="{esc(key)}" {hidden}>{code}</pre>')
    return f"""
      <div class="code-shell">
        <div class="code-toolbar">
          <div class="code-tabs">{''.join(tabs)}</div>
          <button type="button" class="code-copy">Copy</button>
        </div>
        <p class="code-install">{esc(install)}</p>
        {''.join(bodies)}
      </div>
"""


def sticky(label: str, href: str, note: str = "10K free credits · no credit card") -> str:
    return f"""
  <div class="sticky-cta" data-reveal-at="320">
    <span>{esc(note)}</span>
    <a class="btn" href="{esc(href)}">{esc(label)}</a>
  </div>
"""


def footer_mini() -> str:
    return """
  <footer class="footer-mini">
    <div class="wrap">
      <span>Experiment prototype · design language matched to join.elevenlabs.io</span>
      <span>
        <a href="https://elevenlabs.io/privacy-policy" target="_blank" rel="noopener">Privacy</a>
        ·
        <a href="https://elevenlabs.io/terms-of-use" target="_blank" rel="noopener">Terms</a>
      </span>
    </div>
  </footer>
"""


QUOTE = (
    "Voices that sound natural and emotionally rich, backed by an API that’s solid and dependable.",
    "Cankut Kostur · Sr. Engineer, Codeway",
)

SNIPPETS = {
    "dev": {
        "install": "pip install elevenlabs   # or: npm i elevenlabs",
        "default": "curl",
        "panels": [
            (
                "curl",
                "cURL",
                """<span class="c-cm"># streamed audio, ~75 ms to first byte</span>
curl -X POST <span class="c-str">"https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb"</span> \\
  -H <span class="c-str">"xi-api-key: $ELEVENLABS_API_KEY"</span> \\
  -H <span class="c-str">"Content-Type: application/json"</span> \\
  -d <span class="c-str">'{"text":"Your platform just found its voice.","model_id":"eleven_flash_v2_5"}'</span> \\
  --output speech.mp3""",
            ),
            (
                "python",
                "Python",
                """<span class="c-key">from</span> elevenlabs <span class="c-key">import</span> ElevenLabs
client = ElevenLabs(api_key=<span class="c-str">"sk_..."</span>)
audio = client.text_to_speech.<span class="c-fn">convert</span>(
    voice_id=<span class="c-str">"JBFqnCBsd6RMkjVDRZzb"</span>,
    model_id=<span class="c-str">"eleven_flash_v2_5"</span>,
    text=<span class="c-str">"Your platform just found its voice."</span>,
)""",
            ),
            (
                "node",
                "Node",
                """<span class="c-key">import</span> { ElevenLabsClient } <span class="c-key">from</span> <span class="c-str">"elevenlabs"</span>;
<span class="c-key">const</span> client = <span class="c-key">new</span> ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
<span class="c-key">const</span> audio = <span class="c-key">await</span> client.textToSpeech.<span class="c-fn">convert</span>(<span class="c-str">"JBFqnCBsd6RMkjVDRZzb"</span>, {
  text: <span class="c-str">"Your platform just found its voice."</span>,
  modelId: <span class="c-str">"eleven_flash_v2_5"</span>,
});""",
            ),
        ],
    },
    "vd": {
        "install": "pip install elevenlabs",
        "default": "python",
        "panels": [
            (
                "python",
                "Python",
                """<span class="c-key">from</span> elevenlabs <span class="c-key">import</span> ElevenLabs
client = ElevenLabs(api_key=<span class="c-str">"sk_..."</span>)
previews = client.text_to_voice.<span class="c-fn">design</span>(
    voice_description=<span class="c-str">"Confident Indian male, stern but energetic"</span>,
    text=<span class="c-str">"Your platform just found its voice."</span>,
)  <span class="c-cm"># audition, then save the voice_id</span>""",
            ),
            (
                "curl",
                "cURL",
                """curl -X POST <span class="c-str">"https://api.elevenlabs.io/v1/text-to-voice"</span> \\
  -H <span class="c-str">"xi-api-key: $ELEVENLABS_API_KEY"</span> \\
  -H <span class="c-str">"Content-Type: application/json"</span> \\
  -d <span class="c-str">'{"voice_description":"Warm mid-30s female narrator","text":"Your platform just found its voice."}'</span>""",
            ),
            (
                "node",
                "Node",
                """<span class="c-key">import</span> { ElevenLabsClient } <span class="c-key">from</span> <span class="c-str">"elevenlabs"</span>;
<span class="c-key">const</span> client = <span class="c-key">new</span> ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
<span class="c-key">const</span> previews = <span class="c-key">await</span> client.textToVoice.<span class="c-fn">design</span>({
  voiceDescription: <span class="c-str">"Bubbly young female with a dynamic accent"</span>,
  text: <span class="c-str">"Your platform just found its voice."</span>,
});""",
            ),
        ],
    },
    "stt": {
        "install": "pip install elevenlabs",
        "default": "python",
        "panels": [
            (
                "python",
                "Python",
                """<span class="c-key">from</span> elevenlabs <span class="c-key">import</span> ElevenLabs
client = ElevenLabs(api_key=<span class="c-str">"sk_..."</span>)
transcript = client.speech_to_text.<span class="c-fn">convert</span>(
    model_id=<span class="c-str">"scribe_v1"</span>,
    file=<span class="c-fn">open</span>(<span class="c-str">"meeting.mp3"</span>, <span class="c-str">"rb"</span>),
    diarize=<span class="c-key">True</span>,
)  <span class="c-cm"># text, timestamps, speaker labels</span>""",
            ),
            (
                "curl",
                "cURL",
                """curl -X POST <span class="c-str">"https://api.elevenlabs.io/v1/speech-to-text"</span> \\
  -H <span class="c-str">"xi-api-key: $ELEVENLABS_API_KEY"</span> \\
  -F model_id=<span class="c-str">"scribe_v1"</span> \\
  -F diarize=true \\
  -F file=@meeting.mp3""",
            ),
            (
                "node",
                "Node",
                """<span class="c-key">import</span> { ElevenLabsClient } <span class="c-key">from</span> <span class="c-str">"elevenlabs"</span>;
<span class="c-key">import</span> fs <span class="c-key">from</span> <span class="c-str">"fs"</span>;
<span class="c-key">const</span> client = <span class="c-key">new</span> ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
<span class="c-key">const</span> transcript = <span class="c-key">await</span> client.speechToText.<span class="c-fn">convert</span>({
  modelId: <span class="c-str">"scribe_v1"</span>,
  file: fs.createReadStream(<span class="c-str">"meeting.mp3"</span>),
  diarize: true,
});""",
            ),
        ],
    },
    "cai": {
        "install": "pip install elevenlabs",
        "default": "python",
        "panels": [
            (
                "python",
                "Python",
                """<span class="c-key">from</span> elevenlabs <span class="c-key">import</span> ElevenLabs
client = ElevenLabs(api_key=<span class="c-str">"sk_..."</span>)
agent = client.conversational_ai.agents.<span class="c-fn">create</span>(
    name=<span class="c-str">"Support agent"</span>,
    conversation_config={
        <span class="c-str">"agent"</span>: {<span class="c-str">"prompt"</span>: {<span class="c-str">"prompt"</span>: <span class="c-str">"You are a friendly support agent."</span>}},
        <span class="c-str">"tts"</span>: {<span class="c-str">"voice_id"</span>: <span class="c-str">"JBFqnCBsd6RMkjVDRZzb"</span>},
    },
)  <span class="c-cm"># then connect over WebSocket for live audio</span>""",
            ),
            (
                "curl",
                "cURL",
                """curl -X POST <span class="c-str">"https://api.elevenlabs.io/v1/convai/agents/create"</span> \\
  -H <span class="c-str">"xi-api-key: $ELEVENLABS_API_KEY"</span> \\
  -H <span class="c-str">"Content-Type: application/json"</span> \\
  -d <span class="c-str">'{"name":"Support agent","conversation_config":{"agent":{"prompt":{"prompt":"You are a friendly support agent."},"tts":{"voice_id":"JBFqnCBsd6RMkjVDRZzb"}}'</span>""",
            ),
            (
                "node",
                "Node",
                """<span class="c-key">import</span> { ElevenLabsClient } <span class="c-key">from</span> <span class="c-str">"elevenlabs"</span>;
<span class="c-key">const</span> client = <span class="c-key">new</span> ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
<span class="c-key">const</span> agent = <span class="c-key">await</span> client.conversationalAi.agents.<span class="c-fn">create</span>({
  name: <span class="c-str">"Support agent"</span>,
  conversationConfig: {
    agent: { prompt: { prompt: <span class="c-str">"You are a friendly support agent."</span> } },
    tts: { voiceId: <span class="c-str">"JBFqnCBsd6RMkjVDRZzb"</span> },
  },
});""",
            ),
        ],
    },
    "dub": {
        "install": "# SDK: pip install elevenlabs",
        "default": "curl",
        "panels": [
            (
                "curl",
                "cURL",
                """curl -X POST <span class="c-str">"https://api.elevenlabs.io/v1/dubbing"</span> \\
  -H <span class="c-str">"xi-api-key: $ELEVENLABS_API_KEY"</span> \\
  -F target_lang=<span class="c-str">"es"</span> \\
  -F file=@source.mp4
<span class="c-cm"># returns dubbing_id — poll status, then download</span>""",
            ),
            (
                "python",
                "Python",
                """<span class="c-key">from</span> elevenlabs <span class="c-key">import</span> ElevenLabs
client = ElevenLabs(api_key=<span class="c-str">"sk_..."</span>)
dub = client.dubbing.<span class="c-fn">create</span>(
    file=<span class="c-fn">open</span>(<span class="c-str">"source.mp4"</span>, <span class="c-str">"rb"</span>),
    target_lang=<span class="c-str">"es"</span>,
)  <span class="c-cm"># poll dubbing_id, then download</span>""",
            ),
            (
                "node",
                "Node",
                """<span class="c-key">import</span> { ElevenLabsClient } <span class="c-key">from</span> <span class="c-str">"elevenlabs"</span>;
<span class="c-key">import</span> fs <span class="c-key">from</span> <span class="c-str">"fs"</span>;
<span class="c-key">const</span> client = <span class="c-key">new</span> ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
<span class="c-key">const</span> dub = <span class="c-key">await</span> client.dubbing.<span class="c-fn">create</span>({
  file: fs.createReadStream(<span class="c-str">"source.mp4"</span>),
  targetLang: <span class="c-str">"ja"</span>,
});""",
            ),
        ],
    },
}

Q1 = {
    "dev": {
        "h1": "Ship voice AI in one request",
        "lede": "Get your free API key and make a production TTS call in under a minute. 10K credits, no credit card.",
        "cta": "Get your free API key",
    },
    "vd": {
        "h1": "Describe a voice. Get an ownable voice ID.",
        "lede": "Text prompt in → brand-new voice out. Serve it on every ElevenAPI surface. 10K free credits.",
        "cta": "Get your free API key",
    },
    "stt": {
        "h1": "Hosted Scribe. No Whisper cluster.",
        "lede": "Near-perfect STT in 90+ languages — realtime or batch — without self-hosting. 10K free credits.",
        "cta": "Get your free API key",
    },
    "cai": {
        "h1": "Create a voice agent, then connect the socket",
        "lede": "One create call for turn-taking, interruptions, and realtime voice on your LLM. 10K free credits.",
        "cta": "Get your free API key",
    },
    "dub": {
        "h1": "One POST. 90+ language dubs.",
        "lede": "Translate and re-voice video in one call — speaker identity, timing, and tone preserved. 10K free credits.",
        "cta": "Get your free API key",
    },
}

Q2 = {
    "dev": {
        "h1": "Your first ElevenAPI call, step by step",
        "lede": "Sign up, grab a key, paste four lines, hear audio. 10K free credits.",
        "cta": "Get 10K free credits",
        "steps": [
            ("Create account", "Sign up free — no credit card.", "Join free", "signup"),
            ("Copy API key", "Generate a key from the developers dashboard.", "Get API key", "keys"),
            ("Paste this snippet", "Install the SDK and make your first TTS call.", None, "snippet"),
            ("Hear the result", "Play speech.mp3 — first audio in ~75ms with Flash.", "Open docs", "docs"),
        ],
    },
    "vd": {
        "h1": "Design a brand voice in four steps",
        "lede": "From text description to reusable voice_id you own.",
        "cta": "Get your free API key",
        "steps": [
            ("Create account", "Sign up free — no credit card.", "Join free", "signup"),
            ("Copy API key", "Generate a key from the developers dashboard.", "Get API key", "keys"),
            ("Describe & design", "Paste a voice description into text_to_voice.design.", None, "snippet"),
            ("Save & speak", "Keep the voice_id, then call TTS with it everywhere.", "Open docs", "docs"),
        ],
    },
    "stt": {
        "h1": "Transcribe your first file in minutes",
        "lede": "Upload audio, get text + speakers + timestamps. Optional realtime path.",
        "cta": "Get your free API key",
        "steps": [
            ("Create account", "Sign up free — no credit card.", "Join free", "signup"),
            ("Copy API key", "Generate a key from the developers dashboard.", "Get API key", "keys"),
            ("Upload a sample", "Send a meeting file with diarize=True.", None, "snippet"),
            ("Read the transcript", "Get text, word timestamps, speaker labels — or branch to realtime WS.", "Realtime docs", "docs"),
        ],
    },
    "cai": {
        "h1": "Live agent in four steps",
        "lede": "Create → voice → WebSocket → talk. Your LLM stays yours.",
        "cta": "Open Agents & get API key",
        "steps": [
            ("Create account", "Sign up free — no credit card.", "Join free", "signup"),
            ("Create an agent", "One agents.create call (or use the Agents dashboard).", "Open Agents", "agents"),
            ("Pick a voice", "Attach a library or custom voice_id.", None, "snippet"),
            ("Connect & talk", "Open the WebSocket loop and speak live.", "Open docs", "docs"),
        ],
    },
    "dub": {
        "h1": "Localize a video in three API steps",
        "lede": "Send file → set languages → pull finished dubs. No ASR/TTS glue.",
        "cta": "Get your free API key",
        "steps": [
            ("Create account", "Sign up free — no credit card.", "Join free", "signup"),
            ("Send a file or URL", "POST video/audio to the dubbing endpoint.", "Get API key", "keys"),
            ("Set target languages", "Pass one or more of 90+ languages.", None, "snippet"),
            ("Pull finished dubs", "Poll dubbing_id or webhook — speaker identity preserved.", "Open dubbing", "dubbing"),
        ],
    },
}

UD = {
    "dev": {
        "h1": "What are you building with voice?",
        "lede": "Pick a path — we’ll send you to the right quickstart. Or grab a key now.",
        "intents": [
            ("Text-to-speech app", "Lifelike speech in 70+ languages", f"{DOCS}/api-reference/text-to-speech/convert"),
            ("Realtime voice agent", "Turn-taking agents on your LLM", f"{DOCS}/agents-platform/overview"),
            ("Transcription", "Scribe STT with diarization", f"{DOCS}/api-reference/speech-to-text/convert"),
            ("Video localization", "Dubbing across 90+ languages", f"{DOCS}/api-reference/dubbing/create"),
            ("Not sure yet", "Start with a free API key", API_KEYS),
        ],
    },
    "vd": {
        "h1": "How do you want to get a custom voice?",
        "lede": "Design, clone, browse, or drop straight into TTS.",
        "intents": [
            ("Generate from a text description", "Voice Design from a prompt", f"{DOCS}/api-reference/text-to-voice/design"),
            ("Clone from audio", "Instant or professional voice cloning", f"{DOCS}/api-reference/voices/ivc/create"),
            ("Browse Voice Library", "10,000+ pre-built voices", "https://elevenlabs.io/app/voice-library"),
            ("Embed in TTS now", "Jump to TTS with a voice_id", f"{DOCS}/api-reference/text-to-speech/convert"),
        ],
    },
    "stt": {
        "h1": "What do you need to transcribe?",
        "lede": "Realtime, batch, multilingual catalog, or replacing Whisper — choose your path.",
        "intents": [
            ("Realtime streaming (<150ms)", "Scribe realtime over WebSocket", f"{DOCS}/api-reference/speech-to-text/v-1-speech-to-text-realtime"),
            ("Batch files / meetings", "Upload recordings with diarization", f"{DOCS}/api-reference/speech-to-text/convert"),
            ("Multilingual back catalog", "90+ languages, no model to host", f"{DOCS}/overview/models"),
            ("Replacing Whisper / OpenAI STT", "Hosted alternative — then get a key", API_KEYS),
        ],
    },
    "cai": {
        "h1": "Where should your agent live?",
        "lede": "Phone, outbound, in-app, WhatsApp, or BYO LLM — then get a key.",
        "intents": [
            ("Phone (inbound)", "AI phone agents", f"{DOCS}/agents-platform/phone-numbers"),
            ("Outbound calling", "Outbound voice agents", f"{DOCS}/agents-platform/overview"),
            ("In-app / WebSocket", "Live conversation loop", f"{DOCS}/agents-platform/libraries/web-sockets"),
            ("WhatsApp", "Agents on WhatsApp", f"{DOCS}/agents-platform/overview"),
            ("Bring my own LLM", "Keep your stack — add voice", f"{DOCS}/agents-platform/customize-llm"),
        ],
    },
    "dub": {
        "h1": "What are you localizing?",
        "lede": "One video, a catalog, a CMS pipeline, or identity-critical quality — pick one.",
        "intents": [
            ("Single video now", "Upload in the dubbing app", DUBBING_APP),
            ("Batch catalog", "API batch localization", f"{DOCS}/api-reference/dubbing/create"),
            ("API into my CMS / pipeline", "Webhooks + dubbing jobs", f"{DOCS}/api-reference/dubbing/create"),
            ("Preserve speaker identity", "Quality-critical re-voice", f"{DOCS}/overview/capabilities/dubbing"),
            ("High volume / enterprise", "Talk to sales", SALES),
        ],
    },
}


def render_q1(product: str) -> str:
    meta = PRODUCTS[product]
    copy = Q1[product]
    snip = SNIPPETS[product]
    vid = f"{product}-Q1"
    href = cta(product, vid, "quickstart")
    docs = DOCS
    body = f"""
{nav()}
  <main>
    <section class="hero">
      <div class="wrap">
        <p class="eyebrow">{esc(meta["eyebrow"])}</p>
        <h1>{esc(copy["h1"])}</h1>
        <p class="lede">{esc(copy["lede"])}</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="{esc(href)}">{esc(copy["cta"])}</a>
          <a class="text-link" href="{esc(docs)}" target="_blank" rel="noopener">View docs</a>
        </div>
        <div class="trust-row">
          <span>10K free credits / month</span>
          <span>Full access to all APIs</span>
          <span>SOC 2 Type 2 and ISO 27001</span>
        </div>
        {code_shell(snip["install"], snip["panels"], snip["default"])}
        <div class="logo-band">
          <p>Trusted by engineers at the world’s leading brands</p>
          <div class="logo-row">
            <span>Deutsche Telekom</span><span>Codeway</span><span>Fortune 500</span><span>Global media</span>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <h2>Three steps to first audio</h2>
        <div class="steps cols-3">
          <article class="step"><div class="step-num">1</div><h3>Get 10K free credits</h3><p>Sign up free. No credit card required.</p></article>
          <article class="step"><div class="step-num">2</div><h3>Grab your API key</h3><p>Generate a key from the developers dashboard.</p></article>
          <article class="step"><div class="step-num">3</div><h3>Paste the snippet</h3><p>One request — you’re live.</p></article>
        </div>
        <blockquote class="quote">
          <p>{esc(QUOTE[0])}</p>
          <cite>{esc(QUOTE[1])}</cite>
        </blockquote>
        <div class="btn-row">
          <a class="btn btn-primary" href="{esc(href)}">{esc(copy["cta"])}</a>
        </div>
      </div>
    </section>
  </main>
{sticky(copy["cta"], href)}
{footer_mini()}
"""
    return shell(f"{copy['h1']} · {meta['title_suffix']}", vid, "", body)


def render_q2(product: str) -> str:
    meta = PRODUCTS[product]
    copy = Q2[product]
    snip = SNIPPETS[product]
    vid = f"{product}-Q2"
    keys = cta(product, vid, "quickstart")
    signup = cta(product, vid, "quickstart", SIGNUP)
    agents = cta(product, vid, "quickstart", AGENTS_APP)
    dubbing = cta(product, vid, "quickstart", DUBBING_APP)
    docs = cta(product, vid, "quickstart", DOCS)

    href_map = {
        "signup": signup,
        "keys": keys,
        "agents": agents,
        "dubbing": dubbing,
        "docs": docs,
    }

    items = []
    for title, desc, label, kind in copy["steps"]:
        extra = ""
        if kind == "snippet":
            extra = code_shell(snip["install"], snip["panels"], snip["default"])
        elif label:
            extra = f'<a class="btn btn-secondary" href="{esc(href_map[kind])}">{esc(label)}</a>'
        items.append(
            f"""
          <div class="check-item">
            <input class="check-box" type="checkbox" />
            <div>
              <h3>{esc(title)}</h3>
              <p>{esc(desc)}</p>
              {extra}
            </div>
          </div>"""
        )

    primary = agents if product == "cai" else keys
    body = f"""
{nav()}
  <main>
    <section class="hero">
      <div class="wrap">
        <p class="eyebrow">{esc(meta["eyebrow"])}</p>
        <h1>{esc(copy["h1"])}</h1>
        <p class="lede">{esc(copy["lede"])}</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="{esc(primary)}">{esc(copy["cta"])}</a>
          <a class="text-link" href="{esc(docs)}" target="_blank" rel="noopener">View docs</a>
        </div>
        <div class="checklist">
          {''.join(items)}
        </div>
        <div class="btn-row">
          <a class="btn btn-primary" href="{esc(primary)}">{esc(copy["cta"])}</a>
        </div>
      </div>
    </section>
  </main>
{sticky(copy["cta"], primary)}
{footer_mini()}
"""
    return shell(f"{copy['h1']} · {meta['title_suffix']}", vid, "", body)


def render_ud(product: str) -> str:
    meta = PRODUCTS[product]
    copy = UD[product]
    vid = f"{product}-UD"
    escape = cta(product, vid, "user_driven", intent="skip")
    cards = []
    for title, desc, href in copy["intents"]:
        dest = href if href.startswith("http") and "utm_" in href else (
            cta(product, vid, "user_driven", href) if href.startswith("http") else href
        )
        if href in (API_KEYS, SIGNUP, SALES, DUBBING_APP, AGENTS_APP) or href.startswith("https://elevenlabs.io"):
            dest = cta(product, vid, "user_driven", href) if "?" not in href else href
        cards.append(
            f"""
            <button type="button" class="intent-card" data-href="{esc(dest)}" aria-pressed="false">
              <strong>{esc(title)}</strong>
              <span>{esc(desc)}</span>
            </button>"""
        )
    body = f"""
{nav(escape_label="Just give me an API key", escape_href=escape)}
  <main>
    <section class="hero">
      <div class="wrap" data-intent-router data-escape-url="{esc(escape)}">
        <p class="eyebrow">{esc(meta["eyebrow"])}</p>
        <h1>{esc(copy["h1"])}</h1>
        <p class="lede">{esc(copy["lede"])}</p>
        <div class="intent-grid">
          {''.join(cards)}
        </div>
        <div class="stack-chips" aria-label="Preferred stack">
          <button type="button" class="chip" data-stack="python" aria-pressed="true">Python</button>
          <button type="button" class="chip" data-stack="node" aria-pressed="false">Node</button>
          <button type="button" class="chip" data-stack="curl" aria-pressed="false">cURL</button>
        </div>
        <div class="btn-row">
          <a class="btn btn-primary is-disabled" data-continue href="{esc(escape)}" aria-disabled="true">Continue →</a>
          <a class="text-link" href="{esc(escape)}">Just give me an API key</a>
        </div>
      </div>
    </section>
  </main>
{footer_mini()}
"""
    return shell(f"{copy['h1']} · {meta['title_suffix']}", vid, "", body)


def render_d(product: str) -> str:
    meta = PRODUCTS[product]
    vid = f"{product}-D"
    keys = cta(product, vid, "disruptive")
    signup = cta(product, vid, "disruptive", SIGNUP)

    if product == "dev":
        body = f"""
{nav(minimal=True)}
  <div class="gate is-open" data-gate data-delay-ms="300">
    <div class="gate-card">
      <h2>Get 10K credits free — then read anything</h2>
      <p>No credit card. Soft gate for attention, not a hard wall.</p>
      <div class="gate-actions">
        <a class="btn btn-primary" href="{esc(keys)}">Get the key</a>
        <button type="button" class="btn btn-secondary" data-gate-dismiss>Dismiss</button>
      </div>
    </div>
  </div>
  <main>
    <section class="hero-disrupt">
      <div class="code-billboard" aria-hidden="true">audio = client.text_to_speech.convert(
    voice_id="JBFqnCBsd6RMkjVDRZzb",
    model_id="eleven_flash_v2_5",
    text="Your platform just found its voice.",
)</div>
      <div class="wrap">
        <p class="eyebrow">{esc(meta["eyebrow"])}</p>
        <h1>Your product is mute until this API call returns.</h1>
        <p class="lede">10K free credits. First audio in ~75ms. No credit card.</p>
        <div class="btn-row">
          <a class="btn btn-coral" href="{esc(keys)}">Get the key — then read anything</a>
        </div>
        <p class="lede" style="margin-top:2rem;font-size:0.95rem">Trusted by engineers shipping voice at Fortune 500s.</p>
      </div>
    </section>
  </main>
{footer_mini()}
"""
        return shell("Your product is mute until this API call returns.", vid, "theme-disruptive", body)

    if product == "vd":
        body = f"""
{nav(minimal=True)}
  <main>
    <section class="hero-disrupt">
      <div class="wrap wrap-narrow">
        <p class="eyebrow">{esc(meta["eyebrow"])}</p>
        <h1>Stop renting generic voices. Own one from a sentence.</h1>
        <p class="lede">Describe it. Save the voice_id. Ship it everywhere.</p>
        <form class="prompt-hero" data-prompt-cta onsubmit="return false;">
          <label for="voice-prompt">Describe your brand voice — or leave</label>
          <textarea id="voice-prompt" placeholder="Warm, mid-30s narrator with a soft American accent…"></textarea>
          <div class="btn-row">
            <a class="btn btn-coral is-disabled" data-prompt-submit data-href="{esc(keys)}" href="{esc(keys)}" aria-disabled="true">Generate my voice / Get API key</a>
          </div>
        </form>
      </div>
    </section>
  </main>
{footer_mini()}
"""
        return shell("Stop renting generic voices.", vid, "theme-disruptive", body)

    if product == "stt":
        body = f"""
  <div class="sticky-force is-visible" data-force-bar data-lock-ms="5000">
    <span>Start free transcription credits — 10K, no CC</span>
    <a class="btn" href="{esc(keys)}">Get API key</a>
    <button type="button" class="btn" data-force-close style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35)">Dismiss</button>
  </div>
{nav(minimal=True)}
  <main>
    <section class="hero-disrupt" style="padding-top:5rem">
      <div class="wrap">
        <p class="eyebrow">{esc(meta["eyebrow"])}</p>
        <h1>Delete your Whisper GPU bill.</h1>
        <p class="lede">Hosted Scribe: 90+ languages, diarization, &lt;150ms realtime. Start free.</p>
        <div class="strike-arch">
          <span class="node">Whisper GPU</span><span class="arrow">→</span>
          <span class="node">Autoscaling</span><span class="arrow">→</span>
          <span class="node">Ops on-call</span>
        </div>
        <div class="code-shell" style="margin-top:1rem">
          <pre class="code-panel">transcript = client.speech_to_text.convert(model_id="scribe_v1", file=open("meeting.mp3","rb"), diarize=True)</pre>
        </div>
        <div class="compare-row">
          <span>vs <b>Whisper</b></span>
          <span>vs <b>OpenAI STT</b></span>
          <span>vs <b>Google</b></span>
        </div>
        <div class="btn-row">
          <a class="btn btn-coral" href="{esc(keys)}">Start free transcription credits</a>
        </div>
      </div>
    </section>
  </main>
{footer_mini()}
"""
        return shell("Delete your Whisper GPU bill.", vid, "theme-disruptive", body)

    if product == "cai":
        demo = cta(product, vid, "disruptive", "https://elevenlabs.io/conversational-ai")
        body = f"""
{nav(minimal=True)}
  <main>
    <section class="hero-disrupt">
      <div class="wrap">
        <p class="eyebrow">{esc(meta["eyebrow"])}</p>
        <h1>If your “voice agent” is STT + LLM + TTS duct-taped, you’re already behind.</h1>
        <p class="lede">One Agents API. Sub-second turn-taking. Flash ~75ms.</p>
        <div class="pipeline">
          <div class="pipe-broken">
            <div class="pipe-box is-x">STT</div>
            <div class="pipe-box is-x">LLM glue</div>
            <div class="pipe-box is-x">TTS</div>
          </div>
          <div class="pipe-vs">vs</div>
          <div class="pipe-one"><div class="pipe-box">ElevenAgents API</div></div>
        </div>
        <div class="btn-row">
          <a class="btn btn-coral" href="{esc(demo)}">Talk to a live demo agent</a>
          <a class="btn btn-secondary" href="{esc(keys)}">Get API key</a>
        </div>
      </div>
    </section>
  </main>
{footer_mini()}
"""
        return shell("Duct-taped voice agents are already behind.", vid, "theme-disruptive", body)

    # dub
    sales = cta(product, vid, "disruptive", SALES)
    langs = ["ES", "JA", "DE", "FR", "HI", "PT", "IT"]
    chips = "".join(f'<span class="lang-chip">{l}</span>' for l in langs)
    body = f"""
{nav(minimal=True)}
  <main>
    <section class="hero-disrupt">
      <div class="wrap">
        <p class="eyebrow">{esc(meta["eyebrow"])}</p>
        <h1>One English master. Ninety markets. Zero studio.</h1>
        <p class="lede">Localize video in one API call. Speaker identity preserved.</p>
        <div class="markets-count"><span data-count-to="90">0</span><span>markets unlocked · localization queues are a product tax</span></div>
        <div class="lang-chips">{chips}</div>
        <div class="btn-row">
          <a class="btn btn-coral" href="{esc(keys)}">Unlock with API key</a>
          <a class="btn btn-secondary" href="{esc(sales)}">Talk to sales</a>
        </div>
      </div>
    </section>
  </main>
{footer_mini()}
"""
    return shell("One English master. Ninety markets. Zero studio.", vid, "theme-disruptive", body)


GALLERY_CARD = """
    <a class="intent-card" href="{href}" style="text-decoration:none">
      <strong>{vid}</strong>
      <span>{label} · {product}</span>
    </a>
"""


def render_gallery(paths: list[tuple[str, str, str, str]]) -> str:
    # paths: variant_id, href, archetype label, product name
    groups = {"Quickstart Q1": [], "Quickstart Q2": [], "User-driven": [], "Disruptive": []}
    for vid, href, label, product in paths:
        groups[label].append(GALLERY_CARD.format(href=esc(href), vid=esc(vid), label=esc(label), product=esc(product)))

    sections = []
    for name, cards in groups.items():
        sections.append(
            f"""
      <section class="section" style="padding-top:1.5rem;padding-bottom:1rem">
        <div class="wrap">
          <h2>{esc(name)}</h2>
          <div class="intent-grid">{''.join(cards)}</div>
        </div>
      </section>"""
        )

    body = f"""
{nav()}
  <main>
    <section class="hero">
      <div class="wrap">
        <p class="eyebrow">ElevenAPI experiments</p>
        <h1>Landing archetype prototypes</h1>
        <p class="lede">20 design-matched variants (quickstart, user-driven, disruptive) for the five playground-first join.elevenlabs.io API pages. Playground-first remains the live holdout.</p>
        <div class="btn-row">
          <a class="btn btn-secondary" href="/">CTA Experiment Lab</a>
          <a class="text-link" href="/matrix">Matrix doc</a>
        </div>
      </div>
    </section>
    {''.join(sections)}
  </main>
{footer_mini()}
"""
    return shell("ElevenAPI landing archetype experiments", "gallery", "", body)


def main() -> None:
    rendered: list[tuple[str, str, str, str]] = []
    for product, meta in PRODUCTS.items():
        slug = meta["slug"]
        out_dir = OUT / slug
        out_dir.mkdir(parents=True, exist_ok=True)

        mapping = [
            ("q1", render_q1(product), "Quickstart Q1"),
            ("q2", render_q2(product), "Quickstart Q2"),
            ("ud", render_ud(product), "User-driven"),
            ("d", render_d(product), "Disruptive"),
        ]
        for name, html_out, label in mapping:
            path = out_dir / f"{name}.html"
            path.write_text(html_out, encoding="utf-8")
            vid = f"{product}-{name.upper() if name != 'ud' else 'UD'}"
            if name == "q1":
                vid = f"{product}-Q1"
            elif name == "q2":
                vid = f"{product}-Q2"
            elif name == "ud":
                vid = f"{product}-UD"
            else:
                vid = f"{product}-D"
            href = f"/experiments/{slug}/{name}"
            rendered.append((vid, href, label, meta["eyebrow"]))
            print(f"wrote {path.relative_to(ROOT)}")

    gallery = OUT / "index.html"
    gallery.write_text(render_gallery(rendered), encoding="utf-8")
    print(f"wrote {gallery.relative_to(ROOT)}")
    print(f"total variants: {len(rendered)}")


if __name__ == "__main__":
    main()
