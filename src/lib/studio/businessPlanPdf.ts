import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { access } from "node:fs/promises";
import { delimiter, join } from "node:path";
import { createBusinessPlanHtml, type BusinessPlanDocumentDetails } from "./businessPlanHtml";

async function localBrowserPath(): Promise<string | undefined> {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const candidates = process.platform === "win32"
    ? [
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
      ]
    : (process.env.PATH || "").split(delimiter).flatMap((directory) => [join(directory, "chromium"), join(directory, "chrome"), join(directory, "google-chrome")]);
  for (const candidate of candidates) {
    try { await access(candidate); return candidate; } catch { /* try next browser path */ }
  }
  return undefined;
}

export async function createBusinessPlanPdf(params: BusinessPlanDocumentDetails): Promise<Uint8Array> {
  const executablePath = await localBrowserPath() || (process.platform === "linux" ? await chromium.executablePath() : undefined);
  if (!executablePath) throw new Error("PDF export needs Chromium. Set PUPPETEER_EXECUTABLE_PATH or deploy with the bundled Linux Chromium runtime.");

  const browser = await puppeteer.launch({
    args: process.platform === "linux" ? chromium.args : ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath,
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(createBusinessPlanHtml(params), { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: { top: "25.4mm", right: "25.4mm", bottom: "22mm", left: "25.4mm" },
    });
    return new Uint8Array(pdf);
  } finally {
    await browser.close();
  }
}
