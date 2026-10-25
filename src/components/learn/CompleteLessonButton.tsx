"use client";

import { useTransition } from "react";
import { toggleLessonCompletion } from "@/app/learn/actions";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface CompleteLessonButtonProps {
  lessonId: string;
  moduleId: string;
  isCompleted: boolean;
}

export function CompleteLessonButton({
  lessonId,
  moduleId,
  isCompleted,
}: CompleteLessonButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleLessonCompletion(lessonId, moduleId);
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
        isCompleted
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
          : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"
      }`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isCompleted ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      <span>{isCompleted ? "Completed" : "Mark as Complete"}</span>
    </button>
  );
}
