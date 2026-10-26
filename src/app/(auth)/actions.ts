"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
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
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role || "student";

  // If safe redirect provided and role matches or student
  if (redirectUrl && redirectUrl.startsWith("/") && !redirectUrl.startsWith("//")) {
    redirect(redirectUrl);
  }

  if (role === "admin") {
    redirect("/admin");
  } else if (role === "trainer") {
    redirect("/trainer");
  } else if (role === "supervisor") {
    redirect("/supervisor");
  } else {
    redirect("/studio");
  }
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
