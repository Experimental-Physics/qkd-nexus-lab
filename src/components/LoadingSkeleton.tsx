import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <Skeleton className="h-12 w-full bg-muted/50" />
      <Skeleton className="h-64 w-full bg-muted/50" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 bg-muted/50" />
        <Skeleton className="h-20 bg-muted/50" />
        <Skeleton className="h-20 bg-muted/50" />
      </div>
    </div>
  );
}
