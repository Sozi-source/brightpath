import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const instant = false;

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
    portal?: string;
    redirect?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;
  const portal = params?.portal === "faculty" ? "faculty" : "student";
  const redirectUrl = params?.redirect;

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

      <Suspense fallback={<div className="w-full max-w-md h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />}>
        <LoginForm
          initialPortal={portal}
          error={error}
          message={message}
          redirectUrl={redirectUrl}
        />
      </Suspense>
    </main>
  );
}
