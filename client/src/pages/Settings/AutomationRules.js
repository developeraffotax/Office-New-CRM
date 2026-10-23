import { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiLoader,
  FiCheck,
  FiTrash2,
  FiEdit2,
  FiPlus,
  FiX,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

const API = `${process.env.REACT_APP_API_URL}/api/v1/automation-rules`;

const FIELDS = {
  email: [
    // { value: "type", label: "Source type" },
    { value: "companyName", label: "Company name" },
    { value: "from", label: "Sender email" },
    { value: "fromName", label: "Sender name" },
    { value: "subject", label: "Subject" },
    { value: "to", label: "Sent to email" },
    // { value: "snippet", label: "Message preview" },
    // { value: "hasAttachments", label: "Has attachments" },
  ],
  whatsapp: [
    { value: "companyName", label: "Company name" },
    { value: "phone", label: "Phone number" },
    { value: "profileName", label: "Profile name" },
    { value: "message", label: "First message" },
  ],
};

const FIELD_LABEL = Object.fromEntries(
  [...FIELDS.email, ...FIELDS.whatsapp].map((f) => [f.value, f.label]),
);

const OPERATORS = [
  { value: "equals", label: "is" },
  { value: "not_equals", label: "is not" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "starts_with", label: "starts with" },
  { value: "ends_with", label: "ends with" },
  { value: "one_of", label: "is one of (comma separated)" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];
const OP_LABEL = Object.fromEntries(OPERATORS.map((o) => [o.value, o.label]));
const NO_VALUE_OPS = ["is_empty", "is_not_empty"];

const STRATEGIES = [
  { value: "fixed", label: "Assign to this user" },
  // { value: "fixed", label: "Always the same user" },
  // { value: "round_robin", label: "Rotate between users" },
  // { value: "random", label: "Pick a random user" },
];

const emptyLeaf = (channel) => ({
  field: FIELDS[channel][0].value,
  op: "contains",
  value: "",
});
const emptyGroup = (channel, operator = "AND") => ({
  operator,
  items: [emptyLeaf(channel)],
});

const describeGroup = (g) => {
  if (!g?.items?.length) return "Every new item";
  const parts = g.items.map((i) =>
    i.items
      ? `(${describeGroup(i)})`
      : `${FIELD_LABEL[i.field] || i.field} ${OP_LABEL[i.op] || i.op}${
          NO_VALUE_OPS.includes(i.op) ? "" : ` "${i.value}"`
        }`,
  );
  return parts.join(g.operator === "OR" ? " OR " : " AND ");
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? "#f97316" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 1px #f97316" : "none",
    "&:hover": { borderColor: state.isFocused ? "#f97316" : "#d1d5db" },
    borderRadius: "0.5rem",
    padding: "2px",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "0.375rem",
  }),
  multiValueLabel: (base) => ({ ...base, color: "#c2410c", fontWeight: 500 }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#ea580c",
    "&:hover": { backgroundColor: "#ffedd5", color: "#9a3412" },
  }),
};

const inputCls =
  "border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

/* ------------------------------------------------------------------ */
/* Condition builder                                                  */
/* ------------------------------------------------------------------ */

