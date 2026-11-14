/**
 * Canvas LMS Institutional Theme & Palette Engine
 * Inspired by Instructure Canvas LMS Course Cards and Component Architecture.
 */

export interface CanvasPalette {
  id: string;
  name: string;
  bgGradient: string;       // Rich header banner background
  accentHex: string;        // Matching category text & icon color
  badgeBg: string;          // Soft pill background & border
  circleMenuBg: string;     // Floating circular action button on cover
  hoverBorder: string;      // Border color on card hover
  lightTint: string;        // Very soft background tint
}

export const CANVAS_PALETTES: CanvasPalette[] = [
  {
    id: "ruby",
    name: "Crimson Ruby",
    bgGradient: "from-[#be123c] via-[#e11d48] to-[#881337]",
    accentHex: "#be123c",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    circleMenuBg: "bg-[#e11d48] text-white hover:bg-[#be123c]",
    hoverBorder: "hover:border-rose-400",
    lightTint: "bg-rose-50/40",
  },
  {
    id: "emerald",
    name: "Forest Emerald",
    bgGradient: "from-[#15803d] via-[#16a34a] to-[#14532d]",
    accentHex: "#15803d",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    circleMenuBg: "bg-[#16a34a] text-white hover:bg-[#15803d]",
    hoverBorder: "hover:border-emerald-400",
    lightTint: "bg-emerald-50/40",
  },
  {
    id: "cyan",
    name: "Ocean Sapphire",
    bgGradient: "from-[#0369a1] via-[#0284c7] to-[#0c4a6e]",
    accentHex: "#0284c7",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    circleMenuBg: "bg-[#0284c7] text-white hover:bg-[#0369a1]",
    hoverBorder: "hover:border-sky-400",
    lightTint: "bg-sky-50/40",
  },
  {
    id: "terracotta",
    name: "Warm Terracotta",
    bgGradient: "from-[#c2410c] via-[#ea580c] to-[#9a3412]",
    accentHex: "#c2410c",
    badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
    circleMenuBg: "bg-[#ea580c] text-white hover:bg-[#c2410c]",
    hoverBorder: "hover:border-orange-400",
    lightTint: "bg-orange-50/40",
  },
  {
    id: "teal",
    name: "Institutional Teal",
    bgGradient: "from-[#0f766e] via-[#0d9488] to-[#134e4a]",
    accentHex: "#0f766e",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    circleMenuBg: "bg-[#0d9488] text-white hover:bg-[#0f766e]",
    hoverBorder: "hover:border-teal-400",
    lightTint: "bg-teal-50/40",
  },
  {
    id: "ochre",
    name: "Kenyan Ochre",
    bgGradient: "from-[#b45309] via-[#d97706] to-[#78350f]",
    accentHex: "#b45309",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    circleMenuBg: "bg-[#d97706] text-white hover:bg-[#b45309]",
    hoverBorder: "hover:border-amber-400",
    lightTint: "bg-amber-50/40",
  },
  {
    id: "navy",
    name: "Oxford Navy",
    bgGradient: "from-[#1e3a8a] via-[#2563eb] to-[#172554]",
    accentHex: "#1d4ed8",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    circleMenuBg: "bg-[#2563eb] text-white hover:bg-[#1d4ed8]",
    hoverBorder: "hover:border-blue-400",
    lightTint: "bg-blue-50/40",
  },
  {
    id: "olive",
    name: "Botanical Olive",
    bgGradient: "from-[#3f6212] via-[#4d7c0f] to-[#365314]",
    accentHex: "#3f6212",
    badgeBg: "bg-lime-50 text-lime-800 border-lime-200",
    circleMenuBg: "bg-[#4d7c0f] text-white hover:bg-[#3f6212]",
    hoverBorder: "hover:border-lime-500",
    lightTint: "bg-lime-50/40",
  },
  {
    id: "slate",
    name: "Executive Slate",
    bgGradient: "from-[#334155] via-[#475569] to-[#0f172a]",
    accentHex: "#334155",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-300",
    circleMenuBg: "bg-[#475569] text-white hover:bg-[#334155]",
    hoverBorder: "hover:border-slate-400",
    lightTint: "bg-slate-50/60",
  },
  {
    id: "amethyst",
    name: "Royal Amethyst",
    bgGradient: "from-[#6b21a8] via-[#7e22ce] to-[#581c87]",
    accentHex: "#7e22ce",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    circleMenuBg: "bg-[#9333ea] text-white hover:bg-[#7e22ce]",
    hoverBorder: "hover:border-purple-400",
    lightTint: "bg-purple-50/40",
  },
];

/**
 * Deterministically assign a Canvas jewel-tone palette from a sequence index or string seed.
 * Passing `colorIndex` guarantees neighboring cards in a grid never collide on the same color.
 */
export function getCanvasPalette(seed: string | number, colorIndex?: number): CanvasPalette {
  if (typeof colorIndex === "number" && Number.isFinite(colorIndex) && colorIndex >= 0) {
    return CANVAS_PALETTES[colorIndex % CANVAS_PALETTES.length];
  }
  const str = String(seed || "default").toLowerCase();
  // Keyword-based spread for common titles when rendered standalone without a grid index
  if (str.includes("nutrivital")) return CANVAS_PALETTES[0]; // Crimson Ruby
  if (str.includes("afya bora")) return CANVAS_PALETTES[1]; // Forest Emerald
  if (str.includes("sculpt")) return CANVAS_PALETTES[2]; // Ocean Sapphire
  if (str.includes("metabolic")) return CANVAS_PALETTES[3]; // Warm Terracotta
  if (str.includes("first 1000") || str.includes("maternal")) return CANVAS_PALETTES[4]; // Institutional Teal
  if (str.includes("memojo")) return CANVAS_PALETTES[5]; // Kenyan Ochre

  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const index = Math.abs(hash) % CANVAS_PALETTES.length;
  return CANVAS_PALETTES[index];
}
