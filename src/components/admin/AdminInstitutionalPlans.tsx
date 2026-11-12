import Link from "next/link";
import Image from "next/image";
import { FileText, Plus, ShieldCheck } from "lucide-react";
import { createIcmhsInstitutionalPlan } from "@/app/admin/actions";

export interface AdminInstitutionalPlanRow {
  id: string;
  title: string | null;
  status: string | null;
  final_project_status: string | null;
  updated_at: string;
}

export function AdminInstitutionalPlans({ plans }: { plans: AdminInstitutionalPlanRow[] }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-16 items-center justify-center rounded-lg border border-blue-200 bg-white p-1">
            <Image src="/branding/icmhs-logo.webp" alt="ICMHS" width={64} height={44} className="max-h-full max-w-full object-contain" />
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-700" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-900">Internal feasibility workspace</p>
            <p className="text-[11px] text-slate-600">Admin-only. Never listed or sold in the marketplace.</p>
          </div>
        </div>
        <form action={createIcmhsInstitutionalPlan}>
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700">
            <Plus className="h-3.5 w-3.5" /> New ICMHS plan
          </button>
        </form>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center">
          <FileText className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-xs font-semibold text-slate-700">No institutional plans yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <tr><th className="px-3 py-2">Plan</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Updated</th><th className="px-3 py-2 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50/60">
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{plan.title || "ICMHS institutional plan"}</td>
                  <td className="px-3 py-2.5"><span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800">{plan.final_project_status || plan.status || "Draft"}</span></td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500">{new Date(plan.updated_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <Link href={`/studio/${plan.id}`} className="mr-2 inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">Open</Link>
                    <Link href={`/api/studio/${plan.id}/export?format=docx`} className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700">Download DOCX</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
