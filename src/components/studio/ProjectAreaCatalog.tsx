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
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
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
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5 text-indigo-600" />
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
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LineChart className="h-3.5 w-3.5 text-indigo-600" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
              {filteredVentures.map((venture) => {
                const capitalBadgeColor =
                  venture.capitalTier === "Low"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : venture.capitalTier === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200";
                const unitPrice = venture.defaultSpecs.unitSellingPrice;
                const visual = GROUP_VISUALS[venture.group];
                const CategoryIcon = visual.Icon;

                return (
                  <article
                    key={venture.id}
                    className="bp-card group flex min-w-0 flex-col justify-between p-4 transition-shadow hover:shadow-md"
                  >
                    <div>
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${visual.tile} ${visual.accent}`}>
                            <CategoryIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              {venture.groupName}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              Opportunity #{venture.number}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex shrink-0 whitespace-nowrap items-center rounded-md border px-2 py-1 text-[10px] font-semibold ${capitalBadgeColor}`}>
                          {venture.capitalTier} capital
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-[#087f8c]">
                        {venture.title}
                      </h4>
                      <p className="mt-1.5 min-h-[3.75rem] text-xs leading-relaxed text-slate-600 line-clamp-3">
                        {venture.summary}
                      </p>

                      <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                        <div>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Estimated startup capital
                          </span>
                          <span className="mt-0.5 block font-mono text-sm font-semibold text-slate-900">
                            KES {formatKES(venture.estimatedCapitalKES.min)} – {formatKES(venture.estimatedCapitalKES.max)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2">
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-slate-600">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-[#087f8c]" aria-hidden="true" />
                            <span><span className="text-slate-500">Business type: </span><span className="capitalize font-medium">{venture.archetype.replace("_", " ")}</span></span>
                          </span>
                          {typeof unitPrice === "number" && unitPrice > 0 && (
                            <span className="font-mono text-[10px] font-semibold text-slate-700">
                              KES {formatKES(unitPrice)} / unit
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setDetailVenture(venture)}
                        aria-label={`View details for ${venture.title}`}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500" />
                        <span>Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenVentureModal(venture)}
                        className="bp-btn-primary inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs"
                      >
                        <span>Select Area</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
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

          {/* Primary Venture Overview Card */}
          <div className="bp-card overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#087f8c] via-[#0e9ba5] to-[#d9a441]" />
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-[#e8f5f5] px-2 py-0.5 font-mono text-xs font-semibold text-[#087f8c] border border-[#d8ebec]">
                      Area #{detailVenture.number}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      Group {detailVenture.group}: {detailVenture.groupName}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      {detailVenture.capitalTier} Capital Tier
                    </span>
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 capitalize">
                      {detailVenture.archetype.replace("_", " ")} Model
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight pt-1">
                    {detailVenture.title}
                  </h2>
                  <p className="text-xs font-medium text-[#087f8c]">
                    default brand: {detailVenture.defaultSpecs.businessName} — &ldquo;{detailVenture.tagline}&rdquo;
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Estimated Startup Capital
                  </span>
                  <span className="font-mono text-base font-semibold text-slate-900">
                    KES {formatKES(detailVenture.estimatedCapitalKES.min)} – {formatKES(detailVenture.estimatedCapitalKES.max)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {detailVenture.summary}
              </p>

              {/* Key Economics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Unit Selling Price
                  </span>
                  <span className="mt-1 font-mono text-sm font-semibold text-slate-900 block">
                    KES {formatKES(detailVenture.defaultSpecs.unitSellingPrice || 0)}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Unit Direct Cost
                  </span>
                  <span className="mt-1 font-mono text-sm font-semibold text-slate-900 block">
                    KES {formatKES(detailVenture.defaultSpecs.unitCostOfProduction || 0)}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Planned Monthly Volume
                  </span>
                  <span className="mt-1 font-mono text-sm font-semibold text-indigo-600 block">
                    {formatKES(detailVenture.defaultSpecs.monthlyProductionUnitsYear1 || 0)} units/mo
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Premises & Rent
                  </span>
                  <span className="mt-1 font-mono text-sm font-semibold text-slate-900 block">
                    {detailVenture.defaultSpecs.workshopSquareMeters || 30} m² · KES {formatKES(detailVenture.defaultSpecs.monthlyRent || 0)}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Specifications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Offering & Target Market */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Package className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Product / Service & Target Market
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Flagship Offering</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {detailVenture.defaultSpecs.primaryProduct}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Packaging / Delivery Format</span>
                  <p className="text-slate-700 mt-0.5">
                    {detailVenture.defaultSpecs.productPackaging}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Target Customers</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">
                    {detailVenture.defaultSpecs.targetCustomersDescription}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Addressable Catchment</span>
                    <span className="font-semibold text-slate-800">
                      {detailVenture.defaultSpecs.totalMarketPopulation}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Target Market Share</span>
                    <span className="font-mono font-semibold text-indigo-600">
                      {detailVenture.defaultSpecs.projectedMarketSharePercentage}% in Year 1
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Capital & Regulatory Compliance */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Financing & Regulatory Compliance
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Owner Equity</span>
                  <span className="font-mono font-semibold text-slate-900">
                    KES {formatKES(detailVenture.defaultSpecs.ownerEquityAmount || 0)}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Proposed Loan</span>
                  <span className="font-mono font-semibold text-slate-900">
                    KES {formatKES(detailVenture.defaultSpecs.loanAmount || 0)}
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Working Capital</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    KES {formatKES(detailVenture.defaultSpecs.workingCapitalBuffer || 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Statutory & Regulatory Requirements
                </span>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {detailVenture.compliance.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{c.agency}: </span>
                        <span className="text-slate-600">{c.requirement}</span>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-slate-700">
                        KES {formatKES(c.fee)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Equipment & Tools Table */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Included Equipment & Assets
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-700">
                  Total: KES{" "}
                  {formatKES(
                    (detailVenture.defaultSpecs.machinery || []).reduce(
                      (sum, m) => sum + m.quantity * m.unitCost,
                      0
                    )
                  )}
                </span>
              </div>

              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {(detailVenture.defaultSpecs.machinery || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{item.item}</p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity} × KES {formatKES(item.unitCost)} · {item.supplier}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-900 shrink-0">
                      KES {formatKES(item.quantity * item.unitCost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operating Inputs & Staffing */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Staffing & Monthly Inputs
                </h3>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block">Proposed Staffing Plan</span>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {(detailVenture.defaultSpecs.staffing || []).map((staff, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">
                          {staff.count}× {staff.position}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{staff.duties}</p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-800 shrink-0">
                        KES {formatKES(staff.monthlySalary)}/mo
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Monthly Materials / Operating Inputs</span>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {(detailVenture.defaultSpecs.rawMaterials || []).map((rm, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{rm.material}</p>
                        <p className="text-[11px] text-slate-500">
                          {rm.monthlyQuantity} · {rm.supplier}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-800 shrink-0">
                        KES {formatKES(rm.monthlyCost)}/mo
                      </span>
                    </div>
                  ))}
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
