import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-fill-3 motion-reduce:animate-none', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-bg-3 shadow-e1" aria-hidden>
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  );
}
