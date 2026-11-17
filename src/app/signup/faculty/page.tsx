import Link from "next/link";
import { signupFaculty } from "@/app/(auth)/actions";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface FacultySignupPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function FacultySignupPage({ searchParams }: FacultySignupPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center overflow-y-auto bg-[#f4f7fb] px-3.5 py-6 sm:px-6 sm:py-10">
      <div className="mb-4 text-center"><Link href="/" className="inline-flex items-center justify-center"><BrandLogo size="md" /></Link></div>
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex h-1.5 w-full"><div className="h-full w-3/5 bg-[#092B68]" /><div className="h-full w-2/5 bg-[#F5A000]" /></div>
        <div className="space-y-6 p-7 sm:p-8">
          <div className="text-center"><div className="mx-auto inline-flex rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-[#092B68]">Trainer application</div><h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Apply as a trainer</h1><p className="mt-1 text-sm text-slate-600">Create your account for administrator review.</p></div>
          {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /><span>{error}</span></div>}
          <form action={signupFaculty} className="space-y-4">
            <div><label htmlFor="fullName" className="mb-1 block text-xs font-semibold text-slate-700">Full name</label><input id="fullName" name="fullName" type="text" autoComplete="name" required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
            <div><label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-700">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
            <div><label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-700">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
            <button type="submit" className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#092B68] py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#07204f]">Submit application <ArrowRight className="h-4 w-4" /></button>
          </form>
          <p className="text-center text-[11px] text-slate-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="font-semibold text-slate-700 hover:text-[#087f8c] underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-slate-700 hover:text-[#087f8c] underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="space-y-2 border-t border-slate-100 pt-4 text-center text-xs text-slate-600"><div>Already have an account? <Link href="/login" className="font-semibold text-indigo-700 hover:text-indigo-900">Sign in</Link></div><div>Need a student account? <Link href="/signup" className="font-semibold text-emerald-700 hover:text-emerald-900">Sign up as a student</Link></div></div>
        </div>
        <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50 px-6 py-3 text-[11px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /><span>Trainer access starts after approval</span></div>
      </div>
    </main>
  );
}
