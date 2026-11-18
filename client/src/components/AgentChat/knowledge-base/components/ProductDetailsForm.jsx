import Button from "../../shared/ui/Button.jsx";
import { CheckIcon } from "../../shared/ui/Icons.jsx";
import { fieldCls, fieldOk } from "../../shared/ui/styles.js";
import RoleChips from "./RoleChips.jsx";

const inputCls = `${fieldCls} ${fieldOk} mt-1.5`;

export default function ProductDetailsForm({ form, setForm, dirty, saving, onSave }) {
  return (
    <section className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Name
        <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Description
        <textarea
          rows={7}
          className={inputCls}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Explain this product in plain language. The assistant reads this text."
        />
        <span className="mt-1.5 block text-xs font-normal text-gray-500">Changes are re-indexed within a few seconds of saving.</span>
      </label>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Who can ask about this</p>
        <RoleChips value={form.allowedRoles} onChange={(allowedRoles) => setForm({ ...form, allowedRoles })} />
      </div>
      <div className="flex items-center justify-end gap-3">
        {dirty && !saving && <span className="text-xs text-amber-600">Unsaved changes</span>}
        <Button onClick={onSave} loading={saving} disabled={!dirty || !form.name.trim()} icon={<CheckIcon />}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </section>
  );
}
