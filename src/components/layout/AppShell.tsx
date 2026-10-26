"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
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
  Briefcase,
} from "lucide-react";

interface AppShellProps {
  user: { id: string; email?: string } | null;
  profile: {
    full_name?: string | null;
    role?: string | null;
    admission_number?: string | null;
    course?: string | null;
    level?: string | null;
  } | null;
  activeContextTitle?: string | null;
  children: React.ReactNode;
}

export function AppShell({
  user,
  profile,
  activeContextTitle,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const pathname = usePathname();

  const isRoleAdmin = profile?.role === "admin";
  const isRoleTrainer = profile?.role === "trainer" || isRoleAdmin;
  const isRoleSupervisor = profile?.role === "supervisor" || isRoleAdmin;

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Project Studio", href: "/studio", icon: Layers },
    { label: "Projects Marketplace", href: "/projects", icon: ShoppingBag },
    { label: "Digital Library", href: "/library", icon: Library },
  ];

  const academicTracks = [
    { label: "Diploma Projects (1B)", href: "/studio", level: "diploma" },
    { label: "Craft Certificate (1A)", href: "/studio", level: "craft" },
    { label: "Business Plan (Entrepreneurship)", href: "/studio", level: "business" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col font-sans">
      {/* 1. Global Institutional Top Bar (KEC White Bar with App Launcher) */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* 9-Dot Matrix App Launcher (KEC Benchmark) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAppLauncherOpen(!appLauncherOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition-colors flex items-center justify-center cursor-pointer"
              title="BrightPath TVET Application Suite"
            >
              <LayoutGrid className="h-5 w-5 text-blue-900" />
            </button>

            {/* App Matrix Dropdown */}
            {appLauncherOpen && (
              <div
                className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setAppLauncherOpen(false)}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  BrightPath TVET Suite
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/studio"
                    className="p-2.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <Layers className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Project Studio</span>
                  </Link>
                  <Link
                    href="/projects"
                    className="p-2.5 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Marketplace</span>
                  </Link>
                  <Link
                    href="/trainer"
                    className="p-2.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Trainer Publisher</span>
                  </Link>
                  <Link
                    href="/supervisor"
                    className="p-2.5 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-100 flex flex-col items-center text-center gap-1.5 transition-colors"
                  >
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Supervisor</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Official Portal Branding */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <span className="text-amber-300">B</span>P
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                BrightPath
              </span>
              <span className="text-[10px] font-medium text-indigo-600 uppercase tracking-wider">
                TVET Project Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Top Right User & Examination Series Context */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-[#e8f1f8] px-3 py-1 rounded-md border border-blue-200 text-xs font-semibold text-blue-900">
            <Calendar className="h-3.5 w-3.5 text-blue-700" />
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
              className="text-xs font-bold px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* 2. Main Portal Shell: Persistent Left Sidebar + Main Content Stage */}
      <div className="flex-1 flex w-full">
        {/* Left Persistent Navigation Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 z-30 w-64 bg-white border-r border-slate-200/80 text-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:shrink-0 md:self-start md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } shadow-md md:shadow-none`}
        >
          <div className="flex-1 overflow-y-auto py-4 space-y-5">
            {/* Top Active Course/Workspace Context Anchor */}
            <div className="px-3">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold">
                  <GraduationCap className="h-4 w-4" />
                  <span className="uppercase tracking-wider text-[10px]">Active Track</span>
                </div>
                <div className="text-xs font-semibold truncate text-slate-900">
                  {activeContextTitle || profile?.course || "KNEC Project Studio"}
                </div>
              </div>
            </div>

            {/* Primary Portal Navigation */}
            <div className="space-y-1 px-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 pb-1">
                Main Portal
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs font-semibold"
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

            {/* Academic Level Groups */}
            <div className="space-y-1 px-3 border-t border-slate-100 pt-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 pb-1">
                KNEC Academic Levels
              </div>
              {academicTracks.map((track) => (
                <Link
                  key={track.label}
                  href={track.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <span className="truncate">{track.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                </Link>
              ))}
            </div>

            {/* Faculty / Supervisor / Governance Portals */}
            {(isRoleSupervisor || isRoleTrainer) && (
              <div className="space-y-1 px-3 border-t border-slate-100 pt-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 pb-1">
                  Faculty Portals
                </div>

                {isRoleTrainer && (
                  <Link
                    href="/trainer"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      pathname.startsWith("/trainer")
                        ? "bg-indigo-600 text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className={`h-4 w-4 shrink-0 ${pathname.startsWith("/trainer") ? "text-white" : "text-slate-400"}`} />
                      <span>Trainer Publisher</span>
                    </div>
                    {!pathname.startsWith("/trainer") && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                  </Link>
                )}

                {isRoleSupervisor && (
                  <Link
                    href="/supervisor"
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      pathname.startsWith("/supervisor")
                        ? "bg-indigo-600 text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      pathname === "/admin"
                        ? "bg-indigo-600 text-white shadow-xs font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
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
              <div className="space-y-1 px-3 border-t border-slate-100 pt-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 pb-1">
                  Admin Modules
                </div>
                {[
                  { label: "Commission Fee", href: "#settings" },
                  { label: "Pending Queue", href: "#pending" },
                  { label: "Projects Catalog", href: "#projects" },
                  { label: "User Directory", href: "#users" },
                  { label: "TVET Institutions", href: "#institutions" },
                  { label: "Transactions", href: "#orders" },
                  { label: "Disputes & Reports", href: "#reports" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <span className="truncate">{item.label}</span>
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Footer with National Accreditation Info */}
          <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-0.5">
            <div className="font-semibold text-slate-700">BrightPath TVET</div>
            <div className="text-[10px] text-slate-400 leading-tight">
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

        {/* 3. Main Content Stage */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
