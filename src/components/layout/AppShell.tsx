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

  const navItems: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; brandIcon: BrandIconName }[] = [
    { label: "Home", href: "/", icon: Home, brandIcon: "dashboard" },
    { label: "Project Studio", href: "/studio", icon: Layers, brandIcon: "projects" },
    { label: "Projects Marketplace", href: "/projects", icon: ShoppingBag, brandIcon: "marketplace" },
    ...(!isRoleAdmin ? [{ label: "Digital Library", href: "/library", icon: Library, brandIcon: "library" as BrandIconName }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] pt-16 text-slate-800 font-sans">
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
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-[#087f8c] transition-colors flex items-center justify-center cursor-pointer"
              title="TVET Hub Application Suite"
            >
              <LayoutGrid className="h-5 w-5 text-[#13243a]" />
            </button>

            {/* App Matrix Dropdown */}
            {appLauncherOpen && (
              <div
                className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setAppLauncherOpen(false)}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  TVET Hub Suite
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/studio"
                    className="p-2.5 rounded-lg hover:bg-teal-50 border border-transparent hover:border-teal-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                      <BrandIcon name="projects" size="xs" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Project Studio</span>
                  </Link>
                  <Link
                    href="/projects"
                    className="p-2.5 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <BrandIcon name="marketplace" size="xs" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Marketplace</span>
                  </Link>
                  {!isRoleAdmin ? (
                    <Link
                      href="/library"
                      className="p-2.5 rounded-lg hover:bg-sky-50 border border-transparent hover:border-sky-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                    >
                      <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                        <BrandIcon name="library" size="xs" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Digital Library</span>
                    </Link>
                  ) : (
                    <Link
                      href="/admin"
                      className="p-2.5 rounded-lg hover:bg-teal-50 border border-transparent hover:border-teal-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                    >
                      <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                        <BrandIcon name="supervisor" size="xs" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Admin Console</span>
                    </Link>
                  )}
                  {isRoleSupervisor && <Link
                    href="/supervisor"
                    className="p-2.5 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                      <BrandIcon name="supervisor" size="xs" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Supervisor</span>
                  </Link>}
                </div>
              </div>
            )}
          </div>

          {/* Official Portal Branding */}
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#087f8c] flex items-center justify-center text-white font-bold text-sm shadow-xs">
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
          <div className="hidden lg:flex items-center gap-2 bg-[#e8f5f5] px-3 py-1 rounded-md border border-[#d8ebec] text-xs font-semibold text-[#13243a]">
            <Calendar className="h-3.5 w-3.5 text-[#087f8c]" />
            <span>KNEC 2026 Academic Series</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {profile?.full_name || user.email?.split("@")[0]}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {profile?.admission_number ? `Adm: ${profile.admission_number}` : profile?.role || "Candidate"}
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
              className="text-xs font-bold px-4 py-2 rounded-lg bg-[#087f8c] hover:bg-[#086b76] text-white transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* 2. Main Portal Shell: Persistent Left Sidebar + Main Content Stage */}
      <div className="flex-1 flex w-full">
        {!fullScreenWorkspace && <>
        {/* Left Persistent Navigation Sidebar */}
        <aside
          className={`fixed bottom-0 left-0 top-16 z-30 flex w-56 flex-col justify-between border-r border-slate-200/80 bg-white text-slate-800 shadow-xl transition-transform duration-200 ease-in-out md:w-60 md:translate-x-0 md:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } shadow-xl md:shadow-none`}
        >
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {/* 1. Primary Portal Navigation FIRST (Uncrowded & Prominent) */}
            <div className="space-y-0.5 px-2.5">
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 px-2.5 pb-1">
                Main Portal
              </div>
              {navItems.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#087f8c] text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                    {!isActive && <ChevronRight className="h-3.5 w-3.5 text-slate-300 ml-auto shrink-0" />}
                  </Link>
                );
              })}
            </div>

            {pathname.startsWith("/projects") && marketplaceCategories?.length ? (
              <nav aria-label="Marketplace categories" className="space-y-0.5 border-t border-slate-100 px-2.5 pt-2.5">
                <div className="px-2.5 pb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">Marketplace</div>
                {marketplaceCategories.map((category) => (
                  <Link
                    key={category.label}
                    href={category.href}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={category.active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      category.active
                        ? "border border-teal-200 bg-teal-50 font-semibold text-[#087f8c]"
                        : "border border-transparent font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{category.label}</span>
                    <span className={category.active ? "text-[#087f8c]" : "text-slate-500"}>{category.count}</span>
                  </Link>
                ))}
              </nav>
            ) : null}

            {/* Faculty / Supervisor / Governance Portals */}
            {isRoleSupervisor && (
              <div className="space-y-0.5 px-2.5 border-t border-slate-100 pt-2.5">
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 px-2.5 pb-1">
                  System Controls
                </div>

                {isRoleSupervisor && (
                  <Link
                    href="/supervisor"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      pathname.startsWith("/supervisor")
                        ? "bg-[#087f8c] text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className={`h-4 w-4 shrink-0 ${pathname.startsWith("/supervisor") ? "text-white" : "text-slate-400"}`} />
                      <span>Supervisor Portal</span>
                    </div>
                    {!pathname.startsWith("/supervisor") && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                  </Link>
                )}

                {isRoleAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      pathname === "/admin"
                        ? "bg-[#087f8c] text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className={`h-4 w-4 shrink-0 ${pathname === "/admin" ? "text-white" : "text-slate-400"}`} />
                      <span>Administration</span>
                    </div>
                    {pathname !== "/admin" && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                  </Link>
                )}
              </div>
            )}

            {/* Admin Modules Quick Jump Navigation */}
            {pathname.startsWith("/admin") && (
              <div className="space-y-0.5 px-2.5 border-t border-slate-100 pt-2.5">
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 px-2.5 pb-1">
                  Admin Modules
                </div>
                {[
                  { label: "Business Plans", href: "#business-plans" },
                  { label: "User Directory", href: "#users" },
                  { label: "Transactions", href: "#orders" },
                  { label: "Disputes & Reports", href: "#reports" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <span className="truncate">{item.label}</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                  </a>
                ))}
              </div>
            )}

            {/* 2. Unified Candidate Track + Active Projects Panel (Only shown on candidate / learning workflows) */}
            {!pathname.startsWith("/admin") && (
              <div className="px-2.5 border-t border-slate-100 pt-2.5">
              <div className="rounded-xl border border-[#d8ebec] bg-[#e8f5f5]/50 p-2.5 space-y-2.5">
                {/* Compact Candidate / Admin Session Header */}
                <div className="space-y-0.5 px-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#087f8c]">
                      {isRoleAdmin ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                          <span>System Administrator</span>
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                          <span>Candidate Workspace</span>
                        </>
                      )}
                    </span>
                    {!isRoleAdmin && studioWorkspaces !== undefined && (
                      <Link
                        href="/studio/new"
                        onClick={() => setSidebarOpen(false)}
                        className="inline-flex items-center gap-0.5 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#087f8c] border border-[#d8ebec] hover:bg-teal-50 transition-colors"
                      >
                        <Plus className="h-2.5 w-2.5" />
                        <span>New</span>
                      </Link>
                    )}
                  </div>
                  <div className="text-xs font-semibold truncate text-slate-900">
                    {activeContextTitle || profile?.course || "KNEC Project Studio"}
                  </div>
                  {user && (
                    <div className="text-[10px] text-slate-500 truncate">
                      {profile?.full_name || user.email?.split("@")[0]}
                      {profile?.admission_number ? ` · ${profile.admission_number}` : ""}
                      {institutionName ? ` · ${institutionName}` : ""}
                    </div>
                  )}
                </div>

                {/* Integrated Active Projects List inside the same card */}
                {studioWorkspaces !== undefined && (
                  <div className="border-t border-[#d8ebec]/80 pt-2 space-y-1.5">
                    <div className="flex items-center justify-between px-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      <span>Active Projects</span>
                      <span className="font-mono">{studioWorkspaces.length}</span>
                    </div>

                    {studioWorkspaces.length === 0 ? (
                      <p className="px-0.5 text-[11px] text-slate-500">
                        Select a project area to begin.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {studioWorkspaces.map((ws) => {
                          const isApproved = ws.status === "approved";
                          const isPending = ws.status === "pending";
                          return (
                            <div
                              key={ws.id}
                              className="rounded-lg border border-slate-200/90 bg-white p-2 space-y-1.5 shadow-2xs"
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
                                      : "bg-slate-100 text-slate-600"
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
                                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-[#087f8c] hover:bg-[#086b76] px-2 py-1 text-[11px] font-semibold text-white transition-colors"
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
                    )}
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Sidebar Footer with National Accreditation Info */}
          <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
            <div className="font-semibold text-slate-700">TVET Hub</div>
            <div className="text-[9.5px] text-slate-400 leading-tight">
              KNEC Project Studio Standard
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
