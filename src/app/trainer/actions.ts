"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyTrainerOrAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized: Please sign in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "trainer" && profile?.role !== "admin") {
    throw new Error("Trainer or admin permissions required.");
  }

  // Ensure an approved trainer_profile exists for this user
  const { data: tp } = await supabase
    .from("trainer_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (!tp) {
    await supabase.from("trainer_profiles").insert({
      user_id: user.id,
      status: "approved",
      bio: profile?.role === "admin" ? "Platform Administrator & Verified Trainer" : "",
      approved_at: new Date().toISOString(),
    });
  }

  return { supabase, user, isAdmin: profile?.role === "admin" };
}

export async function createProject(formData: FormData) {
  const { supabase, user, isAdmin } = await verifyTrainerOrAdmin();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const category = formData.get("category")?.toString().trim() || "General";
  const priceRaw = formData.get("priceKes")?.toString();
  const filePath = formData.get("filePath")?.toString().trim() || "projects/sample-project.zip";
  const previewPath = formData.get("previewPath")?.toString().trim() || null;

  const priceKes = parseFloat(priceRaw || "0");
  if (!title) throw new Error("Project title is required.");
  if (isNaN(priceKes) || priceKes < 0) throw new Error("Valid price in KES is required.");

  const { error } = await supabase.from("projects").insert({
    trainer_id: user.id,
    title,
    description,
    category,
    price_kes: priceKes,
    file_path: filePath,
    preview_path: previewPath,
    // Admin uploads are published immediately; regular trainers undergo review
    status: isAdmin ? "published" : "pending_review",
  });

  if (error) throw error;
  revalidatePath("/trainer");
  revalidatePath("/projects");
  revalidatePath("/admin");
}

export async function deleteProject(formData: FormData) {
  const { supabase, user, isAdmin } = await verifyTrainerOrAdmin();
  const projectId = formData.get("projectId")?.toString();
  if (!projectId) return;

  const query = supabase.from("projects").delete().eq("id", projectId);
  if (!isAdmin) {
    query.eq("trainer_id", user.id);
  }
  const { error } = await query;
  if (error) throw error;

  revalidatePath("/trainer");
  revalidatePath("/projects");
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const parseRow = (row: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]).map((h) =>
    h.toLowerCase().trim().replace(/^["']|["']$/g, "").replace(/[\s_-]+/g, "_")
  );

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === "")) continue;
    const item: Record<string, string> = {};
    headers.forEach((h, idx) => {
      let val = values[idx] || "";
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      item[h] = val;
    });
    rows.push(item);
  }
  return rows;
}

interface RawProjectImport {
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  price_kes?: string | number;
  price?: string | number;
  amount?: string | number;
  file_path?: string;
  file?: string;
  preview_path?: string;
  preview?: string;
}

export async function bulkImportProjects(formData: FormData) {
  const { supabase, user, isAdmin } = await verifyTrainerOrAdmin();
  const file = formData.get("file") as File | null;
  const rawText = formData.get("rawText")?.toString().trim();

  let content = "";
  if (file && file.size > 0) {
    content = await file.text();
  } else if (rawText) {
    content = rawText;
  }

  if (!content) {
    throw new Error("Please upload a CSV/JSON file or paste raw content.");
  }

  let items: RawProjectImport[] = [];
  const trimmed = content.trim();

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      items = (Array.isArray(parsed) ? parsed : [parsed]) as RawProjectImport[];
    } catch {
      throw new Error("Invalid JSON format. Please check your JSON syntax.");
    }
  } else {
    items = parseCSV(trimmed) as unknown as RawProjectImport[];
  }

  if (items.length === 0) {
    throw new Error("No records found to import.");
  }

  const projectsToInsert = items
    .filter((item) => (item.title || item.name))
    .map((item) => {
      const priceRaw = item.price_kes || item.price || item.amount || "0";
      const priceKes = parseFloat(String(priceRaw).replace(/[^0-9.]/g, "")) || 0;

      return {
        trainer_id: user.id,
        title: String(item.title || item.name).trim(),
        description: item.description ? String(item.description).trim() : "",
        category: item.category ? String(item.category).trim() : "General",
        price_kes: priceKes,
        file_path: item.file_path || item.file || "projects/default.zip",
        preview_path: item.preview_path || item.preview || null,
        status: isAdmin ? "published" : "pending_review",
      };
    });

  if (projectsToInsert.length === 0) {
    throw new Error("No valid project rows with a title were found.");
  }

  const { error } = await supabase.from("projects").insert(projectsToInsert);
  if (error) throw error;

  revalidatePath("/trainer");
  revalidatePath("/projects");
  revalidatePath("/admin");
}
