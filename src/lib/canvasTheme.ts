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
    id: "navy",
    name: "Oxford Navy",
    bgGradient: "from-[#1e3a8a] via-[#1e40af] to-[#172554]",
    accentHex: "#1e40af",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    circleMenuBg: "bg-[#1d4ed8] text-white hover:bg-[#1e40af]",
    hoverBorder: "hover:border-blue-400",
    lightTint: "bg-blue-50/40",
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
    id: "amethyst",
    name: "Royal Amethyst",
    bgGradient: "from-[#6b21a8] via-[#7e22ce] to-[#581c87]",
    accentHex: "#7e22ce",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    circleMenuBg: "bg-[#9333ea] text-white hover:bg-[#7e22ce]",
    hoverBorder: "hover:border-purple-400",
    lightTint: "bg-purple-50/40",
  },
  {
    id: "teal",
    name: "Institutional Teal",
    bgGradient: "from-[#087f8c] via-[#0e9ba5] to-[#044e56]",
    accentHex: "#087f8c",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    circleMenuBg: "bg-[#087f8c] text-white hover:bg-[#066570]",
    hoverBorder: "hover:border-teal-400",
    lightTint: "bg-teal-50/40",
  },
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
    id: "cyan",
    name: "Ocean Cyan",
    bgGradient: "from-[#0369a1] via-[#0284c7] to-[#0c4a6e]",
    accentHex: "#0284c7",
    badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
    circleMenuBg: "bg-[#0284c7] text-white hover:bg-[#0369a1]",
    hoverBorder: "hover:border-sky-400",
    lightTint: "bg-sky-50/40",
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
    id: "indigo",
    name: "Midnight Indigo",
    bgGradient: "from-[#3730a3] via-[#4338ca] to-[#312e81]",
    accentHex: "#4338ca",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    circleMenuBg: "bg-[#4f46e5] text-white hover:bg-[#4338ca]",
    hoverBorder: "hover:border-indigo-400",
    lightTint: "bg-indigo-50/40",
  },
  {
    id: "fuchsia",
    name: "Deep Fuchsia",
    bgGradient: "from-[#86198f] via-[#a21caf] to-[#701a75]",
    accentHex: "#a21caf",
    badgeBg: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    circleMenuBg: "bg-[#c026d3] text-white hover:bg-[#a21caf]",
    hoverBorder: "hover:border-fuchsia-400",
    lightTint: "bg-fuchsia-50/40",
  },
];

/**
 * Deterministically assign a Canvas jewel-tone palette from a string or number seed.
 * Guarantees that the same item always has the same color, but neighboring items rotate.
 */
export function getCanvasPalette(seed: string | number): CanvasPalette {
  let hash = 0;
  const str = String(seed || "default");
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CANVAS_PALETTES.length;
  return CANVAS_PALETTES[index];
}
