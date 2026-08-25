import React, { useState } from "react";
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
import { uid, slugify, move, getIn, countStyleEntry } from "@/studio/util";
import { FONTS } from "@/content/style";
import { BLOCK_TYPES } from "@/components/Blocks";
import { newBlock, BlockFields } from "@/studio/blocks";
import { TEMPLATES } from "@/studio/templates";

const BUILTIN = ["hero", "clients", "stats", "services", "process", "contact"];

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
  <Panel
    title="Διάταξη & αποστάσεις"
    hint={hint || "Πού κάθονται τα κείμενα και πόσο αέρα έχει η ενότητα."}
    tip="Αν μια ενότητα σου φαίνεται «στριμωγμένη» ή έχει άδειο χώρο, εδώ είναι που το φτιάχνεις."
  >
    <Grid>
      <Row label="Στοίχιση κειμένων" tip="Αν οι τίτλοι και τα κείμενα της ενότητας ξεκινούν από αριστερά ή είναι κεντραρισμένα.">
        <Select value={getIn(d, `${base}.align`) || "left"} onChange={(v) => set(`${base}.align`, v)} options={ALIGN_OPTS} />
      </Row>
      <Row label="Κάθετες αποστάσεις" tip="Πόσος αέρας υπάρχει πάνω και κάτω από την ενότητα. «Στενές» φέρνει τις ενότητες κοντά, «Πολύ άνετες» αφήνει πολύ κενό.">
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
        <Row label="Θέμα" hint="Σε φωτεινό θέμα τα κείμενα γίνονται σκούρα αυτόματα.">
          <Select
            value={d.theme?.mode || "dark"}
            onChange={(v) => set("theme.mode", v)}
            options={[
              { value: "dark", label: "Σκούρο" },
              { value: "light", label: "Φωτεινό" },
            ]}
          />
        </Row>
        {(d.theme?.mode || "dark") === "light" && (
          <Row label="Χρώμα κειμένων">
            <ColorInput value={d.theme?.ink} onChange={(v) => set("theme.ink", v)} />
          </Row>
        )}
      </Grid>
      <Grid>
        <Row label="Accent (κύριο)" tip="Το κύριο χρώμα της μάρκας σου. Χρησιμοποιείται στους μικρούς τίτλους, στα links, στα τικ και στη χρωματιστή λέξη του τίτλου.">
          <ColorInput value={d.theme?.accent} onChange={(v) => set("theme.accent", v)} />
        </Row>
        <Row label="Accent σκούρο (gradient)" tip="Η σκούρα άκρη των ντεγκραντέ. Βάλε μια πιο σκούρα εκδοχή του κύριου χρώματος.">
          <ColorInput value={d.theme?.accentDeep} onChange={(v) => set("theme.accentDeep", v)} />
        </Row>
        <Row label="Accent απαλό (gradient)" tip="Η φωτεινή άκρη των ντεγκραντέ και των λάμψεων στο background.">
          <ColorInput value={d.theme?.accentSoft} onChange={(v) => set("theme.accentSoft", v)} />
        </Row>
      </Grid>
    </Panel>
    <Panel title="Φόντο & καρτέλες" hint="Το γενικό φόντο της σελίδας και το χρώμα των καρτών.">
      <Grid>
        <Row label="Φόντο σελίδας" tip="Το χρώμα πίσω από όλα. Σε σκούρο θέμα κράτα το πολύ σκούρο για να ξεχωρίζουν οι κάρτες.">
          <ColorInput value={d.theme?.bg} onChange={(v) => set("theme.bg", v)} />
        </Row>
        <Row label="Χρώμα καρτών" tip="Το φόντο των καρτών (υπηρεσίες, νούμερα, μαγαζιά). Λίγο πιο φωτεινό από το φόντο σελίδας δίνει το καλύτερο αποτέλεσμα.">
          <ColorInput value={d.theme?.surface} onChange={(v) => set("theme.surface", v)} />
        </Row>
      </Grid>
      <Grid>
        <Row label="Χρώμα περιγράμματος" tip="Το χρώμα των λεπτών γραμμών γύρω από κάρτες και πεδία.">
          <ColorInput value={d.theme?.borderColor} onChange={(v) => set("theme.borderColor", v)} />
        </Row>
        <Row label="Έντασή περιγράμματος" tip="Πόσο έντονα φαίνονται τα περιγράμματα. 0% τα εξαφανίζει τελείως για πιο καθαρό look.">
          <Slider value={d.theme?.borderOpacity ?? 8} onChange={(v) => set("theme.borderOpacity", v)} min={0} max={40} suffix="%" />
        </Row>
      </Grid>
      <Row label="Στρογγύλεμα καρτών" tip="Ισχύει για όλες τις κάρτες του site. Μικρές τιμές = αυστηρό look, μεγάλες = φιλικό.">
        <Slider value={d.theme?.cardRadius ?? 24} onChange={(v) => set("theme.cardRadius", v)} min={0} max={40} suffix="px" />
      </Row>
      <Row
        label="Πλάτος περιεχομένου"
        hint="Πόσο φαρδύ είναι το site στο κέντρο της οθόνης."
        tip="Το μέγιστο πλάτος του περιεχομένου σε μεγάλες οθόνες. Μικρότερη τιμή = πιο μαζεμένο και ευανάγνωστο, μεγαλύτερη = γεμίζει την οθόνη."
      >
        <Slider value={d.theme?.containerWidth ?? 1240} onChange={(v) => set("theme.containerWidth", v)} min={1000} max={1600} step={20} suffix="px" />
      </Row>
    </Panel>

    <Panel
      title="Κείμενα — χρώματα σε όλο το site"
      hint="Αλλάζει με μία κίνηση το χρώμα κάθε κειμένου. Άφησε κενό ό,τι θέλεις να μείνει όπως είναι."
      tip="Εδώ βάφεις ΟΛΑ τα κείμενα μαζί. Αν θέλεις να αλλάξεις ένα μεμονωμένο κείμενο, πάτα το μέσα στο preview και χρησιμοποίησε τα «Χρώματα» του στοιχείου — εκείνο υπερισχύει."
    >
      <Grid>
        <Row label="Χρώμα τίτλων" tip="Ισχύει για όλους τους τίτλους και τις μεγάλες επικεφαλίδες του site.">
          <ColorInput value={d.theme?.text?.heading || ""} onChange={(v) => set("theme.text.heading", v)} />
        </Row>
        <Row label="Χρώμα κειμένων" tip="Το κύριο χρώμα για τα κανονικά κείμενα και τις έντονες λέξεις.">
          <ColorInput value={d.theme?.text?.body || ""} onChange={(v) => set("theme.text.body", v)} />
        </Row>
      </Grid>
      <Row label="Χρώμα δεύτερης σειράς" tip="Τα πιο ξεθωριασμένα κείμενα: υπότιτλοι, περιγραφές, βοηθητικά λόγια. Διάλεξε κάτι πιο απαλό από το κύριο χρώμα.">
        <ColorInput value={d.theme?.text?.muted || ""} onChange={(v) => set("theme.text.muted", v)} />
      </Row>
      <Grid>
        <Row label="Ύψος γραμμής" tip="Το κενό ανάμεσα στις γραμμές σε όλα τα κείμενα. Γύρω στο 1.6 διαβάζεται πολύ άνετα. Άφησέ το στο 0 για αυτόματο.">
          <Slider value={d.theme?.text?.lineHeight ?? 0} onChange={(v) => set("theme.text.lineHeight", v || undefined)} min={0} max={2.4} step={0.05} />
        </Row>
        <Row label="Απόσταση γραμμάτων τίτλων" tip="Σφίγγει ή αραιώνει τα γράμματα σε όλους τους τίτλους. Λίγο αρνητικό δίνει πιο «premium» αποτέλεσμα.">
          <Slider value={d.theme?.text?.headingTracking ?? 0} onChange={(v) => set("theme.text.headingTracking", v)} min={-4} max={8} step={0.25} suffix="px" />
        </Row>
      </Grid>
    </Panel>

    <Panel title="Εφέ" hint="Απενεργοποίησε ό,τι δεν σου αρέσει — το site παραμένει καθαρό.">
      <Toggle value={d.theme?.grain !== false} onChange={(v) => set("theme.grain", v)} label="Υφή κόκκου (grain)" hint="Λεπτή υφή πάνω από όλο το site" />
      <Toggle value={d.theme?.glows !== false} onChange={(v) => set("theme.glows", v)} label="Φωτεινές λάμψεις" hint="Τα χρωματιστά θολά φώτα στο background" />
      <Toggle value={d.theme?.gridLines !== false} onChange={(v) => set("theme.gridLines", v)} label="Γραμμές καννάβου" hint="Το διακριτικό grid στην αρχή και στα νούμερα" />
      <Toggle
        value={d.theme?.motion !== false}
        onChange={(v) => set("theme.motion", v)}
        label="Ενσωματωμένες κινήσεις"
        hint="Οι έτοιμες κινήσεις εμφάνισης του site"
        tip="Αυτές είναι οι κινήσεις που ήρθαν με το site (τα κείμενα της αρχής ανεβαίνουν, τα βήματα εμφανίζονται στο scroll). Κλείσ' τες αν θέλεις να μείνουν μόνο οι δικές σου κινήσεις από την ομάδα «Κίνηση» κάθε στοιχείου."
      />
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
      <Toggle value={d.nav?.showCta !== false} onChange={(v) => set("nav.showCta", v)} label="Εμφάνιση κουμπιού CTA" tip="Το έντονο κουμπί πάνω δεξιά στη μπάρα. Κρύψε το αν θέλεις πιο λιτή μπάρα." />
      <Grid>
        <Row label="Θέση λογοτύπου" tip="Αριστερά είναι το κλασικό. Στο κέντρο δίνει πιο «boutique» αίσθηση, με τα links να μοιράζονται δεξιά κι αριστερά.">
          <Select
            value={d.nav?.logoPosition || "left"}
            onChange={(v) => set("nav.logoPosition", v)}
            options={[
              { value: "left", label: "Αριστερά" },
              { value: "center", label: "Στο κέντρο" },
            ]}
          />
        </Row>
        <Row label="Θέση links" tip="Πού κάθονται τα links μέσα στη μπάρα. Δουλεύει μαζί με τη θέση του λογοτύπου.">
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
      <Toggle
        value={d.nav?.sticky !== false}
        onChange={(v) => set("nav.sticky", v)}
        label="Να μένει κολλημένη στο πάνω μέρος"
        tip="Η μπάρα ακολουθεί τον επισκέπτη καθώς κατεβαίνει, ώστε το κουμπί επικοινωνίας να είναι πάντα διαθέσιμο."
      />
      <Toggle
        value={d.nav?.blur !== false}
        onChange={(v) => set("nav.blur", v)}
        label="Θαμπό γυάλινο φόντο στο scroll"
        tip="Καθώς κατεβαίνεις, η μπάρα αποκτά θολό ημιδιάφανο φόντο ώστε να διαβάζονται τα links πάνω από το περιεχόμενο."
      />
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
      <Toggle value={d.hero?.showImage !== false} onChange={(v) => set("hero.showImage", v)} label="Εμφάνιση εικόνας" tip="Αν την κλείσεις, τα κείμενα της αρχής πιάνουν όλο το πλάτος." />
      <Toggle value={d.hero?.floatImage !== false} onChange={(v) => set("hero.floatImage", v)} label="Να αιωρείται απαλά" tip="Δίνει στην εικόνα μια αργή κίνηση πάνω-κάτω, σαν να επιπλέει." />
      <Row label="Πλευρά εικόνας" tip="Σε ποια πλευρά κάθεται η εικόνα σε desktop. Στο κινητό μπαίνει πάντα κάτω από τα κείμενα.">
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
      <Row label="Θέση κουμπιών" tip="Πού κάθονται τα δύο κουμπιά. Αν έχεις κεντράρει τα κείμενα, κέντραρε και τα κουμπιά για συμμετρία.">
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
      <Row label="Στήλες σε desktop" tip="Σε πόσες στήλες μπαίνουν τα νούμερα σε μεγάλη οθόνη. Διάλεξε αριθμό που να διαιρεί τα νούμερά σου, αλλιώς η τελευταία σειρά μένει μισοάδεια.">
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
      <Row label="Στήλες σε desktop" tip="Σε πόσες στήλες μπαίνουν οι κάρτες υπηρεσιών. Με 6 υπηρεσίες, οι 3 στήλες δίνουν δύο γεμάτες σειρές — καμία μισοάδεια γραμμή.">
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

    <Panel title="Ρυθμίσεις carousel" tip="Το carousel κινείται συνεχώς και σταματάει απαλά όταν περνάς το ποντίκι πάνω του.">
      <Row label="Σειρές" hint="Τα μαγαζιά μοιράζονται αυτόματα στις σειρές." tip="Κάθε σειρά κινείται προς αντίθετη κατεύθυνση. Με πολλά μαγαζιά, 3 σειρές δείχνουν καλύτερα.">
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
      <Row
        label="Ταχύτητα"
        hint="Μικρότερος αριθμός = πιο γρήγορη κίνηση (δευτερόλεπτα ανά γύρο)."
        tip="Πόσα δευτερόλεπτα κάνει μια κάρτα για να διασχίσει την οθόνη. Γύρω στα 50s είναι ήρεμο και διαβάζονται τα λογότυπα."
      >
        <Slider value={d.clients?.speed || 54} onChange={(v) => set("clients.speed", v)} min={15} max={140} suffix="s" />
      </Row>
      <Grid>
        <Row label="Κενό ανάμεσα στις κάρτες" tip="Η απόσταση ανάμεσα στα λογότυπα. Λίγο περισσότερο κενό κάνει το carousel να «ανασαίνει».">
          <Slider value={d.clients?.gap ?? 20} onChange={(v) => set("clients.gap", v)} min={0} max={60} suffix="px" />
        </Row>
        <Row
          label="Σβήσιμο στις άκρες"
          hint="0 = οι κάρτες φτάνουν κολλητά στην άκρη χωρίς fade."
          tip="Σβήνει απαλά τις κάρτες στις δύο άκρες, ώστε να μη «κόβονται» απότομα. Βάλε 0 για σκληρή άκρη."
        >
          <Slider value={d.clients?.fadeEdges ?? 7} onChange={(v) => set("clients.fadeEdges", v)} min={0} max={22} suffix="%" />
        </Row>
      </Grid>
      <Row label="Πλακάκια λογοτύπων" hint="Σκούρα πλακάκια κρατούν ορατά τα λευκά λογότυπα σε φωτεινό θέμα.">
        <Select
          value={d.clients?.logoTiles || "auto"}
          onChange={(v) => set("clients.logoTiles", v)}
          options={[
            { value: "auto", label: "Αυτόματα (σκούρα σε φωτεινό θέμα)" },
            { value: "on", label: "Πάντα σκούρα" },
            { value: "off", label: "Πάντα σαν το θέμα" },
          ]}
        />
      </Row>
      <Toggle value={d.clients?.pauseOnHover !== false} onChange={(v) => set("clients.pauseOnHover", v)} label="Πάγωμα στο hover" tip="Η σειρά σταματάει απαλά όταν ο επισκέπτης βάλει το ποντίκι πάνω, για να δει το λογότυπο." />
      {d.clients?.pauseOnHover !== false && (
        <Row label="Ρελαντί στο hover" tip="0% = σταματάει τελείως. Λίγα τοις εκατό κρατούν μια αργή, «ζωντανή» κίνηση ενώ ο επισκέπτης κοιτάζει — δείχνει πιο δουλεμένο.">
          <Slider value={d.clients?.hoverSpeed ?? 0} onChange={(v) => set("clients.hoverSpeed", v)} min={0} max={60} suffix="%" />
        </Row>
      )}
      <Row label="Ομαλότητα φρένου" tip="Πόσο μαλακά επιταχύνει και φρενάρει η σειρά. Μικρός αριθμός = πολύ βελούδινο και αργό, μεγάλος = πιο απότομο.">
        <Slider value={d.clients?.brake ?? 7} onChange={(v) => set("clients.brake", v)} min={1} max={20} />
      </Row>
      <Toggle
        value={d.clients?.drag === true}
        onChange={(v) => set("clients.drag", v)}
        label="Να γυρίζει με σύρσιμο"
        tip="Ο επισκέπτης μπορεί να σύρει τη σειρά με το ποντίκι ή το δάχτυλο, και συνεχίζει με αδράνεια όταν την αφήσει. Μέσα στο Studio σε «Επιλογή» είναι ανενεργό, ώστε να μη μπερδεύεται με το click-to-edit."
      />
      <Toggle value={d.clients?.showNames !== false} onChange={(v) => set("clients.showNames", v)} label="Εμφάνιση ονομάτων" tip="Το όνομα του μαγαζιού κάτω από το λογότυπο. Κλείσ' το για πιο καθαρό, μόνο-λογότυπα look." />
      <Toggle value={d.clients?.showSocials !== false} onChange={(v) => set("clients.showSocials", v)} label="Εμφάνιση social εικονιδίων" tip="Τα μικρά εικονίδια Instagram / TikTok σε κάθε κάρτα. Εμφανίζονται μόνο για τα μαγαζιά που έχεις συμπληρώσει username." />
      <Row label="Θέση social εικονιδίων" tip="Πού μπαίνουν τα εικονίδια μέσα στην κάρτα σε σχέση με το λογότυπο και το όνομα.">
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
        <Row label="Μέγεθος καρτών" tip="Πόσο μεγάλες είναι οι κάρτες του carousel. Μεγάλες κάρτες = λιγότερες ορατές ταυτόχρονα.">
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
        <Row label="Στρογγύλεμα καρτών" tip="Οι γωνίες των καρτών του carousel, ανεξάρτητα από το γενικό στρογγύλεμα του site.">
          <Slider value={d.clients?.cardRadius ?? 22} onChange={(v) => set("clients.cardRadius", v)} min={0} max={40} suffix="px" />
        </Row>
      </Grid>
      <Row label="Μέγεθος λογοτύπων" tip="Πόσο χώρο πιάνει το λογότυπο μέσα στην κάρτα. Χαμήλωσέ το αν κάποια λογότυπα φαίνονται να «πνίγονται» στην κάρτα.">
        <Slider value={d.clients?.logoMax ?? 100} onChange={(v) => set("clients.logoMax", v)} min={60} max={150} suffix="%" />
      </Row>
      <Grid>
        <Row label="Κατεύθυνση" tip="Προς ποια πλευρά κυλάει κάθε σειρά. Το «Εναλλάξ» δίνει το κλασικό αποτέλεσμα όπου οι σειρές κινούνται αντίθετα και το μάτι δεν κουράζεται.">
          <Select
            value={d.clients?.direction || "alternate"}
            onChange={(v) => set("clients.direction", v)}
            options={[
              { value: "alternate", label: "Εναλλάξ (μία δεξιά, μία αριστερά)" },
              { value: "left", label: "Όλες προς τα αριστερά" },
              { value: "right", label: "Όλες προς τα δεξιά" },
              { value: "manual", label: "Χειροκίνητα ανά σειρά" },
            ]}
          />
        </Row>
        <Row label="Ποικιλία ταχύτητας" tip="Δίνει σε κάθε σειρά ελαφρώς διαφορετική ταχύτητα, ώστε να μη μοιάζουν μηχανικές. 0% = όλες ακριβώς ίδιες.">
          <Slider value={d.clients?.rowVariety ?? 18} onChange={(v) => set("clients.rowVariety", v)} min={0} max={70} suffix="%" />
        </Row>
      </Grid>
      {(d.clients?.direction || "alternate") === "manual" && (
        <div className="rounded-lg border border-white/[0.07] p-3">
          <p className="mb-2.5 flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
            Κατεύθυνση κάθε σειράς
          </p>
          <div className="space-y-2">
            {Array.from({ length: Math.max(1, Math.min(4, Number(d.clients?.rows) || 3)) }).map((_, i) => {
              const dirs = Array.isArray(d.clients?.rowDirs) ? d.clients.rowDirs : [];
              const rev = !!dirs[i];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const next = [...dirs];
                    while (next.length < 4) next.push(false);
                    next[i] = !rev;
                    set("clients.rowDirs", next);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-white/25"
                >
                  <span className="text-[12.5px] font-semibold text-white/75">Σειρά {i + 1}</span>
                  <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#60d6ff]">
                    {rev ? "Προς τα δεξιά →" : "← Προς τα αριστερά"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Panel>

    <Panel
      title="Αντίδραση καρτών στο ποντίκι"
      hint="Τι κάνει η κάρτα του μαγαζιού όταν ο επισκέπτης περνάει από πάνω."
      tip="Κράτα τα διακριτικά: μικρό ανασήκωμα και λίγη λάμψη δείχνουν πολύ πιο ακριβά από μεγάλες κινήσεις."
    >
      <Grid>
        <Row label="Ανασήκωμα" tip="Πόσα pixel σηκώνεται η κάρτα. Γύρω στα 6px είναι το γλυκό σημείο.">
          <Slider value={d.clients?.cardHover?.lift ?? 6} onChange={(v) => set("clients.cardHover.lift", v)} min={0} max={30} suffix="px" />
        </Row>
        <Row label="Μεγέθυνση" tip="100% = καμία μεγέθυνση. 103-106% δίνει διακριτικό «ζωντάνεμα».">
          <Slider value={d.clients?.cardHover?.scale ?? 100} onChange={(v) => set("clients.cardHover.scale", v)} min={90} max={130} suffix="%" />
        </Row>
      </Grid>
      <Grid>
        <Row label="Κλίση 3D" tip="Γέρνει ελαφρώς την κάρτα σε προοπτική, σαν να σηκώνεται προς εσένα. 4-8 μοίρες αρκούν.">
          <Slider value={d.clients?.cardHover?.tilt ?? 0} onChange={(v) => set("clients.cardHover.tilt", v)} min={0} max={20} suffix="°" />
        </Row>
        <Row label="Λάμψη" tip="Φωτεινό γλόου γύρω από την κάρτα. 0 = καμία.">
          <Slider value={d.clients?.cardHover?.glow ?? 0} onChange={(v) => set("clients.cardHover.glow", v)} min={0} max={80} suffix="px" />
        </Row>
      </Grid>
      <Grid>
        <Row label="Χρώμα λάμψης" tip="Άφησέ το κενό για να χρησιμοποιεί το χρώμα του κάθε μαγαζιού.">
          <ColorInput value={d.clients?.cardHover?.glowColor || ""} onChange={(v) => set("clients.cardHover.glowColor", v)} />
        </Row>
        <Row label="Χρώμα περιγράμματος" tip="Το περίγραμμα της κάρτας στο hover. Κενό = το χρώμα του μαγαζιού.">
          <ColorInput value={d.clients?.cardHover?.borderColor || ""} onChange={(v) => set("clients.cardHover.borderColor", v)} />
        </Row>
      </Grid>
      <Grid>
        <Row label="Λογότυπα ασπρόμαυρα" tip="Πόσο ασπρόμαυρα δείχνουν τα λογότυπα ΚΑΝΟΝΙΚΑ. Βάλε 100% εδώ και 0% δίπλα, για να παίρνουν χρώμα μόνο στο hover — δείχνει πολύ κομψό.">
          <Slider value={d.clients?.cardHover?.grayscale ?? 0} onChange={(v) => set("clients.cardHover.grayscale", v)} min={0} max={100} suffix="%" />
        </Row>
        <Row label="Ασπρόμαυρα στο hover" tip="Πόσο ασπρόμαυρο δείχνει το λογότυπο ΟΤΑΝ περνάς το ποντίκι. Συνήθως 0%.">
          <Slider value={d.clients?.cardHover?.grayscaleHover ?? 0} onChange={(v) => set("clients.cardHover.grayscaleHover", v)} min={0} max={100} suffix="%" />
        </Row>
      </Grid>
      <Row label="Ταχύτητα κίνησης" tip="Πόσο γρήγορα γίνεται η αλλαγή στο hover. 300-500ms δείχνει βελούδινο.">
        <Slider value={d.clients?.cardHover?.speed ?? 500} onChange={(v) => set("clients.cardHover.speed", v)} min={80} max={1200} step={20} suffix="ms" />
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
      <Row label="Πλευρά φόρμας" tip="Σε ποια πλευρά μπαίνει η φόρμα σε desktop. Στο κινητό μπαίνει πάντα κάτω από τα κείμενα.">
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
    <Toggle value={d.footer?.showSocials !== false} onChange={(v) => set("footer.showSocials", v)} label="Εμφάνιση social εικονιδίων" tip="Τα social της εταιρίας στο footer. Συμπληρώνονται από «Ταυτότητα & SEO»." />
    <Row label="Διάταξη" tip="«Απλωμένο» βάζει το λογότυπο αριστερά και τα links δεξιά. «Όλα στο κέντρο» τα στοιβάζει κεντραρισμένα — ταιριάζει σε λιτά sites.">
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

/* ================================================================= Layout & blocks */
const SectionRow = ({ title, subtitle, hidden, onToggle, onUp, onDown, first, last, onDrag, children, extra, testId }) => (
  <div className={`rounded-xl border bg-white/[0.02] transition-colors ${children ? "border-[#60d6ff]/40" : "border-white/10"}`} {...onDrag} data-testid={testId}>
    <div className="flex items-center gap-2 px-3 py-2.5">
      <Icons.GripVertical className="h-4 w-4 shrink-0 cursor-grab text-white/25" />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] font-semibold ${hidden ? "text-white/30 line-through" : "text-white/85"}`}>{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-[11px] text-white/35">{subtitle}</p>}
      </div>
      {extra}
      <button type="button" onClick={onToggle} title={hidden ? "Εμφάνιση" : "Κρύψιμο"} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
        {hidden ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
      </button>
      <button type="button" title="Πιο πάνω" data-testid="layout-move-up" onClick={onUp} disabled={first} className="rounded-lg p-1.5 text-white/40 hover:text-white disabled:opacity-20">
        <Icons.ChevronUp className="h-4 w-4" />
      </button>
      <button type="button" title="Πιο κάτω" data-testid="layout-move-down" onClick={onDown} disabled={last} className="rounded-lg p-1.5 text-white/40 hover:text-white disabled:opacity-20">
        <Icons.ChevronDown className="h-4 w-4" />
      </button>
    </div>
    {children && <div className="border-t border-white/[0.07] px-4 py-4">{children}</div>}
  </div>
);

export const LayoutEditor = ({ d, set }) => {
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const dragIdx = React.useRef(null);

  const blocks = Array.isArray(d.blocks) ? d.blocks : [];
  const known = [...BUILTIN, ...blocks.map((b) => `block:${b.id}`)];
  const stored = (Array.isArray(d.layout?.order) ? d.layout.order : []).filter((id) => known.includes(id));
  const full = [...stored, ...known.filter((id) => !stored.includes(id))];
  const hidden = Array.isArray(d.layout?.hidden) ? d.layout.hidden : [];

  const swap = (i, j) => {
    if (j < 0 || j >= full.length) return;
    set("layout.order", move(full, i, j));
  };
  const toggle = (id) => set("layout.hidden", hidden.includes(id) ? hidden.filter((x) => x !== id) : [...hidden, id]);

  const addBlock = (type) => {
    const b = newBlock(type);
    set("blocks", [...blocks, b]);
    set("layout.order", [...full, `block:${b.id}`]);
    setAdding(false);
    setOpenId(`block:${b.id}`);
  };

  const removeBlock = (id) => {
    if (!window.confirm("Να διαγραφεί αυτή η ενότητα;")) return;
    set("blocks", blocks.filter((b) => b.id !== id));
    set("layout.order", full.filter((x) => x !== `block:${id}`));
    setOpenId(null);
  };

  const duplicateBlock = (id) => {
    const src = blocks.find((b) => b.id === id);
    if (!src) return;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = uid("b");
    const at = full.indexOf(`block:${id}`);
    set("blocks", [...blocks, copy]);
    set("layout.order", [...full.slice(0, at + 1), `block:${copy.id}`, ...full.slice(at + 1)]);
    setOpenId(`block:${copy.id}`);
  };

  return (
    <div className="space-y-5">
      <Panel
        title="Ενότητες του site"
        hint="Σύρε ή χρησιμοποίησε τα βελάκια για τη σειρά. Πάτα το μάτι για να κρύψεις μια ενότητα."
      >
        <div className="space-y-2.5">
          {full.map((id, i) => {
            const isBlock = id.startsWith("block:");
            const block = isBlock ? blocks.find((b) => b.id === id.slice(6)) : null;
            const meta = block ? BLOCK_TYPES.find((t) => t.type === block.type) : null;
            const index = block ? blocks.findIndex((b) => b.id === block.id) : -1;
            const open = openId === id;
            return (
              <SectionRow
                key={id}
                testId={`layout-row-${id}`}
                title={isBlock ? `${meta?.label || block?.type || "Ενότητα"}${block?.props?.title?.el ? ` — ${block.props.title.el}` : ""}` : SECTION_LABELS[id] || id}
                subtitle={isBlock ? "Δική σου ενότητα" : "Βασική ενότητα"}
                hidden={hidden.includes(id)}
                onToggle={() => toggle(id)}
                onUp={() => swap(i, i - 1)}
                onDown={() => swap(i, i + 1)}
                first={i === 0}
                last={i === full.length - 1}
                onDrag={{
                  draggable: true,
                  onDragStart: () => { dragIdx.current = i; },
                  onDragOver: (e) => e.preventDefault(),
                  onDrop: () => {
                    if (dragIdx.current === null || dragIdx.current === i) return;
                    set("layout.order", move(full, dragIdx.current, i));
                    dragIdx.current = null;
                  },
                }}
                extra={
                  <>
                    <button
                      type="button"
                      title="Ρυθμίσεις"
                      onClick={() => setOpenId(open ? null : id)}
                      className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                    >
                      <Icons.SlidersHorizontal className="h-3.5 w-3.5" />
                    </button>
                    {isBlock && (
                      <>
                        <button type="button" title="Αντίγραφο" onClick={() => duplicateBlock(block.id)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white">
                          <Icons.Copy className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" title="Διαγραφή" onClick={() => removeBlock(block.id)} className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/15 hover:text-red-300">
                          <Icons.Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </>
                }
              >
                {open &&
                  (isBlock && block ? (
                    <BlockFields block={block} index={index} d={d} set={set} />
                  ) : (
                    <p className="text-[12.5px] leading-relaxed text-white/45">
                      Οι ρυθμίσεις της ενότητας «{SECTION_LABELS[id] || id}» βρίσκονται στο αντίστοιχο μενού αριστερά
                      (ή πάτα το στοιχείο μέσα στο preview).
                    </p>
                  ))}
              </SectionRow>
            );
          })}
        </div>

        {adding ? (
          <div className="rounded-xl border border-[#60d6ff]/40 bg-white/[0.02] p-3.5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Διάλεξε τύπο ενότητας</p>
              <button type="button" onClick={() => setAdding(false)} className="rounded-lg p-1 text-white/40 hover:text-white">
                <Icons.X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BLOCK_TYPES.map((t) => {
                const I = Icons[t.icon] || Icons.Square;
                return (
                  <button
                    key={t.type}
                    type="button"
                    data-testid={`add-block-${t.type}`}
                    onClick={() => addBlock(t.type)}
                    className="rounded-xl border border-white/10 p-3 text-left transition-colors hover:border-[#60d6ff]/60"
                  >
                    <I className="h-4 w-4 text-[#60d6ff]" />
                    <p className="mt-2 text-[12.5px] font-bold text-white/85">{t.label}</p>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-white/35">{t.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button
            type="button"
            data-testid="add-section"
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-[12.5px] font-bold text-white/60 transition-colors hover:border-[#60d6ff]/60 hover:text-white"
          >
            <Icons.Plus className="h-4 w-4" />
            Πρόσθεσε νέα ενότητα
          </button>
        )}
      </Panel>

      <Panel title="Μπάρα & Footer" hint="Μπορείς να κρύψεις τελείως τη μπάρα πλοήγησης ή το footer.">
        <Toggle value={!hidden.includes("nav")} onChange={() => toggle("nav")} label="Εμφάνιση μπάρας πλοήγησης" />
        <Toggle value={!hidden.includes("footer")} onChange={() => toggle("footer")} label="Εμφάνιση footer" />
      </Panel>
    </div>
  );
};

/* ================================================================= Templates */
export const TemplatesEditor = ({ d, onApply, onUndo, canUndo, onResetStyle, onClearStyles }) => {
  const styleKeys = Object.keys(d.styles || {}).filter((k) => countStyleEntry(d.styles[k]) > 0);
  return (
    <div className="space-y-5">
    <Panel
      title="Έτοιμα looks"
      hint="Αλλάζει μόνο την εμφάνιση (χρώματα, γραμματοσειρές, σχήματα). Τα κείμενα, τα μαγαζιά και οι εικόνες σου μένουν ως έχουν."
      right={
        canUndo ? (
          <button type="button" data-testid="template-undo" onClick={onUndo} className="rounded-lg border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/75 hover:border-white/35">
            Αναίρεση
          </button>
        ) : null
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => {
          const active = (d.theme?.accent || "").toLowerCase() === (t.patch["theme.accent"] || "").toLowerCase();
          return (
            <button
              key={t.id}
              type="button"
              data-testid={`template-${t.id}`}
              onClick={() => onApply(t)}
              className={`rounded-2xl border p-4 text-left transition-colors ${active ? "border-[#60d6ff]/60 bg-[#60d6ff]/[0.06]" : "border-white/10 hover:border-white/30"}`}
            >
              <div className="flex items-center gap-1.5">
                {t.swatch.map((c) => (
                  <span key={c} className="h-5 w-5 rounded-full border border-white/15" style={{ backgroundColor: c }} />
                ))}
                {active && <Icons.Check className="ml-auto h-4 w-4 text-[#60d6ff]" />}
              </div>
              <p className="mt-3 font-display text-[14px] font-bold tracking-tight text-white">{t.name}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/40">{t.desc}</p>
            </button>
          );
        })}
      </div>
    </Panel>

    <Panel
      title={`Προσαρμοσμένα στυλ (${styleKeys.length})`}
      hint="Ό,τι έχεις αλλάξει χειροκίνητα σε συγκεκριμένα στοιχεία (θέση, μέγεθος, χρώμα)."
      right={
        styleKeys.length ? (
          <button
            type="button"
            data-testid="clear-all-styles"
            onClick={() => {
              if (window.confirm("Να καθαριστούν ΟΛΑ τα προσαρμοσμένα στυλ στοιχείων;")) onClearStyles();
            }}
            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-300/80 hover:border-red-500/60"
          >
            Καθάρισε όλα
          </button>
        ) : null
      }
    >
      {styleKeys.length ? (
        <div className="space-y-2">
          {styleKeys.map((k) => (
            <div key={k} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <Icons.Wand2 className="h-3.5 w-3.5 shrink-0 text-[#60d6ff]" />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-white/70">{k}</span>
              <button type="button" title="Επαναφορά" onClick={() => onResetStyle(k)} className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/15 hover:text-red-300">
                <Icons.RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-white/12 py-6 text-center text-[12.5px] text-white/35">
          Καμία χειροκίνητη αλλαγή ακόμα — πάτα ένα στοιχείο στο preview για να ξεκινήσεις.
        </p>
      )}
    </Panel>
  </div>
  );
};


/* ================================================================= Design (typography, buttons, icons) */
export const DesignEditor = ({ d, set }) => {
  const fontOptions = FONTS.map((f) => ({ value: f.name, label: f.name }));
  return (
    <div className="space-y-5">
      <Panel title="Γραμματοσειρές" hint="Η πρώτη είναι για τους τίτλους, η δεύτερη για τα κείμενα.">
        <Grid>
          <Row label="Γραμματοσειρά τίτλων" tip="Χρησιμοποιείται στους μεγάλους τίτλους. Εδώ επιτρέπεται κάτι με χαρακτήρα, αφού τα γράμματα είναι λίγα και μεγάλα.">
            <Select value={d.theme?.fonts?.display || "Bricolage Grotesque"} onChange={(v) => set("theme.fonts.display", v)} options={fontOptions} />
          </Row>
          <Row label="Γραμματοσειρά κειμένων" tip="Για όλα τα τρεχούμενα κείμενα και τα κουμπιά. Διάλεξε κάτι ήρεμο και ευανάγνωστο.">
            <Select value={d.theme?.fonts?.body || "Manrope"} onChange={(v) => set("theme.fonts.body", v)} options={fontOptions} />
          </Row>
        </Grid>
        <Row
          label="Γενικό μέγεθος γραμμάτων"
          hint="Μεγαλώνει ή μικραίνει αναλογικά όλο το site."
          tip="Κλιμακώνει ΟΛΑ τα γράμματα του site μαζί, κρατώντας τις αναλογίες. Ο γρήγορος τρόπος να κάνεις το site πιο άνετο στο διάβασμα."
        >
          <Slider value={d.theme?.fonts?.scale ?? 100} onChange={(v) => set("theme.fonts.scale", v)} min={85} max={120} suffix="%" />
        </Row>
        <Row label="Βάρος τίτλων" tip="Πόσο έντονοι είναι οι τίτλοι. Το «Πολύ έντονο» δίνει δυναμικό, διαφημιστικό τόνο· το «Ημι-έντονο» πιο κομψό.">
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
          <Row label="Σχήμα" tip="Το στρογγύλεμα των γωνιών σε όλα τα κουμπιά. Τα «χάπια» δείχνουν φιλικά, τα τετράγωνα πιο αυστηρά και τεχνολογικά.">
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
          <Row label="Μέγεθος" tip="Πόσο μεγάλα και «παχιά» είναι τα κουμπιά. Τα μεγάλα κουμπιά πατιούνται πιο εύκολα στο κινητό.">
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
          <Row label="Χρώμα κύριου κουμπιού" tip="Το φόντο του βασικού κουμπιού δράσης (π.χ. «Ζήτα προσφορά»).">
            <ColorInput value={d.theme?.buttons?.primaryBg} onChange={(v) => set("theme.buttons.primaryBg", v)} />
          </Row>
          <Row label="Χρώμα κειμένου κουμπιού" tip="Τα γράμματα μέσα στο κύριο κουμπί. Κράτα δυνατή αντίθεση με το φόντο του, ώστε να διαβάζεται.">
            <ColorInput value={d.theme?.buttons?.primaryText} onChange={(v) => set("theme.buttons.primaryText", v)} />
          </Row>
        </Grid>
        <Row label="Στυλ δεύτερου κουμπιού" tip="Το δεύτερο κουμπί πρέπει να τραβάει λιγότερο το βλέμμα από το κύριο. «Μόνο κείμενο» είναι το πιο διακριτικό.">
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
          tip="Τα μικρά βελάκια δίνουν την αίσθηση κίνησης προς τα εμπρός. Κλείσ' τα για πιο λιτά, καθαρά κουμπιά."
        />
      </Panel>

      <Panel title="Εικονίδια" hint="Πώς δείχνουν τα τετράγωνα εικονίδια στις υπηρεσίες και στις κάρτες.">
        <Row label="Στυλ" tip="Το πλαίσιο γύρω από κάθε εικονίδιο. Το «Απαλό χρωματιστό» χρησιμοποιεί το χρώμα κάθε υπηρεσίας σε χαμηλή έντασή.">
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
        <Row label="Μέγεθος πλαισίου" tip="Πόσο μεγάλο είναι το τετράγωνο του εικονιδίου μέσα στην κάρτα.">
          <Slider value={d.theme?.icons?.size ?? 100} onChange={(v) => set("theme.icons.size", v)} min={70} max={140} suffix="%" />
        </Row>
      </Panel>
    </div>
  );
};
