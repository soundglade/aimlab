import type { FormattedScript } from "@/lib/meditation-formatter";
import { Skeleton } from "@/components/ui/skeleton";
import { gradientBackgroundClasses } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";

interface ReadingDrawerContentProps {
  script: FormattedScript;
}

// Skeleton for steps
function StepsSkeleton() {
  return (
    <div>
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className="mb-2 rounded p-3">
          <Skeleton className="mb-1 h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function ReadingDrawerContent({ script }: ReadingDrawerContentProps) {
  const title = script?.title;

  return (
    <>
      {/* Header (fixed) */}
      <div className="bg-card z-10 shrink-0 px-4 py-3">
        <div className="text-center text-2xl tracking-tight">
          {title ? title : <Skeleton className="mx-auto h-8 w-2/3" />}
        </div>
      </div>
      {/* Main scrollable content */}
      <div
        className={cn(
          "flex-1 overflow-auto px-4 py-2",
          gradientBackgroundClasses
        )}
      >
        {script.steps && script.steps.length > 0 ? (
          script.steps.map((step, idx) => (
            <div
              key={idx}
              className={cn(
                "p-3 rounded transition-colors",
                step.type === "speech" &&
                  "border-l-4 border-transparent cursor-pointer hover:bg-primary/10 group"
              )}
            >
              {step.type === "heading" && (
                <div className={cn("text-lg")}>{step.text}</div>
              )}
              {step.type === "speech" && <p>{step.text}</p>}
              {step.type === "pause" && (
                <p className="italic opacity-80">{step.duration}s pause</p>
              )}
            </div>
          ))
        ) : (
          <StepsSkeleton />
        )}
      </div>
      {/* Footer (fixed) */}
      <div className="bg-card z-10 shrink-0 px-4 py-3">
        <button className="bg-primary text-primary-foreground w-full rounded py-2 font-medium">
          Dummy Button
        </button>
      </div>
    </>
  );
}
