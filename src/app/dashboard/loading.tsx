import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-1/4 max-w-xs" />
        <Skeleton className="h-4 w-1/3 max-w-sm" />
      </div>

      {/* KPI Cards Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
}
