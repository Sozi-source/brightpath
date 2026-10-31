"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Calculator,
  Building2,
  DollarSign,
  Package,
  Wrench,
  CheckCircle2,
  Loader2,
  X,
  ChevronRight,
  FileText,
  Plus,
} from "lucide-react";
import type { BusinessPlanSpecs } from "@/lib/studio/businessPlanTypes";
import { BUSINESS_PLAN_PRESETS } from "@/lib/studio/businessPlanTypes";
import { computeBusinessPlanFinancials } from "@/lib/studio/businessPlanMath";
import {
  buildBusinessPlanChapterAction,
  reviewBusinessPlanDocumentAction,
  saveBusinessPlanDetailsAction,
} from "@/app/studio/actions";

interface BusinessPlanBuilderModalProps {
  workspaceId: string;
  defaultCandidateName?: string;
  defaultAdmissionNumber?: string;
  defaultInstitutionName?: string;
  defaultSupervisorName?: string;
  defaultCourse?: string;
  defaultLevel?: "craft" | "diploma";
  initialSpecs?: Partial<BusinessPlanSpecs>;
  onPlanGenerated?: () => void;
  triggerButton?: React.ReactNode;
}

type RequiredField =
  | "businessName"
  | "industrySector"
  | "candidateName"
  | "admissionNumber"
  | "institutionName"
  | "course"
  | "county"
  | "townOrMarket"
  | "primaryProduct";

type WholeDocumentReview = {
  findings: Array<{
    sectionKey: string;
    severity: "high" | "medium" | "low";
    category: string;
    issue: string;
    recommendation: string;
    sourceRefs: number[];
  }>;
  chaptersReviewed: number;
  warnings: string[];
  researchSources: Array<{ title: string; url: string }>;
};

const REQUIRED_FIELDS: Array<{
  key: RequiredField;
  label: string;
  tab: "identity" | "products";
}> = [
  { key: "businessName", label: "Business name", tab: "identity" },
  { key: "industrySector", label: "Industry sector", tab: "identity" },
  { key: "candidateName", label: "Candidate name", tab: "identity" },
  { key: "admissionNumber", label: "Admission number", tab: "identity" },
  { key: "institutionName", label: "Training institution", tab: "identity" },
  { key: "course", label: "Course", tab: "identity" },
  { key: "county", label: "County", tab: "identity" },
  { key: "townOrMarket", label: "Town or market", tab: "identity" },
  { key: "primaryProduct", label: "Primary product or service", tab: "products" },
];

