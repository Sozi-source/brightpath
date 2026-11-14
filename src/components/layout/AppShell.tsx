"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { DeleteDraftButton } from "@/app/studio/DeleteDraftButton";
import { BrandIcon, type BrandIconName } from "@/components/ui/BrandIcon";
import {
  LayoutGrid,
  Home,
  Layers,
  Library,
  GraduationCap,
  ShieldCheck,
  Settings,
  Calendar,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Users,
  Coins,
  AlertCircle,
  FileText,
  BookOpen,
  Briefcase,
} from "lucide-react";

export interface SidebarWorkspaceItem {
  id: string;
  title: string;
  typeLabel: string;
  status: "approved" | "pending" | "draft";
  completedSections: number;
  totalSections: number;
  progressPct: number;
}

interface AppShellProps {
  user: { id: string; email?: string } | null;
  profile: {
    full_name?: string | null;
    role?: string | null;
    admission_number?: string | null;
    course?: string | null;
    level?: string | null;
    institution_id?: string | null;
  } | null;
  institutionName?: string | null;
  activeContextTitle?: string | null;
  marketplaceCategories?: { label: string; href: string; count: number; active: boolean }[];
  studioWorkspaces?: SidebarWorkspaceItem[];
  fullScreenWorkspace?: boolean;
  children: React.ReactNode;
}

