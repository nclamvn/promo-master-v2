import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "px-2 py-0.5",
    "text-2xs font-semibold uppercase tracking-wide",
    "rounded border",
    "transition-colors",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-surface text-foreground border-surface-border",

        // Status variants
        draft: "bg-surface-hover text-foreground-muted border-surface-border",
        pending: "bg-warning-muted text-warning border-warning/30",
        approved: "bg-primary-muted text-primary border-primary/30",
        active: "bg-success-muted text-success border-success/30",
        completed: "bg-accent-muted text-accent border-accent/30",
        cancelled: "bg-danger-muted text-danger border-danger/30",
        rejected: "bg-danger-muted text-danger border-danger/30",
        paid: "bg-success-muted text-success border-success/30",

        // Semantic variants
        success: "bg-success-muted text-success border-success/30",
        warning: "bg-warning-muted text-warning border-warning/30",
        danger: "bg-danger-muted text-danger border-danger/30",
        info: "bg-primary-muted text-primary border-primary/30",

        // Legacy variants for compatibility
        secondary: "bg-surface text-foreground-muted border-surface-border",
        destructive: "bg-danger-muted text-danger border-danger/30",
        error: "bg-danger-muted text-danger border-danger/30",

        // Outline variants
        outline: "bg-transparent text-foreground border-surface-border",
        "outline-primary": "bg-transparent text-primary border-primary/50",
        "outline-success": "bg-transparent text-success border-success/50",
        "outline-warning": "bg-transparent text-warning border-warning/50",
        "outline-danger": "bg-transparent text-danger border-danger/50",
      },
      size: {
        default: "px-2 py-0.5 text-2xs",
        sm: "px-1.5 py-0 text-2xs",
        lg: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
