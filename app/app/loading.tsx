import { Skeleton } from "./skeleton";

export default function Loading() {
  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-5">
          <Skeleton className="mb-2 h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="mb-4 h-[190px] w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}
