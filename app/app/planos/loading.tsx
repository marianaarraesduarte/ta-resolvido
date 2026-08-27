import { Skeleton } from "../skeleton";

export default function Loading() {
  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <Skeleton className="h-9 w-9 flex-shrink-0" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="mb-4 h-64 w-full rounded-[26px]" />
        <Skeleton className="h-64 w-full rounded-[26px]" />
      </div>
    </div>
  );
}
