import React from "react";
import * as Icons from "lucide-react";
import {
  Panel,
  Row,
  Grid,
  Bi,
  TextInput,
  TextArea,
  NumberInput,
  Slider,
  Toggle,
  Select,
  ColorInput,
  IconPicker,
  ImagePicker,
  ListEditor,
} from "@/studio/fields";
import { uid, slugify, move, getIn } from "@/studio/util";
import { FONTS } from "@/content/style";

const TARGETS = [
  { value: "hero", label: "Αρχή (Hero)" },
  { value: "clients", label: "Συνεργασίες" },
  { value: "results", label: "Αποτελέσματα" },
  { value: "services", label: "Υπηρεσίες" },
  { value: "process", label: "Διαδικασία" },
  { value: "contact", label: "Επικοινωνία" },
];

const SECTION_LABELS = {
  hero: "Αρχή (Hero)",
  clients: "Συνεργασίες (carousel)",
  stats: "Αποτελέσματα (νούμερα)",
  services: "Υπηρεσίες",
  process: "Πώς δουλεύουμε",
  contact: "Επικοινωνία",
};

const emptyBi = () => ({ el: "", en: "" });

const ALIGN_OPTS = [
  { value: "left", label: "Αριστερά" },
  { value: "center", label: "Στο κέντρο" },
];
const PAD_OPTS = [
  { value: "compact", label: "Στενές" },
  { value: "normal", label: "Κανονικές" },
  { value: "roomy", label: "Άνετες" },
  { value: "huge", label: "Πολύ άνετες" },
];

const LayoutPanel = ({ d, set, base, hint, children }) => (
  <Panel title="Διάταξη & αποστάσεις" hint={hint || "Πού κάθονται τα κείμενα και πόσο αέρα έχει η ενότητα."}>
    <Grid>
      <Row label="Στοίχιση κειμένων">
        <Select value={getIn(d, `${base}.align`) || "left"} onChange={(v) => set(`${base}.align`, v)} options={ALIGN_OPTS} />
      </Row>
      <Row label="Κάθετες αποστάσεις">
        <Select value={getIn(d, `${base}.padding`) || "normal"} onChange={(v) => set(`${base}.padding`, v)} options={PAD_OPTS} />
      </Row>
    </Grid>
    {children}
  </Panel>
);

/* ================================================================= General */
export const GeneralEditor = ({ d, set }) => (
  <div className="space-y-5">
    <Panel title="Ταυτότητα" hint="Όνομα, λογότυπο και στοιχεία επικοινωνίας της εταιρίας.">
      <Grid>
        <Row label="Όνομα (λευκό μέρος)">
          <TextInput value={d.brand?.name} onChange={(v) => set("brand.name", v)} placeholder="Social" />
        </Row>
        <Row label="Όνομα (χρωματιστό μέρος)">
          <TextInput value={d.brand?.nameAccent} onChange={(v) => set("brand.nameAccent", v)} placeholder="Growth" />
        </Row>
      </Grid>
      <ImagePicker label="Λογότυπο (navbar & footer)" value={d.brand?.logo} onChange={(v) => set("brand.logo", v)} />
      <ImagePicker
        label="Εικόνα Hero (δεξιά στην αρχή)"
        hint="Αν την αφήσεις κενή, χρησιμοποιείται το λογότυπο."
        value={d.brand?.heroImage}
        onChange={(v) => set("brand.heroImage", v)}
      />
      <Grid>
        <Row label="Email παραλήπτη" hint="Εδώ φτάνουν τα μηνύματα της φόρμας.">
          <TextInput value={d.brand?.email} onChange={(v) => set("brand.email", v)} />
        </Row>
        <Row label="Τηλέφωνο (προαιρετικό)">
          <TextInput value={d.brand?.phone} onChange={(v) => set("brand.phone", v)} />
        </Row>
      </Grid>
    </Panel>

    <Panel title="Social της εταιρίας" hint="Μπες μόνο το username (χωρίς @). Εμφανίζονται στο footer.">
      <Grid>
        <Row label="Instagram">
          <TextInput value={d.brand?.socials?.ig} onChange={(v) => set("brand.socials.ig", v)} placeholder="socialgrowth" />
        </Row>
        <Row label="TikTok">
          <TextInput value={d.brand?.socials?.tt} onChange={(v) => set("brand.socials.tt", v)} />
        </Row>
        <Row label="Facebook">
          <TextInput value={d.brand?.socials?.fb} onChange={(v) => set("brand.socials.fb", v)} />
        </Row>
        <Row label="YouTube">
          <TextInput value={d.brand?.socials?.yt} onChange={(v) => set("brand.socials.yt", v)} />
        </Row>
      </Grid>
    </Panel>

    <Panel title="SEO" hint="Τι βλέπει η Google και τι γράφει ο τίτλος του browser.">
      <Bi label="Τίτλος σελίδας" value={d.seo?.title} onChange={(v) => set("seo.title", v)} />
      <Bi label="Περιγραφή" rows={3} value={d.seo?.description} onChange={(v) => set("seo.description", v)} />
    </Panel>
  </div>
);

