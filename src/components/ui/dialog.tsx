import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { gradientBackgroundClasses } from "@/components/layout/Layout";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-gray-950/80 backdrop-blur-xs",
        className
      )}
      {...props}
    />
  );
}

interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  headerContent?: React.ReactNode;
}

function DialogContent({
  className,
  children,
  headerContent,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Base styles: Fullscreen, flex column
          "fixed inset-0 z-50 flex h-full w-full flex-col border-0 bg-background p-0",
          // Responsive styles: Centered modal on md+
          "md:inset-auto md:left-[50%] md:top-[50%] md:h-auto md:max-h-[calc(100vh-4rem)] md:w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-lg md:border md:shadow-lg",
          "md:overflow-hidden", // Clip content like sticky header to rounded corners
          // Radix state animations
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "duration-200", // Animation duration
          gradientBackgroundClasses,
          className
        )}
        {...props}
      >
        {/* Sticky Header */}
        <div
          className={cn(
            // Layout & Appearance
            "sticky top-0 z-10 flex items-center justify-between border-b bg-background",
            // Padding
            "px-4 py-3 md:px-6 md:py-4"
          )}
        >
          <div className="flex flex-1 items-center">{headerContent}</div>
          <DialogPrimitive.Close
            className={cn(
              // Base styles & Icon size
              "rounded-xs opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none",
              "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
              // Focus & State
              "focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-background focus:ring-ring",
              "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>

        {/* Scrollable Content Area */}
        <div className={cn("flex-1 overflow-y-auto", "p-4 md:p-6")}>
          {children}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
