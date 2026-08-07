import axios from "axios";

/**
 * Same pattern as the existing affotax dashboard client: the CRM (CRA)
 * and the backend that owns these routes are separate origins, so this
 * points at the API explicitly instead of a relative "/api/..." path.
 *
 * Set REACT_APP_AFFOTAX_API_URL in the CRM's .env:
 *
 *   REACT_APP_AFFOTAX_API_URL=https://affotax.com
 *
 * All chart/stat routes in this dashboard are called with the
 * "/api/v1/chart/..." prefix, matching the router you shared
 * (router.get("/single/:chartKey", ...) etc. mounted under that base).
 * If your router is actually mounted at a different base path, that's
 * the one thing to change here.
 */
const dashboardApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: false, // flip to true only if these routes read an auth cookie/session
});

export default dashboardApi;