import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLMotionProps<"div"> & { strong?: boolean };

export const GlassCard = forwardRef<HTMLDivElement, Props>(
  ({ className, strong, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(strong ? "glass-strong" : "glass", "rounded-3xl", className)}
      {...props}
    />
  ),
);
GlassCard.displayName = "GlassCard";