export function BusinessPlanBuilderModal({
  workspaceId,
  defaultCandidateName = "",
  defaultAdmissionNumber = "",
  defaultInstitutionName = "",
  defaultSupervisorName = "",
  defaultCourse = "Certificate in Human Nutrition and Dietetics",
  defaultLevel = "craft",
  initialSpecs,
  onPlanGenerated,
  triggerButton,
}: BusinessPlanBuilderModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [aiProvider, setAIProvider] = useState<"gemini" | "groq">("groq");
  const [activeTab, setActiveTab] = useState<
    "presets" | "identity" | "products" | "operations" | "financials"
  >("presets");

  // Presets are optional examples; a new plan starts with candidate-owned values.
  const [specs, setSpecs] = useState<BusinessPlanSpecs>(() => ({
      businessName: "",
      tagline: "",
      industrySector: "",
      formOfOwnership: "Sole Proprietorship",
      registrationType: "",
      candidateName: defaultCandidateName || "",
      admissionNumber: defaultAdmissionNumber || "",
      institutionName: defaultInstitutionName || "",
      supervisorName: defaultSupervisorName || "",
      course: defaultCourse,
      level: defaultLevel,
      ownerQualifications: "",
      county: "",
      townOrMarket: "",
      streetOrBuilding: "",
      postalAddress: "",
      email: "",
      phone: "",
      locationRationale: "",
      primaryProduct: "",
      productDescription: "",
      productPackaging: "",
      unitSellingPrice: 0,
      unitCostOfProduction: 0,
      monthlyProductionUnitsYear1: 0,
      annualGrowthRateYear2: 0,
      annualGrowthRateYear3: 0,
      targetCustomersDescription: "",
      totalMarketPopulation: "",
      projectedMarketSharePercentage: 0,
      competitors: [],
      marketingPromotionBudgetMonthly: 0,
      machinery: [],
      rawMaterials: [],
      workshopSquareMeters: 0,
      monthlyRent: 0,
      staffing: [],
      preOperationalCosts: 0,
      workingCapitalBuffer: 0,
      ownerEquityAmount: 0,
      loanAmount: 0,
      loanInterestRateAnnual: 0,
      loanTenureMonths: 0,
      monthlyOverheads: {
        rent: 0,
        electricity: 0,
        water: 0,
        transport: 0,
        marketing: 0,
        stationeryMisc: 0,
      },
    ...initialSpecs,
  }));

  const [isGenerating, startGeneratingTransition] = useTransition();
  const [isReviewing, startReviewTransition] = useTransition();
  const [generationStep, setGenerationStep] = useState<string>("");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [documentReviewError, setDocumentReviewError] = useState<string | null>(null);
  const [documentReview, setDocumentReview] = useState<WholeDocumentReview | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RequiredField, string>>>({});
  const [generationSuccess, setGenerationSuccess] = useState<{
    businessName: string;
    sectionsCount: number;
    preservedSectionsCount: number;
    researchSources: Array<{ title: string; url: string }>;
    factReviewWarning: boolean;
  } | null>(null);

  // Kept out of the report flow until the financial model is reconciled to the supplied template.
  const financials = useMemo(() => computeBusinessPlanFinancials(specs), [specs]);

  const loadPreset = (presetKey: "milling" | "consultancy" | "beverages") => {
    const preset = BUSINESS_PLAN_PRESETS[presetKey];
    if (!preset) return;

    setSpecs((prev) => ({
      ...prev,
      businessName: preset.businessName || prev.businessName,
      tagline: preset.tagline || prev.tagline,
      industrySector: preset.industrySector || prev.industrySector,
      formOfOwnership: (preset.formOfOwnership as "Sole Proprietorship") || prev.formOfOwnership,
      registrationType: preset.registrationType || prev.registrationType,
      ownerQualifications: preset.ownerQualifications || prev.ownerQualifications,
      locationRationale: preset.locationRationale || prev.locationRationale,
      primaryProduct: preset.primaryProduct || prev.primaryProduct,
      productDescription: preset.productDescription || prev.productDescription,
      productPackaging: preset.productPackaging || prev.productPackaging,
      unitSellingPrice: preset.unitSellingPrice || prev.unitSellingPrice,
      unitCostOfProduction: preset.unitCostOfProduction || prev.unitCostOfProduction,
      monthlyProductionUnitsYear1:
        preset.monthlyProductionUnitsYear1 || prev.monthlyProductionUnitsYear1,
      annualGrowthRateYear2: preset.annualGrowthRateYear2 ?? prev.annualGrowthRateYear2,
      annualGrowthRateYear3: preset.annualGrowthRateYear3 ?? prev.annualGrowthRateYear3,
      targetCustomersDescription:
        preset.targetCustomersDescription || prev.targetCustomersDescription,
      totalMarketPopulation: preset.totalMarketPopulation || prev.totalMarketPopulation,
      projectedMarketSharePercentage:
        preset.projectedMarketSharePercentage ?? prev.projectedMarketSharePercentage,
      competitors: preset.competitors || prev.competitors,
      marketingPromotionBudgetMonthly:
        preset.marketingPromotionBudgetMonthly || prev.marketingPromotionBudgetMonthly,
      machinery: preset.machinery || prev.machinery,
      rawMaterials: preset.rawMaterials || prev.rawMaterials,
      workshopSquareMeters: preset.workshopSquareMeters || prev.workshopSquareMeters,
      monthlyRent: preset.monthlyRent || prev.monthlyRent,
      staffing: preset.staffing || prev.staffing,
      preOperationalCosts: preset.preOperationalCosts || prev.preOperationalCosts,
      workingCapitalBuffer: preset.workingCapitalBuffer || prev.workingCapitalBuffer,
      ownerEquityAmount: preset.ownerEquityAmount || prev.ownerEquityAmount,
      loanAmount: preset.loanAmount || prev.loanAmount,
      loanInterestRateAnnual: preset.loanInterestRateAnnual ?? prev.loanInterestRateAnnual,
      loanTenureMonths: preset.loanTenureMonths || prev.loanTenureMonths,
      monthlyOverheads: preset.monthlyOverheads || prev.monthlyOverheads,
    }));
  };

  const addEquipment = () => setSpecs((prev) => ({
    ...prev,
    machinery: [...prev.machinery, { item: "", quantity: 1, unitCost: 0, supplier: "" }],
  }));
  const addStaff = () => setSpecs((prev) => ({
    ...prev,
    staffing: [...prev.staffing, { position: "", count: 1, monthlySalary: 0, duties: "", qualifications: "" }],
  }));
  const addRawMaterial = () => setSpecs((prev) => ({
    ...prev,
    rawMaterials: [...prev.rawMaterials, { material: "", monthlyQuantity: "", monthlyCost: 0, supplier: "" }],
  }));
  const addCompetitor = () => setSpecs((prev) => ({
    ...prev,
    competitors: [...prev.competitors, { name: "", location: "", priceLevel: "", strengths: "", weaknesses: "" }],
  }));

  const handleSaveDetails = (replaceExisting = false) => {
    if (
      replaceExisting &&
      !window.confirm("Rebuild every business-plan section? This replaces saved section text, including manual edits, with the refreshed script draft.")
    ) return;
    setGenerationError(null);
    setGenerationSuccess(null);
    setDocumentReview(null);
    setDocumentReviewError(null);
    const missing = REQUIRED_FIELDS.filter(({ key }) => !String(specs[key] ?? "").trim());
    if (missing.length > 0) {
      const errors = Object.fromEntries(
        missing.map(({ key, label }) => [key, `Enter ${label.toLowerCase()}.`])
      ) as Partial<Record<RequiredField, string>>;
      setFieldErrors(errors);
      setActiveTab(missing[0].tab);
      setGenerationError("Complete the highlighted required fields.");
      setGenerationStep("");
      window.requestAnimationFrame(() => document.getElementById(missing[0].key)?.focus());
      return;
    }
    setFieldErrors({});
    setGenerationStep("Building the draft and checking facts...");

    startGeneratingTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("specs", JSON.stringify(specs));
        formData.append("aiProvider", aiProvider);
        if (replaceExisting) formData.append("replaceExisting", "true");

        const res = await saveBusinessPlanDetailsAction(formData);

        if ("error" in res) {
          setGenerationError(res.error);
          const missingField = REQUIRED_FIELDS.find(({ label }) =>
            res.error.toLowerCase().startsWith(label.toLowerCase())
          );
          if (missingField) {
            setFieldErrors({ [missingField.key]: `Enter ${missingField.label.toLowerCase()}.` });
            setActiveTab(missingField.tab);
            window.requestAnimationFrame(() => document.getElementById(missingField.key)?.focus());
          }
          setGenerationStep("");
          return;
        }

        let generatedSections = 0;
        let preservedSections = res.preservedSectionsCount;
        let factReviewWarning = false;
        for (const [index, chapterKey] of res.chapterKeys.entries()) {
          setGenerationStep(`Building and fact-checking ${index + 1}/${res.chapterKeys.length}: ${chapterKey}...`);
          const chapterForm = new FormData();
          chapterForm.append("workspaceId", workspaceId);
          chapterForm.append("chapterKey", chapterKey);
          chapterForm.append("aiProvider", aiProvider);
          if (replaceExisting) chapterForm.append("replaceExisting", "true");
          const chapterResult = await buildBusinessPlanChapterAction(chapterForm);
          generatedSections += chapterResult.generatedSections;
          preservedSections += chapterResult.preservedSections;
          factReviewWarning ||= Boolean(chapterResult.factReviewWarning);
        }

        setGenerationSuccess({
          businessName: res.businessName,
          sectionsCount: generatedSections,
          preservedSectionsCount: preservedSections,
          researchSources: res.researchSources,
          factReviewWarning,
        });
        setGenerationStep("");
        if (onPlanGenerated) {
          onPlanGenerated();
        }
        router.refresh();
      } catch (err) {
        setGenerationError(
          `${err instanceof Error ? err.message : "Could not finish the business plan draft."} Completed sections stay saved; click Build Full Draft again to resume.`
        );
        setGenerationStep("");
      }
    });
  };

  const handleReviewWholeDocument = () => {
    setDocumentReview(null);
    setDocumentReviewError(null);
    startReviewTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("aiProvider", aiProvider);
        const result = await reviewBusinessPlanDocumentAction(formData);
        setDocumentReview(result);
      } catch (error) {
        setDocumentReviewError(
          error instanceof Error ? error.message : "Could not review the full business plan."
        );
      }
    });
  };

  const formatKES = (n: number) => Math.round(n).toLocaleString("en-KE");

  return (
    <>
      {/* Trigger Button or Default Trigger */}
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)}>{triggerButton}</div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Business Plan Details</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-4xl w-full my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Two-Tone Accent Stripe */}
            <div className="h-1 flex w-full">
              <div className="w-[60%] bg-blue-700" />
              <div className="w-[40%] bg-amber-500" />
            </div>

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 leading-tight">
                    Build Business Plan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Research sources and build an editable draft.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span>AI provider</span>
                  <select
                    value={aiProvider}
                    onChange={(event) => setAIProvider(event.target.value as "gemini" | "groq")}
                    disabled={isGenerating}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                  >
                    <option value="gemini">Gemini</option>
                    <option value="groq">Groq</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close business plan builder"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigation Ribbon */}
            <div className="flex items-center gap-1 px-6 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("presets")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "presets"
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>1-Click Presets</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("identity")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "identity"
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Enterprise & Location</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("products")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "products"
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Product & Pricing</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("operations")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "operations"
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <Wrench className="h-3.5 w-3.5" />
                <span>Machinery & Staff</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("financials")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "financials"
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <DollarSign className="h-3.5 w-3.5" />
                <span>Financing & Overheads</span>
              </button>
            </div>

            {/* Modal Body / Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: 1-CLICK PRESETS */}
              {activeTab === "presets" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-700">
                      Curated TVET Commercial Enterprises
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 mt-1">
                      Select an approved curriculum preset or customize your own venture
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Each preset populates complete machinery quotations, staff salary schedules, raw material costs, and financial forecasts compliant with KNEC marking criteria.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Preset 1: Milling */}
                    <div
                      onClick={() => loadPreset("milling")}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        (specs.businessName || "").includes("Porridge")
                          ? "border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <span className="text-xl">🌾</span>
                        <h5 className="text-xs font-semibold text-slate-900 leading-tight">
                          Biofortified Porridge Milling
                        </h5>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Composite sweet potato, sorghum, amaranth flour manufacturing in Kitui Central.
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                        <span>Capital: KES 785k</span>
                        <span className="text-indigo-600 font-semibold">Load Preset →</span>
                      </div>
                    </div>

                    {/* Preset 2: Clinical Consultancy */}
                    <div
                      onClick={() => loadPreset("consultancy")}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        (specs.businessName || "").includes("Consultancy")
                          ? "border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <span className="text-xl">🩺</span>
                        <h5 className="text-xs font-semibold text-slate-900 leading-tight">
                          Clinical Nutrition Practice
                        </h5>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Outpatient dietary therapy and metabolic counseling clinic in Lodwar Town.
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                        <span>Capital: KES 320k</span>
                        <span className="text-indigo-600 font-semibold">Load Preset →</span>
                      </div>
                    </div>

                    {/* Preset 3: Fruit Juices */}
                    <div
                      onClick={() => loadPreset("beverages")}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        (specs.businessName || "").includes("Fruit")
                          ? "border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="space-y-2">
                        <span className="text-xl">🥤</span>
                        <h5 className="text-xs font-semibold text-slate-900 leading-tight">
                          Fruit Juices & Purees
                        </h5>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Pasteurized mango, passion, and guava nectar processing plant in Machakos Town.
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600">
                        <span>Capital: KES 890k</span>
                        <span className="text-indigo-600 font-semibold">Load Preset →</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary of Active Specifications */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">
                        Active Selected Enterprise: {specs.businessName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab("identity")}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Customize details</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Location</span>
                        <span className="font-semibold text-slate-800">
                          {specs.townOrMarket}, {specs.county}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Ownership</span>
                        <span className="font-semibold text-slate-800">{specs.formOfOwnership}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Primary Offering</span>
                        <span className="font-semibold text-slate-800 truncate block">
                          {specs.primaryProduct}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Unit RRP</span>
                        <span className="font-semibold text-indigo-600">
                          KES {formatKES(specs.unitSellingPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ENTERPRISE & LOCATION */}
              {activeTab === "identity" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        value={specs.businessName}
                        onChange={(e) => {
                          setSpecs({ ...specs, businessName: e.target.value });
                          setFieldErrors((previous) => ({ ...previous, businessName: undefined }));
                        }}
                        aria-invalid={!!fieldErrors.businessName}
                        aria-describedby={fieldErrors.businessName ? "businessName-error" : undefined}
                        className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${fieldErrors.businessName ? "border-rose-500" : "border-slate-300"}`}
                        placeholder="e.g. NutriGrain Mills"
                      />
                      {fieldErrors.businessName && <p id="businessName-error" className="mt-1 text-xs text-rose-700">{fieldErrors.businessName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Tagline / Brand Slogan
                      </label>
                      <input
                        type="text"
                        value={specs.tagline}
                        onChange={(e) => setSpecs({ ...specs, tagline: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Wholesome Nutrition for Families"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {([
                      ["candidateName", "Candidate name", specs.candidateName],
                      ["admissionNumber", "Admission number", specs.admissionNumber],
                      ["course", "Course", specs.course],
                    ] as const).map(([field, label, value]) => (
                      <div key={field}>
                        <label htmlFor={field} className="text-xs font-medium text-slate-700 block mb-1">{label} *</label>
                        <input
                          type="text"
                          id={field}
                          value={value}
                          onChange={(e) => {
                            setSpecs({ ...specs, [field]: e.target.value });
                            setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
                          }}
                          aria-invalid={!!fieldErrors[field]}
                          aria-describedby={fieldErrors[field] ? `${field}-error` : undefined}
                          className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${fieldErrors[field] ? "border-rose-500" : "border-slate-300"}`}
                        />
                        {fieldErrors[field] && <p id={`${field}-error`} className="mt-1 text-xs text-rose-700">{fieldErrors[field]}</p>}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="institutionName" className="text-xs font-medium text-slate-700 block mb-1">
                      Training Institution *
                    </label>
                    <input
                      type="text"
                      id="institutionName"
                      value={specs.institutionName}
                      onChange={(e) => {
                        setSpecs({ ...specs, institutionName: e.target.value });
                        setFieldErrors((previous) => ({ ...previous, institutionName: undefined }));
                      }}
                      required
                      aria-invalid={!!fieldErrors.institutionName}
                      aria-describedby={fieldErrors.institutionName ? "institutionName-error" : undefined}
                      className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${fieldErrors.institutionName ? "border-rose-500" : "border-slate-300"}`}
                      placeholder="Enter your institution name"
                    />
                    {fieldErrors.institutionName && <p id="institutionName-error" className="mt-1 text-xs text-rose-700">{fieldErrors.institutionName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Form of Ownership
                      </label>
                      <select
                        value={specs.formOfOwnership}
                        onChange={(e) =>
                          setSpecs({
                            ...specs,
                            formOfOwnership: e.target.value as "Sole Proprietorship",
                          })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Private Limited Company">Private Limited Company</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Industry Sector
                      </label>
                      <input
                        type="text"
                        id="industrySector"
                        value={specs.industrySector}
                        onChange={(e) => {
                          setSpecs({ ...specs, industrySector: e.target.value });
                          setFieldErrors((previous) => ({ ...previous, industrySector: undefined }));
                        }}
                        aria-invalid={!!fieldErrors.industrySector}
                        aria-describedby={fieldErrors.industrySector ? "industrySector-error" : undefined}
                        className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${fieldErrors.industrySector ? "border-rose-500" : "border-slate-300"}`}
                        placeholder="e.g. Agro-processing & Food Manufacturing"
                      />
                      {fieldErrors.industrySector && <p id="industrySector-error" className="mt-1 text-xs text-rose-700">{fieldErrors.industrySector}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="county" className="text-xs font-medium text-slate-700 block mb-1">
                        County *
                      </label>
                      <input
                        type="text"
                        id="county"
                        value={specs.county}
                        onChange={(e) => {
                          setSpecs({ ...specs, county: e.target.value });
                          setFieldErrors((previous) => ({ ...previous, county: undefined }));
                        }}
                        aria-invalid={!!fieldErrors.county}
                        aria-describedby={fieldErrors.county ? "county-error" : undefined}
                        className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${fieldErrors.county ? "border-rose-500" : "border-slate-300"}`}
                        placeholder="e.g. Kitui"
                      />
                      {fieldErrors.county && <p id="county-error" className="mt-1 text-xs text-rose-700">{fieldErrors.county}</p>}
                    </div>
                    <div>
                      <label htmlFor="townOrMarket" className="text-xs font-medium text-slate-700 block mb-1">
                        Town / Market Center *
                      </label>
                      <input
                        type="text"
                        id="townOrMarket"
                        value={specs.townOrMarket}
                        onChange={(e) => {
                          setSpecs({ ...specs, townOrMarket: e.target.value });
                          setFieldErrors((previous) => ({ ...previous, townOrMarket: undefined }));
                        }}
                        aria-invalid={!!fieldErrors.townOrMarket}
                        aria-describedby={fieldErrors.townOrMarket ? "townOrMarket-error" : undefined}
                        className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${fieldErrors.townOrMarket ? "border-rose-500" : "border-slate-300"}`}
                        placeholder="e.g. Kitui Town"
                      />
                      {fieldErrors.townOrMarket && <p id="townOrMarket-error" className="mt-1 text-xs text-rose-700">{fieldErrors.townOrMarket}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Premises / Street Address
                      </label>
                      <input
                        type="text"
                        value={specs.streetOrBuilding}
                        onChange={(e) => setSpecs({ ...specs, streetOrBuilding: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Kaveta Road, Commercial Plot 12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Postal Address
                      </label>
                      <input
                        type="text"
                        value={specs.postalAddress}
                        onChange={(e) => setSpecs({ ...specs, postalAddress: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. P.O. Box 240-90200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={specs.phone}
                        onChange={(e) => setSpecs({ ...specs, phone: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. +254 712 345 678"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={specs.email}
                        onChange={(e) => setSpecs({ ...specs, email: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. info@business.co.ke"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Promoter / Owner Academic Qualifications
                    </label>
                    <textarea
                      rows={2}
                      value={specs.ownerQualifications}
                      onChange={(e) => setSpecs({ ...specs, ownerQualifications: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="e.g. Diploma in Human Nutrition and Dietetics with expertise in food processing and KEBS compliance."
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCTS & PRICING */}
              {activeTab === "products" && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="primaryProduct" className="text-xs font-medium text-slate-700 block mb-1">
                      Primary Product / Service Name *
                    </label>
                    <input
                      type="text"
                      id="primaryProduct"
                      value={specs.primaryProduct}
                      onChange={(e) => {
                        setSpecs({ ...specs, primaryProduct: e.target.value });
                        setFieldErrors((previous) => ({ ...previous, primaryProduct: undefined }));
                      }}
                      aria-invalid={!!fieldErrors.primaryProduct}
                      aria-describedby={fieldErrors.primaryProduct ? "primaryProduct-error" : undefined}
                      className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 ${fieldErrors.primaryProduct ? "border-rose-500" : "border-slate-300"}`}
                      placeholder="e.g. Fortified Composite Porridge Flour"
                    />
                    {fieldErrors.primaryProduct && <p id="primaryProduct-error" className="mt-1 text-xs text-rose-700">{fieldErrors.primaryProduct}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Detailed Product Specifications & Formulation
                    </label>
                    <textarea
                      rows={2}
                      value={specs.productDescription}
                      onChange={(e) => setSpecs({ ...specs, productDescription: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Describe ingredients, nutritional value, and processing method."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Packaging Format
                      </label>
                      <input
                        type="text"
                        value={specs.productPackaging}
                        onChange={(e) => setSpecs({ ...specs, productPackaging: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. 1kg moisture-barrier laminated pouches"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Target Market Population
                      </label>
                      <input
                        type="text"
                        value={specs.totalMarketPopulation}
                        onChange={(e) => setSpecs({ ...specs, totalMarketPopulation: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. 60,000 residents in town center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Target customers</label>
                      <textarea rows={2} value={specs.targetCustomersDescription} onChange={(e) => setSpecs({ ...specs, targetCustomersDescription: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="Describe the customer groups you have identified." />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Year 1 market share estimate (%)</label>
                      <input type="number" min="0" max="100" value={specs.projectedMarketSharePercentage} onChange={(e) => setSpecs({ ...specs, projectedMarketSharePercentage: Number(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Unit Selling Price (KES) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={specs.unitSellingPrice}
                        onChange={(e) =>
                          setSpecs({ ...specs, unitSellingPrice: Number(e.target.value) || 0 })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Unit Cost of Production (KES) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={specs.unitCostOfProduction}
                        onChange={(e) =>
                          setSpecs({ ...specs, unitCostOfProduction: Number(e.target.value) || 0 })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Monthly Production (Units) *
                      </label>
                      <input
                        type="number"
                        min="10"
                        value={specs.monthlyProductionUnitsYear1}
                        onChange={(e) =>
                          setSpecs({
                            ...specs,
                            monthlyProductionUnitsYear1: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Pricing Margin Metric Box */}
                  <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-600">Gross Margin per Unit: </span>
                      <span className="font-semibold text-slate-900 font-mono">
                        KES {formatKES(specs.unitSellingPrice - specs.unitCostOfProduction)} (
                        {specs.unitSellingPrice > 0
                          ? Math.round(
                              ((specs.unitSellingPrice - specs.unitCostOfProduction) /
                                specs.unitSellingPrice) *
                                100
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Sales at stated monthly output: </span>
                      <span className="font-semibold text-indigo-700 font-mono">
                        KES {formatKES(specs.unitSellingPrice * specs.monthlyProductionUnitsYear1 * 12)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">Competitor observations</label>
                      <button type="button" onClick={addCompetitor} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700">
                        <Plus className="h-3 w-3" /> Add competitor
                      </button>
                    </div>
                    {specs.competitors.map((competitor, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-3">
                        <input aria-label="Competitor name" placeholder="Competitor name" value={competitor.name} onChange={(e) => setSpecs((prev) => ({ ...prev, competitors: prev.competitors.map((row, i) => i === idx ? { ...row, name: e.target.value } : row) }))} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs" />
                        <input aria-label="Competitor location" placeholder="Location" value={competitor.location} onChange={(e) => setSpecs((prev) => ({ ...prev, competitors: prev.competitors.map((row, i) => i === idx ? { ...row, location: e.target.value } : row) }))} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs" />
                        <input aria-label="Competitor observed price" placeholder="Observed price" value={competitor.priceLevel} onChange={(e) => setSpecs((prev) => ({ ...prev, competitors: prev.competitors.map((row, i) => i === idx ? { ...row, priceLevel: e.target.value } : row) }))} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs" />
                        <input aria-label="Competitor strengths" placeholder="Observed strengths" value={competitor.strengths} onChange={(e) => setSpecs((prev) => ({ ...prev, competitors: prev.competitors.map((row, i) => i === idx ? { ...row, strengths: e.target.value } : row) }))} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs" />
                        <input aria-label="Competitor weaknesses" placeholder="Observed weaknesses" value={competitor.weaknesses} onChange={(e) => setSpecs((prev) => ({ ...prev, competitors: prev.competitors.map((row, i) => i === idx ? { ...row, weaknesses: e.target.value } : row) }))} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs sm:col-span-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MACHINERY & STAFF */}
              {activeTab === "operations" && (
                <div className="space-y-5">
                  {/* Equipment Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">
                        Operational Machinery & Tools (KNEC Chapter 4.3)
                      </label>
                      <button type="button" onClick={addEquipment} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700">
                        <Plus className="h-3 w-3" /> Add item
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                      <table className="w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">Item Description</th>
                            <th className="px-3 py-2 text-center font-medium w-16">Qty</th>
                            <th className="px-3 py-2 text-right font-medium w-28">Unit Cost (KES)</th>
                            <th className="px-3 py-2 text-left font-medium">Supplier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {specs.machinery.map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="px-2 py-1.5"><input aria-label="Equipment item" value={m.item} onChange={(e) => setSpecs((prev) => ({ ...prev, machinery: prev.machinery.map((row, i) => i === idx ? { ...row, item: e.target.value } : row) }))} className="w-full min-w-32 rounded border border-slate-200 px-2 py-1" /></td>
                              <td className="px-2 py-1.5"><input aria-label="Equipment quantity" type="number" min="1" value={m.quantity} onChange={(e) => setSpecs((prev) => ({ ...prev, machinery: prev.machinery.map((row, i) => i === idx ? { ...row, quantity: Number(e.target.value) || 0 } : row) }))} className="w-16 rounded border border-slate-200 px-2 py-1 text-center font-mono" /></td>
                              <td className="px-2 py-1.5"><input aria-label="Equipment unit cost in KES" type="number" min="0" value={m.unitCost} onChange={(e) => setSpecs((prev) => ({ ...prev, machinery: prev.machinery.map((row, i) => i === idx ? { ...row, unitCost: Number(e.target.value) || 0 } : row) }))} className="w-24 rounded border border-slate-200 px-2 py-1 text-right font-mono" /></td>
                              <td className="px-2 py-1.5"><input aria-label="Supplier and quote reference" value={m.supplier} onChange={(e) => setSpecs((prev) => ({ ...prev, machinery: prev.machinery.map((row, i) => i === idx ? { ...row, supplier: e.target.value } : row) }))} className="w-full min-w-32 rounded border border-slate-200 px-2 py-1" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">Materials and suppliers</label>
                      <button type="button" onClick={addRawMaterial} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700">
                        <Plus className="h-3 w-3" /> Add material
                      </button>
                    </div>
                    {specs.rawMaterials.map((material, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-3">
                        <input aria-label="Material" placeholder="Material or packaging" value={material.material} onChange={(e) => setSpecs((prev) => ({ ...prev, rawMaterials: prev.rawMaterials.map((row, i) => i === idx ? { ...row, material: e.target.value } : row) }))} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs" />
                        <input aria-label="Quantity per month" placeholder="Quantity per month" value={material.monthlyQuantity} onChange={(e) => setSpecs((prev) => ({ ...prev, rawMaterials: prev.rawMaterials.map((row, i) => i === idx ? { ...row, monthlyQuantity: e.target.value } : row) }))} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs" />
                        <input aria-label="Monthly material cost in KES" type="number" min="0" placeholder="Monthly cost (KES)" value={material.monthlyCost} onChange={(e) => setSpecs((prev) => ({ ...prev, rawMaterials: prev.rawMaterials.map((row, i) => i === idx ? { ...row, monthlyCost: Number(e.target.value) || 0 } : row) }))} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-mono" />
                        <input aria-label="Material supplier" placeholder="Supplier and quote reference" value={material.supplier} onChange={(e) => setSpecs((prev) => ({ ...prev, rawMaterials: prev.rawMaterials.map((row, i) => i === idx ? { ...row, supplier: e.target.value } : row) }))} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs" />
                      </div>
                    ))}
                  </div>

                  {/* Staffing Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800">
                        Personnel & Payroll (KNEC Chapter 3.3 - 3.4)
                      </label>
                      <button type="button" onClick={addStaff} className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700">
                        <Plus className="h-3 w-3" /> Add role
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                      <table className="w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">Position</th>
                            <th className="px-3 py-2 text-center font-medium w-16">Count</th>
                            <th className="px-3 py-2 text-right font-medium w-28">Monthly Pay (KES)</th>
                            <th className="px-3 py-2 text-left font-medium">Key Qualifications</th>
                            <th className="px-3 py-2 text-left font-medium">Duties</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {specs.staffing.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="px-2 py-1.5"><input aria-label="Staff position" value={s.position} onChange={(e) => setSpecs((prev) => ({ ...prev, staffing: prev.staffing.map((row, i) => i === idx ? { ...row, position: e.target.value } : row) }))} className="w-full min-w-28 rounded border border-slate-200 px-2 py-1" /></td>
                              <td className="px-2 py-1.5"><input aria-label="Staff count" type="number" min="1" value={s.count} onChange={(e) => setSpecs((prev) => ({ ...prev, staffing: prev.staffing.map((row, i) => i === idx ? { ...row, count: Number(e.target.value) || 0 } : row) }))} className="w-14 rounded border border-slate-200 px-2 py-1 text-center font-mono" /></td>
                              <td className="px-2 py-1.5"><input aria-label="Monthly salary in KES" type="number" min="0" value={s.monthlySalary} onChange={(e) => setSpecs((prev) => ({ ...prev, staffing: prev.staffing.map((row, i) => i === idx ? { ...row, monthlySalary: Number(e.target.value) || 0 } : row) }))} className="w-24 rounded border border-slate-200 px-2 py-1 text-right font-mono" /></td>
                              <td className="px-2 py-1.5"><input aria-label="Staff qualifications" value={s.qualifications} onChange={(e) => setSpecs((prev) => ({ ...prev, staffing: prev.staffing.map((row, i) => i === idx ? { ...row, qualifications: e.target.value } : row) }))} className="w-full min-w-32 rounded border border-slate-200 px-2 py-1" /></td>
                              <td className="px-2 py-1.5"><input aria-label="Staff duties" value={s.duties} onChange={(e) => setSpecs((prev) => ({ ...prev, staffing: prev.staffing.map((row, i) => i === idx ? { ...row, duties: e.target.value } : row) }))} className="w-full min-w-32 rounded border border-slate-200 px-2 py-1" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: FINANCING & OVERHEADS */}
              {activeTab === "financials" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Monthly Premises Rent (KES)
                      </label>
                      <input
                        type="number"
                        value={specs.monthlyRent}
                        onChange={(e) =>
                          setSpecs({
                            ...specs,
                            monthlyRent: Number(e.target.value) || 0,
                            monthlyOverheads: {
                              ...specs.monthlyOverheads,
                              rent: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Pre-Operational Costs (Licenses, Setup KES)
                      </label>
                      <input
                        type="number"
                        value={specs.preOperationalCosts}
                        onChange={(e) =>
                          setSpecs({ ...specs, preOperationalCosts: Number(e.target.value) || 0 })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Owner Equity (KES)</label>
                      <input type="number" min="0" value={specs.ownerEquityAmount} onChange={(e) => setSpecs({ ...specs, ownerEquityAmount: Number(e.target.value) || 0 })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Requested Loan (KES)</label>
                      <input type="number" min="0" value={specs.loanAmount} onChange={(e) => setSpecs({ ...specs, loanAmount: Number(e.target.value) || 0 })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Working Capital (KES)</label>
                      <input type="number" min="0" value={specs.workingCapitalBuffer} onChange={(e) => setSpecs({ ...specs, workingCapitalBuffer: Number(e.target.value) || 0 })} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Monthly Electricity (KES)
                      </label>
                      <input
                        type="number"
                        value={specs.monthlyOverheads.electricity}
                        onChange={(e) =>
                          setSpecs({
                            ...specs,
                            monthlyOverheads: {
                              ...specs.monthlyOverheads,
                              electricity: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Monthly Water (KES)
                      </label>
                      <input
                        type="number"
                        value={specs.monthlyOverheads.water}
                        onChange={(e) =>
                          setSpecs({
                            ...specs,
                            monthlyOverheads: {
                              ...specs.monthlyOverheads,
                              water: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Monthly Transport / Fuel (KES)
                      </label>
                      <input
                        type="number"
                        value={specs.monthlyOverheads.transport}
                        onChange={(e) =>
                          setSpecs({
                            ...specs,
                            monthlyOverheads: {
                              ...specs.monthlyOverheads,
                              transport: Number(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Year 2 sales growth assumption (%)</label>
                      <input type="number" min="-100" step="0.1" value={specs.annualGrowthRateYear2 * 100} onChange={(e) => setSpecs({ ...specs, annualGrowthRateYear2: (Number(e.target.value) || 0) / 100 })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Year 3 sales growth assumption (%)</label>
                      <input type="number" min="-100" step="0.1" value={specs.annualGrowthRateYear3 * 100} onChange={(e) => setSpecs({ ...specs, annualGrowthRateYear3: (Number(e.target.value) || 0) / 100 })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Commercial Loan Annual Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={specs.loanInterestRateAnnual}
                        onChange={(e) =>
                          setSpecs({
                            ...specs,
                            loanInterestRateAnnual: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Loan Tenure (Months)
                      </label>
                      <input
                        type="number"
                        value={specs.loanTenureMonths}
                        onChange={(e) =>
                          setSpecs({ ...specs, loanTenureMonths: Number(e.target.value) || 0 })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE RECONCILED FINANCIAL PREVIEW CARD */}
              {false && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>KNEC Chapter 5 Mathematically Balanced Preview</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      Assets ≡ Liabilities + Equity
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
                      <span className="text-[10px] text-slate-500 block">Start-up Capital</span>
                      <span className="font-semibold text-slate-900 font-mono text-sm">
                        KES {formatKES(financials.totalStartupCapital)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
                      <span className="text-[10px] text-slate-500 block">Year 1 Sales Turnover</span>
                      <span className="font-semibold text-indigo-700 font-mono text-sm">
                        KES {formatKES(financials.annualSalesYear1)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
                      <span className="text-[10px] text-slate-500 block">Gross Margin</span>
                      <span className="font-semibold text-emerald-700 font-mono text-sm">
                        {financials.grossProfitMarginPercent}%
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
                      <span className="text-[10px] text-slate-500 block">Net Profit Year 1</span>
                      <span className="font-semibold text-slate-900 font-mono text-sm">
                        KES {formatKES(financials.netProfitYear1)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80">
                      <span className="text-[10px] text-slate-500 block">Break-Even Units</span>
                      <span className="font-semibold text-amber-700 font-mono text-sm">
                        {formatKES(financials.breakEvenUnitsMonthly)}/mo
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {generationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {generationError}
                </div>
              )}

              {/* Success Notification */}
              {generationSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>Business plan draft built</span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed">
                    Added {generationSuccess.sectionsCount} sections. Preserved {generationSuccess.preservedSectionsCount} existing sections.
                  </p>
                  {generationSuccess.factReviewWarning && (
                    <p className="text-[11px] text-amber-800">AI fact review was unavailable. Verify factual claims before submission.</p>
                  )}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-emerald-900">
                      Web sources ({generationSuccess.researchSources.length})
                    </p>
                    {generationSuccess.researchSources.length === 0 ? (
                      <p className="text-[11px] text-amber-800">No verified web sources. Confirm market details locally.</p>
                    ) : <ul className="space-y-1">
                      {generationSuccess.researchSources.slice(0, 5).map((source) => (
                        <li key={source.url}>
                          <a href={source.url} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-700 underline underline-offset-2">
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>}
                  </div>
                  <button
                    type="button"
                    onClick={handleReviewWholeDocument}
                    disabled={isReviewing || isGenerating}
                    className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isReviewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                    {isReviewing ? "Reviewing whole document..." : "Review Whole Document"}
                  </button>
                  {documentReviewError && (
                    <p className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
                      {documentReviewError}
                    </p>
                  )}
                  {documentReview && (
                    <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-slate-900">Whole-document review</p>
                        <span className="text-[11px] text-slate-600">
                          {documentReview.chaptersReviewed} groups · {documentReview.findings.length} findings
                        </span>
                      </div>
                      {documentReview.warnings.map((warning) => (
                        <p key={warning} className="text-[11px] text-amber-800">{warning}</p>
                      ))}
                      {documentReview.findings.length === 0 ? (
                        <p className="text-xs text-slate-600">
                          {documentReview.chaptersReviewed === 0
                            ? "The whole-document review did not complete. See the provider error above."
                            : "No substantive issues found. Review cited facts and local evidence before submission."}
                        </p>
                      ) : documentReview.findings.map((finding, index) => (
                        <article key={`${finding.sectionKey}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">{finding.sectionKey.replaceAll(".", " ")}</span>
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                              finding.severity === "high"
                                ? "bg-rose-100 text-rose-800"
                                : finding.severity === "medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {finding.severity} · {finding.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800">{finding.issue}</p>
                          <p className="mt-1 text-xs text-slate-600">Action: {finding.recommendation}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              router.push(`/studio/${workspaceId}/write/${finding.sectionKey}`);
                            }}
                            className="mt-2 text-[11px] font-semibold text-indigo-700 underline underline-offset-2"
                          >
                            Open section review
                          </button>
                          {finding.sourceRefs.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-2">
                              {finding.sourceRefs.map((sourceRef) => {
                                const source = documentReview.researchSources[sourceRef - 1];
                                return source ? (
                                  <a key={sourceRef} href={source.url} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-700 underline underline-offset-2">
                                    [{sourceRef}] {source.title}
                                  </a>
                                ) : null;
                              })}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/studio/${workspaceId}/write/ch1.name`);
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Review Draft
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Review assumptions and verify local evidence.</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isGenerating}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDetails(true)}
                  disabled={isGenerating}
                  title="Replaces saved section text, including manual edits"
                  className="px-3.5 py-2 rounded-lg border border-amber-300 text-xs font-semibold text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Rebuild Existing Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDetails()}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{generationStep || "Generating 25–30 Pages..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Build Full Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
