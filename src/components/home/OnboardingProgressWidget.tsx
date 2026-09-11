import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";
import { useGetPhases } from "@/services/api/milestone.api";

const OnboardingProgressWidget = () => {
  const { data, isLoading } = useGetPhases();
  const phases = data?.data?.items || [];

  if (isLoading || phases.length === 0) return null;

  // All checkpoints across all onboarding phases, in order, flattened into one step list
  const steps = phases
    .slice()
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    .flatMap((phase: any) => phase.checkpoints || []);

  if (steps.length === 0) return null;

  const completedCount = steps.filter((s: any) => s.status === "approved").length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Onboarding Progress
        </CardTitle>
        <CardDescription>
          {completedCount} of {steps.length} steps complete
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="space-y-2 pt-1">
          {steps.map((step: any, idx: number) => {
            const done = step.status === "approved";
            return (
              <div key={step._id || idx} className="flex items-center gap-2 text-sm">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={done ? "text-foreground" : "text-muted-foreground"}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingProgressWidget;
