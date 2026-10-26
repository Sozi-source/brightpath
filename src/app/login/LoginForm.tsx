"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/app/(auth)/actions";
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface LoginFormProps {
  initialPortal?: "student" | "faculty";
  error?: string;
  message?: string;
  redirectUrl?: string;
}

export function LoginForm({
  initialPortal = "student",
  error,
  message,
  redirectUrl,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPortal = searchParams.get("portal") === "faculty" ? "faculty" : initialPortal;
  const [portal, setPortal] = useState<"student" | "faculty">(urlPortal);

  function handlePortalSwitch(nextPortal: "student" | "faculty") {
    setPortal(nextPortal);
    const params = new URLSearchParams(searchParams.toString());
    params.set("portal", nextPortal);
    router.replace(`/login?${params.toString()}`);
  }

  const isStudent = portal === "student";

  return (
    <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Two-Tone KEC Accent Stripe */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-3/5 bg-blue-700" />
        <div className="h-full w-2/5 bg-amber-500" />
      </div>

      {/* Segmented Institutional Portal Switcher */}
      <div className="p-2 border-b border-slate-100 bg-slate-50/70">
        <div className="grid grid-cols-2 p-1 bg-slate-200/60 rounded-lg gap-1">
          <button
            type="button"
            onClick={() => handlePortalSwitch("student")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              isStudent
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GraduationCap className={`h-4 w-4 ${isStudent ? "text-indigo-600" : "text-slate-400"}`} />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch("faculty")}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              !isStudent
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className={`h-4 w-4 ${!isStudent ? "text-indigo-600" : "text-slate-400"}`} />
            <span>Faculty & Staff</span>
          </button>
        </div>
      </div>

      <div className="p-7 sm:p-8 space-y-6">
        {/* Dynamic Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border">
            {isStudent ? (
              <span className="inline-flex items-center gap-1.5 text-indigo-700">
                <GraduationCap className="h-3.5 w-3.5" />
                TVET Candidate
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                Faculty Trainer or Supervisor
              </span>
            )}
          </div>

          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            {isStudent ? "Student Sign In" : "Faculty Sign In"}
          </h1>
          <p className="text-xs text-slate-500">
            {isStudent
              ? "Access your project studio workspace"
              : "Institutional access for trainers and supervisors"}
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div
            role="alert"
            className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800 flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-start gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Login Form */}
        <form action={login} className="space-y-4">
          <input type="hidden" name="portal" value={portal} />
          {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {isStudent ? "Student Email" : "Institutional Email"}
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
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <span>{isStudent ? "Sign In to Studio" : "Sign In to Portal"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Role Guidance */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {isStudent ? (
            <>
              <span>New TVET candidate?</span>
              <Link
                href="/signup"
                className="font-semibold text-indigo-600 hover:underline"
              >
                Register Candidate
              </Link>
            </>
          ) : (
            <>
              <span>Need faculty credentials?</span>
              <span className="font-semibold text-slate-700">
                Contact College Admin
              </span>
            </>
          )}
        </div>
      </div>

      {/* Security Footer */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
        <span>Encrypted Session • TVET Examination Standards Compliant</span>
      </div>
    </div>
  );
}
