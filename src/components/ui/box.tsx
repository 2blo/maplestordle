import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronsUp, ChevronsDown, X, PieChart } from "lucide-react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  text?: string;
  mapMarks?: { name: string; icon: string }[];
}

function gridSpan(nIcons: number, index: number) {
  if (nIcons === 1) {
    return 6;
  }
  if (nIcons === 2) {
    return 3;
  }
  if (nIcons === 3) {
    return 2;
  }
  if (nIcons === 4) {
    return 3;
  }
  if (nIcons === 5) {
    if (index < 3) {
      return 2;
    }
    return 3;
  }
  return 2;
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
        <div className="flex h-32 w-32 flex-col items-center gap-2 p-3 text-center">
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
          {props.text ? props.text : ""}
          <div className="grid grid-cols-6 justify-items-center gap-1 bg-blue-500">
            {props.mapMarks?.map((mapMark, index) => (
              <div
                key={index}
                className={`flex flex-row col-span-${gridSpan(props.mapMarks?.length ?? 0, index)} bg-yellow-500`}
              >
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Image
                        src={`data:image/png;base64,${mapMark.icon}`}
                        width={32}
                        height={32}
                        alt={mapMark.name}
                        style={{ imageRendering: "pixelated" }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{mapMark.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>
      </Comp>
    );
  },
);
Box.displayName = "Box";

export { Box as Box, boxVariants as boxVariants };
