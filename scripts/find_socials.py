#!/usr/bin/env python3
"""Extract instagram / tiktok / facebook profile links from client websites."""
import re, ssl, sys, urllib.request

ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36"}

PATTERNS = {
    "instagram": r'https?://(?:www\.)?instagram\.com/([A-Za-z0-9._]{2,40})',
    "tiktok": r'https?://(?:www\.)?tiktok\.com/@([A-Za-z0-9._]{2,40})',
    "facebook": r'https?://(?:www\.)?facebook\.com/((?:profile\.php\?id=)?[A-Za-z0-9._-]{3,60})',
}
SKIP = {"p", "reel", "explore", "sharer", "tr", "share", "accounts", "legal", "policies", "pages", "help", "login"}


def grab(dom):
    html = ""
    for host in ("https://" + dom, "https://www." + dom):
        try:
            html = urllib.request.urlopen(urllib.request.Request(host, headers=UA), timeout=18, context=ctx).read(900000).decode("utf-8", "ignore")
            break
        except Exception:
            continue
    found = {}
    for net, pat in PATTERNS.items():
        for m in re.finditer(pat, html, re.I):
            h = m.group(1).strip("/")
            if h.lower() in SKIP or h.lower().startswith(("sharer", "dialog")):
                continue
            found.setdefault(net, h)
    return found


for dom in sys.argv[1:]:
    print(dom, grab(dom))
