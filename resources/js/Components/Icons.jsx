// Icon set ported 1:1 from the original design's ICON map.
// Each entry is the inner <path>/<circle> markup for a 24x24 viewBox.

const ICON = {
  grid: <><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></>,
  cap: <><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" /><circle cx="17.5" cy="9" r="2.6" /><path d="M15.3 14.3c2.6.4 4.7 2.4 4.7 5.7" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  pencil: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></>,
  wallet: <><rect x="2" y="6" width="20" height="14" rx="2.5" /><path d="M16 12h.01" /><path d="M2 10h20" /></>,
  card: <><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20M6 15h4" /></>,
  box: <><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5v-15z" /><path d="M20 18H6.5A2.5 2.5 0 004 20.5" /></>,
  bus: <><rect x="3" y="5" width="18" height="12" rx="2" /><circle cx="7.5" cy="19" r="1.6" /><circle cx="16.5" cy="19" r="1.6" /><path d="M3 11h18" /></>,
  cutlery: <><path d="M6 3v7a2 2 0 002 2v9M6 3v18M10 3v7M18 3s-2 2-2 6 2 3 2 3v9" /></>,
  cross: <><path d="M12 3v18M3 12h18" /></>,
  laptop: <><rect x="4" y="4" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></>,
  chat: <><path d="M21 12a8 8 0 11-3.2-6.4L21 4l-1 4.5A8 8 0 0121 12z" /></>,
  chart: <><path d="M4 20V10M11 20V4M18 20v-7" /></>,
  workflow: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h6a3 3 0 013 3v6" /></>,
  fingerprint: <><path d="M12 2a7 7 0 00-7 7c0 5-2 7-2 7M12 2a7 7 0 017 7c0 6 2 9 2 9M8 19s-2-3-2-8a6 6 0 0112 0c0 1 0 2 .3 3M12 8a3 3 0 00-3 3c0 4-1 6-1.5 7M12 8a3 3 0 013 3c0 3 .4 5 1 6.5" /></>,
  shield: <><path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-4z" /></>,
  cloud: <><path d="M7 18a4.5 4.5 0 01-.5-9 5.5 5.5 0 0110.6-1.6A4.5 4.5 0 0117 18H7z" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.65 1.65 0 00-1.8-.3 1.65 1.65 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.65 1.65 0 00-1-1.5 1.65 1.65 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.65 1.65 0 00.3-1.8 1.65 1.65 0 00-1.5-1H3a2 2 0 110-4h.1a1.65 1.65 0 001.5-1 1.65 1.65 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.65 1.65 0 001.8.3H9a1.65 1.65 0 001-1.5V3a2 2 0 114 0v.1a1.65 1.65 0 001 1.5 1.65 1.65 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.65 1.65 0 00-.3 1.8V9c.4.3 1 .5 1.5.5H21a2 2 0 110 4h-.1a1.65 1.65 0 00-1.5 1z" /></>,
  file: <><path d="M6 3h8l6 6v12H6z" /><path d="M14 3v6h6" /></>,

  excel: (
    <>
        <path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7z" />
        <path d="M14 2v5h5" />
        <path d="M9 10l4 6" />
        <path d="M13 10l-4 6" />
    </>
    ),

  pdf: (
    <>
      <path d="M6 3h8l6 6v12H6z"/>
      <path d="M14 3v6h6"/>
      <path d="M9 13v5M9 13h1.5a1.5 1.5 0 010 3H9M13 13v5M13 15h1.5M16 13v5M16 16h1.2"/>
    </>
  ),

  plus: (
    <>
      <path d="M12 5v14"/>
      <path d="M5 12h14"/>
    </>
  ),

  minus: (
    <>
      <path d="M5 12h14"/>
    </>
  ),

  folder: (
    <>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </>
  ),

  search: (
    <>
      <circle cx="11" cy="11" r="7"/>
      <path d="M20 20l-3.5-3.5"/>
    </>
  ),

  filter: (
    <>
      <path d="M4 6h16"/>
      <path d="M7 12h10"/>
      <path d="M10 18h4"/>
    </>
  ),

  eye: (
    <>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z"/>
      <circle cx="12" cy="12" r="3"/>
    </>
  ),

  eyeOff: (
    <>
      <path d="M3 3l18 18"/>
      <path d="M10.5 6.3A10.6 10.6 0 0112 6c6 0 10 6 10 6a17.8 17.8 0 01-4.2 4.6"/>
      <path d="M6.5 9A17.7 17.7 0 002 12s4 6 10 6a10 10 0 004.5-1"/>
    </>
  ),

  edit: (
    <>
      <path d="M3 21l3.5-.5L19 8a2.1 2.1 0 10-3-3L3.5 17.5 3 21z"/>
      <path d="M14 5l5 5"/>
    </>
  ),

  trash: (
    <>
      <path d="M3 6h18"/>
      <path d="M8 6V4h8v2"/>
      <path d="M6 6l1 14h10l1-14"/>
      <path d="M10 10v6"/>
      <path d="M14 10v6"/>
    </>
  ),

  download: (
    <>
      <path d="M12 3v12"/>
      <path d="M7 10l5 5 5-5"/>
      <path d="M5 21h14"/>
    </>
  ),

  upload: (
    <>
      <path d="M12 21V9"/>
      <path d="M7 14l5-5 5 5"/>
      <path d="M5 3h14"/>
    </>
  ),

  refresh: (
    <>
      <path d="M20 6v6h-6"/>
      <path d="M4 18v-6h6"/>
      <path d="M20 12a8 8 0 00-14-5"/>
      <path d="M4 12a8 8 0 0014 5"/>
    </>
  ),

  logout: (
    <>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <path d="M16 17l5-5-5-5"/>
      <path d="M21 12H9"/>
    </>
  ),

  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V8a4 4 0 018 0v3"/>
    </>
  ),

  bell: (
    <>
      <path d="M18 16V11a6 6 0 10-12 0v5l-2 2h16z"/>
      <path d="M10 20a2 2 0 004 0"/>
    </>
  ),

  close: (
    <>
      <path d="M18 6L6 18"/>
      <path d="M6 6l12 12"/>
    </>
  ),

  check: (
    <>
      <path d="M5 13l4 4L19 7"/>
    </>
  ),
  chevron: <><path d="M9 6l6 6-6 6" /></>, // used for the expand/collapse arrow
};

export default function Icon({ name, className = 'nav-ic' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {ICON[name] || ICON.grid}
    </svg>
  );
}
