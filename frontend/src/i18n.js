import { createContext, useContext, useState, useCallback } from "react";

export const STRINGS = {
  el: {
    nav: { services: "Υπηρεσίες", clients: "Συνεργασίες", results: "Αποτελέσματα", contact: "Επικοινωνία", cta: "Ξεκίνα τώρα" },
    hero: {
      badge: "Social Media & Video Agency",
      titleA: "Κάνουμε τα μαγαζιά",
      titleB: "viral.",
      sub: "Παράγουμε short-form videos που πουλάνε. TikTok, Instagram, Facebook & YouTube — από την ιδέα μέχρι τα εκατομμύρια προβολές.",
      primary: "Ζήτα προσφορά",
      secondary: "Δες συνεργασίες",
      platforms: "Δουλεύουμε σε",
    },
    stats: {
      overline: "Τα νούμερα μιλάνε",
      title: "Αποτελέσματα, όχι υποσχέσεις",
      items: [
        { value: 100, suffix: "M+", label: "Προβολές συνολικά" },
        { value: 28, suffix: "+", label: "Brands & μαγαζιά" },
        { value: 1200, suffix: "+", label: "Videos παραγωγής" },
        { value: 4, suffix: "", label: "Πλατφόρμες" },
      ],
    },
    services: {
      overline: "Υπηρεσίες",
      title: "Ό,τι χρειάζεται το brand σου",
      sub: "Ένα στούντιο, όλη η δουλειά. Στρατηγική, γύρισμα, montage, δημοσίευση και ads.",
      items: [
        { title: "Short-Form Video", desc: "Reels, TikToks & Shorts με hook στα πρώτα 2 δευτερόλεπτα. Γύρισμα επί τόπου στο μαγαζί σου." },
        { title: "Social Media Διαχείριση", desc: "Πλάνο περιεχομένου, captions, hashtags, προγραμματισμός και καθημερινή παρουσία." },
        { title: "Paid Ads", desc: "Meta & TikTok καμπάνιες με στόχευση σε πελάτες που είναι δίπλα σου." },
        { title: "Food & Product Videography", desc: "Cinematic πλάνα φαγητού και προϊόντων που ανοίγουν την όρεξη και κλείνουν πωλήσεις." },
        { title: "Influencer Collabs", desc: "Συνεργασίες με creators που ταιριάζουν στο κοινό και στον προϋπολογισμό σου." },
        { title: "Branding & Design", desc: "Λογότυπα, μενού, αφίσες και οπτική ταυτότητα που δείχνει premium." },
      ],
    },
    clients: {
      overline: "Συνεργασίες",
      title: "Μαγαζιά & εταιρίες που μας εμπιστεύτηκαν",
      sub: "Από καφετέριες και ψητοπωλεία μέχρι concept stores και εταιρίες αυτοκινήτων.",
    },
    process: {
      overline: "Πώς δουλεύουμε",
      title: "Τέσσερα βήματα",
      items: [
        { t: "Γνωριμία", d: "Μαθαίνουμε το μαγαζί, το κοινό και τους στόχους." },
        { t: "Στρατηγική", d: "Χτίζουμε content plan με concepts και ημερολόγιο." },
        { t: "Παραγωγή", d: "Ερχόμαστε, γυρίζουμε, κάνουμε montage." },
        { t: "Ανάπτυξη", d: "Δημοσίευση, ads, μέτρηση και βελτιστοποίηση." },
      ],
    },
    contact: {
      overline: "Επικοινωνία",
      title: "Ας μεγαλώσουμε το μαγαζί σου",
      sub: "Στείλε μας δύο γραμμές για το brand σου και απαντάμε εντός 24 ωρών.",
      name: "Ονοματεπώνυμο",
      email: "Email",
      business: "Μαγαζί / Εταιρία",
      message: "Πες μας τι θέλεις",
      send: "Αποστολή",
      sending: "Αποστολή...",
      ok: "Ευχαριστούμε! Το μήνυμα στάλθηκε.",
      err: "Κάτι πήγε λάθος. Δοκίμασε ξανά.",
    },
    footer: { rights: "Όλα τα δικαιώματα κατοχυρωμένα.", tagline: "Social media & video production agency." },
  },
  en: {
    nav: { services: "Services", clients: "Clients", results: "Results", contact: "Contact", cta: "Get started" },
    hero: {
      badge: "Social Media & Video Agency",
      titleA: "We make local brands",
      titleB: "go viral.",
      sub: "Short-form video that actually sells. TikTok, Instagram, Facebook & YouTube — from concept to millions of views.",
      primary: "Get a quote",
      secondary: "See our clients",
      platforms: "We work on",
    },
    stats: {
      overline: "The numbers talk",
      title: "Results, not promises",
      items: [
        { value: 100, suffix: "M+", label: "Total views" },
        { value: 28, suffix: "+", label: "Brands & shops" },
        { value: 1200, suffix: "+", label: "Videos produced" },
        { value: 4, suffix: "", label: "Platforms" },
      ],
    },
    services: {
      overline: "Services",
      title: "Everything your brand needs",
      sub: "One studio, the whole job. Strategy, shooting, editing, publishing and ads.",
      items: [
        { title: "Short-Form Video", desc: "Reels, TikToks & Shorts hooked in the first 2 seconds. Filmed on location at your place." },
        { title: "Social Media Management", desc: "Content plan, captions, hashtags, scheduling and daily presence." },
        { title: "Paid Ads", desc: "Meta & TikTok campaigns targeting customers right around the corner." },
        { title: "Food & Product Videography", desc: "Cinematic food and product shots that build appetite and close sales." },
        { title: "Influencer Collabs", desc: "Creator partnerships matched to your audience and your budget." },
        { title: "Branding & Design", desc: "Logos, menus, posters and a visual identity that looks premium." },
      ],
    },
    clients: {
      overline: "Clients",
      title: "Shops & companies that trusted us",
      sub: "From cafes and grill houses to concept stores and car dealers.",
    },
    process: {
      overline: "How we work",
      title: "Four steps",
      items: [
        { t: "Discovery", d: "We learn your shop, audience and goals." },
        { t: "Strategy", d: "We build a content plan with concepts and a calendar." },
        { t: "Production", d: "We show up, we shoot, we edit." },
        { t: "Growth", d: "Publishing, ads, measuring and optimising." },
      ],
    },
    contact: {
      overline: "Contact",
      title: "Let's grow your business",
      sub: "Send us two lines about your brand and we reply within 24 hours.",
      name: "Full name",
      email: "Email",
      business: "Business name",
      message: "Tell us what you need",
      send: "Send message",
      sending: "Sending...",
      ok: "Thank you! Your message was sent.",
      err: "Something went wrong. Please try again.",
    },
    footer: { rights: "All rights reserved.", tagline: "Social media & video production agency." },
  },
};

const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState("el");
  const toggle = useCallback(() => setLang((l) => (l === "el" ? "en" : "el")), []);
  return <LangContext.Provider value={{ lang, setLang, toggle, t: STRINGS[lang] }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
