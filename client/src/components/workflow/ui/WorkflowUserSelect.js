import { inputCls } from "./ui";

// Plain dropdown. Swap for your shared UserSelect.jsx (avatar + name) if you like:
// keep the same props (users, value, onChange(id | null)).
export default function WorkflowUserSelect({
  users = [],
  value,
  onChange,
  placeholder = "Unassigned",
  disabled = false,
  className = "",
  ariaLabel = "Assigned user",
}) {
  return (
    <select
      aria-label={ariaLabel}
      disabled={disabled}
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={`${inputCls} ${className}`}
    >
      <option value="">{placeholder}</option>
      {users.map((u) => (
        <option key={u._id} value={u._id}>
          {u.name}
        </option>
      ))}
    </select>
  );
}