/* ================================================================= Theme */
export const ThemeEditor = ({ d, set }) => (
  <div className="space-y-5">
    <Panel title="Χρώματα" hint="Το accent χρησιμοποιείται σε όλους τους μικρούς τίτλους, links και highlights.">
      <Grid>
        <Row label="Accent (κύριο)">
          <ColorInput value={d.theme?.accent} onChange={(v) => set("theme.accent", v)} />
        </Row>
        <Row label="Accent σκούρο (gradient)">
          <ColorInput value={d.theme?.accentDeep} onChange={(v) => set("theme.accentDeep", v)} />
        </Row>
        <Row label="Accent απαλό (gradient)">
          <ColorInput value={d.theme?.accentSoft} onChange={(v) => set("theme.accentSoft", v)} />
        </Row>
      </Grid>
    </Panel>
    <Panel title="Φόντο & καρτέλες" hint="Το γενικό φόντο της σελίδας και το χρώμα των καρτών.">
      <Grid>
        <Row label="Φόντο σελίδας">
          <ColorInput value={d.theme?.bg} onChange={(v) => set("theme.bg", v)} />
        </Row>
        <Row label="Χρώμα καρτών">
          <ColorInput value={d.theme?.surface} onChange={(v) => set("theme.surface", v)} />
        </Row>
      </Grid>
      <Grid>
        <Row label="Χρώμα περιγράμματος">
          <ColorInput value={d.theme?.borderColor} onChange={(v) => set("theme.borderColor", v)} />
        </Row>
        <Row label="Έντασή περιγράμματος">
          <Slider value={d.theme?.borderOpacity ?? 8} onChange={(v) => set("theme.borderOpacity", v)} min={0} max={40} suffix="%" />
        </Row>
      </Grid>
      <Row label="Στρογγύλεμα καρτών">
        <Slider value={d.theme?.cardRadius ?? 24} onChange={(v) => set("theme.cardRadius", v)} min={0} max={40} suffix="px" />
      </Row>
      <Row label="Πλάτος περιεχομένου" hint="Πόσο φαρδύ είναι το site στο κέντρο της οθόνης.">
        <Slider value={d.theme?.containerWidth ?? 1240} onChange={(v) => set("theme.containerWidth", v)} min={1000} max={1600} step={20} suffix="px" />
      </Row>
    </Panel>

    <Panel title="Εφέ" hint="Απενεργοποίησε ό,τι δεν σου αρέσει — το site παραμένει καθαρό.">
      <Toggle value={d.theme?.grain !== false} onChange={(v) => set("theme.grain", v)} label="Υφή κόκκου (grain)" hint="Λεπτή υφή πάνω από όλο το site" />
      <Toggle value={d.theme?.glows !== false} onChange={(v) => set("theme.glows", v)} label="Φωτεινές λάμψεις" hint="Τα χρωματιστά θολά φώτα στο background" />
      <Toggle value={d.theme?.gridLines !== false} onChange={(v) => set("theme.gridLines", v)} label="Γραμμές καννάβου" hint="Το διακριτικό grid στην αρχή και στα νούμερα" />
    </Panel>
  </div>
);

/* ================================================================= Navbar */
export const NavEditor = ({ d, set }) => (
  <div className="space-y-5">
    <Panel title="Μπάρα πλοήγησης" hint="Τα links πάνω δεξιά και το κουμπί δράσης.">
      <Bi label="Κείμενο κουμπιού (CTA)" value={d.nav?.cta} onChange={(v) => set("nav.cta", v)} />
      <Toggle
        value={d.nav?.showLangSwitch !== false}
        onChange={(v) => set("nav.showLangSwitch", v)}
        label="Εμφάνιση διακόπτη EL / EN"
        hint="Κρύψε τον αν θέλεις μόνο ελληνικά"
      />
      <Toggle value={d.nav?.showCta !== false} onChange={(v) => set("nav.showCta", v)} label="Εμφάνιση κουμπιού CTA" />
      <Grid>
        <Row label="Θέση λογοτύπου">
          <Select
            value={d.nav?.logoPosition || "left"}
            onChange={(v) => set("nav.logoPosition", v)}
            options={[
              { value: "left", label: "Αριστερά" },
              { value: "center", label: "Στο κέντρο" },
            ]}
          />
        </Row>
        <Row label="Θέση links">
          <Select
            value={d.nav?.linksAlign || "center"}
            onChange={(v) => set("nav.linksAlign", v)}
            options={[
              { value: "left", label: "Αριστερά" },
              { value: "center", label: "Στο κέντρο" },
              { value: "right", label: "Δεξιά" },
            ]}
          />
        </Row>
      </Grid>
      <Toggle value={d.nav?.sticky !== false} onChange={(v) => set("nav.sticky", v)} label="Να μένει κολλημένη στο πάνω μέρος" />
      <Toggle value={d.nav?.blur !== false} onChange={(v) => set("nav.blur", v)} label="Θαμπό γυάλινο φόντο στο scroll" />
    </Panel>
    <Panel title="Links" hint="Σύρε για αλλαγή σειράς. Ο «Στόχος» είναι η ενότητα όπου σκρολάρει.">
      <ListEditor
        items={d.nav?.items}
        onChange={(v) => set("nav.items", v)}
        titleOf={(it) => it.label?.el || it.label?.en || "Link"}
        subtitleOf={(it) => TARGETS.find((t) => t.value === it.target)?.label || it.target}
        newItem={() => ({ id: uid("n"), label: emptyBi(), target: "services", visible: true })}
        addLabel="Νέο link"
        renderItem={(it, i, setIt) => (
          <>
            <Bi label="Κείμενο" value={it.label} onChange={(v) => setIt({ ...it, label: v })} />
            <Row label="Τι κάνει">
              <Select
                value={it.type || "section"}
                onChange={(v) => setIt({ ...it, type: v })}
                options={[
                  { value: "section", label: "Πάει σε ενότητα του site" },
                  { value: "url", label: "Ανοίγει εξωτερικό link" },
                ]}
              />
            </Row>
            {(it.type || "section") === "section" ? (
              <Row label="Ενότητα">
                <Select value={it.target} onChange={(v) => setIt({ ...it, target: v })} options={TARGETS} />
              </Row>
            ) : (
              <Row label="Διεύθυνση (URL)">
                <TextInput value={it.url} onChange={(v) => setIt({ ...it, url: v })} placeholder="https://..." />
              </Row>
            )}
          </>
        )}
      />
    </Panel>
  </div>
);

