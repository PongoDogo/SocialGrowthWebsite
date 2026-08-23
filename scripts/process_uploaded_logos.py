#!/usr/bin/env python3
"""Process user-supplied client logos into square rounded tiles (no dead corners)."""
import io, os, ssl, urllib.request
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0"}
OUT = "/app/frontend/public/logos"
BASE = "https://customer-assets-v7afamib.emergentagent.net/job_brand-showcase-324/artifacts/"

# key -> (file, mode)  mode: "tile" keeps the artwork background, "cut" strips a flat black bg
SRC = {
    "guru": ("usz97rk3_guru.jpg", "tile"),
    "ildesto": ("hneee5t8_305187130_619689753069535_1180807087250261956_n.jpg", "cut"),
    "nadu": ("v0zoommt_nadumen.jpg", "cut"),
    "ypourgeio": ("ozyfiot8_ypoyrgeio%20geysewn.jpg", "cut"),
    "barbathimios": ("bc0da33b_%CE%BC%CF%80%CE%B1%CF%81%CE%BC%CF%80%CE%B1%CE%B8%CF%85%CE%BC%CE%B9%CE%BF%CF%82.jpg", "cut"),
    "tolis": ("qeilp813_images%20%281%29.jpg", "cutw"),
    "scorpios": ("oxoltfom_images.jpg", "cutw"),
    "doncarlito": ("vkzjtlgz_711709580_17888779938544769_6259349350377128673_n.jpg", "tile"),
    "pantheon": ("3s4lt6rl_424747761_373668961937598_3744855256146174911_n.jpg", "cutw"),
    "xara": ("cc957o20_717eb2e2-ab53-40e8-b5d0-de050688790a_removalai_preview.png", "cutw"),
    "euthimiou": ("pzve3r3c_473813530_539571852432467_1900416605979808973_n.jpg", "cut"),
    "yakuza": ("2fhymtqe_6a14138abc58fc8ba2f3c092.webp", "tile"),
    "funkytokyo": ("w0m2jxmr_6a22adb86f3977c2b77a153c.webp", "tile"),
    "twisteast": ("tyer80q1_731808164_18053202317538814_4882588957072978072_n.jpg", "tile"),
}

SIZE = 400
RADIUS = 84
# dark artwork that needs lifting so it reads on the dark theme: key -> strength
LIGHTEN = {"scorpios": 0.9, "pantheon": 0.45, "tolis": 0.3}
# tile artwork that is too dark on the dark card -> brightness multiplier
BRIGHTEN = {"yakuza": 1.7, "twisteast": 1.45}


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
            if mx < 40:
                px[x, y] = (r, g, b, 0)
            elif mx < 80:
                px[x, y] = (r, g, b, int(a * (mx - 40) / 40))
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def cut_white(im):
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            mn = min(r, g, b)
            if mn > 243 and max(r, g, b) - mn < 14:
                px[x, y] = (r, g, b, 0)
            elif mn > 214 and max(r, g, b) - mn < 18:
                px[x, y] = (r, g, b, int(a * (243 - mn) / 29))
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


for key, (fn, mode) in SRC.items():
    data = urllib.request.urlopen(urllib.request.Request(BASE + fn, headers=UA), timeout=30, context=ctx).read()
    im = Image.open(io.BytesIO(data))
    if key == "ildesto":
        w, h = im.size
        im = im.crop((6, 6, w - 6, h - 6))
    if mode == "cut":
        im = cut_black(im)
    elif mode == "cutw":
        im = cut_white(im)
    else:
        im = rounded(im)
    if mode != "tile":
        im.thumbnail((560, 560), Image.LANCZOS)
    if key in LIGHTEN:
        k = LIGHTEN[key]
        px = im.load()
        for y in range(im.size[1]):
            for x in range(im.size[0]):
                r, g, b, a = px[x, y]
                if a > 8 and (r + g + b) / 3 < 150:
                    px[x, y] = (r + int((255 - r) * k), g + int((255 - g) * k), b + int((255 - b) * k), a)
    if key in BRIGHTEN:
        rgb = ImageEnhance.Brightness(im.convert("RGB")).enhance(BRIGHTEN[key])
        rgb.putalpha(im.getchannel("A"))
        im = rgb
    im.save(f"{OUT}/{key}.png")
    print(f"{key:12s} {mode:5s} {im.size}")
