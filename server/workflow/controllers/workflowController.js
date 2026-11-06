import * as svc from "../services/workflowService.js";

const uid = (req) => req.user?._id || req.user?.id;

// Thin wrapper: controllers only unpack the request and call the service.
const handle = (fn) => async (req, res) => {
  try {
    res.json({ success: true, data: await fn(req) });
  } catch (err) {
    const status = err.status || (["ValidationError", "CastError"].includes(err.name) ? 400 : 500);
    if (status === 500) console.error("[workflow]", err);
    res.status(status).json({ success: false, message: status === 500 ? "Something went wrong" : err.message });
  }
};

// templates
export const listTemplates = handle((req) =>
  svc.listTemplates({ jobType: req.query.jobType, includeInactive: req.query.includeInactive === "true" })
);
export const getTemplate = handle((req) => svc.getTemplate(req.params.id));
export const createTemplate = handle((req) => svc.createTemplate(req.body, uid(req)));
export const updateTemplate = handle((req) => svc.updateTemplate(req.params.id, req.body, uid(req)));
export const deleteTemplate = handle((req) => svc.deleteTemplate(req.params.id));

// bulk + lists
export const applyTemplate = handle((req) => svc.applyTemplate(req.body, uid(req)));
export const bulkReassign = handle((req) => svc.bulkReassign(req.body, uid(req)));
export const getMySteps = handle((req) => svc.getMySteps(uid(req), { status: req.query.status }));

// per job
export const getJobWorkflow = handle((req) => svc.getJobWorkflow(req.params.clientId));
export const createManualWorkflow = handle((req) => svc.createManualWorkflow(req.params.clientId, uid(req)));
export const removeJobWorkflow = handle((req) => svc.removeJobWorkflow(req.params.clientId, uid(req)));
export const addStep = handle((req) => svc.addStep(req.params.clientId, req.body, uid(req)));
export const updateStep = handle((req) =>
  svc.updateStep(req.params.clientId, req.params.stepId, req.body, uid(req))
);
export const deleteStep = handle((req) => svc.deleteStep(req.params.clientId, req.params.stepId, uid(req)));
export const reorderSteps = handle((req) => svc.reorderSteps(req.params.clientId, req.body.orderedIds, uid(req)));
export const syncFromTemplate = handle((req) => svc.syncFromTemplate(req.params.clientId, uid(req)));