"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";

type SupervisorFormAction = (formData: FormData) => Promise<void>;

export function SupervisorDecisionForm({
  action,
  successMessage,
  submitLabel,
  pendingLabel,
  className,
  tone = "success",
  children,
}: {
  action: SupervisorFormAction;
  successMessage: string;
  submitLabel: string;
  pendingLabel: string;
  className: string;
  tone?: "success" | "danger";
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setFeedback(null);
    startTransition(async () => {
      try {
        await action(formData);
        setFeedback({ kind: "success", text: successMessage });
        router.refresh();
      } catch (error) {
        setFeedback({
          kind: "error",
          text: error instanceof Error ? error.message : "The review could not be saved. Please try again.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      {feedback && (
        <p
          role={feedback.kind === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-md px-2.5 py-2 text-xs ${feedback.kind === "error" ? "border border-rose-200 bg-rose-50 text-rose-800" : "border border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          {feedback.text}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`w-full rounded-md px-3 py-2 text-xs font-semibold text-white transition-colors disabled:cursor-wait disabled:opacity-70 ${tone === "danger" ? "bg-rose-700 hover:bg-rose-800" : "bg-emerald-700 hover:bg-emerald-800"}`}
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
