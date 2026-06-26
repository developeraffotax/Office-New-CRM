import { useRef, useState, useMemo, useEffect } from "react"
import { useClickOutside } from "../../../utlis/useClickOutside"

export const UsersList = ({ users, handleAssignUser, notification, onClose }) => {
  const ref = useRef()
  const inputRef = useRef()
  const [search, setSearch] = useState("")

  useClickOutside(ref, () => {
    onClose()
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users || []
    return (users || []).filter((u) =>
      u.name?.toLowerCase().includes(search.trim().toLowerCase())
    )
  }, [users, search])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredUsers.length > 0) {
      e.preventDefault()
      handleAssignUser(notification, filteredUsers[0]._id)
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      ref={ref}
      className="absolute right-0 z-50 mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
    >
      <div className="p-1.5 border-b border-gray-100">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search user..."
          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
        />
      </div>

      <div className="max-h-72 overflow-y-auto p-1">
        {filteredUsers.length ? (
          <div className="py-0.5 divide-y divide-gray-200">
            {filteredUsers.map((u, i) => (
              <button
                key={u._id}
                onClick={() => handleAssignUser(notification, u._id)}
                className={`w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 disabled:opacity-40 ${
                  i === 0 && search.trim() ? "bg-orange-50" : ""
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="px-3 py-3 text-center">
            <p className="text-xs font-medium text-gray-400">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}