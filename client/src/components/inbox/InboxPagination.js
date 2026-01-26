export default function InboxPagination({ pagination, setFilters }) {
  if (!pagination.totalPages) return null;

  return (
    <div className="border-t px-4 py-2 flex justify-end gap-2 text-sm">
      <button
        disabled={pagination.page === 1}
        onClick={() =>
          setFilters((f) => ({ ...f, page: f.page - 1 }))
        }
      >
        Prev
      </button>

      <span>
        {pagination.page} / {pagination.totalPages}
      </span>

      <button
        disabled={pagination.page === pagination.totalPages}
        onClick={() =>
          setFilters((f) => ({ ...f, page: f.page + 1 }))
        }
      >
        Next
      </button>
    </div>
  );
}
