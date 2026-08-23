#!/usr/bin/env python3
"""Turn owner-supplied client logos into clean assets for the dark carousel.

modes
  cut     flood-fill the flat background away from the edges (keeps interior whites)
  tile    keep the artwork background, mask to a rounded square
  circle  crop to the artwork disc and mask to a circle (kills the outer frame)
"""
import io, os, ssl, urllib.request
from collections import deque
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
UA = {"User-Agent": "Mozilla/5.0"}
OUT = "/app/frontend/public/logos"
BASE = "https://customer-assets-v7afamib.emergentagent.net/job_brand-showcase-324/artifacts/"
os.makedirs(OUT, exist_ok=True)

SRC = {
    "guru": ("usz97rk3_guru.jpg", "circle"),
    "doncarlito": ("vkzjtlgz_711709580_17888779938544769_6259349350377128673_n.jpg", "circle"),
    "funkytokyo": ("w0m2jxmr_6a22adb86f3977c2b77a153c.webp", "circle"),
    "yakuza": ("2fhymtqe_6a14138abc58fc8ba2f3c092.webp", "cut"),
    "twisteast": ("tyer80q1_731808164_18053202317538814_4882588957072978072_n.jpg", "cut"),
    "pantheon": ("3s4lt6rl_424747761_373668961937598_3744855256146174911_n.jpg", "cut"),
    "scorpios": ("oxoltfom_images.jpg", "cut"),
    "tolis": ("qeilp813_images%20%281%29.jpg", "cut"),
    "xara": ("cc957o20_717eb2e2-ab53-40e8-b5d0-de050688790a_removalai_preview.png", "cut"),
    "ildesto": ("hneee5t8_305187130_619689753069535_1180807087250261956_n.jpg", "cut"),
    "nadu": ("v0zoommt_nadumen.jpg", "cut"),
    "ypourgeio": ("ozyfiot8_ypoyrgeio%20geysewn.jpg", "cut"),
    "barbathimios": ("bc0da33b_%CE%BC%CF%80%CE%B1%CF%81%CE%BC%CF%80%CE%B1%CE%B8%CF%85%CE%BC%CE%B9%CE%BF%CF%82.jpg", "cut"),
    "euthimiou": ("pzve3r3c_473813530_539571852432467_1900416605979808973_n.jpg", "cut"),
}
BRIGHTEN = {}
CONTRAST = {}
TILE_TRIM = set()
# dark ink on a light background -> lift toward white, keeping hue
LIGHTEN = {"pantheon": 0.72, "scorpios": 0.85, "twisteast": 0.85}  # trim the empty margin, then re-square on its own bg
PRECROP = {"ildesto": 0.06, "tolis": 0.02}
FORCE_REF = {"ildesto": (0, 0, 0)}
CUT_TOL = {"ildesto": 60, "twisteast": 60, "yakuza": 55, "pantheon": 30, "scorpios": 34, "tolis": 62, "ypourgeio": 70, "barbathimios": 70, "euthimiou": 70, "nadu": 70}


def fetch(fn):
    data = urllib.request.urlopen(urllib.request.Request(BASE + fn, headers=UA), timeout=30, context=ctx).read()
    return Image.open(io.BytesIO(data)).convert("RGBA")


def dist(a, b):
    return max(abs(a[0] - b[0]), abs(a[1] - b[1]), abs(a[2] - b[2]))


def flood_cut(im, tol=42, ref=None):
    """Make the connected background reachable from the border transparent."""
    im = im.copy()
    w, h = im.size
    px = im.load()
    if ref is None:
        ref = tuple(int(sum(c) / 4) for c in zip(px[0, 0][:3], px[w - 1, 0][:3], px[0, h - 1][:3], px[w - 1, h - 1][:3]))
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if a > 8 and dist((r, g, b), ref) > tol:
            continue
        px[x, y] = (r, g, b, 0)
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def content_square(im, tol=34):
    """Crop to the square bounding box of everything that differs from the corner colour."""
    w, h = im.size
    px = im.load()
    ref = px[0, 0][:3]
    xs, ys = [], []
    step = max(1, min(w, h) // 260)
    for y in range(0, h, step):
        for x in range(0, w, step):
            if dist(px[x, y][:3], ref) > tol:
                xs.append(x); ys.append(y)
    if not xs:
        return im
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    s = max(x1 - x0, y1 - y0) / 2 + step
    return im.crop((int(max(cx - s, 0)), int(max(cy - s, 0)), int(min(cx + s, w)), int(min(cy + s, h))))


def mask_shape(im, size=420, circle=False, radius=92):
    w, h = im.size
    s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2)).resize((size, size), Image.LANCZOS)
    ss = size * 4
    mask = Image.new("L", (ss, ss), 0)
    d = ImageDraw.Draw(mask)
    if circle:
        d.ellipse([0, 0, ss - 1, ss - 1], fill=255)
    else:
        d.rounded_rectangle([0, 0, ss - 1, ss - 1], radius=radius * 4, fill=255)
    mask = mask.resize((size, size), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.5))
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def trim_to_square(im, pad=0.035):
    """Crop away the flat margin, then re-pad to a square using the original background colour."""
    bg = im.convert("RGBA").getpixel((0, 0))
    box = flood_cut(im).getbbox()
    src = flood_cut(im)
    if box is None:
        return im
    w, h = src.size
    s = int(max(w, h) * (1 + pad * 2))
    out = Image.new("RGBA", (s, s), bg[:3] + (255,))
    out.paste(src, ((s - w) // 2, (s - h) // 2), src)
    return out


for key, (fn, mode) in SRC.items():
    im = fetch(fn)
    if key in PRECROP:
        w, h = im.size
        m = int(min(w, h) * PRECROP[key])
        im = im.crop((m, m, w - m, h - m))
    if mode == "cut":
        im = flood_cut(im, CUT_TOL.get(key, 42), FORCE_REF.get(key))
        if im.size[0] < 420:
            k = 480 / im.size[0]
            im = im.resize((480, max(1, int(im.size[1] * k))), Image.LANCZOS)
        im.thumbnail((620, 620), Image.LANCZOS)
    elif mode == "circle":
        im = mask_shape(content_square(im), circle=True)
    else:
        if key in TILE_TRIM:
            im = trim_to_square(im)
        im = mask_shape(im)
    if key in LIGHTEN:
        k = LIGHTEN[key]
        px = im.load()
        for y in range(im.size[1]):
            for x in range(im.size[0]):
                r, g, b, a = px[x, y]
                if a > 8 and (r + g + b) / 3 < 150 and max(r, g, b) - min(r, g, b) < 48:
                    px[x, y] = (r + int((255 - r) * k), g + int((255 - g) * k), b + int((255 - b) * k), a)
    if key in CONTRAST:
        rgb = ImageEnhance.Contrast(im.convert("RGB")).enhance(CONTRAST[key])
        rgb.putalpha(im.getchannel("A"))
        im = rgb
    if key in BRIGHTEN:
        rgb = ImageEnhance.Brightness(im.convert("RGB")).enhance(BRIGHTEN[key])
        rgb.putalpha(im.getchannel("A"))
        im = rgb
    im.save(f"{OUT}/{key}.png")
    print(f"{key:13s} {mode:6s} {im.size}")
