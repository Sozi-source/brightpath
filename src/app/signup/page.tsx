import Link from "next/link";
import { signup } from "@/app/(auth)/actions";
import { GraduationCap, ArrowRight, ShieldCheck } from "lucide-react";

export const instant = false;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-[#f4f7fb] px-4 py-12">
      {/* Brand Header */}
      <div className="mb-6 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-xl text-slate-900 tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f3554] text-white shadow-xs">
            <GraduationCap className="h-5 w-5 text-[#f59e0b]" />
          </span>
          <span>BrightPath TVET</span>
        </Link>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          National Academic Project & Examination System
        </p>
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
              Create Candidate Account
            </h1>
            <p className="text-xs text-slate-600">
              Register for your TVET project workspace and curriculum access
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800"
            >
              {error}
            </div>
          )}

          <form action={signup} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Official Full Name (as per KNEC Index)
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="e.g. Wilfred Osozi"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Institutional or Personal Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Password (min 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white py-2.5 text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <span>Register Account</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="font-bold text-blue-700 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
          <span>Encrypted Session • Kenya TVET Examination Standards Compliant</span>
        </div>
      </div>
    </main>
  );
}
