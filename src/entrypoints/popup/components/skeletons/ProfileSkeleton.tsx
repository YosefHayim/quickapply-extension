import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "./Skeleton";

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

function SectionSkeleton({ fieldCount = 3 }: { fieldCount?: number }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <FieldSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex h-full flex-col bg-zinc-950">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <SectionSkeleton fieldCount={4} />
        <SectionSkeleton fieldCount={3} />
        <SectionSkeleton fieldCount={2} />
        <SectionSkeleton fieldCount={2} />
        <SectionSkeleton fieldCount={3} />
      </div>

      <div className="border-t border-white/10 p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
