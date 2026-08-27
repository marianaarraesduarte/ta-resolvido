import { Skeleton } from "../skeleton";

export default function Loading() {
  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 flex-shrink-0" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="mb-5 h-12 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
