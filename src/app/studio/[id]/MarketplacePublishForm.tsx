import { publishBusinessPlanToMarketplace } from "@/app/studio/actions";

export function MarketplacePublishForm({ workspaceId }: { workspaceId: string }) {
  return (
    <form action={publishBusinessPlanToMarketplace} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <label className="grid gap-1 text-xs font-medium text-slate-700">
        Listing price (KES)
        <input name="priceKes" type="number" min="0" max="1000000" step="50" defaultValue="2500" required
          className="h-9 w-36 rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      </label>
      <button type="submit" className="h-9 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700">
        Submit for listing review
      </button>
    </form>
  );
}
