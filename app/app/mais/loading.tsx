import { Skeleton } from "../skeleton";

export default function Loading() {
  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <Skeleton className="mb-5 h-7 w-24" />
        <Skeleton className="mb-3.5 h-[224px] w-full" />
        <Skeleton className="h-[60px] w-full" />
      </div>
    </div>
  );
}
