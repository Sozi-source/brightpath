"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GoogleSignInButtonProps {
  redirectUrl?: string;
  label?: string;
}

export function GoogleSignInButton({
  redirectUrl,
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setError(null);
    setIsLoading(true);
    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (redirectUrl && redirectUrl.startsWith("/")) {
        callbackUrl.searchParams.set("next", redirectUrl);
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (oauthError) {
        setError(oauthError.message || "Unable to start Google sign-in.");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start Google sign-in.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.3 0 6.08-1.09 8.105-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.225 1.18-3.25 0-6.01-2.19-6.995-5.14H1.01v3.14C3.05 21.22 7.21 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.005 14.03A7.22 7.22 0 0 1 4.62 12c0-.7.13-1.39.385-2.03V6.83H1.01A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.01 5.17l3.995-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.83c1.8 0 3.41.62 4.68 1.83l3.51-3.51C18.07 1.19 15.3 0 12 0 7.21 0 3.05 2.78 1.01 6.83l3.995 3.14C5.99 7.02 8.75 4.83 12 4.83Z"
            />
          </svg>
        )}
        <span>{isLoading ? "Redirecting to Google..." : label}</span>
      </button>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-800"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
