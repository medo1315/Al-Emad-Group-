import { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "default";
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  const variants = {
    success: "bg-sage-green/20 text-sage-green border border-sage-green/30",
    warning: "bg-gold-accent/20 text-earth-brown border border-gold-accent/30",
    error: "bg-destructive/20 text-destructive border border-destructive/30",
    info: "bg-olive-green/20 text-olive-green border border-olive-green/30",
    default: "bg-warm-sand text-dark-olive border border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
