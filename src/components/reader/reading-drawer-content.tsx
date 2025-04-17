import type { FormattedScript } from "@/lib/meditation-formatter";

interface ReadingDrawerContentProps {
  script: FormattedScript;
}

export function ReadingDrawerContent({ script }: ReadingDrawerContentProps) {
  const title = script.title || "Dummy Title";

  return (
    <>
      {/* Header (fixed) */}
      <div className="bg-card z-10 shrink-0 border-b px-4 py-3">
        <div className="text-lg font-semibold">{title}</div>
      </div>
      {/* Main scrollable content */}
      <div className="bg-background flex-1 overflow-auto px-4 py-2">
        <div className="bg-muted mb-2 rounded p-2">
          {JSON.stringify(script, null, 2)}
        </div>
      </div>
      {/* Footer (fixed) */}
      <div className="bg-card z-10 shrink-0 border-t px-4 py-3">
        <button className="bg-primary text-primary-foreground w-full rounded py-2 font-medium">
          Dummy Button
        </button>
      </div>
    </>
  );
}
