import * as React from "react";
import { cn } from "@/lib/utils";

interface AutoResizeTextareaProps extends React.ComponentProps<"textarea"> {
  className?: string;
}

const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ className, value, onChange, ...props }, ref) => {
  const [textValue, setTextValue] = React.useState(value || "");

  // Update internal state when value prop changes
  React.useEffect(() => {
    setTextValue(value || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTextValue(newValue);
    onChange?.(e);
  };

  return (
    <div
      className={cn("textarea-auto-resize", className)}
      data-replicated-value={textValue}
    >
      <textarea
        ref={ref}
        value={textValue}
        onChange={handleChange}
        data-slot="textarea"
        className={cn(
          "placeholder:text-muted-foreground flex min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base disabled:cursor-not-allowed disabled:opacity-50 md:text-sm outline-none border-none focus:outline-none focus:ring-0 focus:border-none"
        )}
        {...props}
      />
    </div>
  );
});

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export { AutoResizeTextarea };