/* ================================================================= Hero */
const NETWORK_OPTIONS = [
  { value: "TikTok", label: "TikTok" },
  { value: "Instagram", label: "Instagram" },
  { value: "Facebook", label: "Facebook" },
  { value: "YouTube", label: "YouTube" },
];

export const HeroEditor = ({ d, set }) => (
  <div className="space-y-5">
    <Panel title="Κείμενα αρχής" hint="Ο τίτλος σπάει σε δύο γραμμές: η δεύτερη είναι χρωματιστή.">
      <Toggle value={d.hero?.showBadge !== false} onChange={(v) => set("hero.showBadge", v)} label="Εμφάνιση μικρής ετικέτας πάνω" />
      {d.hero?.showBadge !== false && <Bi label="Ετικέτα" value={d.hero?.badge} onChange={(v) => set("hero.badge", v)} />}
      <Bi label="Τίτλος — 1η γραμμή" value={d.hero?.titleA} onChange={(v) => set("hero.titleA", v)} />
      <Bi label="Τίτλος — 2η γραμμή (χρωματιστή)" value={d.hero?.titleB} onChange={(v) => set("hero.titleB", v)} />
      <Bi label="Υπότιτλος" rows={3} value={d.hero?.sub} onChange={(v) => set("hero.sub", v)} />
    </Panel>

    <Panel title="Κουμπιά" hint="Άφησε ένα κείμενο κενό για να κρυφτεί το κουμπί.">
      <Grid>
        <Bi label="Κύριο κουμπί" value={d.hero?.primary} onChange={(v) => set("hero.primary", v)} />
        <Row label="Πάει στην ενότητα">
          <Select value={d.hero?.primaryTarget || "contact"} onChange={(v) => set("hero.primaryTarget", v)} options={TARGETS} />
        </Row>
      </Grid>
      <Grid>
        <Bi label="Δεύτερο κουμπί" value={d.hero?.secondary} onChange={(v) => set("hero.secondary", v)} />
        <Row label="Πάει στην ενότητα">
          <Select value={d.hero?.secondaryTarget || "clients"} onChange={(v) => set("hero.secondaryTarget", v)} options={TARGETS} />
        </Row>
      </Grid>
    </Panel>

    <Panel title="Πλατφόρμες" hint="Η σειρά με τα λογότυπα των social κάτω από τα κουμπιά.">
      <Bi label="Τίτλος σειράς" value={d.hero?.platformsLabel} onChange={(v) => set("hero.platformsLabel", v)} />
      <ListEditor
        items={d.hero?.platforms}
        onChange={(v) => set("hero.platforms", v)}
        titleOf={(it) => it.label || it.network}
        subtitleOf={(it) => it.network}
        newItem={() => ({ id: uid("p"), network: "Instagram", label: "Instagram", visible: true })}
        addLabel="Νέα πλατφόρμα"
        renderItem={(it, i, setIt) => (
          <Grid>
            <Row label="Εικονίδιο δικτύου">
              <Select value={it.network} onChange={(v) => setIt({ ...it, network: v })} options={NETWORK_OPTIONS} />
            </Row>
            <Row label="Κείμενο">
              <TextInput value={it.label} onChange={(v) => setIt({ ...it, label: v })} />
            </Row>
          </Grid>
        )}
      />
    </Panel>

    <Panel title="Εικόνα" hint="Εμφανίζεται δίπλα στα κείμενα σε desktop.">
      <Toggle value={d.hero?.showImage !== false} onChange={(v) => set("hero.showImage", v)} label="Εμφάνιση εικόνας" />
      <Toggle value={d.hero?.floatImage !== false} onChange={(v) => set("hero.floatImage", v)} label="Να αιωρείται απαλά" />
      <Row label="Πλευρά εικόνας">
        <Select
          value={d.hero?.imageSide || "right"}
          onChange={(v) => set("hero.imageSide", v)}
          options={[
            { value: "right", label: "Δεξιά από τα κείμενα" },
            { value: "left", label: "Αριστερά από τα κείμενα" },
          ]}
        />
      </Row>
      <ImagePicker label="Εικόνα Hero" value={d.brand?.heroImage} onChange={(v) => set("brand.heroImage", v)} />
    </Panel>

    <LayoutPanel d={d} set={set} base="hero" hint="Στοίχιση, αποστάσεις και θέση κουμπιών στην πρώτη οθόνη.">
      <Row label="Θέση κουμπιών">
        <Select
          value={d.hero?.buttonsAlign || "left"}
          onChange={(v) => set("hero.buttonsAlign", v)}
          options={[
            { value: "left", label: "Αριστερά" },
            { value: "center", label: "Στο κέντρο" },
          ]}
        />
      </Row>
    </LayoutPanel>

    <Panel title="Φόντο πρώτης οθόνης" hint="Προαιρετική φωτογραφία πίσω από τα κείμενα.">
      <ImagePicker label="Φωτογραφία φόντου" value={d.hero?.bgImage} onChange={(v) => set("hero.bgImage", v)} />
      {d.hero?.bgImage && (
        <Row label="Σκοτείνιασμα φωτογραφίας" hint="Πιο ψηλά = πιο σκούρο, ώστε να διαβάζονται τα κείμενα.">
          <Slider value={d.hero?.bgOverlay ?? 60} onChange={(v) => set("hero.bgOverlay", v)} min={0} max={95} suffix="%" />
        </Row>
      )}
    </Panel>
  </div>
);

