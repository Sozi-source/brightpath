"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteDraftWorkspace } from "./actions";

interface DeleteDraftButtonProps {
  workspaceId: string;
  title?: string | null;
  redirectAfter?: boolean;
  compact?: boolean;
  iconOnly?: boolean;
}

export function DeleteDraftButton({
  workspaceId,
  title,
  redirectAfter = false,
  compact = false,
  iconOnly = false,
}: DeleteDraftButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const label = title?.trim() || "this project";
    const confirmed = window.confirm(
      `Delete "${label}"? All drafted chapters, calculations, and notes will be permanently removed. This action cannot be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("workspaceId", workspaceId);
      if (redirectAfter) {
        formData.append("redirectAfter", "true");
      }
      await deleteDraftWorkspace(formData);
    });
  };

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-rose-200/80 bg-rose-50/70 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        title="Delete project"
        aria-label={`Delete ${title || "project"}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
      title="Delete project"
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span>{isPending ? "Deleting..." : compact ? "Delete" : "Delete Project"}</span>
    </button>
  );
}
