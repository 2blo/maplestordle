import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronsUp, ChevronsDown, X, PieChart } from "lucide-react";

import { cn } from "~/lib/utils";

const boxVariants = cva("", {
  variants: {
    variant: {
      correct: "bg-green-600",
      incorrect: "bg-red-600",
      higher: "bg-red-600",
      lower: "bg-red-600",
      partial: "bg-yellow-600",
    },
  },
  defaultVariants: {
    variant: "correct",
  },
});

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  asChild?: boolean;
  text: string;
}

const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        className={cn(boxVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        <div className="flex h-24 w-32 flex-col items-center p-4 text-center">
          {variant === "correct" ? (
            <Check />
          ) : variant === "higher" ? (
            <ChevronsUp />
          ) : variant === "lower" ? (
            <ChevronsDown />
          ) : variant === "partial" ? (
            <PieChart />
          ) : (
            <X />
          )}
          {props.text}
        </div>
      </Comp>
    );
  },
);
Box.displayName = "Box";

export { Box as Box, boxVariants as boxVariants };
