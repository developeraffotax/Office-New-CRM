import axios from "axios";

// Uses the default axios instance, so whatever you've set on axios.defaults
// (baseURL, withCredentials, headers, interceptors) applies automatically.
// REACT_APP_API_URL is optional: leave it unset if axios.defaults.baseURL already has the host.
const BASE = `${process.env.REACT_APP_API_URL ?? ""}/api/v1/workflow`;

const data = (req) => req.then((r) => r.data.data);

export const errMsg = (e) => e?.response?.data?.message || e?.message || "Something went wrong";

export const workflowApi = {
  // templates
  listTemplates: (params) => data(axios.get(`${BASE}/templates`, { params })),
  createTemplate: (body) => data(axios.post(`${BASE}/templates`, body)),
  updateTemplate: (id, body) => data(axios.put(`${BASE}/templates/${id}`, body)),
  deleteTemplate: (id) => data(axios.delete(`${BASE}/templates/${id}`)),
  // bulk
  apply: (body) => data(axios.post(`${BASE}/apply`, body)),
  reassign: (body) => data(axios.post(`${BASE}/reassign`, body)),
  mySteps: (params) => data(axios.get(`${BASE}/my-steps`, { params })),
  // one job
  getJobWorkflow: (clientId) => data(axios.get(`${BASE}/job/${clientId}`)),
  createManualWorkflow: (clientId) => data(axios.post(`${BASE}/job/${clientId}/workflow`)),
  removeJobWorkflow: (clientId) => data(axios.delete(`${BASE}/job/${clientId}`)),
  addStep: (clientId, body) => data(axios.post(`${BASE}/job/${clientId}/steps`, body)),
  updateStep: (clientId, stepId, body) => data(axios.patch(`${BASE}/job/${clientId}/steps/${stepId}`, body)),
  deleteStep: (clientId, stepId) => data(axios.delete(`${BASE}/job/${clientId}/steps/${stepId}`)),
  reorder: (clientId, orderedIds) => data(axios.put(`${BASE}/job/${clientId}/reorder`, { orderedIds })),
  sync: (clientId) => data(axios.post(`${BASE}/job/${clientId}/sync`)),
};