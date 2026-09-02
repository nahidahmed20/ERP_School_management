import React from 'react';

// Icon set ported 1:1 from the original design's ICON map.
// Each entry is the inner <path>/<circle> markup for a 24x24 viewBox.

const ICON = {
  // --- Existing Icons ---
  cap: <><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
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
  building: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h2v2H8zM14 6h2v2h-2zM8 10h2v2H8zM14 10h2v2h-2zM8 14h2v2H8zM14 14h2v2h-2zM11 18h2v4h-2z" /></>,
  excel: <><path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7z" /><path d="M14 2v5h5" /><path d="M9 10l4 6" /><path d="M13 10l-4 6" /></>,
  pdf: <><path d="M6 3h8l6 6v12H6z"/><path d="M14 3v6h6"/><path d="M9 13v5M9 13h1.5a1.5 1.5 0 010 3H9M13 13v5M13 15h1.5M16 13v5M16 16h1.2"/></>,
  plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  minus: <><path d="M5 12h14"/></>,
  folder: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
  filter: <><path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/></>,
  eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="M3 3l18 18"/><path d="M10.5 6.3A10.6 10.6 0 0112 6c6 0 10 6 10 6a17.8 17.8 0 01-4.2 4.6"/><path d="M6.5 9A17.7 17.7 0 002 12s4 6 10 6a10 10 0 004.5-1"/></>,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
  edit: <><path d="M3 21l3.5-.5L19 8a2.1 2.1 0 10-3-3L3.5 17.5 3 21z"/><path d="M14 5l5 5"/></>,
  trash: <><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 10v6"/><path d="M14 10v6"/></>,
  download: <><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
  upload: <><path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14"/></>,
  refresh: <><path d="M20 6v6h-6"/><path d="M4 18v-6h6"/><path d="M20 12a8 8 0 00-14-5"/><path d="M4 12a8 8 0 0014 5"/></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></>,
  bell: <><path d="M18 16V11a6 6 0 10-12 0v5l-2 2h16z"/><path d="M10 20a2 2 0 004 0"/></>,
  close: <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>,
  check: <><path d="M5 13l4 4L19 7"/></>,
  chevron: <><path d="M9 6l6 6-6 6" /></>,
  'chevron-down': <><path d="m6 9 6 6 6-6" /></>,
  receipt: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  printer: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
  'arrow-left': <><path d="M19 12H5M12 19l-7-7 7-7" /></>,
  'arrow-right': <><path d="M5 12h14M12 5l7 7-7 7" /></>,
  'check-circle': <><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></>,
  'shopping-cart': <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
  cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
  'alert-circle': <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
  tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><path d="M7 7h.01" /></>,
  percent: <><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>,

  // --- Newly Added Missing Icons (For ERP Modules) ---

  // Certificates & Achievements
  award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,

  // Communication & Actions
  send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
  mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,

  // Dashboard & Website CMS
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  layout: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></>,

  // Support & Helpdesk
  ticket: <><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><line x1="13" y1="5" x2="13" y2="19" /></>,

  // Documents & Media
  image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></>,
  'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,

  // UI Utilities
  menu: <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
  ,activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  ,'alert-triangle': <><path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>
  ,archive: <><path d="M3 5h18v4H3zM5 9v11h14V9M10 13h4"/></>
  ,'book-open': <><path d="M2 4h6a4 4 0 0 1 4 4v13a4 4 0 0 0-4-4H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a4 4 0 0 1 4-4h6z"/></>
  ,briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>
  ,camera: <><path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10H2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></>
  ,'check-square': <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 12 3 3 6-7"/></>
  ,'chevron-left': <path d="m15 18-6-6 6-6"/>, 'chevron-right': <path d="m9 18 6-6-6-6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v5M15 1v5M9 18v5M15 18v5M18 9h5M18 15h5M1 9h5M1 15h5"/></>,
  'credit-card': <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
  'currency-dollar': <><circle cx="12" cy="12" r="9"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8M12 5v14"/></>,
  database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
  desktop: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
  disc: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></>,
  'document-search': <><path d="M6 3h8l4 4v6M14 3v5h5"/><circle cx="14" cy="17" r="4"/><path d="m17 20 3 3"/></>,
  'edit-3': <><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  'external-link': <><path d="M15 3h6v6M10 14 21 3M18 13v7H4V6h7"/></>,
  'hard-drive': <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15h.01M11 15h6"/></>,
  hash: <><path d="M5 9h14M4 15h14M10 3 8 21M16 3l-2 18"/></>,
  'help-circle': <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.5 2c-1.2.8-2 1.3-2 3M12 18h.01"/></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
  loader: <><path d="M21 12a9 9 0 1 1-6.2-8.6"/></>,
  'map-pin': <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  'message-square': <><path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z"/></>,
  'minus-circle': <><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></>,
  paperclip: <path d="m21 11-8.5 8.5a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.9-2.9L15 5.6"/>,
  phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/></>,
  'play-circle': <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></>,
  'plus-circle': <><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></>,
  server: <><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6h.01M7 17h.01"/></>,
  sparkles: <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z"/></>,
  star: <path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17l-6.3 3.5L7 13.7 2 9l7-.9Z"/>,
  type: <><path d="M4 6V3h16v3M9 21h6M12 3v18"/></>,
  warning: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/></>,
  'toggle-on': <><rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="16" cy="12" r="3"/></>,
  'toggle-off': <><rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="8" cy="12" r="3"/></>
};

export default function Icon({ name, className = 'nav-ic', style }) {
  const normalizedName = name === 'eye-off' ? 'eyeOff' : name;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {ICON[normalizedName] || ICON.file}
    </svg>
  );
}
