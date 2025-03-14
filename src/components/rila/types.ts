import type { FormattedScript } from "@/lib/meditation-formatter";

// Define types for the component props
export interface RilaFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Re-export FormattedScript type for convenience
export type { FormattedScript };
