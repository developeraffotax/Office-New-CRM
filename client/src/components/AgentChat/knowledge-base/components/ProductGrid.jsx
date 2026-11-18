import Skeleton from "../../shared/ui/Skeleton.jsx";
import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products, loading, projectName, onOpen, onDelete }) {
  if (loading && products.length === 0)
    return (
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading products">
        {[1, 2, 3].map((i) => (
          <li key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
            <Skeleton className="mt-2 h-3 w-2/3" />
            <Skeleton className="mt-6 h-3 w-24" />
          </li>
        ))}
      </ul>
    );

  if (products.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-600">
        No products in {projectName} yet. Add one, like Payroll, then attach its description and documents.
      </div>
    );

  return (
    <ul className={`grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
      {products.map((p) => (
        <ProductCard key={p._id} p={p} onOpen={onOpen} onDelete={onDelete} />
      ))}
    </ul>
  );
}