function LeafRow({ leaf, channel, onChange, onRemove }) {
  const needsValue = !NO_VALUE_OPS.includes(leaf.op);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={leaf.field}
        onChange={(e) => onChange({ ...leaf, field: e.target.value, value: "" })}
        className={inputCls}
      >
        {FIELDS[channel].map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <select
        value={leaf.op}
        onChange={(e) => onChange({ ...leaf, op: e.target.value })}
        className={inputCls}
      >
        {OPERATORS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {needsValue &&
        (leaf.field === "hasAttachments" ? (
          <select
            value={leaf.value}
            onChange={(e) => onChange({ ...leaf, value: e.target.value })}
            className={inputCls}
          >
            <option value="">Choose…</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        ) : (
          <input
            value={leaf.value}
            onChange={(e) => onChange({ ...leaf, value: e.target.value })}
            placeholder="Value"
            className={`${inputCls} flex-1 min-w-[160px]`}
          />
        ))}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove condition"
        className="text-gray-400 hover:text-red-600 transition-colors p-1"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
}

function ConditionGroup({ group, channel, onChange, onRemove, depth = 0 }) {
  const setItem = (i, item) =>
    onChange({ ...group, items: group.items.map((x, idx) => (idx === i ? item : x)) });
  const removeItem = (i) =>
    onChange({ ...group, items: group.items.filter((_, idx) => idx !== i) });
  const addItem = (item) => onChange({ ...group, items: [...group.items, item] });

  return (
    <div
      className={`rounded-lg border p-3 space-y-2.5 ${
        depth ? "border-orange-200 bg-orange-50/40" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          Match
          <select
            value={group.operator}
            onChange={(e) => onChange({ ...group, operator: e.target.value })}
            className={inputCls}
          >
            <option value="AND">all of these (AND)</option>
            <option value="OR">any of these (OR)</option>
          </select>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Remove group
          </button>
        )}
      </div>

      {group.items.length === 0 && (
        <p className="text-xs text-gray-500">
          No conditions — this rule matches every new item.
        </p>
      )}

      {group.items.map((item, i) =>
        item.items ? (
          <ConditionGroup
            key={i}
            group={item}
            channel={channel}
            depth={depth + 1}
            onChange={(g) => setItem(i, g)}
            onRemove={() => removeItem(i)}
          />
        ) : (
          <LeafRow
            key={i}
            leaf={item}
            channel={channel}
            onChange={(l) => setItem(i, l)}
            onRemove={() => removeItem(i)}
          />
        ),
      )}

      <div className="flex gap-4 text-sm font-medium">
        <button
          type="button"
          onClick={() => addItem(emptyLeaf(channel))}
          className="text-orange-600 hover:text-orange-700"
        >
          + Add condition
        </button>
        {depth < 2 && (
          <button
            type="button"
            onClick={() =>
              addItem(emptyGroup(channel, group.operator === "AND" ? "OR" : "AND"))
            }
            className="text-orange-600 hover:text-orange-700"
          >
            + Add group
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rule editor                                                        */
/* ------------------------------------------------------------------ */

function RuleEditor({ rule, channel, userOptions, categoryOptions, onCancel, onSaved }) {
  const isEdit = Boolean(rule?._id);
  const assign = rule?.actions?.assign;

  const [name, setName] = useState(rule?.name || "");
  const [conditions, setConditions] = useState(rule?.conditions || emptyGroup(channel));
  const [strategy, setStrategy] = useState(assign?.strategy || "fixed");
  const [assigned, setAssigned] = useState(
    userOptions.filter((u) => assign?.users?.includes(u.value)),
  );
  const [category, setCategory] = useState(rule?.actions?.category || "");
  const [stopOnMatch, setStopOnMatch] = useState(rule?.stopOnMatch ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedCategory =
    categoryOptions.find((o) => o.value === category) ||
    (category ? { value: category, label: category } : null);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Give the rule a name.");
    if (!assigned.length && !category.trim()) {
      return toast.error("Pick at least one user or a category.");
    }

    const payload = {
      name,
      channel,
      stopOnMatch,
      conditions,
      actions: {
        category,
        assign: { strategy, users: assigned.map((u) => u.value) },
      },
    };

    setIsSaving(true);
    try {
      const res = isEdit
        ? await axios.put(`${API}/${rule._id}`, payload)
        : await axios.post(API, payload);
      toast.success(isEdit ? "Rule updated." : "Rule created.");
      onSaved(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save rule.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-gray-200/80 bg-gray-50/30 rounded-xl p-6 mb-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rule name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={channel === "email" ? "e.g. Govt Gateway emails" : "e.g. VAT enquiries"}
          className={`${inputCls} w-full`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">When</label>
        <ConditionGroup group={conditions} channel={channel} onChange={setConditions} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Then</label>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <select
              value={strategy}
              onChange={(e) => {
                setStrategy(e.target.value);
                if (e.target.value === "fixed") setAssigned((a) => a.slice(0, 1));
              }}
              className={inputCls}
            >
              {STRATEGIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <Select
              options={userOptions}
              value={strategy === "fixed" ? assigned[0] || null : assigned}
              isMulti={strategy !== "fixed"}
              closeMenuOnSelect={strategy === "fixed"}
              onChange={(v) =>
                setAssigned(strategy === "fixed" ? (v ? [v] : []) : v || [])
              }
              placeholder="Assign to…"
              styles={selectStyles}
              className="text-sm"
              isClearable
            />
          </div>

          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={(v) => setCategory(v ? v.value : "")}
            placeholder="Apply category (optional)"
            styles={selectStyles}
            className="text-sm"
            isClearable
          />
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={stopOnMatch}
          onChange={(e) => setStopOnMatch(e.target.checked)}
          className="mt-0.5 accent-orange-600"
        />
        <span>
          Stop checking other rules once this one matches
          <span className="block text-xs text-gray-400">
            Turn off to let rules further down fill in a user or category this rule left empty.
          </span>
        </span>
      </label>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200/60">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-gray-600 hover:text-gray-800 px-3 py-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
        >
          {isSaving ? (
            <>
              <FiLoader className="animate-spin h-4 w-4" />
              Saving...
            </>
          ) : (
            <>
              <FiCheck className="h-4 w-4" />
              Save rule
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function AutomationRules() {
  const [channel, setChannel] = useState("email");
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} (new) | rule

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rulesRes, usersRes] = await Promise.all([
        axios.get(API),
        axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`),
      ]);
      if (rulesRes.data?.success) setRules(rulesRes.data.data);
      if (usersRes.data?.users) setUsers(usersRes.data.users);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load rules.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch categories for the active channel
  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const url =
          channel === "email"
            ? `${process.env.REACT_APP_API_URL}/api/v1/gmail/category`
            : `${process.env.REACT_APP_API_URL}/api/v1/whatsapp/category`;
        const res = await axios.get(url);
        const list = res.data?.categories ?? res.data?.data ?? res.data ?? [];
        if (!cancelled) setCategories(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error(error);
        if (!cancelled) setCategories([]);
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [channel]);

  const userOptions = useMemo(() => {
    const permission = channel === "email" ? "Inbox" : "Whatsapp";
    return users
      .filter((u) => u.role?.access?.some((a) => a?.permission?.includes(permission)))
      .map((u) => ({ value: u._id, label: u.name }));
  }, [users, channel]);

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.name ?? c._id ?? c.id,
        label: c.name ?? c.title ?? c.label ?? "Unnamed",
      })),
    [categories],
  );

  const userName = useMemo(
    () => Object.fromEntries(users.map((u) => [u._id, u.name])),
    [users],
  );

  const channelRules = useMemo(
    () =>
      rules
        .filter((r) => r.channel === channel)
        .sort((a, b) => a.priority - b.priority),
    [rules, channel],
  );

  const upsertLocal = (rule) => {
    setRules((prev) =>
      prev.some((r) => r._id === rule._id)
        ? prev.map((r) => (r._id === rule._id ? rule : r))
        : [...prev, rule],
    );
    setEditing(null);
  };

  const toggleEnabled = async (rule) => {
    try {
      const res = await axios.put(`${API}/${rule._id}`, { enabled: !rule.enabled });
      upsertLocal(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update rule.");
    }
  };

  const move = async (index, dir) => {
    const next = [...channelRules];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];

    // optimistic: rewrite local priorities to match the new order
    const priorities = new Map(next.map((r, i) => [r._id, (i + 1) * 10]));
    const previous = rules;
    setRules((prev) =>
      prev.map((r) => (priorities.has(r._id) ? { ...r, priority: priorities.get(r._id) } : r)),
    );

    try {
      await axios.put(`${API}/reorder`, { channel, ids: next.map((r) => r._id) });
    } catch (error) {
      setRules(previous);
      toast.error("Failed to reorder rules.");
    }
  };

  const remove = async (rule) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete this rule?",
      text: rule.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it",
    });
    if (!isConfirmed) return;

    try {
      await axios.delete(`${API}/${rule._id}`);
      setRules((prev) => prev.filter((r) => r._id !== rule._id));
      toast.success("Rule removed.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove rule.");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
        <div className="h-28 bg-gray-100 rounded-xl mb-6"></div>
        <div className="h-28 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Automatic Assignment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rules run top to bottom when a new {channel === "email" ? "email thread" : "WhatsApp chat"} arrives.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing({})}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <FiPlus className="h-4 w-4" />
            New rule
          </button>
        )}
      </div>

      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {[
          { value: "email", label: "Email" },
          { value: "whatsapp", label: "WhatsApp" },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setChannel(t.value);
              setEditing(null);
            }}
            className={`pb-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              channel === t.value
                ? "border-orange-500 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {editing && (
        <RuleEditor
          key={editing._id || "new"}
          rule={editing}
          channel={channel}
          userOptions={userOptions}
          categoryOptions={categoryOptions}
          onCancel={() => setEditing(null)}
          onSaved={upsertLocal}
        />
      )}

      {!channelRules.length && !editing && (
        <p className="text-sm text-gray-500">
          No {channel} rules yet. Create one to start assigning new items automatically.
        </p>
      )}

      {channelRules.map((rule, index) => {
        const names = (rule.actions?.assign?.users || []).map((id) => userName[id] || "Unknown user");
        const strategyLabel = STRATEGIES.find((s) => s.value === rule.actions?.assign?.strategy)?.label;

        return (
          <div
            key={rule._id}
            className={`border border-gray-200/80 rounded-xl p-5 mb-4 transition-colors ${
              rule.enabled ? "bg-gray-50/30" : "bg-gray-100/60"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2
                  className={`text-base font-semibold ${
                    rule.enabled ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {rule.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1 break-words">
                  <span className="text-gray-400">When </span>
                  {describeGroup(rule.conditions)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-gray-400">Then </span>
                  {names.length ? `${strategyLabel?.toLowerCase()}: ${names.join(", ")}` : "no assignment"}
                  {rule.actions?.category ? ` · category "${rule.actions.category}"` : ""}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                >
                  <FiArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === channelRules.length - 1}
                  aria-label="Move down"
                  className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                >
                  <FiArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(rule)}
                  aria-label="Edit rule"
                  className="p-1.5 text-gray-400 hover:text-orange-600"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(rule)}
                  aria-label="Delete rule"
                  className="p-1.5 text-gray-400 hover:text-red-600"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
                <label className="ml-2 flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleEnabled(rule)}
                    className="accent-orange-600"
                  />
                  On
                </label>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}