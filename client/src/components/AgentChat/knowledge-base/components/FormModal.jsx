import { useState } from "react";
import Modal from "../../shared/ui/Modal.jsx";
import Button from "../../shared/ui/Button.jsx";
import { fieldCls, fieldOk } from "../../shared/ui/styles.js";
import RoleChips from "./RoleChips.jsx";

const inputCls = `${fieldCls} ${fieldOk} mt-1.5`;

export default function FormModal({ kind, initial, onSubmit, onClose }) {
  const isProduct = kind === "product";
  const [form, setForm] = useState({ name: "", description: "", allowedRoles: [], ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  const title = initial?._id ? `Edit ${kind}` : `New ${kind}`;
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Name
          <input
            autoFocus
            required
            className={inputCls}
            value={form.name}
            onChange={set("name")}
            placeholder={isProduct ? "Payroll" : "Accounting"}
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Description {!isProduct && <span className="font-normal text-gray-400">(optional)</span>}
          <textarea
            rows={isProduct ? 6 : 3}
            className={inputCls}
            value={form.description}
            onChange={set("description")}
            placeholder={
              isProduct
                ? "What this product is, how it works, rules and common questions. The assistant reads this text."
                : "What this project covers"
            }
          />
        </label>
        {isProduct && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Who can ask about this</p>
            <RoleChips value={form.allowedRoles} onChange={(allowedRoles) => setForm((f) => ({ ...f, allowedRoles }))} />
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!form.name.trim()}>
            {saving ? "Saving…" : initial?._id ? "Save changes" : isProduct ? "Create product" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
