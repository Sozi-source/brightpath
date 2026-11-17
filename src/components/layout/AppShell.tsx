"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { DeleteDraftButton } from "@/app/studio/DeleteDraftButton";
import { BrandIcon, type BrandIconName } from "@/components/ui/BrandIcon";
import { BrandLogo } from "@/components/ui/BrandLogo";
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
  const [activeProjectsOpen, setActiveProjectsOpen] = useState(false);
  const pathname = usePathname();

  const isRoleAdmin = profile?.role === "admin";
  const isRoleSupervisor = profile?.role === "supervisor" || isRoleAdmin;
  const canAccessStudio = isRoleAdmin || isRoleSupervisor || Boolean(profile?.institution_id);

  const navItems: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; brandIcon: BrandIconName; iconColor: string }[] = [
    { label: "Home", href: profile?.role === "student" ? "/learn" : "/", icon: Home, brandIcon: "dashboard", iconColor: "text-sky-600" },
    ...(canAccessStudio ? [{ label: "Project Studio", href: "/studio", icon: Layers, brandIcon: "projects" as BrandIconName, iconColor: "text-teal-600" }] : []),
    { label: "Projects Marketplace", href: "/projects", icon: ShoppingBag, brandIcon: "marketplace", iconColor: "text-emerald-600" },
    { label: "Digital Library", href: "/library", icon: BookOpen, brandIcon: "library" as BrandIconName, iconColor: "text-amber-600" },
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
    { label: "Business Plans", href: "/admin#business-plans", icon: Layers, iconColor: "text-slate-500" },
    { label: "Institutional Plans", href: "/admin/institutional", icon: Briefcase, iconColor: "text-slate-500" },
    { label: "User Directory", href: "/admin/users", icon: Users, iconColor: "text-slate-500" },
    { label: "Trainer Approvals", href: "/admin/trainers", icon: ShieldCheck, iconColor: "text-slate-500" },
    { label: "Transactions", href: "/admin#orders", icon: Coins, iconColor: "text-slate-500" },
    { label: "Flagged Content", href: "/admin#reports", icon: AlertCircle, iconColor: "text-slate-500" },
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
          <Link href="/" className="flex min-w-0 items-center">
            <BrandLogo size="sm" />
          </Link>
        </div>

        {/* Top Right User & Examination Series Context */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/80 px-3 py-1 rounded-md border border-slate-200 text-xs font-semibold text-slate-800">
            <Calendar className="h-3.5 w-3.5 text-[#092B68]" />
            <span>KNEC 2026 Academic Series</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {!isRoleSupervisor && profile?.admission_number ? `Adm: ${profile.admission_number}` : roleBadgeLabel}
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
              className="whitespace-nowrap shrink-0 text-xs font-semibold px-4 py-2 rounded-lg bg-[#092B68] hover:bg-[#07204f] text-white transition-colors"
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
          {/* Signature Two-Tone Brand Accent Stripe */}
          <div className="h-1 w-full shrink-0 flex">
            <div className="w-[60%] bg-[#092B68]" />
            <div className="w-[40%] bg-[#F5A000]" />
          </div>

          {/* Continuous Identity & Role Header (Always unified across Admin, Staff, and Students) */}
          <div className="shrink-0 border-b border-slate-200/80 bg-slate-50/70 px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-[#092B68] border border-slate-200">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-[13px] font-semibold text-slate-900">
                    {displayName}
                  </p>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider border ${
                      isRoleAdmin
                        ? "bg-slate-100 text-[#092B68] border-slate-200"
                        : isRoleSupervisor
                        ? "bg-slate-100 text-[#092B68] border-slate-200"
                        : canAccessStudio
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {isRoleSupervisor ? (
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                    ) : (
                      <GraduationCap className="h-3 w-3 shrink-0" />
                    )}
                    <span className="truncate">{roleBadgeLabel}</span>
                  </span>
                </div>
              </div>
            </div>
            {(activeContextTitle || profile?.course || institutionName) && (
              <p className="mt-2 truncate rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-medium text-slate-700">
                {activeContextTitle || profile?.course || institutionName}
              </p>
            )}
          </div>

          {/* Continuous Scrollable Navigation Rail */}
          <div className="flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] px-3 py-3 space-y-5">
            {/* Group 1: Core Workspace Navigation */}
            <nav aria-label="Core workspace" className="space-y-1">
              <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
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
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-all ${
                      isActive
                        ? "bg-[#092B68] text-white font-semibold shadow-xs"
                        : "font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span className="truncate">{item.label}</span>
                    <ChevronRight
                      className={`ml-auto h-3.5 w-3.5 shrink-0 ${
                        isActive ? "text-blue-200" : "text-slate-400"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Group 2: Continuous Role Operations (Admin, Staff/Supervisor, or Student) */}
            {isRoleSupervisor ? (
              <div className="space-y-4 border-t border-slate-200/70 pt-3.5">
                <nav aria-label="Staff and governance" className="space-y-1">
                  <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Staff & Governance
                  </div>

                  <Link
                    href="/supervisor"
                    onClick={() => setSidebarOpen(false)}
                    aria-current={pathname.startsWith("/supervisor") ? "page" : undefined}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-all ${
                      pathname.startsWith("/supervisor")
                        ? "bg-[#092B68] text-white font-semibold shadow-xs"
                        : "font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ShieldCheck
                        className={`h-4 w-4 shrink-0 ${
                          pathname.startsWith("/supervisor") ? "text-white" : "text-slate-500"
                        }`}
                      />
                      <span className="truncate">Supervisor Portal</span>
                    </div>
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 ${
                        pathname.startsWith("/supervisor") ? "text-blue-200" : "text-slate-400"
                      }`}
                    />
                  </Link>

                  {isRoleAdmin && (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setSidebarOpen(false)}
                        aria-current={pathname === "/admin" ? "page" : undefined}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-all ${
                          pathname === "/admin"
                            ? "bg-[#092B68] text-white font-semibold shadow-xs"
                            : "font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Settings
                            className={`h-4 w-4 shrink-0 ${
                              pathname === "/admin" ? "text-white" : "text-slate-500"
                            }`}
                          />
                          <span className="truncate">Admin Console</span>
                        </div>
                        <ChevronRight
                          className={`h-3.5 w-3.5 shrink-0 ${
                            pathname === "/admin" ? "text-blue-200" : "text-slate-400"
                          }`}
                        />
                      </Link>

                      <Link
                        href="/admin/users"
                        onClick={() => setSidebarOpen(false)}
                        aria-current={pathname.startsWith("/admin/users") ? "page" : undefined}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] transition-all ${
                          pathname.startsWith("/admin/users")
                            ? "bg-[#092B68] text-white font-semibold shadow-xs"
                            : "font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Users
                            className={`h-4 w-4 shrink-0 ${
                              pathname.startsWith("/admin/users") ? "text-white" : "text-slate-500"
                            }`}
                          />
                          <span className="truncate">Users</span>
                        </div>
                        <ChevronRight
                          className={`h-3.5 w-3.5 shrink-0 ${
                            pathname.startsWith("/admin/users") ? "text-blue-200" : "text-slate-400"
                          }`}
                        />
                      </Link>
                    </>
                  )}
                </nav>

                {isRoleAdmin && (
                  <nav aria-label="Admin modules" className="space-y-0.5">
                    <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Admin Modules
                    </div>
                    {adminModules.map((item) => {
                      const ModuleIcon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <ModuleIcon className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
                            <span className="truncate">{item.label}</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        </Link>
                      );
                    })}
                  </nav>
                )}
              </div>
            ) : (
              /* Continuous Student Workspace Section (Sleek single-line rows matching Admin Modules) */
              <nav aria-label="Student workspace" className="space-y-0.5 border-t border-slate-200/70 pt-3.5">
                <div className="flex items-center justify-between gap-2 px-2.5 pb-1">
                  <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {canAccessStudio ? "Studio Drafts" : "Student Access"}
                  </span>
                  {canAccessStudio && (
                    <Link
                      href="/studio/new"
                      onClick={() => setSidebarOpen(false)}
                      className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold text-[#087f8c] hover:bg-teal-50 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>New</span>
                    </Link>
                  )}
                </div>

                {canAccessStudio && studioWorkspaces && studioWorkspaces.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveProjectsOpen((prev) => !prev)}
                      aria-expanded={activeProjectsOpen}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-teal-600" />
                        <span className="truncate">Active Projects</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#087f8c]">
                          {studioWorkspaces.length}
                        </span>
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${
                            activeProjectsOpen ? "rotate-90" : ""
                          }`}
                        />
                      </span>
                    </button>

                    {activeProjectsOpen && (
                      <div className="space-y-0.5 pl-2 pt-0.5">
                        {studioWorkspaces.map((ws) => {
                          const isApproved = ws.status === "approved";
                          const isPending = ws.status === "pending";
                          const isCurrent = pathname === `/studio/${ws.id}` || pathname.startsWith(`/studio/${ws.id}/`);
                          return (
                            <Link
                              key={ws.id}
                              href={`/studio/${ws.id}`}
                              onClick={() => setSidebarOpen(false)}
                              aria-current={isCurrent ? "page" : undefined}
                              title={ws.title}
                              className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                                isCurrent
                                  ? "border border-teal-200 bg-teal-50 font-semibold text-[#087f8c]"
                                  : "border border-transparent font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                {isApproved ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                ) : isPending ? (
                                  <Clock3 className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                ) : (
                                  <FileText className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                                )}
                                <span className="truncate">{ws.title}</span>
                              </span>
                              <span className="shrink-0 font-mono text-[11px] text-slate-600">
                                {ws.progressPct}%
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {canAccessStudio && (
                      <Link
                        href="/studio"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-teal-600" />
                          <span className="truncate">My Studio Drafts</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      </Link>
                    )}
                    <Link
                      href="/library"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 shrink-0 text-amber-600" />
                        <span className="truncate">Purchased Downloads</span>
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </Link>
                  </>
                )}
              </nav>
            )}

            {/* Group 3: Continuous Resource Catalog Filter (Visible across all roles & routes) */}
            <nav aria-label="Marketplace categories" className="space-y-0.5 border-t border-slate-200/70 pt-3.5">
              <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
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
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] transition-colors ${
                    category.active
                      ? "border border-teal-200 bg-teal-50 font-semibold text-[#087f8c]"
                      : "border border-transparent font-medium text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${category.dotColor}`} />
                    <span className="truncate">{category.label}</span>
                  </span>
                  {category.count !== undefined ? (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-mono ${
                        category.active
                          ? "bg-teal-100 text-[#087f8c] font-semibold"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {category.count}
                    </span>
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Continuous Pinned Institutional Footer */}
          <div className="shrink-0 border-t border-slate-200 bg-slate-50/70 px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span className="truncate">TVET Hub Portal</span>
                </div>
                <div className="truncate text-[11px] text-slate-600">
                  KNEC 2026 Series · Verified
                </div>
              </div>
              {user && (
                <form action={logout} className="shrink-0">
                  <button
                    type="submit"
                    className="whitespace-nowrap shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
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
