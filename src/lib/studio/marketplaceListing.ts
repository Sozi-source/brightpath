import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { resolveBusinessPlanModel, type BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";
import { getBusinessModelConflictFindings } from "@/lib/studio/businessPlanProfiles";
import {
  buildVariedBusinessPlanPreliminaries,
  buildVariedBrandSymbolismBlock,
} from "@/lib/studio/businessPlanPreliminaries";

export async function queueApprovedBusinessPlanListing(workspaceId: string) {
  const db = createAdminClient();
  const { data: workspace, error: workspaceError } = await db.from("project_workspaces")
    .select("id, student_id, workspace_type, level, title, course, problem_area, business_plan_specs, marketplace_price_kes, final_project_status, student:student_id(full_name, admission_number), supervisor:supervisor_id(full_name), institution:institution_id(name)")
    .eq("id", workspaceId).maybeSingle();
  if (workspaceError || !workspace) throw new Error(workspaceError?.message || "Workspace not found.");
  const isResearch = workspace.workspace_type === "research_secondary";
  if (
    (workspace.workspace_type !== "business_plan" && !isResearch) ||
    (workspace.final_project_status !== "approved" && workspace.final_project_status !== "pending_review")
  ) {
    throw new Error("Only business plans or research projects submitted for review or approved can enter marketplace review.");
  }

  // Under Option A: All approved work remains 100% property of the platform/system.
  // Query platform admin profile to own the listing.
  const { data: adminProfile } = await db
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .maybeSingle();

  const platformOwnerId = adminProfile?.id || workspace.student_id;

  // Standard institutional pricing: Diploma = KES 2,500, Certificate/Craft = KES 1,500
  const defaultStandardPrice = workspace.level === "craft" ? 1500 : 2500;
  const rawPrice = Number(workspace.marketplace_price_kes);
  const priceKes = (Number.isFinite(rawPrice) && rawPrice > 0) ? rawPrice : defaultStandardPrice;

  const planSpecs = workspace.business_plan_specs as BusinessPlanSpecs | null;
  if (planSpecs?.isInstitutional || planSpecs?.adminOnly) {
    throw new Error("Institutional and admin-only business plans cannot be published to the marketplace.");
  }
  const definitions = isResearch
    ? getWorkspaceSections("research_secondary", workspace.level)
    : getWorkspaceSections("business_plan", workspace.level, resolveBusinessPlanModel(planSpecs));
  const { data: rows, error: sectionsError } = await db.from("workspace_sections")
    .select("section_key, current_text").eq("workspace_id", workspaceId);
  if (sectionsError) throw new Error(sectionsError.message || "Could not load approved plan sections.");
  if (!isResearch && planSpecs) {
    const conflicts = getBusinessModelConflictFindings(planSpecs, (rows || []).map((row) => ({
      key: row.section_key,
      content: row.current_text || "",
    })));
    if (conflicts.length) throw new Error(`Resolve the business-model mismatch in ${conflicts.map((item) => item.sectionKey).join(", ")} before marketplace review.`);
  }
  const sectionText = new Map((rows || []).map((row) => [row.section_key, row.current_text || ""]));
  const incomplete = definitions.filter((definition) => {
    const minReq = isResearch ? Math.min(definition.minWords || 30, 30) : (definition.minWords || 30);
    const words = (sectionText.get(definition.key) || "").trim().split(/\s+/).filter(Boolean).length;
    return words < minReq;
  });
  if (incomplete.length) throw new Error("The business plan no longer meets the completion requirements.");

  const specs = workspace.business_plan_specs as (Partial<BusinessPlanSpecs> & {
    candidateName?: string;
    admissionNumber?: string;
    institutionName?: string;
    supervisorName?: string;
    townOrMarket?: string;
    county?: string;
    streetOrBuilding?: string;
    phone?: string;
    email?: string;
    postalAddress?: string;
  }) | null;
  const student = workspace.student as unknown as { full_name?: string | null; admission_number?: string | null } | null;
  const supervisor = workspace.supervisor as unknown as { full_name?: string | null } | null;
  const institution = workspace.institution as unknown as { name?: string | null } | null;
  const redact = (content: string, value: string | null | undefined, replacement: string) => {
    const normalized = value?.trim();
    if (!normalized || normalized.length < 2) return content;
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return content.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "giu"), replacement);
  };

  // Extract student name tokens (if multi-word like "Lydiah Kathesya", redact individual names too)
  const studentNameWords = (student?.full_name || "")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !/^(and|the|for|with|from)$/i.test(w));

  const redactPrivateDetails = (content: string) => {
    let text = [
      [specs?.candidateName, "{{CANDIDATE_NAME}}"],
      [student?.full_name, "{{CANDIDATE_NAME}}"],
      ...studentNameWords.map((namePart) => [namePart, "{{CANDIDATE_NAME}}"] as [string, string]),
      [specs?.admissionNumber, "{{ADMISSION_NUMBER}}"],
      [student?.admission_number, "{{ADMISSION_NUMBER}}"],
      [specs?.institutionName, "{{INSTITUTION_NAME}}"],
      [institution?.name, "{{INSTITUTION_NAME}}"],
      [specs?.supervisorName, "{{SUPERVISOR_NAME}}"],
      [supervisor?.full_name, "{{SUPERVISOR_NAME}}"],
      [specs?.streetOrBuilding, "{{STREET_ADDRESS}}"],
      [specs?.townOrMarket, "{{TARGET_TOWN}}"],
      [specs?.county, "{{TARGET_COUNTY}}"],
      [specs?.phone, "{{PHONE_NUMBER}}"],
      [specs?.email, "{{EMAIL_ADDRESS}}"],
      [specs?.postalAddress, "{{POSTAL_ADDRESS}}"],
    ].reduce((acc, [value, replacement]) => redact(acc, value, replacement as string), content);

    // Regex scrubbers for phone, email, postal address, and admission patterns
    text = text
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, "{{EMAIL_ADDRESS}}")
      .replace(/(?:\+254|0)[17]\d{8}\b/g, "{{PHONE_NUMBER}}")
      .replace(/\bP\.?O\.?\s*Box\s*\d+[a-zA-Z0-9\s,-]*/gi, "{{POSTAL_ADDRESS}}")
      .replace(/\b[A-Z]{2,5}\/\d{2,6}\/\d{2,4}\b/gi, "{{ADMISSION_NUMBER}}")
      .replace(/\[Candidate\]/g, "{{CANDIDATE_NAME}}")
      .replace(/\[Admission number withheld\]/g, "{{ADMISSION_NUMBER}}")
      .replace(/\[Institution\]/g, "{{INSTITUTION_NAME}}")
      .replace(/\[Supervisor\]/g, "{{SUPERVISOR_NAME}}");

    return text;
  };

  const baseTitle = redactPrivateDetails(specs?.businessName || workspace.title || `${workspace.course} Enterprise`)
    .replace(/\s+in\s+\{\{TARGET_TOWN\}\}(?:,\s*\{\{TARGET_COUNTY\}\})?/gi, "")
    .replace(/\s+in\s+Regional(?:,\s*County)?/gi, "")
    .replace(/\{\{TARGET_TOWN\}\}/g, "")
    .replace(/\{\{TARGET_COUNTY\}\}/g, "")
    .replace(/\{\{INSTITUTION_NAME\}\}/g, "")
    .replace(/\{\{CANDIDATE_NAME\}\}/g, "")
    .replace(/\s*—\s*Complete KNEC Business Plan.*/i, "")
    .trim();
  const listingTitle = isResearch
    ? `${baseTitle} — Complete KNEC Research Project`
    : `${baseTitle} — Complete KNEC Business Plan`;

  const realTown = specs?.townOrMarket?.trim() || "Nairobi";
  const realCounty = specs?.county?.trim() || "Nairobi County";
  const cleanStreet = (specs?.streetOrBuilding || "")
    .replace(/\s*\[Confirm exact plot\/street locally\]/gi, "")
    .trim();

  const listingDescription = redactPrivateDetails(
    workspace.problem_area ||
    `Complete KNEC business plan for ${baseTitle}. Includes comprehensive executive summary, marketing, operations, human resources, and financial schedules prepared in full compliance with KNEC TVET assessment regulations.`
  )
    .replace(/\{\{STREET_ADDRESS\}\},\s*\{\{TARGET_TOWN\}\},\s*\{\{TARGET_COUNTY\}\}/g, `${realTown}, ${realCounty}`)
    .replace(/\{\{TARGET_TOWN\}\}/g, realTown)
    .replace(/\{\{TARGET_COUNTY\}\}/g, realCounty)
    .replace(/\{\{INSTITUTION_NAME\}\}/g, "Accredited TVET Institution")
    .replace(/\{\{CANDIDATE_NAME\}\}/g, "Candidate")
    .replace(/\{\{ADMISSION_NUMBER\}\}/g, "")
    .replace(/\{\{SUPERVISOR_NAME\}\}/g, "Institutional Supervisor")
    .replace(/\{\{STREET_ADDRESS\}\}/g, cleanStreet || realTown)
    .replace(/\{\{PHONE_NUMBER\}\}/g, "+254 700 000 000")
    .replace(/\{\{EMAIL_ADDRESS\}\}/g, "info@enterprise.co.ke")
    .replace(/\{\{POSTAL_ADDRESS\}\}/g, "P.O. Box 100")
    .replace(/\s*\[Confirm exact plot\/street locally\]/gi, "");

  const filePath = `workspace-export:${workspaceId}`;
  const { data: existing, error: existingError } = await db.from("projects")
    .select("id, status").eq("file_path", filePath).maybeSingle();
  if (existingError) throw new Error(existingError.message || "Could not check the marketplace queue.");

  const listingCategory = isResearch ? "Research Project" : "Business Plan";
  const listingMaterialType = isResearch ? "research_secondary" : "business_plan";

  let projectId = existing?.id;
  let createdProject = false;
  if (existing) {
    const nextListingStatus = existing.status === "published" ? "published" : "pending_review";
    const { error } = await db.from("projects").update({
      trainer_id: platformOwnerId,
      title: listingTitle,
      description: listingDescription,
      category: listingCategory,
      material_type: listingMaterialType,
      price_kes: priceKes,
      status: nextListingStatus,
    }).eq("id", existing.id);
    if (error) throw new Error(error.message || "Could not update the marketplace listing.");
  } else {
    const { data: listing, error } = await db.from("projects").insert({
      trainer_id: platformOwnerId,
      title: listingTitle,
      description: listingDescription,
      category: listingCategory,
      material_type: listingMaterialType,
      price_kes: priceKes,
      file_path: filePath,
      status: "pending_review",
    }).select("id").single();
    if (error || !listing) throw new Error(error?.message || "Could not publish the business plan.");
    projectId = listing.id;
    createdProject = true;
  }

  const tokenizedPrelims = buildVariedBusinessPlanPreliminaries({
    seed: `${workspaceId}|${baseTitle}`,
    businessName: baseTitle,
    candidateName: "{{CANDIDATE_NAME}}",
    admissionNumber: "{{ADMISSION_NUMBER}}",
    institutionName: "{{INSTITUTION_NAME}}",
    supervisorName: "{{SUPERVISOR_NAME}}",
    townOrMarket: "{{TARGET_TOWN}}",
    county: "{{TARGET_COUNTY}}",
    course: workspace.course,
    level: workspace.level,
    industrySector: specs?.industrySector,
    primaryProduct: specs?.primaryProduct,
  });
  const marketplacePreliminaries: Record<string, string> = {
    "prelim.declaration": tokenizedPrelims.declaration,
    "prelim.dedication": tokenizedPrelims.dedication,
    "prelim.acknowledgements": tokenizedPrelims.acknowledgements,
  };
  const { error: snapshotError } = await db.from("project_plan_snapshots").upsert({
    project_id: projectId,
    workspace_id: workspaceId,
    title: listingTitle,
    course: workspace.course,
    level: workspace.level,
    sections: definitions.map((definition) => ({
      title: definition.title,
      content: marketplacePreliminaries[definition.key] || redactPrivateDetails(sectionText.get(definition.key) || ""),
    })),
  }, { onConflict: "project_id" });
  if (snapshotError) {
    if (createdProject) await db.from("projects").delete().eq("id", projectId);
    throw new Error(snapshotError.message || "Could not save the private marketplace document.");
  }
  return projectId;
}

