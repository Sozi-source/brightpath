import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ArrowLeft } from "lucide-react";

export const LEGAL_LAST_UPDATED = "November 17, 2026";

export interface LegalTocItem {
  id: string;
  label: string;
}

interface LegalPageShellProps {
  title: string;
  badge: string;
  lastUpdated?: string;
  toc: LegalTocItem[];
  children: React.ReactNode;
}

export function LegalPageShell({
  title,
  badge,
  lastUpdated = LEGAL_LAST_UPDATED,
  toc,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/projects" className="hidden sm:inline text-slate-600 hover:text-[#092B68]">
              Marketplace
            </Link>
            <Link href="/privacy" className="text-slate-600 hover:text-[#092B68]">
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-600 hover:text-[#092B68]">
              Terms
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-[#092B68] px-3 py-1.5 text-white hover:bg-[#07204f] transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] items-start">
          {toc.length > 0 && (
            <aside className="lg:sticky lg:top-24 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Contents
              </p>
              <ol className="space-y-1.5 text-xs font-medium text-slate-700">
                {toc.map((item, idx) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded-md px-2 py-1 hover:bg-slate-50 hover:text-[#092B68] transition-colors"
                    >
                      {idx + 1}. {item.label}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>
          )}

          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex h-1.5 w-full">
              <div className="h-full w-3/5 bg-[#092B68]" />
              <div className="h-full w-2/5 bg-[#F5A000]" />
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <header className="border-b border-slate-100 pb-5 space-y-2">
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-[#092B68]">
                  {badge}
                </span>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  {title}
                </h1>
                <p className="text-xs text-slate-500">
                  Last updated: <time dateTime={lastUpdated}>{lastUpdated}</time> · Clarix Innovators
                  (trading as TVET Hub)
                </p>
              </header>

              <div className="space-y-6 text-sm leading-6 text-slate-700">{children}</div>
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Clarix Innovators (trading as TVET Hub)</span>
          <div className="flex items-center gap-4 font-medium text-slate-600">
            <Link href="/privacy" className="hover:text-[#087f8c]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#087f8c]">
              Terms of Service
            </Link>
            <a href="mailto:codepro.source@gmail.com" className="hover:text-[#087f8c]">
              codepro.source@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
