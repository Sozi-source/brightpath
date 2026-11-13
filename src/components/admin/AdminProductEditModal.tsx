"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Download,
  AlertCircle,
  Loader2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import type { Project, ContentStatus } from "@/types/database";
import { MARKETPLACE_MATERIAL_TYPES, type MarketplaceMaterialType } from "@/lib/marketplace";
import { adminUpdateMarketplaceProduct, adminDeleteMarketplaceProduct } from "@/app/admin/actions";

interface AdminProductEditModalProps {
  project: Project;
  commissionPercent?: number;
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_CATEGORIES = [
  "Business Plan",
  "Agribusiness",
  "Food Science & Catering",
  "Electrical & Electronics",
  "Mechanical & Automotive",
  "Building & Construction",
  "Information Technology",
  "Hospitality & Tourism",
  "General",
];

const PRICE_PRESETS = [
  { label: "Craft Cert", price: 1500 },
  { label: "Diploma", price: 2500 },
  { label: "Higher Dip", price: 3500 },
  { label: "Free (KES 0)", price: 0 },
];

export function AdminProductEditModal({
  project,
  commissionPercent = 20,
  isOpen,
  onClose,
}: AdminProductEditModalProps) {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  const [category, setCategory] = useState(project.category || "Business Plan");
  const [materialType, setMaterialType] = useState<MarketplaceMaterialType>(
    project.material_type || "business_plan"
  );
  const [priceKes, setPriceKes] = useState<number>(Number(project.price_kes) || 0);
  const [status, setStatus] = useState<ContentStatus>(project.status || "published");

  // Cover image handling
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status feedback
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Cover image must be 5 MB or smaller.");
      return;
    }

