"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";

function fail(path: string, message: string): never {
  const [pathname, query = ""] = path.split("?", 2);
  const params = new URLSearchParams(query);
  params.set("error", message);
  redirect(`${pathname}?${params.toString()}`);
}

const ROLE_HOME: Record<UserRole, string> = {
  student: "/studio",
  trainer: "/trainer",
  supervisor: "/supervisor",
  admin: "/admin",
};

const ROLE_REDIRECT_PREFIXES: Record<UserRole, string[]> = {
  student: ["/studio", "/learn", "/library", "/projects"],
  trainer: ["/trainer", "/projects", "/library"],
  supervisor: ["/supervisor", "/projects", "/library"],
  admin: ["/admin", "/supervisor", "/trainer", "/studio", "/learn", "/library", "/projects"],
};

function isAllowedRoleRedirect(role: UserRole, redirectUrl: string | undefined): boolean {
  if (!redirectUrl || !redirectUrl.startsWith("/") || redirectUrl.startsWith("//") || redirectUrl.includes("\\")) {
    return false;
  }
  const path = redirectUrl.split(/[?#]/, 1)[0];
  return ROLE_REDIRECT_PREFIXES[role].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export async function login(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const portal = formData.get("portal")?.toString() === "faculty" ? "faculty" : "student";
  const redirectUrl = formData.get("redirect")?.toString();

  const failPath = portal === "faculty" ? "/login?portal=faculty" : "/login";

  if (!email || !password) {
    fail(failPath, "Please enter both email and password.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    fail(
      failPath,
      error.message.toLowerCase().includes("confirm")
        ? "Confirm your email first."
        : "Wrong email or password."
    );
  }

  // Redirect based on role and redirect parameter
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role as UserRole | undefined;
  if (profileError || !role || !(role in ROLE_HOME)) {
    await supabase.auth.signOut();
    fail(failPath, "Your account profile is not ready. Contact your college administrator.");
  }

  if (portal === "faculty" && role === "student") {
    await supabase.auth.signOut();
    fail(failPath, "This account has student access. Ask your college administrator to enable faculty access.");
  }

  if (redirectUrl && isAllowedRoleRedirect(role, redirectUrl)) {
    redirect(redirectUrl);
  }

  redirect(ROLE_HOME[role]);
}

export async function signup(formData: FormData) {
  const fullName = formData.get("fullName")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    fail("/signup", "Email and password are required.");
  }

  if (password.length < 6) {
    fail("/signup", "Password must be at least 6 characters.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    fail("/signup", error.message);
  }

  // If email confirmation is enabled and user is not confirmed yet
  if (data?.user && !data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Signup successful! Please check your email to confirm your account."
      )}`
    );
  }

  // If email confirmation is disabled and session is active
  redirect("/studio");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
