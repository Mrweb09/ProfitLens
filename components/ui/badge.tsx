import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-violet-600 text-white hover:bg-violet-700",
        secondary: "border-transparent bg-white/10 text-white hover:bg-white/20",
        destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "text-white border-white/20",
        success: "border-transparent bg-green-600/20 text-green-400 border-green-500/30",
        warning: "border-transparent bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
        danger: "border-transparent bg-red-600/20 text-red-400 border-red-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
