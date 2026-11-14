import Link from "next/link";
import { signupFaculty } from "@/app/(auth)/actions";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface FacultySignupPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function FacultySignupPage({ searchParams }: FacultySignupPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex h-dvh min-h-dvh flex-col items-center justify-start overflow-hidden bg-[#f4f7fb] px-4 pb-4 pt-4 sm:pt-8 lg:justify-center lg:py-8">
      <div className="mb-6 text-center"><Link href="/" className="inline-flex items-center gap-2.5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087f8c] text-base font-bold text-white shadow-xs"><span className="text-amber-300">T</span>H</div><div className="text-left"><span className="block text-base font-semibold leading-tight text-slate-900 sm:text-lg">TVET Hub</span><span className="block text-[10px] font-medium tracking-wider text-[#087f8c]">Simple · Reliable · Innovative</span></div></Link></div>
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex h-1.5 w-full"><div className="h-full w-3/5 bg-blue-600" /><div className="h-full w-2/5 bg-amber-400" /></div>
        <div className="space-y-6 p-7 sm:p-8">
          <div className="text-center"><div className="mx-auto inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">Trainer application</div><h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Apply as a trainer</h1><p className="mt-1 text-sm text-slate-600">Create your account for administrator review.</p></div>
          {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /><span>{error}</span></div>}
          <form action={signupFaculty} className="space-y-4">
            <div><label htmlFor="fullName" className="mb-1 block text-xs font-semibold text-slate-700">Full name</label><input id="fullName" name="fullName" type="text" autoComplete="name" required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
            <div><label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-700">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
            <div><label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-700">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
            <button type="submit" className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700">Submit application <ArrowRight className="h-4 w-4" /></button>
          </form>
          <div className="space-y-2 border-t border-slate-100 pt-4 text-center text-xs text-slate-600"><div>Already have an account? <Link href="/login" className="font-semibold text-indigo-700 hover:text-indigo-900">Sign in</Link></div><div>Need a student account? <Link href="/signup" className="font-semibold text-emerald-700 hover:text-emerald-900">Sign up as a student</Link></div></div>
        </div>
        <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50 px-6 py-3 text-[11px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /><span>Trainer access starts after approval</span></div>
      </div>
    </main>
  );
}
