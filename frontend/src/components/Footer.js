import { useLang } from "@/i18n";
import { SOCIALS } from "@/components/SocialIcons";

export const Footer = () => {
  const { t } = useLang();
  return (
    <footer data-testid="footer" className="border-t border-white/[0.07] py-12 sm:py-14">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-8 px-6 text-center sm:px-8 md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SocialGrowth" className="h-9 w-9 object-contain" />
          <div>
            <p className="font-display text-base font-extrabold leading-none tracking-tight">
              Social<span className="text-[#60d6ff]">Growth</span>
            </p>
            <p className="mt-1.5 text-[11px] text-white/35 sm:text-xs">{t.footer.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {SOCIALS.map(({ name, Icon }) => (
            <span key={name} data-testid={`footer-social-${name.toLowerCase()}`} className="text-white/30 transition-colors duration-300 hover:text-white">
              <Icon className="h-[18px] w-[18px]" />
            </span>
          ))}
        </div>

        <p className="text-[11px] text-white/30 sm:text-xs">© {new Date().getFullYear()} SocialGrowth. {t.footer.rights}</p>
      </div>
    </footer>
  );
};
