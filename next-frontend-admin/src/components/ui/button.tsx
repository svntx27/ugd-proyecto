import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs active:scale-[0.98] font-semibold",
        pastel: "bg-accent text-accent-foreground hover:bg-accent-hover border border-accent-border font-semibold",
        gold: "bg-gold text-gold-foreground hover:bg-gold-hover shadow-xs active:scale-[0.98] font-semibold",
        pastelEmerald: "bg-success-bg text-success hover:bg-success-hover border border-success-border font-semibold",
        pastelAmber: "bg-role-director-bg text-role-director hover:bg-role-director-bg-hover border border-role-director-border font-semibold",
        pastelRose: "bg-destructive-bg text-destructive-text hover:bg-destructive-bg-hover border border-destructive-border font-semibold",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-xs active:scale-[0.98]",
        outline: "border border-border bg-card text-foreground-soft hover:bg-surface-subtle hover:text-foreground shadow-2xs",
        secondary: "bg-surface-hover text-foreground-soft hover:bg-surface-active",
        ghost: "hover:bg-surface-hover text-foreground-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 rounded-lg px-2.5 text-xs",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-6 text-base",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
