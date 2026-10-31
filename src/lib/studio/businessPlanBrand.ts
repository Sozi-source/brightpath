export interface BusinessPlanBrand {
  name: string;
  initials: string;
  accent: string;
  icon: "leaf" | "health" | "drop" | "growth";
}

export function createBusinessPlanBrand(input: {
  name?: string | null;
  industry?: string | null;
  product?: string | null;
}): BusinessPlanBrand {
  const name = input.name?.trim() || "Business Plan";
  const words = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const initials = (words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2)).toUpperCase();
  const context = `${input.industry || ""} ${input.product || ""} ${name}`.toLowerCase();

  if (/clinic|health|nutrition|diet|medical|wellness|consult/.test(context)) {
    return { name, initials, accent: "0F766E", icon: "health" };
  }
  if (/juice|fruit|beverage|drink|puree/.test(context)) {
    return { name, initials, accent: "C2410C", icon: "drop" };
  }
  if (/food|grain|porridge|milling|farm|agro|organic|produce/.test(context)) {
    return { name, initials, accent: "3F6B35", icon: "leaf" };
  }
  return { name, initials, accent: "4338CA", icon: "growth" };
}

export function businessPlanLogoSvg(brand: BusinessPlanBrand): string {
  const accent = `#${brand.accent}`;
  const accessibleName = brand.name.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const motif = brand.icon === "health"
    ? `<path d="M56 20v24M44 32h24" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>`
    : brand.icon === "drop"
      ? `<path d="M56 17c-7 11-15 19-15 28a15 15 0 0 0 30 0c0-9-8-17-15-28Z" fill="${accent}"/>`
      : brand.icon === "leaf"
        ? `<path d="M56 18c-16 1-25 9-25 21 0 10 8 16 18 13 13-4 17-19 18-34-4 0-7 0-11 0Zm-14 31 19-22" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<path d="M35 49V38h9v11m7 0V28h9v21m7 0V18h9v31" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112" viewBox="0 0 112 112" role="img" aria-label="${accessibleName} logo"><circle cx="56" cy="56" r="53" fill="#fff" stroke="${accent}" stroke-width="3"/><circle cx="56" cy="56" r="47" fill="#F8FAFC"/>${motif}<text x="56" y="87" text-anchor="middle" font-family="Georgia,serif" font-size="23" font-weight="700" letter-spacing="1" fill="${accent}">${brand.initials}</text></svg>`;
}