/* ================================================================= Stats */
export const StatsEditor = ({ d, set }) => (
  <div className="space-y-5">
    <Panel title="Επικεφαλίδες" hint="Η ενότητα με τα μεγάλα νούμερα που μετρούν στο scroll.">
      <Bi label="Μικρός τίτλος" value={d.stats?.overline} onChange={(v) => set("stats.overline", v)} />
      <Bi label="Τίτλος" value={d.stats?.title} onChange={(v) => set("stats.title", v)} />
      <Bi label="Σημείωση δεξιά" rows={2} value={d.stats?.note} onChange={(v) => set("stats.note", v)} />
    </Panel>

    <Panel title="Νούμερα" hint="Το «κατάληξη» είναι ό,τι μπαίνει μετά τον αριθμό (π.χ. M+ ή +).">
      <ListEditor
        items={d.stats?.items}
        onChange={(v) => set("stats.items", v)}
        titleOf={(it) => `${it.autoClients ? "auto" : it.value}${it.suffix || ""} — ${it.label?.el || ""}`}
        newItem={() => ({ id: uid("s"), value: 0, suffix: "+", accent: "#60d6ff", visible: true, autoClients: false, label: emptyBi() })}
        addLabel="Νέο νούμερο"
        max={8}
        renderItem={(it, i, setIt) => (
          <>
            <Bi label="Ετικέτα" value={it.label} onChange={(v) => setIt({ ...it, label: v })} />
            <Grid cols={3}>
              <Row label="Αριθμός">
                <NumberInput value={it.value} onChange={(v) => setIt({ ...it, value: v })} min={0} disabled={it.autoClients} />
              </Row>
              <Row label="Κατάληξη">
                <TextInput value={it.suffix} onChange={(v) => setIt({ ...it, suffix: v })} placeholder="M+" />
              </Row>
              <Row label="Χρώμα">
                <ColorInput value={it.accent} onChange={(v) => setIt({ ...it, accent: v })} />
              </Row>
            </Grid>
            <Toggle
              value={!!it.autoClients}
              onChange={(v) => setIt({ ...it, autoClients: v })}
              label="Αυτόματος αριθμός πελατών"
              hint="Μετράει μόνο του πόσα μαγαζιά έχεις στο carousel"
            />
          </>
        )}
      />
    </Panel>

    <LayoutPanel d={d} set={set} base="stats">
      <Row label="Στήλες σε desktop">
        <Select
          value={String(d.stats?.columns || 4)}
          onChange={(v) => set("stats.columns", Number(v))}
          options={[
            { value: "2", label: "2 στήλες" },
            { value: "3", label: "3 στήλες" },
            { value: "4", label: "4 στήλες" },
          ]}
        />
      </Row>
    </LayoutPanel>
  </div>
);

