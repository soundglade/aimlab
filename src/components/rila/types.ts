// Define types for meditation structure
export interface MeditationSection {
  type: string;
  title?: string;
  content?: string | never[];
  number?: number;
  duration?: number;
}

export interface StructuredMeditation {
  title: string;
  sections: MeditationSection[];
}

// Define types for the component props
export interface RilaFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
