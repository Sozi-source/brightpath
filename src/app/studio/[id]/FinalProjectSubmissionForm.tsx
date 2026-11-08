import { submitCompletedProjectForFinalReview } from "@/app/studio/actions";

export function FinalProjectSubmissionForm({
  workspaceId,
}: {
  workspaceId: string;
  isBusinessPlan?: boolean;
  defaultPrice?: number | null;
}) {
  return (
    <form action={submitCompletedProjectForFinalReview} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <button type="submit" className="h-9 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer">
        Submit completed project for final supervisor review
      </button>
    </form>
  );
}
