import { Check, Clock, ChefHat, Bell, PackageCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "pending", label: "Received", icon: Clock },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Bell },
  { key: "completed", label: "Completed", icon: PackageCheck },
] as const;

export function OrderStatusTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm">
        <XCircle className="h-4 w-4" />
        <span className="uppercase tracking-[0.2em] text-xs">Cancelled</span>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1 w-full">
      {STEPS.map((step, idx) => {
        const reached = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const Icon = reached && !isCurrent ? Check : step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-8 w-8 rounded-full border flex items-center justify-center transition-all",
                  reached
                    ? "bg-primary text-primary-foreground border-primary shadow-gold"
                    : "bg-card text-muted-foreground border-border",
                  isCurrent && "ring-2 ring-primary/40 animate-pulse"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-[0.15em] whitespace-nowrap",
                  reached ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-1 -mt-5 transition-colors",
                  idx < currentIdx ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