/* ================================================================= Services */
export const ServicesEditor = ({ d, set }) => (
  <div className="space-y-5">
    <Panel title="Επικεφαλίδες">
      <Bi label="Μικρός τίτλος" value={d.services?.overline} onChange={(v) => set("services.overline", v)} />
      <Bi label="Τίτλος" value={d.services?.title} onChange={(v) => set("services.title", v)} />
      <Bi label="Υπότιτλος" rows={2} value={d.services?.sub} onChange={(v) => set("services.sub", v)} />
      <Row label="Στήλες σε desktop">
        <Select
          value={String(d.services?.columns || 3)}
          onChange={(v) => set("services.columns", Number(v))}
          options={[
            { value: "2", label: "2 στήλες" },
            { value: "3", label: "3 στήλες" },
            { value: "4", label: "4 στήλες" },
          ]}
        />
      </Row>
    </Panel>

    <Panel title="Υπηρεσίες" hint="Σύρε για αλλαγή σειράς. Κάθε κάρτα έχει δικό της εικονίδιο και χρώμα.">
      <ListEditor
        items={d.services?.items}
        onChange={(v) => set("services.items", v)}
        titleOf={(it) => it.title?.el || it.title?.en || "Υπηρεσία"}
        subtitleOf={(it) => it.icon}
        newItem={() => ({ id: uid("sv"), icon: "Sparkles", accent: "#60d6ff", visible: true, title: emptyBi(), desc: emptyBi() })}
        addLabel="Νέα υπηρεσία"
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
    </Panel>

    <LayoutPanel d={d} set={set} base="services" />
  </div>
);

/* ================================================================= Clients */
export const ClientsEditor = ({ d, set }) => (
  <div className="space-y-5">
    <Panel title="Επικεφαλίδες">
      <Bi label="Μικρός τίτλος" value={d.clients?.overline} onChange={(v) => set("clients.overline", v)} />
      <Bi label="Τίτλος" value={d.clients?.title} onChange={(v) => set("clients.title", v)} />
      <Bi label="Υπότιτλος" rows={2} value={d.clients?.sub} onChange={(v) => set("clients.sub", v)} />
    </Panel>

    <Panel title="Ρυθμίσεις carousel">
      <Row label="Σειρές" hint="Τα μαγαζιά μοιράζονται αυτόματα στις σειρές.">
        <Select
          value={String(d.clients?.rows || 3)}
          onChange={(v) => set("clients.rows", Number(v))}
          options={[
            { value: "1", label: "1 σειρά" },
            { value: "2", label: "2 σειρές" },
            { value: "3", label: "3 σειρές" },
            { value: "4", label: "4 σειρές" },
          ]}
        />
      </Row>
      <Row label="Ταχύτητα" hint="Μικρότερος αριθμός = πιο γρήγορη κίνηση (δευτερόλεπτα ανά γύρο).">
        <Slider value={d.clients?.speed || 54} onChange={(v) => set("clients.speed", v)} min={15} max={140} suffix="s" />
      </Row>
      <Toggle value={d.clients?.pauseOnHover !== false} onChange={(v) => set("clients.pauseOnHover", v)} label="Πάγωμα στο hover" />
      <Toggle value={d.clients?.showNames !== false} onChange={(v) => set("clients.showNames", v)} label="Εμφάνιση ονομάτων" />
      <Toggle value={d.clients?.showSocials !== false} onChange={(v) => set("clients.showSocials", v)} label="Εμφάνιση social εικονιδίων" />
      <Row label="Θέση social εικονιδίων">
        <Select
          value={d.clients?.socialsPosition || "below"}
          onChange={(v) => set("clients.socialsPosition", v)}
          options={[
            { value: "below", label: "Κάτω από το όνομα" },
            { value: "above", label: "Πάνω από το λογότυπο" },
          ]}
        />
      </Row>
      <Grid>
        <Row label="Μέγεθος καρτών">
          <Select
            value={d.clients?.cardSize || "md"}
            onChange={(v) => set("clients.cardSize", v)}
            options={[
              { value: "sm", label: "Μικρές" },
              { value: "md", label: "Κανονικές" },
              { value: "lg", label: "Μεγάλες" },
            ]}
          />
        </Row>
        <Row label="Στρογγύλεμα καρτών">
          <Slider value={d.clients?.cardRadius ?? 22} onChange={(v) => set("clients.cardRadius", v)} min={0} max={40} suffix="px" />
        </Row>
      </Grid>
      <Row label="Μέγεθος λογοτύπων">
        <Slider value={d.clients?.logoMax ?? 100} onChange={(v) => set("clients.logoMax", v)} min={60} max={150} suffix="%" />
      </Row>
    </Panel>

    <Panel
      title={`Μαγαζιά & εταιρίες (${(d.clients?.items || []).length})`}
      hint="Σύρε για σειρά, πάτα το μάτι για προσωρινό κρύψιμο. Στα social βάλε μόνο το username."
    >
      <ListEditor
        items={d.clients?.items}
        onChange={(v) => set("clients.items", v)}
        titleOf={(it) => it.name || "Νέο μαγαζί"}
        subtitleOf={(it) => it.site || (it.social?.ig ? `@${it.social.ig}` : "")}
        newItem={() => ({
          id: uid("c"),
          name: "",
          nameEn: "",
          icon: "Store",
          logo: "",
          tile: false,
          accent: "#60d6ff",
          site: "",
          visible: true,
          social: { ig: "", tt: "", fb: "", yt: "" },
        })}
        addLabel="Νέο μαγαζί"
        renderItem={(it, i, setIt) => (
          <>
            <Grid>
              <Row label="Όνομα (ελληνικά)">
                <TextInput
                  value={it.name}
                  onChange={(v) => setIt({ ...it, name: v, id: it.id || slugify(v) })}
                  placeholder="π.χ. Crats"
                />
              </Row>
              <Row label="Όνομα (αγγλικά)" hint="Άφησέ το κενό αν είναι το ίδιο.">
                <TextInput value={it.nameEn} onChange={(v) => setIt({ ...it, nameEn: v })} />
              </Row>
            </Grid>

            <ImagePicker
              label="Λογότυπο"
              hint="Στο upload μπορείς να αφαιρέσεις φόντο, να κόψεις κενά και να ανεβάσεις φωτεινότητα."
              value={it.logo}
              onChange={(v) => setIt({ ...it, logo: v })}
            />

            <Grid>
              <Row label="Χρώμα λάμψης">
                <ColorInput value={it.accent} onChange={(v) => setIt({ ...it, accent: v })} />
              </Row>
              <Row label="Website">
                <TextInput value={it.site} onChange={(v) => setIt({ ...it, site: v })} placeholder="https://..." />
              </Row>
            </Grid>

            <Toggle
              value={!!it.tile}
              onChange={(v) => setIt({ ...it, tile: v })}
              label="Το λογότυπο έχει δικό του φόντο"
              hint="Το εμφανίζει ως τετράγωνο πλακίδιο αντί για ελεύθερο λογότυπο"
            />

            <div className="rounded-xl border border-white/10 p-4">
              <p className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/45">Social (μόνο username)</p>
              <Grid>
                <Row label="Instagram">
                  <TextInput value={it.social?.ig} onChange={(v) => setIt({ ...it, social: { ...it.social, ig: v } })} />
                </Row>
                <Row label="TikTok">
                  <TextInput value={it.social?.tt} onChange={(v) => setIt({ ...it, social: { ...it.social, tt: v } })} />
                </Row>
                <Row label="Facebook">
                  <TextInput value={it.social?.fb} onChange={(v) => setIt({ ...it, social: { ...it.social, fb: v } })} />
                </Row>
                <Row label="YouTube">
                  <TextInput value={it.social?.yt} onChange={(v) => setIt({ ...it, social: { ...it.social, yt: v } })} />
                </Row>
              </Grid>
            </div>

            <IconPicker
              label="Εικονίδιο (αν λείπει λογότυπο)"
              value={it.icon}
              onChange={(v) => setIt({ ...it, icon: v })}
            />
          </>
        )}
      />
    </Panel>
  </div>
);

