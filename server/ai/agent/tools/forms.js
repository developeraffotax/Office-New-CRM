// ai/agent/tools/forms.js — draft-only. Nothing here writes to your data or submits anything.
// Two kinds of form: CRM forms (agent/forms/registry.js) and PDF/Word files the person uploaded.
import mongoose from "mongoose";
import { formsFor, getForm, canUseForm, publicForm, validateValues } from "../forms/registry.js";
import { getOwnAttachment } from "../../attachments/attachments.service.js";
import { ToolError } from "../toolkit.js";

const KIND = { pdf_acro: "fillable PDF", pdf_flat: "PDF (blanks found by layout)", docx: "Word document" };

async function resolveForm(formId, user) {
  if (mongoose.isValidObjectId(formId)) {
    const doc = await getOwnAttachment(formId, user);
    if (doc?.formKind) return { mode: "file", form: { id: String(doc._id), title: doc.filename, kind: doc.formKind, fields: doc.fields } };
    if (doc) return { mode: "nofields", form: { id: String(doc._id), title: doc.filename } };
  }
  const crm = getForm(formId);
  if (crm && canUseForm(crm, user)) return { mode: "crm", form: crm };
  return null;
}

export const formTools = [
  {
    name: "get_form_schema",
    description:
      "Get the fields of a form: an attached PDF/Word form (use its id from <attached_forms>) or a CRM form. Call it with no formId to list what is available.",
    parameters: { type: "object", properties: { formId: { type: "string" } } },
    async execute({ formId }, ctx) {
      if (!formId) {
        return {
          attached: (ctx.attachments || []).filter((a) => a.fieldCount).map((a) => ({ id: a.id, name: a.filename, type: KIND[a.formKind], fields: a.fieldCount })),
          crmForms: formsFor(ctx.user).map(({ id, title, description }) => ({ id, title, description })),
        };
      }
      const hit = await resolveForm(formId, ctx.user);
      if (!hit) return { error: "Unknown form. Call get_form_schema with no formId to see what is available." };
      if (hit.mode === "nofields") {
        return { error: "I found no fillable fields in this file. For a spreadsheet use read_attachment, then fill_sheet_from_dataset or write_sheet_cells." };
      }
      if (hit.mode === "crm") return publicForm(hit.form);

      const { form } = hit;
      return {
        id: form.id,
        title: form.title,
        type: KIND[form.kind],
        fieldCount: form.fields.length,
        note: "Field names like f1 are internal. Decide from label and context. Tick boxes take true/false.",
        fields: form.fields.slice(0, 200).map(({ name, label, type, options, context, page, maxLength }) => ({ name, label, type, options, context, page, maxLength })),
      };
    },
  },
  {
    name: "propose_form_fill",
    description:
      "Show the person a pre-filled DRAFT of a form. Give every value you found and where it came from (for example 'Clients.xlsx row 12'). Leave out fields you couldn't find. This does not submit or save anything; for uploaded forms the person reviews the draft and downloads the filled file.",
    parameters: {
      type: "object",
      properties: {
        formId: { type: "string" },
        fields: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Field name from get_form_schema (for example f3)." },
              value: { type: "string", description: "The value, as text. Tick boxes: true or false." },
              source: { type: "string", description: "Where the value came from." },
            },
            required: ["name", "value"],
          },
        },
      },
      required: ["formId", "fields"],
    },
    async execute({ formId, fields }, ctx) {
      const hit = await resolveForm(formId, ctx.user);
      if (!hit || hit.mode === "nofields") throw new ToolError("Unknown form, or this file has no form fields.");
      const input = Object.fromEntries(fields.map((f) => [f.name, f.value]));
      const sources = Object.fromEntries(fields.filter((f) => f.source).map((f) => [f.name, f.source]));
      const { values, errors, missing } = validateValues(hit.form, input);

      const shown =
        hit.mode === "crm"
          ? { ...publicForm(hit.form), mode: "crm" }
          : { id: hit.form.id, title: hit.form.title, mode: "file", kind: hit.form.kind, fields: hit.form.fields };
      ctx.emit("draft", { form: shown, values, sources, errors, missing });

      return {
        status: "draft_shown_to_user",
        filled: Object.keys(values).length,
        of: hit.form.fields.length,
        missing,
        errors,
        note: "The person will review it" + (hit.mode === "file" ? " and download the filled file." : " and submit it.") + " Don't claim it was submitted or saved.",
      };
    },
  },
];
