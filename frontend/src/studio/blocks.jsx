import React from "react";
import {
  Panel,
  Row,
  Grid,
  Bi,
  TextInput,
  NumberInput,
  Slider,
  Toggle,
  Select,
  ColorInput,
  IconPicker,
  ImagePicker,
  ListEditor,
} from "@/studio/fields";
import { uid, getIn } from "@/studio/util";

const bi = (el = "", en = "") => ({ el, en });

const ALIGN = [
  { value: "left", label: "Αριστερά" },
  { value: "center", label: "Στο κέντρο" },
];
const PADS = [
  { value: "compact", label: "Στενές" },
  { value: "normal", label: "Κανονικές" },
  { value: "roomy", label: "Άνετες" },
  { value: "huge", label: "Πολύ άνετες" },
];
const COLS = [
  { value: "1", label: "1 στήλη" },
  { value: "2", label: "2 στήλες" },
  { value: "3", label: "3 στήλες" },
  { value: "4", label: "4 στήλες" },
];
const RATIOS = [
  { value: "vertical", label: "Κάθετο (Reels/TikTok)" },
  { value: "wide", label: "Πλατύ (16:9)" },
  { value: "square", label: "Τετράγωνο" },
];

export const newBlock = (type) => {
  const id = uid("b");
  const common = { align: "left", padding: "normal" };
  const props = {
    text: { ...common, overline: bi("Νέα ενότητα", "New section"), title: bi("Γράψε εδώ τον τίτλο", "Your headline here"), body: bi("Γράψε εδώ το κείμενό σου.", "Write your copy here.") },
    cards: {
      ...common,
      columns: 3,
      title: bi("Τι προσφέρουμε", "What we offer"),
      items: [1, 2, 3].map((n) => ({ id: uid("c"), icon: "Sparkles", accent: "#60d6ff", visible: true, title: bi(`Κάρτα ${n}`, `Card ${n}`), desc: bi("Σύντομη περιγραφή.", "Short description.") })),
    },
    image: { ...common, image: "", width: 100, radius: 24, caption: bi("", "") },
    gallery: { ...common, columns: 3, radius: 20, title: bi("Gallery", "Gallery"), items: [] },
    video: { ...common, columns: 3, title: bi("Δες τη δουλειά μας", "See our work"), sub: bi("Reels & videos που έφτιαξε το studio μας.", "Reels & videos made by our studio."), items: [] },
    cta: {
      ...common,
      align: "center",
      title: bi("Έτοιμος να ξεκινήσουμε;", "Ready to start?"),
      sub: bi("Στείλε μας μήνυμα και απαντάμε εντός 24 ωρών.", "Send us a message, we reply within 24 hours."),
      primary: bi("Ζήτα προσφορά", "Get a quote"),
      primaryTarget: "contact",
      secondary: bi("", ""),
      gradient: true,
    },
    faq: {
      ...common,
      title: bi("Συχνές ερωτήσεις", "FAQ"),
      items: [1, 2].map((n) => ({ id: uid("q"), visible: true, q: bi(`Ερώτηση ${n};`, `Question ${n}?`), a: bi("Η απάντηση εδώ.", "The answer goes here.") })),
    },
    testimonials: {
      ...common,
      columns: 3,
      title: bi("Τι λένε οι πελάτες μας", "What clients say"),
      items: [1, 2, 3].map((n) => ({ id: uid("t"), visible: true, name: `Πελάτης ${n}`, rating: 5, image: "", role: bi("Ιδιοκτήτης", "Owner"), quote: bi("Εξαιρετική δουλειά και αποτελέσματα.", "Great work and real results.") })),
    },
    pricing: {
      ...common,
      columns: 3,
      title: bi("Πακέτα", "Packages"),
      featuredLabel: bi("Δημοφιλές", "Popular"),
      ctaTarget: "contact",
      items: [
        { id: uid("pl"), visible: true, featured: false, accent: "#60d6ff", price: "€350", name: bi("Starter", "Starter"), period: bi("/μήνα", "/mo"), features: bi("4 videos\n1 γύρισμα\nΒασικό montage", "4 videos\n1 shoot\nBasic editing"), cta: bi("Ξεκίνα", "Start") },
        { id: uid("pl"), visible: true, featured: true, accent: "#facc15", price: "€650", name: bi("Growth", "Growth"), period: bi("/μήνα", "/mo"), features: bi("8 videos\n2 γυρίσματα\nΔιαχείριση social", "8 videos\n2 shoots\nSocial management"), cta: bi("Ξεκίνα", "Start") },
        { id: uid("pl"), visible: true, featured: false, accent: "#4ade80", price: "Custom", name: bi("Premium", "Premium"), period: bi("", ""), features: bi("Απεριόριστα videos\nAds & στρατηγική", "Unlimited videos\nAds & strategy"), cta: bi("Μίλα μαζί μας", "Talk to us") },
      ],
    },
    logos: { ...common, columns: 4, grayscale: true, title: bi("Μας εμπιστεύονται", "Trusted by"), items: [] },
    spacer: { height: 60 },
    divider: { ...common, padding: "compact", style: "line" },
  }[type] || { ...common };

  return { id, type, props };
};

