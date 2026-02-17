import { useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Pagination({ pagination, setFilters }) {
  // 1. Define the handler first
  const handlePageChange = (newPage) => {
    if (pagination?.totalPages && newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters({ page: newPage });
    }
  };

  // 2. Call the Hook BEFORE any early returns
  useEffect(() => {
    // Only attach listener if pagination data actually exists
    if (!pagination || !pagination.totalPages) return;

    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

      const key = e.key.toLowerCase();
      if (key === "n") handlePageChange(pagination.page + 1);
      if (key === "p") handlePageChange(pagination.page - 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pagination]); // Use optional chaining here too

  // 3. NOW you can do the early return
  if (!pagination || !pagination.totalPages) return null;

  const { page, totalPages, total, limit = 20 } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
      {/* Left Side: Records Info */}
      <div className="hidden sm:block">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{from}</span> to{" "}
          <span className="font-semibold text-gray-900">{to}</span> of{" "}
          <span className="font-semibold text-gray-900">{total}</span> results
        </p>
      </div>

      {/* Right Side: Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            disabled={page === 1}
            title="Press P for previous page"
            onClick={() => handlePageChange(page - 1)}
            className="group relative flex items-center justify-center rounded-xl border border-gray-200 p-2 transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <FiChevronLeft className="h-5 w-5 text-gray-600" />
            {/* <kbd className="absolute -top-9 hidden rounded border bg-white px-2 py-0.5 text-[10px] font-medium text-gray-400 shadow-sm group-hover:block transition-all">P</kbd> */}
          </button>

          {/* Page Indicator Badge */}
          <div className="flex h-10 min-w-[90px] flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-100 px-3 text-xs font-bold text-gray-700">
            <span className="text-[9px] uppercase tracking-widest text-gray-400">Page</span>
            <span className="text-sm">{page} / {totalPages}</span>
          </div>

          {/* Next Button */}
          <button
          title="Press N for next page"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="group relative flex items-center justify-center rounded-xl border border-gray-200 p-2 transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <FiChevronRight className="h-5 w-5 text-gray-600" />
            {/* <kbd className="absolute -top-9 hidden rounded border bg-white px-2 py-0.5 text-[10px] font-medium text-gray-400 shadow-sm group-hover:block transition-all">N</kbd> */}
          </button>
        </div>
      </div>
    </div>
  );
}