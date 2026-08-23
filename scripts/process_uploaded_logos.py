#!/usr/bin/env python3
"""Process user-supplied client logos into square rounded tiles (no dead corners)."""
import io, os, ssl, urllib.request
from PIL import Image, ImageDraw, ImageFilter

ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0"}
OUT = "/app/frontend/public/logos"
BASE = "https://customer-assets-v7afamib.emergentagent.net/job_brand-showcase-324/artifacts/"

# key -> (file, mode)  mode: "tile" keeps the artwork background, "cut" strips a flat black bg
SRC = {
    "tolis": ("9ejxt05o_69e625c166188661e6339cb4%20%281%29.webp", "tile"),
    "euthimiou": ("pzve3r3c_473813530_539571852432467_1900416605979808973_n.jpg", "cut"),
    "yakuza": ("2fhymtqe_6a14138abc58fc8ba2f3c092.webp", "tile"),
    "funkytokyo": ("w0m2jxmr_6a22adb86f3977c2b77a153c.webp", "tile"),
    "twisteast": ("tyer80q1_731808164_18053202317538814_4882588957072978072_n.jpg", "tile"),
}

SIZE = 400
RADIUS = 84


def rounded(im, size=SIZE, radius=RADIUS):
    """Center-crop to a square and apply a soft rounded mask."""
    w, h = im.size
    s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2)).resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size * 4 - 1, size * 4 - 1], radius=radius * 4, fill=255)
    mask = mask.resize((size, size), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(im.convert("RGBA"), (0, 0))
    out.putalpha(mask)
    return out


def cut_black(im):
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            mx = max(r, g, b)
            if mx < 26:
                px[x, y] = (r, g, b, 0)
            elif mx < 70:
                px[x, y] = (r, g, b, int(a * (mx - 26) / 44))
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


for key, (fn, mode) in SRC.items():
    data = urllib.request.urlopen(urllib.request.Request(BASE + fn, headers=UA), timeout=30, context=ctx).read()
    im = Image.open(io.BytesIO(data))
    im = cut_black(im) if mode == "cut" else rounded(im)
    if mode == "cut":
        im.thumbnail((560, 560), Image.LANCZOS)
    im.save(f"{OUT}/{key}.png")
    print(f"{key:12s} {mode:5s} {im.size}")
