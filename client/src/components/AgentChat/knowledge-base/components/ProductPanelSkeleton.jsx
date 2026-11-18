import Skeleton from "../../shared/ui/Skeleton.jsx";

// Placeholder shown while a product is loading.
export default function ProductPanelSkeleton() {
  return (
    <div className="flex-1 space-y-6 overflow-hidden px-6 py-5" role="status" aria-label="Loading product">
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-14" />
          <Skeleton className="mt-2 h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-36 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-32 w-full rounded-2xl" />
        <Skeleton className="mt-3 h-16 w-full rounded-2xl" />
      </div>
    </div>
  );
}
