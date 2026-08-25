import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useLang } from "@/i18n";
import { useSite, mediaUrl } from "@/content/ContentContext";
import { visibleItems } from "@/content/SectionShell";
import { container, pad, headBox, cardStyle, primaryBtn, secondaryBtn, iconBox, iconScale, hexToRgba } from "@/content/style";

export const BLOCK_TYPES = [
  { type: "text", label: "Κείμενο", icon: "Type", hint: "Τίτλος + παράγραφος" },
  { type: "cards", label: "Κάρτες με εικονίδια", icon: "LayoutGrid", hint: "Πλέγμα από κάρτες" },
  { type: "image", label: "Εικόνα", icon: "Image", hint: "Μία εικόνα με λεζάντα" },
  { type: "gallery", label: "Gallery", icon: "Images", hint: "Πλέγμα εικόνων" },
  { type: "video", label: "Videos / Reels", icon: "PlayCircle", hint: "TikTok, Instagram, YouTube" },
  { type: "cta", label: "CTA banner", icon: "Megaphone", hint: "Κάλεσμα σε δράση" },
  { type: "faq", label: "Συχνές ερωτήσεις", icon: "HelpCircle", hint: "Πτυσσόμενες ερωτήσεις" },
  { type: "testimonials", label: "Μαρτυρίες", icon: "Quote", hint: "Λόγια πελατών" },
  { type: "pricing", label: "Τιμοκατάλογος", icon: "Tags", hint: "Πακέτα & τιμές" },
  { type: "logos", label: "Λογότυπα", icon: "Grid3x3", hint: "Απλή σειρά λογοτύπων" },
  { type: "spacer", label: "Κενό διάστημα", icon: "MoveVertical", hint: "Αέρας ανάμεσα σε ενότητες" },
  { type: "divider", label: "Διαχωριστικό", icon: "Minus", hint: "Λεπτή γραμμή" },
];

const COLS = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};
const cols = (n) => COLS[Number(n)] || COLS[3];

/* ------------------------------------------------------------------ embeds */
export const embedFor = (raw) => {
  const url = String(raw || "").trim();
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { src: `https://www.youtube.com/embed/${yt[1]}`, ratio: url.includes("/shorts/") ? "vertical" : "wide" };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { src: `https://player.vimeo.com/video/${vm[1]}`, ratio: "wide" };
  const tk = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|embed\/v2\/)(\d+)/);
  if (tk) return { src: `https://www.tiktok.com/embed/v2/${tk[1]}`, ratio: "vertical" };
  const ig = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/);
  if (ig) return { src: `https://www.instagram.com/p/${ig[1]}/embed`, ratio: "vertical" };
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return { src: url, ratio: "vertical", video: true };
  return { src: url, ratio: "wide" };
};

const ratioPad = (r) => (r === "vertical" ? "177.78%" : r === "square" ? "100%" : "56.25%");

