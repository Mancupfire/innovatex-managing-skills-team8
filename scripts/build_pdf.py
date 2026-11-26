#!/usr/bin/env python3
"""Export the presentation website to a PDF (one 16:9 page per slide).

Usage:  python3 scripts/build_pdf.py [--out FILE] [--chrome PATH]

It serves the site locally, checks that every slide file loaded, prints the page
with headless Chrome/Chromium using the site's print CSS, then checks the page count.
Only the Python standard library and a Chrome/Chromium install are needed.
"""
import argparse
import functools
import http.server
import os
import re
import shutil
import socketserver
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "InnovateX-Team8-Managing-Skills.pdf"
CHROME_CANDIDATES = [
    "google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]


def find_chrome(explicit):
    for c in ([explicit] if explicit else []) + [os.environ.get("CHROME", "")] + CHROME_CANDIDATES:
        if not c:
            continue
        path = shutil.which(c) or (c if Path(c).exists() else None)
        if path:
            return path
    sys.exit("Chrome/Chromium not found. Install it or pass --chrome /path/to/chrome.")


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def chrome(chrome_path, profile, *args, timeout=120):
    cmd = [chrome_path, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
           "--hide-scrollbars", "--disable-extensions", "--user-data-dir=" + profile,
           "--virtual-time-budget=15000", "--run-all-compositor-stages-before-draw"]
    if os.environ.get("CI") or os.environ.get("CHROME_NO_SANDBOX"):
        cmd.append("--no-sandbox")
    cmd += list(args)
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def page_count(pdf):
    if shutil.which("pdfinfo"):
        out = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
        m = re.search(r"^Pages:\s+(\d+)", out, re.M)
        if m:
            return int(m.group(1))
    data = Path(pdf).read_bytes()
    n = len(re.findall(rb"/Type\s*/Page(?!s)", data))
    return n or None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default=str(DEFAULT_OUT), help="output PDF path")
    ap.add_argument("--chrome", help="path to Chrome/Chromium")
    ap.add_argument("--require-final", action="store_true", help="fail if any slide is not final")
    args = ap.parse_args()

    chrome_path = find_chrome(args.chrome)
    httpd = serve()
    url = "http://127.0.0.1:%d/index.html" % httpd.server_address[1]
    out = Path(args.out).resolve()
    try:
        with tempfile.TemporaryDirectory() as profile:
            # 1. Check the deck rendered and every slide file loaded.
            r = chrome(chrome_path, profile, "--window-size=1600,900", "--dump-dom", url)
            dom = r.stdout
            if 'data-deck-ready="true"' not in dom:
                sys.exit("The deck did not finish rendering.\n" + r.stderr[-2000:])
            total = int(re.search(r'data-deck-slides="(\d+)"', dom).group(1))
            final = int(re.search(r'data-deck-final="(\d+)"', dom).group(1))
            errors = re.search(r'data-deck-errors="([^"]*)"', dom)
            if errors:
                sys.exit("Slide content errors:\n  " + errors.group(1).replace(" | ", "\n  "))
            rendered = len(re.findall(r'<section class="slide[ "]', dom))
            if rendered != total:
                sys.exit("Expected %d slides but %d rendered." % (total, rendered))
            draft = final < total
            if draft and args.require_final:
                sys.exit("Only %d of %d slides are final." % (final, total))

            # 2. Print to PDF with the site's print CSS.
            tmp = out.with_suffix(".tmp.pdf")
            r = chrome(chrome_path, profile, "--no-pdf-header-footer", "--print-to-pdf=" + str(tmp), url)
            if not tmp.exists() or tmp.stat().st_size == 0:
                sys.exit("Chrome did not produce a PDF.\n" + r.stderr[-2000:])
            tmp.replace(out)
    finally:
        httpd.shutdown()

    pages = page_count(out)
    if pages is not None and pages != total:
        sys.exit("PDF has %d pages but the deck has %d slides." % (pages, total))
    status = "DRAFT (%d of %d slides final)" % (final, total) if draft else "SUBMISSION-READY (all %d slides final)" % total
    print("Wrote %s · %s pages · %s" % (out.relative_to(ROOT) if out.is_relative_to(ROOT) else out,
                                        pages if pages is not None else "?", status))


if __name__ == "__main__":
    main()
