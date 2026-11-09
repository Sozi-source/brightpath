"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowRight,
  ArrowLeft,
  Building2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  FlaskConical,
  LineChart,
  Briefcase,
  Package,
  Wrench,
  Users,
  Eye,
  HeartPulse,
  Factory,
  Utensils,
  Sprout,
  Store,
  GraduationCap,
  ClipboardCheck,
  PawPrint,
  MoreVertical,
  Folder,
  FileText,
  Calculator,
  Star,
  Award,
  BookOpen,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { NUTRITION_VENTURES, type NutritionVentureDefinition } from "@/lib/studio/catalog/nutritionVentures";
import { createWorkspace } from "@/app/studio/actions";
import { getCanvasPalette } from "@/lib/canvasTheme";

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
  E: "E: Specialty Retail (2)",
  F: "F: Nutrition Ed (4)",
  G: "G: Advisory & Audits (3)",
  H: "H: Therapeutic Feeds (1)",
};

const GROUP_VISUALS = {
  A: { Icon: HeartPulse, tile: "bg-rose-50 text-rose-700", accent: "border-rose-100" },
  B: { Icon: Factory, tile: "bg-amber-50 text-amber-700", accent: "border-amber-100" },
  C: { Icon: Utensils, tile: "bg-orange-50 text-orange-700", accent: "border-orange-100" },
  D: { Icon: Sprout, tile: "bg-green-50 text-green-700", accent: "border-green-100" },
  E: { Icon: Store, tile: "bg-violet-50 text-violet-700", accent: "border-violet-100" },
  F: { Icon: GraduationCap, tile: "bg-sky-50 text-sky-700", accent: "border-sky-100" },
  G: { Icon: ClipboardCheck, tile: "bg-indigo-50 text-indigo-700", accent: "border-indigo-100" },
  H: { Icon: PawPrint, tile: "bg-teal-50 text-teal-700", accent: "border-teal-100" },
} as const;

