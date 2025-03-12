import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { cn } from "@/lib/utils";

interface ActiveCardProps extends React.ComponentProps<typeof Card> {
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

function ActiveCard({
  className,
  onClick,
  disabled = false,
  children,
  ...props
}: ActiveCardProps) {
  return (
    <Card
      className={cn(
        disabled
          ? "opacity-70 cursor-not-allowed pointer-events-none"
          : "cursor-pointer hover:border-primary/50",
        className
      )}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </Card>
  );
}

// Re-export the card subcomponents for convenience
export {
  ActiveCard,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
