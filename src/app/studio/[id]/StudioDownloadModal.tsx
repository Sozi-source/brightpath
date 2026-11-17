"use client";

import { useEffect, useState } from "react";
import { Download, X, User, Hash, Building, MapPin, UserCheck, FileText } from "lucide-react";

interface StudioDownloadModalProps {
  workspaceId: string;
  projectTitle: string;
  isAdmin: boolean;
  defaultFullName?: string;
  defaultAdmissionNumber?: string;
  defaultInstitution?: string;
  defaultSupervisorName?: string;
  buttonLabel?: string;
  buttonClassName?: string;
}

export function StudioDownloadModal({
  workspaceId,
  projectTitle,
  isAdmin,
  defaultFullName = "",
  defaultAdmissionNumber = "",
  defaultInstitution = "",
  defaultSupervisorName = "",
  buttonLabel = "Download Word (.docx)",
  buttonClassName = "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer",
}: StudioDownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [candidateName, setCandidateName] = useState(defaultFullName);
  const [admissionNumber, setAdmissionNumber] = useState(defaultAdmissionNumber);
  const [institutionName, setInstitutionName] = useState(defaultInstitution);
  const [townOrMarket, setTownOrMarket] = useState("");
  const [county, setCounty] = useState("");
  const [supervisorName, setSupervisorName] = useState(defaultSupervisorName);

  const storageKey = `bp_studio_export_${workspaceId}`;

  useEffect(() => {
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
      }
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  function saveDraftDetails() {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          candidateName,
          admissionNumber,
          institutionName,
          townOrMarket,
          county,
          supervisorName,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }

  function buildDownloadUrl(format: "docx" | "pdf", withPlaceholders = false) {
    const params = new URLSearchParams({ format });
    if (!withPlaceholders) {
      if (candidateName.trim()) params.set("candidateName", candidateName.trim());
      if (admissionNumber.trim()) params.set("admissionNumber", admissionNumber.trim());
      if (institutionName.trim()) params.set("institutionName", institutionName.trim());
      if (townOrMarket.trim()) params.set("townOrMarket", townOrMarket.trim());
      if (county.trim()) params.set("county", county.trim());
      if (supervisorName.trim()) params.set("supervisorName", supervisorName.trim());
    }
    return `/api/studio/${workspaceId}/export?${params.toString()}`;
  }

  function handleSubmitDownload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    saveDraftDetails();
    const url = buildDownloadUrl("docx", false);
    setIsOpen(false);
    window.location.href = url;
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={buttonClassName}>
        <Download className="h-3.5 w-3.5 text-[#087f8c]" />
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="h-1 flex w-full">
              <div className="w-[60%] bg-blue-700" />
              <div className="w-[40%] bg-amber-500" />
            </div>

            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                    Candidate &amp; Location Details
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{projectTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDownload} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label className="space-y-1 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-700" />
                    Candidate Name
                  </span>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. John Kamau Maina"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs font-normal text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-blue-700" />
                    Admission / Index No.
                  </span>
                  <input
                    type="text"
                    required
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder="e.g. ADM/2026/042"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs font-normal text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-semibold text-slate-700 sm:col-span-2">
                  <span className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-blue-700" />
                    Institution
                  </span>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. Nairobi Technical Training Institute"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs font-normal text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-700" />
                    Town / Center
                  </span>
                  <input
                    type="text"
                    required
                    value={townOrMarket}
                    onChange={(e) => setTownOrMarket(e.target.value)}
                    placeholder="e.g. Thika"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs font-normal text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-700" />
                    County
                  </span>
                  <input
                    type="text"
                    required
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="e.g. Kiambu County"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs font-normal text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </label>

                <label className="space-y-1 text-xs font-semibold text-slate-700 sm:col-span-2">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-blue-700" />
                    Supervisor Name
                  </span>
                  <input
                    type="text"
                    required
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    placeholder="e.g. Mr. David Omondi"
                    className="w-full h-9 rounded-lg border border-slate-300 px-3 text-xs font-normal text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                {isAdmin ? (
                  <a
                    href={buildDownloadUrl("docx", true)}
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Master (.docx)</span>
                  </a>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bp-btn-primary px-4 py-2 text-xs shadow-2xs cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Word (.docx)</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
