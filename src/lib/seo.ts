export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.tvethub.co.ke"
).replace(/\/+$/, "");

export const SITE_NAME = "TVET Hub";
export const SITE_DESCRIPTION =
  "Kenya TVET examination projects, KNEC-aligned business plans, lecture notes, past papers, and guided project studio.";
