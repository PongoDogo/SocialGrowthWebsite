#!/usr/bin/env python3
"""Derive each client logo's dominant colour -> src/data/logoColors.json.

Picks the most frequent saturated hue, then normalises it to a vivid, readable
tone for use as the card accent on the dark theme.
"""
import colorsys, json, os
from collections import Counter
from PIL import Image

LOGOS = "/app/frontend/public/logos"
OUT = "/app/frontend/src/data/logoColors.json"
FALLBACK = "#60d6ff"


def accent(path):
    im = Image.open(path).convert("RGBA")
    im.thumbnail((160, 160), Image.LANCZOS)
    px = im.load()
    buckets = Counter()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            if a < 140:
                continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if s < 0.22 or l < 0.12 or l > 0.94:
                continue
            buckets[(round(h * 24), round(s * 4), round(l * 4))] += 1
    if not buckets:
        return FALLBACK
    (hb, sb, lb), _ = buckets.most_common(1)[0]
    h = hb / 24
    s = max(0.62, min(sb / 4, 0.92))
    l = min(max(lb / 4, 0.58), 0.70)
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return "#%02x%02x%02x" % (int(r * 255), int(g * 255), int(b * 255))


colors = {}
for f in sorted(os.listdir(LOGOS)):
    if f.endswith(".png"):
        colors[f[:-4]] = accent(os.path.join(LOGOS, f))

with open(OUT, "w") as fh:
    json.dump(colors, fh, indent=2, sort_keys=True)
    fh.write("\n")
print(json.dumps(colors, indent=2))