export interface BuyerPersonalDetails {
  seed?: string;
  businessName?: string;
  course?: string | null;
  level?: string | null;
  industrySector?: string | null;
  primaryProduct?: string | null;
  candidateName: string;
  admissionNumber: string;
  institutionName: string;
  supervisorName?: string;
  townOrMarket: string;
  county: string;
  streetOrBuilding?: string;
}

/**
 * Stamps a buyer's personal details, varied preliminary sections, and target location
 * into an anonymized marketplace business plan snapshot.
 */
export function stampMarketplaceBusinessPlan(
  sections: Array<{ title: string; content: string }>,
  buyer: BuyerPersonalDetails
): Array<{ title: string; content: string }> {
  const supervisor = buyer.supervisorName?.trim() || "Project Supervisor";
  const prelims = buildVariedBusinessPlanPreliminaries({
    seed: `${buyer.seed || ""}|${buyer.businessName || ""}|${buyer.candidateName}|${buyer.admissionNumber}`,
    businessName: buyer.businessName || "Enterprise Business Plan",
    candidateName: buyer.candidateName,
    admissionNumber: buyer.admissionNumber,
    institutionName: buyer.institutionName,
    supervisorName: supervisor,
    townOrMarket: buyer.townOrMarket,
    county: buyer.county,
    course: buyer.course,
    level: buyer.level,
    industrySector: buyer.industrySector,
    primaryProduct: buyer.primaryProduct,
  });

  const cleanStreet = (buyer.streetOrBuilding || `${buyer.townOrMarket} Commercial Center`)
    .replace(/\s*\[Confirm exact plot\/street locally\]/gi, "")
    .trim();

  const replacements: Record<string, string> = {
    "{{POSTAL_ADDRESS}}{{TARGET_TOWN}}": `P.O. Box 100, ${buyer.townOrMarket}`,
    "{{CANDIDATE_NAME}}": buyer.candidateName,
    "{{ADMISSION_NUMBER}}": buyer.admissionNumber,
    "{{INSTITUTION_NAME}}": buyer.institutionName,
    "{{SUPERVISOR_NAME}}": supervisor,
    "{{TARGET_TOWN}}": buyer.townOrMarket,
    "{{TARGET_COUNTY}}": buyer.county,
    "{{STREET_ADDRESS}}": cleanStreet || `${buyer.townOrMarket} Commercial Center`,
    "{{PHONE_NUMBER}}": "+254 700 000 000",
    "{{EMAIL_ADDRESS}}": "info@enterprise.co.ke",
    "{{POSTAL_ADDRESS}}": "P.O. Box 100",
    "[Candidate]": buyer.candidateName,
    "[Enter candidate name]": buyer.candidateName,
    "[Admission number withheld]": buyer.admissionNumber,
    "[Enter index number]": buyer.admissionNumber,
    "[Institution]": buyer.institutionName,
    "[Institution name]": buyer.institutionName,
    "[Enter institution name]": buyer.institutionName,
    "[Supervisor]": supervisor,
    "[Supervisor Name]": supervisor,
    "[Supervisor name]": supervisor,
    "[Enter supervisor name]": supervisor,
  };

  const isNairobiTarget = /nairobi/i.test(buyer.townOrMarket) || /nairobi/i.test(buyer.county);

  return sections.map((sec) => {
    const titleNorm = sec.title.trim().toLowerCase();
    if (/declaration|approval/i.test(titleNorm)) {
      return { title: sec.title, content: prelims.declaration };
    }
    if (/^dedication$|prelim\.dedication/i.test(titleNorm)) {
      return { title: sec.title, content: prelims.dedication };
    }
    if (/acknowledg/i.test(titleNorm)) {
      return { title: sec.title, content: prelims.acknowledgements };
    }

    let text = sec.content;
    for (const [token, val] of Object.entries(replacements)) {
      text = text.replaceAll(token, val);
    }
    if (!isNairobiTarget) {
      text = text
        .replace(/within the target Nairobi catchment/gi, `within the ${buyer.townOrMarket}, ${buyer.county} catchment`)
        .replace(/referrals in Nairobi/gi, `referrals in ${buyer.townOrMarket}, ${buyer.county}`)
        .replace(/corridor in Nairobi/gi, `corridor in ${buyer.townOrMarket}, ${buyer.county}`)
        .replace(/institutions in Nairobi/gi, `institutions in ${buyer.townOrMarket}, ${buyer.county}`);
    }
    text = text
      .replace(/\s*\[Confirm exact plot\/street locally\]/gi, "")
      .replace(/\s*\[Confirm lease terms and exact shop unit locally\]/gi, "")
      .replace(/\s*\[Confirm via local market survey\]/gi, "")
      .replace(/\s*\[Confirm site specifics locally\]/gi, "");
    if (/1\.1\b/i.test(titleNorm) && /Green Vitality Motif/i.test(text)) {
      const variedMotif = buildVariedBrandSymbolismBlock({
        seed: `${buyer.seed || ""}|${buyer.businessName || ""}|${buyer.candidateName}`,
        businessName: buyer.businessName || "Enterprise",
        county: buyer.county,
        townOrMarket: buyer.townOrMarket,
        industrySector: buyer.industrySector,
        primaryProduct: buyer.primaryProduct,
      });
      text = text.replace(
        /#### 1\.1\.1 Brand Positioning and Symbolism[\s\S]*?(?=\n#### 1\.1\.2|\n### |$)/i,
        `#### 1.1.1 Brand Positioning and Symbolism\n${variedMotif}\n`
      );
    }
    return {
      title: sec.title,
      content: text,
    };
  });
}

