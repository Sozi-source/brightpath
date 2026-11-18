export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-lg bg-slate-200" />
            <div className="h-3.5 w-72 rounded-md bg-slate-200/80" />
          </div>
          <div className="h-7 w-24 rounded-md bg-slate-200" />
        </div>
        <div className="h-16 w-full rounded-xl border border-slate-200 bg-white" />
        <div className="flex gap-2 overflow-hidden">
          <div className="h-8 w-28 rounded-lg bg-slate-200" />
          <div className="h-8 w-32 rounded-lg bg-slate-200/80" />
          <div className="h-8 w-36 rounded-lg bg-slate-200/80" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-64 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="h-28 w-full rounded-lg bg-slate-100" />
              <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
