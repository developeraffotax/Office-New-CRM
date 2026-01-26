export default function InboxFilters({ filters, setFilters }) {
  return (
    <div className="flex gap-2 px-4 py-2 border-b bg-gray-50">
      <select
        className="border px-2 py-1 rounded"
        value={filters.category}
        onChange={(e) =>
          setFilters({ ...filters, category: e.target.value, page: 1 })
        }
      >
        <option value="">All</option>
        <option value="support">Support</option>
        <option value="lead">Lead</option>
        <option value="client">Client</option>
        <option value="other">Other</option>
      </select>

      <input
        type="date"
        onChange={(e) =>
          setFilters({ ...filters, startDate: e.target.value, page: 1 })
        }
      />

      <input
        type="date"
        onChange={(e) =>
          setFilters({ ...filters, endDate: e.target.value, page: 1 })
        }
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.unreadOnly}
          onChange={(e) =>
            setFilters({ ...filters, unreadOnly: e.target.checked, page: 1 })
          }
        />
        Unread
      </label>
    </div>
  );
}
