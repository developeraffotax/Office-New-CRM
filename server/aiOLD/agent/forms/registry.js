// ai/agent/forms/registry.js
// Forms the AI is allowed to DRAFT. The AI fills values; a person reviews and submits.
// Register each form once, with its fields and a submit() that calls your existing service.
//
// registerForm({
//   id: "client_intake",
//   title: "Client intake",
//   description: "Creates a new client record.",
//   roles: ["admin", "manager"],            // omit = every role
//   fields: [
//     { name: "company", label: "Company name", type: "text", required: true },
//     { name: "email", label: "Email", type: "email", required: true },
//     { name: "service", label: "Service", type: "select", options: ["Bookkeeping", "Payroll", "VAT"] },
//     { name: "startDate", label: "Start date", type: "date" },
//   ],
//   submit: async (values, user) => clientService.create(values, user), // ← your existing code
// });
// Field types: text, textarea, email, phone, number, date, select, boolean.
const FORMS = new Map();

export const registerForm = (form) => FORMS.set(form.id, form);
export const getForm = (id) => FORMS.get(id);
export const canUseForm = (form, user) => !form.roles || form.roles.includes(user.role) || user.role === "admin";
export const formsFor = (user) => [...FORMS.values()].filter((f) => canUseForm(f, user));

export const publicForm = (f) => ({
  id: f.id,
  title: f.title,
  description: f.description,
  fields: f.fields.map(({ name, label, type, required, options, description }) => ({ name, label, type, required: !!required, options, description })),
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate + normalise values against the form. Returns { values, errors, missing }. */
export function validateValues(form, input = {}) {
  const values = {};
  const errors = {};
  for (const f of form.fields) {
    const raw = input[f.name];
    if (raw == null || String(raw).trim() === "") continue;
    const s = String(raw).trim();
    switch (f.type) {
      case "number": {
        const n = Number(s.replace(/,/g, ""));
        if (Number.isFinite(n)) values[f.name] = n; else errors[f.name] = "Must be a number";
        break;
      }
      case "date": {
        const d = new Date(s);
        if (isNaN(d)) errors[f.name] = "Use a valid date"; else values[f.name] = d.toISOString().slice(0, 10);
        break;
      }
      case "email":
        if (EMAIL.test(s)) values[f.name] = s; else errors[f.name] = "Not a valid email";
        break;
      case "boolean":
        values[f.name] = /^(true|yes|1|on)$/i.test(s);
        break;
      case "select": {
        const hit = (f.options || []).find((o) => o.toLowerCase() === s.toLowerCase());
        if (hit) values[f.name] = hit; else errors[f.name] = `Must be one of: ${(f.options || []).join(", ")}`;
        break;
      }
      default:
        if (f.maxLength && s.length > f.maxLength) errors[f.name] = `Too long (max ${f.maxLength} characters)`;
        else values[f.name] = s;
    }
  }
  const missing = form.fields.filter((f) => f.required && values[f.name] === undefined && !errors[f.name]).map((f) => f.name);
  return { values, errors, missing };
}