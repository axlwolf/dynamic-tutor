import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "danger";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
          variant === "default" && "bg-primary/10 text-primary",
          variant === "secondary" && "bg-muted text-muted-foreground",
          variant === "success" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
          variant === "danger" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
