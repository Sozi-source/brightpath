import Link from "next/link";
import { signup } from "@/app/(auth)/actions";
import { ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export const instant = false;

interface SignupPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-[#f4f7fb] px-4 py-12">
      {/* Institutional Brand Header */}
      <div className="mb-6 text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-semibold text-xl text-slate-900 tracking-tight"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            <span className="text-amber-300">B</span>P
          </div>
          <div className="text-left">
            <span className="block font-semibold text-base sm:text-lg text-slate-900 leading-tight">
              BrightPath TVET
            </span>
            <span className="block text-[10px] font-medium text-indigo-600 uppercase tracking-wider">
              Kenya Education Cloud Standard
            </span>
          </div>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Two-Tone KEC Accent Stripe */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-3/5 bg-blue-700" />
          <div className="h-full w-2/5 bg-amber-500" />
        </div>

        <div className="p-7 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
              Candidate Registration
            </h1>
            <p className="text-xs text-slate-500">
              Create your TVET project workspace account
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800 flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form action={signup} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="Official name as per KNEC records"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Student Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Password (minimum 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <span>Register Candidate</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
          <span>Encrypted Session • TVET Examination Standards Compliant</span>
        </div>
      </div>
    </main>
  );
}
