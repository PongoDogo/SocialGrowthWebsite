#!/usr/bin/env python3
"""Probe candidate domains: print only ones that resolve with a title."""
import concurrent.futures, re, ssl, sys, urllib.request

ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36"}


def probe(domain):
    for scheme in ("https://", "http://"):
        for host in (domain, "www." + domain):
            try:
                with urllib.request.urlopen(urllib.request.Request(scheme + host, headers=UA), timeout=12, context=ctx) as r:
                    html = r.read(200000).decode("utf-8", "ignore")
                    t = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
                    return domain, (t.group(1).strip()[:90] if t else "?")
            except Exception:
                continue
    return None


with concurrent.futures.ThreadPoolExecutor(max_workers=16) as ex:
    for res in ex.map(probe, sys.argv[1:]):
        if res:
            print(f"{res[0]}  ::  {res[1]}")
