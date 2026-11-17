import React from "react";

interface StructuredDescriptionProps {
  text?: string | null;
  fallback?: string;
  compact?: boolean;
  hidePrivateFields?: boolean;
  className?: string;
}

const KNOWN_LABELS =
  /^(Business|Enterprise|Ownership|Form of Ownership|Location|Target Location|Product or service|Primary Product|Flagship Offering|Sector|Industry Sector|Course|Level|Institution|Candidate|Supervisor)\s*:\s*(.+)$/i;

const PRIVATE_FIELD_LABELS = /^(Location|Target Location|Institution|Candidate|Supervisor)$/i;

export function StructuredDescription({
  text,
  fallback = "A verified digital resource for TVET learners.",
  compact = false,
  hidePrivateFields = false,
  className = "",
}: StructuredDescriptionProps) {
  const raw = (text || "").trim();
  if (!raw) {
    return <p className={`text-xs text-slate-600 ${className}`}>{fallback}</p>;
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsedLines = lines
    .map((line) => {
      const match = line.match(KNOWN_LABELS) || line.match(/^([A-Za-z][A-Za-z0-9\s/&()-]{1,28}):\s+(.+)$/);
      if (match) {
        return {
          isKeyValue: true as const,
          label: match[1].trim(),
          value: match[2].trim(),
        };
      }
      return {
        isKeyValue: false as const,
        text: line,
      };
    })
    .filter((item) => !(hidePrivateFields && item.isKeyValue && PRIVATE_FIELD_LABELS.test(item.label)));

  const hasStructuredRows = parsedLines.some((item) => item.isKeyValue);

  if (!hasStructuredRows) {
    return (
      <div className={`whitespace-pre-line text-slate-800 ${compact ? "text-xs leading-relaxed line-clamp-3" : "text-sm leading-6"} ${className}`}>
        {raw}
      </div>
    );
  }

  if (compact) {
    return (
      <dl className={`space-y-1 text-xs leading-relaxed ${className}`}>
        {parsedLines.slice(0, 4).map((item, idx) =>
          item.isKeyValue ? (
            <div key={idx} className="truncate">
              <dt className="inline font-semibold text-slate-500">{item.label}: </dt>
              <dd className="inline font-medium text-slate-900">{item.value}</dd>
            </div>
          ) : (
            <p key={idx} className="text-slate-700 truncate">
              {item.text}
            </p>
          )
        )}
      </dl>
    );
  }

  return (
    <dl className={`divide-y divide-slate-100 rounded-lg border border-slate-200/80 bg-slate-50/50 px-3.5 py-1.5 text-xs sm:text-[13px] ${className}`}>
      {parsedLines.map((item, idx) =>
        item.isKeyValue ? (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-1 sm:gap-3 py-2 items-baseline">
            <dt className="font-semibold text-slate-500 tracking-tight">{item.label}:</dt>
            <dd className="font-medium text-slate-900 leading-snug">{item.value}</dd>
          </div>
        ) : (
          <div key={idx} className="py-2 text-slate-700 leading-relaxed">
            {item.text}
          </div>
        )
      )}
    </dl>
  );
}
