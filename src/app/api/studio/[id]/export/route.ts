import { createClient } from "@/lib/supabase/server";
import { getServerDbClient } from "@/lib/supabase/admin";
import { getWorkspaceSections } from "@/lib/studio/templates";
import { KNEC_RUBRICS } from "@/lib/studio/rubrics";
import { compileReferenceList } from "@/lib/studio/sources";
import {
  computeWorkspaceAuthorship,
  extractLatestRubricScorecard,
} from "@/lib/studio/authorship";
import { NextResponse, type NextRequest } from "next/server";
import type {
  ProjectWorkspace,
  WorkspaceSection,
  ProjectLogEntry,
  SupervisorReview,
} from "@/types/database";

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatParagraphsHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return `<p style="color:#64748b;font-style:italic;">[No content entered for this section]</p>`;
  }

  return trimmed
    .split(/\n\s*\n/)
    .map((block) => {
      const line = block.trim();
      if (/^#{1,4}\s+/.test(line)) {
        const headingText = escapeHtml(line.replace(/^#{1,4}\s+/, ""));
        return `<h4 style="font-size:12pt;font-weight:bold;margin:12pt 0 4pt 0;color:#0f172a;">${headingText}</h4>`;
      }
      const htmlLines = line
        .split("\n")
        .map((l) => escapeHtml(l.trim()))
        .join("<br/>");
      return `<p style="font-size:11.5pt;line-height:1.6;margin:0 0 10pt 0;text-align:justify;color:#1e293b;">${htmlLines}</p>`;
    })
    .join("\n");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await context.params;
  const docType = request.nextUrl.searchParams.get("doc") === "annex12" ? "annex12" : "report";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const db = getServerDbClient(supabase);

  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data: workspaceData } = await db
    .from("project_workspaces")
    .select(`
      id,
      student_id,
      supervisor_id,
      institution_id,
      workspace_type,
      level,
      course,
      title,
      problem_area,
      status,
      approved_at,
      submitted_at,
      created_at,
      updated_at,
      student:student_id(full_name, admission_number, course, level),
      supervisor:supervisor_id(full_name),
      institution:institution_id(name, code)
    `)
    .eq("id", workspaceId)
    .single();

  if (!workspaceData) {
    return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
  }

  const workspace = workspaceData as unknown as ProjectWorkspace;

  const isAuthorized =
    workspace.student_id === user.id ||
    workspace.supervisor_id === user.id ||
    profile?.role === "admin" ||
    profile?.role === "supervisor";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const [{ data: sectionsData }, { data: logsData }, { data: reviewsData }] = await Promise.all([
    db
      .from("workspace_sections")
      .select("id, workspace_id, section_key, phase, position, current_text, status, ai_accepted_chars, updated_at")
      .eq("workspace_id", workspaceId)
      .order("position", { ascending: true }),
    db
      .from("project_log_entries")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true }),
    db
      .from("supervisor_reviews")
      .select("id, workspace_id, section_id, supervisor_id, status, comment, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
  ]);

  const sections = (sectionsData as WorkspaceSection[]) || [];
  const logs = (logsData as ProjectLogEntry[]) || [];
  const reviews = (reviewsData as SupervisorReview[]) || [];

  const templateDefs = getWorkspaceSections(workspace.workspace_type, workspace.level);
  const sectionMap = new Map(sections.map((s) => [s.section_key, s]));
  const authorship = computeWorkspaceAuthorship(sections, templateDefs.length);
  const savedScorecard = extractLatestRubricScorecard(reviews);
  const rubricDef =
    KNEC_RUBRICS[workspace.workspace_type]?.[workspace.level] ||
    KNEC_RUBRICS.trade_fabrication.diploma;

  // Auto-compile APA 7th references if the references section is still empty
  const refSection = sectionMap.get("references");
  let compiledRefsText = refSection?.current_text?.trim() || "";
  if (!compiledRefsText) {
    const { references } = compileReferenceList(
      sections
        .filter((s) => s.section_key !== "references")
        .map((s) => s.current_text || "")
    );
    compiledRefsText = references.join("\n\n");
  }

  const studentName = escapeHtml(workspace.student?.full_name || "Candidate");
  const admissionNo = escapeHtml(workspace.student?.admission_number || "N/A");
  const supervisorName = escapeHtml(workspace.supervisor?.full_name || "Assigned Supervisor");
  const institutionName = escapeHtml(
    workspace.institution?.name || "Accredited TVET Institution"
  );
  const projectTitle = escapeHtml(
    (workspace.title || `${workspace.course} Examination Project`).toUpperCase()
  );
  const courseTitle = escapeHtml(workspace.course);
  const levelTitle = escapeHtml(
    workspace.level === "diploma" ? "DIPLOMA" : "CRAFT CERTIFICATE"
  );
  const datePrinted = new Date().toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Build Annex 12 Table HTML
  const logRowsHtml =
    logs.length > 0
      ? logs
          .map((log, idx) => {
            const dateStr = escapeHtml(
              new Date(log.entry_date || log.created_at).toLocaleDateString("en-KE")
            );
            const activityStr = escapeHtml(log.activity);
            const problemsStr = escapeHtml(log.problems || "None reported");
            const supCommentStr = escapeHtml(
              log.supervisor_comment || "Reviewed during scheduled supervision"
            );
            const studentSign = log.student_signed_at
              ? `Signed (${new Date(log.student_signed_at).toLocaleDateString("en-KE")})`
              : "Signed";
            const supSign = log.supervisor_signed_at
              ? `Countersigned (${new Date(log.supervisor_signed_at).toLocaleDateString("en-KE")})`
              : "Pending Sign-Off";

            return `
              <tr>
                <td style="border:1px solid #334155;padding:6pt;font-size:10pt;text-align:center;">${idx + 1}</td>
                <td style="border:1px solid #334155;padding:6pt;font-size:10pt;">${dateStr}</td>
                <td style="border:1px solid #334155;padding:6pt;font-size:10pt;">${activityStr}</td>
                <td style="border:1px solid #334155;padding:6pt;font-size:10pt;">${problemsStr}</td>
                <td style="border:1px solid #334155;padding:6pt;font-size:10pt;">${supCommentStr}</td>
                <td style="border:1px solid #334155;padding:6pt;font-size:9.5pt;">
                  <strong>Candidate:</strong> ${studentSign}<br/>
                  <strong>Supervisor:</strong> ${supSign}
                </td>
              </tr>`;
          })
          .join("\n")
      : `<tr><td colspan="6" style="border:1px solid #334155;padding:10pt;text-align:center;">No supervision log entries recorded yet.</td></tr>`;

  // Build Rubric Table HTML
  const rubricRowsHtml = rubricDef.categories
    .map((cat) => {
      const awarded = savedScorecard?.scores?.[cat.key];
      return `
        <tr>
          <td style="border:1px solid #334155;padding:6pt;font-size:10.5pt;">${escapeHtml(cat.label)}</td>
          <td style="border:1px solid #334155;padding:6pt;font-size:10.5pt;text-align:center;">${cat.maxMarks}</td>
          <td style="border:1px solid #334155;padding:6pt;font-size:10.5pt;text-align:center;font-weight:bold;">
            ${awarded !== undefined ? awarded : "—"}
          </td>
        </tr>`;
    })
    .join("\n");

  const annex12SectionHtml = `
    <div style="page-break-before:always;">
      <h2 style="font-size:14pt;font-weight:bold;text-align:center;margin-bottom:4pt;color:#0f172a;">
        KENYA NATIONAL EXAMINATIONS COUNCIL (KNEC)
      </h2>
      <h3 style="font-size:12.5pt;font-weight:bold;text-align:center;margin-top:0;margin-bottom:14pt;color:#1e293b;">
        ANNEX 12: CANDIDATE PROJECT SUPERVISION &amp; PROGRESS LOGBOOK
      </h3>

      <table style="width:100%;border-collapse:collapse;margin-bottom:14pt;font-size:10.5pt;">
        <tr>
          <td style="border:1px solid #334155;padding:6pt;"><strong>Candidate Name:</strong> ${studentName}</td>
          <td style="border:1px solid #334155;padding:6pt;"><strong>Admission / Index No:</strong> ${admissionNo}</td>
        </tr>
        <tr>
          <td style="border:1px solid #334155;padding:6pt;"><strong>Institution:</strong> ${institutionName}</td>
          <td style="border:1px solid #334155;padding:6pt;"><strong>Course &amp; Level:</strong> ${courseTitle} (${levelTitle})</td>
        </tr>
        <tr>
          <td colspan="2" style="border:1px solid #334155;padding:6pt;"><strong>Approved Project Title:</strong> ${projectTitle}</td>
        </tr>
        <tr>
          <td style="border:1px solid #334155;padding:6pt;"><strong>Assigned Supervisor:</strong> ${supervisorName}</td>
          <td style="border:1px solid #334155;padding:6pt;"><strong>Authorship Originality Index:</strong> ${authorship.humanRatioPercent}% Candidate-Authored (${authorship.totalWords} words)</td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;margin-bottom:18pt;">
        <thead>
          <tr style="background-color:#f1f5f9;">
            <th style="border:1px solid #334155;padding:6pt;font-size:10pt;width:6%;">#</th>
            <th style="border:1px solid #334155;padding:6pt;font-size:10pt;width:12%;">Date</th>
            <th style="border:1px solid #334155;padding:6pt;font-size:10pt;width:28%;">Milestone / Activity Undertaken</th>
            <th style="border:1px solid #334155;padding:6pt;font-size:10pt;width:16%;">Challenges</th>
            <th style="border:1px solid #334155;padding:6pt;font-size:10pt;width:22%;">Supervisor Remarks</th>
            <th style="border:1px solid #334155;padding:6pt;font-size:10pt;width:16%;">Verification</th>
          </tr>
        </thead>
        <tbody>
          ${logRowsHtml}
        </tbody>
      </table>

      <h3 style="font-size:12pt;font-weight:bold;margin:16pt 0 8pt 0;color:#0f172a;">
        OFFICIAL KNEC SCORECARD &amp; RUBRIC ASSESSMENT
      </h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16pt;">
        <thead>
          <tr style="background-color:#f1f5f9;">
            <th style="border:1px solid #334155;padding:6pt;font-size:10.5pt;text-align:left;">Assessment Criterion</th>
            <th style="border:1px solid #334155;padding:6pt;font-size:10.5pt;width:18%;">Max Marks</th>
            <th style="border:1px solid #334155;padding:6pt;font-size:10.5pt;width:18%;">Awarded Marks</th>
          </tr>
        </thead>
        <tbody>
          ${rubricRowsHtml}
          <tr style="background-color:#f8fafc;font-weight:bold;">
            <td style="border:1px solid #334155;padding:6pt;font-size:10.5pt;">TOTAL EXAMINATION SCORE</td>
            <td style="border:1px solid #334155;padding:6pt;font-size:10.5pt;text-align:center;">${rubricDef.totalMarks}</td>
            <td style="border:1px solid #334155;padding:6pt;font-size:10.5pt;text-align:center;">
              ${savedScorecard ? `${savedScorecard.totalAwarded} / ${savedScorecard.maxMarks}` : "Pending Final Oral Defence"}
            </td>
          </tr>
        </tbody>
      </table>
      ${
        savedScorecard?.examinerSummary
          ? `<p style="font-size:10.5pt;margin-bottom:14pt;"><strong>Supervisor / Internal Examiner Remarks:</strong> ${escapeHtml(savedScorecard.examinerSummary)}</p>`
          : ""
      }
    </div>`;

  // Build Chapters HTML (for full report mode)
  const sectionsHtml = templateDefs
    .map((def, idx) => {
      const sec = sectionMap.get(def.key);
      const rawText =
        def.key === "references"
          ? compiledRefsText
          : sec?.current_text || "";

      return `
        <div style="${idx > 0 && def.phase === "project" ? "page-break-before:always;" : "margin-top:18pt;"}">
          <h2 style="font-size:13.5pt;font-weight:bold;color:#0f172a;border-bottom:1px solid #cbd5e1;padding-bottom:4pt;margin-bottom:10pt;">
            ${escapeHtml(def.title.toUpperCase())}
          </h2>
          ${formatParagraphsHtml(rawText)}
        </div>`;
    })
    .join("\n");

  const fullReportBodyHtml =
    docType === "annex12"
      ? annex12SectionHtml
      : `
        <!-- Cover Page -->
        <div style="text-align:center;padding-top:36pt;padding-bottom:36pt;">
          <p style="font-size:13pt;font-weight:bold;letter-spacing:0.5pt;margin-bottom:6pt;">
            ${institutionName.toUpperCase()}
          </p>
          <p style="font-size:11pt;margin-bottom:28pt;color:#334155;">
            DEPARTMENT OF APPLIED SCIENCES, NUTRITION &amp; ENTREPRENEURSHIP
          </p>

          <h1 style="font-size:16pt;font-weight:bold;line-height:1.4;margin:24pt 0;color:#0f172a;">
            ${projectTitle}
          </h1>

          <p style="font-size:11.5pt;margin:18pt 0 6pt 0;"><strong>BY:</strong></p>
          <p style="font-size:13pt;font-weight:bold;margin:0 0 4pt 0;">${studentName}</p>
          <p style="font-size:11.5pt;margin:0 0 28pt 0;">
            <strong>ADMISSION / INDEX NO:</strong> ${admissionNo}
          </p>

          <p style="font-size:11pt;line-height:1.6;max-width:440pt;margin:24pt auto;">
            A RESEARCH PROJECT REPORT SUBMITTED TO THE KENYA NATIONAL EXAMINATIONS COUNCIL (KNEC)
            IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF THE
            <strong>${levelTitle} IN ${courseTitle.toUpperCase()}</strong>
          </p>

          <p style="font-size:11.5pt;font-weight:bold;margin-top:36pt;">
            SUPERVISOR: ${supervisorName}
          </p>
          <p style="font-size:11pt;margin-top:12pt;">${escapeHtml(datePrinted.toUpperCase())}</p>
        </div>

        <!-- Declaration & Certification Page -->
        <div style="page-break-before:always;padding-top:12pt;">
          <h2 style="font-size:13.5pt;font-weight:bold;text-align:center;margin-bottom:16pt;">
            DECLARATION AND SUPERVISOR CERTIFICATION
          </h2>
          <p style="font-size:11.5pt;line-height:1.6;margin-bottom:14pt;text-align:justify;">
            <strong>Candidate Declaration:</strong> I hereby declare that this project report is my original work
            and has not been presented for examination or award in any other institution. All secondary sources of
            information cited herein have been duly acknowledged in accordance with APA 7th edition academic standards.
          </p>
          <p style="font-size:11pt;margin-bottom:24pt;">
            <strong>Candidate Name:</strong> ${studentName} &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Admission No:</strong> ${admissionNo} &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Date:</strong> ${escapeHtml(datePrinted)}
          </p>

          <p style="font-size:11.5pt;line-height:1.6;margin-bottom:14pt;text-align:justify;">
            <strong>Supervisor Certification:</strong> This project report has been submitted for examination with my
            official approval as the appointed institutional academic supervisor.
          </p>
          <p style="font-size:11pt;margin-bottom:18pt;">
            <strong>Supervisor Name:</strong> ${supervisorName} &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Moderation Status:</strong> ${escapeHtml(workspace.status.toUpperCase())} &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Date:</strong> ${escapeHtml(
              workspace.approved_at
                ? new Date(workspace.approved_at).toLocaleDateString("en-KE")
                : datePrinted
            )}
          </p>
        </div>

        <!-- Report Sections -->
        <div style="page-break-before:always;">
          ${sectionsHtml}
        </div>

        <!-- Annex 12 Logbook Appendix -->
        ${annex12SectionHtml}
      `;

  const htmlDocument = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${projectTitle}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4 portrait;
      margin: 2.54cm 2.54cm 2.54cm 2.54cm;
    }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 12pt;
      color: #0f172a;
    }
  </style>
</head>
<body>
  ${fullReportBodyHtml}
</body>
</html>`;

  const safeSlug = (workspace.student?.admission_number || workspace.id.slice(0, 8))
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename =
    docType === "annex12"
      ? `KNEC_Annex12_Logbook_${safeSlug}.doc`
      : `KNEC_Project_Report_${safeSlug}.doc`;

  return new NextResponse(htmlDocument, {
    status: 200,
    headers: {
      "Content-Type": "application/msword; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