/* --------------------------------------------------------------- item lists */
const GalleryItems = ({ base, d, set, label = "Εικόνες" }) => (
  <ListEditor
    items={getIn(d, `${base}.items`)}
    onChange={(v) => set(`${base}.items`, v)}
    titleOf={(it) => it.caption?.el || it.link || "Εικόνα"}
    newItem={() => ({ id: uid("g"), image: "", link: "", visible: true, caption: bi() })}
    addLabel={`Νέα εικόνα`}
    emptyLabel={`Καμία εικόνα ακόμα — πάτα «Νέα εικόνα»`}
    renderItem={(it, i, setIt) => (
      <>
        <ImagePicker label={label} value={it.image} onChange={(v) => setIt({ ...it, image: v })} />
        <Bi label="Λεζάντα" value={it.caption} onChange={(v) => setIt({ ...it, caption: v })} />
        <Row label="Link (προαιρετικό)">
          <TextInput value={it.link} onChange={(v) => setIt({ ...it, link: v })} placeholder="https://..." />
        </Row>
      </>
    )}
  />
);

/* --------------------------------------------------------------- main editor */
export const BlockFields = ({ block, index, d, set }) => {
  const base = `blocks.${index}.props`;
  const p = block.props || {};
  const t = block.type;

  const layout = (
    <Grid>
      {t !== "spacer" && (
        <Row label="Στοίχιση">
          <Select value={p.align || "left"} onChange={(v) => set(`${base}.align`, v)} options={ALIGN} />
        </Row>
      )}
      {t !== "spacer" && (
        <Row label="Κάθετες αποστάσεις">
          <Select value={p.padding || "normal"} onChange={(v) => set(`${base}.padding`, v)} options={PADS} />
        </Row>
      )}
    </Grid>
  );

  const heads = (
    <>
      <Bi label="Μικρός τίτλος" value={p.overline} onChange={(v) => set(`${base}.overline`, v)} />
      <Bi label="Τίτλος" value={p.title} onChange={(v) => set(`${base}.title`, v)} />
      <Bi label="Υπότιτλος" rows={2} value={p.sub} onChange={(v) => set(`${base}.sub`, v)} />
    </>
  );

  return (
    <div className="space-y-4">
      {t === "spacer" ? (
        <Row label="Ύψος">
          <Slider value={Number(p.height) || 60} onChange={(v) => set(`${base}.height`, v)} min={10} max={320} suffix="px" />
        </Row>
      ) : (
        heads
      )}

      {t === "text" && <Bi label="Κείμενο" rows={6} value={p.body} onChange={(v) => set(`${base}.body`, v)} />}

      {t === "cards" && (
        <>
          <Row label="Στήλες">
            <Select value={String(p.columns || 3)} onChange={(v) => set(`${base}.columns`, Number(v))} options={COLS} />
          </Row>
          <ListEditor
            items={p.items}
            onChange={(v) => set(`${base}.items`, v)}
            titleOf={(it) => it.title?.el || "Κάρτα"}
            newItem={() => ({ id: uid("c"), icon: "Sparkles", accent: "#60d6ff", visible: true, title: bi(), desc: bi() })}
            addLabel="Νέα κάρτα"
            renderItem={(it, i, setIt) => (
              <>
                <Bi label="Τίτλος" value={it.title} onChange={(v) => setIt({ ...it, title: v })} />
                <Bi label="Περιγραφή" rows={3} value={it.desc} onChange={(v) => setIt({ ...it, desc: v })} />
                <Grid>
                  <IconPicker value={it.icon} onChange={(v) => setIt({ ...it, icon: v })} />
                  <Row label="Χρώμα">
                    <ColorInput value={it.accent} onChange={(v) => setIt({ ...it, accent: v })} />
                  </Row>
                </Grid>
              </>
            )}
          />
        </>
      )}

      {t === "image" && (
        <>
          <ImagePicker label="Εικόνα" value={p.image} onChange={(v) => set(`${base}.image`, v)} />
          <Bi label="Λεζάντα" value={p.caption} onChange={(v) => set(`${base}.caption`, v)} />
          <Grid>
            <Row label="Πλάτος">
              <Slider value={Number(p.width) || 100} onChange={(v) => set(`${base}.width`, v)} min={20} max={100} suffix="%" />
            </Row>
            <Row label="Στρογγύλεμα">
              <Slider value={Number(p.radius ?? 24)} onChange={(v) => set(`${base}.radius`, v)} min={0} max={48} suffix="px" />
            </Row>
          </Grid>
        </>
      )}

      {(t === "gallery" || t === "logos") && (
        <>
          <Grid>
            <Row label="Στήλες">
              <Select value={String(p.columns || (t === "logos" ? 4 : 3))} onChange={(v) => set(`${base}.columns`, Number(v))} options={COLS} />
            </Row>
            {t === "gallery" ? (
              <Row label="Στρογγύλεμα">
                <Slider value={Number(p.radius ?? 20)} onChange={(v) => set(`${base}.radius`, v)} min={0} max={48} suffix="px" />
              </Row>
            ) : (
              <Row label=" ">
                <Toggle value={p.grayscale !== false} onChange={(v) => set(`${base}.grayscale`, v)} label="Ασπρόμαυρα μέχρι το hover" />
              </Row>
            )}
          </Grid>
          <GalleryItems base={base} d={d} set={set} label={t === "logos" ? "Λογότυπο" : "Εικόνα"} />
        </>
      )}

      {t === "video" && (
        <>
          <Row label="Στήλες">
            <Select value={String(p.columns || 3)} onChange={(v) => set(`${base}.columns`, Number(v))} options={COLS} />
          </Row>
          <ListEditor
            items={p.items}
            onChange={(v) => set(`${base}.items`, v)}
            titleOf={(it) => it.title?.el || it.url || "Video"}
            subtitleOf={(it) => it.url}
            newItem={() => ({ id: uid("v"), url: "", ratio: "vertical", visible: true, title: bi() })}
            addLabel="Νέο video"
            emptyLabel="Κανένα video — βάλε link από TikTok, Instagram Reel ή YouTube"
            renderItem={(it, i, setIt) => (
              <>
                <Row label="Link video" hint="Επικόλλησε το link από TikTok, Instagram (reel/post), YouTube (και Shorts), Vimeo ή ένα .mp4.">
                  <TextInput value={it.url} onChange={(v) => setIt({ ...it, url: v })} placeholder="https://www.tiktok.com/@.../video/123..." />
                </Row>
                <Grid>
                  <Row label="Σχήμα">
                    <Select value={it.ratio || "vertical"} onChange={(v) => setIt({ ...it, ratio: v })} options={RATIOS} />
                  </Row>
                  <Bi label="Τίτλος (προαιρετικό)" value={it.title} onChange={(v) => setIt({ ...it, title: v })} />
                </Grid>
              </>
            )}
          />
        </>
      )}

      {t === "cta" && (
        <>
          <Grid>
            <Bi label="Κύριο κουμπί" value={p.primary} onChange={(v) => set(`${base}.primary`, v)} />
            <Row label="Πάει σε">
              <Select
                value={p.primaryTarget || "contact"}
                onChange={(v) => set(`${base}.primaryTarget`, v)}
                options={[
                  { value: "contact", label: "Επικοινωνία" },
                  { value: "clients", label: "Συνεργασίες" },
                  { value: "services", label: "Υπηρεσίες" },
                  { value: "results", label: "Αποτελέσματα" },
                  { value: "hero", label: "Αρχή" },
                ]}
              />
            </Row>
          </Grid>
          <Row label="Ή εξωτερικό link (υπερισχύει)">
            <TextInput value={p.primaryUrl} onChange={(v) => set(`${base}.primaryUrl`, v)} placeholder="https://..." />
          </Row>
          <Bi label="Δεύτερο κουμπί" value={p.secondary} onChange={(v) => set(`${base}.secondary`, v)} />
          <Row label="Link δεύτερου κουμπιού">
            <TextInput value={p.secondaryUrl} onChange={(v) => set(`${base}.secondaryUrl`, v)} placeholder="https://..." />
          </Row>
          <Toggle value={p.gradient !== false} onChange={(v) => set(`${base}.gradient`, v)} label="Χρωματιστό glow στο banner" />
        </>
      )}

      {t === "faq" && (
        <ListEditor
          items={p.items}
          onChange={(v) => set(`${base}.items`, v)}
          titleOf={(it) => it.q?.el || "Ερώτηση"}
          newItem={() => ({ id: uid("q"), visible: true, q: bi(), a: bi() })}
          addLabel="Νέα ερώτηση"
          renderItem={(it, i, setIt) => (
            <>
              <Bi label="Ερώτηση" value={it.q} onChange={(v) => setIt({ ...it, q: v })} />
              <Bi label="Απάντηση" rows={4} value={it.a} onChange={(v) => setIt({ ...it, a: v })} />
            </>
          )}
        />
      )}

      {t === "testimonials" && (
        <>
          <Row label="Στήλες">
            <Select value={String(p.columns || 3)} onChange={(v) => set(`${base}.columns`, Number(v))} options={COLS} />
          </Row>
          <ListEditor
            items={p.items}
            onChange={(v) => set(`${base}.items`, v)}
            titleOf={(it) => it.name || "Μαρτυρία"}
            newItem={() => ({ id: uid("t"), visible: true, name: "", rating: 5, image: "", role: bi(), quote: bi() })}
            addLabel="Νέα μαρτυρία"
            renderItem={(it, i, setIt) => (
              <>
                <Bi label="Λόγια πελάτη" rows={3} value={it.quote} onChange={(v) => setIt({ ...it, quote: v })} />
                <Grid>
                  <Row label="Όνομα">
                    <TextInput value={it.name} onChange={(v) => setIt({ ...it, name: v })} />
                  </Row>
                  <Bi label="Ιδιότητα" value={it.role} onChange={(v) => setIt({ ...it, role: v })} />
                </Grid>
                <Grid>
                  <Row label="Αστέρια">
                    <Slider value={Number(it.rating) || 0} onChange={(v) => setIt({ ...it, rating: v })} min={0} max={5} />
                  </Row>
                  <ImagePicker label="Φωτογραφία" value={it.image} onChange={(v) => setIt({ ...it, image: v })} />
                </Grid>
              </>
            )}
          />
        </>
      )}

      {t === "pricing" && (
        <>
          <Grid>
            <Row label="Στήλες">
              <Select value={String(p.columns || 3)} onChange={(v) => set(`${base}.columns`, Number(v))} options={COLS} />
            </Row>
            <Bi label="Ετικέτα «δημοφιλές»" value={p.featuredLabel} onChange={(v) => set(`${base}.featuredLabel`, v)} />
          </Grid>
          <ListEditor
            items={p.items}
            onChange={(v) => set(`${base}.items`, v)}
            titleOf={(it) => `${it.name?.el || "Πακέτο"} — ${it.price || ""}`}
            newItem={() => ({ id: uid("pl"), visible: true, featured: false, accent: "#60d6ff", price: "", name: bi(), period: bi(), features: bi(), cta: bi() })}
            addLabel="Νέο πακέτο"
            renderItem={(it, i, setIt) => (
              <>
                <Bi label="Όνομα πακέτου" value={it.name} onChange={(v) => setIt({ ...it, name: v })} />
                <Grid>
                  <Row label="Τιμή">
                    <TextInput value={it.price} onChange={(v) => setIt({ ...it, price: v })} placeholder="€350" />
                  </Row>
                  <Bi label="Περίοδος" value={it.period} onChange={(v) => setIt({ ...it, period: v })} />
                </Grid>
                <Bi label="Τι περιλαμβάνει (μία γραμμή = ένα τικ)" rows={5} value={it.features} onChange={(v) => setIt({ ...it, features: v })} />
                <Grid>
                  <Bi label="Κουμπί" value={it.cta} onChange={(v) => setIt({ ...it, cta: v })} />
                  <Row label="Χρώμα">
                    <ColorInput value={it.accent} onChange={(v) => setIt({ ...it, accent: v })} />
                  </Row>
                </Grid>
                <Toggle value={!!it.featured} onChange={(v) => setIt({ ...it, featured: v })} label="Να ξεχωρίζει" />
              </>
            )}
          />
        </>
      )}

      {t === "divider" && (
        <Row label="Στυλ">
          <Select
            value={p.style || "line"}
            onChange={(v) => set(`${base}.style`, v)}
            options={[
              { value: "line", label: "Λεπτή γραμμή" },
              { value: "glow", label: "Χρωματιστή λάμψη" },
            ]}
          />
        </Row>
      )}

      {t !== "spacer" && layout}

      {t !== "spacer" && t !== "divider" && (
        <Grid>
          <Row label="Χρώμα φόντου ενότητας" hint="Άφησέ το κενό για το φόντο του site.">
            <ColorInput value={p.bg || ""} onChange={(v) => set(`${base}.bg`, v)} />
          </Row>
          <Row label="Anchor (για links)" hint="π.χ. videos — μετά το link γίνεται #videos">
            <TextInput value={p.anchor} onChange={(v) => set(`${base}.anchor`, v)} placeholder="videos" />
          </Row>
        </Grid>
      )}
    </div>
  );
};

export default BlockFields;
