// Registry of selectable ID card design templates.
//
// Every design = a structural "shape" combined with a color "accent" treatment.
// Because a single <IdCardPreview> component renders every shape/accent
// combination, growing the gallery is just adding a row here — no new
// rendering code needed. Ships with 12 curated combos; safe to extend
// toward 20 the same way.

export const CARD_SIZE = {
  Portrait: { width: 240, height: 380 },
  Landscape: { width: 380, height: 240 },
};

export const FIELD_LABEL_DEFAULTS = {
  id: 'ID',
  class: 'Class',
  roll: 'Roll',
  dob: 'DOB',
  phone: 'Phone',
  blood: 'Blood Group',
  address: 'Address',
};

export const CARD_TEMPLATES = [
  { key: 'classic-solid', name: 'Classic Band', shape: 'classic', accent: 'solid', orientation: 'any' },
  { key: 'classic-gradient', name: 'Classic Gradient', shape: 'classic', accent: 'gradient', orientation: 'any' },
  { key: 'classic-pattern', name: 'Classic Dotted', shape: 'classic', accent: 'pattern', orientation: 'any' },
  { key: 'banner-solid', name: 'Banner Ribbon', shape: 'banner', accent: 'solid', orientation: 'any' },
  { key: 'banner-gradient', name: 'Banner Gradient', shape: 'banner', accent: 'gradient', orientation: 'any' },
  { key: 'banner-pattern', name: 'Banner Dotted', shape: 'banner', accent: 'pattern', orientation: 'any' },
  { key: 'framed-outline', name: 'Framed Border', shape: 'framed', accent: 'outline', orientation: 'any' },
  { key: 'framed-solid', name: 'Framed Gold Strip', shape: 'framed', accent: 'solid', orientation: 'any' },
  { key: 'minimal-outline', name: 'Minimal Line', shape: 'minimal', accent: 'outline', orientation: 'any' },
  { key: 'minimal-solid', name: 'Minimal Bold', shape: 'minimal', accent: 'solid', orientation: 'any' },
  { key: 'split-solid', name: 'Split Panel', shape: 'split', accent: 'solid', orientation: 'Landscape' },
  { key: 'split-gradient', name: 'Split Panel Gradient', shape: 'split', accent: 'gradient', orientation: 'Landscape' },
];

export function shadeColor(hex, percent) {
  // darken (negative percent) or lighten (positive percent) a hex color
  let color = (hex || '#1e293b').replace('#', '');
  if (color.length === 3) color = color.split('').map((c) => c + c).join('');
  const num = parseInt(color, 16) || 0;
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
  let b = (num & 0x0000ff) + Math.round(2.55 * percent);
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Returns a style object to spread onto the header/footer element.
export function accentStyle(accent, color) {
  switch (accent) {
    case 'gradient':
      return { background: `linear-gradient(135deg, ${color}, ${shadeColor(color, -22)})` };
    case 'pattern':
      return {
        backgroundColor: color,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.28) 1px, transparent 1px)',
        backgroundSize: '9px 9px',
      };
    case 'outline':
      return { background: 'transparent' };
    case 'solid':
    default:
      return { background: color };
  }
}

export function isFilledAccent(accent) {
  return accent !== 'outline';
}

export function findTemplate(key) {
  return CARD_TEMPLATES.find((t) => t.key === key) || CARD_TEMPLATES[0];
}
