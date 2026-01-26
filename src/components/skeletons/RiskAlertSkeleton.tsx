import { Skeleton } from '@/components/ui/skeleton';

export function RiskAlertSkeleton() {
  return (
    <div className="w-full p-3 rounded-xl border bg-muted/20 border-border/50 flex items-center gap-3 mb-4">
      <Skeleton className="w-5 h-5 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="w-4 h-4 shrink-0" />
    </div>
  );
}
