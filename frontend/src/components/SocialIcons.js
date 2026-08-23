export const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M16.6 5.82A6.3 6.3 0 0 0 15.4 2H12.1v12.6a2.55 2.55 0 1 1-1.8-2.44V8.8a6.03 6.03 0 1 0 5.1 5.96V9.4a6.9 6.9 0 0 0 4.1 1.34V7.4a3.4 3.4 0 0 1-2.9-1.58z" />
  </svg>
);

export const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" />
    <circle cx="12" cy="12" r="4.1" />
    <circle cx="17.35" cy="6.65" r="1.05" fill="currentColor" stroke="none" />
  </svg>
);

export const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13.5 21.9V13.9h2.7l.4-3.2h-3.1V8.7c0-.9.25-1.5 1.55-1.5h1.65V4.15A22 22 0 0 0 14.3 4c-2.4 0-4.05 1.47-4.05 4.17v2.5H7.5v3.23h2.75v8z" />
  </svg>
);

export const YouTubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M21.6 7.2a2.76 2.76 0 0 0-1.94-1.95C17.94 4.8 12 4.8 12 4.8s-5.94 0-7.66.45A2.76 2.76 0 0 0 2.4 7.2C1.95 8.93 1.95 12 1.95 12s0 3.07.45 4.8a2.76 2.76 0 0 0 1.94 1.95c1.72.45 7.66.45 7.66.45s5.94 0 7.66-.45a2.76 2.76 0 0 0 1.94-1.95c.45-1.73.45-4.8.45-4.8s0-3.07-.45-4.8zM10.05 15.3V8.7L15.75 12z" />
  </svg>
);

export const SOCIALS = [
  { name: "TikTok", Icon: TikTokIcon },
  { name: "Instagram", Icon: InstagramIcon },
  { name: "Facebook", Icon: FacebookIcon },
  { name: "YouTube", Icon: YouTubeIcon },
];

export const NETWORK_ICONS = {
  TikTok: TikTokIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  YouTube: YouTubeIcon,
};

/** handle -> profile url, per network key used across the content tree */
export const NETWORKS = [
  { key: "ig", label: "Instagram", Icon: InstagramIcon, url: (h) => `https://www.instagram.com/${h}/` },
  { key: "tt", label: "TikTok", Icon: TikTokIcon, url: (h) => `https://www.tiktok.com/@${h}` },
  { key: "fb", label: "Facebook", Icon: FacebookIcon, url: (h) => `https://www.facebook.com/${h}` },
  { key: "yt", label: "YouTube", Icon: YouTubeIcon, url: (h) => `https://www.youtube.com/@${h}` },
];
