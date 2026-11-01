"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMarketplaceMaterialType } from "@/lib/marketplace";
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
  const materialType = formData.get("materialType")?.toString() || "other";
  const priceRaw = formData.get("priceKes")?.toString();
  const existingFilePath = formData.get("filePath")?.toString().trim() || "";
  const productFile = formData.get("productFile");
  const previewFile = formData.get("previewFile");
  const coverFile = formData.get("coverFile");

  const priceKes = parseFloat(priceRaw || "0");
  if (!title) throw new Error("Project title is required.");
  if (title.length > 180 || description.length > 5000 || category.length > 100) throw new Error("Check the title, description, and subject lengths.");
  if (!isMarketplaceMaterialType(materialType)) throw new Error("Choose a valid resource type.");
  if (!Number.isFinite(priceKes) || priceKes < 0 || priceKes > 1_000_000) throw new Error("Valid price in KES is required.");
  const isFile = (value: FormDataEntryValue | null): value is File => typeof File !== "undefined" && value instanceof File && value.size > 0;
  if (!existingFilePath && !isFile(productFile)) throw new Error("Upload the material or provide its existing storage path.");
  if (isFile(productFile) && productFile.size > 8 * 1024 * 1024) throw new Error("The material file must be 8 MB or smaller.");
  if (isFile(productFile) && !["pdf", "doc", "docx", "ppt", "pptx", "xlsx", "zip"].includes(productFile.name.split(".").pop()?.toLowerCase() || "")) throw new Error("Choose a PDF, Office document, presentation, spreadsheet, or ZIP file.");
  if (isFile(previewFile) && (previewFile.size > 2 * 1024 * 1024 || previewFile.type !== "application/pdf")) throw new Error("Upload a sample PDF up to 2 MB.");
  if (isFile(coverFile) && (coverFile.size > 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(coverFile.type))) throw new Error("Upload a JPG, PNG, or WebP cover up to 1 MB.");

  const adminClient = createAdminClient();
  const uploaded: string[] = [];
  const upload = async (file: File | null, kind: string) => {
    if (!file) return null;
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `marketplace/${user.id}/${crypto.randomUUID()}/${kind}.${extension}`;
    const { error } = await adminClient.storage.from("project-files").upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) throw new Error(error.message || `Could not upload ${kind}.`);
    uploaded.push(path);
    return path;
  };

  try {
    const filePath = isFile(productFile) ? await upload(productFile, "material") : existingFilePath;
    const previewPath = isFile(previewFile) ? await upload(previewFile, "preview") : null;
    const coverPath = isFile(coverFile) ? await upload(coverFile, "cover") : null;
    const { error } = await supabase.from("projects").insert({
      trainer_id: user.id,
      title,
      description,
      category,
      material_type: materialType,
      price_kes: priceKes,
      file_path: filePath,
      preview_path: previewPath,
      cover_path: coverPath,
      // Admin uploads are published immediately; regular trainers undergo review
      status: isAdmin ? "published" : "pending_review",
    });
    if (error) throw error;
  } catch (error) {
    if (uploaded.length) await adminClient.storage.from("project-files").remove(uploaded);
    throw error;
  }
  revalidatePath("/trainer");
  revalidatePath("/projects");
  revalidatePath("/admin");
}

export async function deleteProject(formData: FormData) {
  const { supabase, user, isAdmin } = await verifyTrainerOrAdmin();
  const projectId = formData.get("projectId")?.toString();
  if (!projectId) return;

  const { data: project } = await supabase.from("projects").select("file_path, preview_path, cover_path").eq("id", projectId).maybeSingle();
  if (!project) return;
  const query = supabase.from("projects").delete().eq("id", projectId);
  if (!isAdmin) {
    query.eq("trainer_id", user.id);
  }
  const { error } = await query;
  if (error) throw error;

  const ownedPrefix = `marketplace/${user.id}/`;
  const paths = [project.file_path, project.preview_path, project.cover_path]
    .filter((path): path is string => typeof path === "string" && !path.startsWith("workspace-export:") && (isAdmin || path.startsWith(ownedPrefix)));
  if (paths.length) await createAdminClient().storage.from("project-files").remove(paths);

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
  material_type?: string;
  cover_path?: string;
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
      const materialType = isMarketplaceMaterialType(String(item.material_type || ""))
        ? String(item.material_type)
        : "other";

      return {
        trainer_id: user.id,
        title: String(item.title || item.name).trim(),
        description: item.description ? String(item.description).trim() : "",
        category: item.category ? String(item.category).trim() : "General",
        material_type: materialType,
        price_kes: priceKes,
        file_path: item.file_path || item.file || "projects/default.zip",
        preview_path: item.preview_path || item.preview || null,
        cover_path: item.cover_path || null,
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
