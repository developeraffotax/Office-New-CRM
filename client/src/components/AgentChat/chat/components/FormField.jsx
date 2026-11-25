import { fieldCls, fieldOk, fieldBad } from "../../shared/ui/styles.js";

// One field of a drafted form. `error` is the message to show (validation error or "missing").
export default function FormField({ field: f, formId, value, onChange, error, source }) {
  const common = {
    id: `f-${formId}-${f.name}`,
    value: value ?? "",
    onChange: (e) => onChange(f.name, e.target.value),
    className: `${fieldCls} ${error ? fieldBad : fieldOk}`,
  };
  return (
    <div className={f.type === "textarea" ? "sm:col-span-2" : ""}>
      <label htmlFor={common.id} className="mb-1 block text-xs font-medium text-gray-700">
        {f.label}
        {f.required && <span className="text-red-500"> *</span>}
      </label>
      {f.type === "select" ? (
        <select {...common}>
          <option value="">Select…</option>
          {f.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : f.type === "textarea" ? (
        <textarea rows={3} {...common} />
      ) : f.type === "boolean" ? (
        <select {...common} value={value === undefined ? "" : String(value)}>
          <option value="">Not set</option>
          <option value="true">Yes / ticked</option>
          <option value="false">No / unticked</option>
        </select>
      ) : (
        <input type={{ number: "text", date: "date", email: "email" }[f.type] || "text"} inputMode={f.type === "number" ? "decimal" : undefined} {...common} />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {source && !error && <p className="mt-1 text-xs text-gray-400">From: {source}</p>}
    </div>
  );
}
