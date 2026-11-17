import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

const ROLE_HOME: Record<UserRole, string> = {
  student: "/learn",
  supervisor: "/supervisor",
  admin: "/admin",
};

const ROLE_REDIRECT_PREFIXES: Record<UserRole, string[]> = {
  student: ["/studio", "/learn", "/library", "/projects"],
  supervisor: ["/supervisor", "/projects", "/library"],
  admin: ["/admin", "/supervisor", "/studio", "/learn", "/library", "/projects"],
};

function isAllowedRoleRedirect(role: UserRole, redirectUrl: string | null): boolean {
  if (!redirectUrl || !redirectUrl.startsWith("/") || redirectUrl.startsWith("//") || redirectUrl.includes("\\")) {
    return false;
  }
  const path = redirectUrl.split(/[?#]/, 1)[0];
  return ROLE_REDIRECT_PREFIXES[role].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function getOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost && process.env.NODE_ENV !== "development") {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

function redirectToLoginError(origin: string, message: string): NextResponse {
  const url = new URL("/login", origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  const oauthError = searchParams.get("error_description") || searchParams.get("error");

  if (oauthError) {
    return redirectToLoginError(origin, oauthError);
  }

  const supabase = await createClient();
  let user = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return redirectToLoginError(origin, error?.message || "Could not complete sign-in.");
    }
    user = data.user;
  } else if (tokenHash && otpType) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
    if (error || !data.user) {
      return redirectToLoginError(origin, error?.message || "Email verification link is invalid or expired.");
    }
    user = data.user;
  } else {
    return redirectToLoginError(origin, "Missing authentication code. Please try again.");
  }
  let { data: profile } = await supabase
    .from("profiles")
    .select("role, institution_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const adminDb = createAdminClient();
    const fallbackName =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split("@")[0] ||
      "Student";
    await adminDb
      .from("profiles")
      .upsert(
        { id: user.id, full_name: fallbackName, role: "student" },
        { onConflict: "id", ignoreDuplicates: true }
      );
    const { data: created } = await adminDb
      .from("profiles")
      .select("role, institution_id")
      .eq("id", user.id)
      .maybeSingle();
    profile = created;
  }

  const role = profile?.role as UserRole | undefined;
  if (!role || !(role in ROLE_HOME)) {
    await supabase.auth.signOut();
    return redirectToLoginError(origin, "Your account profile is not ready. Contact your college administrator.");
  }

  if (role === "supervisor") {
    const { data: trainerProfile } = await supabase
      .from("trainer_profiles")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (trainerProfile && trainerProfile.status !== "approved") {
      await supabase.auth.signOut();
      return redirectToLoginError(
        origin,
        trainerProfile.status === "suspended"
          ? "This trainer account is suspended. Contact an administrator."
          : "Your trainer account is awaiting administrator approval."
      );
    }
  }

  const hasStudentStudioAccess = role !== "student" || Boolean(profile?.institution_id);
  let targetPath = ROLE_HOME[role];

  if (next && isAllowedRoleRedirect(role, next)) {
    targetPath = !hasStudentStudioAccess && next.startsWith("/studio") ? "/projects" : next;
  } else if (role === "student" && !hasStudentStudioAccess) {
    targetPath = "/projects";
  }

  return NextResponse.redirect(new URL(targetPath, origin));
}
