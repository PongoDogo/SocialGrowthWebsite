#!/usr/bin/env python3
"""Download brand logos, trim whitespace, normalize to transparent PNG."""
import io, os, ssl, sys, urllib.request
from PIL import Image

ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36"}
OUT = "/app/frontend/public/logos"
os.makedirs(OUT, exist_ok=True)

LOGOS = {
    "blysscafe": "https://blysscafe.gr/assets/logoclean-5kBtoMZF.png",
    "crats": "https://res2.weblium.site/res/6141bc4ed19bd10022a93085/6141bfe7f9a4f70023aeac7b_optimized",
    "papastavrou": "https://www.papastavroushops.gr/assets/img/papastavrou-white.svg",
    "tocashop": "https://tocashop.gr/wp-content/uploads/2022/05/cropped-cropped-tocashop_logo_web.png",
    "caravel": "https://caravel.gr/wp-content/uploads/2022/01/caravel-logo_0_0.jpg",
    "cofis": "https://cofis.gr/wp-content/themes/cofis/static/cofis-logo-black.svg",
    "ovegan": "https://ovegan269.gr/assets/site/images/logo/logo.svg",
    "kiboko": "https://www.kiboko.gr/images/kiboko_full_w.svg",
    "araw": "https://arawsupermarket.gr/wp-content/uploads/2025/06/Araw-supermarket-logo.png",
    "hairway": "http://hairway.gr/wp-content/uploads/2024/02/logo-444-x-100-px.png",
    "kantinarxis": "https://kantinarxis.gr/logo-arc.png",
    "onedeal": "https://onedeal.gr/wp-content/uploads/2025/04/Onedeal-white-logo-e1744445674631.png",
    "fiftyways": "https://50ways.com.gr/wp-content/uploads/2025/04/fifty-ways-logo-b-w-2024.png",
}
# Monochrome dark logos -> recolour to white so they read on the dark theme.
INVERT = {"cofis", "fiftyways"}
# Dark logos -> lift them toward light while keeping their hue.
LIGHTEN = {"ovegan"}
LOGOS.update(dict(x.split("=", 1) for x in sys.argv[1:]))


def load(url):
    data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25, context=ctx).read()
    if url.lower().endswith(".svg") or data[:200].lstrip()[:5] in (b"<svg ", b"<?xml"):
        import cairosvg
        data = cairosvg.svg2png(bytestring=data, output_width=900)
    return Image.open(io.BytesIO(data)).convert("RGBA")


def make_transparent(im):
    """Drop a uniform white or black background, keep existing alpha."""
    px = im.load(); w, h = im.size
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    opaque = [c for c in corners if c[3] > 200]
    if not opaque:
        return im
    avg = sum(sum(c[:3]) / 3 for c in opaque) / len(opaque)
    if avg > 225:
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                mn = min(r, g, b)
                if mn > 244 and max(r, g, b) - mn < 12:
                    px[x, y] = (r, g, b, 0)
                elif mn > 216 and max(r, g, b) - mn < 16:
                    px[x, y] = (r, g, b, int(a * (244 - mn) / 28))
    elif avg < 30:
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                mx = max(r, g, b)
                if mx < 16:
                    px[x, y] = (r, g, b, 0)
    return im


def brightness(im):
    px = im.load(); w, h = im.size
    tot = n = 0
    for y in range(0, h, 3):
        for x in range(0, w, 3):
            r, g, b, a = px[x, y]
            if a > 60:
                tot += (r + g + b) / 3; n += 1
    return tot / max(n, 1)


report = []
for key, url in sorted(LOGOS.items()):
    try:
        im = make_transparent(load(url))
        if key in INVERT:
            px = im.load()
            for y in range(im.size[1]):
                for x in range(im.size[0]):
                    r, g, b, a = px[x, y]
                    if a > 8:
                        px[x, y] = (255, 255, 255, a)
        if key in LIGHTEN:
            px = im.load()
            for y in range(im.size[1]):
                for x in range(im.size[0]):
                    r, g, b, a = px[x, y]
                    if a > 8 and (r + g + b) / 3 < 165:
                        px[x, y] = (r + int((255 - r) * 0.88), g + int((255 - g) * 0.88), b + int((255 - b) * 0.88), a)
        bbox = im.getbbox()
        if bbox:
            im = im.crop(bbox)
        im.thumbnail((560, 560), Image.LANCZOS)
        im.save(f"{OUT}/{key}.png")
        report.append(f"{key:14s} {im.size[0]:>4}x{im.size[1]:<4} lum={brightness(im):6.1f}")
    except Exception as e:
        report.append(f"{key:14s} FAIL {type(e).__name__}: {str(e)[:70]}")
print("\n".join(report))