/* ================================================================= Process */
export const ProcessEditor = ({ d, set }) => (
  <div className="space-y-5">
    <Panel title="Επικεφαλίδες">
      <Bi label="Μικρός τίτλος" value={d.process?.overline} onChange={(v) => set("process.overline", v)} />
      <Bi label="Τίτλος" value={d.process?.title} onChange={(v) => set("process.title", v)} />
    </Panel>
    <Panel title="Βήματα" hint="Η αρίθμηση (01, 02...) μπαίνει αυτόματα.">
      <ListEditor
        items={d.process?.items}
        onChange={(v) => set("process.items", v)}
        titleOf={(it) => it.title?.el || it.title?.en || "Βήμα"}
        newItem={() => ({ id: uid("p"), accent: "#60d6ff", visible: true, title: emptyBi(), desc: emptyBi() })}
        addLabel="Νέο βήμα"
        max={8}
        renderItem={(it, i, setIt) => (
          <>
            <Bi label="Τίτλος" value={it.title} onChange={(v) => setIt({ ...it, title: v })} />
            <Bi label="Περιγραφή" rows={2} value={it.desc} onChange={(v) => setIt({ ...it, desc: v })} />
            <Row label="Χρώμα">
              <ColorInput value={it.accent} onChange={(v) => setIt({ ...it, accent: v })} />
            </Row>
          </>
        )}
      />
    </Panel>

    <LayoutPanel d={d} set={set} base="process" />
  </div>
);

