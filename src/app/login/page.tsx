import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
    redirect?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;
  const redirectUrl = params?.redirect;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center overflow-y-auto bg-[#f4f7fb] px-3.5 py-6 sm:px-6 sm:py-10">
      {/* Institutional Brand Header */}
      <div className="mb-4 text-center">
        <Link href="/" className="inline-flex items-center justify-center">
          <BrandLogo size="md" />
        </Link>
      </div>

      <Suspense fallback={<div className="w-full max-w-md h-96 bg-white rounded-xl border border-slate-200 animate-pulse" />}>
        <LoginForm error={error} message={message} redirectUrl={redirectUrl} />
      </Suspense>
    </main>
  );
}