    setCoverFile(file);
    setCoverPreviewUrl(URL.createObjectURL(file));
    setRemoveCover(false);
    setErrorMessage(null);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
      setCoverPreviewUrl(null);
    }
    setRemoveCover(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRestoreDefaultCover = () => {
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setRemoveCover(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("projectId", project.id);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category.trim());
    formData.append("materialType", materialType);
    formData.append("priceKes", priceKes.toString());
    formData.append("status", status);

    if (removeCover) {
      formData.append("removeCover", "true");
    } else if (coverFile) {
      formData.append("coverFile", coverFile);
    }

    startTransition(async () => {
      try {
        await adminUpdateMarketplaceProduct(formData);
        setSuccessMessage("Product setup updated successfully.");
        setTimeout(() => {
          onClose();
        }, 800);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to update product.");
      }
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    const formData = new FormData();
    formData.append("projectId", project.id);

    startTransition(async () => {
      try {
        await adminDeleteMarketplaceProduct(formData);
        onClose();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to delete product.");
      }
    });
  };

  const hasActiveCustomCover = (coverPreviewUrl || (project.cover_path && !removeCover));

  // Commercial calculations
  const platformFee = Math.round((priceKes * commissionPercent) / 100);
  const authorEarnings = Math.max(0, priceKes - platformFee);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Top Two-Tone Accent Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-amber-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 id="modal-title" className="text-base font-semibold tracking-tight text-slate-900">
                Marketplace Product Setup
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control cover presentation, pricing, metadata, and publication status.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Feedback Banners */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}
            {successMessage && (
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* SECTION 1: Cover Photo Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Cover Photo & Visual Presentation
                </label>
                {hasActiveCustomCover ? (
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="h-3 w-3" /> Remove custom cover (restore dossier)
                  </button>
                ) : project.cover_path && removeCover ? (
                  <button
                    type="button"
                    onClick={handleRestoreDefaultCover}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <RotateCcw className="h-3 w-3" /> Revert cover removal
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4 items-start rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                {/* Live Cover Preview Container */}
                <div className="relative aspect-[3/4] w-full max-w-[180px] rounded-lg border border-slate-200 overflow-hidden bg-slate-900 shadow-xs mx-auto">
                  {coverPreviewUrl ? (
                    <div className="relative h-full w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverPreviewUrl}
                        alt="Preview cover"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 right-2 rounded bg-indigo-600/90 backdrop-blur-xs py-1 text-center text-[10px] font-semibold text-white shadow-xs">
                        New Cover Selected
                      </span>
                    </div>
                  ) : project.cover_path && !removeCover ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={`/api/projects/${project.id}/cover?t=${project.created_at}`}
                        alt="Current cover"
                        fill
                        unoptimized
                        sizes="180px"
                        className="object-cover"
                      />
                      <span className="absolute bottom-2 left-2 right-2 rounded bg-slate-900/80 backdrop-blur-xs py-1 text-center text-[10px] font-semibold text-white shadow-xs">
                        Active Custom Cover
                      </span>
                    </div>
                  ) : (
                    /* Default Authentic KNEC Dossier Cover - Vibrant Teal Blue Theme */
                    <div className="relative h-full w-full bg-gradient-to-br from-[#0c8ea0] via-[#087f8c] to-[#045963] p-3 text-white flex flex-col justify-between select-none shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-200/30 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />
                      <div className="absolute inset-1.5 rounded border border-white/25 pointer-events-none" />
                      <div className="relative z-10 text-center pt-0.5">
                        <span className="inline-block text-[8px] font-bold tracking-[0.2em] uppercase !text-amber-300 drop-shadow-xs border-b border-amber-300/40 pb-0.5">
                          BUSINESS PLAN
                        </span>
                      </div>
                      <div className="relative z-10 my-auto text-center px-1">
                        <p className="text-[10px] font-bold !text-white line-clamp-3 leading-snug drop-shadow-sm">
                          {(title || "Business Plan").replace(/^business\s+plan\s+(for|on|of|:|-)?\s*/i, "").trim() || title || "Business Plan"}
                        </p>
                      </div>
                      <div className="relative z-10 border-t border-white/20 pt-1 flex items-center justify-between text-[7.5px] !text-teal-100 font-mono px-0.5 font-semibold">
                        <span>KNEC SERIES</span>
                        <span>VERIFIED</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Controls & Guidelines */}
                <div className="space-y-3">
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center hover:border-indigo-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="cover-upload"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex flex-col items-center justify-center cursor-pointer space-y-1.5"
                    >
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shadow-xs">
                        <Upload className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-semibold text-indigo-700 hover:underline">
                        {coverFile ? "Choose a different cover image" : "Upload Custom Cover Image"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        PNG, JPG, or WebP up to 5 MB
                      </span>
                    </label>
                  </div>

                  <div className="rounded-lg bg-white border border-slate-200 p-3 text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-indigo-600" />
                      Cover Presentation Guide:
                    </p>
                    <p>
                      • Recommended size: <strong>900 × 1200 px</strong> (3:4 portrait aspect ratio).
                    </p>
                    <p>
                      • If no custom image is uploaded, the system renders the official KNEC manuscript dossier presentation automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Pricing & Commercials */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Listing Price & Commercial Terms
              </label>

              {/* Price Preset Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 mr-1">Quick Presets:</span>
                {PRICE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPriceKes(preset.price)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      priceKes === preset.price
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {preset.label} (KES {preset.price.toLocaleString()})
                  </button>
                ))}
              </div>

              {/* Direct Price Input and Split Calculator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priceKes" className="block text-xs font-semibold text-slate-700 mb-1">
                    Listing Price (KES) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold font-mono text-slate-500">
                      KES
                    </span>
                    <input
                      id="priceKes"
                      type="number"
                      min="0"
                      max="1000000"
                      step="50"
                      required
                      value={priceKes}
                      onChange={(e) => setPriceKes(Number(e.target.value) || 0)}
                      className="block w-full pl-12 pr-3 py-2 text-sm font-mono font-semibold text-slate-900 border border-slate-300 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                  {project.file_path.startsWith("workspace-export:") && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Linked to approved workspace: updating price syncs the workspace listing price.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-800 flex items-center justify-between">
                    <span>Revenue Breakdown</span>
                    <span className="font-mono text-indigo-700">KES {priceKes.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Platform Commission ({commissionPercent}%):</span>
                    <span className="font-mono">KES {platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Author / Net Payout ({100 - commissionPercent}%):</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      KES {authorEarnings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Listing Metadata */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="product-title" className="block text-xs font-semibold text-slate-700">
                    Product Title <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">{title.length}/180</span>
                </div>
                <input
                  id="product-title"
                  type="text"
                  maxLength={180}
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-3 py-2 text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  placeholder="e.g. Business Plan for Maternal & Baby Care Center"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-category" className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Category <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="product-category"
                    type="text"
                    required
                    maxLength={100}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    list="category-suggestions"
                    className="block w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                    placeholder="e.g. Agribusiness or Business Plan"
                  />
                  <datalist id="category-suggestions">
                    {COMMON_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label htmlFor="material-type" className="block text-xs font-semibold text-slate-700 mb-1">
                    Resource Format <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="material-type"
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value as MarketplaceMaterialType)}
                    className="block w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none bg-white"
                  >
                    {MARKETPLACE_MATERIAL_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="product-description" className="block text-xs font-semibold text-slate-700">
                    Product Description & Summary
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">{description.length}/5000</span>
                </div>
                <textarea
                  id="product-description"
                  rows={3}
                  maxLength={5000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full px-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                  placeholder="Provide an overview of the curriculum coverage, methodology, and assessment compliance..."
                />
              </div>
            </div>

            {/* SECTION 4: Publication Status */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Publication Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    value: "published",
                    label: "Published",
                    desc: "Live in catalog",
                    activeClass: "border-emerald-600 bg-emerald-50/60 text-emerald-900",
                  },
                  {
                    value: "pending_review",
                    label: "Pending",
                    desc: "Review queue",
                    activeClass: "border-amber-600 bg-amber-50/60 text-amber-900",
                  },
                  {
                    value: "draft",
                    label: "Draft",
                    desc: "Hidden / Unlisted",
                    activeClass: "border-slate-600 bg-slate-100 text-slate-900",
                  },
                  {
                    value: "rejected",
                    label: "Rejected",
                    desc: "Declined publication",
                    activeClass: "border-rose-600 bg-rose-50/60 text-rose-900",
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatus(item.value as ContentStatus)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      status === item.value
                        ? `${item.activeClass} font-semibold ring-1 ring-inset ring-current`
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 5: Direct Verification Links */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-800">Verification & Preview:</span>
                <p className="text-[11px] text-slate-500">Test downloads and inspect public marketplace page.</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/projects/${project.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-slate-50 shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Public Page
                </Link>
                {project.file_path.startsWith("workspace-export:") && (
                  <>
                    <Link
                      href={`/api/download?projectId=${encodeURIComponent(project.id)}&format=pdf`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" /> PDF
                    </Link>
                    <Link
                      href={`/api/download?projectId=${encodeURIComponent(project.id)}&format=docx`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" /> Word
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50/70">
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-rose-700">Permanently delete?</span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleDelete}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Listing
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isPending}
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
