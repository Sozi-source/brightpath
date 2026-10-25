import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);

if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/make-admin.mjs <email> [password]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const sb = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const { data, error } = await sb.auth.admin.listUsers();
if (error) throw error;

let user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

if (!user) {
  if (password) {
    console.log(`User ${email} does not exist. Creating new user...`);
    const { data: newUser, error: createErr } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Wilfred Osozi" },
    });
    if (createErr) throw createErr;
    user = newUser.user;
  } else {
    throw new Error(`No user found with email ${email}. Please supply a password to create one.`);
  }
} else {
  // Confirm the email, and update the password if one was given
  const updatePayload = {
    email_confirm: true,
    ...(password ? { password } : {}),
  };
  const { error: updateErr } = await sb.auth.admin.updateUserById(user.id, updatePayload);
  if (updateErr) throw updateErr;
}

// Create or update the profile as admin
const { error: profileErr } = await sb
  .from("profiles")
  .upsert({ id: user.id, full_name: "Wilfred Osozi", role: "admin" });

if (profileErr) throw profileErr;

console.log(`Done: ${email} is confirmed and set as an admin.`);