export function AppShell({
  user,
  profile,
  institutionName,
  activeContextTitle,
  marketplaceCategories,
  studioWorkspaces,
  fullScreenWorkspace = false,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const pathname = usePathname();

  const isRoleAdmin = profile?.role === "admin";
  const isRoleSupervisor = profile?.role === "supervisor" || isRoleAdmin;
  const canAccessStudio = isRoleAdmin || isRoleSupervisor || Boolean(profile?.institution_id);

  const navItems: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; brandIcon: BrandIconName; iconColor: string }[] = [
    { label: "Home", href: profile?.role === "student" ? "/learn" : "/", icon: Home, brandIcon: "dashboard", iconColor: "text-sky-600" },
    ...(canAccessStudio ? [{ label: "Project Studio", href: "/studio", icon: Layers, brandIcon: "projects" as BrandIconName, iconColor: "text-teal-600" }] : []),
    { label: "Projects Marketplace", href: "/projects", icon: ShoppingBag, brandIcon: "marketplace", iconColor: "text-emerald-600" },
    { label: "Digital Library", href: "/library", icon: Library, brandIcon: "library" as BrandIconName, iconColor: "text-amber-600" },
  ];

  const defaultCatalogLinks = [
    { label: "All materials", href: "/projects", dotColor: "bg-teal-500" },
    { label: "Business plans", href: "/projects?type=business_plan", dotColor: "bg-emerald-500" },
    { label: "Lecture notes", href: "/projects?type=lecture_notes", dotColor: "bg-sky-500" },
    { label: "Past papers", href: "/projects?type=past_paper", dotColor: "bg-amber-500" },
    { label: "Study resources", href: "/projects?type=study_resources", dotColor: "bg-orange-500" },
    { label: "Technical projects", href: "/projects?type=technical_project", dotColor: "bg-blue-600" },
    { label: "Research projects", href: "/projects?type=research_project", dotColor: "bg-rose-500" },
  ];

  const adminModules = [
    { label: "Business Plans", href: "/admin#business-plans", icon: Layers, iconColor: "text-teal-600" },
    { label: "Institutional Plans", href: "/admin#institutional-plans", icon: Briefcase, iconColor: "text-blue-600" },
    { label: "User Directory", href: "/admin#users", icon: Users, iconColor: "text-emerald-600" },
    { label: "Trainer Approvals", href: "/admin#trainer-approvals", icon: ShieldCheck, iconColor: "text-amber-600" },
    { label: "Transactions", href: "/admin#orders", icon: Coins, iconColor: "text-sky-600" },
    { label: "Flagged Content", href: "/admin#reports", icon: AlertCircle, iconColor: "text-rose-600" },
  ];

  const roleBadgeLabel = isRoleAdmin
    ? "System Admin"
    : isRoleSupervisor
    ? "Staff · Supervisor"
    : canAccessStudio
    ? "Studio Candidate"
    : "Marketplace Buyer";

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Guest Visitor";
  const userInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "TH";

  return (
    <div className="min-h-screen bg-[#f4f7fb] pt-16 text-slate-800 font-sans">
      {/* 1. Global Institutional Top Bar (KEC White Bar with App Launcher) */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 min-w-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 shadow-xs sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          {/* Mobile Menu Toggle */}
          {!fullScreenWorkspace && <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>}

          {/* 9-Dot Matrix App Launcher (KEC Benchmark) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAppLauncherOpen(!appLauncherOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors flex items-center justify-center cursor-pointer"
              title="TVET Hub Application Suite"
            >
              <LayoutGrid className="h-5 w-5 text-slate-900" />
            </button>

            {/* App Matrix Dropdown */}
            {appLauncherOpen && (
              <div
                className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setAppLauncherOpen(false)}
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                  TVET Hub Suite
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {canAccessStudio && (
                    <Link
                      href="/studio"
                      className="p-2.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                    >
                      <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                        <BrandIcon name="projects" size="xs" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">Project Studio</span>
                    </Link>
                  )}
                  <Link
                    href="/projects"
                    className="p-2.5 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <BrandIcon name="marketplace" size="xs" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">Marketplace</span>
                  </Link>
                  <Link
                    href="/library"
                    className="p-2.5 rounded-lg hover:bg-sky-50 border border-transparent hover:border-sky-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                      <BrandIcon name="library" size="xs" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">Digital Library</span>
                  </Link>
                  {isRoleAdmin && (
                    <Link
                      href="/admin"
                      className="p-2.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                    >
                      <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                        <BrandIcon name="supervisor" size="xs" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">Admin Console</span>
                    </Link>
                  )}
                  {isRoleSupervisor && <Link
                    href="/supervisor"
                    className="p-2.5 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                      <BrandIcon name="supervisor" size="xs" />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">Supervisor</span>
                  </Link>}
                </div>
              </div>
            )}
          </div>

          {/* Official Portal Branding */}
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#087f8c] flex items-center justify-center text-white font-semibold text-sm shadow-xs">
              <span className="text-amber-300">T</span>H
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-sm sm:text-lg text-slate-900 tracking-tight leading-none">
                TVET Hub
              </span>
              <span className="hidden text-[10px] font-medium text-[#087f8c] tracking-wider sm:block">
                Simple · Reliable · Innovative
              </span>
            </div>
          </Link>
        </div>

        {/* Top Right User & Examination Series Context */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-teal-50/80 px-3 py-1 rounded-md border border-teal-200/70 text-xs font-semibold text-slate-900">
            <Calendar className="h-3.5 w-3.5 text-[#087f8c]" />
            <span>KNEC 2026 Academic Series</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {profile?.admission_number ? `Adm: ${profile.admission_number}` : roleBadgeLabel}
                </span>
              </div>

              <form action={logout}>
                <button
                  type="submit"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#087f8c] hover:bg-[#066570] text-white transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* 2. Main Portal Shell: Continuous Left Institutional Sidebar + Main Content Stage */}
      <div className="flex-1 flex w-full min-w-0">
        {!fullScreenWorkspace && <>
        <aside
          aria-label="Portal navigation"
          className={`fixed bottom-0 left-0 top-16 z-30 flex w-60 flex-col border-r border-slate-200/80 bg-white text-slate-800 shadow-xl transition-transform duration-200 ease-in-out md:w-60 md:translate-x-0 md:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Signature KEC Two-Tone Accent Stripe */}
          <div className="h-1 w-full shrink-0 bg-gradient-to-r from-[#087f8c] via-teal-500 to-amber-400" />

          {/* Continuous Identity & Role Header (Always unified across Admin, Staff, and Students) */}
          <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xs font-semibold text-[#087f8c] border border-teal-200/80">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {displayName}
                  </p>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ${
                      isRoleAdmin
                        ? "bg-teal-100/80 text-teal-900"
                        : isRoleSupervisor
                        ? "bg-blue-100/80 text-blue-800"
                        : canAccessStudio
                        ? "bg-emerald-100/80 text-emerald-800"
                        : "bg-amber-100/80 text-amber-800"
                    }`}
                  >
                    {isRoleSupervisor ? (
                      <ShieldCheck className="h-2.5 w-2.5 shrink-0" />
                    ) : (
                      <GraduationCap className="h-2.5 w-2.5 shrink-0" />
                    )}
                    <span className="truncate">{roleBadgeLabel}</span>
                  </span>
                </div>
              </div>
            </div>
            {(activeContextTitle || profile?.course || institutionName) && (
              <p className="mt-2 truncate rounded-md border border-slate-200/80 bg-white px-2 py-1 text-[10.5px] font-medium text-slate-600">
                {activeContextTitle || profile?.course || institutionName}
              </p>
            )}
          </div>

          {/* Continuous Scrollable Navigation Rail */}
          <div className="flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] px-3 py-3 space-y-5">
            {/* Group 1: Core Workspace Navigation */}
            <nav aria-label="Core workspace" className="space-y-1">
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Workspace
              </div>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-all ${
                      isActive
                        ? "bg-[#087f8c] text-white font-semibold shadow-xs"
                        : "font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : item.iconColor}`} />
                    <span className="truncate">{item.label}</span>
                    <ChevronRight
                      className={`ml-auto h-3.5 w-3.5 shrink-0 ${
                        isActive ? "text-teal-100" : "text-slate-300"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Group 2: Continuous Role Operations (Admin, Staff/Supervisor, or Student) */}
            {isRoleSupervisor ? (
              <div className="space-y-4 border-t border-slate-100 pt-3.5">
                <nav aria-label="Staff and governance" className="space-y-1">
                  <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Staff & Governance
                  </div>

                  <Link
                    href="/supervisor"
                    onClick={() => setSidebarOpen(false)}
                    aria-current={pathname.startsWith("/supervisor") ? "page" : undefined}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${
                      pathname.startsWith("/supervisor")
                        ? "bg-[#087f8c] text-white font-semibold shadow-xs"
                        : "font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ShieldCheck
                        className={`h-4 w-4 shrink-0 ${
                          pathname.startsWith("/supervisor") ? "text-white" : "text-blue-600"
                        }`}
                      />
                      <span className="truncate">Supervisor Portal</span>
                    </div>
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 ${
                        pathname.startsWith("/supervisor") ? "text-teal-100" : "text-slate-300"
                      }`}
                    />
                  </Link>

                  {isRoleAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setSidebarOpen(false)}
                      aria-current={pathname === "/admin" ? "page" : undefined}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-all ${
                        pathname === "/admin"
                          ? "bg-[#087f8c] text-white font-semibold shadow-xs"
                          : "font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Settings
                          className={`h-4 w-4 shrink-0 ${
                            pathname === "/admin" ? "text-white" : "text-teal-600"
                          }`}
                        />
                        <span className="truncate">Admin Console</span>
                      </div>
                      <ChevronRight
                        className={`h-3.5 w-3.5 shrink-0 ${
                          pathname === "/admin" ? "text-teal-100" : "text-slate-300"
                        }`}
                      />
                    </Link>
                  )}
                </nav>

                {isRoleAdmin && (
                  <nav aria-label="Admin modules" className="space-y-0.5">
                    <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Admin Modules
                    </div>
                    {adminModules.map((item) => {
                      const ModuleIcon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <ModuleIcon className={`h-3.5 w-3.5 shrink-0 ${item.iconColor}`} />
                            <span className="truncate">{item.label}</span>
                          </span>
                          <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
                        </Link>
                      );
                    })}
                  </nav>
                )}
              </div>
            ) : (
              /* Continuous Student Workspace Section */
              <div className="space-y-2 border-t border-slate-100 pt-3.5">
                <div className="flex items-center justify-between px-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {canAccessStudio ? "Studio Workspace" : "Student Access"}
                  </span>
                  {canAccessStudio && (
                    <Link
                      href="/studio/new"
                      onClick={() => setSidebarOpen(false)}
                      className="inline-flex items-center gap-1 rounded-md border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-[#087f8c] hover:bg-teal-100 transition-colors"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>New Draft</span>
                    </Link>
                  )}
                </div>

                {canAccessStudio && studioWorkspaces && studioWorkspaces.length > 0 ? (
                  <div className="space-y-1.5 px-1">
                    {studioWorkspaces.map((ws) => {
                      const isApproved = ws.status === "approved";
                      const isPending = ws.status === "pending";
                      return (
                        <div
                          key={ws.id}
                          className="rounded-lg border border-slate-200 bg-slate-50/60 p-2 space-y-1.5 shadow-2xs"
                        >
                          <Link
                            href={`/studio/${ws.id}`}
                            onClick={() => setSidebarOpen(false)}
                            className="block text-[11px] font-semibold text-slate-900 hover:text-[#087f8c] truncate leading-snug"
                            title={ws.title}
                          >
                            {ws.title}
                          </Link>

                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ${
                                isApproved
                                  ? "bg-emerald-50 text-emerald-700"
                                  : isPending
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-white text-slate-600 border border-slate-200/80"
                              }`}
                            >
                              {isApproved ? (
                                <CheckCircle2 className="h-2.5 w-2.5" />
                              ) : (
                                <Clock3 className="h-2.5 w-2.5" />
                              )}
                              {isApproved ? "Approved" : isPending ? "Review" : "Draft"}
                            </span>
                            <span className="font-mono text-slate-500">
                              {ws.completedSections}/{ws.totalSections} ({ws.progressPct}%)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-0.5">
                            <Link
                              href={`/studio/${ws.id}`}
                              onClick={() => setSidebarOpen(false)}
                              className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-[#087f8c] hover:bg-[#066570] px-2 py-1 text-[11px] font-semibold text-white transition-colors"
                            >
                              <span>Continue</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                            <DeleteDraftButton workspaceId={ws.id} title={ws.title} iconOnly />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {canAccessStudio && (
                      <Link
                        href="/studio"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-teal-600" />
                          <span>My Studio Drafts</span>
                        </span>
                        <ChevronRight className="h-3 w-3 text-slate-300" />
                      </Link>
                    )}
                    <Link
                      href="/library"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                        <span>Purchased Downloads</span>
                      </span>
                      <ChevronRight className="h-3 w-3 text-slate-300" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Group 3: Continuous Resource Catalog Filter (Visible across all roles & routes) */}
            <nav aria-label="Marketplace categories" className="space-y-0.5 border-t border-slate-100 pt-3.5">
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Resource Catalog
              </div>
              {(marketplaceCategories?.length
                ? marketplaceCategories.map((cat, idx) => ({
                    ...cat,
                    dotColor: defaultCatalogLinks[idx % defaultCatalogLinks.length].dotColor,
                  }))
                : defaultCatalogLinks.map((item) => ({
                    ...item,
                    count: undefined as number | undefined,
                    active: false,
                  }))
              ).map((category) => (
                <Link
                  key={category.label}
                  href={category.href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={category.active ? "page" : undefined}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    category.active
                      ? "border border-teal-200 bg-teal-50 font-semibold text-[#087f8c]"
                      : "border border-transparent font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${category.dotColor}`} />
                    <span className="truncate">{category.label}</span>
                  </span>
                  {category.count !== undefined ? (
                    <span
                      className={`ml-2 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        category.active
                          ? "bg-teal-100 text-[#087f8c] font-semibold"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {category.count}
                    </span>
                  ) : (
                    <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Continuous Pinned Institutional Footer */}
          <div className="shrink-0 border-t border-slate-200/80 bg-slate-50/70 px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="truncate">TVET Hub Portal</span>
                </div>
                <div className="truncate text-[9.5px] text-slate-500">
                  KNEC 2026 Series · Verified
                </div>
              </div>
              {user && (
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </form>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        </>}

        {/* 3. Main Content Stage */}
        <main className={fullScreenWorkspace
          ? "h-[calc(100vh-4rem)] min-w-0 flex-1 overflow-y-auto"
          : "min-w-0 w-full flex-1 px-3 py-3 sm:px-5 sm:py-5 md:ml-60 lg:px-8 lg:py-6 2xl:px-10 space-y-4 sm:space-y-6"}>
          {children}
        </main>
      </div>
    </div>
  );
}
