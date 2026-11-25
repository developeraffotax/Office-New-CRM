import Skeleton from "../../shared/ui/Skeleton.jsx";

// Placeholder for the main area while projects load.
export default function MainSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    </div>
  );
}
