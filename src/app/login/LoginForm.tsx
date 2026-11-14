"use client";

import Link from "next/link";
import { login } from "@/app/(auth)/actions";
import { ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

interface LoginFormProps {
  error?: string;
  message?: string;
  redirectUrl?: string;
}

export function LoginForm({ error, message, redirectUrl }: LoginFormProps) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex h-1.5 w-full"><div className="h-full w-3/5 bg-blue-600" /><div className="h-full w-2/5 bg-amber-400" /></div>
      <div className="space-y-6 p-7 sm:p-8">
        <div className="text-center">
          <div className="mx-auto inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700">One account for every learner</div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in with your email and password.</p>
        </div>
        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /><span>{error}</span></div>}
        {message && <div role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{message}</span></div>}
        <form action={login} className="space-y-4">
          {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
          <div><label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-700">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
          <div><label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-700">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100" /></div>
          <button type="submit" className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700">Sign in <ArrowRight className="h-4 w-4" /></button>
        </form>
        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600"><span>New here?</span><div className="mt-2 flex items-center justify-center gap-3 font-semibold"><Link href="/signup" className="text-indigo-700 hover:text-indigo-900">Create student account</Link><span className="text-slate-300">|</span><Link href="/signup/faculty" className="text-emerald-700 hover:text-emerald-900">Apply as trainer</Link></div></div>
      </div>
      <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50 px-6 py-3 text-[11px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /><span>Secure email sign-in</span></div>
    </div>
  );
}
