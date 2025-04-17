import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface ReadingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: string | null;
}

export function ReadingDrawer({
  open,
  onOpenChange,
  response,
}: ReadingDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex h-[calc(100vh-80px)] flex-col p-0">
        {/* Header (fixed) */}
        <div className="bg-card z-10 shrink-0 border-b px-4 py-3">
          <div className="text-lg font-semibold">Dummy Title</div>
        </div>
        {/* Main scrollable content */}
        <div className="bg-background flex-1 overflow-auto px-4 py-2">
          {response && (
            <div className="bg-muted mb-2 rounded p-2">{response}</div>
          )}
        </div>
        {/* Footer (fixed) */}
        <div className="bg-card z-10 shrink-0 border-t px-4 py-3">
          <button className="bg-primary text-primary-foreground w-full rounded py-2 font-medium">
            Dummy Button
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
