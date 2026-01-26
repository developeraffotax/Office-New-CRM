import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function InboxPagination({ pagination, setFilters }) {
  if (!pagination.totalPages) return null;

  const { page, totalPages, totalDocs } = pagination;

  const handlePageChange = (newPage) => {
    setFilters((f) => ({ ...f, page: newPage }));
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
      {/* Left Side: Records Info */}
      <div className="hidden sm:block">
        <p className="text-sm text-gray-500">
          Showing page <span className="font-semibold text-gray-900">{page}</span> of{" "}
          <span className="font-semibold text-gray-900">{totalPages}</span>
        </p>
      </div>

      {/* Right Side: Controls */}
      <div className="flex items-center gap-3">
        {/* Previous Button */}
        <button
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          className={`flex items-center justify-center rounded-xl border border-gray-200 p-2 transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label="Previous page"
        >
          <FiChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        {/* Page Indicator (Modern Badge Style) */}
        <div className="flex h-9 min-w-[60px] items-center justify-center rounded-xl bg-gray-100 px-3 text-sm font-bold text-gray-700">
          {page} / {totalPages}
        </div>

        {/* Next Button */}
        <button
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
          className={`flex items-center justify-center rounded-xl border border-gray-200 p-2 transition-all hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label="Next page"
        >
          <FiChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}