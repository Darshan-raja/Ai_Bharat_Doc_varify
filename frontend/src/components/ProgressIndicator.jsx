import { CheckCircle, Circle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProgressIndicator({ steps = [], currentStep = 0, loading = false }) {
  return (
    <div className="progress-container py-8">
      <div className="flex items-center justify-between relative">
        {/* Background Lines */}
        {steps.length > 1 && (
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted z-0">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        )}

        {/* Steps */}
        <div className="relative z-10 flex items-center justify-between w-full gap-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 group"
              >
                <div
                  className={`step-indicator relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-3 ${
                    isCompleted
                      ? "bg-success text-white scale-100"
                      : isCurrent
                      ? "bg-primary text-white ring-4 ring-primary/30 scale-110"
                      : "bg-muted text-muted-foreground scale-100"
                  } ${isCurrent ? "animate-pulse-glow" : ""}`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 animate-scale-in" />
                  ) : isCurrent && loading ? (
                    <Clock className="w-6 h-6 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>

                <div className="text-center w-full">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                  {step.duration && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {step.duration}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProgressIndicator;
