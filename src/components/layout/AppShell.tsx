"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import {
  LayoutGrid,
  Home,
  Layers,
  Lightbulb,
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
    { label: "Topic Bank", href: "/studio", icon: Lightbulb },
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
            <div className="h-9 w-9 rounded-lg bg-[#0f3554] flex items-center justify-center text-white font-extrabold text-lg shadow-xs">
              <span className="text-amber-400">B</span>P
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-[#0f3554] tracking-tight leading-none">
                BrightPath
              </span>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                TVET LMS & Project Studio
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
          className={`fixed inset-y-0 left-0 top-16 z-30 w-64 bg-[#0f3554] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } shadow-md md:shadow-none`}
        >
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {/* Top Active Course/Workspace Context Anchor */}
            <div className="px-4">
              <div className="bg-[#18476f] border border-blue-400/30 rounded-lg p-3 text-white space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <GraduationCap className="h-4 w-4" />
                  <span className="uppercase tracking-wider text-[10px]">Active Track</span>
                </div>
                <div className="text-xs font-bold truncate text-white">
                  {activeContextTitle || profile?.course || "KNEC Project Studio"}
                </div>
              </div>
            </div>

            {/* Primary Portal Navigation */}
            <div className="space-y-1 px-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[#18476f] text-white border-l-4 border-amber-400 shadow-xs"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-300" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Academic Level Groups */}
            <div className="space-y-1 px-3 border-t border-white/10 pt-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                KNEC Academic Levels
              </div>
              {academicTracks.map((track) => (
                <Link
                  key={track.label}
                  href={track.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="truncate">{track.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              ))}
            </div>

            {/* Faculty / Supervisor / Governance Portals */}
            {(isRoleSupervisor || isRoleTrainer) && (
              <div className="space-y-1 px-3 border-t border-white/10 pt-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-3 pb-1">
                  Faculty & Examination
                </div>

                {isRoleTrainer && (
                  <Link
                    href="/trainer"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-blue-200 hover:bg-white/10 transition-colors"
                  >
                    <Briefcase className="h-4 w-4 shrink-0 text-blue-400" />
                    <span>Trainer Publisher</span>
                  </Link>
                )}

                {isRoleSupervisor && (
                  <Link
                    href="/supervisor"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-amber-200 hover:bg-white/10 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>Supervisor Portal</span>
                  </Link>
                )}

                {isRoleAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-purple-200 hover:bg-white/10 transition-colors"
                  >
                    <Settings className="h-4 w-4 shrink-0 text-purple-300" />
                    <span>Admin Governance</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Footer with National Accreditation Info */}
          <div className="p-4 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">Republic of Kenya</div>
            <div className="text-[10px] text-slate-400 leading-tight">
              TVET & KNEC Examinations Project Studio Standard
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