/* ================================================================= Contact */
export const ContactEditor = ({ d, set }) => (
  <div className="space-y-5">
    <Panel title="Επικεφαλίδες">
      <Bi label="Μικρός τίτλος" value={d.contact?.overline} onChange={(v) => set("contact.overline", v)} />
      <Bi label="Τίτλος" value={d.contact?.title} onChange={(v) => set("contact.title", v)} />
      <Bi label="Υπότιτλος" rows={2} value={d.contact?.sub} onChange={(v) => set("contact.sub", v)} />
      <Toggle value={d.contact?.showEmail !== false} onChange={(v) => set("contact.showEmail", v)} label="Εμφάνιση email" />
    </Panel>

    <Panel title="Σημεία με τικ" hint="Οι τρεις γραμμές με τα πράσινα τικ.">
      <ListEditor
        items={d.contact?.points}
        onChange={(v) => set("contact.points", v)}
        titleOf={(it) => it?.el || it?.en || "Σημείο"}
        newItem={() => emptyBi()}
        addLabel="Νέο σημείο"
        max={8}
        renderItem={(it, i, setIt) => <Bi label="Κείμενο" value={it} onChange={(v) => setIt(v)} />}
      />
    </Panel>

    <Panel title="Ετικέτες φόρμας" hint="Τα λόγια πάνω από κάθε πεδίο και τα μηνύματα επιτυχίας / λάθους.">
      <Grid>
        <Bi label="Ονοματεπώνυμο" value={d.contact?.labels?.name} onChange={(v) => set("contact.labels.name", v)} />
        <Bi label="Email" value={d.contact?.labels?.email} onChange={(v) => set("contact.labels.email", v)} />
        <Bi label="Μαγαζί / Εταιρία" value={d.contact?.labels?.business} onChange={(v) => set("contact.labels.business", v)} />
        <Bi label="Μήνυμα" value={d.contact?.labels?.message} onChange={(v) => set("contact.labels.message", v)} />
        <Bi label="Κουμπί αποστολής" value={d.contact?.labels?.send} onChange={(v) => set("contact.labels.send", v)} />
        <Bi label="Κατά την αποστολή" value={d.contact?.labels?.sending} onChange={(v) => set("contact.labels.sending", v)} />
        <Bi label="Μήνυμα επιτυχίας" value={d.contact?.labels?.ok} onChange={(v) => set("contact.labels.ok", v)} />
        <Bi label="Μήνυμα λάθους" value={d.contact?.labels?.err} onChange={(v) => set("contact.labels.err", v)} />
      </Grid>
    </Panel>

    <LayoutPanel d={d} set={set} base="contact">
      <Row label="Πλευρά φόρμας">
        <Select
          value={d.contact?.formSide || "right"}
          onChange={(v) => set("contact.formSide", v)}
          options={[
            { value: "right", label: "Φόρμα δεξιά" },
            { value: "left", label: "Φόρμα αριστερά" },
          ]}
        />
      </Row>
    </LayoutPanel>
  </div>
);

/* ================================================================= Footer */
export const FooterEditor = ({ d, set }) => (
  <Panel title="Footer" hint="Η τελευταία γραμμή του site.">
    <Bi label="Tagline κάτω από το λογότυπο" value={d.footer?.tagline} onChange={(v) => set("footer.tagline", v)} />
    <Bi label="Κείμενο δικαιωμάτων" value={d.footer?.rights} onChange={(v) => set("footer.rights", v)} />
    <Toggle value={d.footer?.showSocials !== false} onChange={(v) => set("footer.showSocials", v)} label="Εμφάνιση social εικονιδίων" />
    <Row label="Διάταξη">
      <Select
        value={d.footer?.layout || "spread"}
        onChange={(v) => set("footer.layout", v)}
        options={[
          { value: "spread", label: "Απλωμένο (αριστερά - δεξιά)" },
          { value: "center", label: "Όλα στο κέντρο" },
        ]}
      />
    </Row>
    <div className="pt-1">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/45">Επιπλέον links</p>
      <ListEditor
        items={d.footer?.links}
        onChange={(v) => set("footer.links", v)}
        titleOf={(it) => it.label?.el || it.label?.en || "Link"}
        subtitleOf={(it) => it.url}
        newItem={() => ({ id: uid("fl"), label: emptyBi(), url: "", visible: true })}
        addLabel="Νέο link"
        emptyLabel="Κανένα επιπλέον link"
        renderItem={(it, i, setIt) => (
          <>
            <Bi label="Κείμενο" value={it.label} onChange={(v) => setIt({ ...it, label: v })} />
            <Row label="Διεύθυνση (URL)">
              <TextInput value={it.url} onChange={(v) => setIt({ ...it, url: v })} placeholder="https://..." />
            </Row>
          </>
        )}
      />
    </div>
  </Panel>
);