export function ProjectAreaCatalog({
  admissionNumber = "",
  course = "Diploma in Human Nutrition and Dietetics",
  level = "diploma",
  initialTrack = "business_plan",
}: ProjectAreaCatalogProps) {
  const [activeTrack, setActiveTrack] = useState<"business_plan" | "trade_fabrication" | "research_secondary">(initialTrack);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter>("ALL");
  const [selectedCapital, setSelectedCapital] = useState<"ALL" | "Low" | "Medium" | "High">("ALL");
  const [detailVenture, setDetailVenture] = useState<NutritionVentureDefinition | null>(null);
  const [selectedVenture, setSelectedVenture] = useState<NutritionVentureDefinition | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states for the launch modal
  const [formAdmissionNumber, setFormAdmissionNumber] = useState(admissionNumber);
  const [formLevel, setFormLevel] = useState<"craft" | "diploma">(level);
  const [formBusinessName, setFormBusinessName] = useState("");
  const [formTownOrMarket, setFormTownOrMarket] = useState("Juja");
  const [formCounty, setFormCounty] = useState("Kiambu");
  const [formPrivacyConsent, setFormPrivacyConsent] = useState(true);

  const formatKES = (n: number) => Math.round(n).toLocaleString("en-KE");

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
        const matchesProduct = (venture.defaultSpecs.primaryProduct || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesTagline && !matchesNum && !matchesGroup && !matchesProduct) {
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
      formData.set("course", course);
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
      formData.set("course", course);
      formData.set("admissionNumber", formAdmissionNumber);
      formData.set("privacyConsent", "on");

      await createWorkspace(formData);
    });
  };

  const detailPalette = detailVenture ? getCanvasPalette(detailVenture.id || detailVenture.number) : null;
  const detailUnitPrice = detailVenture?.defaultSpecs.unitSellingPrice || 0;
  const detailUnitCost = detailVenture?.defaultSpecs.unitCostOfProduction || 0;
  const detailGrossMargin =
    detailUnitPrice > 0
      ? Math.round(((detailUnitPrice - detailUnitCost) / detailUnitPrice) * 100)
      : 0;
  const DetailCategoryIcon = detailVenture ? GROUP_VISUALS[detailVenture.group].Icon : null;

  return (
    <div className="space-y-4">
      {/* Track Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setActiveTrack("business_plan");
              setDetailVenture(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTrack === "business_plan"
                ? "bg-white text-[#087f8c] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-[#087f8c]" />
            <span>Nutrition Enterprise (35 Areas)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTrack("trade_fabrication");
              setDetailVenture(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTrack === "trade_fabrication"
                ? "bg-white text-[#087f8c] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5 text-[#087f8c]" />
            <span>Food Science Formulation</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTrack("research_secondary");
              setDetailVenture(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTrack === "research_secondary"
                ? "bg-white text-[#087f8c] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LineChart className="h-3.5 w-3.5 text-[#087f8c]" />
            <span>Nutrition Research</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium font-mono">
          {activeTrack === "business_plan" &&
            (detailVenture
              ? `Area #${detailVenture.number} of 35`
              : `${filteredVentures.length} of 35 areas`)}
        </div>
      </div>

      {/* Track 1: Nutrition Enterprise (35 Curated Areas) */}
      {activeTrack === "business_plan" && !detailVenture && (
        <div className="space-y-4">
          {/* Controls Strip: Search and Filter Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by venture name, porridge, weaning, clinic, kefir, honey..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-100"
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
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
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
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#087f8c] text-white shadow-2xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {GROUP_LABELS[groupKey]}
                </button>
              );
            })}
          </div>

          {/* Opportunity cards */}
          {filteredVentures.length === 0 ? (
            <div className="bp-card border-dashed p-8 text-center">
              <p className="text-xs font-semibold text-slate-700">No project areas match your search</p>
              <p className="mt-1 text-xs text-slate-500">Try clearing filters or search terms.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGroup("ALL");
                  setSelectedCapital("ALL");
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#e8f5f5] px-3 py-1.5 text-xs font-semibold text-[#087f8c] hover:bg-teal-100 cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredVentures.map((venture) => {
                const capitalBadgeColor =
                  venture.capitalTier === "Low"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : venture.capitalTier === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200";
                const visual = GROUP_VISUALS[venture.group];
                const CategoryIcon = visual.Icon;
                const palette = getCanvasPalette(venture.id || venture.number);

                return (
                  <article
                    key={venture.id}
                    className={`group flex min-w-0 flex-col justify-between rounded-lg border border-slate-200/90 bg-white shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden ${palette.hoverBorder}`}
                  >
                    <div>
                      {/* 1. Canvas Signature Top Cover Banner (Dynamic Color Block) */}
                      <div
                        className={`relative h-32 sm:h-36 w-full bg-gradient-to-br ${palette.bgGradient} p-3.5 flex flex-col justify-between overflow-hidden cursor-pointer select-none`}
                        onClick={() => setDetailVenture(venture)}
                      >
                        {/* Canvas Grid Dot Mesh Watermark */}
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

                        {/* Top Ribbon on Banner: Area Number + Canvas 3-Dots Action Button */}
                        <div className="relative z-10 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-xs text-[10px] font-bold text-white tracking-wider uppercase border border-white/20">
                            <CategoryIcon className="h-3 w-3" />
                            <span>Area #{venture.number}</span>
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailVenture(venture);
                            }}
                            title="View Course Details"
                            className={`h-7 w-7 rounded-full ${palette.circleMenuBg} flex items-center justify-center shadow-xs hover:scale-105 transition-transform cursor-pointer border border-white/25`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Bottom Tag on Banner */}
                        <div className="relative z-10">
                          <span className="text-[11px] font-bold tracking-wider uppercase text-white/90 drop-shadow-xs block">
                            {venture.groupName}
                          </span>
                        </div>
                      </div>

                      {/* 2. Canvas Course Card Body — Minimalist & High-End */}
                      <div className="p-3.5 sm:p-4 space-y-1">
                        {/* Colored Course / Category Code (Canvas Signature) */}
                        <span
                          style={{ color: palette.accentHex }}
                          className="font-bold text-[11px] sm:text-xs uppercase tracking-wider truncate block"
                        >
                          KNEC {level === "craft" ? "CRAFT" : "DIPLOMA"} · {venture.archetype.replace("_", " ")}
                        </span>

                        {/* Course Title */}
                        <h4
                          onClick={() => setDetailVenture(venture)}
                          className="font-bold text-[13.5px] sm:text-[14.5px] leading-snug text-slate-900 group-hover:text-[#087f8c] transition-colors cursor-pointer line-clamp-2"
                        >
                          {venture.title}
                        </h4>

                        {/* Institution / Curriculum Subtitle (Canvas Signature) */}
                        <p className="text-[11.5px] text-slate-500 truncate pt-0.5">
                          {venture.groupName} · TVET Standard
                        </p>
                      </div>
                    </div>

                    {/* 3. Canvas Bottom Utility Tray (Announcements / Files / Launch) */}
                    <div className="border-t border-slate-100 bg-slate-50/70 px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-slate-400">
                        <button
                          type="button"
                          onClick={() => setDetailVenture(venture)}
                          title="KNEC Word (.docx) & PDF Manuscript"
                          className="hover:text-slate-700 cursor-pointer transition-colors p-0.5"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailVenture(venture)}
                          title="Financial Schedules, Cashflow & Break-even"
                          className="hover:text-slate-700 cursor-pointer transition-colors p-0.5"
                        >
                          <Calculator className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailVenture(venture)}
                          title="KNEC Examination Syllabus & Rubric"
                          className="hover:text-slate-700 cursor-pointer transition-colors p-0.5"
                        >
                          <Folder className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailVenture(venture)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer px-1 py-0.5"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenVentureModal(venture)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold text-white shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                          style={{ backgroundColor: palette.accentHex }}
                        >
                          <span>Select</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Venture Details View */}
      {activeTrack === "business_plan" && detailVenture && (
        <div className="space-y-4">
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bp-card px-4 py-3">
            <button
              type="button"
              onClick={() => setDetailVenture(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#087f8c] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to All 35 Project Areas</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenVentureModal(detailVenture)}
                className="inline-flex items-center gap-1.5 bp-btn-primary px-4 py-2 text-xs shadow-2xs cursor-pointer"
              >
                <span>Select & Launch This Area</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Amazon Kindle Split Layout: Accompanied Card (Left) + Concise Details (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Accompanied Canvas Card & Quick Launch */}
            <div className="lg:col-span-4 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
              {/* Accompanied Canvas Card */}
              <div
                className={`rounded-xl border border-slate-200/90 bg-white shadow-sm overflow-hidden ${detailPalette?.hoverBorder || ""}`}
              >
                {/* Top Cover Banner */}
                <div
                  className={`relative h-36 w-full bg-gradient-to-br ${detailPalette?.bgGradient || "from-[#087f8c] to-[#044e56]"} p-3.5 flex flex-col justify-between overflow-hidden select-none`}
                >
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 backdrop-blur-xs text-[10px] font-bold text-white tracking-wider uppercase border border-white/20">
                      {DetailCategoryIcon && <DetailCategoryIcon className="h-3 w-3" />}
                      <span>Area #{detailVenture.number}</span>
                    </span>

                    <span
                      className={`h-7 w-7 rounded-full ${detailPalette?.circleMenuBg || "bg-teal-600"} flex items-center justify-center text-white border border-white/25 shadow-xs`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="relative z-10">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-white/90 drop-shadow-xs block">
                      {detailVenture.groupName}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-1.5">
                  <span
                    style={{ color: detailPalette?.accentHex || "#087f8c" }}
                    className="font-bold text-xs uppercase tracking-wider block"
                  >
                    KNEC {level === "craft" ? "CRAFT" : "DIPLOMA"} · {detailVenture.archetype.replace("_", " ")}
                  </span>

                  <h3 className="font-bold text-base leading-snug text-slate-900">
                    {detailVenture.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {detailVenture.groupName} · TVET Standard Series #{detailVenture.number}
                  </p>
                </div>

                {/* Bottom Utility Icons */}
                <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span title="KNEC Word (.docx) & PDF Manuscript">
                      <FileText className="h-4 w-4 text-slate-500" />
                    </span>
                    <span title="3-Year Financial Schedules">
                      <Calculator className="h-4 w-4 text-slate-500" />
                    </span>
                    <span title="KNEC Examination Syllabus">
                      <Folder className="h-4 w-4 text-slate-500" />
                    </span>
                  </div>
                  <span className="font-semibold text-slate-700">Area #{detailVenture.number}</span>
                </div>
              </div>

              {/* Fast Launch CTA Box */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <button
                  type="button"
                  onClick={() => handleOpenVentureModal(detailVenture)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#087f8c] hover:bg-[#076c77] py-2.5 px-4 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer"
                >
                  <span>Select & Launch This Area</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Quick Spec Attributes */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Format</span>
                    <span className="font-semibold text-slate-800">5-Chapter Dossier</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Examination</span>
                    <span className="font-semibold text-slate-800">KNEC {level === "craft" ? "Craft" : "Diploma"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Capital Tier</span>
                    <span className="font-semibold text-emerald-700">{detailVenture.capitalTier} Capital</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Export Formats</span>
                    <span className="font-semibold text-slate-800">Word (.docx) & PDF</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Financial Math</span>
                    <span className="font-semibold text-slate-800">3-Year Audited Models</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Concise Product Details (Amazon Kindle Style) */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-5">
              {/* Product Header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-[#e8f5f5] px-2 py-0.5 font-mono text-[11px] font-bold text-[#087f8c] border border-[#d8ebec]">
                    Area #{detailVenture.number}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {detailVenture.groupName}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    {detailVenture.capitalTier} Capital Tier
                  </span>
                  <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 capitalize">
                    {detailVenture.archetype.replace("_", " ")} Model
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {detailVenture.title}
                </h1>

                <p className="text-xs text-slate-600">
                  Default Enterprise: <span className="font-semibold text-slate-900">{detailVenture.defaultSpecs.businessName}</span> — &ldquo;{detailVenture.tagline}&rdquo;
                </p>
              </div>

              {/* Amazon Quick Specs Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Est. Capital
                  </span>
                  <span className="mt-0.5 font-mono text-xs font-bold text-slate-900 block truncate">
                    KES {formatKES(detailVenture.estimatedCapitalKES.min)} - {formatKES(detailVenture.estimatedCapitalKES.max)}
                  </span>
                </div>

                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Unit Price
                  </span>
                  <span className="mt-0.5 font-mono text-xs font-bold text-slate-900 block truncate">
                    KES {formatKES(detailUnitPrice)}
                  </span>
                </div>

                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Unit Cost
                  </span>
                  <span className="mt-0.5 font-mono text-xs font-bold text-slate-900 block truncate">
                    KES {formatKES(detailUnitCost)}
                  </span>
                </div>

                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Gross Margin
                  </span>
                  <span className="mt-0.5 font-mono text-xs font-bold text-emerald-600 block truncate">
                    ~{detailGrossMargin}%
                  </span>
                </div>

                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Monthly Vol
                  </span>
                  <span className="mt-0.5 font-mono text-xs font-bold text-indigo-600 block truncate">
                    {formatKES(detailVenture.defaultSpecs.monthlyProductionUnitsYear1 || 0)} u/mo
                  </span>
                </div>

                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Premises / Rent
                  </span>
                  <span className="mt-0.5 font-mono text-xs font-bold text-slate-900 block truncate">
                    {detailVenture.defaultSpecs.workshopSquareMeters || 30} m² (KES {formatKES(detailVenture.defaultSpecs.monthlyRent || 0)})
                  </span>
                </div>
              </div>

              {/* Concise Description & About This Project */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  About This Project Area
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-sans">
                  {detailVenture.summary}
                </p>
              </div>

              {/* What's Included (Amazon-style Feature Checklist) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Included in this KNEC Project Workspace
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Complete 5-Chapter manuscript structure (KNEC standard rubric)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Itemized bill of quantities with Kenyan equipment suppliers</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>3-Year audited financial projections (Cashflow, P&L, Balance Sheet)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Statutory permitting breakdown (County Permit, KEBS, Public Health, KRA)</span>
                  </div>
                </div>
              </div>

              {/* Specifications: 2x2 Clean Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Offering & Market Catchment */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Package className="h-4 w-4 text-indigo-600" />
                    <h5 className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                      Product Offering & Market
                    </h5>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Primary Product:</span>
                    <span className="font-semibold text-slate-900">{detailVenture.defaultSpecs.primaryProduct}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Packaging Format:</span>
                    <span className="text-slate-700">{detailVenture.defaultSpecs.productPackaging}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Target Market Catchment:</span>
                    <span className="text-slate-700">{detailVenture.defaultSpecs.totalMarketPopulation} ({detailVenture.defaultSpecs.projectedMarketSharePercentage}% Year 1 share)</span>
                  </div>
                </div>

                {/* Capital & Financing Breakdown */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <h5 className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                      Financing & Statutory Compliance
                    </h5>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="rounded bg-slate-50 p-1.5 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Owner Equity</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        KES {formatKES(detailVenture.defaultSpecs.ownerEquityAmount || 0)}
                      </span>
                    </div>
                    <div className="rounded bg-slate-50 p-1.5 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">SACCO/Loan</span>
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        KES {formatKES(detailVenture.defaultSpecs.loanAmount || 0)}
                      </span>
                    </div>
                    <div className="rounded bg-slate-50 p-1.5 border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Buffer</span>
                      <span className="font-mono font-bold text-emerald-700 text-[11px]">
                        KES {formatKES(detailVenture.defaultSpecs.workingCapitalBuffer || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-slate-500 block">Statutory Licensing:</span>
                    <div className="divide-y divide-slate-100 rounded border border-slate-200">
                      {detailVenture.compliance.slice(0, 3).map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between px-2 py-1 text-[11px]">
                          <span className="text-slate-700">{c.agency}: {c.requirement}</span>
                          <span className="font-mono font-semibold text-slate-800">KES {formatKES(c.fee)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Equipment & Machinery Table */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <h5 className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                        Equipment & Tools
                      </h5>
                    </div>
                    <span className="font-mono font-semibold text-slate-700 text-[11px]">
                      Total: KES {formatKES((detailVenture.defaultSpecs.machinery || []).reduce((s, m) => s + m.quantity * m.unitCost, 0))}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 rounded border border-slate-200 max-h-48 overflow-y-auto">
                    {(detailVenture.defaultSpecs.machinery || []).map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between px-2.5 py-1.5 text-[11px]">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{m.item}</p>
                          <p className="text-[10px] text-slate-500">{m.quantity}× · {m.supplier}</p>
                        </div>
                        <span className="font-mono font-semibold text-slate-900 shrink-0">
                          KES {formatKES(m.quantity * m.unitCost)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operating Inputs & Staffing */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Users className="h-4 w-4 text-amber-600" />
                    <h5 className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                      Staffing & Monthly Inputs
                    </h5>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Staffing:</span>
                    <div className="divide-y divide-slate-100 rounded border border-slate-200">
                      {(detailVenture.defaultSpecs.staffing || []).slice(0, 3).map((st, idx) => (
                        <div key={idx} className="flex items-center justify-between px-2.5 py-1 text-[11px]">
                          <span className="text-slate-800">{st.count}× {st.position}</span>
                          <span className="font-mono font-semibold text-slate-700">KES {formatKES(st.monthlySalary)}/mo</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Key Monthly Inputs:</span>
                    <div className="divide-y divide-slate-100 rounded border border-slate-200 max-h-24 overflow-y-auto">
                      {(detailVenture.defaultSpecs.rawMaterials || []).slice(0, 3).map((rm, idx) => (
                        <div key={idx} className="flex items-center justify-between px-2.5 py-1 text-[11px]">
                          <span className="text-slate-700 truncate">{rm.material}</span>
                          <span className="font-mono font-semibold text-slate-700 shrink-0">KES {formatKES(rm.monthlyCost)}/mo</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Viva Voce Quick Examiner Notes */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-teal-700" />
                  <h5 className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
                    KNEC Oral Defense (Viva Voce) Moderator Guidance
                  </h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11.5px] leading-relaxed">
                  <div className="rounded bg-white p-2.5 border border-slate-200/80">
                    <p className="font-bold text-slate-900">Working Capital Justification</p>
                    <p className="mt-0.5">Defend that KES {formatKES(detailVenture.defaultSpecs.workingCapitalBuffer || 0)} covers 3 months of raw materials and rent before receipts stabilize.</p>
                  </div>
                  <div className="rounded bg-white p-2.5 border border-slate-200/80">
                    <p className="font-bold text-slate-900">Break-Even & Gross Margin</p>
                    <p className="mt-0.5">Unit selling price KES {formatKES(detailUnitPrice)} vs direct cost KES {formatKES(detailUnitCost)} yields ~{detailGrossMargin}% gross margin.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-2xs disabled:opacity-50 cursor-pointer"
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
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs disabled:opacity-50 cursor-pointer"
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
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-700">
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
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
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
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>I confirm these parameters for KNEC examination compliance.</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isPending}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
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
