import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-secondary text-gray-600 hover:secondary-hover",
        outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-900",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<React.Ref<HTMLButtonElement | HTMLAnchorElement>, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp: React.ElementType = asChild ? "a" : "button";
    return (
      <Comp
        className={[
          buttonVariants({ variant, size }),
          className,
        ].join(" ")}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
