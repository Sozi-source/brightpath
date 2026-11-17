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
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <nav className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/projects" className="hidden sm:inline text-slate-600 hover:text-[#087f8c]">
              Marketplace
            </Link>
            <Link href="/privacy" className="text-slate-600 hover:text-[#087f8c]">
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-600 hover:text-[#087f8c]">
              Terms
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700 transition-colors"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex h-1.5 w-full">
            <div className="h-full w-3/5 bg-blue-700" />
            <div className="h-full w-2/5 bg-amber-500" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <header className="border-b border-slate-100 pb-5 space-y-2">
              <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
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

            {toc.length > 0 && (
              <nav
                aria-label="Table of contents"
                className="rounded-lg border border-slate-200 bg-slate-50/70 p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Contents
                </p>
                <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs font-medium text-[#087f8c]">
                  {toc.map((item, idx) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="hover:underline">
                        {idx + 1}. {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="space-y-6 text-sm leading-6 text-slate-700">{children}</div>
          </div>
        </article>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} Clarix Innovators (trading as TVET Hub)</span>
          <div className="flex items-center gap-4 font-medium text-slate-600">
            <Link href="/privacy" className="hover:text-[#087f8c]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#087f8c]">
              Terms of Service
            </Link>
            <a href="mailto:osoziw@gmail.com" className="hover:text-[#087f8c]">
              osoziw@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
