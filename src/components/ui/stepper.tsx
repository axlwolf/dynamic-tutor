import * as React from "react";
import { cn } from "@/lib/utils";

export interface Step {
  label: string;
  description?: string;
}

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  currentStep?: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep = 0, className, ...props }) => {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-start gap-3">
          <div className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full border-2",
            idx === currentStep ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground"
          )}>
            {idx + 1}
          </div>
          <div>
            <div className={cn("font-semibold", idx === currentStep ? "text-primary" : "text-foreground")}>{step.label}</div>
            {step.description && (
              <div className="text-sm text-muted-foreground mt-1">{step.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
