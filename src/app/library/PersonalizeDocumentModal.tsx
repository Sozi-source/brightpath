"use client";

import { useState } from "react";
import { Sparkles, FileText, Check, Download, X, MapPin, Building, User, Hash, UserCheck } from "lucide-react";
import { updateStudentPersonalizationAction } from "./actions";

interface PersonalizeDocumentModalProps {
  projectId: string;
  projectTitle: string;
  defaultFullName?: string;
  defaultAdmissionNumber?: string;
  defaultInstitution?: string;
}

export function PersonalizeDocumentModal({
  projectId,
  projectTitle,
  defaultFullName = "",
  defaultAdmissionNumber = "",
  defaultInstitution = "",
}: PersonalizeDocumentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [candidateName, setCandidateName] = useState(defaultFullName);
  const [admissionNumber, setAdmissionNumber] = useState(defaultAdmissionNumber);
  const [institutionName, setInstitutionName] = useState(defaultInstitution);
  const [townOrMarket, setTownOrMarket] = useState("Regional Center");
  const [county, setCounty] = useState("Regional County");
  const [supervisorName, setSupervisorName] = useState("Institutional Supervisor");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const storageKey = `bp_personalization_${projectId}`;

  function handleOpen() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.candidateName) setCandidateName(parsed.candidateName);
        if (parsed.admissionNumber) setAdmissionNumber(parsed.admissionNumber);
        if (parsed.institutionName) setInstitutionName(parsed.institutionName);
        if (parsed.townOrMarket) setTownOrMarket(parsed.townOrMarket);
        if (parsed.county) setCounty(parsed.county);
        if (parsed.supervisorName) setSupervisorName(parsed.supervisorName);
        setIsSaved(true);
      }
    } catch {
      // Ignore
    }
    setIsOpen(true);
  }

  function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        candidateName,
        admissionNumber,
        institutionName,
        townOrMarket,
        county,
        supervisorName,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setIsSaved(true);

      // Sync base profile in background
      const formData = new FormData();
      if (candidateName) formData.append("fullName", candidateName);
      if (admissionNumber) formData.append("admissionNumber", admissionNumber);
      if (institutionName) formData.append("institution", institutionName);
      updateStudentPersonalizationAction(formData).catch(() => {});
    } catch {
      // Ignore
    } finally {
      setIsSaving(false);
    }
  }

  function getDownloadUrl(format: "pdf" | "docx") {
    const params = new URLSearchParams({
      projectId,
      format,
      candidateName: (candidateName || defaultFullName || "Candidate").trim(),
      admissionNumber: (admissionNumber || defaultAdmissionNumber || "ADM/2026/001").trim(),
      institutionName: (institutionName || defaultInstitution || "Kenya Education Cloud TVET Institute").trim(),
      supervisorName: (supervisorName || "Institutional Supervisor").trim(),
      townOrMarket: (townOrMarket || "Regional Center").trim(),
      county: (county || "Regional County").trim(),
    });
    return `/api/download?${params.toString()}`;
  }

  return (
    <>
      {/* Library Card Trigger Strip */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100/80">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="h-3.5 w-3.5 text-teal-700 shrink-0" />
          <span className="text-[11px] font-medium text-teal-900 truncate">
            {isSaved
              ? `Personalized: ${candidateName || "Candidate"} (${townOrMarket || "Local"})`
              : "Not personalized: Using template placeholders"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
        >
          {isSaved ? "Edit Details" : "Personalize"}
        </button>
      </div>

      {/* Direct Quick Download Action Bar on Card */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 font-medium">Download Dossier:</span>
        <div className="flex gap-2">
          <a
            href={getDownloadUrl("pdf")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-teal-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>PDF</span>
          </a>
          <a
            href={getDownloadUrl("docx")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Word</span>
          </a>
        </div>
      </div>

      {/* Personalization Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Top Teal Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-teal-600 via-[#087f8c] to-amber-400" />

            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Personalize for KNEC Examination
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {projectTitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={(e) => { handleSave(e); setIsOpen(false); }} className="p-5 space-y-4">
              <p className="text-[11.5px] text-slate-600 leading-relaxed bg-amber-50/80 border border-amber-200/60 rounded-lg p-2.5">
                The details below will be injected into your official title page, student declaration, market analysis, and institutional sign-off sections.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Candidate Name */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <User className="h-3.5 w-3.5 text-teal-600" />
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. John Kamau Maina"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>

                {/* Admission Number */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Hash className="h-3.5 w-3.5 text-teal-600" />
                    Admission / Index Number
                  </label>
                  <input
                    type="text"
                    required
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder="e.g. ADM/2026/042"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>

                {/* College Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Building className="h-3.5 w-3.5 text-teal-600" />
                    TVET College / National Polytechnic
                  </label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. Nairobi Technical Training Institute"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>

                {/* Town / Market */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-teal-600" />
                    Target Town / Market
                  </label>
                  <input
                    type="text"
                    required
                    value={townOrMarket}
                    onChange={(e) => setTownOrMarket(e.target.value)}
                    placeholder="e.g. Thika, Eldoret, Nakuru"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>

                {/* County */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-teal-600" />
                    Target County
                  </label>
                  <input
                    type="text"
                    required
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="e.g. Kiambu County"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>

                {/* Supervisor Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <UserCheck className="h-3.5 w-3.5 text-teal-600" />
                    Supervisor Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    placeholder="e.g. Mr. David Omondi or Institutional Supervisor"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => { handleSave(); setIsOpen(false); }}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  Save & Apply Details
                </button>

                <div className="flex gap-2">
                  <a
                    href={getDownloadUrl("docx")}
                    onClick={() => handleSave()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Word</span>
                  </a>
                  <a
                    href={getDownloadUrl("pdf")}
                    onClick={() => handleSave()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0f1111] hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
