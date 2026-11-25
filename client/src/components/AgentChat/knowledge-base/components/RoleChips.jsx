import useRoles from "../hooks/useRoles.js";
import Skeleton from "../../shared/ui/Skeleton.jsx";
import { CheckIcon } from "../../shared/ui/Icons.jsx";

export default function RoleChips({ value, onChange }) {
  const { roles, loading } = useRoles();
  const toggle = (r) => onChange(value.includes(r) ? value.filter((x) => x !== r) : [...value, r]);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {loading && [1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
        {roles.map((r) => {
          const on = value.includes(r);
          return (
            <button
              key={r}
              type="button"
              onClick={() => toggle(r)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm capitalize transition focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-100 ${
                on ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {on && <CheckIcon className="h-3.5 w-3.5" />}
              {r}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {value.length ? "Only these roles can get answers from this product." : "No roles selected: everyone can get answers from this product."}
      </p>
    </div>
  );
}
