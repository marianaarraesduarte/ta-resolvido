import { Skeleton } from "../skeleton";

export default function Loading() {
  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 flex-shrink-0" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="mb-6 h-16 w-full" />
        <Skeleton className="mb-6 h-24 w-full" />
        <Skeleton className="mb-6 h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
