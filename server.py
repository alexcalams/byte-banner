#!/usr/bin/env python3
"""Serve the CTA experiment injected into the live ElevenLabs docs page."""

from __future__ import annotations

import argparse
import mimetypes
import os
import ssl
from http.client import HTTPResponse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
DOCS_ORIGIN = "https://elevenlabs.io"
DEFAULT_DOCS_PATH = "/docs/overview/capabilities/text-to-speech"
INJECT_MARK = "<!-- cta-experiment -->"


def _asset_version() -> str:
    """Cache-bust experiment assets when files change."""
    try:
        mtimes = [
            (ASSETS / name).stat().st_mtime_ns
            for name in ("experiment.css", "experiment.js")
            if (ASSETS / name).exists()
        ]
        return str(max(mtimes) if mtimes else 0)
    except OSError:
        return "0"


def inject_html() -> str:
    v = _asset_version()
    return f"""{INJECT_MARK}
<link rel="stylesheet" href="/__experiment/experiment.css?v={v}" />
<script src="/__experiment/experiment.js?v={v}" defer></script>
"""


# Hop-by-hop / framing headers we must not forward.
DROP_RESPONSE_HEADERS = {
    "content-encoding",
    "content-length",
    "transfer-encoding",
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "upgrade",
    "content-security-policy",
    "content-security-policy-report-only",
    "x-frame-options",
    "x-xss-protection",
}


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt: str, *args) -> None:
        sys_stderr = __import__("sys").stderr
        print(f"[experiment] {self.address_string()} - {fmt % args}", file=sys_stderr)

    def do_GET(self) -> None:
        self._handle()

    def do_HEAD(self) -> None:
        self._handle(body=False)

    def do_POST(self) -> None:
        self._handle()

    def do_PUT(self) -> None:
        self._handle()

    def do_PATCH(self) -> None:
        self._handle()

    def do_DELETE(self) -> None:
        self._handle()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def _handle(self, body: bool = True) -> None:
        path = self.path.split("?", 1)[0]

        if path in {"/", "/index.html"}:
            self._serve_root(body=body)
            return

        if path in {"/whitepaper", "/whitepaper/", "/whitepaper.html"}:
            self._serve_file(ROOT / "whitepaper.html", "text/html; charset=utf-8", body=body)
            return

        if path.startswith("/__experiment/"):
            self._serve_local(path[len("/__experiment/") :], body=body)
            return

        # Also allow nested assets path for any leftover relative refs.
        if path.startswith("/assets/"):
            self._serve_local(path[len("/assets/") :], body=body)
            return

        self._proxy(body=body)

    def _serve_root(self, body: bool = True) -> None:
        self._serve_file(ROOT / "index.html", "text/html; charset=utf-8", body=body)

    def _serve_file(self, file_path: Path, content_type: str, body: bool = True) -> None:
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        if body:
            self.wfile.write(data)

    def _serve_local(self, rel: str, body: bool = True) -> None:
        rel = rel.lstrip("/")
        if ".." in rel.split("/"):
            self.send_error(400, "Invalid path")
            return
        file_path = ASSETS / rel
        if not file_path.is_file():
            self.send_error(404, f"Not found: {rel}")
            return
        data = file_path.read_bytes()
        ctype, _ = mimetypes.guess_type(str(file_path))
        self.send_response(200)
        self.send_header("Content-Type", ctype or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        if body:
            self.wfile.write(data)

    def _proxy(self, body: bool = True) -> None:
        target = f"{DOCS_ORIGIN}{self.path}"
        length = int(self.headers.get("Content-Length", "0") or "0")
        payload = self.rfile.read(length) if length > 0 else None

        headers = {}
        for key, value in self.headers.items():
            lk = key.lower()
            if lk in {"host", "content-length", "accept-encoding"}:
                continue
            headers[key] = value
        headers["Host"] = "elevenlabs.io"
        headers["Accept-Encoding"] = "identity"
        headers["User-Agent"] = self.headers.get(
            "User-Agent",
            "Mozilla/5.0 (compatible; CTA-Experiment/1.0)",
        )

        req = Request(target, data=payload, headers=headers, method=self.command)
        context = ssl.create_default_context()

        try:
            with urlopen(req, context=context, timeout=30) as resp:  # noqa: S310
                self._write_proxied(resp, body=body)
        except HTTPError as err:
            self._write_proxied(err, body=body)
        except URLError as err:
            msg = f"Upstream error: {err.reason}".encode()
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            if body:
                self.wfile.write(msg)

    def _write_proxied(self, resp: HTTPResponse, body: bool = True) -> None:
        raw = resp.read()
        content_type = (resp.headers.get("Content-Type") or "").lower()
        is_html = "text/html" in content_type

        if is_html:
            text = raw.decode("utf-8", errors="replace")
            if INJECT_MARK not in text:
                snippet = inject_html()
                if "</head>" in text:
                    text = text.replace("</head>", snippet + "</head>", 1)
                elif "</body>" in text:
                    text = text.replace("</body>", snippet + "</body>", 1)
                else:
                    text += snippet
            raw = text.encode("utf-8")

        self.send_response(resp.status)
        for key, value in resp.headers.items():
            if key.lower() in DROP_RESPONSE_HEADERS:
                continue
            if key.lower() == "location" and value.startswith(DOCS_ORIGIN):
                value = value[len(DOCS_ORIGIN) :] or "/"
            self.send_header(key, value)
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if body:
            self.wfile.write(raw)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--host",
        default=os.environ.get("HOST", "127.0.0.1"),
        help="Bind address (use 0.0.0.0 in production)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("PORT", "8765")),
        help="Listen port (hosts set PORT automatically)",
    )
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(
        f"CTA experiment on http://{args.host}:{args.port}/\n"
        f"Proxying live docs from {DOCS_ORIGIN}{DEFAULT_DOCS_PATH}"
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down")
        server.server_close()


if __name__ == "__main__":
    main()