/* ================================================================= Layout */
export const LayoutEditor = ({ d, set }) => {
  const all = ["hero", "clients", "stats", "services", "process", "contact"];
  const order = (Array.isArray(d.layout?.order) && d.layout.order.length ? d.layout.order : all).filter((s) => all.includes(s));
  const missing = all.filter((s) => !order.includes(s));
  const full = [...order, ...missing];
  const hidden = Array.isArray(d.layout?.hidden) ? d.layout.hidden : [];

  const swap = (i, j) => {
    if (j < 0 || j >= full.length) return;
    set("layout.order", move(full, i, j));
  };

  return (
    <Panel title="Σειρά & εμφάνιση ενοτήτων" hint="Άλλαξε τη σειρά με τα βελάκια ή κρύψε μια ολόκληρη ενότητα.">
      <div className="space-y-2.5">
        {full.map((s, i) => {
          const isHidden = hidden.includes(s);
          return (
            <div key={s} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <span className="w-6 text-[11px] font-extrabold tabular-nums text-white/25">{String(i + 1).padStart(2, "0")}</span>
              <span className={`flex-1 text-[13px] font-semibold ${isHidden ? "text-white/30 line-through" : "text-white/85"}`}>
                {SECTION_LABELS[s] || s}
              </span>
              <button
                type="button"
                onClick={() => set("layout.hidden", isHidden ? hidden.filter((x) => x !== s) : [...hidden, s])}
                className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                title={isHidden ? "Εμφάνιση" : "Κρύψιμο"}
              >
                {isHidden ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => swap(i, i - 1)} disabled={i === 0} className="rounded-lg p-1.5 text-white/40 hover:text-white disabled:opacity-20">
                <Icons.ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => swap(i, i + 1)}
                disabled={i === full.length - 1}
                className="rounded-lg p-1.5 text-white/40 hover:text-white disabled:opacity-20"
              >
                <Icons.ChevronDown className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};


/* ================================================================= Design (typography, buttons, icons) */
export const DesignEditor = ({ d, set }) => {
  const fontOptions = FONTS.map((f) => ({ value: f.name, label: f.name }));
  return (
    <div className="space-y-5">
      <Panel title="Γραμματοσειρές" hint="Η πρώτη είναι για τους τίτλους, η δεύτερη για τα κείμενα.">
        <Grid>
          <Row label="Γραμματοσειρά τίτλων">
            <Select value={d.theme?.fonts?.display || "Bricolage Grotesque"} onChange={(v) => set("theme.fonts.display", v)} options={fontOptions} />
          </Row>
          <Row label="Γραμματοσειρά κειμένων">
            <Select value={d.theme?.fonts?.body || "Manrope"} onChange={(v) => set("theme.fonts.body", v)} options={fontOptions} />
          </Row>
        </Grid>
        <Row label="Γενικό μέγεθος γραμμάτων" hint="Μεγαλώνει ή μικραίνει αναλογικά όλο το site.">
          <Slider value={d.theme?.fonts?.scale ?? 100} onChange={(v) => set("theme.fonts.scale", v)} min={85} max={120} suffix="%" />
        </Row>
        <Row label="Βάρος τίτλων">
          <Select
            value={String(d.theme?.fonts?.headingWeight || 800)}
            onChange={(v) => set("theme.fonts.headingWeight", Number(v))}
            options={[
              { value: "600", label: "Ημι-έντονο" },
              { value: "700", label: "Έντονο" },
              { value: "800", label: "Πολύ έντονο" },
            ]}
          />
        </Row>
      </Panel>

      <Panel title="Κουμπιά" hint="Ισχύει για όλα τα κουμπιά του site.">
        <Grid>
          <Row label="Σχήμα">
            <Select
              value={d.theme?.buttons?.shape || "pill"}
              onChange={(v) => set("theme.buttons.shape", v)}
              options={[
                { value: "pill", label: "Στρογγυλά (χάπι)" },
                { value: "rounded", label: "Ελαφρώς στρογγυλά" },
                { value: "square", label: "Τετράγωνα" },
              ]}
            />
          </Row>
          <Row label="Μέγεθος">
            <Select
              value={d.theme?.buttons?.size || "md"}
              onChange={(v) => set("theme.buttons.size", v)}
              options={[
                { value: "sm", label: "Μικρά" },
                { value: "md", label: "Κανονικά" },
                { value: "lg", label: "Μεγάλα" },
              ]}
            />
          </Row>
        </Grid>
        <Grid>
          <Row label="Χρώμα κύριου κουμπιού">
            <ColorInput value={d.theme?.buttons?.primaryBg} onChange={(v) => set("theme.buttons.primaryBg", v)} />
          </Row>
          <Row label="Χρώμα κειμένου κουμπιού">
            <ColorInput value={d.theme?.buttons?.primaryText} onChange={(v) => set("theme.buttons.primaryText", v)} />
          </Row>
        </Grid>
        <Row label="Στυλ δεύτερου κουμπιού">
          <Select
            value={d.theme?.buttons?.secondaryStyle || "outline"}
            onChange={(v) => set("theme.buttons.secondaryStyle", v)}
            options={[
              { value: "outline", label: "Με περίγραμμα" },
              { value: "solid", label: "Γεμάτο διάφανο" },
              { value: "ghost", label: "Μόνο κείμενο" },
            ]}
          />
        </Row>
        <Toggle
          value={d.theme?.buttons?.showIcons !== false}
          onChange={(v) => set("theme.buttons.showIcons", v)}
          label="Εικονίδια μέσα στα κουμπιά"
          hint="Τα βελάκια και τα μικρά σύμβολα δίπλα στο κείμενο"
        />
      </Panel>

      <Panel title="Εικονίδια" hint="Πώς δείχνουν τα τετράγωνα εικονίδια στις υπηρεσίες και στις κάρτες.">
        <Row label="Στυλ">
          <Select
            value={d.theme?.icons?.style || "soft"}
            onChange={(v) => set("theme.icons.style", v)}
            options={[
              { value: "soft", label: "Απαλό χρωματιστό πλαίσιο" },
              { value: "outline", label: "Μόνο περίγραμμα" },
              { value: "plain", label: "Χωρίς πλαίσιο" },
            ]}
          />
        </Row>
        <Row label="Μέγεθος πλαισίου">
          <Slider value={d.theme?.icons?.size ?? 100} onChange={(v) => set("theme.icons.size", v)} min={70} max={140} suffix="%" />
        </Row>
      </Panel>
    </div>
  );
};
