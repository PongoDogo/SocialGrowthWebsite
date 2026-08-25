import React, { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { LangProvider, useLang } from "@/i18n";
import { ContentProvider, useSite } from "@/content/ContentContext";
import { sectionOrder } from "@/content/SectionShell";
import { useThemeSetup } from "@/content/style";
import { StyleOverrides } from "@/content/StyleOverrides";
import { PreviewBridge } from "@/content/PreviewBridge";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Services } from "@/components/Services";
import { Clients } from "@/components/Clients";
import { Process } from "@/components/Process";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Block } from "@/components/Blocks";

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
  const { c, L, preview } = useSite(lang);
  const blocks = Array.isArray(c.blocks) ? c.blocks : [];
  const order = sectionOrder(c.layout, ALL, blocks);
  const hiddenIds = Array.isArray(c.layout?.hidden) ? c.layout.hidden : [];
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
    <MotionConfig reducedMotion={theme.motion === false ? "always" : "never"}>
    <div
      className={`App ${theme.grain === false ? "" : "grain"} ${theme.mode === "light" ? "sg-light" : ""}`}
      data-testid="app-root"
      style={theme.mode === "light" ? { backgroundColor: theme.bg || "#f6f6f8" } : undefined}
    >
      <StyleOverrides styles={c.styles} theme={theme} />
      {preview && <PreviewBridge />}
      {!hiddenIds.includes("nav") && <Navbar />}
      <main>
        {order.map((id) => {
          if (id.startsWith("block:")) {
            const bid = id.slice(6);
            const index = blocks.findIndex((b) => b.id === bid);
            return index >= 0 ? <Block key={id} block={blocks[index]} index={index} /> : null;
          }
          const Section = SECTIONS[id];
          return Section ? <Section key={id} /> : null;
        })}
      </main>
      {!hiddenIds.includes("footer") && <Footer />}
    </div>
    </MotionConfig>
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
