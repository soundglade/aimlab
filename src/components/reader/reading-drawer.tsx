import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface ReadingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: any | null;
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
        <div className="shrink-0 border-b px-4 py-3 bg-card z-10">
          <div className="text-lg font-semibold">Dummy Title</div>
        </div>
        {/* Main scrollable content */}
        <div className="flex-1 overflow-auto px-4 py-2 bg-background">
          {response && (
            <div className="bg-muted mb-2 rounded p-2">
              {JSON.stringify(response, null, 2)}
            </div>
          )}
        </div>
        {/* Footer (fixed) */}
        <div className="shrink-0 border-t px-4 py-3 bg-card z-10">
          <button className="w-full rounded bg-primary text-primary-foreground py-2 font-medium">
            Dummy Button
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
