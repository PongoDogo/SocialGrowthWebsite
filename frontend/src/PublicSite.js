import React, { useEffect } from "react";
import { LangProvider, useLang } from "@/i18n";
import { ContentProvider, useSite } from "@/content/ContentContext";
import { sectionOrder } from "@/content/SectionShell";
import { useThemeSetup } from "@/content/style";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Services } from "@/components/Services";
import { Clients } from "@/components/Clients";
import { Process } from "@/components/Process";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const SECTIONS = {
  hero: Hero,
  clients: Clients,
  stats: Stats,
  services: Services,
  process: Process,
  contact: Contact,
};

const ALL = ["hero", "clients", "stats", "services", "process", "contact"];

const SiteBody = () => {
  const { lang } = useLang();
  const { c, L } = useSite(lang);
  const order = sectionOrder(c.layout, ALL);
  const theme = c.theme || {};

  useThemeSetup(theme);

  useEffect(() => {
    const title = L(c.seo?.title);
    if (title) document.title = title;
    const desc = L(c.seo?.description);
    if (desc) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", desc);
    }
  }, [c.seo, L]);

  return (
    <div className={`App ${theme.grain === false ? "" : "grain"}`} data-testid="app-root">
      <Navbar />
      <main>
        {order.map((id) => {
          const Section = SECTIONS[id];
          return Section ? <Section key={id} /> : null;
        })}
      </main>
      <Footer />
    </div>
  );
};

export const PublicSite = () => (
  <LangProvider>
    <ContentProvider>
      <SiteBody />
    </ContentProvider>
  </LangProvider>
);

export default PublicSite;