/* ------------------------------------------------------------------ shells */
const Head = ({ p, L, base, theme, align }) => {
  const accent = theme.accent || "#60d6ff";
  const hasHead = L(p.overline) || L(p.title) || L(p.sub);
  if (!hasHead) return null;
  return (
    <div className={`max-w-2xl ${headBox(align)}`}>
      {L(p.overline) && (
        <p data-sg={`${base}.overline`} data-sg-kind="text" data-sg-label="Μικρός τίτλος" className="text-[10px] font-bold uppercase tracking-[0.26em] sm:text-[11px]" style={{ color: accent }}>
          {L(p.overline)}
        </p>
      )}
      {L(p.title) && (
        <h2 data-sg={`${base}.title`} data-sg-kind="text" data-sg-label="Τίτλος" className="mt-4 font-display text-[26px] font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
          {L(p.title)}
        </h2>
      )}
      {L(p.sub) && (
        <p data-sg={`${base}.sub`} data-sg-kind="text" data-sg-label="Υπότιτλος" className="mt-4 text-[13.5px] leading-relaxed text-white/50 sm:mt-5 sm:text-base lg:text-lg">
          {L(p.sub)}
        </p>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ block */
export const Block = ({ block, index }) => {
  const { lang } = useLang();
  const { c, L, preview } = useSite(lang);
  const theme = c.theme || {};
  const p = block.props || {};
  const base = `blocks.${index}.props`;
  const align = p.align || "left";
  const accent = p.accent || theme.accent || "#60d6ff";
  const [openFaq, setOpenFaq] = useState(0);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const items = visibleItems(p.items);

  const Section = ({ children, className = "" }) => (
    <section
      id={p.anchor || `block-${block.id}`}
      data-testid={`block-${block.type}-${block.id}`}
      data-sg={`section:block:${block.id}`}
      data-sg-kind="section"
      data-sg-label={`Ενότητα: ${BLOCK_TYPES.find((b) => b.type === block.type)?.label || block.type}`}
      className={`relative ${pad(p.padding)} ${className}`}
      style={p.bg ? { backgroundColor: p.bg } : undefined}
    >
      <div className="relative mx-auto px-6 sm:px-8" style={container(theme)}>
        {children}
      </div>
    </section>
  );

  const NEEDS_ITEMS = ["cards", "gallery", "logos", "video", "faq", "testimonials", "pricing"];
  if ((NEEDS_ITEMS.includes(block.type) && items.length === 0) || (block.type === "image" && !p.image)) {
    if (!preview) return null;
    return (
      <Section>
        <Head p={p} L={L} base={base} theme={theme} align={align} />
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 py-10 text-center text-[12.5px] leading-relaxed text-white/35">
          Πρόσθεσε περιεχόμενο σε αυτή την ενότητα από το Studio.
          <br />
          Όσο είναι κενή, δεν εμφανίζεται στο site.
        </div>
      </Section>
    );
  }

  if (block.type === "spacer") {
    return (
      <div
        data-sg={`section:block:${block.id}`}
        data-sg-kind="section"
        data-sg-label="Ενότητα: Κενό διάστημα"
        data-testid={`block-spacer-${block.id}`}
        style={{ height: Math.max(0, Math.min(400, Number(p.height) || 60)) }}
      />
    );
  }

  if (block.type === "divider") {
    return (
      <Section>
        <div
          className="h-px w-full"
          style={{
            background:
              p.style === "glow"
                ? `linear-gradient(90deg, transparent, ${accent}, transparent)`
                : `linear-gradient(90deg, transparent, ${hexToRgba(theme.borderColor || "#ffffff", 0.18)}, transparent)`,
          }}
        />
      </Section>
    );
  }

  if (block.type === "text") {
    return (
      <Section>
        <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
          <Head p={p} L={L} base={base} theme={theme} align={align} />
          {L(p.body) && (
            <div
              data-sg={`${base}.body`}
              data-sg-kind="text"
              data-sg-label="Κείμενο"
              className="mt-6 whitespace-pre-wrap text-[14px] leading-relaxed text-white/60 sm:text-base"
            >
              {L(p.body)}
            </div>
          )}
        </div>
      </Section>
    );
  }

  if (block.type === "cards") {
    return (
      <Section>
        <Head p={p} L={L} base={base} theme={theme} align={align} />
        <div className={`mt-10 grid gap-4 sm:mt-14 sm:gap-5 ${cols(p.columns || 3)}`}>
          {items.map((it, i) => {
            const Icon = Icons[it.icon] || Icons.Sparkles;
            const a = it.accent || accent;
            return (
              <article
                key={it.id || i}
                data-sg={`${base}.items.${it._i}`}
                data-sg-kind="card"
                data-sg-label={`Κάρτα ${i + 1}`}
                className={`group relative overflow-hidden p-7 transition-transform duration-500 hover:-translate-y-1 sm:p-8 ${align === "center" ? "text-center" : ""}`}
                style={cardStyle(theme)}
              >
                <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.07] blur-3xl transition-opacity duration-700 group-hover:opacity-[0.2]" style={{ backgroundColor: a }} />
                <div className={`relative flex items-center ${align === "center" ? "justify-center" : ""}`}>
                  <span className="flex items-center justify-center rounded-2xl" style={{ ...iconBox(theme, a), height: 48 * iconScale(theme), width: 48 * iconScale(theme) }}>
                    <Icon className="h-5 w-5" strokeWidth={2} style={{ color: a }} />
                  </span>
                </div>
                <h3 data-sg={`${base}.items.${it._i}.title`} data-sg-kind="text" data-sg-label="Τίτλος κάρτας" className="relative mt-6 font-display text-[18px] font-bold tracking-tight sm:text-xl">
                  {L(it.title)}
                </h3>
                <p data-sg={`${base}.items.${it._i}.desc`} data-sg-kind="text" data-sg-label="Κείμενο κάρτας" className="relative mt-3 text-[13.5px] leading-relaxed text-white/45 sm:text-sm">
                  {L(it.desc)}
                </p>
              </article>
            );
          })}
        </div>
      </Section>
    );
  }

  if (block.type === "image") {
    const w = Math.max(20, Math.min(100, Number(p.width) || 100));
    return (
      <Section>
        <Head p={p} L={L} base={base} theme={theme} align={align} />
        <figure className={`mt-8 ${align === "center" ? "mx-auto" : ""}`} style={{ maxWidth: `${w}%` }}>
          {p.image ? (
            <img
              data-sg={`${base}.image`}
              data-sg-kind="image"
              data-sg-label="Εικόνα"
              src={mediaUrl(p.image)}
              alt={L(p.caption) || ""}
              loading="eager"
              className="w-full object-cover"
              style={{ borderRadius: `${Number(p.radius ?? 24)}px` }}
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/15 text-[13px] text-white/30">
              Διάλεξε εικόνα από το Studio
            </div>
          )}
          {L(p.caption) && (
            <figcaption data-sg={`${base}.caption`} data-sg-kind="text" data-sg-label="Λεζάντα" className="mt-3 text-[12.5px] text-white/40">
              {L(p.caption)}
            </figcaption>
          )}
        </figure>
      </Section>
    );
  }

  if (block.type === "gallery" || block.type === "logos") {
    const isLogos = block.type === "logos";
    return (
      <Section>
        <Head p={p} L={L} base={base} theme={theme} align={align} />
        <div className={`mt-10 grid gap-4 sm:gap-5 ${cols(p.columns || (isLogos ? 4 : 3))}`}>
          {items.map((it, i) => {
            const media = (
              <img
                src={mediaUrl(it.image)}
                alt={L(it.caption) || ""}
                loading="eager"
                className={`w-full object-contain ${isLogos ? "max-h-16" : "aspect-[4/3] object-cover"} ${p.grayscale ? "opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" : ""}`}
                style={{ borderRadius: isLogos ? 0 : `${Number(p.radius ?? 20)}px` }}
              />
            );
            return (
              <figure
                key={it.id || i}
                data-sg={`${base}.items.${it._i}`}
                data-sg-kind="card"
                data-sg-label={isLogos ? `Λογότυπο ${i + 1}` : `Εικόνα ${i + 1}`}
                className={isLogos ? "flex items-center justify-center p-4" : ""}
                style={isLogos ? cardStyle(theme) : undefined}
              >
                {it.link ? (
                  <a href={it.link} target="_blank" rel="noreferrer" className="block w-full">
                    {media}
                  </a>
                ) : (
                  media
                )}
                {!isLogos && L(it.caption) && <figcaption className="mt-2 text-[12px] text-white/40">{L(it.caption)}</figcaption>}
              </figure>
            );
          })}
        </div>
      </Section>
    );
  }

  if (block.type === "video") {
    return (
      <Section>
        <Head p={p} L={L} base={base} theme={theme} align={align} />
        <div className={`mt-10 grid gap-4 sm:mt-14 sm:gap-5 ${cols(p.columns || 3)}`}>
          {items.map((it, i) => {
            const e = embedFor(it.url);
            return (
              <div
                key={it.id || i}
                data-sg={`${base}.items.${it._i}`}
                data-sg-kind="card"
                data-sg-label={`Video ${i + 1}`}
                className="overflow-hidden"
                style={cardStyle(theme)}
              >
                <div className="relative w-full" style={{ paddingBottom: ratioPad(it.ratio || e?.ratio) }}>
                  {e ? (
                    e.video ? (
                      <video src={e.src} controls playsInline className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <iframe
                        src={e.src}
                        title={L(it.title) || `video-${i}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[12.5px] text-white/30">Βάλε ένα link video</div>
                  )}
                </div>
                {L(it.title) && <p className="px-4 py-3 text-[13px] font-semibold text-white/70">{L(it.title)}</p>}
              </div>
            );
          })}
        </div>
      </Section>
    );
  }

  if (block.type === "cta") {
    const pb = primaryBtn(theme);
    const sb = secondaryBtn(theme);
    return (
      <Section>
        <div
          className={`relative overflow-hidden px-6 py-12 sm:px-12 sm:py-16 ${align === "center" ? "text-center" : ""}`}
          style={{
            ...cardStyle(theme),
            backgroundImage: p.gradient === false ? undefined : `radial-gradient(120% 140% at 50% -20%, ${hexToRgba(accent, 0.22)}, transparent 62%)`,
          }}
        >
          <div className={align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}>
            <Head p={p} L={L} base={base} theme={theme} align={align} />
            <div className={`mt-8 flex flex-col gap-3 sm:flex-row sm:items-center ${align === "center" ? "sm:justify-center" : ""}`}>
              {L(p.primary) && (
                <button
                  data-sg={`${base}.primary`}
                  data-sg-kind="button"
                  data-sg-label="Κύριο κουμπί"
                  onClick={() => (p.primaryUrl ? window.open(p.primaryUrl, "_blank", "noreferrer") : go(p.primaryTarget || "contact"))}
                  className={`w-full sm:w-auto ${pb.className}`}
                  style={pb.style}
                >
                  {L(p.primary)}
                </button>
              )}
              {L(p.secondary) && (
                <button
                  data-sg={`${base}.secondary`}
                  data-sg-kind="button"
                  data-sg-label="Δεύτερο κουμπί"
                  onClick={() => (p.secondaryUrl ? window.open(p.secondaryUrl, "_blank", "noreferrer") : go(p.secondaryTarget || "clients"))}
                  className={`w-full sm:w-auto ${sb.className}`}
                  style={sb.style}
                >
                  {L(p.secondary)}
                </button>
              )}
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (block.type === "faq") {
    return (
      <Section>
        <Head p={p} L={L} base={base} theme={theme} align={align} />
        <div className="mt-10 space-y-3 sm:mt-14">
          {items.map((it, i) => {
            const open = openFaq === i;
            return (
              <div key={it.id || i} data-sg={`${base}.items.${it._i}`} data-sg-kind="card" data-sg-label={`Ερώτηση ${i + 1}`} className="overflow-hidden" style={cardStyle(theme)}>
                <button type="button" onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-7 sm:py-5">
                  <span className="font-display text-[15px] font-bold tracking-tight sm:text-[17px]">{L(it.q)}</span>
                  <Icons.ChevronDown className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                </button>
                <div className="grid transition-all duration-300" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
                  <p className="overflow-hidden px-5 pb-5 text-[13.5px] leading-relaxed text-white/50 sm:px-7 sm:pb-6 sm:text-sm">{L(it.a)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    );
  }

  if (block.type === "testimonials") {
    return (
      <Section>
        <Head p={p} L={L} base={base} theme={theme} align={align} />
        <div className={`mt-10 grid gap-4 sm:mt-14 sm:gap-5 ${cols(p.columns || 3)}`}>
          {items.map((it, i) => (
            <figure key={it.id || i} data-sg={`${base}.items.${it._i}`} data-sg-kind="card" data-sg-label={`Μαρτυρία ${i + 1}`} className="relative p-7 sm:p-8" style={cardStyle(theme)}>
              <Icons.Quote className="h-5 w-5" style={{ color: accent }} />
              {Number(it.rating) > 0 && (
                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: Math.min(5, Number(it.rating)) }).map((_, s) => (
                    <Icons.Star key={s} className="h-3.5 w-3.5 fill-current" style={{ color: accent }} />
                  ))}
                </div>
              )}
              <blockquote className="mt-4 text-[13.5px] leading-relaxed text-white/65 sm:text-[14.5px]">{L(it.quote)}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                {it.image && <img src={mediaUrl(it.image)} alt="" className="h-9 w-9 rounded-full object-cover" />}
                <span>
                  <span className="block text-[13px] font-bold text-white/85">{it.name}</span>
                  <span className="block text-[11.5px] text-white/40">{L(it.role)}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    );
  }

  if (block.type === "pricing") {
    const pb = primaryBtn(theme);
    return (
      <Section>
        <Head p={p} L={L} base={base} theme={theme} align={align} />
        <div className={`mt-10 grid gap-4 sm:mt-14 sm:gap-5 ${cols(p.columns || 3)}`}>
          {items.map((it, i) => {
            const a = it.accent || accent;
            const features = String(L(it.features) || "").split("\n").filter(Boolean);
            return (
              <div
                key={it.id || i}
                data-sg={`${base}.items.${it._i}`}
                data-sg-kind="card"
                data-sg-label={`Πακέτο ${i + 1}`}
                className="relative overflow-hidden p-7 sm:p-8"
                style={{ ...cardStyle(theme), boxShadow: it.featured ? `inset 0 0 0 1.5px ${a}` : cardStyle(theme).boxShadow }}
              >
                {it.featured && (
                  <span className="absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider" style={{ backgroundColor: `${a}22`, color: a }}>
                    {L(p.featuredLabel) || "Top"}
                  </span>
                )}
                <p className="font-display text-[15px] font-bold tracking-tight">{L(it.name)}</p>
                <p className="mt-4 font-display text-[38px] font-extrabold leading-none tracking-tighter" style={{ color: a }}>
                  {it.price}
                  {L(it.period) && <span className="ml-1 text-[13px] font-semibold text-white/35">{L(it.period)}</span>}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {features.map((f, k) => (
                    <li key={k} className="flex items-start gap-2.5 text-[13px] text-white/60">
                      <Icons.Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={3} style={{ color: a }} />
                      {f}
                    </li>
                  ))}
                </ul>
                {L(it.cta) && (
                  <button type="button" onClick={() => go(p.ctaTarget || "contact")} className={`mt-7 w-full ${pb.className}`} style={pb.style}>
                    {L(it.cta)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    );
  }

  return null;
};

export default Block;
