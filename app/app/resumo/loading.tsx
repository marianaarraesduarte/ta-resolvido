import { Skeleton } from "../skeleton";

export default function Loading() {
  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 flex-shrink-0" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9 flex-shrink-0" />
        </div>
        <Skeleton className="mb-5 h-14 w-full" />
        <Skeleton className="mb-6 h-32 w-full" />
        <Skeleton className="mb-3.5 h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
