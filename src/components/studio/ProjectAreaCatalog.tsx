"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowRight,
  Building2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  Filter,
  Sparkles,
  FlaskConical,
  LineChart,
  Briefcase,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { NUTRITION_VENTURES, type NutritionVentureDefinition } from "@/lib/studio/catalog/nutritionVentures";
import { createWorkspace } from "@/app/studio/actions";

interface ProjectAreaCatalogProps {
  candidateName?: string;
  admissionNumber?: string;
  course?: string;
  level?: "craft" | "diploma";
  currentWorkspacesCount?: number;
  initialTrack?: "business_plan" | "trade_fabrication" | "research_secondary";
}

type GroupFilter = "ALL" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

const GROUP_LABELS: Record<GroupFilter, string> = {
  ALL: "All Areas (35)",
  A: "A: Clinical (7)",
  B: "B: Food Processing (10)",
  C: "C: Food Service (4)",
  D: "D: Agribusiness (4)",
  E: "E: Retail & Mart (2)",
  F: "F: Community & Culinary Ed (4)",
  G: "G: Wellness & Safety (3)",
  H: "H: Therapeutic Feeds (1)",
};

export function ProjectAreaCatalog({
  candidateName = "Student Candidate",
  admissionNumber = "",
  course = "Diploma in Human Nutrition and Dietetics",
  level = "diploma",
  currentWorkspacesCount = 0,
  initialTrack = "business_plan",
}: ProjectAreaCatalogProps) {
  const [activeTrack, setActiveTrack] = useState<"business_plan" | "trade_fabrication" | "research_secondary">(initialTrack);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter>("ALL");
  const [selectedCapital, setSelectedCapital] = useState<"ALL" | "Low" | "Medium" | "High">("ALL");
  const [selectedVenture, setSelectedVenture] = useState<NutritionVentureDefinition | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states for the launch modal
  const [formCandidateName, setFormCandidateName] = useState(candidateName);
  const [formAdmissionNumber, setFormAdmissionNumber] = useState(admissionNumber);
  const [formLevel, setFormLevel] = useState<"craft" | "diploma">(level);
  const [formCourse, setFormCourse] = useState(course);
  const [formBusinessName, setFormBusinessName] = useState("");
  const [formTownOrMarket, setFormTownOrMarket] = useState("Juja");
  const [formCounty, setFormCounty] = useState("Kiambu");
  const [formPrivacyConsent, setFormPrivacyConsent] = useState(true);

  // Filtered ventures
  const filteredVentures = useMemo(() => {
    return NUTRITION_VENTURES.filter((venture) => {
      if (selectedGroup !== "ALL" && venture.group !== selectedGroup) return false;
      if (selectedCapital !== "ALL" && venture.capitalTier !== selectedCapital) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = venture.title.toLowerCase().includes(q);
        const matchesSummary = venture.summary.toLowerCase().includes(q);
        const matchesTagline = venture.tagline.toLowerCase().includes(q);
        const matchesNum = `#${venture.number}`.includes(q) || `${venture.number}` === q;
        const matchesGroup = venture.groupName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesTagline && !matchesNum && !matchesGroup) {
          return false;
        }
      }
      return true;
    });
  }, [selectedGroup, selectedCapital, searchQuery]);

  const handleOpenVentureModal = (venture: NutritionVentureDefinition) => {
    setSelectedVenture(venture);
    setFormBusinessName(
      (venture.defaultSpecs.businessName as string) || `${venture.title} Enterprise`
    );
  };

  const handleCloseModal = () => {
    setSelectedVenture(null);
  };

  const handleLaunchVenture = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVenture) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("workspaceType", "business_plan");
      formData.set("ventureId", selectedVenture.id);
      formData.set("level", formLevel);
      formData.set("course", formCourse);
      formData.set("admissionNumber", formAdmissionNumber);
      formData.set("businessName", formBusinessName);
      formData.set("title", formBusinessName);
      formData.set("townOrMarket", formTownOrMarket);
      formData.set("county", formCounty);
      formData.set("privacyConsent", formPrivacyConsent ? "on" : "off");

      await createWorkspace(formData);
    });
  };

  const handleLaunchCustomTrack = (track: "trade_fabrication" | "research_secondary") => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("workspaceType", track);
      formData.set("level", formLevel);
      formData.set("course", formCourse);
      formData.set("admissionNumber", formAdmissionNumber);
      formData.set("privacyConsent", "on");

      await createWorkspace(formData);
    });
  };

  return (
    <div className="space-y-5">
      {/* Track Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveTrack("business_plan")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTrack === "business_plan"
                ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
            <span>Nutrition Enterprise (35 Areas)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTrack("trade_fabrication")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTrack === "trade_fabrication"
                ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5 text-indigo-600" />
            <span>Food Science Formulation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTrack("research_secondary")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTrack === "research_secondary"
                ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LineChart className="h-3.5 w-3.5 text-indigo-600" />
            <span>Nutrition Research</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {activeTrack === "business_plan" && `${filteredVentures.length} of 35 areas`}
        </div>
      </div>

      {/* Track 1: Nutrition Enterprise (35 Curated Areas) */}
      {activeTrack === "business_plan" && (
        <div className="space-y-4">
          {/* Controls Strip: Search and Filter Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by venture name, porridge, infant foods, clinical clinic, honey..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Capital Filter Pills */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 hidden sm:inline">Capital:</span>
              {(["ALL", "Low", "Medium", "High"] as const).map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setSelectedCapital(cap)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    selectedCapital === cap
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cap === "ALL" ? "All Tiers" : cap}
                </button>
              ))}
            </div>
          </div>

          {/* Group Tabs Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {(Object.keys(GROUP_LABELS) as GroupFilter[]).map((groupKey) => {
              const isActive = selectedGroup === groupKey;
              return (
                <button
                  key={groupKey}
                  type="button"
                  onClick={() => setSelectedGroup(groupKey)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {GROUP_LABELS[groupKey]}
                </button>
              );
            })}
          </div>

          {/* 35 Venture Cards Grid */}
          {filteredVentures.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-xs font-semibold text-slate-700">No project areas match your search</p>
              <p className="mt-1 text-xs text-slate-500">Try clearing filters or search terms.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGroup("ALL");
                  setSelectedCapital("ALL");
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredVentures.map((venture) => {
                const capitalBadgeColor =
                  venture.capitalTier === "Low"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : venture.capitalTier === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200";

                return (
                  <div
                    key={venture.id}
                    className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-indigo-400 hover:shadow-sm transition-all"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex h-5 items-center justify-center rounded-md bg-indigo-50 px-1.5 text-[10px] font-semibold text-indigo-700 border border-indigo-100">
                            #{venture.number}
                          </span>
                          <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {venture.groupName}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${capitalBadgeColor}`}
                        >
                          {venture.capitalTier} Capital
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h4 className="text-sm font-semibold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {venture.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {venture.summary}
                      </p>

                      {/* Metadata Row */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-emerald-600" />
                          <span>
                            KES {(venture.estimatedCapitalKES.min / 1000).toFixed(0)}k -{" "}
                            {(venture.estimatedCapitalKES.max / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-indigo-500" />
                          <span className="capitalize">{venture.archetype.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenVentureModal(venture)}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>Select Project Area</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Track 2: Food Science Formulation */}
      {activeTrack === "trade_fabrication" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              <FlaskConical className="h-4 w-4" />
              <span>Laboratory Formulation & Proximate Analysis</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Food Science Formulation Track
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conduct recipe optimization, proximate compositional analysis (moisture, ash, crude protein, lipid, fiber, carbohydrate), and 9-point Hedonic sensory evaluation following KNEC trade test procedures.
            </p>
            <div className="pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleLaunchCustomTrack("trade_fabrication")}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>Start Food Science Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track 3: Nutrition Research */}
      {activeTrack === "research_secondary" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
              <LineChart className="h-4 w-4" />
              <span>Secondary Epidemiology & Survey Analysis</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Nutrition Research Track
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Perform rigorous secondary data analysis utilizing KDHS, KNBS census data, or MOH nutrition surveillance surveys. Includes cross-tabulation, prevalence rates, and public health policy recommendations.
            </p>
            <div className="pt-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleLaunchCustomTrack("research_secondary")}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                <span>Start Nutrition Research Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Launch Modal */}
      {selectedVenture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                    Area #{selectedVenture.number}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{selectedVenture.groupName}</span>
                </div>
                <h3 className="mt-1 text-base font-semibold text-slate-900 tracking-tight">
                  {selectedVenture.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLaunchVenture} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formAdmissionNumber}
                    onChange={(e) => setFormAdmissionNumber(e.target.value)}
                    placeholder="e.g. 24/09123"
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qualification Level <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as "craft" | "diploma")}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="diploma">Diploma</option>
                    <option value="craft">Certificate (Craft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Enterprise Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formBusinessName}
                  onChange={(e) => setFormBusinessName(e.target.value)}
                  placeholder="e.g. Afya Bora Nutri-Flour Enterprises"
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Geographic Anchoring */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Town / Market <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTownOrMarket}
                    onChange={(e) => setFormTownOrMarket(e.target.value)}
                    placeholder="e.g. Juja, Thika, Eldoret"
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target County <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCounty}
                    onChange={(e) => setFormCounty(e.target.value)}
                    placeholder="e.g. Kiambu, Nairobi, Nakuru"
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Academic Single-Line Consent */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formPrivacyConsent}
                    onChange={(e) => setFormPrivacyConsent(e.target.checked)}
                    required
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span>I confirm these parameters for KNEC examination compliance.</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isPending}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Project Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
