import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "./Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <Skeleton className="h-6 w-24 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </header>

      <div className="px-4 py-2">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="flex gap-1 border-b border-white/10 px-4 py-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-12 w-full rounded-lg" />

        <div className="flex justify-center">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}
