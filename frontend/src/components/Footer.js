import React from "react";
import { useLang } from "@/i18n";
import { useSite, mediaUrl } from "@/content/ContentContext";
import { NETWORKS } from "@/components/SocialIcons";
import { container } from "@/content/style";
import { visibleItems } from "@/content/SectionShell";

export const Footer = () => {
  const { lang } = useLang();
  const { c, L } = useSite(lang);
  const brand = c.brand || {};
  const f = c.footer || {};
  const theme = c.theme || {};
  const accent = theme.accent || "#60d6ff";
  const socials = NETWORKS.filter((n) => brand.socials?.[n.key]);
  const stacked = f.layout === "center";
  const links = visibleItems(f.links);

  return (
    <footer
      data-testid="footer"
      data-sg="section:footer"
      data-sg-kind="section"
      data-sg-label="Ενότητα: Footer"
      className="border-t border-white/[0.07] py-12 sm:py-14"
    >
      <div
        className={`mx-auto flex flex-col items-center gap-8 px-6 text-center sm:px-8 ${
          stacked ? "" : "md:flex-row md:items-center md:justify-between md:text-left"
        }`}
        style={container(theme)}
      >
        <div data-sg="footer.brand" data-sg-kind="box" data-sg-label="Λογότυπο footer" className="flex items-center gap-3">
          {brand.logo && <img src={mediaUrl(brand.logo)} alt="" className="h-9 w-9 object-contain" />}
          <div>
            <p className="font-display text-base font-extrabold leading-none tracking-tight">
              {brand.name}
              <span style={{ color: accent }}>{brand.nameAccent}</span>
            </p>
            <p data-sg="footer.tagline" data-sg-kind="text" data-sg-label="Tagline" className="mt-1.5 text-[11px] text-white/35 sm:text-xs">{L(f.tagline)}</p>
          </div>
        </div>

        {links.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url || "#"}
                target={l.url && l.url.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="text-[12px] font-medium text-white/40 transition-colors hover:text-white"
              >
                {L(l.label)}
              </a>
            ))}
          </div>
        )}

        {f.showSocials !== false && (
          <div className="flex items-center gap-5">
            {(socials.length ? socials : NETWORKS).map(({ key, label, Icon, url }) => {
              const handle = brand.socials?.[key];
              const cls = "text-white/30 transition-colors duration-300 hover:text-white";
              return handle ? (
                <a key={key} href={url(handle)} target="_blank" rel="noreferrer" aria-label={label} data-testid={`footer-social-${label.toLowerCase()}`} className={cls}>
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ) : (
                <span key={key} data-testid={`footer-social-${label.toLowerCase()}`} className={cls}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
              );
            })}
          </div>
        )}

        <p data-sg="footer.rights" data-sg-kind="text" data-sg-label="Κείμενο δικαιωμάτων" className="text-[11px] text-white/30 sm:text-xs">
          © {new Date().getFullYear()} {brand.name}
          {brand.nameAccent}. {L(f.rights)}
        </p>
      </div>
    </footer>
  );
};
